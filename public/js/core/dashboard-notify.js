var dashboardNotify = (function() {

    // cache DOM
    var $body 			    = $("body"),
        $gs                 = $body.find("#"+activeTabId+" .grid-stack"),
        $gsItem             = $gs.find(".grid-stack-item"),
        $mdbPlugins         = $body.find("#"+activeTabId+" .melis-dashboard-plugins"),
        $noPlugins          = $mdbPlugins.find(".no-plugins"),
        $pluginBtn 		    = $body.find("#melisDashBoardPluginBtn"),
        $pluginBtnBox	    = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
        $pluginFilterBtn    = $pluginBtnBox.find(".melis-core-dashboard-filter-btn");

    // instantiate
    if ( $noPlugins.length && $gsItem.length === 0 ) {
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
    }

    // first render function call
    firstRender();

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

    // first render function
    function firstRender() {
        // check if .no-plugins class name is found and no grid stack item is available
        if ( $noPlugins.length && $gsItem.length === 0 ) {
            // check if session is set
            if ( getSession() === undefined ) {
                setConfig();
                runNotify();
                setSession("false");
            } else {
                if ( getSession() === "true" ) {
                    setConfig();
                    runNotify();
                }
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
        runNotify       : runNotify
    };

})();