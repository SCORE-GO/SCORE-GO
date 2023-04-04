let cookies = document.cookie.split(';');
if (document.cookie.search("db") == -1)
    window.location.replace("/get-started")

let db = cookies[0].substring(cookies[0].indexOf('=') + 1);
let id = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
let title;

$('aside').mouseleave(event => {
    $('.sidebar a').removeClass('active');
    $('#vline').css('top', '225px');
    $('.sidebar a').eq(2).addClass('active');
});

// main summary tabs
function switch_tab(index) {
    $('.tab-container').css('margin-left', `calc(-950px * ${index})`);
    $('.summaryButtons li').removeClass('active');
    $('#hline').css('margin-left', `calc(${$('.summaryButtons li').css('width')} * ${index})`);
    $('.summaryButtons li').eq(index).addClass('active');
}

$(document).ready(async function () {
    await fetch(`/match-summary/${id}/check-match`, {
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
        .then((res) => {
            if (res.exists) {
                if (!res.end)
                    window.location.replace(`/start-match/${id}`);
            } else
                window.location.replace("/dashboard");
        })

    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside", () => $('.sidebar a').eq(2).addClass('active'));
    $("aside").css('width', '80px');

    await fetch(`/match-summary/${id}/fetch-match-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            db: db,
            id: id
        })
    })
        .then((res) => res.json())
        .then(async (res) => {
            title = res.match.title;
            $('.title').html(res.match.title);
            $('#toss').html(res.toss);
            for (let i = 0; i < 2; i++) {
                $(`#t${i + 1}-block span`).html(res.match[`team${i + 1}`]);
                $(`#t${i + 1}-block div`).css('background-color', res.match[`team${i + 1}`] == res.team[0].name ? res.team[0].color : res.team[1].color);
                $(`.c${i + 1} tr th`).css('background-color', res.team[i].color);
                $(`.c${i + 1} tr:last-child td`).css('border-bottom', `3px solid ${res.team[i].color}`);
                $(`.c${i + 1} tr:nth-child(odd)`).css('background-color', res.team[i].color + '30');
                $(`.summaryButtons li`).eq(i + 1).html(res.team[i].abbr + ' INNINGS')
                $(`.team`).eq(i).html(res.team[i].name.toUpperCase());
                $(`.score`).eq(i).css('background-color', res.team[i].color);
                $('.tables').eq(i).find('table tr td').css('background-color', res.team[i].color + '40');
                $('.tables').eq(i).find('table tr td:first-child').css('background-color', res.team[i].color + '20');
            }
        })

    // Tab bottom line width
    await $('#hline').css('width', $('.summaryButtons li').css('width'));

    if ($('body').width() > 1100)
        $('#preloader').css('display', 'none');
});
