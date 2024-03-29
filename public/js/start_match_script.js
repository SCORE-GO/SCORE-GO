let cookies = document.cookie.split(';');
if (cookies[0].search("db") == -1)
	window.location.replace("/get-started")

let db = cookies[0].substring(cookies[0].indexOf('=') + 1);
let id = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
let title, inning, batsman1, batsman2, bowler;
let url_db = CryptoJS.AES.encrypt(db, 'scorego').toString().replaceAll("/", "%2F").replaceAll("+", "%2B").replaceAll("=", "%3D");

$(document).ready(async (event) => {
	let flag = false;
	await fetch(`/start-match/${id}/check-match`, {
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
		await fetch(`/start-match/${id}/fetch-details`, {
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
				$("nav h2").html(title.toUpperCase() + ` - INNING ${res.inning} - TEAM SUMMARY`);
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < res.team[i].players.length; j++) {
						$(`.players${i}`).append(`<li><p>${res.team[i].players[j].name}</p><span class="material-symbols-rounded">done</span></li>`);
						if (res.team[i].captain == j)
							$(`.players${i} li p`).eq(j).append(" (C)");
						if (res.team[i].vice_captain == j)
							$(`.players${i} li p`).eq(j).append(" (VC)");
						if (res.team[i].keeper == j)
							$(`.players${i} li p`).eq(j).append(" (WK)");
					}
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
						$(`#team${i + 1} .info`).html("SELECT STRIKER & NON-STRIKER");
						$(`#team${1 - i + 1} .info`).html("SELECT BOWLER");

						$(`#team${i + 1} li`).click(function (event) {
							if ($(`#team${i + 1} li.active`).length == 2) {
								batsman1 = $(`#team${i + 1} li.active`).eq(0).find('p').html();
								batsman1 = batsman1.indexOf("(") == -1 ? batsman1 : batsman1.slice(0, batsman1.indexOf("(") - 1);
								batsman2 = $(`#team${i + 1} li.active`).eq(1).find('p').html();
								batsman2 = batsman2.indexOf("(") == -1 ? batsman2 : batsman2.slice(0, batsman2.indexOf("(") - 1);
								for (let j = 0; j < 11; j++) {
									if (!$(`#team${i + 1} li`).eq(j).hasClass("active")) {
										$(`#team${i + 1} li`).eq(j).addClass("disabled");
									}
								}
							} else {
								$(`#team${i + 1} li`).removeClass("disabled");
							}
						});
					}
					if (res.start) {
						$('.start-new-match').html("RESUME MATCH");
						$(`#team${i + 1} li`).addClass("disabled");
						$(`#team${i + 1} .info`).css("display", "none");
					} else {
						if (res.bowl == $('.heading span').eq(i).html()) {
							$(`#team${i + 1} li`).click(function (event) {
								if ($(`#team${i + 1} li.active`).length == 1) {
									bowler = $(`#team${i + 1} li.active`).eq(0).find('p').html();
									bowler = bowler.indexOf("(") == -1 ? bowler : bowler.slice(0, bowler.indexOf("(") - 1);
									for (let j = 0; j < 11; j++) {
										if (!$(`#team${i + 1} li`).eq(j).hasClass("active")) {
											$(`#team${i + 1} li`).eq(j).addClass("disabled");
										}
									}
								} else {
									$(`#team${i + 1} li`).removeClass("disabled");
									for (let j = 0; j < res.team[i].players.length; j++) {
										if (res.team[i].players[j].bowl == "none") {
											$(`#team${i + 1} li`).eq(j).addClass("disabled");
										}
									}
								}
							});
							for (let j = 0; j < res.team[i].players.length; j++) {
								if (res.team[i].players[j].bowl == "none") {
									$(`#team${i + 1} li`).eq(j).addClass("disabled");
								}
							}
						}
					}
				}
			})

		if ($('body').width() > 1100)
			$('#preloader').css('display', 'none');
	}
})

$(".start-new-match").click(async function (event) {
	if ($(this).html() == "START MATCH") {
		if ($(".teams li.active").length != 3)
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'Please select striker, non-striker and bowler',
				confirmButtonText: 'OK',
				confirmButtonColor: '#4153f1'
			})
		else {
			await fetch(`/start-match/${id}/insert`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					db: db,
					id: id,
					title: title,
					inning: inning,
					batsman1: batsman1,
					batsman2: batsman2,
					bowler: bowler
				})
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.inserted)
						window.location.href = `/live-scorecard/${id}?id=${url_db}`;
					else
						Swal.fire({
							icon: 'error',
							title: 'Oops...',
							text: 'Something went wrong. Try Again!',
							confirmButtonText: 'OK',
							confirmButtonColor: '#4153f1'
						})
				})
		}
	} else {
		window.location.href = `/live-scorecard/${id}?id=${url_db}`;
	}
});
