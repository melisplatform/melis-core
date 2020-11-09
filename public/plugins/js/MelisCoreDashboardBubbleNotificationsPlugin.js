var MelisCoreDashboardBubbleNotificationsPluginInterval = '';
var MelisCoreDashboardBubbleNotificationsPlugin = {
    init: function() {
        this.getNotifications();
    },
    getNotifications: function() {
        if (MelisCoreDashboardBubbleNotificationsPluginInterval === '')
            MelisCoreDashboardBubbleNotificationsPluginInterval = setInterval(this.getNotifications, 180000);

        $.ajax({
            type: 'POST',
            url: 'melis/dashboard-plugin/MelisCoreDashboardBubbleNotificationsPlugin/getNotifications',
        }).done(function (response) {
            if (response.count > 0) {
                var button = '<button id="dashboard-bubble-notifications-back-btn" class="btn btn-success">' + translations.tr_meliscore_dashboard_bubble_plugins_view_notifications + '</button>';
                $('.dashboard-bubble-notifications-back-btn-container').each(function(){
                    $(this).empty();
                    $(this).append(button);
                });
            } else {
                $('.dashboard-bubble-notifications-back-btn-container').each(function(){
                    $(this).empty();
                });
            }

            $('.bubble-notification-plugin-counter').each(function(){
                $(this).text(response.count);
            });

            $('.bubble-notifications-list').each(function(){
                $(this).empty();
            });

            $.each(response.data, function (key, value) {
                var notification = '<tr>\n' +
                    '<td class="center">' + value.date_trans + '</td>\n' +
                    '<td class="center">' + value.title + '</td>\n' +
                    '<td class="center">' + value.message + '</td>\n' +
                    '</tr>';

                $('.bubble-notifications-list').each(function(){
                    $(this).append(notification);
                });
            });
        });
    }
};

$(document).ready(function() {
    var showBubblePlugins = MelisCoreDashboardBubblePlugin.showBubblePlugins();

    if (showBubblePlugins) {
        MelisCoreDashboardBubbleNotificationsPlugin.init();
    }
});