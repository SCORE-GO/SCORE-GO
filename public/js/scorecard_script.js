let cookies = document.cookie.split(';');
let db = cookies[0].substring(cookies[0].indexOf('=') + 1);
let id = window.location.href.substring(window.location.href.lastIndexOf('/') + 1, window.location.href.lastIndexOf('?'));
let title, inning, runs, wickets, overs, over_counter, striker, non_striker, bowler, keeper, batting_team, bowling_team, target;
let custom_runs = custom_extras = -1;
let wicket = run_out = retired_hurt = false;
let compliments = ["Great Shot!", "That was class!", "What a shot!", "That was a beauty!", "What a hit!", "Perfect placement!", "Sweet stroke!", "Terrific technique!", "Great form!", "Spellbounded!"];
let bowling_comp = ["That was a beauty!", "What a delivery!", "That was a peach!", "What a ball!", "That was a ripper!", "Incredible bowling!", "Gone!"];
let caught_comp = ["Great catch!", "Brilliant catch!", "What a grab!", "That's a screamer!", "Great effort!", "Well-judged catch!", "Excellent fielding!", "That's a stunner!", "What a catch!"];
let run_out_comp = ["Brilliant fielding!", "What a run-out!", "That was precision!", "You made it look so easy!", "Excellent throw!", "Great work in the field!", "Superb fielding effort!", "Top-class fielding!", "Outstanding effort!"];

// adding run buttons
for (let i = 0; i < 10; i++) {
	if (i == 1)
		$('.runs-area').append(`<button class='run-btn' style='padding: 4px 11px;' id='${i}'>${i}</button>`);
	else
		$('.runs-area').append(`<button class='run-btn' id='${i}'>${i}</button>`);
}
$('.runs-area').append(`<div class="custom-runs"><input type="text" title="Enter custom runs here" name="custom-runs" class="custom-input" required><span class="material-icons custom-tick">check_circle</span></div>`);

// adding wickets
let wicket_types = ['Bowled', 'LBW', 'Caught', 'Run-Out', 'Stumped', 'Hit-Wicket', 'Timed-Out', 'Retired-Hurt', 'Mankading', 'Hit-The-Ball-Twice', 'Obstructing-The-Field'];
for (let i = 0; i < wicket_types.length; i++) {
	$('.wickets-area').append(`<button class="run-btn wicket-btn" name=${i}>${wicket_types[i]}</button>`);
}

