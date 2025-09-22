const knex = require("./database");
const console = require("./console");
const crypto = require("crypto");

async function getModelByName(modelName) {
    try {
        const model = await knex("models").where({ name: modelName }).first();

        if(model && model.is_encrypted && model.api_authorization && process.env.ENCRYPTION_KEY) {
            const [ivHex, encryptedData] = model.api_authorization.split(":");
            const iv = Buffer.from(ivHex, "hex");
            const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);

            let decrypted = decipher.update(encryptedData, "hex", "utf8");
            decrypted += decipher.final("utf8");

            model.api_authorization = decrypted;
        }

        return model || null;
    } catch (error) {
        console.error("Error querying model by name:", error);
        throw error;
    }
}

async function decryptModel(model) {
    if(model && model.is_encrypted && model.api_authorization && process.env.ENCRYPTION_KEY) {
        const [ivHex, encryptedData] = model.api_authorization.split(":");

        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);

        let decrypted = decipher.update(encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");

        model.api_authorization = decrypted;
    }

    return model;
}

// if the model is private, remove sensitive fields
function sanitize(model) {
    if (!model) return null;

    model.sanitized = false;

    if(model.conn_private) {
        delete model.api_authorization;
        delete model.is_encrypted;
        delete model.api_model;
        delete model.api_url;

        model.sanitized = true;
    }

    return model;
}

module.exports = { getModelByName, sanitize, decryptModel };