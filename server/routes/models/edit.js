const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");

const router = express.Router();

router.get("/models/:id", authnmiddleware, async (req, res) => {
    const { uuid: accountId } = req.account;
    const modelId = req.params.id;

    try {
        const model = await knex("models")
            .where({ uuid: modelId, account_id: accountId })
            .select("uuid", "name", "model", "url", "authorization")
            .first();

        if (!model) {
            return res.status(404).json({ error: "Model not found" });
        }

        return res.status(200).json(model);
    } catch (error) {
        console.error("Error fetching model:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.patch("/models/:id", authnmiddleware, async (req, res) => {
    const { uuid: accountId } = req.account;
    const modelId = req.params.id;
    let { name, model, url, authorization } = req.body;

    const modelContentsBefore = await knex("models")
        .where({ uuid: modelId, account_id: accountId })
        .first();

    if(!modelContentsBefore) {
        return res.status(404).json({ error: "Model not found" });
    }

    if(!name) {
        name = modelContentsBefore.name;
    }

    if(!model) {
        model = modelContentsBefore.model;
    }

    if(!url) {
        url = modelContentsBefore.url;
    }

    if(!authorization) {
        authorization = modelContentsBefore.authorization;
    }

    try {
        await knex("models")
            .where({ uuid: modelId, account_id: accountId })
            .update({
                name,
                model,
                url,
                authorization: authorization || null
            });

        return res.status(200).json({ message: "Model updated successfully" });
    } catch (error) {
        console.error("Error updating model:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/models/:id", authnmiddleware, async (req, res) => {
    const { uuid: accountId } = req.account;
    const modelId = req.params.id;

    try {
        const deletedModel = await knex("models")
            .where({ uuid: modelId, account_id: accountId })
            .del();

        if (deletedModel === 0) {
            return res.status(404).json({ error: "Model not found or not owned by this account" });
        }

        return res.status(200).json({ message: "Model deleted successfully" });
    } catch (error) {
        console.error("Error deleting model:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;