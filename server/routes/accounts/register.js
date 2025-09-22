const express = require("express");
const knex = require("../../modules/database");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const console = require("../../modules/console");

const router = express.Router();

router.post("/accounts/create", async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email address and password are required" });
    if(password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters long" });
    if(email.length > 254) return res.status(400).json({ error: "Invalid email address" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid email address" });

    try {
        const uuid = crypto.randomUUID();
        const username = email.split("@")[0];

        const existingUser = await knex("users").where({ email }).first();
        if (existingUser) {
            return res.status(409).json({ error: "Email address is already registered" });
        }

        let passwordHash = await bcrypt.hash(password, 12);
        
        await knex("users").insert({
            uuid,
            username,
            email,
            password: passwordHash
        });

        res.status(201).json({ message: "Account created successfully", uuid: uuid });
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
module.exports = router;