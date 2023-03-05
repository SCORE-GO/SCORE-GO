const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/create-new-team.html'));
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

router.post("/create", async (req, res) => {
    let name_flag = await client.db(req.body.db).collection("teams").find({ name: req.body.name }).toArray()
    let abbr_flag = await client.db(req.body.db).collection("teams").find({ abbr: req.body.abbr }).toArray()
    if (name_flag.length == 0 && abbr_flag.length == 0) {
        await client.db(req.body.db).collection("teams").insertOne({
            "name": req.body.name,
            "abbr": req.body.abbr,
            "color": req.body.color,
            "captain": 0,
            "vice_captain": 0,
            "keeper": 0,
            "players": new Array(11).fill({
                "name": "",
                "bat": "right",
                "bowl": "none",
                "bowl_type": "none"
            })
        })
        res.json({
            duplicate: false
        })
    } else {
        res.json({ duplicate: true })
    }
});

router.post("/fetch-details", async (req, res) => {
    let teams = await client.db(req.body.db).collection("teams").find({ abbr: req.body.abbr }, { projection: { _id: 0 } }).toArray()
    res.json({ data: teams[0] })
});

router.post("/edit", async (req, res) => {
    if (req.body.captain == null && req.body.keeper == null && req.body.vice_captain == null) {
        await client.db(req.body.db).collection("teams").updateOne({ abbr: req.body.oldabbr }, {
            $set: {
                name: req.body.name,
                abbr: req.body.newabbr,
                color: req.body.color
            }
        })
            .then(() => { res.json({ updated: true }) })
            .catch(() => { res.json({ updated: false }) })
    } else {
        await client.db(req.body.db).collection("teams").updateOne({ abbr: req.body.oldabbr }, {
            $set: {
                name: req.body.name,
                abbr: req.body.newabbr,
                color: req.body.color,
                captain: parseInt(req.body.captain),
                vice_captain: parseInt(req.body.vice_captain),
                keeper: parseInt(req.body.keeper)
            }
        })
            .then(() => { res.json({ updated: true }) })
            .catch(() => { res.json({ updated: false }) })
    }
})

module.exports = router