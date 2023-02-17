let cookies = document.cookie.split(';');

// disabling preloader
window.addEventListener('load', (event) => {
	if (cookies[0].search("db") == -1)
		window.location.replace("/get-started")
	$(".profile-menu").load("/profile-menu");
	$('#preloader').css('display', 'none');
})

$(document).ready(function () {
	// adding players
	let team1 = [
		'Rohit Sharma',
		'Virat Kohli',
		'Shubman Gill',
		'KL Rahul',
		'Suryakumar Yadav',
		'Hardik Pandya',
		'Washington Sundar',
		'Shardul Thakur',
		'Mohammed Siraj',
		'Bhuvneshwar Kumar',
		'Kuldeep Yadav'
	];
	team1.forEach(element => {
		$('.players').append(`<li><p>${element}</p><span class="material-symbols-rounded">done</span></li>`);
	});

	// adding colors
	let match_data = [
		{
			name: 'Chennai Super Kings',
			color: '#c5a402'
		},
		{
			name: 'Sunrisers Hyderabad',
			color: '#F75B39'
		}
	];
	for (let i = 0; i < 2; i++) {
		$('.heading span').eq(i).html(match_data[i].name);
		$('.heading span').eq(i).css('color', match_data[i].color);
		$('.heading div').eq(i).css('background-color', match_data[i].color);
		$(`#team${i + 1} li`).css('border-left', `3px solid ${match_data[i].color}`);
		$(`#team${i + 1} .info`).css('color', match_data[i].color);

		$(`#team${i + 1} li`).click(function (event) {
			if ($(this).find('span').css('visibility') == 'hidden') {
				$(this).addClass('active');
				$(this).css('color', match_data[i].color);
				$(this).find('span').css('visibility', 'visible');
			} else {
				$(this).removeClass('active');
				$(this).css('color', 'black');
				$(this).find('span').css('visibility', 'hidden');
			}
		});
	}

});

