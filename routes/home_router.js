const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const router = express.Router();

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.post("/sendFeedback", (req, res) => {
    
})

module.exports = router;