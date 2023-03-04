let cookies = document.cookie.split(';');
let db = cookies[0].substring(cookies[0].indexOf('=') + 1);
let id = new URLSearchParams(window.location.search).get('id');
let title, inning;

// disabling preloader
window.addEventListener('load', async (event) => {
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

			await fetch('/start-match/fetch-details', {
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
					inning = res.inning;
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

						if (res.bat == res.team[i].name) {
							$(`#t${i + 1}-block div img`).attr("src", "../img/bat-icon.ico");
							$(`#t${i + 1}-block div`).css("background-color", res.team[i].color);
							$(`#t${1 - i + 1}-block div img`).attr("src", "../img/ball-icon.ico");
							$(`#t${1 - i + 1}-block div`).css("background-color", res.team[1 - i].color);
							$('.main-score-pane').css({ 'border': `3px solid ${res.team[i].color}`, 'color': res.team[i].color });
							$('.main-score-pane div:nth-child(2)').css('background-color', res.team[i].color);
							$('.main-score-pane div:first-child').html(res.team[i].abbr);
						}
					}
				})

			// adding run buttons
			for (let i = 0; i < 10; i++) {
				if (i == 1)
					$('#runs-area').append(`<button class='run-btn' style='padding: 4px 11px;' id='${i}'>${i}</button>`);
				else
					$('#runs-area').append(`<button class='run-btn' id='${i}'>${i}</button>`);
			}
			$('#runs-area').append(`<input type="text" title="Enter custom runs here" name="custom-runs" id="custom-runs" required><span class="material-icons" id="custom-tick">check_circle</span>`);

			// adding wickets
			let wicket_types = ['Bowled', 'LBW', 'Caught', 'Run-Out', 'Stumped', 'Hit-Wicket', 'Timed-Out', 'Retired', 'Mankading', 'Hit-The-Ball-Twice', 'Obstructing-The-Field'];
			wicket_types.forEach(wicket => {
				$('#wicket-area').append(`<button class="run-btn wicket-btns">${wicket}</button>`);
			});

			// overs time-line height
			$('#overs-timeline').css('height', $('.scorecard-section').css('height'));

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
	$('.tab-container').css('margin-left', `calc(-780px * ${index})`);
	$('.inningButtons button').removeClass('active');
	$('#hline').css('margin-left', `calc(${$('.inningButtons button').css('width')} * ${index})`);
	$('.inningButtons button').eq(index).addClass('active');
}

$(document).ready(function () {
	let match_data = [
		{
			name: 'Chennai Super Kings',
			abbr: 'CSK',
			color: '#c5a402'
		},
		{
			name: 'Sunrisers Hyderabad',
			abbr: 'SRH',
			color: '#F75B39'
		}
	];

	// adding colors and team names
	for (let i = 0; i < 2; i++) {
		$(`.c${i + 1} tr th`).css('background-color', match_data[i].color);
		$(`.c${i + 1} tr:last-child td`).css('border-bottom', `3px solid ${match_data[i].color}`);
		$(`.c${i + 1} tr:nth-child(odd)`).css('background-color', match_data[i].color + '30');
	}



});

