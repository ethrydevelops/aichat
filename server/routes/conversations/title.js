const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");
const { getSocketInstance, emitToUser } = require('../../modules/socket_instance');

const router = express.Router();

router.post("/conversations/:uuid/generate-title", authnmiddleware, async (req, res) => {
    const io = getSocketInstance();
    if(!io) {
        console.error("Socket.io instance not found");
        return res.status(500).json({ error: "IO / internal server error" });
    }

    const { uuid: conversationUuid } = req.params;

    try {
        // check if user has access to conversation first
        const conversation = await knex("chats")
            .where({ uuid: conversationUuid, account_id: req.account.uuid })
            .first();

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const userModelForTitle = await knex("accounts")
            .where({ uuid: req.account.uuid })
            .select("title_model")
            .first();

        if(!userModelForTitle || userModelForTitle == null) {
            // soft fail
            return res.status(200).json({ error: "No model set for generating titles", title: "Untitled Chat" });
        }

        const model = await knex("models")
            .where({ uuid: userModelForTitle.title_model, account_id: req.account.uuid })
            .first();

        if (!model) {
            return res.status(404).json({ error: "Model not found. Have you configured it in Settings?" });
        }

        let convomessage = await knex("messages")
            .where({ chat_uuid: conversationUuid })
            .select("content", "role")
            .orderBy("created_at", "asc")
            .first();

        if (!convomessage) {
            // soft fail
            return res.status(200).json({ error: "No messages found in conversation", title: "Conversation" });
        }

        const modelName = model.model;

        const response = await fetch(model.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': model.authorization || ''
            },
            body: JSON.stringify({
                model: modelName.trim(),
                messages: [
                    {
                        role: "user",
                        content: `Generate a short, concise title (max 6 words) for this conversation. The title should capture the main topic or task that the conversation is about. Don't use quotes or punctuation. Don't assume anything that isn't obvious from the conversation. Examples:
- "Travel planning for Queenstown"
- "Math homework assistance"
- "Friendly greeting"

Message:
${convomessage.content.trim()}

Title:`
                    }
                ],
                stream: false
            })
        })
        .then(resp => resp.json());

        if(!response) {
            return res.status(500).json({ error: "Failed to generate title" });
        }

        if(response.error) {
            return res.status(500).json({error: "Failed to generate title: " + response.error});
        }

        cleanResp = response.message?.content?.toString().replaceAll("\"", "").replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        // set chat title in db
        await knex("chats")
            .where({ uuid: conversationUuid, account_id: req.account.uuid })
            .update({ title: cleanResp || "Untitled Chat" })
            .catch(err => {
                console.error("Error updating conversation title:", err);
            });
        
        // send socket event to update conversation title in real-time
        emitToUser(req.account.uuid, "nav_chats_updated", conversationUuid);

        res.status(200).json({
            message: "Title generated successfully",
            title: cleanResp || "Untitled Chat"
        });
    } catch (error) {
        console.error("Error updating conversation title:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
module.exports = router;