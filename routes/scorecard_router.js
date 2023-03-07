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

router.post('/fetch-match-info', async (req, res) => {
    let match_info = await client.db(req.body.db).collection("matches").find({ _id: new ObjectId(req.body.id) }).toArray()
    let team_details = await client.db(req.body.db).collection("teams").find({ name: { $in: [match_info[0].team1, match_info[0].team2] } }).toArray()
    let innings = await client.db(req.body.db).collection(match_info[0].title).find({}, { projection: { _id: 0, wickets: 1, overs: 1, bat: 1, bowl: 1, inning: 1 } }).toArray()

    let response = {
        match_info: match_info[0],
        team: team_details,
        inning_data: innings[0]
    };
    if (innings[0].wickets == 10 || innings[0].overs == match_info[0].overs) {
        inning_data = innings[1];
    }
    res.json(response);
})

router.post('/fetch-inning-details', async (req, res) => {
    let data = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }).toArray();
    let team = await client.db(req.body.db).collection("teams").find({ name: data[0].bat }, { projection: { _id: 0, captain: 1, vice_captain: 1, keeper: 1, players: { name: 1 } } }).toArray()
    data[0].bat_team = team[0];
    res.json(data[0])
})

router.post('/fetch-inning1-data', async (req, res) => {
    let data = await client.db(req.body.db).collection(req.body.title).find({ inning: 1 }).toArray();
    let team = await client.db(req.body.db).collection("teams").find({ name: data[0].bat }, { projection: { _id: 0, captain: 1, vice_captain: 1, keeper: 1, players: { name: 1 } } }).toArray()
    data[0].bat_team = team[0];
    res.json(data[0]);
})

router.post('/add-runs', async (req, res) => {
    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning
        },
        {
            $inc: {
                "runs": req.body.runs,
                "timeline.$.": {}
            },
            $set: {
                overs: req.body.overs
            }
        },
        {
            upsert: false
        })
})

module.exports = router