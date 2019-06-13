var dashboardNotify = (function() {
    /**
     * To make a "persistent cookie" (a cookie that "never expires"),
     * we need to set a date/time in a distant future (one that possibly exceeds the user's
     * machine life).
     *
     * src: https://stackoverflow.com/a/22479460/7870472
     */
    var MAX_COOKIE_AGE = 2147483647000;

    // cache DOM
    var $body 			    = $("body"),
        $gs                 = $body.find("#"+activeTabId+" .grid-stack"),
        $gsItem             = $gs.find(".grid-stack-item"),
        $pluginBtn 		    = $body.find("#melisDashBoardPluginBtn"),
        $pluginBtnBox	    = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
        $pluginFilterBtn    = $pluginBtnBox.find(".melis-core-dashboard-filter-btn"),
        $noAvailPlugins     = $pluginBtnBox.find(".melis-core-dashboard-ps-box");

    // instantiate
    var eh = new EnjoyHint({
        onStart:function() {
            disablePluginsMenuButton();
        },
        onEnd: function() {
            enablePluginsMenuButton();
        }
    });

    // first render function call
    //render();

    // clicking on close button will enable back the plugins menu buttons
    $body.on("click", ".enjoyhint_close_btn", function() {
        enablePluginsMenuButton();
    });

    // disable plugins menu buttons
    function disablePluginsMenuButton() {
        $pluginBtn.prop("disabled", true);
        $pluginFilterBtn.prop("disabled", true);
        $pluginBtn.css("cursor", "auto");
        $pluginFilterBtn.css("cursor", "auto");
    }

    // enable plugins menu buttons
    function enablePluginsMenuButton() {
        $pluginBtn.prop("disabled", false);
        $pluginFilterBtn.prop("disabled", false);
        $pluginBtn.css("cursor", "pointer");
        $pluginFilterBtn.css("cursor", "pointer");
    }

    // set scripts config
    function setConfig() {
        var steps = [
            {
                "next #melisDashBoardPluginBtn" : translations.tr_meliscore_dashboard_notify_step_1_msg,
                shape: 'rect',
                showSkip: true,
                nextButton: {
                    text: translations.tr_meliscore_dashboard_notify_steps_general_next_text
                },
                skipButton: {
                    text: translations.tr_meliscore_dashboard_notify_steps_general_skip_text
                }
            },
            {
                "next .melis-core-dashboard-ps-box" : translations.tr_meliscore_dashboard_notify_step_2_msg,
                shape: 'rect',
                showSkip: false,
                nextButton: {
                    text: translations.tr_meliscore_dashboard_notify_step_2_next_text
                }
            }
        ];

        eh.set( steps );
    }

    // run enjoy hint script
    function runNotify() {
        eh.run();
    }

    // check for some element use case
    function checkElementsBeforeRun() {
        // check if no plugins found and no grid stack item is available
        if ( $gsItem.length === 0 ) {
            if ( $noAvailPlugins.length === 0 ) {
                runNotify();
            } else {
                if ( $pluginBtnBox.hasClass("shown") ) {
                    runNotify();
                }
            }
        }
    }

    // render function
    function render() {
        // check if session is set
        if ( getCookie() === undefined ) {
            setConfig();
            checkElementsBeforeRun();
            setCookie("false");
        } else {
            if ( getCookie() === "true" ) {
                setConfig();
                checkElementsBeforeRun();
            }
        }
    }

    function setCookie(value) {
        var defaultOptions = {
            path: '/',
            expires: new Date(MAX_COOKIE_AGE).toUTCString()
        };
        var updatedCookie = encodeURIComponent("dashboard_notify") + "=" + encodeURIComponent(value);
        updatedCookie += "; " + "path" + "=" + defaultOptions.path;
        updatedCookie += "; " + "expires" + "=" + defaultOptions.expires;
        document.cookie = updatedCookie;
    }

    function getCookie() {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + "dashboard_notify".replace("/([\.$?*|{}\(\)\[\]\\\/\+^])/g", '\\$1') + "=([^;]*)"
        ));

        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    return {
        runNotify   :   runNotify,
        render      :   render
    };

})();

$(function(){
    setTimeout(function() {
        var $body           = $("body"),
            $pluginBtnBox   = $body.find(".melis-core-dashboard-dnd-box"),
            shown           = $pluginBtnBox.hasClass("shown");

            if ( shown ) {
                dashboardNotify.render();
            }
    }, 1000);
});