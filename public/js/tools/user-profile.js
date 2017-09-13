$(function() {
    $("body").on("click", "#img-user-link, #user-name-link", function(event) {
        var userName = $("#user-name-link").html().trim();
        melisHelper.tabOpen(userName, 'fa-user', 'id_meliscore_user_profile', 'meliscore_user_profile')
        event.preventDefault();
    });
});