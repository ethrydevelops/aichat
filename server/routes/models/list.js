const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");

const router = express.Router();

router.get("/models/", authnmiddleware, async (req, res) => {
    const { uuid: accountId } = req.account;

    try {
        const models = await knex("models")
            .where({ account_id: accountId })
            .select("uuid", "name", "model", "url", "authorization");

        // get last used and title model
        const userLastUsedModel = await knex("accounts")
            .where({ uuid: accountId })
            .select("last_used_model", "title_model")
            .first();

        let lastUsedModel = null;
        if (userLastUsedModel) {
            lastUsedModel = models.find(model => model.uuid === userLastUsedModel.last_used_model);
        }

        let titleModel = null;
        if (userLastUsedModel) {
            titleModel = models.find(model => model.uuid === userLastUsedModel.title_model);
        }

        // get amount of messages sent by each model
        const messages = await knex("messages")
            .select("model_uuid")
            .whereIn("model_uuid", models.map(model => model.uuid))
            .count("uuid as count")
            .groupBy("model_uuid");

        models.forEach(model => {
            const usage = messages.find(msg => msg.model_uuid === model.uuid);
            model.usage_count = usage ? usage.count : 0;
        });

        return res.status(200).json({
            count: models.length,
            last_used_model: lastUsedModel ? lastUsedModel : null,
            titles: titleModel ? titleModel : null,
            models
        });
    } catch (error) {
        console.error("Error fetching models:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;