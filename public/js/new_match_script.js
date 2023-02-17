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

//match title and teams validation

bt1.addEventListener("click", async (event) => {
  let title = document.getElementById("title").value;
  let team1 = document.getElementById("team1").value;
  let team2 = document.getElementById("team2").value;
  console.log(title, team1, team2);




  event.preventDefault();

  let firstIndex = team1 === "s1" && team2 === "s2" ? true : false;

  if (title != "" && firstIndex) {
    Swal.fire({
      icon: "error",
      title: "Select Team",
      text: "Please Select Teams",
      confirmButtonText: "OK",
      confirmButtonColor: "#4153f1",
    });
  } else if (title == "" && firstIndex) {
    Swal.fire({
      icon: "error",
      title: "Select Team",
      text: "Please Enter Match Title and select Teams",
      confirmButtonText: "OK",
      confirmButtonColor: "#4153f1",
    });
  } else if (team1 == team2) {
    Swal.fire({
      icon: "error",
      title: "Same Team",
      text: "Please select different teams",
      confirmButtonText: "OK",
      confirmButtonColor: "#4153f1",
    });
  } else if (title != "" && firstIndex) {
    Swal.fire({
      icon: "error",
      title: "Select Team",
      text: "Please Enter Match Title and select Teams",
      confirmButtonText: "OK",
      confirmButtonColor: "#4153f1",
    });
  } else if (title == "") {
    Swal.fire({
      icon: "error",
      title: "Match Title",
      text: "Please Enter Match Title",
      confirmButtonText: "OK",
      confirmButtonColor: "#4153f1",
    });
  } else {
    let twoTeam=[team1,team2]
    let tossWinner=document.getElementById("toss");
    console.log(twoTeam)
  
   twoTeam.forEach(element => {
    $("#toss").append(`<option value=${element}>${element}</option>`);
   });
    switchSlides(1);
   

  }
});

//overs validation

bt2.addEventListener("click", async (event) => {
  event.preventDefault();
  const overbtns = document.querySelectorAll('.limited-overs').value;
  console.log(overbtns);

  
  let venue = document.getElementById("venue").value;
  console.log(venue);

  let umpire1 = document.getElementById("u1").value;
  console.log(umpire1);

  let umpire2 = document.getElementById("u2").value;
  console.log(umpire2);

  let numberRegex=/{-9}/
  let custom_overs = document.getElementById("custom").value;
  if (custom_overs == 0) {
    Swal.fire({
      icon: "error",
      title: "Overs",
      text: "Please Enter Overs",
      confirmButtonText: "OK",
      confirmButtonColor: "#4153f1",
    });
  }
  else if (custom_overs < 0 ) {
    Swal.fire({
      icon: "error",
      title: "Overs",
      text: "Please Enter Valid Overs",
      confirmButtonText: "OK",
      confirmButtonColor: "#4153f1",
    });
  }
  else if (custom_overs == '') {
  for (let i = 0; i < 4; i++) {
    var overs = document.getElementsByClassName("limited-overs")[i].value;
    if (overs != 0) {
      break;
    }
  }

  }
  else {
    switchSlides(2);
  }
 

  
});

finalNext.addEventListener("click", async (event) => {
  event.preventDefault();
});

pr1.addEventListener("click", async (event) => {
  event.preventDefault();
  switchSlides(0);
});

pr2.addEventListener("click", async (event) => {
  event.preventDefault();
  let tossWinner=document.getElementById("toss").options.length = 0;;
  // let team1 = document.getElementById("team1").value;
  // let team2 = document.getElementById("team2").value;
  // let toss
  // let twoTeam=[team1,team2]
  // twoTeam.forEach(element =>   element.remove()  );
  switchSlides(1);
});

//overs

