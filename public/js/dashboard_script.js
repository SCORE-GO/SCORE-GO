let cookies = document.cookie.split(';');

$("aside").mouseleave((event) => {
	$(".sidebar a").removeClass("active");
	$("#vline").css("top", "85px");
	$(".sidebar a").eq(0).addClass("active");
});

$(document).ready(async (event) => {
	if (cookies[0].search("db") == -1)
		window.location.replace("/get-started")
	$(".profile-menu").load("/profile-menu");
	$("aside").load("/aside");
	setTimeout(() => {
		$('.sidebar a').eq(0).addClass('active');
	}, 100);

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
		})

	// disabling preloader
	$("#preloader").css("display", "none");
});
