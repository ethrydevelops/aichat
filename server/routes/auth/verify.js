const express = require('express');
const database = require('../../modules/database');
const authnmiddleware = require('../../modules/authentication_middleware');

const router = express.Router();

router.get('/accounts/me', authnmiddleware, async (req, res) => {
    const { uuid: accountId } = req.account;
    try {
        const account = await database('accounts')
            .where({ uuid: accountId })
            .select('uuid', 'username', 'last_used_model', 'created_at')
            .first();

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        return res.status(200).json(account);
    } catch (error) {
        console.error("Error fetching account:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;