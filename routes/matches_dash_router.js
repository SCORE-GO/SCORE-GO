const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/matches-dash.html'));
});

router.post('/fetch_matches', async (req, res) => {
    res.json({
        teams: await client.db(req.body.db).collection('teams').countDocuments(),
        matches: await client.db(req.body.db).collection('matches').countDocuments()
    });
})

module.exports = router