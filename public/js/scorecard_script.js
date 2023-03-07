let cookies = document.cookie.split(';');
let db = cookies[0].substring(cookies[0].indexOf('=') + 1);
let id = new URLSearchParams(window.location.search).get('id');
let title, inning, runs, wickets, overs, over_counter, strike;
let custom_runs = -1;
let compliments = ["Great Shot!", "That was class!", "What a shot!", "That was a beauty!", "What a hit!", "Perfect placement!", "Sweet stroke!", "Terrific technique!", "Great form!", "Spellbounded!"];

// adding run buttons
for (let i = 0; i < 10; i++) {
	if (i == 1)
		$('.runs-area').append(`<button class='run-btn' style='padding: 4px 11px;' id='${i}'>${i}</button>`);
	else
		$('.runs-area').append(`<button class='run-btn' id='${i}'>${i}</button>`);
}
$('.runs-area').append(`<div class="custom-runs"><input type="text" title="Enter custom runs here" name="custom-runs" id="custom-runs" required><span class="material-icons" id="custom-tick">check_circle</span></div>`);

// adding wickets
let wicket_types = ['Bowled', 'LBW', 'Caught', 'Run-Out', 'Stumped', 'Hit-Wicket', 'Timed-Out', 'Retired', 'Mankading', 'Hit-The-Ball-Twice', 'Obstructing-The-Field'];
wicket_types.forEach(wicket => {
	$('.wicket-area').append(`<button class="run-btn wicket-btns">${wicket}</button>`);
});

// adding extras
let extras = ['WD', 'NB', 'B', 'LB', 'Penalty'];
extras.forEach(extra => {
	$('.extras-area').append(`<button class="run-btn extras-btns">${extra}</button>`);
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
		let flag = false;
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
			.then((res) => { flag = res.exists })
		if (flag == false) {
			window.location.replace("/dashboard")
		} else {
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
					$(document).prop('title', `${title} - ${res.team[0].abbr} vs ${res.team[1].abbr} Live Scorecard - SCORE-GO`);
					$("#date").html(res.match_info.date);
					$("#match-title").html(`${title} - `);
					$("#venue").html(res.match_info.venue);
					if (inning == 1) {
						$("#inning").html("1st Innings");
						let i = res.inning_data.bowl == res.team[0].name ? 0 : 1;
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
						await fetch('/live-scorecard/fetch-inning1-data', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								db: db,
								title: title,
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
									$(`#tab1 .shadow:first-child .score-table`).append(`
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

								$(`#tab1 .shadow:first-child .score-table`).append(`
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
									$(`#tab1 .shadow:last-child .score-table`).append(`
										<tr>
											<td>${res.bowling[j].name}</td>
											<td>${res.bowling[j].overs}</td>
											<td>${res.bowling[j].maidens}</td>
											<td>${res.bowling[j].runs}</td>
											<td>${res.bowling[j].wickets}</td>
											<td>${(res.bowling[j].overs == 0 ? 0 : res.bowling[j].runs / (parseInt(res.bowling[j].overs.toString().split('.')[0]) + parseInt(res.bowling[j].overs.toString().split('.')[1]) / 6)).toFixed(2)}</td>
										</tr>
									`);
								}
							});
					}

					fetch_inning_details().then(() => {
						for (let i = 0; i < 2; i++) {
							$(`#t${i + 1}-block .team-name`).html(res.team[i].name);
							$('.inningButtons button').eq(i).html(res.team[i].name);
							$(`.c${i + 1} tr th`).css('background-color', res.team[i].color);
							$(`.c${i + 1} tr:last-child td`).css('border-bottom', `3px solid ${res.team[i].color}`);
							$(`.c${i + 1} tr:nth-child(odd)`).css('background-color', res.team[i].color + '30');
							if (res.match_info.toss == res.team[i].name)
								$("#toss").html(res.team[i].abbr);
							if (res.inning_data.bat == res.team[i].name) {
								$(`#t${i + 1}-block div img`).attr("src", "../img/bat-icon.ico");
								$(`#t${i + 1}-block div`).css("background-color", res.team[i].color);
								$(`#t${1 - i + 1}-block div img`).attr("src", "../img/ball-icon.ico");
								$(`#t${1 - i + 1}-block div`).css("background-color", res.team[1 - i].color);
								$('.main-score-pane').css({ 'border': `3px solid ${res.team[i].color}`, 'color': res.team[i].color });
								$('.main-score-pane div:nth-child(2)').css('background-color', res.team[i].color);
								$('.main-score-pane div:first-child').html(res.team[i].abbr);
								switchTab(i);
							}
						}
					});

					$('#preloader').css('display', 'none');
				});
		}
	}
});

