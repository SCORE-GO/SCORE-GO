let cookies = document.cookie.split(';');
let players = [];
let active_index = parseInt(new URLSearchParams(window.location.search).get('player'));

$('aside').mouseleave(event => {
    $('.sidebar a').removeClass('active');
    $('#vline').css('top', '155px');
    $('.sidebar a').eq(1).addClass('active');
});

// tshirt hover
$('.player').each((index, element) => {
    $('.player').eq(index).mouseover(event => {
        $('.player img').eq(index).attr('src', '../img/tshirt-hover.png');
    });
    $(element).click((event) => {
        window.location.replace(`/edit-player?team=${new URLSearchParams(window.location.search).get('team')}&player=${index}`);
    });
})

$('.player').mouseout(event => {
    $('.player img').attr('src', '../img/tshirt.png');
});

// disabling bowling types
$("input[name='bowling']").change((event) => {
    if ($("input[name='bowling']:checked").val() == "none") {
        $("#bowling-type").prop('disabled', 'disabled');
        $('#bowling-type').val("none")
    }
    else
        $("#bowling-type").prop('disabled', false);
})

// disabling preloader
window.addEventListener('load', async (event) => {
    if (document.cookie.search("db") == -1)
        window.location.replace("/get-started")
    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside");
    setTimeout(() => {
        $("aside").css('width', '220px');
        $('.sidebar a').eq(1).addClass('active');
    }, 100);

    // bowling types
    let bowling_types = [
        'None',
        'Fast',
        'Fast-Medium',
        'Medium-Fast',
        'Medium',
        'Off-Break',
        'Leg-Break',
        'Orthodox',
        'Chinaman'
    ];
    bowling_types.forEach(element => {
        $('#bowling-type').append(`<option value="${element.toLowerCase()}">${element}</option>`);
    });

    // fetch player names
    await fetch("/edit-player/fetch-players", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            db: cookies[0].substring(cookies[0].indexOf('=') + 1),
            abbr: new URLSearchParams(window.location.search).get('team')
        })
    })
        .then((res) => res.json())
        .then((res) => {
            players = res.data
            for (let i = 0; i < players.length; i++) {
                $('.tshirts .player span').eq(i).html(players[i].name);
            }

            // active player
            $(".player img").eq(active_index).addClass("active");
            $("#player-name").val(players[active_index].name);
            $("input[name='batting']").val([players[active_index].bat])
            $("input[name='bowling']").val([players[active_index].bowl])
            $('#bowling-type').val(players[active_index].bowl_type)
        })

    // fetch active player details
    await fetch("/edit-player/fetch-active", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            db: cookies[0].substring(cookies[0].indexOf('=') + 1),
            abbr: new URLSearchParams(window.location.search).get('team'),
            index: active_index
        })
    })
        .then((res) => res.json())
        .then((res) => {
            $(".player img").eq(active_index).addClass("active");
            $("#player-name").val(res.data.name);
            $("input[name='batting']").val([res.data.bat])
            $("input[name='bowling']").val([res.data.bowl])
            $('#bowling-type').val(res.data.bowl_type)
        })

    if ($("input[name='bowling']:checked").val() == "none")
        $("#bowling-type").prop('disabled', 'disabled');


    $('#preloader').css('display', 'none');
});

$('#save').click(async (event) => {
    if ($('#player-name').val() == '') {
        Swal.fire({
            icon: 'error',
            title: 'Please enter player name',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4153f1'
        });
    } else {
        await fetch("/edit-player/update-player", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                db: cookies[0].substring(cookies[0].indexOf('=') + 1),
                index: active_index,
                abbr: new URLSearchParams(window.location.search).get('team'),
                data: {
                    name: $("#player-name").val(),
                    bat: $("input[name='batting']:checked").val(),
                    bowl: $("input[name='bowling']:checked").val(),
                    bowl_type: $('#bowling-type').val()
                }
            })
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.updated)
                    Swal.fire({
                        icon: 'success',
                        title: 'Saved!',
                        showConfirmButton: false,
                        timer: 1000
                    });
            })
    }
});

$('h1 span:first-child').click((event) => {
    window.location.replace(`/edit-team?team=${new URLSearchParams(window.location.search).get('team')}`)
})