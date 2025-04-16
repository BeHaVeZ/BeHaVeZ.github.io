/*!
* Start Bootstrap - Resume v7.0.4 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

document.addEventListener('DOMContentLoaded', function() {
    const texts = {
        'en': "Hi, I'm Alex, Welcome to my portfolio. Take a look at the projects I've been passionate about making for fun. I hope you find something that's in your interest. <3",
        'nl': "Hey, ik ben Alex, welkom op mijn portfolio. Bekijk de projecten waar ik gepassioneerd aan gewerkt heb. Ik hoop dat je iets vindt dat je interesseert. <3",
    };

    const path = window.location.pathname;
    const lang = path.includes('/nl/') ? 'nl' : 'en';

    const text = texts[lang];
    const typingSpan = document.getElementById('typing');
    let i = 0;
    function typing() {
      if (i < text.length) {
        typingSpan.innerHTML += text.charAt(i);
        i++;
        setTimeout(typing, 25);
      }
    }
    typing();
});