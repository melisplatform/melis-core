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