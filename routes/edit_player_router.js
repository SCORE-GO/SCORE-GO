const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();
let team_name;

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/edit-player.html'));
});

router.post("/check-team", async (req, res) => {
    try {
        let team = await client.db(req.body.db).collection("teams").find({ abbr: req.body.abbr }).toArray()
        if (team.length == 0)
            res.json({ exists: false })
        else
            res.json({ exists: true })
    } catch (err) {
        res.json({ exists: false })
    }
})

router.post("/fetch-active", async (req, res) => {
    let player_data = await client.db(req.body.db).collection("teams").find({ abbr: req.body.abbr }, { projection: { _id: 0, players: { $slice: [parseInt(req.body.index), 1] } } }).toArray()
    if (player_data.length != 0)
        res.json({ data: player_data[0].players[0] })
})

router.post("/fetch-players", async (req, res) => {
    let data = await client.db(req.body.db).collection("teams").find({ abbr: req.body.abbr }, { projection: { _id: 0, captain: 1, vice_captain: 1, keeper: 1, players: { name: 1 } } }).toArray()
    if (data.length != 0)
        res.json({ data: data[0] })
})

router.post("/update-player", async (req, res) => {
    await client.db(req.body.db).collection("teams").updateOne({ abbr: req.body.abbr }, { $set: { ["players." + parseInt(req.body.index)]: req.body.data } })
        .then(() => { res.json({ updated: true }) })
        .catch(() => { res.json({ updated: false }) })
})

module.exports = router