const express = require('express');
const bcrypt = require('bcrypt');
const database = require('../../modules/database');
const crypto = require('crypto');

const router = express.Router();

router.post('/accounts/create', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing username, password" });
    }

    const uuid = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        const existingAccount = await database('accounts')
            .where({ username })
            .first();

        if (existingAccount) return res.status(409).json({ error: "An account with this username already exists" });

        // create account
        await database('accounts').insert({
            uuid,
            username,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Account created successfully",
            account: {
                uuid,
                username
            }
        });
    } catch (error) {
        console.error("Error creating account:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;