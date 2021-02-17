var MelisCoreDashboardBubbleChatPluginInterval = '';
var MelisCoreDashboardBubbleChatPlugin = {
    init: function() {
        // initialize card
        $('.melis-dashboard-bubble-chat-plugin[style=""]')
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

        this.getMessages();
    },
    getMessages: function() {
        if (MelisCoreDashboardBubbleChatPluginInterval === '')
            MelisCoreDashboardBubbleChatPluginInterval = setInterval(this.getMessages, 180000);

        $.ajax({
            type: 'POST',
            url: 'melis/dashboard-plugin/MelisCoreDashboardBubbleChatPlugin/getMessages',
        }).done(function (response) {
            // plugin front text
            var text = translations.tr_meliscore_dashboard_bubble_plugins_message;

            if (response.count > 1) {
                text = translations.tr_meliscore_dashboard_bubble_plugins_messages;
            }

            $('.dashboard-bubble-chat-plugin-text').empty();
            $('.dashboard-bubble-chat-plugin-text').text(text);

            // plugin front button text
            if (response.count > 0) {
                var buttonText = translations.tr_meliscore_dashboard_bubble_plugins_view_message;

                if (response.count > 1) {
                    buttonText = translations.tr_meliscore_dashboard_bubble_plugins_view_messages;
                }

                var button = '<button id="dashboard-bubble-chat-back-btn" class="btn btn-info">' + buttonText + '</button>';
                $('.dashboard-bubble-chat-back-btn-container').each(function() {
                    $(this).empty();
                    $(this).append(button);
                });
            } else {
                $('.dashboard-bubble-chat-back-btn-container').each(function() {
                    $(this).empty();
                });
            }

            // plugin front counter
            $('.dashboard-bubble-chat-plugin-counter').each(function() {
                $(this).text(response.count);
            });

            // plugin back content/list
            $('.dashboard-bubble-chat-plugin-list').each(function() {
                $(this).empty();
            });

            $.each(response.data, function (key, value) {
                var message = '<div class="media innerAll">\n' +
                    '<div class="media-body">\n' +
                    '<div class="row">\n' +
                    '<div class="col-md-7">\n' +
                    '<a href="#" class="text-info">' + value.usr_firstname + ' ' + value.usr_lastname + ' </a><em>' + translations.tr_meliscore_dashboard_bubble_plugins_wrote + ': </em>\n' +
                    '<p>' + ((value.msgr_msg_cont_message.length > 115) ? value.msgr_msg_cont_message.substring(0, 115) + '...' : value.msgr_msg_cont_message) + '</p>\n' +
                    '</div>\n' +
                    '<div class="col-md-2">\n' +
                    '<div class="float-right label label-default">' + value.msgr_msg_cont_date + '</div>\n' +
                    '</div>\n' +
                    '<div class="col-md-2">\n' +
                    '<button class="btn btn-info btn-xs dashboard-bubble-chat-read-more" data-senderid="' + value.msgr_msg_cont_sender_id + '">' + translations.tr_meliscore_dashboard_bubble_plugins_read + '</button>\n' +
                    '</div>\n' +
                    '</div>\n' +
                    '</div>\n' +
                    '</div>';

                $('.dashboard-bubble-chat-plugin-list').each(function(){
                    $(this).append(message);
                });
            });
        });
    }
};

$(document).ready(function() {
    var $body = $('body');
    var msgrTotalNotificationMsg = 0;
    var msgrFirstLoad = true;
    var showBubblePlugins = MelisCoreDashboardBubblePlugin.showBubblePlugins();

    if (showBubblePlugins) {
        MelisCoreDashboardBubbleChatPlugin.init();
    }

    $body.on('click', '.dashboard-bubble-chat-read-more', function () {
        var senderId = $(this).data('senderid');
        openMessengerTab(senderId);
    });

    //function to open the messenger tab
    function openMessengerTab(senderId) {
        var userName = $("#user-name-link").html().trim();
        melisHelper.tabOpen(userName, 'fa-user', 'id_meliscore_user_profile', 'meliscore_user_profile', null, null, function () {
            $body.find('#melis-messenger-tab a').click();
            waitForEl('.list-group-item.selectContact', function () {
                $body.find('.selectContact[data-contact-id="' + senderId + '"]').click();
            });
        });
    }

    function waitForEl(selector, callback){
        var poller1 = setInterval(function(){
            $jObject = $(selector);
            if($jObject.length < 1){
                return;
            }
            clearInterval(poller1);
            callback($jObject)
        },100);
    }
});