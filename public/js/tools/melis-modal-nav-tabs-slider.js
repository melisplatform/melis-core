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
			var modalNavContainer   = 0,
				minSize 			= 150,
				maxSize 			= 225,
				modalTabs 			= $("#modal-user-management .widget .melis-nav-tabs-box .nav.nav-tabs li:not(:hidden)"),
				tabLength 			= modalTabs.length,
				tabSize 			= tabLength * maxSize;

				modalUl = $("#modal-user-management .widget .melis-nav-tabs-box .nav.nav-tabs");
				modalContainerWidth = $("#modal-user-management .widget").outerWidth();

				maxPosNext = tabSize / tabLength;

				$("#modal-user-management .widget .melis-nav-tabs-box .nav.nav-tabs li:not(:hidden)").each(function() {
					var $this = $(this);
						modalNavContainer += $this.outerWidth();

					var el = $this.outerWidth();
						maxLiWidth = Math.max(maxLiWidth, el);
				});

				if ( modalNavContainer > modalContainerWidth ) {
					modalTabs.width(minSize);
					$("#modal-user-management .widget .melis-nav-tabs-box .nav.nav-tabs").width(tabSize);
					
					// -50 for prev and next button widths
					$("#modal-user-management .widget .melis-nav-tabs-box").width( modalContainerWidth - 50 );

					// addClass .active to the prev and next button
					$("#modal-user-management .widget .widget-melis-tabprev").addClass("active");
					$("#modal-user-management .widget .widget-melis-tabnext").addClass("active");
				} 
				else {
					$("#modal-user-management .widget .widget-melis-tabprev").removeClass("active");
					$("#modal-user-management .widget .widget-melis-tabnext").removeClass("active");

					if ( modalNavContainer == 0 ) {
						$("#modal-user-management .widget .melis-nav-tabs-box").css({"width": "auto"});
					} else {
						$("#modal-user-management .widget .melis-nav-tabs-box").width(modalContainerWidth);
						$("#modal-user-management .widget .melis-nav-tabs-box .nav.nav-tabs").css("left", "auto");
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