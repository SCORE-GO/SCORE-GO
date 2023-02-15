const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();
let team_name;

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/edit-player.html'));
});

module.exports = router