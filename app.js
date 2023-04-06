const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const app = express();
const port = 3030;

// Body-parser configuration
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public/img/brand.png")));

// Links
app.use("/", require("./routes/home_router"));

app.use("/get-started", require("./routes/signup_router"));

app.use("/dashboard", require("./routes/dashboard_router"));

app.use("/myteams", require("./routes/teams_dash_router"));

app.use("/mymatches", require("./routes/matches_dash_router"));

app.use("/new-match", require("./routes/new_match_router"));

app.use("/new-team", require("./routes/create_new_team_router"));

app.use("/edit-team", require("./routes/create_new_team_router"));

app.use("/edit-player", require("./routes/edit_player_router"));

app.use("/start-match/:match", require("./routes/start_match_router"));

app.use("/live-scorecard/:match", require("./routes/scorecard_router"));

app.use("/match-summary/:match", require("./routes/match_summary_router"));

app.get("/profile-menu", (req, res) => {
    res.sendFile(path.join(__dirname, "public/views/profile-menu.html"));
});

app.get("/aside", (req, res) => {
    res.sendFile(path.join(__dirname, "public/views/aside.html"));
});

app.listen(port, () => {
    console.log(`SCORE-GO listening on http://localhost:${port}`)
})