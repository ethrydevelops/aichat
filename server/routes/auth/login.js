const express = require('express');
const database = require('../../modules/database');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/accounts/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing username, password" });
    }

    try {
        const account = await database('accounts')
            .select('*')
            .where({ username })
            .first();

        if (!account) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // success!! do session
        const sessionToken = crypto.randomBytes(36).toString('hex');
        const sid = crypto.randomBytes(24).toString('hex');

        await database('sessions').insert({
            sid,
            session_token: sessionToken,
            account_id: account.uuid
        });

        return res.status(200).json({
            message: "Login successful",
            session: {
                sid,
                token: sessionToken,

                string: `${sid}.${sessionToken}`,

                account: {
                    uuid: account.uuid,
                    username: account.username,
                    created_at: account.created_at
                }
            }
        });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;