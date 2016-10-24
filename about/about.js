(function ($) {

    var initMobileMenu = function () {
        $('.js-menu-link').on('click', function (event) {
            event.preventDefault();
            $('.js-nav-primary').slideToggle(300);
        });
    };

    $(window).on('load', initMobileMenu);
})(window.jQuery);
