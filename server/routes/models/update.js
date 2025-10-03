const express = require("express");
const knex = require("../../modules/database");
const crypto = require("crypto");
const console = require("../../modules/console");
const authn = require("../../modules/authn");

const router = express.Router();

router.patch("/models/:id", authn.protect, async (req, res) => {
    const modelId = req.params.id;
    const { name, description, request } = req.body;

    // at least one field is provided
    if (!name && !description && !request) {
        return res.status(400).json({ error: "At least one field must be provided to update" });
    }

    try {
        // check if owner owns it
        const existingModel = await knex("models")
            .where({ uuid: modelId, owner_uuid: req.user.uuid })
            .first();

        if (!existingModel) {
            return res.status(404).json({ error: "Model not found" });
        }

        const updateData = {};
        const updatedFields = [];

        // updates:

        if (name) {
            if (name.length > 40) return res.status(400).json({ error: "Model name must be less than 40 characters" });
            updateData.name = name;
            updatedFields.push("name");
        }

        if (description !== undefined) {
            updateData.description = description;
            updatedFields.push("description");
        }

        if (request) {
            if (!request.url) return res.status(400).json({ error: "API request URL required" });
            if(request.authorization && request.authorization.length > 2048) return res.status(400).json({ error: "Authorization token too long" });
            if(request.url.length > 254) return res.status(400).json({ error: "API URL too long" });
            if(request.model && request.model.length > 254) return res.status(400).json({ error: "API model identifier too long" });

            if (request.url) {
                updateData.api_url = request.url;
                updatedFields.push("api_url");
            }

            if (request.authorization) {
                let authorization = request.authorization;
                let isEncrypted = false;

                if(process.env.ENCRYPTION_KEY) {
                    const iv = crypto.randomBytes(16);
                    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
                    let encrypted = cipher.update(request.authorization, "utf8", "hex");
                    encrypted += cipher.final("hex");
                    authorization = iv.toString("hex") + ":" + encrypted;
                    isEncrypted = true;
                }

                updateData.api_authorization = authorization;
                updateData.is_encrypted = isEncrypted;
                updatedFields.push("api_authorization", "is_encrypted");
            }

            if (request.model) {
                updateData.api_model = request.model;
                updatedFields.push("api_model");
            }
        }

        updateData.updated_at = knex.fn.now();

        await knex("models").where({ uuid: modelId, owner_uuid: req.user.uuid }).update(updateData);
        
        let updatedFieldsFrontend = updatedFields.filter(f => f !== "is_encrypted");

        updatedFieldsFrontend = updatedFieldsFrontend.map(f => {
            if(f === "api_url") return "request.url";
            if(f === "api_authorization") return "request.authorization";
            if(f === "api_model") return "request.model";
            
            return f;
        });

        res.json({ message: "Model updated successfully", updated: updatedFieldsFrontend });
    } catch (error) {
        console.error("Error updating model:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;