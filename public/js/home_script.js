let cookies = document.cookie.split(';');

AOS.init({
    disable: false,
    startEvent: 'DOMContentLoaded',
    initClassName: 'aos-init',
    animatedClassName: 'aos-animate',
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: 99,
    offset: 150,
    delay: 0,
    duration: 500,
    easing: 'ease-out',
    once: false,
    mirror: false,
    anchorPlacement: 'top-bottom'
});

// Preloader
window.addEventListener('load', function () {
    if ($('body').width() > 1100)
        $('#preloader').css('display', 'none');
})

$('.getStartedButton').click((event) => {
    if (cookies[0].search("db") == -1)
        window.location.href = "/get-started";
    else
        window.location.href = "/dashboard";
})

let feedback_form = document.getElementById('feedback_form');

feedback_form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await fetch('/sendFeedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: feedback_form.name.value,
            email: feedback_form.email.value,
            feedback: feedback_form.feedback.value
        })
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.submitted) {
                Swal.fire({
                    icon: 'success',
                    title: 'Feedback Submitted!',
                    text: 'Thank you for your feedback.',
                    confirmButtonText: "You're Welcome!"
                }).then(() => window.location.reload())
            }
        })
})