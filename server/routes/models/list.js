const express = require("express");
const knex = require("../../modules/database");
const authn = require("../../modules/authn");
const modelinfo = require("../../modules/modelinfo");

const router = express.Router();

router.get("/models/", authn.protect, async (req, res) => {
    try {
        const models = await knex("models")
            .where({ owner_uuid: req.user.uuid })
            .orWhere({ is_public: true })
            .select("*");

        var detailedModels = [];

        for (let model of models) {
            let sanitized = modelinfo.sanitize(model);

            if(sanitized.sanitized) {
                model.api_authorization = "********";
                model.is_encrypted = null;
                model.api_model = "****";
                model.api_url = "*******";
            }

            if(model.owner_uuid == null) {
                model.owner_uuid = "SYSTEM";
            }

            detailedModels.push(sanitized);
        }

        res.status(200).json({ models: detailedModels });
    } catch (error) {
        console.error("Error fetching models:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;