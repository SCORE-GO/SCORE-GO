const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.post("/sendFeedback", async (req, res) => {
    await client.db('global').collection('feedbacks').insertOne(req.body)
        .then(() => res.json({ submitted: true }))
        .catch(() => res.json({ submitted: false }))
});

module.exports = router;