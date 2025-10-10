const express = require('express');
const knex = require('../../../modules/database');
const authn = require('../../../modules/authn');
const console = require('../../../modules/console');

const router = express.Router();

router.get("/conversations/:id/messages", authn.protect, async (req, res) => {
    const conversationId = req.params.id;

    try {
        const conversation = await knex("conversations")
            .where({ uuid: conversationId, user_uuid: req.user.uuid })
            .first();

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const messages = await knex("messages")
            .where({ conversation_uuid: conversationId })
            .select("uuid", "content", "reasoning", "role", "model_uuid", "status", "error_message", "created_at")
            .orderBy("created_at", "asc");

        res.status(200).json({ messages: messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;