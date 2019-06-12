var dashboardNotify = (function() {
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
            $pluginBtn.prop("disabled", true);
            $pluginFilterBtn.prop("disabled", true);
        },
        onEnd: function() {
            $pluginBtn.prop("disabled", false);
            $pluginFilterBtn.prop("disabled", false);
        }
    });

    // first render function call
    //render();
    

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
        if ( getSession() === undefined ) {
            setConfig();
            checkElementsBeforeRun();
            setSession("false");
        } else {
            if ( getSession() === "true" ) {
                setConfig();
                checkElementsBeforeRun();
            }
        }
    }

    // set session
    function setSession( value ) {
        $.session.set("dashboard_notify", value);
    }

    // get session
    function getSession() {
        return $.session.get("dashboard_notify");
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