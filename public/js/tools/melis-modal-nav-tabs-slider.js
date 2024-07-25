var melisModalNavTabsSlider = (function($, window) {
    var $body = $("body"),
        modalUl,
		ulPos,
		maxPosNext,
		modalContainerWidth,
		maxLiWidth = 0,
		ulEndPoint = false,
		maxPosPrev = 25;

		function checkedNavTabsModalSlider() {
			modalUl = $(".tooltabmodal .widget .melis-nav-tabs-box .nav.nav-tabs");
			modalContainerWidth = $(".tooltabmodal .widget").outerWidth();
			
			if ( $(".tooltabmodal .widget .melis-nav-tabs-box .nav.nav-tabs li:hidden").length ) {
				$(".tooltabmodal .widget .melis-nav-tabs-box .nav.nav-tabs li:hidden").remove();
			}

			var modalNavContainer 	= 0,
				minSize 			= 150,
				maxSize 			= 225,
				modalTabs 			= $(".tooltabmodal .widget .melis-nav-tabs-box .nav.nav-tabs li"),
				tabLength 			= modalTabs.length,
				tabSize 			= tabLength * maxSize;

				maxPosNext = tabSize / tabLength;

				$(".tooltabmodal .widget .melis-nav-tabs-box .nav.nav-tabs li").each(function() {
					var $this = $(this);
						modalNavContainer += $this.outerWidth();

					var el = $this.outerWidth();
						maxLiWidth = Math.max(maxLiWidth, el);
				});

				if ( modalNavContainer > modalContainerWidth ) {
					modalTabs.width(minSize);
					$(".tooltabmodal .widget .melis-nav-tabs-box .nav.nav-tabs").width(tabSize);
					
					// -50 for prev and next button widths
					$(".tooltabmodal .widget .melis-nav-tabs-box").width( modalContainerWidth - 50 );

					// addClass .active to the prev and next button
					$(".tooltabmodal .widget .widget-melis-tabprev").addClass("active");
					$(".tooltabmodal .widget .widget-melis-tabnext").addClass("active");
				} 
				else {
					$(".tooltabmodal .widget .widget-melis-tabprev").removeClass("active");
					$(".tooltabmodal .widget .widget-melis-tabnext").removeClass("active");

					if ( modalNavContainer == 0 ) {
						$(".tooltabmodal .widget .melis-nav-tabs-box").css({"width": "auto"});
					} else {
						$(".tooltabmodal .widget .melis-nav-tabs-box").width(modalContainerWidth);
					}
				}
		}

		function modalSlideNext() {
			if ( modalUl ) {
				var posLeft = Math.abs(modalUl.position().left);
					if ( posLeft >= 25 && posLeft <= maxPosNext + 50 ) {
						modalUl.finish().animate({
							'left': '-=150',
						}, 300);
					}
			}
		}

		function modalSlidePrev() {
			if ( modalUl ) {
				var posLeft = Math.abs(modalUl.position().left);
					if ( posLeft >= 125 ) {
						modalUl.finish().animate({
							'left': '+=150',
						}, 300);
					}
			}
		}


		//PREV 
		$body.on("click", ".widget-melis-tabprev", modalSlidePrev);

		//NEXT 
		$body.on("click", ".widget-melis-tabnext", modalSlideNext);


		$(window).on("resize", function () {
			checkedNavTabsModalSlider();
		});

		return {
			checkedNavTabsModalSlider : checkedNavTabsModalSlider
		}
})(jQuery, window);