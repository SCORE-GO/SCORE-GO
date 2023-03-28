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
            if (inning_data.length != 0) {
                inning_data = inning_data[0].wickets == 10 || inning_data[0].overs == match[0].overs ? inning_data[1] : inning_data[0];
                res.json({
                    exists: true,
                    started: inning_data.batting.length == 0 || inning_data.bowling.length == 0 ? false : true
                });
            }
        } else
            res.json({ exists: false, present: true });
    } catch (err) {
        res.json({ exists: false });
    }
})

router.post('/fetch-match-info', async (req, res) => {
    let match_info = await client.db(req.body.db).collection("matches").find({ _id: new ObjectId(req.body.id) }).toArray()
    if (match_info.length != 0) {
        let team_details = await client.db(req.body.db).collection("teams").find({ name: { $in: [match_info[0].team1, match_info[0].team2] } }).toArray()
        let innings = await client.db(req.body.db).collection(match_info[0].title).find({}).toArray()
        if (innings.length != 0) {
            let response = {
                match_info: match_info[0],
                team: team_details,
                inning_data: innings[0]
            };
            if (innings[0].wickets == 10 || innings[0].overs == match_info[0].overs) {
                response.inning_data = innings[1];
                response.target = innings[0].runs + 1;
            }
            res.json(response);
        }
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

router.post('/add-runs', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();

    if (arr.length != 0)
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
                "bowling.$.overs": parseFloat((req.body.overs % 1 == 0 ? 0.5 : 0.1).toFixed(1)),
                "bowling.$.runs": req.body.runs
            }
        })

    if ((req.body.runs % 2 == 1 && req.body.overs % 1 != 0) || (req.body.runs % 2 == 0 && req.body.overs % 1 == 0)) {
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.strike": false }, { $set: { "batting.$.strike": true } })
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.name": req.body.striker }, { $set: { "batting.$.strike": false } })
    }

    let overs = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 0, overs: 1 } }).toArray();
    let runs = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, runs: 1 } }).toArray()

    if (overs.length != 0 && runs.length != 0)
        res.json({ updated: true, match_overs: overs[0].overs, runs: runs[0].runs })
    else
        res.json({ updated: false })
})

router.post('/fetch-players-popup', async (req, res) => {
    let team = await client.db(req.body.db).collection("teams").find({ name: req.body.team }).toArray()
    let batting = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, batting: { name: 1, status: 1 } } }).toArray()
    if (team.length != 0 && batting.length != 0) {
        team[0].batting = batting[0].batting;
        res.json(team[0]);
    }
});

router.post('/change-bowler', async (req, res) => {
    let bowler_runs = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning, "timeline.name": req.body.prev_bowler }, { projection: { _id: 0, "timeline.runs": 1 } }).toArray();

    if (bowler_runs.length != 0)
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

router.post('/add-extras2', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();

    if (arr.length != 0)
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
                    ["timeline." + (arr[0].timeline.length - 1) + ".balls"]: (req.body.runs + req.body.extra_type).toString()
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
                "batting.$.balls": 1
            }
        })

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "bowling.name": req.body.bowler
        },
        {
            $inc: {
                "bowling.$.overs": parseFloat((req.body.overs % 1 == 0 ? 0.5 : 0.1).toFixed(1)),
                "bowling.$.runs": req.body.runs
            }
        })

    if (req.body.extra_type == "B")
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning }, { $inc: { "extras.byes": req.body.runs } });
    else if (req.body.extra_type == "LB")
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning }, { $inc: { "extras.leg_byes": req.body.runs } });
    else if (req.body.extra_type == "P")
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning }, { $inc: { "extras.penalty": req.body.runs } });

    if ((req.body.runs % 2 == 1 && req.body.overs % 1 != 0) || (req.body.runs % 2 == 0 && req.body.overs % 1 == 0)) {
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.strike": false }, { $set: { "batting.$.strike": true } })
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.name": req.body.striker }, { $set: { "batting.$.strike": false } })
    }

    let overs = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 0, overs: 1 } }).toArray();
    let runs = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, runs: 1 } }).toArray()

    if (overs.length != 0 && runs.length != 0)
        res.json({ updated: true, match_overs: overs[0].overs, runs: runs[0].runs })
    else
        res.json({ updated: false })
})

router.post('/add-extras1', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();

    if (arr.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning
            },
            {
                $inc: {
                    "runs": req.body.runs + 1,
                    ["timeline." + (arr[0].timeline.length - 1) + ".runs"]: req.body.runs + 1,
                },
                $push: {
                    ["timeline." + (arr[0].timeline.length - 1) + ".balls"]: (req.body.runs + req.body.extra_type).toString()
                }
            })

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "bowling.name": req.body.bowler
        },
        {
            $inc: {
                "bowling.$.runs": req.body.runs + 1
            }
        })

    if (req.body.extra_type == "WD")
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning }, { $inc: { "extras.wide": req.body.runs + 1 } });
    else if (req.body.extra_type == "NB")
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.name": req.body.striker }, { $inc: { "extras.no_ball": req.body.runs + 1, "batting.$.balls": req.body.runs } });

    if ((req.body.runs % 2 == 1 && req.body.overs % 1 != 0) || (req.body.runs % 2 == 0 && req.body.overs % 1 == 0)) {
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.strike": false }, { $set: { "batting.$.strike": true } })
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.name": req.body.striker }, { $set: { "batting.$.strike": false } })
    }

    res.json({ updated: true })
})

