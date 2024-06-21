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

        /* // initializing of cards are moved to the individual bubble plugins
        $('.melis-dashboard-bubble-plugin[style=""]')
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
            }); */

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
        var setBubblePluginInterval = setInterval(function() {
            var $body                   = $("body"),
                $lm 		            = $("#id_meliscore_leftmenu"),
                lmWidth 	            = $lm.outerWidth(),
                $dbPluginMenuBtn 	    = $("#melisDashBoardPluginBtn"),
                $dbPluginMenu 		    = $("#id_meliscore_center_dashboard_menu"),
                dbpmWidth 		        = $dbPluginMenu.outerWidth(),
                $activeTabId            = $("#"+activeTabId),
                $bp                     = $("#"+activeTabId+" .bubble-plugin"),
                $gs                     = $activeTabId.find(".grid-stack"),
                animationDuration       = 50;
                
                if ( $bp.length ) {
                    //setTimeout(function() {
                        if ( ! $dbPluginMenu.hasClass("shown") && ! $lm.hasClass("shown") ) {
                            //console.log(`bubble plugin, plugin box not shown, melis left menu not shown`);
                            $bp.attr("data-min-width", $bp.outerWidth() - (dbpmWidth + lmWidth) );
                            $bp.attr("data-max-width", $bp.outerWidth() - lmWidth);

                            $bp.css("width", $bp.outerWidth() );
                        } 
                        else if ( $dbPluginMenu.hasClass("shown") && $lm.hasClass("shown") ) {
                            //console.log(`bubble plugin, plugin box shown, melis left menu shown`);
                            $bp.attr("data-min-width", $bp.outerWidth() - lmWidth + 50 );
                            $bp.attr("data-max-width", $bp.outerWidth() );

                            $bp.css("width", $bp.outerWidth() - lmWidth + 50);
                        } 
                        else if ( ! $dbPluginMenu.hasClass("shown") && $lm.hasClass("shown") ) {
                            //console.log(`bubble plugin, plugin box not shown, melis left menu shown`);
                            $bp.attr("data-min-width", $bp.outerWidth() - dbpmWidth );
                            $bp.attr("data-max-width", $bp.outerWidth() );

                            $bp.css("width", $bp.outerWidth() );
                        } 
                        else if ( $dbPluginMenu.hasClass("shown") && ! $lm.hasClass("shown") ) {
                            //console.log(`bubble plugin, plugin box shown, melis left menu not shown`);
                            $bp.attr("data-min-width", $bp.outerWidth() - (lmWidth + dbpmWidth) );
                            $bp.attr("data-max-width", $bp.outerWidth() - lmWidth );

                            $bp.css("width", $bp.outerWidth() - dbpmWidth );
                        }
                    //}, 500);

                    clearInterval( setBubblePluginInterval );
                }
        }, 500);
    }
};

$(function() {
    var $body                   = $('body'),
        MAX_COOKIE_AGE          = 2147483647000,
        $bubblePluginWrapper    = $("#bubble-plugin"),
        $bubbleShowButton       = $("#btn-show-bubble-plugins"),
        $bubbleHideButton       = $("#btn-hide-bubble-plugins"),
        $dbMsg                  = $body.find(".melis-core-dashboard-msg");

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

        let num = 0;
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

                    // checks min-width and max-width attribute for #bubble-plugin element
                    MelisCoreDashboardBubblePlugin.addMinMaxWidth();

                    // check dashboard message and grid-stack
                    checkDashboardMsg();
                }
            );
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
                    // checks min-width and max-width attribute for #bubble-plugin element
                    MelisCoreDashboardBubblePlugin.addMinMaxWidth();

                    // check dashboard message and grid-stack
                    checkDashboardMsg();

                    // delay adding of the class .transition3ms
                    //delayTransitionAnimation();

                    if ( $("#bubble-plugin.mb-20px").length ) {
                        $("#bubble-plugin").removeClass("mb-20px");
                    }
                }
            );
        });

        function updateCookie(value) {
            var updatedCookie = encodeURIComponent("show_bubble_plugins") + "=" + encodeURIComponent(value);
            updatedCookie += "; " + "path" + "=" + '/';
            updatedCookie += "; " + "expires" + "=" + new Date(MAX_COOKIE_AGE).toUTCString();
            document.cookie = updatedCookie;
        }

        // check if #bubble-plugin wrapper is present and that dashboard message notification is found and is visible
        function checkDashboardMsg() {
            if ( $bubblePluginWrapper.length ) {    
                if ( $dbMsg.length && $dbMsg.is(":visible") ) {
                    if ( $dbMsg.closest(".melis-dashboard-plugins").find(".pt-0").length > 0 ) {
                        $dbMsg.closest(".melis-dashboard-plugins").removeClass("pt-0");
                    }
                    else {
                        $dbMsg.closest(".melis-dashboard-plugins").addClass("pt-0");
                    }
                }
                else if ( melisDashBoardDragnDrop.countGsItems() > 0 ) {
                    if ( $dbMsg.closest(".melis-dashboard-plugins").find(".pt-0").length > 0 ) {
                        $dbMsg.closest(".melis-dashboard-plugins").removeClass("pt-0");
                    }   
                    else {
                        $dbMsg.closest(".melis-dashboard-plugins").addClass("pt-0");
                    }
                }
            }
        }

        // #content, .transition3ms
        function delayTransitionAnimation() {
            var $content        = $("#content"),
                $transitionAnim = $("#content.transition3ms");

                if ( $transitionAnim.length ) {
                    $content.removeClass("transition3ms");
                }
        }

        // check for hide or show button is found
        function checkIfHideOrShowButton() {
            if ( $bubbleHideButton.length && $bubblePluginWrapper.hasClass("mb-20px") ) {
                $bubblePluginWrapper.addClass("mb-20px");
            }
            else {
                $bubblePluginWrapper.removeClass("mb-20px");
            }
        }

        // check dashboard message and grid-stack function call on document ready
        checkDashboardMsg();

        // call to run function
        checkIfHideOrShowButton();
});