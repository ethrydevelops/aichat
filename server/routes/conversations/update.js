const express = require("express");
const knex = require("../../modules/database");
const crypto = require("crypto");
const console = require("../../modules/console");
const authn = require("../../modules/authn");

const router = express.Router();

router.patch("/conversations/:id", authn.protect, async (req, res) => {
    const conversationId = req.params.id;
    
    const title = req.body?.title;

    // at least one field is provided
    if (!title) {
        return res.status(400).json({ error: "At least one field must be provided to update" });
    }
    
    try {
        // check if owner owns it
        const existingConversation = await knex("conversations")
            .where({ uuid: conversationId, user_uuid: req.user.uuid })
            .first();

        if (!existingConversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const updateData = {};
        var updatedFields = [];

        // updates:

        if (title) {
            if (title.length > 40) return res.status(400).json({ error: "Conversation title must be less than 40 characters" });
            
            updateData.title = title;
            updatedFields.push("title");
        }

        await knex("conversations").where({ uuid: conversationId, user_uuid: req.user.uuid }).update(updateData);

        res.json({ message: "Conversation updated successfully", updated: updatedFields });
    } catch (error) {
        console.error("Error updating chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;