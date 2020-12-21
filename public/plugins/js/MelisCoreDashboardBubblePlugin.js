var MelisCoreDashboardBubblePlugin = {
    init: function() {
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

        // initializing of cards are moved to the individual bubble plugins
        // $('.melis-dashboard-bubble-plugin[style=""]')
        //     .addClass('flip-default')
        //     .each(function(i){
        //         var t = $(this);
        //         setTimeout(function(){
        //             t.css('visibility', 'visible').addClass('animated fadeInLeft');
        //         }, (i+1)*300);
        //         setTimeout(function(){
        //             t.removeClass('flip-default fadeInLeft');
        //             setTimeout(function(){
        //                 t.find('[class*="icon-"]').css('visibility', 'visible').addClass('animated fadeInDown');
        //             }, (i+1)*200);
        //         }, (i+1)*800);
        //     });

        // initialize scroll
        $('.melis-dashboard-bubble-plugin .back .widget-scroll').each(function() {
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
    },
    addMinMaxWidth: function() {
        setTimeout(function() {
            var $body                   = $("body"),
                $gs                     = $body.find("#"+activeTabId + " .grid-stack"),
                gsi                     = $("#"+activeTabId + " .grid-stack").find(".grid-stack-item").length,
                minWidth                = $gs.data("min-width"),
                maxWidth                = $gs.data("max-width"),
                $pluginBtn              = $body.find("#melisDashBoardPluginBtn"),
                $pluginBox              = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
                $bubblePlugin           = $body.find("#bubble-plugin"),
                bubblePluginWidth       = $bubblePlugin.outerWidth(),
                bubblePluginMinWidth    = $bubblePlugin.data("min-width"),
                bubblePluginMaxWidth    = $bubblePlugin.data("max-width");

                // bubble plugin, sets min and max widths
                $bubblePlugin.attr("data-min-width", $bubblePlugin.outerWidth() - $pluginBox.outerWidth() );
                $bubblePlugin.attr("data-max-width", $bubblePlugin.outerWidth() );

                // display #bubble-plugin width
                $bubblePlugin.css("width", $bubblePlugin.outerWidth() );

                // check if plugins menu is open, adjust .grid-stack width accordingly
                /* console.log("1000 $pluginBox hasClass shown gsi bubblePlugin length: ", $pluginBox.hasClass("shown"))
                console.log("gsi: ", gsi);
                console.log("$bubble.length: ", $bubblePlugin.length ); */

                if ( $pluginBox.hasClass("shown") && gsi === 0 && $bubblePlugin.length ) {
                    /* console.log("inside if statement!!");
                    console.log("bubblePluginMinWidth: ", bubblePluginMinWidth); */
                    $bubblePlugin.animate({
                        width: bubblePluginMinWidth
                    }, 3);
                }
            }, 1000);
    }
};

$(function() {
    var $body = $('body');
    var MAX_COOKIE_AGE = 2147483647000;

        //MelisCoreDashboardBubblePlugin.addMinMaxWidth();

        // flipping the card
        $body.on('click', '.melis-dashboard-bubble-plugin .front .btn', function () {
            $(this).closest('.panel-3d').addClass('panel-flip');

            // fix bug where in the body will not be scrollable even if nice scroll was already initialized
            $(this).closest('.melis-dashboard-bubble-plugin').find('.back-container').getNiceScroll().onResize();
        });

        // flipping the card back to front
        $body.on('click', '.melis-dashboard-bubble-plugin .back .btn', function () {
            $(this).closest('.panel-3d').removeClass('panel-flip');
        });

        // show plugins
        $body.on('click', '#btn-show-bubble-plugins', function () {
            updateCookie(true);

            melisHelper.zoneReload(
                'id_meliscore_dashboard_bubble_plugins',
                'meliscore_dashboard_bubble_plugins',
                {
                    show: true
                }, function () {
                    MelisCoreDashboardBubblePlugin.init();
                    MelisCoreDashboardBubbleNewsMelisPlugin.init();
                    MelisCoreDashboardBubbleUpdatesPlugin.init();
                    MelisCoreDashboardBubbleNotificationsPlugin.init();
                    MelisCoreDashboardBubbleChatPlugin.init();

                    $("#id_meliscore_dashboard_bubble_plugins").removeClass("hide-flip-cards");
                }
            );

            MelisCoreDashboardBubblePlugin.addMinMaxWidth();
        });

        // hide plugins
        $body.on('click', '#btn-hide-bubble-plugins', function () {
            updateCookie(false);

            melisHelper.zoneReload(
                'id_meliscore_dashboard_bubble_plugins',
                'meliscore_dashboard_bubble_plugins',
                {
                    show: false
                },
                function() {
                    $("#id_meliscore_dashboard_bubble_plugins").addClass("hide-flip-cards");
                }
            );

            MelisCoreDashboardBubblePlugin.addMinMaxWidth();
        });

        function updateCookie(value) {
            var updatedCookie = encodeURIComponent("show_bubble_plugins") + "=" + encodeURIComponent(value);
            updatedCookie += "; " + "path" + "=" + '/';
            updatedCookie += "; " + "expires" + "=" + new Date(MAX_COOKIE_AGE).toUTCString();
            document.cookie = updatedCookie;
        }

        if ( $("#btn-show-bubble-plugins").length ) {
            $("#id_meliscore_dashboard_bubble_plugins").addClass("hide-flip-cards");
        }
        else {
            $("#id_meliscore_dashboard_bubble_plugins").removeClass("hide-flip-cards");
        }
});