// adding extras
let extras = [['WD', 'Wide'], ['NB', 'No Ball'], ['B', 'Byes'], ['LB', 'Leg Byes'], ['P', 'Penalty']];
extras.forEach(extra => {
	$('.extras-area').append(`<button class="run-btn extras-btn" name="${extra[1]}" title="${extra[1]}">${extra[0]}</button>`);
});

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
	if (document.cookie.search("db") == -1 && id != null) {
		db = CryptoJS.AES.decrypt(new URLSearchParams(window.location.search).get('id').toString(), 'scorego').toString(CryptoJS.enc.Utf8);
		$('.next-ball-section').hide();
	} else if (id == null)
		window.location.replace("/new-match")
	else {
		await fetch(`/live-scorecard/${id}/check-match`, {
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
				} else if (res.present)
					window.location.replace(`/match-summary?id=${id}`);
				else
					window.location.replace("/dashboard")

			})

		$(".profile-menu").load("/profile-menu");
	}
	await fetch(`/live-scorecard/${id}/fetch-match-info`, {
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
			res.team.forEach((ele) => {
				if (ele.name == bowling_team)
					keeper = ele.players[ele.keeper].name;
			});

			$(document).prop('title', `${title} - ${res.team[0].abbr} vs ${res.team[1].abbr} Live Scorecard - SCORE-GO`);
			$("#date").html(res.match_info.date);
			$("#match-title").html(`${title} - `);
			$("#venue").html(res.match_info.venue);
			$(".overs .info").html(res.match_info.overs);
			if (res.match_info.umpires[0] != res.match_info.umpires[1])
				$(".umpires .info").html(`${res.match_info.umpires[0]}, ${res.match_info.umpires[1]}`);
			if (inning == 1) {
				$('.required-rr, .remaining').hide();
				$("#inning").html("1st Innings");
				$(".target").hide();
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
				$("#target").html(res.target);
				$('.inningButtons button').eq(0).html(bowling_team);
				$('.inningButtons button').eq(1).html(batting_team);

				let rem_overs = res.inning_data.overs.toFixed(1).split('.')[1] == "0" ? res.match_info.overs - res.inning_data.overs : res.match_info.overs - res.inning_data.overs - 0.4;
				let rem_runs = res.target - res.inning_data.runs;
				$(".required-rr .info").html((rem_runs / (parseInt(rem_overs.toFixed(1).split('.')[0]) + parseInt(rem_overs.toFixed(1).split('.')[1]) / 6)).toFixed(2));
				$(".remaining span").html(res.inning_data.bat == res.team[0].name ? res.team[0].abbr : res.team[1].abbr);
				$(".remaining .info:first").html(rem_runs);
				$(".remaining .info:last").html(parseInt(rem_overs.toFixed(1).split('.')[0]) * 6 + parseInt(rem_overs.toFixed(1).split('.')[1]));

				await fetch_scorecard(2).then(() => switchTab(1))
			}

			await fetch_scorecard(1).then(async function () {
				if (parseInt($('.scorecard-section').css("height")) > parseInt($('.left-side').css("height"))) {
					$('.overs-timeline').css("height", $('.scorecard-section').css("height"));
					$('.left-side').css("height", $('.scorecard-section').css("height"));
				} else {
					$('.overs-timeline').css("height", $('.left-side').css("height"));
					$('.scorecard-section').css("height", $('.left-side').css("height"));
				}

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

				let k = 1;
				for (let j = 0; j < res.inning_data.batting.length; j++) {
					if (res.inning_data.batting[j].status == "not out") {
						$(`#batsman${k} .name`).html(res.inning_data.batting[j].name.split(' ')[0].substring(0, 1) + '. ' + res.inning_data.batting[j].name.split(' ')[1].toUpperCase());
						$(`#batsman${k} .runs`).html(res.inning_data.batting[j].runs);
						$(`#batsman${k} .balls`).html(res.inning_data.batting[j].balls);
						if (res.inning_data.batting[j].strike) {
							$(`#batsman${k} span:last-child`).show();
							striker = res.inning_data.batting[j].name;
						} else {
							non_striker = res.inning_data.batting[j].name;
							$(`#batsman${k} span:last-child`).hide();
						}
						k++;
					}
				}
				if (k != 3)
					await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));

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

				// setTimeout(() => {
				// 	Swal.fire({
				// 		title: 'Any Problem?',
				// 		text: "Not a single delivery has been bowled from 2 minutes...",
				// 		icon: 'question',
				// 		input: 'text',
				// 		inputPlaceholder: 'Enter your issue',
				// 		showCancelButton: true,
				// 		confirmButtonText: 'Will resume soon <i class="fa fa-thumbs-up"></i>',
				// 		cancelButtonText: 'Will take some more time <i class="fa fa-thumbs-down"></i>',
				// 		inputValidator: (value) => {
				// 			return new Promise((resolve) => {
				// 				if (value != '') {
				// 					resolve()
				// 				} else {
				// 					resolve('Please don\'t leave it blank!')
				// 				}
				// 			})
				// 		}
				// 	}).then(() => {
				// 		Swal.fire({
				// 			title: "Okay!",
				// 			icon: "success",
				// 			timer: 1000,
				// 			showConfirmButton: false
				// 		})
				// 	})
				// }, 120000)

				if ($('body').width() > 1100)
					$('#preloader').css('display', 'none');
			});
		});
});

