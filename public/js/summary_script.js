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
            $(document).prop('title', `${title} Summary - SCORE-GO`);
            $('.title').html(res.match.title);
            $('#toss').html(res.toss);
            $('#winner').html(res.match.result.toUpperCase());
            for (let i = 0; i < 2; i++) {
                res.innings[i].batting.sort((a, b) => b.runs - a.runs)
                res.innings[i].bowling.sort((a, b) => b.wickets - a.wickets)

                $(`#total${i + 1}`).html(res.innings[i].runs + '/' + res.innings[i].wickets);
                $(`#overs${i + 1}`).html(res.innings[i].overs);

                for (let j = 0; j < 4; j++) {
                    $(`#t${i + 1} table:first-child`).append(`
                        <tr>
                           <td>${res.innings[i].batting[j].name.split(' ')[0].substring(0, 1) + ' ' + res.innings[i].batting[j].name.split(' ')[1].toUpperCase()}</td>
                           <td>${res.innings[i].batting[j].runs}</td>
                           <td>${res.innings[i].batting[j].balls}</td>
                        </tr>
                    `)
                    if (j == res.innings[i].batting.length - 1)
                        break;
                }

                for (let j = 0; j < 4; j++) {
                    $(`#t${i + 1} table:last-child`).append(`
                        <tr>
                        <td>${res.innings[i].bowling[j].name.split(' ')[0].substring(0, 1) + ' ' + res.innings[i].bowling[j].name.split(' ')[1].toUpperCase()}</td>
                           <td>${res.innings[i].bowling[j].wickets}-${res.innings[i].bowling[j].runs}</td>
                           <td>${res.innings[i].bowling[j].overs.toFixed(1)}</td>
                        </tr>
                    `)
                    if (j == res.innings[i].bowling.length - 1)
                        break;
                }
            }

            await fetch_scorecard(1);
            await fetch_scorecard(2);
            for (let i = 0; i < 2; i++) {
                $(`#t${i + 1}-block span`).html(res.match[`team${i + 1}`]);
                $(`#t${i + 1}-block div`).css('background-color', res.match[`team${i + 1}`] == res.team[0].name ? res.team[0].color : res.team[1].color);
                $(`.c${i + 1} tr th`).css('background-color', res.team[i].color);
                $(`.c${i + 1} tr:last-child td`).css('border-bottom', `3px solid ${res.team[i].color}`);
                $(`.c${i + 1} tr:nth-child(odd)`).css('background-color', res.team[i].color + '30');
                $(`.summaryButtons li`).eq(i + 1).html(res.team[i].abbr + ' INNINGS')
                $(`#tab4 span`).eq(i).html(res.team[i].abbr + ' INNINGS')
                $(`#tab4 span`).eq(i).css('color', res.team[i].color);
                $(`.team`).eq(i).html(res.team[i].name.toUpperCase());
                $(`.score`).eq(i).css('background-color', res.team[i].color);
                $('.tables').eq(i).find('table tr td').css('background-color', res.team[i].color + '40');
                $('.tables').eq(i).find('table tr td:first-child').css('background-color', res.team[i].color + '20');
            }

            let labels = new Array(res.match.overs);
            for (let i = 0; i < labels.length; i++)
                labels[i] = i + 1;

            let inn1_runs = new Array(res.innings[0].timeline.length);
            for (let i = 0; i < inn1_runs.length; i++)
                inn1_runs[i] = res.innings[0].timeline[i].runs;

            let inn2_runs = new Array(res.innings[1].timeline.length);
            for (let i = 0; i < inn2_runs.length; i++)
                inn2_runs[i] = res.innings[1].timeline[i].runs;

            Chart.defaults.font.family = 'Quicksand';
            Chart.defaults.font.size = 18;
            Chart.defaults.font.weight = '600';
            Chart.defaults.color = 'gray';

            new Chart(document.getElementById('inn1_chart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: ` ${res.team[0].abbr} Runs`,
                        data: inn1_runs,
                        fill: false,
                        borderColor: res.team[0].color,
                        backgroundColor: res.team[0].color,
                        borderWidth: 3,
                        tension: 0,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Runs'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Overs'
                            }
                        }
                    }
                }
            });
            new Chart(document.getElementById('inn2_chart'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: ` ${res.team[1].abbr} Runs`,
                        data: inn2_runs,
                        fill: false,
                        borderWidth: 3,
                        borderColor: res.team[1].color,
                        backgroundColor: res.team[1].color,
                        tension: 0,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Runs'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Overs'
                            }
                        }
                    }
                }
            });

            $('.match-title span').eq(1).html(res.match.title);
            $('.toss span').eq(1).html(res.match.toss == res.team[0].abbr ? res.team[0].name : res.team[1].name);
            $('.overs span').eq(1).html(res.match.overs);
            $('.umpires span').eq(1).html(res.match.umpires[0] + ', ' + res.match.umpires[1]);
            $('.dat span').eq(1).html(res.match.date);
            $('.venue span').eq(1).html(res.match.venue);

            for (let i = 0; i < 2; i++) {
                let playing11 = '';
                res.team[i].players.forEach((player, j) => {
                    playing11 += player.name
                    if (res.team[i].captain == j)
                        playing11 += ' (C)';
                    if (res.team[i].vice_captain == j)
                        playing11 += ' (VC)';
                    if (res.team[i].keeper == j)
                        playing11 += ' (WK)';
                    playing11 += ', ';
                })
                $(`.team${i + 1} span`).eq(0).html(`${res.team[i].name} Playing 11 - `);
                $(`.team${i + 1} span`).eq(1).html(playing11.slice(0, -2));
            }
        })

    // Tab bottom line width
    await $('#hline').css('width', $('.summaryButtons li').css('width'));

    if ($('body').width() > 1100)
        $('#preloader').css('display', 'none');
});

