let cookies = document.cookie.split(';');

$('aside').mouseleave(event => {
    $('.sidebar a').removeClass('active');
    $('#vline').css('top', '155px');
    $('.sidebar a').eq(1).addClass('active');
});

function check() {
    if ($('#team-name').val() == '' || $("#team-abbr").val() == '' || $("#team-color").val() == '#FFFFFF')
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
    $(element).click(async function (event) {
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

window.addEventListener('load', (event) => {
    if (document.cookie.search("db") == -1)
        location.href = '/get-started'
    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside");
    setTimeout(() => {
        $("aside").css('width', '220px');
        $('.sidebar a').eq(1).addClass('active');
    }, 100);

    if (location.href.search("new-team") == -1) {
        $('#heading').html('Edit Team')

    } else {
        $('#heading').html('Create New Team')
    }

    // disabling preloader
    $('#preloader').css('display', 'none');
});

// team players
// let players = [
//     'Rohit Sharma',
//     'Virat Kohli',
//     'Shubman Gill',
//     'KL Rahul',
//     'Suryakumar Yadav',
//     'Hardik Pandya',
//     'Washington Sundar',
//     'Shardul Thakur',
//     'Mohammed Siraj',
//     'Bhuvneshwar Kumar',
//     'Kuldeep Yadav'
// ];
// for (let i = 0; i < players.length; i++) {
//     $('#captain').append(`<option value="${players[i]}">${players[i]}</option>`);
//     $('#keeper').append(`<option value="${players[i]}">${players[i]}</option>`);
//     $('.tshirts .player span').eq(i).html(players[i]);
// }

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
                    color: $("#team-color").val()
                })
            })
                .then((res) => res.json())
                .then((res) => {
                    console.log(res.value)
                })
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                showConfirmButton: false,
                timer: 1000
            });
        } else {
            await fetch("/new-team/create", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    db: cookies[0].substring(cookies[0].indexOf('=') + 1),
                    name: $("#team-name").val(),
                    abbr: $("#team-abbr").val(),
                    color: $("#team-color").val()
                })
            })
                .then((res) => res.json())
                .then((res) => {
                    console.log(res.value)
                })
        }
    }
});

$('h1 span:first-child').click((event) => {
    Swal.fire({
        icon: 'warning',
        title: 'Do you really want to exit?',
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        confirmButtonColor: '#4153f1',
        denyButtonColor: '#4153f1'
    }).then((res) => {
        if (res.isConfirmed) {
            window.history.back();
        }
    })
})
