let cookies = document.cookie.split(';');

// AOS.init({
//     disable: false,
//     startEvent: 'DOMContentLoaded',
//     initClassName: 'aos-init',
//     animatedClassName: 'aos-animate',
//     useClassNames: false,
//     disableMutationObserver: false,
//     debounceDelay: 50,
//     throttleDelay: 99,
//     offset: 150,
//     delay: 0,
//     duration: 500,
//     easing: 'ease-out',
//     once: false,
//     mirror: false,
//     anchorPlacement: 'top-bottom'
// });

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

$('.feedback__button').click((event) => {
    // event.preventDefault();
})