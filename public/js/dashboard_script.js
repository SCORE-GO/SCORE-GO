let cookies = document.cookie.split(';');
if (cookies[0].search("db") == -1)
	window.location.replace("/get-started")

$("aside").mouseleave((event) => {
	$(".sidebar a").removeClass("active");
	$("#vline").css("top", "85px");
	$(".sidebar a").eq(0).addClass("active");
});

$(document).ready(async (event) => {
	$(".profile-menu").load("/profile-menu");
	$("aside").load("/aside", () => $('.sidebar a').eq(0).addClass('active'));

	await fetch('/dashboard/fetch_dashboard', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ db: cookies[0].substring(cookies[0].indexOf('=') + 1) })
	})
		.then((res) => res.json())
		.then((res) => {
			$('#total-teams').html(res.teams);
			$('#total-matches').html(res.matches);
			if (res.matches_present) {
				for (let i = 0, j = 0; i < res.match_info.length; i++, j += 2) {
					$('.match-cards').append(`<div class="card" id="card-${i}"></div>`);
					$(`#card-${i}`).append(`
                        <h2>
                            <span>${res.match_info[i].title}</span>
                            <div></div>
                            <div></div>
                        </h2>
                        <div class="teams">
                            <span>${res.team_details[j].bat}</span>
                            <span>${res.team_details[j].runs}/${res.team_details[j].wickets} (${res.team_details[j].overs})</span>
                        </div>
                        <div class="teams">
                            <span>${res.team_details[j + 1].bat}</span>
                            <span>${res.team_details[j + 1].runs}/${res.team_details[j + 1].wickets} (${res.team_details[j + 1].overs})</span>
                        </div>`);
					$(`#card-${i}`).append(`<div class="result"><span>Resume Match</span></div>`);
					$(`#card-${i} h2 div`).eq(0).css('background-color', res.team_details[j].color);
					$(`#card-${i} h2 div`).eq(1).css('background-color', res.team_details[j + 1].color);
					$(`#card-${i} .teams`).eq(0).css('color', res.team_details[j].color);
					$(`#card-${i} .teams`).eq(1).css('color', res.team_details[j + 1].color);
					$(`#card-${i}`).click((event) => {
						window.location.href = `/start-match/${res.match_info[i]._id}`;
					});
				}
			} else {
				$('.no-matches').show();
				$('.match-cards').hide();
			}
		})

	// disabling preloader
	if ($('body').width() > 1100)
		$("#preloader").css("display", "none");
});
