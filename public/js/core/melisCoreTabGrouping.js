var melisCoreTabGrouping = (function($, window) {
    // variable declaration
	var $body                       = $("body"),
        $window                     = $(window),
        $melisOpenTools             = $(".sideMenu").find(".melis-opentools"),
	    $navTabs                    = $("#melis-id-nav-bar-tabs"),
        $navTabsOuter               = $("#melis-navtabs-container-outer"),
        $pluginContainer            = $("#plugins-container"),
        $navTabsInner               = $("#melis-navtabs-container-inner"),
        screenSize                  = $window.width();

    var tabContainerWidthPercent, rightMenuWidthPercent, navUlContainer = 0,
        status = 'disabled';

        // functions / methods
        function init() {
            $.each( $melisOpenTools, function(i, v) {
                var $this           = $(v),
                    main_menu_text  = $this.parents(".hasSubmenu").find("a > .toolstree-label").text();

                    $this.attr("data-main-menu", main_menu_text);
            });
        }

        // same functionality with tabExpander without the next and prev buttons
        /* function enableTabsGrouping() {
            //get the width in % of #melis-navtabs-container-inner based from #melis-navtabs-container-outer - 56px for the prevnext buttons
            var innerUlWidthPercent = 100 - ( (100 * 65) / $navTabsOuter.outerWidth() );

                //set the parent container width and right icons container
                $navTabsOuter.css({"width": ( tabContainerWidthPercent ) + "%" } );
                $pluginContainer.css({"width": ( rightMenuWidthPercent ) + "%" } );

                // change hidden to initial because of dropdown
                $navTabsInner.css({"width": ( innerUlWidthPercent ) + "%" , "overflow":"hidden" }); 
                $navTabs.css({ "width": navUlContainer });
                
                // $(".melis-tabprev, .melis-tabnext").show(); instead rearrange the $navTabs li
                    
                $navTabsLi.on({
                    mouseenter: function(e) {
                        $(this).closest("#melis-navtabs-container-inner").css("overflow", "visible");                    
                    },
                    mouseleave: function() {
                        $(this).closest("#melis-navtabs-container-inner").css("overflow", "hidden");
                    }
                });
        } */

        // back to the original tabs arrangements
        /* function disableTabsGrouping() {
            // $(".melis-tabprev, .melis-tabnext").hide();
            $("#melis-navtabs-container-outer, #melis-navtabs-container-inner, #plugins-container, #melis-id-nav-bar-tabs").removeAttr("style")
        } */

        // wrapping main menu
        function wrapWithMainMenu( menu, li ) {
            var menuText            = menu.toLowerCase(),
                $navTabsLi          = $navTabs.find("li"),
                //$navMainMenu        = $navTabs.find("li[data-tool-main-menu='"+menu+"']"),
                //$navMainMenuGroup   = $navMainMenu.closest("li"),
                tabCount            = 0;

                tabCount = tabCount + $navTabsLi.length;

                console.log("$navTabsLi.length: ", $navTabsLi.length);
                //console.log("$navMainMenuOut.length: ", $navMainMenuOut.length);
                // console.log("tabCount: ", tabCount);

                if ( $navTabsLi.length >= 3 ) {
                    var $navMainParentGroup = $(".tab-main-element[data-id='" + menu + "']");
                    if ( $navMainParentGroup.length > 0 ) {
                        // console.log("$hasDropDown.length: ", $hasDropDown.length );
                        // console.log("$navMainMenu.length: ", $navMainMenu.length);
                        console.log("$navMainParentGroup.length: ", $navMainParentGroup.length);

                        var $mainNavBox = $navMainParentGroup.closest("li");
                        var $hasDropDown = $navMainParentGroup.find(".main-nav-group-dropdown");
                        
                        // title, icon, zoneId, melisKey, parameters, navTabsGroup, mainMenu, callback
                        melisHelper.tabOpen( menu, '', 'id'+menuText+'_main_menu_nav', menuText+'_main_menu_nav' );

                        if ( $hasDropDown.length ) {
                            console.log("$hasDropDown !!!");
                            if ( $hasDropDown.first().height() > 350 ) {
                                $hasDropDown.first().addClass("scroll");
                            }

                            /* $.each( $navMainMenu, function(i, v) {
                                var $this = $(v);   
                                    $navTabs.append( $this );
                            }); */
                        }
                        else {
                            $navMainMenuGroup.append("<ul class='main-nav-group-dropdown'></ul>");
                            $navMainMenuGroup.find(".main-nav-group-dropdown").append(li);
                        }

                        /* $.each( $navMainMenu, function(i, v) {
                            var $this = $(v);
                                $navMainMenuGroup.append( $this );
                        }); */
                    }
                }

                /* $.each( $navMainMenu, function(i, v) {
                        var $this = $(v);

                            $this
                            
                            $this.append("<ul class='main-nav-group-dropdown'></ul>");
                            $navTabs.find(".main-nav-group-dropdown").append(li);
                    }); */

                //console.log("wrapWidthMainMenu menu: ", menu);
                //console.log("wrapWidthMainMenu li: ", li);
        }

        // inits and events
        init();

        // return objects
        /* return {
            wrapWithMainMenu : wrapWithMainMenu,
            enableTabsGrouping : enableTabsGrouping,
            disableTabsGrouping : disableTabsGrouping
        }; */

})(jQuery, window);