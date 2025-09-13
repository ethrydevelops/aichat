const knex = require("./database");

async function authmw(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const [sid, sessionToken] = token.split(".");

    if (!sid || !sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const session = await knex("sessions")
            .where({ sid, session_token: sessionToken })
            .first();

        if (!session) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.account = {
            uuid: session.account_id,
            sid: session.sid,
            session_token: session.session_token
        };

        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = authmw;