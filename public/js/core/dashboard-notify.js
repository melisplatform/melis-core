var dashboardNotify = (function($) {
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
        $pluginBtn 		    = $body.find("#melisDashBoardPluginBtn"),
        $pluginBtnBox	    = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
        $pluginFilterBtn    = $pluginBtnBox.find(".melis-core-dashboard-filter-btn"),
        $melisDashboard     = $body.find("#"+activeTabId+"[data-meliskey='meliscore_dashboard']");

    // instantiate
    var eh = new EnjoyHint({
        onStart: function() {
            disablePluginsMenuButton();
        },
        onSkip: function() {
            enablePluginsMenuButton();
        },
        onEnd: function() {
            enablePluginsMenuButton();
        }
    });

    // clicking on close button will enable back the plugins menu buttons
    $body.on("click", ".enjoyhint_close_btn", function() {
        enablePluginsMenuButton();
    });

    // init
    function init() {
        // setTimeout to run enjoyhint
        setTimeout(function() {
            // local variables upon document ready
            var $body           = $("body"),
                $gs             = $body.find("#"+activeTabId+" .grid-stack"),
                $gsItem         = $gs.find(".grid-stack-item"),
                $pluginBtnBox   = $body.find(".melis-core-dashboard-dnd-box");
                shown           = $pluginBtnBox.hasClass("shown");

                if ( $gsItem.length === 0 && shown === true ) {
                    dashboardNotify.render();
                } else {
                    dashboardNotify.removeEnjoyHintHtml();
                }
        }, 1000);
    }

    // remove enjoyhint html elements / remove style overflow hidden caused by enjoyhint while it is hidden
    function removeEnjoyHintHtml() {
        $body.find(".enjoyhint").remove();
        $body.removeAttr("style");
        //$body.css("overflow", "auto");
    }

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
        removeEnjoyHintHtml();
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

        eh.setScript( steps );
    }

    // run enjoy hint script
    function runNotify() {
        if ( $melisDashboard.length ) {
            eh.runScript();
        }
    }

    // render function
    function render() {
        // check if cookie is set
        if ( getCookie() === undefined ) {
            setConfig();
            runNotify();
            setCookie("false");
        } else {
            if ( getCookie() === "true" ) {
                setConfig();
                runNotify();
            } else {
                removeEnjoyHintHtml();
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
        init                        :       init,
        render                      :       render,
        getCookie                   :       getCookie,
        removeEnjoyHintHtml         :       removeEnjoyHintHtml
    };

})($_);

(function($) {
    // init
    dashboardNotify.init();
})($_);
// $_ for var $_ = jQuery.noConflict(true) on public/assets/components/plugins/enjoyhint/js/all.js which uses jQuery v3.3.1 for enjoyhint