let cookies = document.cookie.split(';');
let db = cookies[0].substring(cookies[0].indexOf('=') + 1);
let id = new URLSearchParams(window.location.search).get('id');
let title, inning, runs, wickets, overs, over_counter, striker, bowler, batting_team, bowling_team;
let custom_runs = -1;
let compliments = ["Great Shot!", "That was class!", "What a shot!", "That was a beauty!", "What a hit!", "Perfect placement!", "Sweet stroke!", "Terrific technique!", "Great form!", "Spellbounded!"];

// adding run buttons
for (let i = 0; i < 10; i++) {
	if (i == 1)
		$('.runs-area').append(`<button class='run-btn' style='padding: 4px 11px;' id='${i}'>${i}</button>`);
	else
		$('.runs-area').append(`<button class='run-btn' id='${i}'>${i}</button>`);
}
$('.runs-area').append(`<div class="custom-runs"><input type="text" title="Enter custom runs here" name="custom-runs" id="custom-runs" required><span class="material-icons custom-tick">check_circle</span></div>`);

// adding wickets
let wicket_types = ['Bowled', 'LBW', 'Caught', 'Run-Out', 'Stumped', 'Hit-Wicket', 'Timed-Out', 'Retired', 'Mankading', 'Hit-The-Ball-Twice', 'Obstructing-The-Field'];
wicket_types.forEach(wicket => {
	$('.wickets-area').append(`<button class="run-btn wicket-btn">${wicket}</button>`);
});

// adding extras
let extras = ['WD', 'NB', 'B', 'LB', 'Penalty'];
extras.forEach(extra => {
	$('.extras-area').append(`<button class="run-btn extras-btn">${extra}</button>`);
});

// main-area height
if ($('.scorecard-section').height() > $('.left-side').height()) {
	$('.overs-timeline').css("height", `calc(${$('.scorecard-section').css("height")} + 20px)`);
	$('.left-side').css("height", `calc(${$('.scorecard-section').css("height")} + 20px)`);
} else {
	$('.overs-timeline').css("height", $('.left-side').css("height"));
	$('.scorecard-section').css("height", $('.left-side').css("height"));
}

// table width
$(".inningContent").css('width', `calc(${$('.scorecard-section').css('width')} - 50px)`);
$("#hline").css("width", $('.inningButtons button').css('width'));

function switchTab(index) {
	$('.tab-container').css('margin-left', `calc(-${$('.scorecard-section').css('width')} * ${index})`);
	$('.inningButtons button').removeClass('active');
	$('#hline').css('margin-left', `calc(${$('.inningButtons button').css('width')} * ${index})`);
	$('.inningButtons button').eq(index).addClass('active');
}

