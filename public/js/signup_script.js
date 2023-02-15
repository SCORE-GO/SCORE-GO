let cookies = document.cookie.split(';');

window.addEventListener('load', function () {
	if (cookies[0].search("db") != -1)
		location.replace("/dashboard")
	document.getElementById("preloader").style.display = 'none';
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
		let dup = false;
		await fetch('/get-started/checkduplicate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ 'email': signup.email.value })
		})
			.then((res) => res.json())
			.then((res) => {
				dup = res.duplicate;
			});
		if (dup) {
			Swal.fire({
				icon: 'error',
				title: "Oops..",
				text: 'You are an already registered user. Please Login!',
				confirmButtonText: 'OK',
				confirmButtonColor: '#4153f1'
			}).then((result) => {
				window.location.reload();
			});
		} else {
			let data = {
				full_name: signup.fname.value,
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
							text: 'Please sign to use our services',
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
							confirmButtonText: 'Done',
							confirmButtonColor: '#4153f1'
						})
					}
				});
		}
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
			if (res.login) {
				Swal.fire({
					icon: 'success',
					title: "Login Success!",
					confirmButtonText: 'Done'
				}).then(() => {
					document.cookie = `db = ${res.user_db}; expires = Fri, 31 Dec 9999 23:59:59 GMT`;
					document.cookie = `name = ${res.name}; expires = Fri, 31 Dec 9999 23:59:59 GMT`;
					window.location.href = '/dashboard';
				})
			} else {
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