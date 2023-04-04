const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/match-summary.html'));
});

router.post("/check-match", async (req, res) => {
    try {
        let match = await client.db(req.body.db).collection("matches").find({ _id: new ObjectId(req.body.id) }).toArray()
        if (match.length == 0)
            res.json({ exists: false });
        else if (match[0].result != undefined)
            res.json({ exists: true, end: true })
        else
            res.json({ exists: true, end: false });
    } catch (err) {
        res.json({ exists: false });
    }
})

router.post('/fetch-match-info', async (req, res) => {
    try {
        let match_info = await client.db(req.body.db).collection("matches").find({ _id: new ObjectId(req.body.id) }).toArray()
        if (match_info.length != 0) {
            let team1 = await client.db(req.body.db).collection("teams").find({ name: match_info[0].team1 }).toArray()
            let team2 = await client.db(req.body.db).collection("teams").find({ name: match_info[0].team2 }).toArray()
            let toss;
            if (team1.length != 0 && team2.length != 0) {
                if (match_info[0].toss == match_info[0].team1) {
                    toss = team1[0].abbr + " WON THE TOSS AND CHOSE TO ";
                    if (match_info[0].choice)
                        toss += "BAT";
                    else
                        toss += "BOWL";
                } else {
                    toss = team1[1].abbr + " WON THE TOSS AND CHOSE TO ";
                    if (match_info[0].choice)
                        toss += "BAT";
                    else
                        toss += "BOWL";
                }
            }
            let innings = await client.db(req.body.db).collection(match_info[0].title).find({}).toArray()
            let team = []
            if (innings.length != 0 && team1.length != 0 && team2.length != 0) {
                if (innings[0].bat == team1[0].name) {
                    team.push(team1[0]);
                    team.push(team2[0]);
                } else {
                    team.push(team2[0]);
                    team.push(team1[0]);
                }
                res.json({
                    match: match_info[0],
                    team: team,
                    innings: innings,
                    toss: toss
                });
            }
        }
    } catch (err) {
        res.send(err);
    }
})

router.post('/fetch-scorecard', async (req, res) => {
    let data = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }).toArray();
    let team = await client.db(req.body.db).collection("teams").find({ name: data[0].bat }, { projection: { _id: 0, color: 1, captain: 1, vice_captain: 1, keeper: 1, players: { name: 1 } } }).toArray()
    if (data.length != 0 && team.length != 0) {
        data[0].bat_team = team[0];
        res.json(data[0]);
    }
})

module.exports = router