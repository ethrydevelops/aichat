const express = require('express');
const knex = require('../../modules/database');
const authn = require('../../modules/authn');
const router = express.Router();

router.post('/accounts/logout', authn.protect, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        const token = authHeader.split(" ")[1];
        const tokenHash = require("crypto").createHash("sha256").update(token).digest("hex");

        await knex('sessions').where({ token_hash: tokenHash }).del();
        
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
