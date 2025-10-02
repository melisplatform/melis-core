var MelisCoreDashboardBubbleNotificationsPluginInterval = '';
var MelisCoreDashboardBubbleNotificationsPlugin = {
    init: function() {
        // initialize card
        $('.melis-dashboard-bubble-notifications-plugin[style=""]')
            .addClass('flip-default')
            .each(function(i){
                var t = $(this);
                setTimeout(function(){
                    t.css('visibility', 'visible').addClass('animated fadeInLeft');
                }, (i+1)*300);
                setTimeout(function(){
                    t.removeClass('flip-default fadeInLeft');
                    setTimeout(function(){
                        t.find('[class*="icon-"]').css('visibility', 'visible').addClass('animated fadeInDown');
                    }, (i+1)*200);
                }, (i+1)*800);
            });

        this.getNotifications();
    },
    getNotifications: function() {
        /* if (MelisCoreDashboardBubbleNotificationsPluginInterval === '')
            MelisCoreDashboardBubbleNotificationsPluginInterval = setInterval(this.getNotifications, 180000); */

        $.ajax({
            type: 'POST',
            url: 'melis/dashboard-plugin/MelisCoreDashboardBubbleNotificationsPlugin/getNotifications',
        }).done(function (response) {
            // plugin front text
            var text = translations.tr_meliscore_dashboard_bubble_plugins_notification;

            if (response.count > 1) {
                text = translations.tr_meliscore_dashboard_bubble_plugins_notifications;
            }

            $('.bubble-notification-plugin-text').empty();
            $('.bubble-notification-plugin-text').append(text);

            // plugin front button text
            if (response.count > 0) {
                var buttonText = translations.tr_meliscore_dashboard_bubble_plugins_view_notification;

                if (response.count > 1) {
                    buttonText = translations.tr_meliscore_dashboard_bubble_plugins_view_notifications;
                }

                var button = '<button id="dashboard-bubble-notifications-back-btn" class="btn btn-success">' + buttonText + '</button>';
                $('.dashboard-bubble-notifications-back-btn-container').each(function(){
                    $(this).empty();
                    $(this).append(button);
                });
            } else {
                $('.dashboard-bubble-notifications-back-btn-container').each(function(){
                    $(this).empty();
                });
            }

            // plugin front counter
            $('.bubble-notification-plugin-counter').each(function(){
                $(this).text(response.count);
            });

            // plugin back content/list
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

$(function() {
    var showBubblePlugins = MelisCoreDashboardBubblePlugin.showBubblePlugins();

        if (showBubblePlugins) {
            MelisCoreDashboardBubbleNotificationsPlugin.init();
        }
});