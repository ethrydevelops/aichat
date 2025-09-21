const express = require("express");
const knex = require("../../modules/database");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/accounts/login", async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email address and password are required" });

    try {
        const user = await knex("users").where({ email }).first();
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const sessionToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");

        await knex("sessions").insert({
            uuid: crypto.randomUUID(), // session id
            user_uuid: user.uuid,
            token_hash: tokenHash
        });

        res.status(200).json({
            message: "Logged in!",
            session: {
                id: user.uuid,
                token: sessionToken
            },
            account: {
                uuid: user.uuid,
                username: user.username
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
module.exports = router;