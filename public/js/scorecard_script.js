let cookies = document.cookie.split(';');
let db = cookies[0].substring(cookies[0].indexOf('=') + 1);
let id = new URLSearchParams(window.location.search).get('id');
let title, inning;

// disabling preloader
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

			await fetch('/live-scorecard/fetch-details', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					db: db,
					id: id
				})
			})
				.then((res) => res.json())
				.then((res) => {
					title = res.match_info.title;
					inning = res.inning_data.inning;
					$(document).prop('title', `${title} - ${res.team[0].abbr} vs ${res.team[1].abbr} Live Scorecard - SCORE-GO`);
					$("#date").html(res.match_info.date);
					$("#match-title").html(`${title} - `);
					if (inning == 1)
						$("#inning").html("1st Innings");
					else
						$("#inning").html("2nd Innings");
					$("#venue").html(res.match_info.venue);

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
						for (let j = 0, k = 1; j < res.inning_data.batting.length; j++, k++) {
							if (res.inning_data.batting[j].status == "not out") {
								$(`#batsman${k} .name`).html(res.inning_data.batting[j].name.split(' ')[0].substring(0, 1) + '. ' + res.inning_data.batting[j].name.split(' ')[1].toUpperCase());
								$(`#batsman${k} .runs`).html(res.inning_data.batting[j].runs);
								$(`#batsman${k} .balls`).html(res.inning_data.batting[j].balls);
								if (res.inning_data.batting[j].strike)
									$(`#batsman${k} span:last-child`).show();
								else
									$(`#batsman${k} span:last-child`).hide();
							}
						}
						for (let j = 0; j < res.inning_data.bowling.length; j++) {
							if (res.inning_data.bowling[j].name == res.inning_data.timeline[res.inning_data.timeline.length - 1].name) {
								$("#bowler .name").html(res.inning_data.bowling[j].name.split(' ')[0].substring(0, 1) + '. ' + res.inning_data.bowling[j].name.split(' ')[1].toUpperCase());
								$("#bowler .runs").html(res.inning_data.bowling[j].runs);
								$("#bowler .wickets").html(res.inning_data.bowling[j].wickets);
								$("#bowler .overs").html(parseFloat(res.inning_data.bowling[j].overs));
							}
						}

					}
				})

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

			$('#preloader').css('display', 'none');
		}
	}
})

// custom runs validation
let custom_runs = $('#custom-runs');
$('#custom-tick').click((event) => {
	let runs = parseInt(custom_runs.val());
	if (custom_runs.val() === '' || runs < 1 || runs > 300)
		custom_runs.css('border', '2px solid red');
	else
		custom_runs.css('border', '2px solid var(--primary-color)');
});

function switchTab(index) {
	$('.tab-container').css('margin-left', `calc(-${$('.scorecard-section').css('width')} * ${index})`);
	$('.inningButtons button').removeClass('active');
	$('#hline').css('margin-left', `calc(${$('.inningButtons button').css('width')} * ${index})`);
	$('.inningButtons button').eq(index).addClass('active');
}