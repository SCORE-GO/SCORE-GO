const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/new-match.html'));
});

router.post('/fetch-teams', async (req, res) => {
    res.json({ teams: await client.db(req.body.db).collection('teams').find({}, { projection: { _id: 0, name: 1 } }).toArray() })
})

router.post('/check-title', async (req, res) => {
    let flag = await client.db(req.body.db).collection('matches').find({ title: req.body.title }).toArray()
    if (flag.length == 0)
        res.json({ duplicate: false });
    else
        res.json({ duplicate: true });
})

router.post('/fetch-players-count', async (req, res) => {
    let team_players = await client.db(req.body.db).collection("teams").find({ name: { $in: [req.body.team1, req.body.team2] } }, { projection: { _id: 0, players: 1 } }).toArray()
    if (team_players.length != 0) {
        let flag1 = false, flag2 = false;
        team_players[0].players.every(element => {
            if (element.name == "") {
                flag1 = true;
                return false;
            }
            return true;
        });
        team_players[1].players.every(element => {
            if (element.name == "") {
                flag2 = true;
                return false;
            }
            return true;
        });
        if (flag1 || flag2)
            res.json({ all_players: false });
        else
            res.json({ all_players: true });
    }

})

router.post("/insert", async (req, res) => {
    let inning1 = [req.body.data.team1, req.body.data.team2]
    let inning2 = [req.body.data.team2, req.body.data.team1]
    if ((req.body.data.toss == req.body.data.team1 && req.body.data.choice == false) || (req.body.data.toss == req.body.data.team2 && req.body.data.choice == true)) {
        inning1.reverse()
        inning2.reverse()
    }
    let default_match = require('../public/json/default_match.json')
    default_match[0].bat = inning1[0]
    default_match[0].bowl = inning1[1]
    default_match[1].bat = inning2[0]
    default_match[1].bowl = inning2[1]

    await client.db(req.body.db).collection('matches').insertOne(req.body.data);
    await client.db(req.body.db).collection(req.body.data.title).insertMany(default_match)
        .then(() => res.json({ "inserted": true }))
        .catch(() => res.json({ "inserted": false }))
});

router.post("/start", async (req, res) => {
    let id = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 1 } }).toArray()
    res.json({ id: id[0]._id.toString() })
})

module.exports = router