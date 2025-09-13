const express = require('express');
const database = require('../../modules/database');
const authnmiddleware = require("../../modules/authentication_middleware");

const router = express.Router();

router.post("/accounts/logout", authnmiddleware, async (req, res) => {
    const { sid, session_token } = req.account;

    try {
        // logout user / delete session
        await database("sessions")
            .where({ sid, session_token })
            .del();

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;