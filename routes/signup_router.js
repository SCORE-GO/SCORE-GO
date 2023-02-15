const e = require('express');
const express = require('express');
const path = require("path");
const client = require('../dbconnect');
// const nodemailer = require('nodemailer');
const router = express.Router();
const registration_details = client.db('global').collection('registration_details');
let user_db;

router.get("", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/signup.html'));
});

router.post('/checkduplicate', async (req, res) => {
    let emails = await registration_details.find({}, { projection: { _id: 0, email: 1 } }).toArray();
    let flag = false;
    emails.forEach(element => {
        if (element.email == req.body.email) {
            flag = true;
        }
    });
    res.json({ duplicate: flag });
})

router.post("/register", async (req, res) => {
    await registration_details.insertOne(req.body)
        .catch(() => res.json({ "inserted": false }))
    user_db = req.body.email.substring(0, req.body.email.indexOf('@')) + "_db"
    await client.db(user_db).collection('teams').insertMany(require('../public/assets/json/teams.json'))
        .then(() => res.json({ "inserted": true }))
        .catch(() => res.json({ "inserted": false }))
});

router.post('/signin', async (req, res) => {
    let users = await registration_details.find({}, { projection: { _id: 0, email: 1, password: 1 } }).toArray();
    let flag = false;
    let name;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email == req.body.email && users[i].password == req.body.password) {
            user_db = req.body.email.substring(0, req.body.email.indexOf('@')) + "_db"
            name = await registration_details.find({ email: req.body.email }, { projection: { _id: 0, full_name: 1, last_name: 1 } }).toArray()
            flag = true;
            break;
        }
    }
    if (flag) {
        res.json({
            'login': flag,
            'user_db': user_db,
            'name': (name[0].full_name.charAt(0) + name[0].last_name.charAt(0)).toUpperCase()
        });
    } else {
        res.json({ 'login': flag });
    }
})

module.exports = router