window.getCurrentPlatform = function() { 
	//$(document).on("init.dt", function(e, settings) {
		$.ajax({
	        type        : 'GET', 
	        url         : '/melis/MelisCore/Platforms/getCurrentPlatform',
	        dataType    : 'json',
	        encode		: true,
	     }).success(function(data){
	    	 $('#tablePlatforms td:nth-child(2):contains("'+ data.env +'")').siblings(':last').html('-');
	     });
	//});
}

$(document).ready(function() {
	var formAdd  = "#formplatformadd form#idformsite";
	var formEdit = "#formplatformedit form#idformsite";
	
	
	addEvent("#id_meliscore_tool_platform_header_add", function() {
		// id text input
		melisCoreTool.clearForm("idformsite");
		$(formAdd + " input#id_plf_id").css("display", "none");
		$(formAdd + " label[for='id_plf_id']").css("display", "none");
		melisCoreTool.showOnlyTab('#modal-platforms', '#id_meliscore_platform_modal_content_new');
	});
	
	addEvent(".btnPlatformEdit", function() {
		melisCoreTool.showOnlyTab('#modal-platforms', '#id_meliscore_platform_modal_content_edit');
		var getId = $(this).parents("tr").attr("id");
		
		$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/Platforms/getPlatformById',
	        data		: {id : getId},
	        dataType    : 'json',
	        encode		: true,
	     }).success(function(data){
	    	 	melisCoreTool.pending(".btn");
 	    		$(formEdit + " input[type='text']").each(function(index) {
 	    			var name = $(this).attr('name');
 	    			$("input#" + $(this).attr('id')).val(data.platform[name]);
 	    			$("span#platformupdateid").html(data.platform['plf_id']);
 	    		});
 	    		melisCoreTool.done(".btn");
	     }).error(function(){
	    	 alert( translations.tr_meliscore_error_message );
	     });
	});
	
	addEvent("#btnPlatformAdd", function() {
		var dataString = $(formAdd).serializeArray();
		
		dataString = $.param(dataString);
		melisCoreTool.pending("#btnPlatformAdd");
		melisCoreTool.processing();
		$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/Platforms/addPlatform',
	        data		: dataString,
	        dataType    : 'json',
	        encode		: true
		}).done(function(data) {
			if(data.success) {
				$('#modal-platforms').modal('hide');
				melisHelper.zoneReload("id_meliscore_tool_platform", "meliscore_tool_platform");
				// Show Pop-up Notification
	    		melisHelper.melisOkNotification(data.textTitle, data.textMessage);
			}
			else {
				melisCoreTool.alertDanger("#platformalert", '', data.textMessage);
				melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
				melisCoreTool.highlightErrors(data.success, data.errors, "formplatformadd form#idformsite");
			}
			melisCoreTool.done("#btnPlatformAdd");
    		melisCore.flashMessenger();
    		melisCoreTool.processDone();
    		
    		
    		
		}).fail(function(){
			alert( translations.tr_meliscore_error_message );
		});
	});
	
	addEvent("#btnPlatformEdit", function() {
		var dataString = $(formEdit).serializeArray();
		dataString.push({
			name: "id",
			value: $("#platformupdateid").html()
		});
		dataString = $.param(dataString);
		melisCoreTool.pending("#btnPlatformEdit");
		melisCoreTool.processing();
		$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/Platforms/editPlatform',
	        data		: dataString,
	        dataType    : 'json',
	        encode		: true
		}).done(function(data) {
			if(data.success) {
				$('#modal-platforms').modal('hide');
				melisHelper.zoneReload("id_meliscore_tool_platform", "meliscore_tool_platform");
				// Show Pop-up Notification
	    		melisHelper.melisOkNotification(data.textTitle, data.textMessage);
			}
			else {
				melisCoreTool.alertDanger("#platformeditalert", '', data.textMessage);
				melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
				melisCoreTool.highlightErrors(data.success, data.errors, "formplatformedit form#idformsite");
			}
			melisCoreTool.done("#btnPlatformEdit");
    		melisCore.flashMessenger();
    		melisCoreTool.processDone();
		}).fail(function(){
			alert( translations.tr_meliscore_error_message );
		});
	});
	
	addEvent(".btnPlatformDelete", function(){ 
		var tdParent = $(this).parent();
		var trParent = $(tdParent).parent();
		var getId = trParent.attr('id');
		
		melisCoreTool.confirm(
			translations.tr_meliscore_common_yes, 
			translations.tr_meliscore_common_no, 
			translations.tr_meliscore_tool_platform_modal_del, 
			translations.tr_meliscore_tool_platform_prompts_confirm, 
			function() {
	    		$.ajax({
	    	        type        : 'POST', 
	    	        url         : '/melis/MelisCore/Platforms/deletePlatform',
	    	        data		: {id : getId},
	    	        dataType    : 'json',
	    	        encode		: true,
	    	     }).success(function(data ){
	    	    	 	melisCoreTool.pending(".btn-danger");
		    	    	if(data.success) {
		    	    		melisHelper.zoneReload("id_meliscore_tool_platform", "meliscore_tool_platform");
		    	    		melisCore.flashMessenger();
		    	    		
		    	    		// Show Pop-up Notification
		    	    		melisHelper.melisOkNotification(data.textTitle, data.textMessage);
		    	    	}
		    	    	melisCoreTool.done(".btn-danger");
	    	     }).error(function(){
	    	    	 alert( translations.tr_meliscore_error_message );
	    	     });
		});
	});


	function addEvent(target, fn) {
		$("body").on("click", target, fn);
	}
});