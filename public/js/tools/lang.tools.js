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
				 melisHelper.melisOkNotification(data.textTitle, data.textMessage);
			}else{
				melisCoreTool.alertDanger("#languagealert", '', data.textMessage);
				melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
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
		var getId = $(this).closest('tr').attr('id');
		
		melisChangeLanguage(getId);
	});
	
	addEvent(".btnLangUpdate", function() {
		var langId = $(this).closest('tr').attr('id');
		var langLocale = $(this).closest('tr').data('locale');
		var dataString = [{name : 'id', value : langId},{name : 'locale', value : langLocale}];
		
		melisCoreTool.pending(".btnLangUpdate");
		melisCoreTool.processing();
		$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/Language/updateLanguage',
	        data		: dataString,
	        dataType    : 'json',
	        encode		: true,
	     }).success(function(data){
			if(data.success) {				
				 melisHelper.melisOkNotification(data.textTitle, data.textMessage);				 
			}else{				
				melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);				
			}
			melisCoreTool.done(".btnLangUpdate");
    		melisCore.flashMessenger();
    		melisCoreTool.processDone();
	     }).fail(function(){
				alert( translations.tr_meliscore_error_message );
		});
	});
	
	addEvent(".btnLangDelete", function() {
		var tdParent = $(this).parent();
		var trParent = $(tdParent).parent();
		var getId = $(this).closest('tr').attr('id');
		
		melisCoreTool.confirm(
			translations.tr_meliscore_common_yes, 
			translations.tr_meliscore_common_no, 
			translations.tr_meliscore_tool_language, 
			translations.tr_meliscore_tool_language_delete_confirm, 
			function() {
    		$.ajax({
    	        type        : 'POST', 
    	        url         : '/melis/MelisCore/Language/deleteLanguage',
    	        data		: [{name: 'id', value : getId}],
    	        dataType    : 'json',
    	        encode		: true,
    	     }).success(function(data){
    	    	 	melisCoreTool.pending(".btn-danger");
	    	    	if(data.success) {
	    	    		melisHelper.zoneReload("id_meliscore_tool_language_content", "meliscore_tool_language_content");
	    	    		melisHelper.zoneReload("id_meliscore_header_language", "meliscore_header_language");
	    	    		melisHelper.melisOkNotification(data.textTitle, data.textMessage);
	    	    	}
	    	    	else {
	    	    		melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
	    	    	}
	    	    	melisCore.flashMessenger();
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

window.initLangBOJs = function() {
	//$(document).on("init.dt", function(e, settings) {
		var btnApply = "<a class=\"btn btn-info btnLangApply\"  title='"+ translations.tr_melis_core_common_apply_language+"'><i class=\"fa fa-check\" ></i></a> ";
         $('#tableLanguages td:nth-child(3):contains("en_EN")').siblings(':last').html(btnApply);
         if(melisLangId !== 'en_EN'){
             $('#tableLanguages td:nth-child(3):contains("'+ melisLangId +'")').siblings(':last').html('-');
         }

	//});
}