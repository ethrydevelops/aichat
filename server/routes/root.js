const express = require('express');
const router = express.Router();

router.all('/', (req, res) => {
    res.json({ status: "ok" });
});

module.exports = router;