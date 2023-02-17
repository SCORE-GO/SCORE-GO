let cookies = document.cookie.split(';');

// disabling preloader
window.addEventListener('load', (event) => {
	if (document.cookie.search("db") == -1)
		window.location.replace("/get-started")
	$(".profile-menu").load("/profile-menu");
	$('#preloader').css('display', 'none');
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


// let inningButtons = $('.inningButtons button');
// let inningContent = $('.inningContent');
// function showContent(index) {
// 	inningButtons.css('color', 'black');
// 	inningButtons.eq(index).css('color', 'var(--primary-color)');
// 	$('.inningContent').css('display', 'none')
// 	$('.inningContent').eq(index).css('display', 'flex');
// 	if (index == 0) {
// 		$('.inningContent').eq(index).css('animation', 'slide-right 0.35s');
// 		$('#hline').css('transform', 'translateX(0%)');
// 	} else {
// 		$('.inningContent').eq(index).css('animation', 'slide-left 0.35s');
// 		$('#hline').css('transform', 'translateX(100%)');
// 	}
// }

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

	document.title = `SCORE-GO - Match 1 ${match_data[0].abbr} vs ${match_data[1].abbr}`;

	// adding colors and team names
	for (let i = 0; i < 2; i++) {
		$(`#t${i + 1}-block div`).css('background-color', match_data[i].color);
		$(`#t${i + 1}-block span`).html(match_data[i].name);
		$('.inningButtons button').eq(i).html(match_data[i].name);
		$(`.c${i + 1} tr th`).css('background-color', match_data[i].color);
		$(`.c${i + 1} tr:last-child td`).css('border-bottom', `3px solid ${match_data[i].color}`);
		$(`.c${i + 1} tr:nth-child(odd)`).css('background-color', match_data[i].color + '30');
	}
	$('#t1-block div img').attr('src', "../img/ball-icon.ico");
	$('#t2-block div img').attr('src', "../img/bat-icon.ico");
	$('.main-score-pane').css({ 'border': `3px solid ${match_data[0].color}`, 'color': match_data[0].color });
	$('.main-score-pane div:nth-child(2)').css('background-color', match_data[0].color);
	$('.main-score-pane div:first-child').html(match_data[0].abbr);

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
});

