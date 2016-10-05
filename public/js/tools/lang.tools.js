$(document).ready(function() {
	
	addEvent("#btnLangAdd", function() {
		var dataString = $("#idformlang").serialize();
		melisCoreTool.pending("#btnLangAdd");
		melisCoreTool.processing();
		$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/Language/addLanguage',
	        data		: dataString,
	        dataType    : 'json',
	        encode		: true,
	     }).success(function(data){
			if(data.success) {
				$('#modal-language').modal('hide');
				 melisHelper.zoneReload("id_meliscore_tool_language", "meliscore_tool_language");
				 melisHelper.zoneReload("id_meliscore_header_language", "meliscore_header_language");
			}
			else {
				melisCoreTool.alertDanger("#languagealert", '', data.textMessage + "<br/>");
				melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 'closeByButtonOnly');
				melisCoreTool.highlightErrors(data.success, data.errors, "idformlang");
			}
			melisCoreTool.done("#btnLangAdd");
    		melisCore.flashMessenger();
    		melisCoreTool.processDone();
	     }).fail(function(){
				alert( translations.tr_meliscore_error_message );
		});
	});
	
	addEvent(".btnLangApply", function() {
		var tdParent = $(this).parent();
		var trParent = $(tdParent).parent();
		var getId = trParent.attr('id');
		
		melisChangeLanguage(getId);
	});
	
	addEvent(".btnLangDelete", function() {
		var tdParent = $(this).parent();
		var trParent = $(tdParent).parent();
		var getId = trParent.attr('id');
		
		melisCoreTool.confirm(
			translations.tr_meliscore_common_yes, 
			translations.tr_meliscore_common_no, 
			translations.tr_meliscore_tool_language, 
			translations.tr_meliscore_tool_language_delete_confirm, 
			function() {
	    		$.ajax({
	    	        type        : 'POST', 
	    	        url         : '/melis/MelisCore/Language/deleteLanguage',
	    	        data		: {id : getId},
	    	        dataType    : 'json',
	    	        encode		: true,
	    	     }).success(function(data){
	    	    	 	melisCoreTool.pending(".btn-danger");
		    	    	if(data.success) {
		    	    		melisHelper.zoneReload("id_meliscore_tool_language_content", "meliscore_tool_language_content");
		    	    		melisHelper.zoneReload("id_meliscore_header_language", "meliscore_header_language");
		    	    		melisCore.flashMessenger();
		    	    	}
		    	    	else {
		    	    		melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 'closeByButtonOnly');
		    	    	}
		    	    	melisCoreTool.done(".btn-danger");
	    	     }).error(function(){
	    	    	 alert( translations.tr_meliscore_error_message );
	    	     });
		});
	});
	
	
	
	function addEvent(target, func) {
		$("body").on("click", target, func);
	}
});

window.initLangJs = function() {
	//$(document).on("init.dt", function(e, settings) {
		$('#tableLanguages td:nth-child(3):contains("'+ melisLangId +'")').siblings(':last').html('-');
	//});
}