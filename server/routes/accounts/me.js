const express = require("express");
const knex = require("../../modules/database");
const authn = require("../../modules/authn");
const console = require("../../modules/console");

const router = express.Router();

router.get("/me", authn.protect, async (req, res) => {
    try {
        const user = await knex("users").where({ uuid: req.user.uuid }).first();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user: {
                uuid: user.uuid,
                email: user.email,
                username: user.username,
                created_at: Math.floor((new Date(user.created_at).getTime()) / 1000)
            }
        });
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;