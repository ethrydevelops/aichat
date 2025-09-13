const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");
const crypto = require("crypto");
const router = express.Router();
const { getSocketInstance, emitToUser } = require('../../modules/socket_instance');

router.post("/conversations/:conversationId/messages/", authnmiddleware, async (req, res) => {
    const io = getSocketInstance();
    if(!io) {
        console.error("Socket.io instance not found");
        return res.status(500).json({ error: "IO / internal server error" });
    }

    const { uuid: accountId } = req.account;
    const { conversationId } = req.params;
    const { content, model } = req.body;

    if (!content) return res.status(400).json({ error: "Content is required" });
    if(!model) return res.status(400).json({ error: "You must include a valid model id" });

    try {
        const chatUuidExists = await knex("chats")
            .where({ uuid: conversationId, account_id: accountId })
            .first();

        if (!chatUuidExists) return res.status(404).json({ error: "Chat not found" });

        const validModel = await knex("models")
            .select("*")
            .where({ uuid: model, account_id: accountId })
            .first();
        
        if (!validModel) return res.status(404).json({ error: "Model not found" });

        await knex("accounts")
            .where({ uuid: accountId })
            .update({ last_used_model: validModel.uuid });

        const messageUuid = crypto.randomUUID();


        const previousMessages = await knex("messages")
            .select("content", "role")
            .where({ chat_uuid: conversationId })
            .orderBy("created_at", "asc");

        const messages = [
            ...previousMessages.map(msg => ({
                role: msg.role || "user",
                content: msg.content
            })),
            { role: "user", content }
        ];

        // insert message AFTER gathering messages to avoid duplicates or missing stuff

        await knex("messages").insert({
            uuid: messageUuid,
            chat_uuid: conversationId,
            content,
            role: 'user'
        });

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        res.write(`data: ${JSON.stringify({ type: 'connected', messageId: messageUuid })}\n\n`);

        let assistantResponse = '';
        let messageContent = '';
        const assistantMessageUuid = crypto.randomUUID();
        let lastDbUpdate = 0;
        let assistantMessageCreated = false;
        let isInReasoningMode = false;

        try {
            const response = await fetch(validModel.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(validModel.authorization && { "Authorization": validModel.authorization })
                },
                body: JSON.stringify({
                    model: validModel.model,
                    messages: messages,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`Model API responded with status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    
                    try {
                        let data;
                        let dataCompleted = false;
                        
                        if(line.trim() != ": OPENROUTER PROCESSING") {
                            if (line.startsWith('data: ')) {
                                if(line.trim() == "data: [DONE]") {
                                    dataCompleted = true;
                                } else {
                                    data = JSON.parse(line.slice(6));
                                }
                            } else {
                                data = JSON.parse(line);
                            }

                            if (!dataCompleted) {
                                let contentToAdd = '';
                                
                                if (data.choices?.[0]?.delta?.reasoning) {
                                    if (!isInReasoningMode) {
                                        contentToAdd += '<think>';
                                        isInReasoningMode = true;
                                    }
                                    contentToAdd += data.choices[0].delta.reasoning;
                                } else if (isInReasoningMode && data.choices?.[0]?.delta?.content) {
                                    // Reasoning has ended, close the think tag and continue with regular content
                                    contentToAdd += '</think>';
                                    isInReasoningMode = false;
                                    contentToAdd += data.choices[0].delta.content;
                                } else if (data.choices?.[0]?.delta?.content) {
                                    contentToAdd += data.choices[0].delta.content;
                                } else {
                                    // Fallback to original content extraction
                                    const content = data.message?.content || '';
                                    contentToAdd = content;
                                }
                                
                                if (contentToAdd) {
                                    messageContent += contentToAdd;
                                    assistantResponse = messageContent;
                                    
                                    res.write(`data: ${JSON.stringify({
                                        type: 'chunk',
                                        content: contentToAdd,
                                        messageId: messageUuid
                                    })}\n\n`);

                                    // update database+sockets at most once per second to avoid overwhelming db or clients
                                    const now = Date.now();
                                    if (now - lastDbUpdate >= 1000) {
                                        lastDbUpdate = now;
                                        
                                        try {
                                            if (!assistantMessageCreated) {
                                                // create the assistant message record
                                                await knex("messages").insert({
                                                    uuid: assistantMessageUuid,
                                                    chat_uuid: conversationId,
                                                    content: assistantResponse,
                                                    role: 'assistant',
                                                    completed: false,
                                                    model_uuid: validModel.uuid
                                                });
                                                assistantMessageCreated = true;

                                                emitToUser(accountId, 'message_created', {
                                                    uuid: assistantMessageUuid,
                                                    chat_uuid: conversationId,
                                                    content: assistantResponse,
                                                    role: 'assistant',
                                                    completed: false,
                                                    model_uuid: validModel.uuid
                                                });
                                            } else {
                                                // update existing assistant message
                                                await knex("messages")
                                                    .where({ uuid: assistantMessageUuid })
                                                    .update({ content: assistantResponse });

                                                emitToUser(accountId, 'message_updated', {
                                                    uuid: assistantMessageUuid,
                                                    chat_uuid: conversationId,
                                                    content: assistantResponse,
                                                    role: 'assistant',
                                                    completed: false,
                                                    model_uuid: validModel.uuid
                                                });
                                            }
                                        } catch (dbError) {
                                            console.error('Error updating database during streaming:', dbError);
                                        }
                                    }
                                }
                            }   
                        }

                        if ((data && (data.done || data.finish_reason)) || dataCompleted) {
                            // finish stream
                            break;
                        }
                    } catch (parseError) {
                        console.error('Error parsing streaming chunk:', parseError);
                    }
                }
            }

            // Close reasoning tag if still open at the end
            if (isInReasoningMode) {
                messageContent += '</think>';
                assistantResponse = messageContent;
            }

            // final db update to ensure we have the complete response
            try {
                if (!assistantMessageCreated) {
                    await knex("messages").insert({
                        completed: true,
                        uuid: assistantMessageUuid,
                        chat_uuid: conversationId,
                        content: assistantResponse,
                        role: 'assistant',
                        model_uuid: validModel.uuid
                    });

                    emitToUser(accountId, 'message_created', {
                        uuid: assistantMessageUuid,
                        chat_uuid: conversationId,
                        content: assistantResponse,
                        role: 'assistant',
                        completed: true,
                        model_uuid: validModel.uuid
                    });
                } else {
                    await knex("messages")
                        .where({ uuid: assistantMessageUuid })
                        .update({ content: assistantResponse, completed: true });

                    emitToUser(accountId, 'message_updated', {
                        uuid: assistantMessageUuid,
                        chat_uuid: conversationId,
                        content: assistantResponse,
                        role: 'assistant',
                        completed: true,
                        model_uuid: validModel.uuid
                    });
                }

                emitToUser(accountId, 'message_completed', {
                    uuid: assistantMessageUuid
                });
            } catch (dbError) {
                console.error('Error with final database update:', dbError);
            }

            res.write(`data: ${JSON.stringify({
                type: 'complete',
                messageId: messageUuid,
                assistantMessageId: assistantMessageUuid
            })}\n\n`);

        } catch (fetchError) {
            console.error("Error fetching from model API:", fetchError);

            try {
                // create errir message
                
                await knex("messages").insert({
                    completed: true,
                    uuid: assistantMessageUuid,
                    chat_uuid: conversationId,
                    content: fetchError.message,
                    role: 'error',
                    model_uuid: validModel.uuid
                });

                emitToUser(accountId, 'message_created', {
                    uuid: assistantMessageUuid,
                    chat_uuid: conversationId,
                    content: fetchError.message,
                    role: 'error',
                    completed: true,
                    model_uuid: validModel.uuid
                });

                emitToUser(accountId, "message_error", {
                    type: "error",
                    chat: conversationId,
                    data: fetchError.message
                });
            } catch (err2) {
                console.error("Socket error: ", err2);
            }
            
            res.write(`data: ${JSON.stringify({
                type: 'error',
                error: 'Failed to get response from AI model',
                messageId: messageUuid
            })}\n\n`);
        }

        res.end();

    } catch (error) {
        console.error("Error creating message:", error);
        
        if (!res.headersSent) {
            return res.status(500).json({ error: "Internal server error" });
        } else {
            res.write(`data: ${JSON.stringify({
                type: 'error',
                error: 'Internal server error'
            })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;