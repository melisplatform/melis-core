(function($){
	
	window.setOnOff = function(){
		$('.make-switch:not(".has-switch") ').bootstrapSwitch();
	}
	
	if (typeof $.fn.bootstrapSwitch != 'undefined' && $('.make-switch').length)
		setOnOff();
	
	
})(jQuery);