// DETECT IF ELEMENT HAS A SCROLLBAR - --=[ PLUGIN SNIPPET ]=--
(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0) ? this.get(0).scrollHeight > this.innerHeight() : false;
    }
})(jQuery);


(function($){
	$('ul.collapse')
	.on('show.bs.collapse', function(e){
		
		// check if sidebar has a scrollbar
    	if( $('#id_meliscore_leftmenu').hasScrollBar() ){
			$('#id_meliscore_leftmenu').stop().animate({
				scrollTop: $('#id_meliscore_leftmenu')[0].scrollHeight
			}, 500);
    	}
		
		e.stopPropagation();

		if ($(this).closest('#menu').length)
		{
			var t = $(this).parents('.hasSubmenu').length;
			if (t != 1) return;

			var a = $('#menu > div > div > ul > li.hasSubmenu.active > ul').not(this);

			a
			.removeClass('in').addClass('collapse').removeAttr('style')
			.closest('.hasSubmenu.active').removeClass('active');
		}
	})
	.on('shown.bs.collapse', function(e){
		
		e.stopPropagation();
		
		if ($(this).closest('#menu').length)
			$('#menu *').getNiceScroll().resize();
	});
})(jQuery);

$(document).ready(function(){
	
	// only make the sidebar resizable when its 1200px above
	if( melisCore.screenSize >= 1200){
		 $( "#id_meliscore_leftmenu" ).resizable({
		    	handles: 'e',
		    	animate: false,
		    	minWidth: 274,
		    	maxWidth: 400,
		    	start: function( event, ui){
		    		
		    		$("#id_meliscore_leftmenu .ui-resizable-e").css({"width":"100px", "right":"-49px"});
		    		$(".sidebar, #content, #id_meliscore_footer, .page-head-container > .innerAll").removeClass("transition3ms");
		    	},
		    	resize: function( event, ui ) {
		    		
		    		var sidebarWidth = $( "#id_meliscore_leftmenu" ).outerWidth();
		    		
		    		$("#content").css("margin-left", sidebarWidth );
		    		$("#id_meliscore_footer").css("width", sidebarWidth );
		    		
		    		if( $("#"+ activeTabId + " .page-head-container > .innerAll").hasClass("sticky-pageactions") ){
		    			$("#"+ activeTabId + " .page-head-container > .innerAll").css({"width": $body.width() - sidebarWidth,"left": sidebarWidth});
		    		}
		    		
		    	},
		    	stop: function( event, ui){
		    		
		    		$("#id_meliscore_leftmenu .ui-resizable-e").css({"width":"30px", "right":"-17px"});
		    		$(".sidebar, #content, #id_meliscore_footer, .page-head-container > .innerAll").addClass("transition3ms");
		    	}
			});
	}
	
	 
	
});