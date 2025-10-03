const knex = require("./database");
const console = require("./console");
const crypto = require("crypto");

async function middleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    try {
        const session = await knex("sessions").where({ token_hash: tokenHash }).first();
        if (!session) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const user = await knex("users").where({ uuid: session.user_uuid }).first();

        req.user = {
            uuid: user.uuid,
            username: user.username,
            email: user.email
        };

        next();
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { protect: middleware };