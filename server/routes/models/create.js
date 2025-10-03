const express = require("express");
const knex = require("../../modules/database");
const crypto = require("crypto");
const console = require("../../modules/console");
const authn = require("../../modules/authn");

const router = express.Router();

router.post("/models/", authn.protect, async (req, res) => {
    let { name, description, request } = req.body;

    if (!name || !request) return res.status(400).json({ error: "Model name and request data are required" });
    if (name.length > 40) return res.status(400).json({ error: "Model name must be less than 40 characters" });

    if (!request.url) return res.status(400).json({ error: "API request data required" });

    if(request.authorization && request.authorization.length > 2048) return res.status(400).json({ error: "Authorization token too long" });
    if(request.url.length > 254) return res.status(400).json({ error: "API URL too long" });
    if(request.model && request.model.length > 254) return res.status(400).json({ error: "API model identifier too long" });

    try {
        const modelId = crypto.randomUUID();

        let isEncrypted = false;
        let authorization = null;
        if(request.authorization) {
            authorization = request.authorization;
            
            if(process.env.ENCRYPTION_KEY) {
                const iv = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);

                let encrypted = cipher.update(request.authorization, "utf8", "hex");

                encrypted += cipher.final("hex");

                authorization = iv.toString("hex") + ":" + encrypted;
                isEncrypted = true;
            }
        }

        await knex("models").insert({
            uuid: modelId,
            owner_uuid: req.user.uuid,
            
            name,
            description: description || null,
            
            is_public: false,
            conn_private: false, // means connection info should be *visible* to user

            api_url: request.url,
            api_authorization: authorization,
            api_model: request.model || null,

            is_encrypted: isEncrypted
        });

        res.status(201).json({ message: "Model created successfully", id: modelId });
    } catch (error) {
        console.error("Error creating model:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;