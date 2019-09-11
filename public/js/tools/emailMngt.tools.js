$(function() {
	var $body = $("body");

	$body.on("click", '.btnMelisCoreEmailMngtCreation', function() {
		melisHelper.tabOpen(translations.tr_emails_management_creation, 'fa-envelope-o', 'NEW_id_meliscore_tool_emails_mngt_generic_from', 'meliscore_tool_emails_mngt_generic_from', {codename:'NEW'});
	});
	
	$body.on("click", ".btnMelisCoreEmailMngtEdittion", function(){
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
	
	$body.on("click", ".btnMelisCoreEmailMngtSave", function(){
		melisCoreTool.pending(".btnMelisCoreEmailMngtSave");
		var codename = $(this).data("codename");
		var formId = '#'+codename+'_generalPropertiesform';
		// Submitting form tru ajax request
        submitEmailProperties($(formId), codename);
	});

	submitEmailProperties  = function(form, codename){

        form.unbind("submit");

        form.on("submit", function(e){
            e.preventDefault();
            var formData = new FormData(this);

            // Email Codename
            formData.append('codename', codename);

            // Getting the final value of the accepted lags
            formData.append('boe_tag_accepted_list', $("#"+codename+"_boe_tag_accepted_list").data('tags'));

            // Adding to formdata language tabs forms
            $(this).closest('.container-level-a').find('.boed_lang_id_'+codename).each(function(){
                $langID = $(this).val();
                $langLocale = $(this).data('locale');
                langFormId = '#'+codename+'_'+$langID+'_emailLangForm'
                var langFormDataString = $(langFormId).serializeArray();

                formData.append($langLocale, $.param(langFormDataString));
            });

            $.ajax({
                type        :'POST',
                url         : "/melis/MelisCore/EmailsManagement/saveEmail",
                data        :formData,
                cache       :false,
                contentType : false,
                processData : false
            }).done(function(data){
                if(data.success) {
                    melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                    melisHelper.tabClose(codename+"_id_meliscore_tool_emails_mngt_generic_from");
                    melisHelper.tabOpen(translations.tr_meliscore_tool_emails_mngt, 'fa-envelope-o', 'id_meliscore_tool_emails_mngt', 'meliscore_tool_emails_mngt');
                    melisHelper.zoneReload("id_meliscore_tool_emails_mngt", "meliscore_tool_emails_mngt");
                } else {
                    var layoutStatus = $("body").find(".melis-core-layout-status");
                    if (layoutStatus.length) {
                        layoutStatus.removeClass("text-success");
                        // Change tooltip text
                        var layoutStatusTooltip = layoutStatus.children("i:first");
                        if (layoutStatusTooltip.length) layoutStatusTooltip.attr('data-original-title', translations.tr_meliscore_file_not_exists);
                    }

                    melisCoreTool.alertDanger("#siteaddalert", '', data.textMessage);
                    melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                    melisCoreTool.highlightErrors(data.success, data.errors, codename+'_generalPropertiesform');
                }
                melisCore.flashMessenger();

                melisCoreTool.done(".btnMelisCoreEmailMngtSave");

            }).fail(function(){
                alert(translations.tr_meliscore_error_message);

                melisCoreTool.done(".btnMelisCoreEmailMngtSave");
            });
        });

        form.submit();
    }
	
	$body.on("click", ".btnMelisCoreEmailMngtDelete", function(){
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

	/**
	 * Clicking on tabs
	 */
	/* $body.on("click", ".product-text-tab li a", function() {
		var $this = $(this);

			$this.toggleClass("active").siblings().removeClass("active");
			$this.closest("li").toggleClass("active").siblings().removeClass("active");
	}); */
	
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

        // Filestyle layout logo
        $("input[name='boe_content_layout_logo']").each(function(i, v){
            $layoutLogoPlcHldr = $(this).data("file-value");
            $layoutLogoTxt = $(this).data("text");
            $(this).filestyle({
                buttonBefore: true,
                placeholder: $layoutLogoPlcHldr,
                text: $layoutLogoTxt
            });
		});

        $("textarea[name='boe_content_layout_ftr_info']").each(function(i, v){
        	var selector = "#"+$(this).attr("id");
            // Initialize TinyMCE editor
            melisTinyMCE.createTinyMCE("tool", selector, {height: 200, relative_urls: false,  remove_script_host: false, convert_urls : false});
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

		// pagination of dataTables
		melisCore.paginateDataTables();
	}
});