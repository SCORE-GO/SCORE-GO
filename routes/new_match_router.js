const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();
let user_db;

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/new-match.html'));
});

router.post('/teams', async (req, res) => {
    const teamNames = await client.db(req.body.db).collection('teams').find({}, { projection: { _id: 0, name: 1 } }).toArray();
    res.json({
        value: JSON.stringify(teamNames)
    })
    
})

router.post("/teams", async (req, res) => {
    await matches.insertOne(req.body)
        .catch(() => res.json({ "inserted": false }))
     user_db = req.body.email.substring(0, req.body.email.indexOf('@')) + "_db"
    await client.db(user_db).collection('matches').insertMany(require('../public/views/new-match.html'))
        .then(() => res.json({ "inserted": true }))
        .catch(() => res.json({ "inserted": false }))
});




module.exports = router