async function fetch_scorecard(inn) {
	await fetch(`/live-scorecard/${id}/fetch-scorecard`, {
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
					<td>${res.extras.wide + res.extras.no_ball + res.extras.byes + res.extras.leg_byes + res.extras.penalty}</td>
					<td colspan="4">(${res.extras.wide} wd, ${res.extras.no_ball} nb, ${res.extras.leg_byes} lb, ${res.extras.byes} b, ${res.extras.penalty} p)</td>
				</tr>
				<tr class="stats">
					<td>Total Runs</td>
					<td>${res.runs}</td>
					<td colspan="4">(${res.wickets} wkts, ${res.overs} ov)</td>
				</tr>`);
			if (yet_to_bat != "")
				$(`#tab${inn} .shadow:first-child .score-table`).append(`
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
	if (status == "NEXT BATSMAN") {
		await fetch(`/live-scorecard/${id}/fetch-retired-hurt`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				db: db,
				title: title,
				inning: inning
			})
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.wickets + res.retired_hurt == 10 && res.retired_hurt != 0) {
					Swal.fire({
						title: 'Is retired hurt batsman available?',
						showDenyButton: true,
						showCancelButton: false,
						confirmButtonText: 'Yes',
						denyButtonText: 'No',
						allowOutsideClick: false
					}).then(async (result) => {
						if (result.isDenied) {
							retired_hurt = true;
							await check_end_match();
							await check_end_of_innings();
						}
					})
				}
			})
	}

	await fetch(`/live-scorecard/${id}/fetch-players-popup`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			db: db,
			title: title,
			inning: inning,
			team: team
		})
	})
		.then((res) => res.json())
		.then((res) => {
			$('.players-popup .status').html(status);
			$(".players").html("");
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
					if (status == "OVER COMPLETE") {
						for (let j = 0; j < res.players.length; j++) {
							if (res.players[j].bowl == "none" || res.players[j].name == bowler) {
								$(".players-popup li").eq(j).addClass("disabled");
							}
						}
					} else if (status == "NEXT BATSMAN") {
						for (let j = 0; j < res.players.length; j++) {
							for (let k = 0; k < res.batting.length; k++) {
								if (res.players[j].name == res.batting[k].name && res.batting[k].status != "retired hurt") {
									$(".players-popup li").eq(j).addClass("disabled");
									break;
								}
							}
						}
					}
				}
			});
			if (status == "OVER COMPLETE") {
				$('.info span').html('SELECT BOWLER');
				for (let j = 0; j < res.players.length; j++) {
					if (res.players[j].bowl == "none" || res.players[j].name == bowler) {
						$(".players-popup li").eq(j).addClass("disabled");
					}
				}
			} else if (status == "NEXT BATSMAN") {
				$('.info span').html('SELECT BATSMAN');
				for (let j = 0; j < res.players.length; j++) {
					for (let k = 0; k < res.batting.length; k++) {
						if (res.players[j].name == res.batting[k].name && res.batting[k].status != "retired hurt") {
							$(".players-popup li").eq(j).addClass("disabled");
							break;
						}
					}
				}
			}
		});
	return
}

async function check_end_match() {
	if (inning == 2) {
		await fetch(`/live-scorecard/${id}/check-end-match`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				db: db,
				title: title,
				retired_hurt: retired_hurt
			})
		})
			.then((res) => res.json())
			.then(async (res) => {
				if (res.end) {
					await Swal.fire({
						icon: 'info',
						title: 'End of Match!',
						html: res.result,
						confirmButtonText: 'OK',
						confirmButtonColor: '#4153f1',
						allowOutsideClick: false
					}).then(async (result) => {
						if (result.isConfirmed) window.location.replace(`/match-summary?id=${id}`)
					});
				}
			});
	}
}

