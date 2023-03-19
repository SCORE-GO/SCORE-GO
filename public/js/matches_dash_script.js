let cookies = document.cookie.split(';');

$('aside').mouseleave(event => {
    $('.sidebar a').removeClass('active');
    $('#vline').css('top', '225px');
    $('.sidebar a').eq(2).addClass('active');
});

$(document).ready(async (event) => {
    if (cookies[0].search("db") == -1)
        window.location.replace("/get-started")
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
            $('#total-teams').html(res.team);
            $('#total-matches').html(res.matches);
            console.log(res.match_info);
             console.log(res.team_details);
            
            // let match_data = [{
            //     title: res.match_title,
            //     t1: res.team1,
            //     t1_color: res.color,
            //     t1_score: '220/9 (20)',
            //     t2: res.team2,
            //     t2_color: '#186214',
            //     t2_score: '72 (15)',
            //     result: 'India won by 148 runs'
            // }, {
            //     title: 'Match 2',
            //     t1: 'Chennai Super Kings',
            //     t1_color: '#F1CA01',
            //     t1_score: '178/5 (18.4)',
            //     t2: 'Mumbai Indians',
            //     t2_color: '#0061A2',
            //     t2_score: '175/6 (20)',
            //     result: 'Chennai won by 5 wickets'
            // }, {
            //     title: 'Match 3',
            //     t1: 'Kolkata Knight Riders',
            //     t1_color: '#51268A',
            //     t1_score: '141/5 (18.4)',
            //     t2: 'Sunrisers Hyderabad',
            //     t2_color: '#F75B39',
            //     t2_score: '150/6 (20)',
            //     result: 'Sunrisers won by 5 wickets'
            // }];
            for (let i = 0; i < res.match_info.length; i++) {
                $('.match-cards').append(`<div class="card" id="card-${i}">
                    <h2>
                        <span>${res.match_info[i].title}</span>
                        <div></div>
                        <div></div>
                    </h2>
                    <div class="teams">
                        <span>${res.match_info[i].team1}</span>
                        <span>${res.match_info[i].t1_score}</span>
                    </div>
                    <div class="teams">
                        <span>${res.match_info[i].team2}</span>
                        <span>${res.match_info[i].t2_score}</span>
                    </div>
                    <div class="result">
                        <span>${res.match_info[i].result}</span>
                    </div>
                </div>`);
                $(`#card-${i} h2 div`).eq(0).css('background-color', res.match_info[i].t1_color);
                $(`#card-${i} h2 div`).eq(1).css('background-color', res.match_info[i].t2_color);
                $(`#card-${i} .teams`).eq(0).css('color', res.match_info[i].t1_color);
                $(`#card-${i} .teams`).eq(1).css('color', res.match_info[i].t2_color);
            };
        })


    // disabling preloader
    $('#preloader').css('display', 'none');
});
$(document).ready(function () {

});