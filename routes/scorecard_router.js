const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/scorecard.html'));
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
    let match_info = await client.db(req.body.db).collection("matches").find({ _id: new ObjectId(req.body.id) }).toArray()
    let team_details = await client.db(req.body.db).collection("teams").find({ name: { $in: [match_info[0].team1, match_info[0].team2] } }).toArray()
    let innings = await client.db(req.body.db).collection(match_info[0].title).find({}).toArray()

    let response = {
        match_info: match_info[0],
        team: team_details,
        inning: 1,
        bat: innings[0].bat,
        bowl: innings[0].bowl,
        start: false
    };
    if (innings[0].batting.length == 0)
        response.start = false;
    if (innings[0].batting.length < 10)
        response.start = true;
    if (innings[0].wickets == 10 || innings[0].overs == match_info[0].overs) {
        response.inning = 2;
        response.bat = innings[1].bat;
        response.bowl = innings[1].bowl;
        if (innings[1].batting.length == 0)
            response.start = false;
        else
            response.start = true;
    }
    res.json(response);
})

module.exports = router