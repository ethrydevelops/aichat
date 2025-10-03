const express = require("express");
const knex = require("../../modules/database");
const authn = require("../../modules/authn");
const console = require("../../modules/console");

const router = express.Router();

router.delete("/models/:id", authn.protect, async (req, res) => {
    const modelId = req.params.id;

    if (!modelId) return res.status(400).json({ error: "Model ID is required" });

    try {
        const model = await knex("models").where({ uuid: modelId, owner_uuid: req.user.uuid }).first();
        if (!model) {
            return res.status(404).json({ error: "Model not found" });
        }

        await knex("models").where({ uuid: modelId, owner_uuid: req.user.uuid }).del();

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting model:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;