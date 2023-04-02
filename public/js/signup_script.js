let cookies = document.cookie.split(';');

function preventBack() { window.history.forward(); }
setTimeout("preventBack()", 0);
window.onunload = function () { null };

window.addEventListener('load', function () {
	if (cookies[0].search("db") != -1)
		window.location.replace("/dashboard")
	if ($('body').width() > 1100)
		$('#preloader').css('display', 'none');
})

const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");
const signup = document.forms.signup;
const signin = document.forms.signin;

// Sliding
signUpButton.addEventListener("click", () => {
	container.classList.toggle("right-panel-active");
});

signInButton.addEventListener("click", () => {
	container.classList.toggle("right-panel-active");
});

// Password Eyes
Array.from(document.getElementsByClassName('material-icons')).forEach(element => {
	element.addEventListener('mousedown', (event) => {
		element.innerHTML = 'visibility'
		document.getElementById(`p${element.getAttribute("id")}`).type = 'text';
	})
	element.addEventListener('mouseup', (event) => {
		element.innerHTML = 'visibility_off'
		document.getElementById(`p${element.getAttribute("id")}`).type = 'password';
	})
})

signup.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (signup.password.value != signup.cpassword.value) {
		Swal.fire({
			icon: 'error',
			title: "Passwords Don't Match",
			text: 'Please check your password',
			confirmButtonText: 'OK',
			confirmButtonColor: '#4153f1'
		});
	} else {
		await fetch('/get-started/checkduplicate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ 'email': signup.email.value })
		})
			.then((res) => res.json())
			.then(async (res) => {
				if (res.duplicate) {
					Swal.fire({
						icon: 'error',
						title: "Oops..",
						text: 'You are an already registered user. Please Sign in!',
						confirmButtonText: 'OK',
						confirmButtonColor: '#4153f1'
					}).then((result) => {
						window.location.reload();
					});
				} else {
					let data = {
						first_name: signup.fname.value,
						last_name: signup.lname.value,
						phone: signup.phone.value,
						email: signup.email.value,
						password: signup.password.value
					};
					await fetch('/get-started/register', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(data)
					})
						.then((res) => res.json())
						.then((res) => {
							if (res.inserted) {
								Swal.fire({
									icon: 'success',
									title: "Registration Successful!",
									text: 'Please sign in to use our services',
									confirmButtonText: 'Done',
									confirmButtonColor: '#4153f1'
								}).then((result) => {
									window.location.reload();
								});
							} else {
								Swal.fire({
									icon: 'error',
									title: "Registration Unsuccessful!",
									text: 'Please Try Again',
									confirmButtonText: 'OK',
									confirmButtonColor: '#4153f1'
								})
							}
						});
				}
			});
	}
});

signin.addEventListener('submit', async (event) => {
	event.preventDefault();
	await fetch('/get-started/signin', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ 'email': signin.email.value, 'password': signin.password.value })
	})
		.then((res) => res.json())
		.then((res) => {
			if (res.status == "new") {
				Swal.fire({
					icon: 'error',
					title: "New User!",
					text: "Please Sign Up first and then Sign In",
					confirmButtonText: 'OK',
					confirmButtonColor: '#4153f1'
				}).then((result) => {
					window.location.reload();
				});
			} else if (res.status == "pass") {
				document.cookie = `db = ${res.user_db}; expires = Fri, 31 Dec 9999 23:59:59 GMT`;
				document.cookie = `name = ${res.name}; expires = Fri, 31 Dec 9999 23:59:59 GMT`;
				window.location.replace("/dashboard");
			} else if (res.status == "fail") {
				Swal.fire({
					icon: 'error',
					title: "Oops..",
					text: 'Incorrect Username or Password',
					confirmButtonText: 'OK',
					confirmButtonColor: '#4153f1'
				})
			}
		})
})