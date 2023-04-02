const e = require('express');
const express = require('express');
const path = require("path");
const client = require('../dbconnect');
// const nodemailer = require('nodemailer');
const router = express.Router();
const registration_details = client.db('global').collection('registration_details');

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/signup.html'));
});

router.post('/checkduplicate', async (req, res) => {
    let flag = await registration_details.find({ email: req.body.email }).toArray();
    if (flag.length == 0)
        res.json({ duplicate: false });
    else
        res.json({ duplicate: true });
})

router.post("/register", async (req, res) => {
    await registration_details.insertOne(req.body)
        .catch(() => res.json({ "inserted": false }))
    await client.db(req.body.email.substring(0, req.body.email.indexOf('@')) + "_db").collection('teams').insertMany(require('../public/json/teams.json'))
        .then(() => res.json({ "inserted": true }))
        .catch(() => res.json({ "inserted": false }))
});

router.post('/signin', async (req, res) => {
    let users = await registration_details.find({ email: req.body.email }, { projection: { _id: 0, email: 1, password: 1 } }).toArray();
    if (users.length == 0)
        res.json({ 'status': 'new' });
    else if (users[0].password == req.body.password) {
        full_name = await registration_details.find({ email: req.body.email }, { projection: { _id: 0, first_name: 1, last_name: 1 } }).toArray()
        res.json({
            'status': 'pass',
            'user_db': req.body.email.substring(0, req.body.email.indexOf('@')) + "_db",
            'name': (full_name[0].first_name + " " + full_name[0].last_name).toUpperCase()
        });
    }
    else
        res.json({ 'status': 'fail' });
})


module.exports = router