async function fetch_scorecard(inn) {
    await fetch(`/match-summary/${id}/fetch-scorecard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            db: db,
            title: title,
            inning: inn
        })
    })
        .then((res) => res.json())
        .then((res) => {
            for (let j = 0, k = 1; j < res.batting.length; j++, k++) {
                let name = res.batting[j].name;
                if (res.bat_team.players[res.bat_team.captain].name == name)
                    name += " (C)";
                if (res.bat_team.players[res.bat_team.vice_captain].name == name)
                    name += " (VC)";
                if (res.bat_team.players[res.bat_team.keeper].name == name)
                    name += " (WK)";
                $(`#tab${inn + 1} .shadow:first-child .score-table`).append(`
					<tr>
						<td>${name}<br>
							<span class="batsman-status">${res.batting[j].status}</span>
						</td>
						<td>${res.batting[j].runs}</td>
						<td>${res.batting[j].balls}</td>
						<td>${res.batting[j].fours}</td>
						<td>${res.batting[j].sixes}</td>
						<td>${(res.batting[j].balls == 0 ? 0 : (res.batting[j].runs / res.batting[j].balls * 100)).toFixed(2)}</td>
					</tr>
				`);
            }

            let yet_to_bat = "";
            res.bat_team.players.forEach((ele) => {
                if (res.batting.findIndex(bat => bat.name == ele.name) == -1) {
                    yet_to_bat += ele.name;
                    if (res.bat_team.players[res.bat_team.captain] == ele)
                        yet_to_bat += " (C)";
                    if (res.bat_team.players[res.bat_team.vice_captain] == ele)
                        yet_to_bat += " (VC)";
                    if (res.bat_team.players[res.bat_team.keeper] == ele)
                        yet_to_bat += " (WK)";
                    yet_to_bat += " • ";
                }
            });

            $(`#tab${inn + 1} .shadow:first-child .score-table`).append(`
				<tr class="stats">
					<td>Extras</td>
					<td>${res.extras.wide + res.extras.no_ball + res.extras.byes + res.extras.leg_byes + res.extras.penalty}</td>
					<td colspan="4">(${res.extras.wide} wd, ${res.extras.no_ball} nb, ${res.extras.leg_byes} lb, ${res.extras.byes} b, ${res.extras.penalty} p)</td>
				</tr>
				<tr class="stats">
					<td>Total Runs</td>
					<td>${res.runs}</td>
					<td colspan="4">(${res.wickets} wkts, ${res.overs} ov)</td>
				</tr>`);
            if (yet_to_bat != "")
                $(`#tab${inn + 1} .shadow:first-child .score-table`).append(`
					<tr class="yet-to-bat">
						<td colspan="6">Yet to Bat<br>
							<span class="batsman-status">${yet_to_bat.substring(0, yet_to_bat.length - 3)}</span>
						</td>
					</tr>
				`);

            for (let j = 0; j < res.bowling.length; j++) {
                $(`#tab${inn + 1} .shadow:last-child .score-table`).append(`
					<tr>
						<td>${res.bowling[j].name}</td>
						<td>${res.bowling[j].overs.toFixed(1)}</td>
						<td>${res.bowling[j].maidens}</td>
						<td>${res.bowling[j].runs}</td>
						<td>${res.bowling[j].wickets}</td>
						<td>${(res.bowling[j].overs == 0 ? 0 : res.bowling[j].runs / (parseInt(res.bowling[j].overs.toFixed(1).split('.')[0]) + parseInt(res.bowling[j].overs.toFixed(1).split('.')[1]) / 6)).toFixed(2)}</td>
					</tr>
				`);
            }
        });
}