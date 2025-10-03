const express = require("express");
const knex = require("../../modules/database");
const crypto = require("crypto");
const console = require("../../modules/console");
const authn = require("../../modules/authn");

const router = express.Router();

router.post("/conversations/", authn.protect, async (req, res) => {
    const title = req.body?.title || "New Chat";

    try {
        const conversationId = crypto.randomUUID();

        await knex("conversations").insert({
            uuid: conversationId,
            user_uuid: req.user.uuid,
            title: title
        });

        res.status(201)
            .location(`/conversations/${conversationId}`)
            .json({
                message: "Conversation created successfully",
                id: conversationId,
                conversation: {
                    uuid: conversationId,
                    title: title
                }
            });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;