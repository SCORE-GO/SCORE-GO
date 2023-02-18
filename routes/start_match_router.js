const e = require('express');
const express = require('express');
const path = require("path");
const client = require('../dbconnect');
// const nodemailer = require('nodemailer');
const router = express.Router();
router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/start-match.html'));
});

router.post('/fetch-details', async (req, res) => {
    let match_info = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 0, team1: 1, team2: 1 } }).toArray()
    let team_details = await client.db(req.body.db).collection("teams").find({ name: { $in: [match_info[0].team1, match_info[0].team2] } }, { projection: { _id: 0, name: 1, color: 1, players: { name: 1, bowl: 1 } } }).toArray()
    console.log(team_details[0])
    console.log(team_details[1])

    res.json({ team: team_details });
})



module.exports = router