const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");

const router = express.Router();

router.delete("/conversations/:uuid", authnmiddleware, async (req, res) => {
    const { uuid: conversationUuid } = req.params;
    const { uuid: accountId } = req.account;

    try {
        const conversation = await knex("chats")
            .where({ uuid: conversationUuid, account_id: accountId })
            .first();

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        await knex("messages").where({ chat_uuid: conversationUuid }).del();
        await knex("chats").where({ uuid: conversationUuid }).del();

        return res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
module.exports = router;