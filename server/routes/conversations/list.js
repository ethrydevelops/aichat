const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");

const router = express.Router();

router.get("/conversations/", authnmiddleware, async (req, res) => {
    const { uuid: accountId } = req.account;

    try {
        let conversations = await knex("chats")
            .where({ account_id: accountId })
            .select("*");

        // sort conversations by last updated message
        const messages = await knex("messages")
            .whereIn("chat_uuid", conversations.map(c => c.uuid))
            .select("chat_uuid", "created_at")
            .orderBy("created_at", "desc");

        // map last message to each conversation
        const conversationMap = new Map();

        messages.forEach(message => {
            if (!conversationMap.has(message.chat_uuid)) {
                conversationMap.set(message.chat_uuid, message.updated_at || message.created_at);
            }
        });

        // add last message timestamp to each conversation
        conversations.forEach(conversation => {
            conversation.last_message_at = conversationMap.get(conversation.uuid) || null;
        });

        // sort conversations by last message timestamp
        conversations.sort((a, b) => {
            return (b.last_message_at || 0) - (a.last_message_at || 0);
        });

        return res.status(200).json({
            count: conversations.length,
            conversations
        });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;