// loading match content and disabling preloader
$(document).ready(async (event) => {
	if (document.cookie.search("db") == -1)
		window.location.replace("/get-started")
	else if (id == null)
		window.location.replace("/new-match")
	else {
		await fetch("/live-scorecard/check-match", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				db: db,
				id: id
			})
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.exists) {
					if (res.started == false)
						window.location.replace(`/start-match?id=${id}`);
				} else
					window.location.replace("/dashboard")

			})

		$(".profile-menu").load("/profile-menu");

		await fetch('/live-scorecard/fetch-match-info', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				db: db,
				id: id
			})
		})
			.then((res) => res.json())
			.then(async (res) => {
				title = res.match_info.title;
				inning = res.inning_data.inning;
				batting_team = res.inning_data.bat;
				bowling_team = res.inning_data.bowl;

				$(document).prop('title', `${title} - ${res.team[0].abbr} vs ${res.team[1].abbr} Live Scorecard - SCORE-GO`);
				$("#date").html(res.match_info.date);
				$("#match-title").html(`${title} - `);
				$("#venue").html(res.match_info.venue);
				if (inning == 1) {
					$("#inning").html("1st Innings");
					$('.inningButtons button').eq(0).html(batting_team);
					$('.inningButtons button').eq(1).html(bowling_team);
					let i = bowling_team == res.team[0].name ? 0 : 1;
					i2_players = "";
					res.team[i].players.forEach((ele) => {
						i2_players += ele.name;
						if (res.team[i].players[res.team[i].captain] == ele)
							i2_players += " (C)";
						if (res.team[i].players[res.team[i].vice_captain] == ele)
							i2_players += " (VC)";
						if (res.team[i].players[res.team[i].keeper] == ele)
							i2_players += " (WK)";
						i2_players += " <br> ";
					})
					$("#tab2 .shadow:first-child .score-table").append(`
							<tr class="yet-to-bat">
								<td colspan="6" style="padding-top: 20px; font-size: 24px; font-family: var(--raleway-font)">
									<p style="height: 40px; font-family: var(--poppins-font)">Playing 11</p>
									<span class="batsman-status" style="font-size: 16px; line-height: 2">${i2_players}</span>
								</td>
							</tr>
						`);
					$("#tab2 .shadow:last-child").hide();
				} else {
					$("#inning").html("2nd Innings");
					$('.inningButtons button').eq(0).html(bowling_team);
					$('.inningButtons button').eq(1).html(batting_team);
					switchTab(1);
					fetch_scorecard(2);
				}

				fetch_scorecard(1).then(async function () {
					for (let i = 0; i < 2; i++) {
						$(`#t${i + 1}-block .team-name`).html(res.team[i].name);
						let j;
						if ($(`#t${i + 1}-block .team-name`).html() == $(".inningButtons button").eq(i).html())
							j = i;
						else
							j = 1 - i;
						$(`.t${j + 1} tr th`).css('background-color', res.team[i].color);
						$(`.t${j + 1} tr:last-child td`).css('border-bottom', `3px solid ${res.team[i].color}`);
						$(`.t${j + 1} tr:nth-child(odd)`).css('background-color', res.team[i].color + '30');
						if (res.match_info.toss == res.team[i].name)
							$("#toss").html(res.team[i].abbr);
						if (batting_team == res.team[i].name) {
							$(`#t${i + 1}-block div img`).attr("src", "../img/bat-icon.ico");
							$(`#t${i + 1}-block div`).css("background-color", res.team[i].color);
							$(`#t${1 - i + 1}-block div img`).attr("src", "../img/ball-icon.ico");
							$(`#t${1 - i + 1}-block div`).css("background-color", res.team[1 - i].color);
							$('.main-score-pane').css({ 'border': `3px solid ${res.team[i].color}`, 'color': res.team[i].color });
							$('.main-score-pane div:nth-child(2)').css('background-color', res.team[i].color);
							$('.main-score-pane div:first-child').html(res.team[i].abbr);
						}
					}

					for (let j = 0, k = 1; j < res.inning_data.batting.length; j++, k++) {
						if (res.inning_data.batting[j].status == "not out") {
							$(`#batsman${k} .name`).html(res.inning_data.batting[j].name.split(' ')[0].substring(0, 1) + '. ' + res.inning_data.batting[j].name.split(' ')[1].toUpperCase());
							$(`#batsman${k} .runs`).html(res.inning_data.batting[j].runs);
							$(`#batsman${k} .balls`).html(res.inning_data.batting[j].balls);
							if (res.inning_data.batting[j].strike) {
								$(`#batsman${k} span:last-child`).show();
								striker = res.inning_data.batting[j].name;
							} else {
								$(`#batsman${k} span:last-child`).hide();
							}
						}
					}

					for (let j = 0; j < res.inning_data.bowling.length; j++) {
						if (res.inning_data.bowling[j].name == res.inning_data.timeline[res.inning_data.timeline.length - 1].name) {
							bowler = res.inning_data.bowling[j].name;
							$("#bowler .name").html(res.inning_data.bowling[j].name.split(' ')[0].substring(0, 1) + '. ' + res.inning_data.bowling[j].name.split(' ')[1].toUpperCase());
							$("#bowler .runs").html(res.inning_data.bowling[j].runs);
							$("#bowler .wickets").html(res.inning_data.bowling[j].wickets);
							$("#bowler .overs").html(parseFloat(res.inning_data.bowling[j].overs).toFixed(1));
						}
					}

					runs = parseInt(res.inning_data.runs);
					$(".main-score-pane .runs").html(runs);
					wickets = parseInt(res.inning_data.wickets);
					$(".main-score-pane .wickets").html(wickets);
					overs = parseFloat(res.inning_data.overs);
					over_counter = parseInt(overs.toFixed(1).split('.')[1]);
					$(".main-score-pane .overs").html(overs.toFixed(1));
					$("#run-rate").html((overs == 0 ? 0 : runs / (parseInt(overs.toFixed(1).split('.')[0]) + over_counter / 6)).toFixed(2));

					for (let i = 0; i < res.inning_data.timeline.length; i++) {
						for (let j = 0; j < res.inning_data.timeline[i].balls.length; j++) {
							let run = res.inning_data.timeline[i].balls[j];
							if (/^\d+$/.test(run)) {
								if (run == "0")
									run = "•";
								$("#scroller").append(`<div class="balls">${run}</div>`);
							} else {
								$("#scroller").append(`<div class="balls extras">${run}</div>`);
							}
						}
						if (i != res.inning_data.timeline.length - 1)
							$("#scroller").append(`<div id="oc">${i + 1}</div>`);
					}
					$('#preloader').css('display', 'none');
				});
			});
	}
});

