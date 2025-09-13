const express = require("express");
const knex = require("../../modules/database");
const authnmiddleware = require("../../modules/authentication_middleware");

const router = express.Router();

router.post("/models/title", authnmiddleware, async (req, res) => {
    // TODO: maybe make it more RESTful by using DELETE for removing the title model and PUT for updates?

    const { uuid: accountId } = req.account;
    const { modelUuid } = req.body;

    if (!modelUuid && modelUuid != null) {
        return res.status(400).json({ error: "Model UUID is required" });
    }

    try {
        let model = {};
        if(modelUuid != null) {
            model = await knex("models")
                .where({ uuid: modelUuid, account_id: accountId })
                .first();

            if (!model) {
                return res.status(404).json({ error: "Model not found" });
            }
        }

        await knex("accounts")
            .where({ uuid: accountId })
            .update({ title_model: modelUuid });

        return res.status(200).json({
            message: "Title model set successfully",
            model: {
                uuid: model.uuid,
                name: model.name,
                model: model.model
            }
        });
    } catch (error) {
        console.error("Error setting title model:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;