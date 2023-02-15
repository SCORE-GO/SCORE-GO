const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/create-new-team.html'));
});

router.post("/create", async (req, res) => {
    let name_flag = await client.db(req.body.db).collection("teams").find({ name: req.body.name }).toArray()
    let abbr_flag = await client.db(req.body.db).collection("teams").find({ abbr: req.body.abbr }).toArray()
    console.log(req.body.name)
    console.log(req.body.abbr)
    res.json({ value: 'created' })
});

router.post("/edit", (req, res) => {
    res.json({ value: 'edited' })
});

module.exports = router