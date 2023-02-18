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
    let names1 = await client.db(req.body.db).collection("teams").find({ name: match_info[0].team1 }, { projection: { _id: 0, players: { name: 1 } } }).toArray()
    let names2 = await client.db(req.body.db).collection("teams").find({ name: match_info[0].team2 }, { projection: { _id: 0, players: { name: 1 } } }).toArray()
    console.log(match_info, names1[0].players, names2[0].players);

    res.json({
        matches: await client.db(req.body.db).collection('matches').find({}).toArray()
    });
})

module.exports = router