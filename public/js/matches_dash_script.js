let cookies = document.cookie.split(';');

$('aside').mouseleave(event => {
    $('.sidebar a').removeClass('active');
    $('#vline').css('top', '225px');
    $('.sidebar a').eq(2).addClass('active');
});

window.addEventListener('load', async (event) => {
    if (cookies[0].search("db") == -1)
        location.replace("/get-started")
    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside");
    setTimeout(() => {
        $('.sidebar a').eq(2).addClass('active');
    }, 100);

    
	await fetch('/mymatches/fetch_matches', {
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
    $('#preloader').css('display', 'none');
});
$(document).ready(function () {
    let match_data = [{
        title: 'Match 1',
        t1: 'India',
        t1_color: '#4483E0',
        t1_score: '220/9 (20)',
        t2: 'Pakistan',
        t2_color: '#186214',
        t2_score: '72 (15)',
        result: 'India won by 148 runs'
    }, {
        title: 'Match 2',
        t1: 'Chennai Super Kings',
        t1_color: '#F1CA01',
        t1_score: '178/5 (18.4)',
        t2: 'Mumbai Indians',
        t2_color: '#0061A2',
        t2_score: '175/6 (20)',
        result: 'Chennai won by 5 wickets'
    }, {
        title: 'Match 3',
        t1: 'Kolkata Knight Riders',
        t1_color: '#51268A',
        t1_score: '141/5 (18.4)',
        t2: 'Sunrisers Hyderabad',
        t2_color: '#F75B39',
        t2_score: '150/6 (20)',
        result: 'Sunrisers won by 5 wickets'
    }];
    for (let i = 0; i < match_data.length; i++) {
        $('.match-cards').append(`<div class="card" id="card-${i}">
            <h2>
                <span>${match_data[i].title}</span>
                <div></div>
                <div></div>
            </h2>
            <div class="teams">
                <span>${match_data[i].t1}</span>
                <span>${match_data[i].t1_score}</span>
            </div>
            <div class="teams">
                <span>${match_data[i].t2}</span>
                <span>${match_data[i].t2_score}</span>
            </div>
            <div class="result">
                <span>${match_data[i].result}</span>
            </div>
        </div>`);
        $(`#card-${i} h2 div`).eq(0).css('background-color', match_data[i].t1_color);
        $(`#card-${i} h2 div`).eq(1).css('background-color', match_data[i].t2_color);
        $(`#card-${i} .teams`).eq(0).css('color', match_data[i].t1_color);
        $(`#card-${i} .teams`).eq(1).css('color', match_data[i].t2_color);
    };
});