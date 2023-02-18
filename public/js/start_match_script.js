let cookies = document.cookie.split(';');

// disabling preloader
window.addEventListener('load', async (event) => {
	if (cookies[0].search("db") == -1)
		window.location.replace("/get-started")
	$(".profile-menu").load("/profile-menu");

	await fetch('/start-match/fetch-details', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			db: cookies[0].substring(cookies[0].indexOf('=') + 1),
			title: "Match 1"
		})
	})
		.then((res) => res.json())
		.then((res) => {
			for (let i = 0; i < 2; i++) {
				res.team[i].players.forEach(element => {
					$(`.players${i}`).append(`<li><p>${element.name}</p><span class="material-symbols-rounded">done</span></li>`);
				});
				$('.heading span').eq(i).html(res.team[i].name);
				$('.heading span').eq(i).css('color', res.team[i].color);
				$('.heading div').eq(i).css('background-color', res.team[i].color);
				$(`#team${i + 1} li`).css('border-left', `3px solid ${res.team[i].color}`);
				$(`#team${i + 1} .info`).css('color', res.team[i].color);

				$(`#team${i + 1} li`).click(function (event) {
					if ($(this).find('span').css('visibility') == 'hidden') {
						$(this).addClass('active');
						$(this).css('color', res.team[i].color);
						$(this).find('span').css('visibility', 'visible');
					} else {
						$(this).removeClass('active');
						$(this).css('color', 'black');
						$(this).find('span').css('visibility', 'hidden');
					}
				});
			}
		})

	$('#preloader').css('display', 'none');
})

$(document).ready(function () {

	// adding colors



});