async function fetch_scorecard(inn) {
	await fetch('/live-scorecard/fetch-scorecard', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			db: db,
			title: title,
			inning: inn
		})
	})
		.then((res) => res.json())
		.then((res) => {
			for (let j = 0, k = 1; j < res.batting.length; j++, k++) {
				let name = res.batting[j].name;
				if (res.bat_team.players[res.bat_team.captain].name == name)
					name += " (C)";
				if (res.bat_team.players[res.bat_team.vice_captain].name == name)
					name += " (VC)";
				if (res.bat_team.players[res.bat_team.keeper].name == name)
					name += " (WK)";
				$(`#tab${inn} .shadow:first-child .score-table`).append(`
					<tr>
						<td>${name}<br>
							<span class="batsman-status">${res.batting[j].status}</span>
						</td>
						<td>${res.batting[j].runs}</td>
						<td>${res.batting[j].balls}</td>
						<td>${res.batting[j].fours}</td>
						<td>${res.batting[j].sixes}</td>
						<td>${(res.batting[j].balls == 0 ? 0 : (res.batting[j].runs / res.batting[j].balls * 100)).toFixed(2)}</td>
					</tr>
				`);
			}

			let yet_to_bat = "";
			res.bat_team.players.forEach((ele) => {
				if (res.batting.findIndex(bat => bat.name == ele.name) == -1) {
					yet_to_bat += ele.name;
					if (res.bat_team.players[res.bat_team.captain] == ele)
						yet_to_bat += " (C)";
					if (res.bat_team.players[res.bat_team.vice_captain] == ele)
						yet_to_bat += " (VC)";
					if (res.bat_team.players[res.bat_team.keeper] == ele)
						yet_to_bat += " (WK)";
					yet_to_bat += " • ";
				}
			});

			$(`#tab${inn} .shadow:first-child .score-table`).append(`
				<tr class="stats">
					<td>Extras</td>
					<td>${res.extras.wide + res.extras.no_ball + res.extras.bye + res.extras.leg_bye + res.extras.penalty}</td>
					<td colspan="4">(${res.extras.wide} wd, ${res.extras.no_ball} nb, ${res.extras.leg_bye} lb, ${res.extras.bye} b, ${res.extras.penalty} p)</td>
				</tr>
				<tr class="stats">
					<td>Total Runs</td>
					<td>${res.runs}</td>
					<td colspan="4">(${res.wickets} wkts, ${res.overs} ov)</td>
				</tr>
				<tr class="yet-to-bat">
					<td colspan="6">Yet to Bat<br>
						<span class="batsman-status">${yet_to_bat.substring(0, yet_to_bat.length - 3)}</span>
					</td>
				</tr>
			`);

			for (let j = 0; j < res.bowling.length; j++) {
				$(`#tab${inn} .shadow:last-child .score-table`).append(`
					<tr>
						<td>${res.bowling[j].name}</td>
						<td>${res.bowling[j].overs.toFixed(1)}</td>
						<td>${res.bowling[j].maidens}</td>
						<td>${res.bowling[j].runs}</td>
						<td>${res.bowling[j].wickets}</td>
						<td>${(res.bowling[j].overs == 0 ? 0 : res.bowling[j].runs / (parseInt(res.bowling[j].overs.toFixed(1).split('.')[0]) + parseInt(res.bowling[j].overs.toFixed(1).split('.')[1]) / 6)).toFixed(2)}</td>
					</tr>
				`);
			}
		});
}