router.post('/check-end-match', async (req, res) => {
    let runs = await client.db(req.body.db).collection(req.body.title).find({}, { projection: { _id: 0, runs: 1 } }).toArray();
    let inning_info = await client.db(req.body.db).collection(req.body.title).find({ inning: 2 }).toArray();
    let overs = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 0, overs: 1 } }).toArray();
    let abbr_bat = await client.db(req.body.db).collection("teams").find({ name: inning_info[0].bat }, { projection: { _id: 0, abbr: 1 } }).toArray();
    let abbr_bowl = await client.db(req.body.db).collection("teams").find({ name: inning_info[0].bowl }, { projection: { _id: 0, abbr: 1 } }).toArray();
    let result = "";
    if (runs.length != 0 && inning_info.length != 0 && overs.length != 0 && abbr_bat.length != 0 && abbr_bowl.length != 0) {
        if (runs[1].runs > runs[0].runs) {
            if (10 - inning_info[0].wickets == 1)
                result = `${abbr_bat[0].abbr} won by ${10 - inning_info[0].wickets} wicket`;
            else
                result = `${abbr_bat[0].abbr} won by ${10 - inning_info[0].wickets} wickets`;
        } else if ((inning_info[0].wickets + inning_info[0].retired_hurt == 10 && req.body.retired_hurt) || inning_info[0].overs == overs[0].overs)
            result = `${abbr_bowl[0].abbr} won by ${runs[0].runs - runs[1].runs} runs`;
        else
            result = "";
    }
    if (result != "") {
        await client.db(req.body.db).collection("matches").updateOne({ title: req.body.title }, { $set: { "result": result } })
            .then(() => res.json({ end: true, result: result }))
    } else
        res.json({ end: false })
})

router.post('/add-wicket', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();

    if (arr.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning
            },
            {
                $inc: {
                    "wickets": 1
                },
                $push: {
                    ["timeline." + (arr[0].timeline.length - 1) + ".balls"]: "W"
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
                "batting.$.balls": 1
            },
            $set: {
                "batting.$.status": req.body.status
            },
            $unset: {
                "batting.$.strike": 1
            }
        })

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "bowling.name": req.body.bowler
        },
        {
            $inc: {
                "bowling.$.overs": parseFloat((req.body.overs % 1 == 0 ? 0.5 : 0.1).toFixed(1)),
                "bowling.$.wickets": 1
            }
        })


    let overs = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 0, overs: 1 } }).toArray();
    let runs = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, runs: 1 } }).toArray()

    if (overs.length != 0 && runs.length != 0)
        res.json({ updated: true, match_overs: overs[0].overs, runs: runs[0].runs })
    else
        res.json({ updated: false })
})

router.post('/change-batsman', async (req, res) => {
    let strike = true;
    if (req.body.overs % 1 == 0 && req.body.run_out == false) {
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.status": "not out" }, { $set: { "batting.$.strike": true } })
        strike = false;
    }
    if (req.body.run_out) {
        let not_out_strike = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning, "batting.status": 'not out' }, { projection: { _id: 0, batting: { $elemMatch: { status: 'not out' } } } }).toArray();
        if (not_out_strike.length != 0)
            if (not_out_strike[0].batting[0].strike)
                strike = false;
    }

    let check_batsman = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning, "batting.name": req.body.name }).toArray();
    if (check_batsman.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning,
                "batting.name": req.body.name
            },
            {
                $set: {
                    "batting.$.strike": strike,
                    "batting.$.status": "not out"
                }
            })
    else
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning
            },
            {
                $push: {
                    batting: {
                        name: req.body.name,
                        runs: 0,
                        balls: 0,
                        fours: 0,
                        sixes: 0,
                        status: "not out",
                        strike: strike
                    }
                }
            })

    let retired_hurt_batsmen = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning, "batting.status": 'retired hurt' }, { projection: { _id: 0, batting: { $elemMatch: { status: 'retired hurt' } } } }).toArray();
    if (retired_hurt_batsmen.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning }, { $set: { retired_hurt: retired_hurt_batsmen[0].batting.length } })
    else
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning }, { $set: { retired_hurt: 0 } })

    res.json({ updated: true })
})

