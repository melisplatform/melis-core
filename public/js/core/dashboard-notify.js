var dashboardNotify = (function() {
    //var eh = null;
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
        tpd                 = $body.find("#"+activeTabId+".tab-panel-dashboard").hasClass("active"),
        $melisDashboard     = $body.find("#"+activeTabId+"[data-meliskey='meliscore_dashboard']"),
        $dashMsg            = $body.find("#melis-core-dashboard-msg");

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
        setTimeout(function() {
            var body        = $("body"),
                $gs         = body.find("#"+activeTabId+" .grid-stack"),
                $gsItem     = $gs.find(".grid-stack-item"),
                $gsItemLen  = $gsItem.length,
                $pluginBox  = body.find(".melis-core-dashboard-dnd-box"),
                shown       = $pluginBox.hasClass("shown");
              
                // check if there is grid stack item and plugin menu is open
                if ( $gsItem.length === 0 && shown === true ) {
                    render();
                } else {
                    removeEnjoyHintHtml();
                }
        }, 500 );
    }

    // remove enjoyhint html elements / remove style overflow hidden caused by enjoyhint while it is hidden
    function removeEnjoyHintHtml() {
        $body.find(".enjoyhint").remove();
        $body.removeAttr("style");
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
        // checking for .tab-panel-dashboard has .active class
        if ( tpd ) {
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
        runNotify                   :       runNotify,
        render                      :       render,
        getCookie                   :       getCookie,
        removeEnjoyHintHtml         :       removeEnjoyHintHtml
    };

})();

$(function() {
    var $body           = $("body"),
        activeModule    = $body.find("#melis-core-dashboard-msg").data("activeMods").split("-");

        // check if melisUserTabs is currently an active module and it is defined
        if ( $.inArray( "MelisUserTabs", activeModule ) !== -1 && typeof melisUserTabs !== "undefined" ) {
            // melis-user-tabs.js init
            melisUserTabs.init();
        } 
        else {
            // own init
            dashboardNotify.init();
        }
});