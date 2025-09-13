const express = require('express');
const jdenticon = require("jdenticon");

const router = express.Router();

router.get('/accounts/:uuid/avatar.png', async (req, res) => {
    const { uuid: accountId } = req.params;

    // TODO: pfp uploading?
    

    // get identicon:
    try {
        const png = jdenticon.toPng(accountId, 512);
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

        res.send(png);
    } catch (error) {
        console.error("Error generating avatar:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;