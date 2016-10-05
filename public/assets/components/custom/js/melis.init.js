/* Remove Envato Frame */
if (window.location != window.parent.location)
    top.location.href = document.location.href;

(function ($, window) {
    // On Load
    $(window).on('load', function () {
        console.log('Melis Init');
    });
})(jQuery, window);