router.post('/run-out1', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();

    if (arr.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning
            },
            {
                $inc: {
                    "runs": req.body.runs,
                    "wickets": 1
                },
                $push: {
                    ["timeline." + (arr[0].timeline.length - 1) + ".balls"]: "W"
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
                "batting.$.balls": 1
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
                "bowling.$.overs": parseFloat((req.body.overs % 1 == 0 ? 0.5 : 0.1).toFixed(1)),
            }
        })

    if ((req.body.runs % 2 == 1 && req.body.overs % 1 != 0) || (req.body.runs % 2 == 0 && req.body.overs % 1 == 0)) {
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.strike": false }, { $set: { "batting.$.strike": true } })
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.name": req.body.striker }, { $set: { "batting.$.strike": false } })
    }

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "batting.name": req.body.batsman
        },
        {
            $set: {
                "batting.$.status": req.body.status
            },
            $unset: {
                "batting.$.strike": 1
            }
        })

    let overs = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 0, overs: 1 } }).toArray();
    let runs = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, runs: 1 } }).toArray()

    if (overs.length != 0 && runs.length != 0)
        res.json({ updated: true, match_overs: overs[0].overs, runs: runs[0].runs })
    else
        res.json({ updated: false })
})

router.post('/run-out2', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();

    if (arr.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning
            },
            {
                $inc: {
                    "runs": req.body.runs,
                    "wickets": 1
                },
                $push: {
                    ["timeline." + (arr[0].timeline.length - 1) + ".balls"]: "WNB"
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
                "batting.$.balls": 1
            }
        })

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "bowling.name": req.body.bowler
        },
        {
            $inc: {
                "bowling.$.runs": req.body.runs
            }
        })

    if ((req.body.runs % 2 == 1 && req.body.overs % 1 != 0) || (req.body.runs % 2 == 0 && req.body.overs % 1 == 0)) {
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.strike": false }, { $set: { "batting.$.strike": true } })
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.name": req.body.striker }, { $set: { "batting.$.strike": false } })
    }

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "batting.name": req.body.batsman
        },
        {
            $set: {
                "batting.$.status": req.body.status
            },
            $unset: {
                "batting.$.strike": 1
            }
        })
    res.json({ updated: true })
})

router.post('/wicket-without-ball', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();

    if (arr.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning
            },
            {
                $inc: {
                    "wickets": 1
                },
                $push: {
                    ["timeline." + (arr[0].timeline.length - 1) + ".balls"]: "W"
                }
            })

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "batting.name": req.body.batsman
        },
        {
            $set: {
                "batting.$.status": req.body.status
            },
            $unset: {
                "batting.$.strike": 1
            }
        })

    res.json({ updated: true })
})

router.post('/wicket-no-credit', async (req, res) => {
    let arr = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, timeline: 1 } }).toArray();

    if (arr.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne(
            {
                inning: req.body.inning
            },
            {
                $inc: {
                    "runs": req.body.runs,
                    "wickets": 1
                },
                $push: {
                    ["timeline." + (arr[0].timeline.length - 1) + ".balls"]: "W"
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
                "batting.$.balls": 1
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
                "bowling.$.overs": parseFloat((req.body.overs % 1 == 0 ? 0.5 : 0.1).toFixed(1)),
            }
        })

    if ((req.body.runs % 2 == 1 && req.body.overs % 1 != 0) || (req.body.runs % 2 == 0 && req.body.overs % 1 == 0)) {
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.strike": false }, { $set: { "batting.$.strike": true } })
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning, "batting.name": req.body.striker }, { $set: { "batting.$.strike": false } })
    }

    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "batting.name": req.body.batsman
        },
        {
            $set: {
                "batting.$.status": req.body.status
            },
            $unset: {
                "batting.$.strike": 1
            }
        })

    let overs = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 0, overs: 1 } }).toArray();
    let runs = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, runs: 1 } }).toArray()

    if (overs.length != 0 && runs.length != 0)
        res.json({ updated: true, match_overs: overs[0].overs, runs: runs[0].runs })
    else
        res.json({ updated: false })
})

router.post('/fetch-retired-hurt', async (req, res) => {
    let retired_hurt = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning }, { projection: { _id: 0, retired_hurt: 1, wickets: 1 } }).toArray();
    if (retired_hurt.length != 0)
        res.json({ retired_hurt: retired_hurt[0].retired_hurt, wickets: retired_hurt[0].wickets })
})

router.post('/retired-hurt', async (req, res) => {
    await client.db(req.body.db).collection(req.body.title).updateOne(
        {
            inning: req.body.inning,
            "batting.name": req.body.batsman
        },
        {
            $set: {
                "batting.$.status": req.body.status
            },
            $unset: {
                "batting.$.strike": 1
            }
        })

    let retired_hurt_batsmen = await client.db(req.body.db).collection(req.body.title).find({ inning: req.body.inning, "batting.status": 'retired hurt' }, { projection: { _id: 0, batting: { $elemMatch: { status: 'retired hurt' } } } }).toArray();
    if (retired_hurt_batsmen.length != 0)
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning }, { $set: { retired_hurt: retired_hurt_batsmen[0].batting.length } })
    else
        await client.db(req.body.db).collection(req.body.title).updateOne({ inning: req.body.inning }, { $set: { retired_hurt: 0 } })

    res.json({ updated: true })
})

module.exports = router