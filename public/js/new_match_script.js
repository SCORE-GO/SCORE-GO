let cookies = document.cookie.split(';');

$('aside').mouseleave(event => {
    $('.sidebar a').removeClass('active');
    $('#vline').css('top', '225px');
    $('.sidebar a').eq(2).addClass('active');
});

// slide switching
function switchSlides(index) {
    $('.slideshow-container').css('margin-left', `calc(-600px * ${index})`);
}

// toss selection
function tossSelect(index) {
    $('.toss').removeClass('active');
    $('.toss').eq(index).addClass('active');
}

// disabling preloader
window.addEventListener('load', async (event) => {
    if (cookies[0].search("db") == -1)
        location.replace("/get-started")
    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside");
    setTimeout(() => {
        $("aside").css('width', '220px');
        $('.sidebar a').eq(2).addClass('active');
    }, 100);

    await fetch('/new-match/teams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ db: cookies[0].substring(cookies[0].indexOf('=') + 1) })
    })
        .then((res) => res.json())
        .then((res) => {
            let teams = JSON.parse(res.value);
            teams.forEach(element => {
                $("#team1").append(`<option value=${element.name}>${element.name}</option>`);
                $("#team2").append(`<option value=${element.name}>${element.name}</option>`);
            });
        })

    $('#preloader').css('display', 'none');
});
