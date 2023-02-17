let cookies = document.cookie.split(';');

$('aside').mouseleave(event => {
    $('.sidebar a').removeClass('active');
    $('#vline').css('top', '155px');
    $('.sidebar a').eq(1).addClass('active');
});

function check() {
    if ($('#team-name').val() == '' || $("#team-abbr").val() == '' || $("#team-color").val() == '#ffffff')
        return true;
    else
        return false;
}

function getEditURL(index) {
    window.location.href = `/edit-player?team=${$('#team-name').val()}&player=${index}`;
}

// tshirt hover
$('.player').each((index, element) => {
    $(element).mouseover(event => {
        $(element).find('img').attr('src', '../img/tshirt-hover.png');
    });
    $(element).mouseout(event => {
        $(element).find('img').attr('src', '../img/tshirt.png');
    });
    $(element).click((event) => {
        if (check()) {
            Swal.fire({
                icon: 'error',
                title: 'Please input team details',
                text: 'Name, Color and Abbreviation',
                confirmButtonText: 'OK',
                confirmButtonColor: '#4153f1'
            });
        } else {
            window.location.href = `/edit-player?team=${$('#team-abbr').val()}&player=${index}`;
        }
    });
})

$(document).ready((event) => {
    if (document.cookie.search("db") == -1)
        window.location.replace("/get-started")
})

window.addEventListener('load', async (event) => {
    if (document.cookie.search("db") == -1)
        window.location.replace("/get-started")
    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside");
    setTimeout(() => {
        $("aside").css('width', '220px');
        $('.sidebar a').eq(1).addClass('active');
    }, 100);

    if (location.href.search("new-team") == -1) {
        $('#heading').html('Edit Team')
        await fetch("/edit-team", {
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
                let players = res.data.players
                $("#team-name").val(res.data.name)
                $("#team-abbr").val(res.data.abbr)
                $("#team-color").val(res.data.color)
                for (let i = 0; i < players.length; i++) {
                    if (players[i].name != "") {
                        $('#captain').append(`<option value=${i}>${players[i].name}</option>`);
                        $('#keeper').append(`<option value=${i}>${players[i].name}</option>`);
                        $('.tshirts .player span').eq(i).html(players[i].name);
                    }
                }
                $('#captain').val(res.data.captain)
                $('#keeper').val(res.data.keeper)
            })
    } else {
        $('#heading').html('Create New Team')
    }

    // disabling preloader
    $('#preloader').css('display', 'none');
});

$('#save').click(async (event) => {
    if (check()) {
        Swal.fire({
            icon: 'error',
            title: 'Please input team details',
            text: 'Name, Color and Abbreviation',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4153f1'
        });
    } else {
        if (location.href.search("new-team") == -1) {
            await fetch("/edit-team/edit", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    db: cookies[0].substring(cookies[0].indexOf('=') + 1),
                    name: $("#team-name").val(),
                    abbr: $("#team-abbr").val(),
                    color: $("#team-color").val(),
                    captain: $("#captain").val(),
                    keeper: $("#keeper").val()
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
        } else {
            await fetch("/new-team/create", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    db: cookies[0].substring(cookies[0].indexOf('=') + 1),
                    name: $("#team-name").val().trim(),
                    abbr: $("#team-abbr").val().trim(),
                    color: $("#team-color").val()
                })
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.duplicate) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Team Name or Abbreviation Already Used',
                            text: 'Please enter a different one',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#4153f1'
                        })
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Created New Team Successfully!',
                            text: 'Input player data by clicking on the T-Shirt icons',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#4153f1'
                        });
                        $(this).prop('disabled', true);
                    }
                })
        }
    }
});

$('h1 span:first-child').click((event) => {
    window.location.replace("/myteams")
})
