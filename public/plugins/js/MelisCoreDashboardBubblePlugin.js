var MelisCoreDashboardBubblePlugin = {
    init: function() {
        console.log('bubble init');

        // disable animations on touch devices
        if (Modernizr.touch) {
            $('.melis-dashboard-bubble-plugin')
                .css('visibility', 'visible')
                .find('[class*="icon-"]')
                .css('visibility', 'visible');
            return;
        }

        // disable animations if browser doesn't support css transitions & 3d transforms
        if (!$('html.csstransitions.csstransforms3d').length)
            return;

        // flip
        $('.melis-dashboard-bubble-plugin')
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

        // initialize scroll
        $('.melis-dashboard-bubble-plugin .back .widget-scroll').each(function() {
            console.log($(this).attr('data-scroll-height'));
            $(this).find('.widget-body > div').height($(this).attr('data-scroll-height')).niceScroll({
                cursorwidth: 3,
                zindex: 2,
                cursorborder: "none",
                cursorborderradius: "0",
                cursorcolor: primaryColor
            });
        });
    },
    showBubblePlugins: function () {
        var cookies = document.cookie.split(';');
        var showBubblePlugins = false;
        $.each(cookies, function(key, cookie) {
            if (cookie.indexOf('show_bubble_plugins') >= 0) {
                var value = cookie.split('=');
                if (value[1] === 'true') {
                    showBubblePlugins = true;
                }
            }
        });

        return showBubblePlugins;
    }
};

$(document).ready(function() {
    var $body = $('body');
    var MAX_COOKIE_AGE = 2147483647000;

    $body.on('click', '.melis-dashboard-bubble-plugin .front .btn', function () {
        $(this).closest('.panel-3d').addClass('panel-flip');
    });

    $body.on('click', '.melis-dashboard-bubble-plugin .back .btn', function () {
        $(this).closest('.panel-3d').removeClass('panel-flip');
    });

    $body.on('click', '#btn-show-bubble-plugins', function () {
        updateCookie(true);

        melisHelper.zoneReload(
            'id_meliscore_dashboard_bubble_plugins',
            'meliscore_dashboard_bubble_plugins',
            {
                show: true
            }, function () {
                MelisCoreDashboardBubblePlugin.init()
                MelisCoreDashboardBubbleNewsMelisPlugin.init()
                MelisCoreDashboardBubbleUpdatesPlugin.init()
                MelisCoreDashboardBubbleNotificationsPlugin.init()
                MelisCoreDashboardBubbleChatPlugin.init()
            }
        );
    });

    $body.on('click', '#btn-hide-bubble-plugins', function () {
        updateCookie(false);

        melisHelper.zoneReload(
            'id_meliscore_dashboard_bubble_plugins',
            'meliscore_dashboard_bubble_plugins',
            {
                show: false
            }
        );
    });

    function updateCookie(value) {
        var updatedCookie = encodeURIComponent("show_bubble_plugins") + "=" + encodeURIComponent(value);
        updatedCookie += "; " + "path" + "=" + '/';
        updatedCookie += "; " + "expires" + "=" + new Date(MAX_COOKIE_AGE).toUTCString();
        document.cookie = updatedCookie;
    }
});