async function check_end_of_innings() {
	if (inning == 1) {
		await fetch(`/live-scorecard/${id}/check-end-of-innings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				db: db,
				title: title,
				inning: inning
			})
		})
			.then((res) => res.json())
			.then(async function (res) {
				if (wicket && res.retired_hurt != 0) {
					await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));
				}
				if (res.match_overs == res.inning_overs || res.wickets + res.retired_hurt == 10) {
					Swal.fire({
						icon: 'info',
						title: 'End of Innings!',
						html: `<b>Total Score:</b> ${res.runs}<br><b>Target:</b> ${res.runs + 1}`,
						confirmButtonText: 'OK',
						confirmButtonColor: '#4153f1',
						allowOutsideClick: false
					}).then(() => window.location.replace(`/start-match?id=${id}`));
				}
			});
	}
}

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
		switch ($(".players-popup .status").html()) {
			case "OVER COMPLETE":
				await fetch(`/live-scorecard/${id}/change-bowler`, {
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
						if (res.updated) {
							if (wicket) {
								$(".overlay").css("display", "none");
								await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));
							} else
								window.location.reload();
						}
					});
				break;
			case "NEXT BATSMAN":
				await fetch(`/live-scorecard/${id}/change-batsman`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						db: db,
						title: title,
						inning: inning,
						overs: overs,
						run_out: run_out,
						name: $(".players-popup li.active p").html().indexOf("(") == -1 ? $(".players-popup li.active p").html() : $(".players-popup li.active p").html().slice(0, $(".players-popup li.active p").html().indexOf("(") - 1)
					})
				})
					.then((res) => res.json())
					.then((res) => {
						if (res.updated)
							window.location.reload();
					});
				break;
		}
	}
});

// custom runs validation
$('.runs-area').eq(0).find('.custom-tick').click(function (event) {
	if ($('.runs-area').eq(0).find('.custom-input').hasClass('active'))
		custom_runs = parseInt($('.runs-area').eq(0).find('.custom-input').val());
	else
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			html: 'Invalid Custom runs!<br>Custom runs should be between 10 and 300',
			confirmButtonText: 'OK',
			confirmButtonColor: '#4153f1'
		});
});

$('.extras-dropdown .custom-tick').click(function (event) {
	if ($('.extras-dropdown .custom-input').hasClass('active'))
		custom_extras = parseInt($('.extras-dropdown .custom-input').val());
	else
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			html: 'Invalid Custom runs!<br>Custom runs should be between 10 and 300',
			confirmButtonText: 'OK',
			confirmButtonColor: '#4153f1'
		});
});

$('.custom-input').on("input", function (event) {
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

$(".runs-area").find(".run-btn").click(function (event) {
	$(".runs-area").eq(0).find(".run-btn").removeClass('active');
	$(this).addClass('active');
});

$(".runs-area").eq(0).find(".run-btn, .custom-tick").click(async function () {
	let runs_scored;
	let compliment = "";
	if (custom_runs == -1) {
		runs_scored = parseInt($(this).hasClass("active") ? $(this).html() : -1);
		if (runs_scored == 4 || runs_scored == 6)
			compliment = compliments[Math.floor(Math.random() * compliments.length)];
	} else {
		runs_scored = custom_runs;
		$(".runs-area").eq(0).find(".custom-input").val("");
		$(".runs-area").eq(0).find(".custom-input").css('border', '2px solid var(--primary-color)');
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
		await fetch(`/live-scorecard/${id}/add-runs`, {
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
						await check_end_match();
						await check_end_of_innings();
						if (overs % 1 == 0)
							await fetch_players_popup(bowling_team, "OVER COMPLETE").then(() => $(".overlay").css("display", "flex"));
						else
							window.location.reload();
					});
				}
			});
	}
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

$(".extras-dropdown").find(".run-btn, .custom-tick").click(async function (event) {
	let runs_scored;
	if (custom_extras == -1) {
		runs_scored = parseInt($(this).hasClass("active") ? $(this).html() : -1);
	} else {
		runs_scored = custom_extras;
		$(".extras-dropdown .custom-input").val("");
		$(".extras-dropdown .custom-input").css('border', '2px solid var(--primary-color)');
		custom_extras = -1;
	}
	if ($(".extras-area .extras-btn").hasClass("active") && runs_scored != -1) {
		if (new Array("Wide", "No Ball").includes($(".extras-area .extras-btn.active").attr("name"))) {
			await fetch(`/live-scorecard/${id}/add-extras1`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					db: db,
					title: title,
					inning: inning,
					runs: runs_scored,
					striker: striker,
					bowler: bowler,
					extra_type: $(".extras-area .extras-btn.active").html()
				})
			})
				.then((res) => res.json())
				.then(async (res) => {
					if (res.updated) {
						Swal.fire({
							icon: 'success',
							title: `${$(".extras-area .extras-btn.active").attr("name")} - ${runs_scored} Runs`,
							showConfirmButton: false,
							timer: 1500
						}).then(async function () {
							await check_end_match();
							await check_end_of_innings();
							window.location.reload();
						});
					}
				});
		} else {
			over_counter++;
			if (over_counter == 6) {
				over_counter = 0;
				overs += 0.5;
			} else {
				overs += 0.1;
			}
			await fetch(`/live-scorecard/${id}/add-extras2`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					db: db,
					title: title,
					inning: inning,
					runs: runs_scored,
					overs: overs,
					striker: striker,
					bowler: bowler,
					extra_type: $(".extras-area .extras-btn.active").html()
				})
			})
				.then((res) => res.json())
				.then(async (res) => {
					if (res.updated) {
						Swal.fire({
							icon: 'success',
							title: `${$(".extras-area .extras-btn.active").attr("name")} - ${runs_scored} Runs`,
							showConfirmButton: false,
							timer: 1500
						}).then(async function () {
							await check_end_match();
							await check_end_of_innings();
							if (overs % 1 == 0)
								await fetch_players_popup(bowling_team, "OVER COMPLETE").then(() => $(".overlay").css("display", "flex"));
							else
								window.location.reload();
						});
					}
				});
		}
	}
});

$(".wickets-area .wicket-btn").click(async function (event) {
	$(this).addClass('active');
	wicket = true;
	let wicket_index = parseInt($(this).attr("name"));
	let status;
	switch (wicket_index) {
		case 0:
		case 1:
		case 2:
		case 4:
		case 5:
			if (wicket_index == 0) status = `(b) ${bowler}`;
			else if (wicket_index == 1) status = `lbw (b) ${bowler}`;
			else if (wicket_index == 4) status = `(st) ${keeper} (b) ${bowler}`;
			else if (wicket_index == 5) status = `hit wicket (b) ${bowler}`;
			else if (wicket_index == 2) {
				await fetch(`/live-scorecard/${id}/fetch-players-popup`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						db: db,
						title: title,
						inning: inning,
						team: bowling_team,
					})
				})
					.then((res) => res.json())
					.then(async function (res) {
						let players = {};
						res.players.forEach((ele) => players[ele.name] = ele.name)
						const { value: fielder } = await Swal.fire({
							title: "Wicket!",
							text: caught_comp[Math.floor(Math.random() * caught_comp.length)],
							input: 'select',
							inputOptions: players,
							inputPlaceholder: "Caught By",
							showCancelButton: true,
							inputValidator: (value) => {
								return new Promise((resolve) => {
									if (value != '') {
										resolve()
									} else {
										resolve('Please select a player')
									}
								})
							}
						})
						if (fielder != undefined)
							status = `(c) ${fielder} (b) ${bowler}`;
						else
							return;
					});
			}

			over_counter++;
			if (over_counter == 6) {
				over_counter = 0;
				overs += 0.5;
			} else {
				overs += 0.1;
			}

			await fetch(`/live-scorecard/${id}/add-wicket`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					db: db,
					title: title,
					inning: inning,
					bowler: bowler,
					overs: overs,
					status: status
				})
			})
				.then((res) => res.json())
				.then(async (res) => {
					if (res.updated) {
						Swal.fire({
							icon: "success",
							title: "Wicket!",
							text: bowling_comp[Math.floor(Math.random() * bowling_comp.length)],
							showConfirmButton: false,
							timer: 1500
						}).then(async function () {
							await check_end_match();
							await check_end_of_innings();
							if (overs % 1 == 0) {
								await fetch_players_popup(bowling_team, "OVER COMPLETE").then(() => $(".overlay").css("display", "flex"));
							} else
								await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));
						});
					}
				});
			break;
		case 3:
			await fetch(`/live-scorecard/${id}/fetch-players-popup`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					db: db,
					title: title,
					inning: inning,
					team: bowling_team,
				})
			})
				.then((res) => res.json())
				.then(async function (res) {
					let players = {};
					res.players.forEach((ele) => players[ele.name] = ele.name)
					const { value: fielder } = await Swal.fire({
						title: "Wicket!",
						input: 'select',
						inputOptions: players,
						text: "Run Out By",
						showCancelButton: true,
						inputValidator: (value) => {
							return new Promise((resolve) => {
								if (value != '') {
									resolve()
								} else {
									resolve('Please select a player')
								}
							})
						}
					})
					const { value: batsman } = await Swal.fire({
						title: "Wicket!",
						input: 'select',
						text: "Select Batsman Out",
						inputOptions: { [striker]: striker, [non_striker]: non_striker },
						showCancelButton: true
					})
					const { value: ball } = await Swal.fire({
						title: "Wicket!",
						html: "<B>Select Delivery Type</B>",
						input: 'radio',
						inputOptions: ["Normal", "No Ball"],
						showCancelButton: false
					})
					const { value: run_out_runs } = await Swal.fire({
						title: "Wicket!",
						text: "Enter runs completed before run out",
						input: 'number',
						showCancelButton: false,
						inputValidator: (value) => {
							return new Promise((resolve) => {
								if (value != '') {
									resolve()
								} else {
									resolve('Please enter runs completed')
								}
							})
						}
					})
					if (fielder != undefined && batsman != undefined && ball != undefined && runs != undefined) {
						run_out = true;
						let status = `(run out) ${fielder}`;
						if (ball == 0) {
							over_counter++;
							if (over_counter == 6) {
								over_counter = 0;
								overs += 0.5;
							} else {
								overs += 0.1;
							}
							await fetch(`/live-scorecard/${id}/run-out1`, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									db: db,
									title: title,
									inning: inning,
									striker: striker,
									batsman: batsman,
									bowler: bowler,
									runs: parseInt(run_out_runs),
									overs: overs,
									status: status
								})
							})
								.then((res) => res.json())
								.then(async (res) => {
									if (res.updated) {
										Swal.fire({
											icon: "success",
											title: "Wicket!",
											text: run_out_comp[Math.floor(Math.random() * run_out_comp.length)],
											showConfirmButton: false,
											timer: 1500
										}).then(async function () {
											await check_end_match();
											await check_end_of_innings();
											if (overs % 1 == 0)
												await fetch_players_popup(bowling_team, "OVER COMPLETE").then(() => $(".overlay").css("display", "flex"));
											else
												await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));
										});
									}
								});
						} else {
							await fetch(`/live-scorecard/${id}/run-out2`, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									db: db,
									title: title,
									inning: inning,
									striker: striker,
									batsman: batsman,
									bowler: bowler,
									runs: parseInt(run_out_runs),
									status: status
								})
							})
								.then((res) => res.json())
								.then(async (res) => {
									if (res.updated) {
										Swal.fire({
											icon: "success",
											title: "Wicket!",
											text: run_out_comp[Math.floor(Math.random() * run_out_comp.length)],
											showConfirmButton: false,
											timer: 1500
										}).then(async function () {
											await check_end_match();
											await check_end_of_innings();
											await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));
										});
									}
								});
						}
					}
				});
			break;
		case 6:
		case 8:
			if (wicket_index == 6) status = `timed out`;
			else if (wicket_index == 8) status = `run out (mankading)`;

			const { value: batsman } = await Swal.fire({
				title: "Wicket!",
				input: 'select',
				text: "Select Batsman Out",
				inputOptions: { [striker]: striker, [non_striker]: non_striker },
				showCancelButton: true
			})

			if (batsman != undefined) {
				run_out = true;
				fetch(`/live-scorecard/${id}/wicket-without-ball`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						db: db,
						title: title,
						inning: inning,
						batsman: batsman,
						status: status
					})
				})
					.then((res) => res.json())
					.then(async (res) => {
						if (res.updated) {
							Swal.fire({
								icon: "success",
								title: "Wicket!",
								text: "Unlucky!",
								showConfirmButton: false,
								timer: 1500
							}).then(async function () {
								await check_end_match();
								await check_end_of_innings();
								await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));
							});
						}
					});
			}
			break;
		case 7:
			const { value: batsman2 } = await Swal.fire({
				title: "Retired Hurt!",
				input: 'select',
				text: "Select Batsman Hurt",
				inputOptions: { [striker]: striker, [non_striker]: non_striker },
				showCancelButton: true
			})

			if (batsman2 != undefined) {
				run_out = true;
				await fetch(`/live-scorecard/${id}/retired-hurt`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						db: db,
						title: title,
						inning: inning,
						batsman: batsman2,
						status: "retired hurt"
					})
				})
					.then((res) => res.json())
					.then(async (res) => {
						if (res.updated) {
							Swal.fire({
								icon: "success",
								title: "Retired Hurt!",
								text: "Get Well Soon!",
								showConfirmButton: false,
								timer: 1500
							}).then(async function () {
								await check_end_match();
								await check_end_of_innings();
								await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));
							});
						}
					});
			}
			break;
		case 9:
		case 10:
			if (wicket_index == 9) status = `hit the ball twice`;
			else if (wicket_index == 10) status = `obstructing the field`;

			const { value: batter } = await Swal.fire({
				title: "Wicket!",
				input: 'select',
				text: "Select Batsman Out",
				inputOptions: { [striker]: striker, [non_striker]: non_striker },
				showCancelButton: true
			})
			const { value: run_out_runs } = await Swal.fire({
				title: "Wicket!",
				text: "Enter runs completed before wicket",
				input: 'number',
				showCancelButton: false,
				inputValidator: (value) => {
					return new Promise((resolve) => {
						if (value != '') {
							resolve()
						} else {
							resolve('Please enter runs completed')
						}
					})
				}
			})
			if (batter != undefined && run_out_runs != undefined) {
				run_out = true;
				over_counter++;
				if (over_counter == 6) {
					over_counter = 0;
					overs += 0.5;
				} else {
					overs += 0.1;
				}
				await fetch(`/live-scorecard/${id}/wicket-no-credit`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						db: db,
						title: title,
						inning: inning,
						striker: striker,
						batsman: batter,
						bowler: bowler,
						runs: parseInt(run_out_runs),
						overs: overs,
						status: status
					})
				})
					.then((res) => res.json())
					.then(async (res) => {
						if (res.updated) {
							Swal.fire({
								icon: "success",
								title: "Wicket!",
								text: "Not Expected!",
								showConfirmButton: false,
								timer: 1500
							}).then(async function () {
								await check_end_match();
								await check_end_of_innings();
								if (overs % 1 == 0)
									await fetch_players_popup(bowling_team, "OVER COMPLETE").then(() => $(".overlay").css("display", "flex"));
								else
									await fetch_players_popup(batting_team, "NEXT BATSMAN").then(() => $(".overlay").css("display", "flex"));
							});
						}
					});
			}
			break;
	}
});