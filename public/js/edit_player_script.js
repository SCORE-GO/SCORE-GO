let cookies = document.cookie.split(';');

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
})

$('.player').mouseout(event => {
    $('.player img').attr('src', '../img/tshirt.png');
});

// disabling preloader
window.addEventListener('load', (event) => {
    if (document.cookie.search("db") == -1)
        location.replace("/get-started")
    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside");
    setTimeout(() => {
        $("aside").css('width', '220px');
        $('.sidebar a').eq(1).addClass('active');
    }, 100);

    // active player
    let index = parseInt(new URLSearchParams(window.location.search).get('player'));
    $('.player img').eq(index).addClass("active");

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
        $('#bowling-type').append(`<option value="${element}">${element}</option>`);
    });

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
//     $('.tshirts .player span').eq(i).html(players[i]);
// }

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

$('#save').click((event) => {
    if ($('#player-name').val() == '') {
        Swal.fire({
            icon: 'error',
            title: 'Please enter player name',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4153f1'
        });
    } else {
        Swal.fire({
            icon: 'success',
            title: 'Saved!',
            showConfirmButton: false,
            timer: 1000
        });
    }
});