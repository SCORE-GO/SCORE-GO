const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/teams-dash.html'));
});

router.post('/fetch_teams', async (req, res) => {
    res.json({
        teams: await client.db(req.body.db).collection('teams').find({}, { projection: { _id: 0, name: 1, color: 1, abbr: 1 } }).toArray()
    });
})

module.exports = router