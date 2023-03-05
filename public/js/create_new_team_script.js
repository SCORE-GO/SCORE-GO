let cookies = document.cookie.split(';');
let db = cookies[0].substring(cookies[0].indexOf('=') + 1)
let team = new URLSearchParams(window.location.search).get('team')

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
        if (team == null)
            window.location.replace("/myteams")
        else {
            await fetch("/edit-team/check-team", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    db: db,
                    abbr: team
                })
            })
                .then((res) => res.json())
                .then((res) => { flag = res.exists })
            if (flag == false)
                window.location.replace("/myteams")
            else {
                $(document).prop('title', 'SCORE-GO - Edit Team');
                $('#heading').html('Edit Team')
                await fetch("/edit-team/fetch-details", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        db: db,
                        abbr: team
                    })
                })
                    .then((res) => res.json())
                    .then((res) => {
                        let players = res.data.players
                        for (let i = 0; i < players.length; i++) {
                            if (players[i].name != "") {
                                $('#captain').append(`<option value=${i}>${players[i].name}</option>`);
                                $('#vice_captain').append(`<option value=${i}>${players[i].name}</option>`);
                                $('#keeper').append(`<option value=${i}>${players[i].name}</option>`);
                                $('.tshirts .player span').eq(i).html(players[i].name);
                                if (i == res.data.captain) {
                                    $('.tshirts .player div').eq(i).append("<p>C</p>")
                                    $('.tshirts .player img').eq(i).css("margin-right", "-20px")
                                }
                                if (i == res.data.vice_captain) {
                                    $('.tshirts .player div').eq(i).append("<p>VC</p>")
                                    $('.tshirts .player img').eq(i).css("margin-right", "-20px")
                                }
                                if (i == res.data.keeper) {
                                    $('.tshirts .player div').eq(i).append("<p>WK</p>")
                                    $('.tshirts .player img').eq(i).css("margin-right", "-20px")
                                }
                            }
                        }
                        $("#team-name").val(res.data.name)
                        $("#team-abbr").val(res.data.abbr)
                        $("#team-color").val(res.data.color)
                        $('#captain').val(res.data.captain)
                        $('#vice_captain').val(res.data.vice_captain)
                        $('#keeper').val(res.data.keeper)
                    })
            }
        }
    } else {
        $(document).prop('title', 'SCORE-GO - Create New Team');
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
            if ($("#captain").val() != null && $("#captain").val() == $("#vice_captain").val()) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Captain and Vice-Captain cannot be same',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#4153f1'
                })
            } else {
                await fetch("/edit-team/edit", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        db: db,
                        oldabbr: team,
                        name: $("#team-name").val(),
                        newabbr: $("#team-abbr").val(),
                        color: $("#team-color").val(),
                        captain: $("#captain").val(),
                        vice_captain: $("#vice_captain").val(),
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
                            }).then(() => { window.location.replace(`/edit-team?team=${$("#team-abbr").val()}`); })
                    })
            }
        } else {
            await fetch("/new-team/create", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    db: db,
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
