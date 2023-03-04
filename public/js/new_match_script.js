let cookies = document.cookie.split(';');
let db = cookies[0].substring(cookies[0].indexOf('=') + 1);
let overs;
let choice = -1;

$('aside').mouseleave(event => {
	$('.sidebar a').removeClass('active');
	$('#vline').css('top', '225px');
	$('.sidebar a').eq(2).addClass('active');
});

// slide switching
function switchSlides(index) {
	$('.slideshow-container').css('margin-left', `calc(-600px * ${index})`);
}

// overs styling
function selectOvers(index) {
	overs = parseInt($(".limited-overs").eq(index).html());
	$(".limited-overs").removeClass("active");
	$(".limited-overs").eq(index).addClass("active");
	$("#custom-tick").css("color", "var(--primary-color)");
	$("#custom").css("border", "3px solid var(--primary-color)");
	$("#custom").val("");
}

$("#custom-tick").click(() => {
	if (/^[1-9]+$/.test($("#custom").val())) {
		overs = parseInt($("#custom").val());
		$("#custom-tick").css("color", "green");
		$("#custom").css("border", "3px solid green");
		$(".limited-overs").removeClass("active");
	} else {
		$("#custom").css("border", "3px solid red");
		$("#custom-tick").css("color", "red");
	}
})


// toss selection
function tossSelect(index) {
	$('.toss').removeClass('active');
	$('.toss').eq(index).addClass('active');
	if (index == 0)
		choice = true;
	else
		choice = false;
}

window.addEventListener('load', async (event) => {
	if (cookies[0].search("db") == -1)
		window.location.replace("/get-started")
	$(".profile-menu").load("/profile-menu");
	$("aside").load("/aside");
	setTimeout(() => {
		$("aside").css('width', '220px');
		$('.sidebar a').eq(2).addClass('active');
	}, 100);

	await fetch('/new-match/fetch-teams', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ db: db })
	})
		.then((res) => res.json())
		.then((res) => {
			let teams = res.teams;
			teams.forEach(element => {
				$("#team1").append(`<option value="${element.name}">${element.name}</option>`);
				$("#team2").append(`<option value="${element.name}">${element.name}</option>`);
			});
			$("#team2").val(teams[1].name)
		})

	$('#preloader').css('display', 'none');
});

//tab1 validation
next1.addEventListener("click", async (event) => {
	if ($("#title").val() == "") {
		$("#title").addClass("error");
	} else {
		await fetch('/new-match/check-title', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				db: db,
				title: $("#title").val()
			})
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.duplicate) {
					Swal.fire({
						icon: "error",
						title: "Duplicate Title!",
						text: "Please enter a different match title",
						confirmButtonText: "OK",
						confirmButtonColor: "#4153f1",
					});
				} else {
					if ($("#team1").val() == $("#team2").val()) {
						Swal.fire({
							icon: "error",
							title: "Oops..",
							text: "Please select two different teams",
							confirmButtonText: "OK",
							confirmButtonColor: "#4153f1",
						});
					} else {
						$("#title").removeClass("error");
						new Array($("#team1").val(), $("#team2").val()).forEach(element => {
							$("#toss").append(`<option value="${element}">${element}</option>`);
						});
						switchSlides(1);
					}
				}
			})
	}
});

//tab2 validation
next2.addEventListener("click", async (event) => {
	let flag = true;
	Array.from($(".limited-overs")).forEach((element) => {
		if ($(element).hasClass("active")) {
			flag = false;
			return false;
		}
	})
	if (flag && $("#custom").val() == "") {
		Swal.fire({
			icon: "error",
			title: "Oops..",
			text: "Please Enter Overs",
			confirmButtonText: "OK",
			confirmButtonColor: "#4153f1",
		});
	} else {
		switchSlides(2);
	}
});

next3.addEventListener("click", async (event) => {
	if (choice == -1) {
		Swal.fire({
			icon: "error",
			title: "Oops..",
			text: "Please select toss choice",
			confirmButtonText: "OK",
			confirmButtonColor: "#4153f1",
		});
	} else {
		const date = new Date()
		const formattedDate = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).format(date)
		await fetch('/new-match/insert', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				db: db,
				data: {
					title: $("#title").val(),
					team1: $("#team1").val(),
					team2: $("#team2").val(),
					overs: overs,
					venue: $("#venue").val(),
					umpires: [$("#u1").val(), $("#u2").val()],
					toss: $("#toss").val(),
					choice: choice,
					date: formattedDate
				}
			})
		})
			.then((res) => res.json())
			.then(async (res) => {
				if (res.inserted) {
					await fetch('new-match/start', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							db: db,
							title: $("#title").val()
						})
					})
						.then((res) => res.json())
						.then((res) => {
							window.location.replace("/start-match?id=" + res.id);
						})
				} else {
					Swal.fire({
						icon: 'error',
						title: "Match Creation Unsuccessful!",
						text: 'Please Try Again!',
						confirmButtonText: 'OK',
						confirmButtonColor: '#4153f1'
					})
				}
			});
	}
});

previous1.addEventListener("click", (event) => {
	document.getElementById("toss").options.length = 0;
	switchSlides(0);
});

previous2.addEventListener("click", (event) => {
	switchSlides(1);
});