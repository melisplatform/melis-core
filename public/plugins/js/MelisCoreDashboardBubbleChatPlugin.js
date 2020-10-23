var MelisCoreDashboardBubbleChatPluginInterval = '';
var MelisCoreDashboardBubbleChatPlugin = {
    init: function() {
        this.getMessages();
    },
    getMessages: function() {
        MelisCoreDashboardBubbleChatPluginInterval = setInterval(this.getMessages, 180000);

        $.ajax({
            type: 'POST',
            url: 'melis/dashboard-plugin/MelisCoreDashboardBubbleChatPlugin/getMessages',
        }).done(function (response) {
            if (response.count > 0) {
                var button = '<button id="dashboard-bubble-chat-back-btn" class="btn btn-info">' + translations.tr_meliscore_dashboard_bubble_plugins_view_messages + '</button>';
                if ($('#dashboard-bubble-chat-back-btn-container').text().length == 0) {
                    $('#dashboard-bubble-chat-back-btn-container').append(button);
                }
            } else {
                $('#dashboard-bubble-chat-back-btn-container').empty();
            }

            $('#dashboard-bubble-chat-plugin-counter').text(response.count);

            $('#dashboard-bubble-chat-plugin-list').empty();
            $.each(response.data, function (key, value) {
                var message = '<div class="media innerAll">\n' +
                    '<i class="fa fa-chat fa-2x float-left disabled"></i>\n' +
                    '<div class="media-body">\n' +
                    '<div class="float-right label label-default">2 days</div>\n' +
                    '<a href="#" class="text-info">' + value.usr_firstname + ' ' + value.usr_lastname + ' </a><em>wrote: </em>\n' +
                    '<p>' + value.msgr_msg_cont_message + '</p>\n' +
                    '<button class="btn btn-info btn-xs dashboard-bubble-chat-read-more" data-senderid="' + value.msgr_msg_cont_sender_id + '">' + translations.tr_meliscore_dashboard_bubble_plugins_read + '</button>\n' +
                    '</div>\n' +
                    '</div>';

                $('#dashboard-bubble-chat-plugin-list').append(message);
            });
        });
    },
    showBackButton: function() {
        var button = '<button id="dashboard-bubble-chat-back-btn" class="btn btn-info">View Messages</button>';
        $('#dashboard-bubble-chat-back-btn-container').append(button);
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