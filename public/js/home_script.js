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
var preloader = document.getElementById("preloader");
window.addEventListener('load', function () {
    preloader.style.display = 'none';
})