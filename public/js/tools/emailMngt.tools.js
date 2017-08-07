$(function(){
	$("body").on("click", '.btnMelisCoreEmailMngtCreation', function() {
		melisHelper.tabOpen(translations.tr_emails_management_creation, 'fa-envelope-o', 'NEW_id_meliscore_tool_emails_mngt_generic_from', 'meliscore_tool_emails_mngt_generic_from', {codename:'NEW'});
	});
	
	$("body").on("click", ".btnMelisCoreEmailMngtEdittion", function(){
		var codename = $(this).parents("tr").attr("id");
		
		var dataString = new Array;
		
		dataString.push({
			name	: 'codename',
			value	: codename,
		});
		
		$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/EmailsManagement/getEmailForTabTitle',
	        data		: dataString,
	        dataType    : 'json',
	        encode		: true
		}).done(function(data) {
			melisHelper.tabOpen(translations.tr_emails_management_email +' : '+ data.title, 'fa-pencil-square-o', codename+'_id_meliscore_tool_emails_mngt_generic_from', 'meliscore_tool_emails_mngt_generic_from', {codename:codename});
		}).fail(function(){
			alert( translations.tr_meliscore_error_message );
		});
	});
	
	$("body").on("click", ".btnMelisCoreEmailMngtSave", function(){
		melisCoreTool.pending(".btnMelisCoreEmailMngtSave");
		var codename = $(this).data("codename");
		var formId = '#'+codename+'_generalPropertiesform';
		var dataString = $(formId).serializeArray();
		
		// Modify Value of `boe_tag_accepted_list` from the Serialized Object
		for (index = 0; index < dataString.length; ++index) {
		    if (dataString[index].name == "boe_tag_accepted_list") {
		    	dataString[index].value = $("#"+codename+"_boe_tag_accepted_list").data('tags');
		        break;
		    }
		}
		
		$(this).closest('.container-level-a').find('.boed_lang_id_'+codename).each(function(){
			$langID = $(this).val();
			$langLocale = $(this).data('locale');
			langFormId = '#'+codename+'_'+$langID+'_emailLangForm'
			var langFormDataString = $(langFormId).serializeArray();
//			for (index = 0; index < langFormDataString.length; index++) {
//			    if (langFormDataString[index].name == "boed_html") {
//			    	var kani = tinyMCE.get(codename+'_'+$langID+'_boed_html');
//			    	if(kani == null){
//			    		console.log(langFormDataString);
//			    	}
//			    	langFormDataString[index].value = kani.getContent();
//			        break;
//			    }
//			}
			
			dataString.push({
				name : $langLocale,
				value: $.param(langFormDataString)
			});
		});
		
		dataString.push({
			name : 'codename',
			value: codename
		});
		
		dataString = $.param(dataString);
		
		$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/EmailsManagement/saveEmail',
	        data		: dataString,
	        dataType    : 'json',
	        encode		: true
		}).done(function(data) {
			if(data.success) {
				melisHelper.melisOkNotification(data.textTitle, data.textMessage);
				melisHelper.tabClose(codename+"_id_meliscore_tool_emails_mngt_generic_from");
				melisHelper.tabOpen(translations.tr_meliscore_tool_emails_mngt, 'fa-envelope-o', 'id_meliscore_tool_emails_mngt', 'meliscore_tool_emails_mngt');
				melisHelper.zoneReload("id_meliscore_tool_emails_mngt", "meliscore_tool_emails_mngt");
			} else {
				melisCoreTool.alertDanger("#siteaddalert", '', data.textMessage);
				melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
				melisCoreTool.highlightErrors(data.success, data.errors, codename+'_generalPropertiesform');
			}
			melisCore.flashMessenger();
		}).fail(function(){
			alert( translations.tr_meliscore_error_message );
		});
		
		melisCoreTool.done(".btnMelisCoreEmailMngtSave");
	});
	
	$("body").on("click", ".btnMelisCoreEmailMngtDelete", function(){
		var codename = $(this).parents("tr").attr("id");
		var hasMergeData = $(this).parents("tr").hasClass("boEmailsMergeData");
		var dataString = new Array;
		
		dataString.push({
			name	: 'codename',
			value	: codename,
		});
		
		var confirmationMsg = translations.tr_emails_management_confirm_msg;
		if(hasMergeData){
			confirmationMsg = translations.tr_emails_management_remove_merge_data_confirm_msg;
		}
		
		melisCoreTool.confirm(
			translations.tr_meliscore_common_yes,
			translations.tr_meliscore_common_no,
			translations.tr_emails_management_delete, 
			confirmationMsg, 
			function() {
				$.ajax({
			        type        : 'POST', 
			        url         : '/melis/MelisCore/EmailsManagement/deleteEmail',
			        data		: dataString,
			        dataType    : 'json',
			        encode		: true
				}).done(function(data) {
					melisCore.flashMessenger();
					melisHelper.melisOkNotification(data.textTitle, data.textMessage);
					melisHelper.zoneReload("id_meliscore_tool_emails_mngt", "meliscore_tool_emails_mngt");
				}).fail(function(){
					alert( translations.tr_meliscore_error_message );
				});
		});
	});
	
	window.initEmailsEditors = function(){
		$('.boed_lang_id').each(function(){
			langID = $(this).val();
			codename = $(this).data('codename');
			var selector = "#"+codename+"_"+langID+"_boed_html";
            // Initialize TinyMCE editor
        	melisTinyMCE.createTinyMCE("tool", selector, {height: 200, relative_urls: false,  remove_script_host: false, convert_urls : false, 
        		setupcontent_callback : cgeDawBeh(selector)
    		});
		});
		
	}
	
	window.cgeDawBeh = function(selector){
		var currentPage = $(selector).closest('.container-level-a');
		var editorCount = currentPage.find('.boed_lang_id').length;
		var currentCount = parseInt(currentPage.data('editor-count'), 10);
		
		if(currentCount != editorCount){
			currentPage.data('editor-count', currentCount + 1);
		}else{
			melisCoreTool.done(".btnMelisCoreEmailMngtSave");
		}
		
	}
	
	window.reInitTableEmailMngt = function(){
		$('.noDeleteBtn').each(function(){
			$('#'+$(this).attr('id')+' .btnMelisCoreEmailMngtDelete').remove();
		});
	}
});