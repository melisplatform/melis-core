/* 
   tabExpander ---------------------------------------------------------------------------------------------------------------------
   script that handles when there are too many tabs open.
   creates a a slider effect so user can slide through each tabs.
*/
var tabExpander = (function($, window){
	
	// CACHE SELECTORS
	var $body = $("body");
	var $navTabs = $("#melis-id-nav-bar-tabs");
	
	// GLOBAL VARIABLES
	var tabContainerWidthPercent, rightMenuWidthPercent, navUlContainer = 0;
	var status = 'disabled';
	
	//get width width
    var screenSize = jQuery(window).width();
    
    // CHECK IF ENABLED
    function checkStatus(){
    	return status;
    }

    /**
     * Returns a unique main menu from an array.
     * @param {*} $elemArray 
     * @returns uniqueArray
     */
    function getUniqueMainMenu( $elemArray ) {
        var listArray = [], uniqueArray = [], counting = 0, found = false;

            $.each($elemArray, function(i, v) {
                var mainMenu = $(v).data("tool-main-menu");
                
                    if ( mainMenu != null && mainMenu != 'undefined' && mainMenu != '' ) {

                        if ( $.inArray( mainMenu, listArray ) == -1 ) {
                            listArray.push( mainMenu );
                        }
                    }
            });

            for ( var x = 0; x < listArray.length; x++ ) {
              for ( var y = 0; y < uniqueArray.length; y++ ) {
                if ( listArray[x] == uniqueArray[y] ) {
                  found = true;
                }
              }

              counting++;

              if ( counting == 1 && found == false ) {
                uniqueArray.push( listArray[x] );
              }

              found = false;

              counting = 0;
            }
            
            return uniqueArray;
    }

    // append back to #melis-id-nav-bar-tabs, menus less than or equal to 7
    function appendNavMenusOnTabsBar() {
        var $tabs   = $navTabs.find("li"),
            $db     = $tabs.find("[data-tool-id='id_meliscore_toolstree_section_dashboard']");

            // console.log("appendNavMenusOnTabsBar() $closeTab: ", $closeTab);
            // console.log("appendNavMenusOnTabsBar() $tabs.length: ", $tabs.length);

            $.each( $tabs, function(i, v) {
                var $tab    = $(this),
                    tabData = $tab.data();
                    
                    if ( tabData.toolMeliskey !== 'meliscommerce_products_page' || tabData.toolMeliskey !== 'id_meliscms_page_tab_list_container' ) {
                        // console.log("appendNavMenusOnTabsBar() tabData.toolMeliskey: ", tabData.toolMeliskey);
                        $navTabs.append( $tab );
                    }
            });

            if ( $db.length ) {
                // Dashboard tab
                $navTabs.append( $db );
                // Switch to active tab
                melisHelper.tabSwitch('id_meliscore_toolstree_section_dashboard');
            }
    }

    // append nav menus, $navTabsMenus li's, $navMenus li from $navParentGroup
    function appendNavMenus( $menus, $navMenus, navTabsGroup) {
        /**
         * Add the direct children tabs in the first .nav-group-down
         * Insert the nav li inside $navParentGroup tab
         */
        $.each( $menus, function(i, v) {
            //console.log("appendNavMenus $menus i: ", i);
            var $menu       = $(v),
                menuData    = $menu.data(),
                // melisKeys   = menuData.toolMeliskey
                // array values of data-tool-meliskey on .main-menu, https://stackoverflow.com/questions/36719477/array-push-and-unique-items
                melisKeys   = [
                    'meliscore_tab_list_container',
                    'meliscms_tab_list_container',
                    'melismarketing_tab_list_container',
                    'meliscommerce_tab_list_container',
                    'others_tab_list_container',
                    'custom_tab_list_container',
                    'meliscms_page_tab_list_container'
                ];
               
                // console.log("melisKeys.includes( menuData.toolMeliskey ): ", melisKeys.includes( menuData.toolMeliskey ) );
                // menuData.toolMeliskey !== 'meliscore_dashboard'
                if ( ! melisKeys.includes( menuData.toolMeliskey ) ) {
                    $.each( $navMenus, function(i, v) {
                        var $navMenu    = $(v),
                            navMenuData = $navMenu.data();
       
                            // $navMenu.find(".nav-group-dropdown").append( $menu );
                            if ( navMenuData.toolMainMenu == menuData.toolMainMenu ) {
                                $navMenu.find(" > .nav-group-dropdown").append( $menu );
                            }
                    });
                }
        });

        // set active the nav menu .main-menu
        // $navMenus.addClass("has-sub active-parent");
        $navMenus.addClass("has-sub main-menu");
    }

    // open main menu
    function openMainMenu( title, icon, zoneId, melisKey, navTabsGroup, mainMenuGroup, callback ) {
        // console.log("openMainMenu() navTabsGroup: ", navTabsGroup);
        // console.log("openMainMenu() mainMenuGroup: ", mainMenuGroup);
        // title, icon, zoneId, melisKey, parameters, navTabsGroup, mainMenu, callback
        melisHelper.tabOpen( title, icon, zoneId, melisKey, '', navTabsGroup, mainMenuGroup, function() {
            var $navParentGroup = $(".tab-element[data-id='" + navTabsGroup + "']"),
                $navTabsMenus   = $("#melis-id-nav-bar-tabs > li"),
                $navMenus       = $navParentGroup.closest("li"),
                $hasdropdown    = $navMenus.find(".nav-group-dropdown");

                // console.log("openMainMenu() melisKey: ", melisKey);
                
                // check if parent group is found
                if ( $navParentGroup.length ) {
                    // check if parent group has a dropdown
                    if ( $hasdropdown.length ) {
                        // append nav menus, $navTabsMenus li's, $navMenus li from $navParentGroup
                        appendNavMenus( $navTabsMenus, $navMenus, navTabsGroup );
                    }
                    else {
                        // create a sub menu ul and append the $navTabsLi array of elements
                        $navMenus.append("<ul class='nav-group-dropdown'></ul>");
                        
                        // append nav menus, $navTabsMenus li's, $navMenus li from $navParentGroup
                        appendNavMenus( $navTabsMenus, $navMenus, navTabsGroup );
                    }
                }

                // adding of class main-menu
                $navMenus.addClass("main-menu");

                // check if page sub menu section is to be opened
                if ( $navTabs.find("li[data-tool-meliskey='meliscms_page']").length ) {
                    melisCoreTabGrouping.openPageSubMenu();
                }

                // checks on sub menu to add a has-sub class
                melisHelper.checkSubMenu();
        });

        if ( callback && typeof callback === "function" ) {
			callback();
		}
    }

    // check #melis-id-nav-bar-tabs
    function checkNavBarTabs() {
        var $navTabsLi      = $("#melis-id-nav-bar-tabs > li"),
            uniqueMainMenu  = getUniqueMainMenu( $navTabsLi );

            if ( $navTabsLi.length > 7 ) {
                for ( var index = 0; index < uniqueMainMenu.length; index++ ) {
                    var title           = uniqueMainMenu[index],
                        icon            = 'fa-tachometer',
                        mainMenuGroup   = title,
                        mainMenuText    = title.replace(' ', '').split('/')[0], // replace('/', "").replaceAll(" ", "")
                        melisKey        = mainMenuText.toLowerCase()+'_tab_list_container',
                        zoneId          = 'id_'+mainMenuText.toLowerCase()+'_tab_list_container',
                        customTitle     = ( title === 'Custom / Projects' ) ? title.split('/')[0] : title,
                        commonTitle     = ( customTitle === 'Custom' ) ? customTitle : mainMenuText,
                        navTabsGroup    = zoneId;

                        if ( commonTitle != null && commonTitle != 'undefined' ) {
                            // console.log("checkNavBarTabs navTabsGroup: ", navTabsGroup);
                            // open main menu and append the child menus
                            // title, icon, zoneId, melisKey, parameters, navTabsGroup, mainMenu, callback
                            openMainMenu( commonTitle, icon, zoneId, melisKey, navTabsGroup, mainMenuGroup );
                        }
                }
            }
            // else {
                // title, icon, zoneId, melisKey, parameters, navTabsGroup, mainMenu, callback
            // }
    }

	// ENABLE tabExpander(); ---------------------------------------------------------------------------------------------------------
	function Enable() {
	    //set the parent container width and right icons container
        $("#melis-navtabs-container-outer").css({"width": (tabContainerWidthPercent)+"%" });
        $("#plugins-container").css({"width": (rightMenuWidthPercent)+"%"});
        
        //get the width in % of #melis-navtabs-container-inner based from #melis-navtabs-container-outer - 56px for the prevnext buttons
        
        // var innerUlWidthPercent = 99 - ( (100 * 65) / $("#melis-navtabs-container-outer").outerWidth() ); 
        var innerUlWidthPercent = 100 - ( (100 * 65) / $("#melis-navtabs-container-outer").outerWidth() );

        $("#melis-navtabs-container-inner").css({"width": (innerUlWidthPercent)+"%" , "overflow":"hidden"}); // change hidden to initial because of dropdown
        $navTabs.css({"width": navUlContainer });
        
        // $(".melis-tabprev, .melis-tabnext").show();
        checkNavBarTabs();

        $("#melis-id-nav-bar-tabs li").hover(
            function() {
                if ( $(this).find(".nav-group-dropdown") ) {
                    $("#melis-navtabs-container-inner").css("overflow", "visible");
                }
            }, function() {
                $("#melis-navtabs-container-inner").css("overflow", "hidden");
            }
        );

        /* var $navLi = $("#melis-id-nav-bar-tabs li");
            
            $navLi.on({
                mouseenter: function(e) {
                    $(this).closest("#melis-navtabs-container-inner").css("overflow", "visible");                    
                },
                mouseleave: function() {
                    $(this).closest("#melis-navtabs-container-inner").css("overflow", "hidden");
                }
            }); */
	}
		
	// DISABLE tabExpander(); ---------------------------------------------------------------------------------------------------------
	function Disable(){
		//$(".melis-tabprev, .melis-tabnext").hide();
        $("#melis-navtabs-container-outer, #melis-navtabs-container-inner, #plugins-container, #melis-id-nav-bar-tabs").removeAttr("style")
	}
    
	// CHECK TO ACTIVATE tabExpander(); ---------------------------------------------------------------------------------------------
	function checkTE() {

		// CALCULATE ALL POSSIBLE WIDTH FOR THE LEFT, CENTER AND RIGHT MENUS
	    
		//total width of the header
        var totalHeaderWidthPx = $("#id_meliscore_header").width();
        
        // left
        //var leftMenuWidthPx = ( $(".navbar-header").width() === "undefined" ) ? 320 : 0;
        var leftMenuWidthPx = $(".navbar-brand").width();
        var leftMenuWidthPercent = (100 * 274) / totalHeaderWidthPx;
       
        // right
        var rightMenuWidthPx = 0;
        $('#id_meliscore_header .navbar-right > li').each(function() {
            rightMenuWidthPx += $(this).outerWidth();
        });
        rightMenuWidthPercent = (( 100 * rightMenuWidthPx ) / totalHeaderWidthPx ) + 1;
        
        //center
        //var tabContainerWidthPx = totalHeaderWidthPx - ( leftMenuWidthPx + rightMenuWidthPx ) - 320;
        var tabContainerWidthPx = totalHeaderWidthPx - ( leftMenuWidthPx + rightMenuWidthPx );
        /* tabContainerWidthPercent = 99 - ( leftMenuWidthPercent + rightMenuWidthPercent); */
        //tabContainerWidthPercent = 100.5 - ( leftMenuWidthPercent + rightMenuWidthPercent);
        tabContainerWidthPercent = 111.5 - ( leftMenuWidthPercent + rightMenuWidthPercent);
        
        // <ul>
        navUlContainer = 1;
        $('#id_meliscore_header #melis-id-nav-bar-tabs > li').each(function() {
            navUlContainer += $(this).outerWidth();
        });
        		
		// determines if TE should be activated or not
        if ( navUlContainer > tabContainerWidthPx && screenSize  > 768 ) {
        	Enable();
        	status = 'enabled';
        } else if( navUlContainer < tabContainerWidthPx) {
            Disable();
        } else if(status == 'disabled'){
            Disable();
		} else {
        	if ( status === 'enabled' ) {
				Enable();
        		/* Disable(); */
        	}
        	status = 'disabled';
        }
	}
	
	// TAB EXPANDER CONTROLS  --------------------------------------------------------------------------------------------------------
    var xleft, xright, ulContainer;
    function calcOffset(){
        ulContainer = $("#melis-navtabs-container-inner").outerWidth();
        var leftOffset = $navTabs.position().left;
        
        var ulWidth = 1; 
        $('#id_meliscore_header #melis-id-nav-bar-tabs > li').each(function() {
            ulWidth += $(this).outerWidth();
        });

        var rightOffset = ( $("#melis-navtabs-container-inner").outerWidth() - ulWidth ) - leftOffset;
        xleft = Math.abs( $navTabs.position().left );
        xright = Math.abs( ( $("#melis-navtabs-container-inner").outerWidth() - ulWidth ) - leftOffset);
    }
    
    //NEXT 
    $(".melis-tabnext").on("click", function(){
        calcOffset();
        if( xright > ulContainer - 170 ){
            $navTabs.animate({
                left: '-='+ 170
            },0);
        }
        else{
            $navTabs.animate({
                left: '-=' + xright
            },0);
        }
    });
    
    //PREV
    $(".melis-tabprev").on("click", function(){
        calcOffset();
        if( xleft > ulContainer - 170){
            $navTabs.animate({
                left: '+='+ 170
            },0);
        }
        else{
            $navTabs.animate({
                left: '+=' + xleft
            },0);
        }
    }); 
    
	// FOCUS TAB ON CLICK (new functionality)
    /* function focusTab() {
    	
    } */

    // CHECK tabExpander() WHEN WINDOW IS RESIZED
    $(window).on("resize", function(){
        //screenSize = jQuery(window).width();
        if ( screenSize >= 768 ) {
        	checkTE();     
        }
    });

    
    
    
    
    
    
    
    
    
	/* 
    * RETURN ======================================================================================================================== 
    * include your newly created functions inside the object so it will be accessible outside scope
    * sample syntax in calling it outside - tabExpander.checkTE();
    */
	
	return {
		//key - access name outside                                 // value - name of function above
		
		checkTE						:						checkTE,
		//focusTab					:						focusTab,
		Enable						:						Enable,
		Disable						:						Disable,
		checkStatus					:						checkStatus,
        appendNavMenusOnTabsBar     :                       appendNavMenusOnTabsBar,
		openMainMenu                :                       openMainMenu,
        appendNavMenus              :                       appendNavMenus,
        checkNavBarTabs             :                       checkNavBarTabs
	};

})(jQuery, window);