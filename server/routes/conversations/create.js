const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");
const crypto = require("crypto");

const router = express.Router();

router.post("/conversations/", authnmiddleware, async (req, res) => {
    const { uuid: accountId } = req.account;

    try {
        const conversationUuid = crypto.randomUUID(); 

        await knex("chats").insert({
            uuid: conversationUuid,
            title: "New Chat",
            account_id: accountId
        });

        return res.status(201).json({
            message: "Conversation created successfully",
            uuid: conversationUuid
        });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;