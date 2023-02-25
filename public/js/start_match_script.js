let cookies = document.cookie.split(';');
let db = cookies[0].substring(cookies[0].indexOf('=') + 1)
let id = new URLSearchParams(window.location.search).get('id')
let title

// disabling preloader
window.addEventListener('load', async (event) => {
	if (cookies[0].search("db") == -1)
		window.location.replace("/get-started")
	else if (id == null)
		window.location.replace("/new-match")
	else {
		let flag = false;
		await fetch("/start-match/check-match", {
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
					db: cookies[0].substring(cookies[0].indexOf('=') + 1),
					id: id
				})
			})
				.then((res) => res.json())
				.then((res) => {
					$("nav h2").html(res.match_info.title.toUpperCase() + ` - INNING ${res.inning} - TEAM SUMMARY`);
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
						if (res.bat == $('.heading span').eq(i).html()) {
							$('.heading img').eq(i).attr('src', '../img/bat-icon.ico');
							$('.heading img').eq(1 - i).attr('src', '../img/ball-icon.ico');
						}
						if (res.start == false) {
							$(`#team${i + 1} li`).addClass("disabled");
							$("span .info").css("display", "none");
						} else {
							if (res.bowl == $('.heading span').eq(i).html()) {
								for (let j = 0; j < res.team[i].players.length; j++) {
									if (res.team[i].players[j].bowl == "none") {
										$(`#team${i + 1} li`).eq(j).addClass("disabled");
									}
								}
							}
						}
					}
				})

			$('#preloader').css('display', 'none');
		}
	}
})