async function fetch_players_popup(team, status) {
	await fetch('/live-scorecard/fetch-players-popup', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			db: db,
			team: team
		})
	})
		.then((res) => res.json())
		.then((res) => {
			for (let j = 0; j < res.players.length; j++) {
				$(".players").append(`<li><p>${res.players[j].name}</p><span class="material-symbols-rounded">done</span></li>`);
				if (res.captain == j)
					$(".players li p").eq(j).append(" (C)");
				if (res.vice_captain == j)
					$(".players li p").eq(j).append(" (VC)");
				if (res.keeper == j)
					$(".players li p").eq(j).append(" (WK)");
			}
			$('.team-name span').html(res.name);
			$('.team-name span').css('color', res.color);
			$('.team-name div').css('background-color', res.color);
			$(".players-popup li").css('border-left', `3px solid ${res.color}`);
			$(".players-popup .info").css('color', res.color);
			$(".players-popup li").click(function (event) {
				if ($(this).find('span').css('visibility') == 'hidden') {
					$(this).addClass('active');
					$(this).css('color', res.color);
					$(this).find('span').css('visibility', 'visible');
				} else {
					$(this).removeClass('active');
					$(this).css('color', 'black');
					$(this).find('span').css('visibility', 'hidden');
				}
			});
			$(".players-popup li").click(function (event) {
				if ($(".players-popup li.active").length == 1) {
					for (let j = 0; j < 11; j++) {
						if (!$(".players-popup li").eq(j).hasClass("active")) {
							$(".players-popup li").eq(j).addClass("disabled");
						}
					}
				} else {
					$(".players-popup li").removeClass("disabled");
					for (let j = 0; j < res.players.length; j++) {
						if (res.players[j].bowl == "none" || res.players[j].name == bowler) {
							$(".players-popup li").eq(j).addClass("disabled");
						}
					}
				}
			});
			for (let j = 0; j < res.players.length; j++) {
				if (res.players[j].bowl == "none" || res.players[j].name == bowler) {
					$(".players-popup li").eq(j).addClass("disabled");
				}
			}
		});
}

// custom runs validation
$('.custom-tick').click(function (event) {
	if ($('#custom-runs').hasClass('active'))
		custom_runs = parseInt($('#custom-runs').val());
	else
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			html: 'Invalid Custom runs!<br>Custom runs should be between 10 and 300',
			confirmButtonText: 'OK',
			confirmButtonColor: '#4153f1'
		});
});

$('#custom-runs').on("input", function (event) {
	let runs = $(this).val().trim();
	if (runs == "") {
		$(this).css('border', '2px solid var(--primary-color)')
		$(this).removeClass('active');
	} else if (/^\d+$/.test(runs) && parseInt(runs) >= 10 && parseInt(runs) <= 300) {
		$(this).css('border', '2px solid green');
		$(this).addClass('active');
	} else {
		$(this).css('border', '2px solid red');
		$(this).removeClass('active');
	}
});

