const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/start-match.html'));
});

router.post("/check-match", async (req, res) => {
    try {
        let match = await client.db(req.body.db).collection("matches").find({ _id: new ObjectId(req.body.id) }).toArray()
        if (match.length == 0)
            res.json({ exists: false })
        else if (match[0].result == undefined)
            res.json({ exists: true })
        else
            res.json({ exists: false })
    } catch (err) {
        res.json({ exists: false })
    }
})

router.post('/fetch-details', async (req, res) => {
    let match_info = await client.db(req.body.db).collection("matches").find({ _id: new ObjectId(req.body.id) }, { projection: { _id: 0, title: 1, toss: 1, choice: 1, team1: 1, team2: 1 } }).toArray()
    let team_details = await client.db(req.body.db).collection("teams").find({ name: { $in: [match_info[0].team1, match_info[0].team2] } }, { projection: { _id: 0, name: 1, color: 1, players: { name: 1, bowl: 1 } } }).toArray()
    res.json({
        title: match_info[0].title,
        team: team_details
    });
})

module.exports = router