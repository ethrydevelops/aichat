const express = require("express");
const knex = require("../../modules/database");
const crypto = require("crypto");
const console = require("../../modules/console");
const authn = require("../../modules/authn");

const router = express.Router();

router.delete("/conversations/:id", authn.protect, async (req, res) => {
    const conversationId = req.params.id;

    if (!conversationId) return res.status(400).json({ error: "Conversation ID is required" });

    try {
        const conversation = await knex("conversations").where({ uuid: conversationId, user_uuid: req.user.uuid }).first();
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        await knex("conversations").where({ uuid: conversationId, user_uuid: req.user.uuid }).delete();
        
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
