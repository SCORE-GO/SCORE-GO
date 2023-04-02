let cookies = document.cookie.split(';');

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
    if (document.cookie.search("db") == -1)
        window.location.replace("/get-started")
    $(".profile-menu").load("/profile-menu");
    $("aside").load("/aside", () => $('.sidebar a').eq(2).addClass('active'));
    // adding colors
    let match_data = [
        {
            name: 'Chennai Super Kings',
            abbr: 'CSK',
            color: '#c5a402'
        },
        {
            name: 'Sunrisers Hyderabad',
            abbr: 'SRH',
            color: '#F75B39'
        }
    ];
    for (let i = 0; i < 2; i++) {
        $(`#t${i + 1}-block div`).css('background-color', match_data[i].color);
        $(`#t${i + 1}-block span`).html(match_data[i].name);
        $(`.c${i + 1} tr th`).css('background-color', match_data[i].color);
        $(`.c${i + 1} tr:last-child td`).css('border-bottom', `3px solid ${match_data[i].color}`);
        $(`.c${i + 1} tr:nth-child(odd)`).css('background-color', match_data[i].color + '30');
        $(`.summaryButtons li`).eq(i + 1).html(match_data[i].abbr + ' INNINGS')
        $(`.team`).eq(i).html(match_data[i].name.toUpperCase());
        $(`.score`).eq(i).css('background-color', match_data[i].color);
        $('.tables').eq(i).find('table tr td').css('background-color', match_data[i].color + '40');
        $('.tables').eq(i).find('table tr td:first-child').css('background-color', match_data[i].color + '20');
    }

    // Tab bottom line width
    $('#hline').css('width', $('.summaryButtons li').css('width'));

    if ($('body').width() > 1100)
        $('#preloader').css('display', 'none');
});
