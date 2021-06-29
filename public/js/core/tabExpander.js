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

                    // console.log("getUniqueMainMenu mainMenu: ", mainMenu);

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

    // check #melis-id-nav-bar-tabs
    function checkNavBarTabs() {
        var $navTabsLi = $navTabs.find("li");
            
            //console.log("checkNavBarTabs() $navTabsLi.length: ", $navTabsLi.length );

            if ( $navTabsLi.length > 7 ) {
                var uniqueMainMenu = getUniqueMainMenu( $navTabsLi );

                    //console.log("uniqueMainMenu: ", uniqueMainMenu );

                    // title, icon, zoneId, melisKey, parameters, navTabsGroup, mainMenu, callback
                    for ( var index = 0; index < uniqueMainMenu.length; index++ ) {
                        var mainMenu        = uniqueMainMenu[index],
                            mainMenuLcase   = mainMenu.toLowerCase(),
                            melisKey        = mainMenuLcase+'_tab_list_container',
                            zoneId          = 'id_'+mainMenuLcase+'_tab_list_container',
                            navTabsGroup    = zoneId;

                            /* $.each($navTabsLi, function(i, v) {
                                if ( i == 1 ) {
                                    console.log('$(v).data(): ', $(v).data() );
                                }
                            }); */

                            if ( mainMenu != null && mainMenu != 'undefined' ) {
                                console.log("mainMenu: ", mainMenu);

                                melisHelper.tabOpen( mainMenu, 'fa-tachometer', zoneId, melisKey, "", navTabsGroup, "");

                                var $alreadyOpen    = $("body #melis-id-nav-bar-tabs li a.tab-element[data-id='id_"+mainMenuLcase+"_tab_list_container']"),
                                    $navBox         = $alreadyOpen.closest("li"),
                                    $hasDropDown    = $navBox.find(".nav-group-dropdown");

                                    //console.log("$alreadyOpen.length: ", $alreadyOpen.length );
                                    
                                    if ( $alreadyOpen.length > 0 ) {
                                        console.log("$hasDropDown.length: ", $hasDropDown.length );
                                        
                                        melisHelper.tabOpen( mainMenu, 'fa-tachometer', zoneId, melisKey, "", navTabsGroup, "");

                                        if ( $hasDropDown.length == 0 ) {
                                            // create dropdown
                                            $navBox.append('<ul class="main-nav-group-dropdown nav-group-dropdown"></ul>');

                                            // insert li's with data-tool-main-menu inside the dropdown

                                        }
                                    }
                            }
                    }
            }
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
        //checkNavBarTabs();

        var $navLi = $("#melis-id-nav-bar-tabs li");
            
            $navLi.on({
                mouseenter: function(e) {
                    $(this).closest("#melis-navtabs-container-inner").css("overflow", "visible");                    
                },
                mouseleave: function() {
                    $(this).closest("#melis-navtabs-container-inner").css("overflow", "hidden");
                }
            });
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
	
	return{
		//key - access name outside                                 // value - name of function above
		
		checkTE						:						checkTE,
		//focusTab					:						focusTab,
		Enable						:						Enable,
		Disable						:						Disable,
		checkStatus					:						checkStatus,
		
	}

})(jQuery, window);