// fetching inning details
async function fetch_inning_details() {
	await fetch('/live-scorecard/fetch-inning-details', {
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
			for (let j = 0, k = 1; j < res.batting.length; j++, k++) {
				let name = res.batting[j].name;
				if (res.bat_team.players[res.bat_team.captain].name == name)
					name += " (C)";
				if (res.bat_team.players[res.bat_team.vice_captain].name == name)
					name += " (VC)";
				if (res.bat_team.players[res.bat_team.keeper].name == name)
					name += " (WK)";
				$(`#tab${inning} .shadow:first-child .score-table`).append(`
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

				if (res.batting[j].status == "not out") {
					$(`#batsman${k} .name`).html(res.batting[j].name.split(' ')[0].substring(0, 1) + '. ' + res.batting[j].name.split(' ')[1].toUpperCase());
					$(`#batsman${k} .runs`).html(res.batting[j].runs);
					$(`#batsman${k} .balls`).html(res.batting[j].balls);
					if (res.batting[j].strike)
						$(`#batsman${k} span:last-child`).show();
					else
						$(`#batsman${k} span:last-child`).hide();
				}
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

			$(`#tab${inning} .shadow:first-child .score-table`).append(`
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
				$(`#tab${inning} .shadow:last-child .score-table`).append(`
					<tr>
						<td>${res.bowling[j].name}</td>
						<td>${res.bowling[j].overs}</td>
						<td>${res.bowling[j].maidens}</td>
						<td>${res.bowling[j].runs}</td>
						<td>${res.bowling[j].wickets}</td>
						<td>${(res.bowling[j].overs == 0 ? 0 : res.bowling[j].runs / (parseInt(res.bowling[j].overs.toString().split('.')[0]) + parseInt(res.bowling[j].overs.toString().split('.')[1]) / 6)).toFixed(2)}</td>
					</tr>
				`)

				if (res.bowling[j].name == res.timeline[res.timeline.length - 1].name) {
					$("#bowler .name").html(res.bowling[j].name.split(' ')[0].substring(0, 1) + '. ' + res.bowling[j].name.split(' ')[1].toUpperCase());
					$("#bowler .runs").html(res.bowling[j].runs);
					$("#bowler .wickets").html(res.bowling[j].wickets);
					$("#bowler .overs").html(parseFloat(res.bowling[j].overs).toFixed(1));
				}
			}

			runs = parseInt(res.runs);
			$(".main-score-pane .runs").html(runs);
			wickets = parseInt(res.wickets);
			$(".main-score-pane .wickets").html(wickets);
			overs = parseFloat(res.overs).toFixed(1);
			over_counter = parseInt(overs.toString().split('.')[1]);
			$(".main-score-pane .overs").html(overs);
			$("#run-rate").html((overs == 0 ? 0 : runs / (parseInt(overs.toString().split('.')[0]) + over_counter / 6)).toFixed(2));

			for (let i = 0; i < res.timeline.length; i++) {
				for (let j = 0; j < res.timeline[i].balls.length; j++) {
					let run = res.timeline[i].balls[j];
					if (/^\d+$/.test(run)) {
						if (run == "0")
							run = "•";
						$("#scroller").append(`<div class="balls">${run}</div>`);
					} else {
						$("#scroller").append(`<div class="balls extras">${run}</div>`);
					}
				}
				if (overs.toString().split('.')[1] == "0")
					$("#scroller").append(`<div id="oc">${i + 1}</div>`);
			}
		})
}

// custom runs validation
$('#custom-tick').click(function (event) {
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

$(".runs-area .run-btn, #custom-tick").click(async function () {
	let runs_scored;
	let compliment = "";
	if (custom_runs == -1) {
		runs_scored = parseInt($(this).html());
		if ($(this).html() == "4" || $(this).html() == "6")
			compliment = compliments[Math.floor(Math.random() * compliments.length)];
	} else {
		runs_scored = custom_runs;
		$("#custom-runs").val("");
		$("#custom-runs").css('border', '2px solid var(--primary-color)');
		custom_runs = -1;
	}
	over_counter++;
	if (over_counter == 6) {
		over_counter = 0;
		overs += 1;
	} else{
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
			ball: over_counter,
		})
	})
		.then((res) => res.json())
		.then((res) => {

			Swal.fire({
				icon: "success",
				title: `${runs_scored} Runs`,
				text: compliment,
				showConfirmButton: false,
				timer: 1500
			})
		});

	if (runs_scored % 2 != 0) {

	}

});