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

router.post("/create", async (req, res) => {
    console.log(req.body.data)
    // await client.db(req.body.db).collection('matches').insertOne(req.body.data)
        // .then(() => res.json({ "inserted": true }))
        // .catch(() => res.json({ "inserted": false }))
});




module.exports = router