$(".runs-area").eq(0).find(".run-btn").click(function (event) {
	$(".runs-area").eq(0).find(".run-btn").removeClass('active');
	$(this).addClass('active');
});

$(".runs-area").eq(0).find(".run-btn").add(".custom-tick").click(async function () {
	let runs_scored;
	let compliment = "";
	if (custom_runs == -1) {
		runs_scored = parseInt($(this).hasClass("active") ? $(this).html() : -1);
		if (runs_scored == 4 || runs_scored == 6)
			compliment = compliments[Math.floor(Math.random() * compliments.length)];
	} else {
		runs_scored = custom_runs;
		$("#custom-runs").val("");
		$("#custom-runs").css('border', '2px solid var(--primary-color)');
		custom_runs = -1;
	}

	if (runs_scored != -1) {
		over_counter++;
		if (over_counter == 6) {
			over_counter = 0;
			overs += 0.5;
		} else {
			overs += 0.1;
		}
		await fetch('/live-scorecard/add-runs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				db: db,
				title: title,
				inning: inning,
				runs: runs_scored,
				overs: overs,
				striker: striker,
				bowler: bowler
			})
		})
			.then((res) => res.json())
			.then(async (res) => {
				if (res.updated) {
					Swal.fire({
						icon: "success",
						title: `${runs_scored} Runs`,
						text: compliment,
						showConfirmButton: false,
						timer: 1500
					}).then(async function () {
						if (overs % 1 == 0) {
							if (res.match.overs == overs) {
								Swal.fire({
									icon: 'info',
									title: 'End of Innings...',
									html: `Total Score: ${res.match.runs}<br>Target: ${res.match.runs + 1}`,
									confirmButtonText: 'OK',
									confirmButtonColor: '#4153f1'
								})
								window.location.replace(`/start-match?id=${id}`)
							} else
								await fetch_players_popup(bowling_team).then(() => $(".overlay").css("display", "flex"));
						} else {
							window.location.reload();
						}
					});
				}
			});
	}

});

$(".players-popup .info button").click(async function (event) {
	if ($(".players-popup li.active").length == 0) {
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			html: 'Select a player!',
			confirmButtonText: 'OK',
			confirmButtonColor: '#4153f1'
		})
	} else {
		await fetch('/live-scorecard/change-bowler', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				db: db,
				title: title,
				inning: inning,
				prev_bowler: bowler,
				new_bowler: $(".players-popup li.active p").html().indexOf("(") == -1 ? $(".players-popup li.active p").html() : $(".players-popup li.active p").html().slice(0, $(".players-popup li.active p").html().indexOf("(") - 1)
			})
		})
			.then((res) => res.json())
			.then(async (res) => {
				if (res.updated)
					window.location.reload();
			});
	}
});

$(".wickets-area .wicket-btn").click(function (event) {
	Swal.fire({
		icon: 'info',
		title: 'Wicket!',
		confirmButtonText: 'OK',
		confirmButtonColor: '#4153f1'
	})
});

$(".extras-area .extras-btn").click(function (event) {
	$(this).toggleClass("active");
	let active_ele = $(this);
	Array.from($(".extras-area .extras-btn")).forEach(function (ele) {
		if ($(ele).html() != active_ele.html())
			$(ele).removeClass("active");
	});
	if ($(".extras-area .extras-btn").hasClass("active"))
		$(".extras-dropdown").addClass("active");
	else
		$(".extras-dropdown").removeClass("active");
});

$(".extras-dropdown .run-btn, .extras-dropdown .custom-tick").click(function (event) {
	Swal.fire({
		icon: 'info',
		title: 'Wide!',
		confirmButtonText: 'OK',
		confirmButtonColor: '#4153f1'
	})
});