/*
 * Renders guide tours / feature tutorial
 * using EnjoyHint specifically on dashboard
 * public/assets/components/plugins/enjoyhint
 */
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
        $pluginBtn 		    = $body.find("#melisDashBoardPluginBtn"),
        $pluginBtnBox	    = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
        $pluginFilterBtn    = $pluginBtnBox.find(".melis-core-dashboard-filter-btn"),
        $tpd                = $("#"+activeTabId+".tab-panel-dashboard").find(".active"),
        $melisDashboard     = $body.find("#"+activeTabId+"[data-meliskey='meliscore_dashboard']"),
        $dashMsg            = $body.find(".melis-core-dashboard-msg");

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
        var $gs         = $("#"+activeTabId+" .grid-stack"),
            $gsItem     = $gs.find(".grid-stack-item"),
            $pluginBox  = $("#id_meliscore_center_dashboard_menu"),
            melisKey    = $("#"+activeTabId).attr("data-meliskey");

            // check if there is grid stack item and plugin menu is open, && $pluginBox.hasClass("shown")
            if ( melisKey === "meliscore_dashboard" && $gsItem.length === 0 ) {
                var interval = setInterval(function() {
                    if ( $pluginBox.length > 0 && $pluginBox.hasClass("shown") ) {
                        render();
                        clearInterval( interval );
                    }
                }, 2000);
            } else {
                removeEnjoyHintHtml();
            }
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
        eh.runScript();
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
            samesite: 'Strict',
            expires: new Date(MAX_COOKIE_AGE).toUTCString()
        };
        var updatedCookie = encodeURIComponent("dashboard_notify") + "=" + encodeURIComponent(value);
            updatedCookie += "; " + "path" + "=" + defaultOptions.path;
            updatedCookie += "; " + "expires" + "=" + defaultOptions.expires;
            updatedCookie += "; " + "samesite" + "=" + defaultOptions.samesite;
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
    var $dbMsg          = $("#"+activeTabId).find(".melis-core-dashboard-msg"),
        mods            = $dbMsg.data("activeMods"),
        $noDbAccess     = $(".no-dashboard-access"),
        activeModule    = ( mods !== undefined ) ? mods.match(/MelisUserTabs/g) : '';

        if ( $dbMsg.length > 0 ) {
            /* 
            * Check if melisUserTabs is currently an active module.
            * Negate to run the local dashboardNotify.init() function.
            * If MelisUserTabs is an activeModule then it executes dashboardNotify.init() function
            * from with melisUserTabs ajax call.
            */
            //if ( ! $.inArray( "MelisUserTabs", activeModule ) !== -1 ) {
            if ( activeModule !== null ) {
                melisUserTabs.getUserSavedOpenTabs();
            }
            else {
                dashboardNotify.init();
            }
        }
        
        if ( $noDbAccess.length > 0 ) {
            dashboardNotify.removeEnjoyHintHtml();
        }
});
