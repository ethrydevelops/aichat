const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");

const router = express.Router();

router.delete("/models/:uuid", authnmiddleware, async (req, res) => {
    const { uuid: modelUuid } = req.params;
    const { uuid: accountId } = req.account;

    try {
        const model = await knex("models")
            .where({ uuid: modelUuid, account_id: accountId })
            .first();

        if (!model) {
            return res.status(404).json({ error: "Model not found" });
        }

        await knex("models").where({ uuid: modelUuid }).del();

        return res.status(200).json({ message: "Model deleted successfully" });
    } catch (error) {
        console.error("Error deleting model:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;