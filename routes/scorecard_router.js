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
            res.json({ exists: false });
        else if (match[0].result == undefined) {
            let inning_data = await client.db(req.body.db).collection(match[0].title).find({}).toArray();
            inning_data = inning_data[0].wickets == 10 || inning_data[0].overs == match[0].overs ? inning_data[1] : inning_data[0];
            res.json({
                exists: true,
                started: inning_data.batting.length == 0 || inning_data.bowling.length == 0 ? false : true
            });
        } else
            res.json({ exists: false });
    } catch (err) {
        res.json({ exists: false });
    }
})

router.post('/fetch-match-info', async (req, res) => {
    let match_info = await client.db(req.body.db).collection("matches").find({ _id: new ObjectId(req.body.id) }).toArray()
    let team_details = await client.db(req.body.db).collection("teams").find({ name: { $in: [match_info[0].team1, match_info[0].team2] } }).toArray()
    let innings = await client.db(req.body.db).collection(match_info[0].title).find({}).toArray()
    let response = {
        match_info: match_info[0],
        team: team_details,
        inning_data: innings[0]
    };
    if (innings[0].wickets == 10 || innings[0].overs == match_info[0].overs) {
        response.inning_data = innings[1];
    }
    res.json(response);
})

router.post('/fetch-scorecard', async (req, res) => {
    let data = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }).toArray();
    let team = await client.db(req.body.db).collection("teams").find({ name: data[0].bat }, { projection: { _id: 0, color: 1, captain: 1, vice_captain: 1, keeper: 1, players: { name: 1 } } }).toArray()
    data[0].bat_team = team[0];
    res.json(data[0]);
})

router.post('/add-runs', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();
    
    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning
        },
        {
            $inc: {
                "runs": req.body.runs,
                ["timeline." + (arr[0].timeline.length - 1) + ".runs"]: req.body.runs,
            },
            $push: {
                ["timeline." + (arr[0].timeline.length - 1) + ".balls"]: req.body.runs.toString()
            },
            $set: {
                "overs": parseFloat(req.body.overs.toFixed(1))
            }
        })

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "batting.strike": true
        },
        {
            $inc: {
                "batting.$.runs": req.body.runs,
                "batting.$.balls": 1,
                "batting.$.fours": req.body.runs == 4 ? 1 : 0,
                "batting.$.sixes": req.body.runs == 6 ? 1 : 0
            }
        })

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "bowling.name": req.body.bowler
        },
        {
            $inc: {
                "bowling.$.runs": req.body.runs,
                "bowling.$.overs": parseFloat((req.body.overs % 1 == 0 ? 0.5 : 0.1).toFixed(1))
            }
        })

    if ((req.body.runs % 2 == 1 && req.body.overs % 1 != 0) || (req.body.runs % 2 == 0 && req.body.overs % 1 == 0)) {
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning,
                "batting.strike": false
            },
            {
                $set: {
                    "batting.$.strike": true
                }
            })
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning,
                "batting.name": req.body.striker
            },
            {
                $set: {
                    "batting.$.strike": false
                }
            })
    }
    let overs = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, overs: 1, runs: 1 } }).toArray()
    res.json({
        updated: true,
        match: overs[0].overs
    })
})

router.post('/fetch-players-popup', async (req, res) => {
    let team = await client.db(req.body.db).collection("teams").find({ name: req.body.team }).toArray()
    if (team.length != 0)
        res.json(team[0]);
});

router.post('/change-bowler', async (req, res) => {
    let bowler_runs = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning, "timeline.name": req.body.prev_bowler }, { projection: { _id: 0, "timeline.runs": 1 } }).toArray();
    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "bowling.name": req.body.prev_bowler
        },
        {
            $inc: {
                "bowling.$.maidens": bowler_runs[0].timeline[bowler_runs[0].timeline.length - 1].runs == 0 ? 1 : 0,
            },
            $push: {
                timeline: {
                    name: req.body.new_bowler,
                    runs: 0,
                    balls: []
                }
            }
        })
    let flag = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning, "bowling.name": req.body.new_bowler }).toArray();
    if (flag.length == 0) {
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning
            },
            {
                $push: {
                    bowling: {
                        name: req.body.new_bowler,
                        overs: parseFloat(0),
                        maidens: 0,
                        runs: 0,
                        wickets: 0
                    }
                }
            })
    }
    res.json({ updated: true })
})

module.exports = router