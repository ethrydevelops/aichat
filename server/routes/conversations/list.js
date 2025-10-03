const express = require("express");
const knex = require("../../modules/database");
const authn = require("../../modules/authn");
const console = require("../../modules/console");

const router = express.Router();

router.get("/conversations/", authn.protect, async (req, res) => {
    try {
        const conversations = await knex("conversations")
            .where({ user_uuid: req.user.uuid })
            .select("*")
            .orderBy("updated_at", "desc");

        res.status(200).json({ conversations: conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;