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
    function checkStatus() {
    	return status;
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
        
        $(".melis-tabprev, .melis-tabnext").show();

        // toggle overflow for dropdown
        $("#melis-navtabs-container-inner").hover(
            function() {
                $(this).css("overflow", "visible");
            }, function() {
                $(this).css("overflow", "hidden");
            }
        );
	}
		
	// DISABLE tabExpander(); ---------------------------------------------------------------------------------------------------------
	function Disable() {
		$(".melis-tabprev, .melis-tabnext").hide();
        $("#melis-navtabs-container-outer, #melis-navtabs-container-inner, #plugins-container, #melis-id-nav-bar-tabs").removeAttr("style")
	}
    
    
	// CHECK TO ACTIVATE tabExpander(); ---------------------------------------------------------------------------------------------
	function checkTE(){

		// CALCULATE ALL POSSIBLE WIDTH FOR THE LEFT, CENTER AND RIGHT MENUS
	    
		//total width of the header
        var totalHeaderWidthPx = $("#id_meliscore_header").width();
        
        // left
        //var leftMenuWidthPx = $(".navbar-header").width();
        var leftMenuWidthPx = $("#brand-logo").width();
        var leftMenuWidthPercent = (100 * leftMenuWidthPx) / totalHeaderWidthPx;
        
        // right
        var rightMenuWidthPx = 0;
        $('#id_meliscore_header .navbar-right > li').each(function() {
            rightMenuWidthPx += $(this).outerWidth();
        });
        rightMenuWidthPercent = (( 100 * rightMenuWidthPx ) / totalHeaderWidthPx ) + 1;
        
        //center
        var tabContainerWidthPx = totalHeaderWidthPx - ( leftMenuWidthPx + rightMenuWidthPx ); // - 320
        // tabContainerWidthPercent = 99 - ( leftMenuWidthPercent + rightMenuWidthPercent);
        // tabContainerWidthPercent = 100.5 - ( leftMenuWidthPercent + rightMenuWidthPercent);
        tabContainerWidthPercent = 113.7 - ( leftMenuWidthPercent + rightMenuWidthPercent);
        
        // <ul>
        navUlContainer = 1;
        $('#id_meliscore_header #melis-id-nav-bar-tabs > li').each(function() {
            navUlContainer += $(this).outerWidth();
        });
		
		// determines if TE should be activated or not
        if( navUlContainer > tabContainerWidthPx && screenSize  > 768 ){
        	Enable();
        	status = 'enabled';
        } else if( navUlContainer < tabContainerWidthPx){
			Disable();
        } else if(status == 'disabled'){
			Disable();
		} else {
        	if(status === 'enabled'){
				Enable();
        		/* Disable(); */
        	}
        	status = 'disabled';
        }
	}
	
	// TAB EXPANDER CONTROLS  --------------------------------------------------------------------------------------------------------
    var xleft, xright, ulContainer;
    function calcOffset() {
        //console.log("calcOffset called.");

        ulContainer = $("#melis-navtabs-container-inner").outerWidth();
        var leftOffset = $navTabs.position().left;
        //var liIndex = $navTabs.find("li").index();

        var ulWidth = 1; 
            $('#id_meliscore_header #melis-id-nav-bar-tabs > li').each(function() {
                ulWidth += $(this).outerWidth();
            });

        var rightOffset = ( $("#melis-navtabs-container-inner").outerWidth() - ulWidth ) - leftOffset;
            xleft = Math.abs( $navTabs.position().left );
            xright = Math.abs( ( $("#melis-navtabs-container-inner").outerWidth() - ulWidth ) - leftOffset);

            /* console.log("==============calcOffset==============");
            console.log("before - 170 ulContainer: ", ulContainer);
            console.log("leftOffset: ", leftOffset);
            console.log("ulWidth: ", ulWidth);
            console.log("calcOffset xleft: ", xleft);
            console.log("calcOffset xright: ", xright); */
    }
    
    //NEXT 
    $body.on("click", ".melis-tabnext", function() {
        calcOffset();

        /* console.log("=============.melis-tabnext=============");
        console.log("ulContainer: ", ulContainer); */

        var currentUlContainer = ulContainer - 170;

        /* console.log("currentUlContainer: ", currentUlContainer);
        console.log("click next xright: ", xright); */

        if( xright > currentUlContainer ) {

            //console.log("true: xright > currentUlContainer ");

            //var liIndex = $navTabs.find("li").index();

                //console.log("liIndex: ", liIndex );

                if ( $navTabs.width() > ulContainer ) {
                    $navTabs.animate({
                        left: '-='+ 170
                    },0);
                }
                else {
                    $navTabs.css("left", "0");

                    //console.log("true next $navTabs width: ", $navTabs.width() );
                }
        }
        else {
            $navTabs.animate({
                left: '-=' + xright
            },0);

        }

        /* console.log("melis-tabnext clicked");
        console.log("$navTabs width: ", $navTabs.width() ); */
    });
    
    //PREV
    $body.on("click", ".melis-tabprev", function(){
        calcOffset();

        var currentUlContainer = ulContainer - 170;

        /* console.log("ulContainer: ", ulContainer);
        console.log("currentUlContainer: ", currentUlContainer); */

        if( xleft > currentUlContainer ) {
            $navTabs.animate({
                left: '+='+ 170
            },0);

            //console.log("true next $navTabs width: ", $navTabs.width() );
        }
        else{
            $navTabs.animate({
                left: '+=' + xleft
            },0);

            //console.log("false next $navTabs width: ", $navTabs.width() );
        }
        /* console.log("melis-tabprev clicked");
        console.log("$navTabs width: ", $navTabs.width() ); */
    });
   
	// FOCUS TAB ON CLICK (new functionality)
    function focusTab(){
    	
    }

    // CHECK tabExpander() WHEN WINDOW IS RESIZED
    $(window).resize(function(){
        screenSize = jQuery(window).width();
        if( screenSize >= 768 ){
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
		focusTab					:						focusTab,
		Enable						:						Enable,
		Disable						:						Disable,
		checkStatus					:						checkStatus,
		
	}

})(jQuery, window);
