let cookies = document.cookie.split(';');

$('aside').mouseleave(event => {
    $('.sidebar a').removeClass('active');
    $('#vline').css('top', '155px');
    $('.sidebar a').eq(1).addClass('active');
});

$(document).ready(async (event) => {
    if (cookies[0].search("db") == -1)
        window.location.replace("/get-started")
    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside", () => $('.sidebar a').eq(1).addClass('active'));

    await fetch('/myteams/fetch_teams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ db: cookies[0].substring(cookies[0].indexOf('=') + 1) })
    })
        .then((res) => res.json())
        .then((res) => {
            const teams = res.teams;
            for (let i = 0; i < teams.length; i++) {
                $('.team-cards').append(`<div class="card" id='card-${i}'><span>${teams[i].name}</span><div></div></div>`);
                $(`#card-${i} span`).css('color', teams[i].color);
                $(`#card-${i} div`).css('background-color', teams[i].color);
                $(`#card-${i}`).click((event) => {
                    window.location.href = `/edit-team?team=${teams[i].abbr}`;
                });
            };
            $('.team-cards').append('<div class="card" id="add-card"><span></span><span></span></div>');
            $('#add-card, .new-team').click((event) => {
                window.location.href = '/new-team';
            })
        })

    // disabling preloader
    if ($('body').width() > 1100)
        $('#preloader').css('display', 'none');
})