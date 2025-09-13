const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");
const crypto = require("crypto");

const router = express.Router();

router.post("/models/", authnmiddleware, async (req, res) => {
    const { uuid: accountId } = req.account;
    const { name, model, url, authorization } = req.body;

    if (!name || !url || !model) {
        return res.status(400).json({ error: "name, model and API url are required" });
    }

    try {
        const modelUuid = crypto.randomUUID();

        await knex("models").insert({
            uuid: modelUuid,
            name,
            url: url,
            model: model,
            authorization: authorization || null, // optional authorization token (if API requires such)
            account_id: accountId
        });

        return res.status(201).json({
            message: "Model created successfully",
            uuid: modelUuid
        });
    } catch (error) {
        console.error("Error creating model:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
module.exports = router;