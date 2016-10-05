$(document).ready(function(){
	/* Slim Scroll Widgets */
	$('.widget-scroll').each(function(){
		$(this).find('.widget-body > div').height($(this).attr('data-scroll-height')).niceScroll({
			cursorwidth: 3,
	        zindex: 2,
	        cursorborder: "none",
	        cursorborderradius: "0", 
	        cursorcolor: primaryColor
			
		});
	});
	
	/* Other non-widget Slim Scroll areas */
	$('*:not(#menu) .slim-scroll').each(function(){
		$(this).height($(this).attr('data-scroll-height')).niceScroll({
			cursorwidth: 3,
	        zindex: 2,
	        cursorborder: "none",
	        cursorborderradius: "0",
	        cursorcolor: primaryColor
	        
		});
	});
	
});