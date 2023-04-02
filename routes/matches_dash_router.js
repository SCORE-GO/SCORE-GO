const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/matches-dash.html'));
});

router.post('/fetch_matches', async (req, res) => {
    let match_info = await client.db(req.body.db).collection("matches").find({}).toArray();
    if (match_info.length != 0) {
        let team_details = new Array(match_info.length * 2);
        let k = 0;
        for (let i = 0; i < match_info.length; i++) {
            let inn_info = await client.db(req.body.db).collection(match_info[i].title).find({}, { projection: { _id: 0, bat: 1, runs: 1, wickets: 1, overs: 1 } }).toArray();
            let color = await client.db(req.body.db).collection("teams").find({ name: { $in: [inn_info[0].bat, inn_info[1].bat] } }, { projection: { _id: 0, color: 1 } }).toArray();
            if (color.length != 0) {
                inn_info[0].color = color[0].color;
                inn_info[1].color = color[1].color;
                team_details[k] = inn_info[0];
                team_details[k + 1] = inn_info[1];
                k += 2;
            }
        }
        res.json({
            matches: true,
            match_info: match_info,
            team_details: team_details
        })
    } else
        res.json({ matches: false })
})

module.exports = router