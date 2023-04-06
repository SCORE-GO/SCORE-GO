const express = require('express');
const path = require("path");
const client = require('../dbconnect');
const nodemailer = require('nodemailer');
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

router.post('/confirm_email', async (req, res) => {
    const otp = (Math.floor(Math.random() * 900000) + 100000).toString();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'teamscorego@gmail.com',
            pass: 'hkjqydikunkiqwrq'
        }
    });
    const mailOptions = {
        from: 'SCORE-GO TEAM <teamscorego@gmail.com>',
        to: req.body.email,
        subject: 'Please Verify Your Email Address',
        html: `<div style="font-family: 'Poppins', sans-serif; font-size: 20px"><b>Dear user,</b><br>Thank you for registering with our service.<br>The OTP to verify your email is <b>${otp}</b>.<br>Please enter this OTP on our website to complete your registration.<br>If you did not sign up for our service, please disregard this email.<br><br>Regards,<br>Team SCORE-GO</div>`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.json({ mail_sent: false })
        } else {
            res.json({ mail_sent: true, otp: otp })
        }
    });
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