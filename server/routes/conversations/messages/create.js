const express = require("express");
const knex = require("../../../modules/database");
const crypto = require("crypto");
const console = require("../../../modules/console");
const authn = require("../../../modules/authn");
const modelinfo = require("../../../modules/modelinfo");
const socket = require("../../../modules/socket");

const router = express.Router();

router.post("/conversations/:id/messages", authn.protect, async (req, res) => {
    const conversationId = req.params.id;
    const { content, model_uuid } = req.body;

    if (!content || !model_uuid) {
        return res.status(400).json({ error: "Content and model_uuid are required" });
    }

    try {
        const modelDb = await knex("models").where({ uuid: model_uuid, owner_uuid: req.user.uuid }).first();
        if (!modelDb) return res.status(404).json({ error: "Model not found" });

        const model = await modelinfo.decryptModel(modelDb);
        if (!model) return res.status(500).json({ error: "Error getting model" });

        const conversation = await knex("conversations").where({ uuid: conversationId, user_uuid: req.user.uuid }).first();
        if (!conversation) return res.status(404).json({ error: "Conversation not found" });

        // fetch message history for request

        const messageHistory = await knex("messages")
            .where({ conversation_uuid: conversationId })
            .select("role", "content")
            .orderBy("created_at", "asc");
        messageHistory.push({ role: "user", content: content });

        const messageId = crypto.randomUUID();
        await knex("messages").insert({
            uuid: messageId,
            conversation_uuid: conversationId,
            content: content,
            role: "user",
            model_uuid: model_uuid,
            status: "sent"
        });

        socket.io.to(`conv_${conversationId}`).emit("chat_message", {
            conversation: conversationId,
            message: {
                uuid: messageId,
                content: content,
                reasoning: ""
            },
            role: "user",
            status: "sent"
        });

        // update conversation updated_at
        await knex("conversations")
            .where({ uuid: conversationId })
            .update({ updated_at: knex.fn.now() });
        
        
        res.status(204).send(); // respond early since it will be streamed via ws

        // create response
        const llmResponseUuid = crypto.randomUUID();
        var llmResponseContent = { content: "", reasoning: "" };
        var lastLlmResponse = 0;
        var isThinking = false;
        
        await knex("messages").insert({
            uuid: llmResponseUuid,
            conversation_uuid: conversationId,
            content: "",
            reasoning: "",
            role: "assistant",
            model_uuid: model_uuid,
            status: "generating"
        });

        socket.io.to(`conv_${conversationId}`).emit("chat_message", {
            conversation: conversationId,
            message: {
                id: llmResponseUuid,
                content: "",
                reasoning: ""
            },
            role: "assistant",
            status: "generating"
        });

        // call the api in the background ...

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2*60*1000);

        try {
            const headersArray = {};
            const bodyArray = {};
            
            if (model.api_authorization) headersArray["Authorization"] = model.api_authorization;
            if (model.api_model) bodyArray["model"] = model.api_model;

            const response = await fetch(model.api_url + "/chat/completions", {
                method: "POST",
                body: JSON.stringify({
                    ...bodyArray,
                    messages: messageHistory,
                    stream: true
                }),
                headers: {
                    "Content-Type": "application/json",
                    ...headersArray
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                let buffer = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    const lines = buffer.split("\n");
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith("data:")) continue;

                        const data = line.replace("data:", "").trim();

                        if (data === "[DONE]") {
                            await knex("messages")
                                .where({ uuid: llmResponseUuid })
                                .update({
                                    content: llmResponseContent.content || "",
                                    reasoning: llmResponseContent.reasoning || "",
                                    status: "generated"
                                });

                            // send final generated message to client
                            socket.io.to(`conv_${conversationId}`).emit("chat_message_update", {
                                conversation: conversationId,
                                message: {
                                    id: llmResponseUuid,
                                    delta: "",
                                    reasoning: llmResponseContent.reasoning || "",
                                    content: llmResponseContent.content || "",
                                    type: isThinking ? "reasoning" : "content",
                                },
                                role: "assistant",
                                status: "generated"
                            });

                            break;
                        }

                        try {
                            const json = JSON.parse(data);
                            const delta = json.choices[0]?.delta?.reasoning || json.choices[0]?.delta?.content || "";

                            isThinking = json.choices[0]?.delta?.reasoning ? true : false;

                            if (delta) {
                                let output = delta;

                                if(isThinking) {
                                    llmResponseContent.reasoning += output;
                                }

                                llmResponseContent.content += json.choices[0]?.delta?.content || "";

                                const now = Date.now();
                                if (now - lastLlmResponse > 1000) { // 1s rate limit
                                    lastLlmResponse = now;

                                    await knex("messages")
                                        .where({ uuid: llmResponseUuid })
                                        .update({
                                            content: llmResponseContent.content,
                                            reasoning: llmResponseContent.reasoning || "",
                                            updated_at: knex.fn.now()
                                        });
                                }

                                socket.io.to(`conv_${conversationId}`).emit("chat_message_update", {
                                    conversation: conversationId,
                                    message: {
                                        id: llmResponseUuid,
                                        delta: !isThinking ? output : "",
                                        reasoning: llmResponseContent.reasoning || "",
                                        type: json.choices[0]?.delta?.reasoning ? "reasoning" : "content",
                                    },
                                    role: "assistant",
                                    status: "generating"
                                });
                            }
                        } catch (err) {
                            console.error("Error parsing stream chunk", err);
                        }
                    }
                }
            } else {
                // TODO: fallback (no streaming)
                const text = await response.text();
                console.log(text);
            }
            
        } catch (error) {
            if (error.name === "AbortError") {
                console.error("Request timed out");
                // TODO: show error message in chat
            } else {
                console.error("Error piping from model API", error);
            }
        }        
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;