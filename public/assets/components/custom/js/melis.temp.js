// Melis Development Javascript code will be refactored in later time =-=-=-=-=-=-=-=-=-=-=-=-=
/* 
$(function(){ // document.ready function equivalent in jQuery
	

	//FIRST RENDER = set active class to the first <li> in the tab and show first content (dashboard)
	$("#melis-id-nav-bar-tabs li:first-child").addClass("active");
	$("#id_meliscore_center_dashboard").addClass("active");
	
	
	function tabSwitch(tabID){
		// run and check all the <li> to remove the 'active class'
	    $("#melis-id-nav-bar-tabs li, .container-level-a").each(function(){
	      $(this).removeClass('active');
	    });
	    
	    //add active class to the parent of the cliked <a> ( to the <li> )
	    $("#melis-id-nav-bar-tabs a.tab-element[data-id='"+ tabID +"']").parent("li").addClass("active");
	    
	    //show current selected container
	    $("#" + tabID).addClass("active");
	}
	
	//when closing the tabs, remove the tab and the content from DOM & set the next tab active and its content
	$(".navbar").on("click",".close-tab", function(e){
		e.preventDefault();
		
		var tabContentID = $(this).data("id");
		var currentParent = $(this).parent("li");
		var nextActiveTab = currentParent.next("li").children().data("id");
		var prevActiveTab = currentParent.prev("li").children().data("id");
		var tabCount = $("#melis-id-nav-bar-tabs li").length
		 
		if( currentParent.index() === 0 ){
			currentParent.remove();
			$("#"+tabContentID).remove();
			
			if( tabCount > 1){
				tabSwitch(nextActiveTab);
			}
		}
		else{
			currentParent.remove();
			$("#"+tabContentID).remove();
			
			if( tabCount > 1){
				tabSwitch(prevActiveTab);
			}
		}
	});

	

	
	$('.navbar').on("click",".btn-navbar", function(e){
		e.preventDefault();
		toggleMenuHidden();
	});
		
	
	
	// zone loading test ====================================
	
	var zonesToLoad = {}; //array that holds all the zones to be reloaded (massive zone reloading)
	function zoneLoad(zonesToLoad){
		console.log("Ajax request zone = "+zonesToLoad.cpath);
		//REMOVE "setTimeout" IN PRODUCTION
		// test to show the loader while doing AJAX request
		setTimeout(function() {
			$.ajax({
		        url         : '/melis/zoneview',
		        data        : zonesToLoad,
				encode		: true,
				success: function(data) {
					//hide the loader
					$('.loader-icon').removeClass('spinning-cog').addClass('shrinking-cog');
					setTimeout(function() {
						$("#id_"+zonesToLoad.cpath).html(data.html);
					}, 300);
				},
				error: function() {
					alert("ERROR REFRESHING THE HEADER !!");
				}
		    });
		}, 1000);
	}
	
	
	$(".zoneload").on("click", function(e){
		e.preventDefault();
		var zone = $(this).data("meliskey");
		var tree = $("#id-mod-menu-dynatree").dynatree("getTree");
		
		var tempLoader = '<div id="loader" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';
		
	

		// temporary loader fix
		if(zone === "meliscms_sitetree"){
			$("#treeview").append(tempLoader);
			setTimeout(function() {
				$('.loader-icon').removeClass('spinning-cog').addClass('shrinking-cog');
				setTimeout(function() {
					$("body #loader").slideUp(500).delay(5000).remove();
				}, 400);
					
				return tree.reload();
			}, 1000);
			
		}
		else{
			$("#id_"+zone).html(tempLoader);
		}
		
		
		//set the 'cpath' data to the data-melisKey attribute of the clicked element
		zonesToLoad.cpath = zone;
		zoneLoad(zonesToLoad);
	});
	
	
	
	// flash messenger test ======================================
	$("#add-flash-message").on("click", function(){
		meliscore_loadFlashMessages();
	});
	
	meliscore_loadFlashMessages();
	
});


var testModule = (function(){
	
	console.log("TEST MODULE Activated !");
	
	// private (not included in the return. but accessible to other functions with same scope)
	var _privateMethod = function(data){
		console.log("Private Method Triggered! Data = "+data);
	};
	
	//public method(included on the return. gets accessed anywhere. used to return data like API's do)
	var publicMethod = function(data){
		_privateMethod(data);
	};
	
	//public method(included on the return. 
	var publicMethod1 = function(){
		console.log("Public Method Triggered !");
	};
	
	// return an object with the methods you want to be accessed
	return {
		//object Key    method in the module above
		publicMethod    :   publicMethod,
		publicMethod1   :   publicMethod1
		
	};
	
})();

function meliscore_loadFlashMessages()
{
	$.ajax({
		type: 'GET',
		url: '/MelisCore/MelisFlashMessenger/getflashMessage',
		dataType: 'json',
		success: function(data)
		{
			ctr = 0;
			$("#flash-messenger").empty();
			var tempData = '';
			$.each(data, function(index, element) {
				$.each(element, function(index, fm){
					tempData += '<li><div class="media"><a class="pull-left" href="#"><img src="" alt="" class="img-circle media-object fa fa-bolt fa-6"></a><div class="media-body"><a href="" class="strong text-primary">'+fm.userId+'</a><div class="clearfix"></div>'+fm.message+'</div></div></li>';
					ctr++;
				});
			});
			$("#flash-messenger").append(tempData);
			
			// get the total number of flash messages
			var currentNumber = parseInt($(".dropdown.notification a span").text());
			$(".dropdown.notification a span").text(ctr);

		}
	});
}
*/




