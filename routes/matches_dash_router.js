const { match } = require('assert');
const express = require('express');
const path = require("path");
const ObjectId = require('mongodb').ObjectId;
const client = require('../dbconnect');
const router = express.Router();


router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/matches-dash.html'));
});

// router.post('/fetch_matches', async (req, res) => {
//     res.json({
//         teams: await client.db(req.body.db).collection('teams').countDocuments(),
//         matches: await client.db(req.body.db).collection('matches').countDocuments()
//     });

// })



router.post('/fetch_matches', async (req, res) => {
    let match_info = await client.db(req.body.db).collection("matches").find({}).toArray()
    // let team_details = await client.db(req.body.db).collection("teams").find({}).toArray()
    // let team_details2 = await client.db(req.body.db).collection("teams").find({ name: { $in: [match_info[0].team1, match_info[0].team2] } }, { projection: { _id: 0, name: 1, color: 1 } }).toArray()
 
    console.log(match_info)

 
    let response = {
        
    };
    res.json(response);

})

module.exports = router