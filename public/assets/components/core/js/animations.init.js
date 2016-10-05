(function($)
{

	// animate only after page finished loading
	$(window).on('load', function()
	{
		$('.panel-3d').find('.front .btn').on('click', function(){
			$(this).closest('.panel-3d').addClass('panel-flip');
		}).end()
		.find('.back .btn').on('click', function(){
			$(this).closest('.panel-3d').removeClass('panel-flip');
		});

		// disable animations on touch devices
		if (Modernizr.touch)
		{
			$('.panel-3d')
			.css('visibility', 'visible')
			.find('[class*="icon-"]')
			.css('visibility', 'visible');
			return;
		}

		// disable animations if browser doesn't support css transitions & 3d transforms
		if (!$('html.csstransitions.csstransforms3d').length)
			return;

		$('.panel-3d')
		.addClass('flip-default')
		.each(function(i){
			var t = $(this);
			setTimeout(function(){
				t.css('visibility', 'visible').addClass('animated fadeInLeft');
			}, (i+1)*300);
			setTimeout(function(){
				t.removeClass('flip-default fadeInLeft');
				setTimeout(function(){
					t.find('[class*="icon-"]').css('visibility', 'visible').addClass('animated fadeInDown');
				}, (i+1)*200);
			}, (i+1)*800);
		});

	});

})(jQuery);