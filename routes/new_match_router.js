const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/new-match.html'));
});

router.post('/teams', async (req, res) => {
    const teamNames = await client.db(req.body.db).collection('teams').find({}, { projection: { _id: 0, name: 1 } }).toArray();
    res.json({
        value: JSON.stringify(teamNames)
    })
    
})



module.exports = router