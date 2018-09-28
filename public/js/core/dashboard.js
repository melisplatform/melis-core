$(function(){
	var $body 	= $("body");
	
	$body.on("click", "#melisDashBoardPluginBtn", function() {
	    $(this).closest(".melis-core-dashboard-dnd-box").toggleClass("shown");
	});
	
	$body.on("click", ".melis-core-dashboard-filter-btn", showPlugLists);
	$body.on("click", ".melis-core-dashboard-category-btn", showCatPlugLists);
	
	var dashboardTooltip = {
	    placement: "left",
	    template: '<div class="tooltip melis-plugin-tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
	};
	
	$("body .melis-core-dashboard-plugin-snippets").tooltip(dashboardTooltip);
	
	// Tooltip
	/*  $("body .melis-core-dashboard-plugin-snippets").tooltip({
	 position: {
	 my: "left center",
	 at: "left+110% center",
	 using: function( position, feedback ) {
	 $( this ).css( position );
	 $(this).addClass( "melis-plugin-tooltip" ).addClass( feedback.vertical ).addClass( feedback.horizontal ).appendTo( this );
	 }
	 },
	 });*/
	
	$("body .melis-core-dashboard-plugin-snippets").hover(function() {
	    $(this).children(".melis-plugin-tooltip").fadeIn();
	});
	
	function showPlugLists() {
	    if($(this).hasClass("active")) {
	        $(this).removeClass("active")
	            .siblings(".melis-core-dashboard-plugin-snippets-box")
	            .slideUp();
	        $(this).siblings(".melis-core-dashboard-plugin-snippets-box")
	            .find(".melis-core-dashboard-category-btn.active")
	            .removeClass("active")
	            .siblings(".melis-core-dashboard-category-plugins-box")
	            .slideUp();
	    } else {
	        $(".melis-core-dashboard-filter-btn.active").removeClass("active").siblings(".melis-core-dashboard-plugin-snippets-box").slideUp();
	        $(this).addClass("active");
	        $(".melis-core-dashboard-filter-btn.active").siblings(".melis-core-dashboard-plugin-snippets-box").slideDown();
	    }
	}
	
	function showCatPlugLists() {
	    if($(this).hasClass("active")) {
	        $(this).removeClass("active").siblings(".melis-core-dashboard-category-plugins-box").slideUp();
	    } else {
	        $(".melis-core-dashboard-category-btn.active").removeClass("active").siblings(".melis-core-dashboard-category-plugins-box").slideUp();
	        $(this).addClass("active");
	        $(".melis-core-dashboard-category-btn.active").siblings(".melis-core-dashboard-category-plugins-box").slideDown();
	    }
	}
})