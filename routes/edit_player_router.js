const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();
let team_name;

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/edit-player.html'));
});

router.post("/fetch-active", async (req, res) => {
    let player_data = await client.db(req.body.db).collection("teams").find({ abbr: req.body.abbr }, { projection: { _id: 0, players: { $slice: [parseInt(req.body.index), 1] } } }).toArray()
    res.json({ data: player_data[0].players[0] })
})

router.post("/fetch-players", async (req, res) => {
    let names = await client.db(req.body.db).collection("teams").find({ abbr: req.body.abbr }, { projection: { _id: 0, players: { name: 1 } } }).toArray()
    res.json({ data: names[0].players })
})

router.post("/update-player", async (req, res) => {
    await client.db(req.body.db).collection("teams").updateOne({ abbr: req.body.abbr }, { $set: { ["players." + parseInt(req.body.index)]: req.body.data } })
        .then(() => { res.json({ updated: true }) })
        .catch(() => { res.json({ updated: false }) })
})

module.exports = router