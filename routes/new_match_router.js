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

router.post("/insert", async (req, res) => {
    await client.db(req.body.db).collection('matches').insertOne(req.body.data);
    await client.db(req.body.db).collection(req.body.data.title).insertMany(require('../public/json/default_match.json'))
        .then(() => res.json({ "inserted": true }))
        .catch(() => res.json({ "inserted": false }))
});

router.post("/start", async (req, res) => {
    let id = await client.db(req.body.db).collection("matches").find({ title: req.body.title }, { projection: { _id: 1 } }).toArray()
    res.json({id: id[0]._id.toString()})
})

module.exports = router