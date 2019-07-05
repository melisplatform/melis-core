$(function(){
	$body = $('body');
	
	$body.on("click", ".logTypeButon", function(){
		var btn  = $(this);
		var logId = btn.parents("tr").attr("id");
		
		var logTypeId = btn.data("typeid");
		
		var zoneId = 'id_meliscore_logs_tool_log_type_form';
		var melisKey = 'meliscore_logs_tool_log_type_form';
		var modalUrl = '/melis/MelisCore/Log/renderLogsToolModalContainer';
		// requesitng to create modal and display after
    	melisHelper.createModal(zoneId, melisKey, false, {logId: logId, logTypeId: logTypeId}, modalUrl);
	});

	$body.on("click", ".btnMelisLogExport", function(){
		var btn  = $(this);
		var logId = btn.parents("tr").attr("id");

		var logTypeId = btn.data("typeid");

		var zoneId = 'id_meliscore_logs_tool_export_modal_content';
		var melisKey = 'meliscore_logs_tool_export_modal_content';
		var modalUrl = '/melis/MelisCore/Log/renderLogsToolModalContainer';
		// requesitng to create modal and display after
    	melisHelper.createModal(zoneId, melisKey, false, {logId: logId, logTypeId: logTypeId}, modalUrl);
	});

    $body.on("submit", "#logExportForm", function(e) {
        e.preventDefault();
        var formData = new FormData(this)
        var queryString = [];
        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_tool_emails_mngt_generic_from_header_cancel,
            translations.tr_meliscore_logs_tool_export_modal_title,
            translations.tr_meliscore_logs_log_export_confirm_msg,
            function() {
                melisCoreTool.pending(".button");
                $.ajax({
					type        :'POST',
					url         : "/melis/MelisCore/Log/validateExportLogs",
					data        :formData,
					cache       :false,
					contentType : false,
					processData : false,
                }).success(function(data){
                    if(data.success === 1) {
                        melisCoreTool.pending(".button");
                        queryString = $.param(data.postValues);
                        exportData('/melis/MelisCore/Log/exportLogs?'+queryString);
                        melisCoreTool.done(".button");
                        melisHelper.melisOkNotification(data.title, data.textMessage);
                    }
                    else if (data.success === 2) {
                        melisCoreTool.confirm(
                            translations.tr_meliscore_common_yes,
                            translations.tr_meliscore_tool_emails_mngt_generic_from_header_cancel,
                            translations.tr_meliscore_logs_tool_export_modal_title,
                            data.textMessage,
                            function() {
                                melisCoreTool.pending(".button");
                                queryString = $.param(data.postValues);
                                exportData('/melis/MelisCore/Log/exportLogs?'+queryString);
								melisCoreTool.done(".button");
                                melisHelper.melisOkNotification(data.title, data.textMessage);
                            }
                        );
                    }else{
                        melisHelper.melisKoNotification(data.title, data.textMessage, data.errors);
                    }
                    melisCoreTool.done(".button");
                }).error(function(){
                    melisCoreTool.done(".button");
                });
            }
        );

    });

	
	$body.on("click", ".saveLogTypeDetails", function(){
		
		var btn = $(this);
		
		var dataString = new Array;
		
		$('form.logTypeForm').each(function(key, value){
			var form = $(this).serializeArray();
			
			$.each(form, function(fkey, fvalue){
				dataString.push({
					name : "logForm["+key+"]["+fvalue.name+"]",
					value : fvalue.value
				});
			});
		});
		
		btn.attr("disabled", true);
		
		$.ajax({
	        type        : "POST", 
	        url         : "/melis/MelisCore/Log/saveLogTypeTrans",
	        data		: dataString,
	        dataType    : "json",
	        encode		: true,
			async		: false,
		}).done(function(data) {
			
			btn.attr("disabled", false);
			
			if(data.success){
				$("#id_meliscore_logs_tool_log_type_form_container").modal("hide");
				melisHelper.melisOkNotification(data.textTitle, data.textMessage);
				melisHelper.zoneReload("id_meliscore_logs_tool", "meliscore_logs_tool");
			}else{
				melisHelper.melisMultiKoNotification(data.textTitle, data.textMessage, data.errors);
			}
			
			melisHelper.highlightMultiErrors(data.success, data.errors, "#id_meliscore_logs_tool_log_type_form");
			melisCore.flashMessenger();
		}).fail(function(){
			btn.attr("disabled", false);
			alert( translations.tr_meliscore_error_message);
		});
	});
	
	$body.on("change", "#logUserfilter", function(){
		$tableMelisLogs.draw();
	});
	
	$body.on("change", "#logTypefilter", function(){
		$tableMelisLogs.draw();
	});
});

window.initLogDataTable = function(data){
	
	data.userId = -1;
	if($("#logUserfilter").length !== 0){
		data.userId = $("#logUserfilter").val();
	}
	
	data.typeId = -1;
	if($("#logTypefilter").length !== 0){
		data.typeId = $("#logTypefilter").val();
	}
	
	data.startDate = "";
	data.endDate = "";
	if($('#logsTableDaterange').data('daterangepicker') !== undefined){
		if($("#logsTableDaterange span").text() !== ''){
			data.startDate = $('#logsTableDaterange').data('daterangepicker').startDate.format("YYYY-MM-DD");
			data.endDate = $('#logsTableDaterange').data('daterangepicker').endDate.format("YYYY-MM-DD");
		}
	}
}

window.initDatePicker = function(){
	melisHelper.initDateRangePicker("#logsTableDaterange", dateRangePickerApplyEvent);
}


window.dateRangePickerApplyEvent = function(ev, picker) {
    $tableMelisLogs.draw();
}

function initExportLogDateRangePicker(){
    if($("#log_date_range").length > 0){
        melisHelper.initDateRangePicker("#log_date_range");
        setTimeout(function(){
            $("#log_date_range").data('daterangepicker').setStartDate(moment().subtract(8, 'days'));
            $("#log_date_range").data('daterangepicker').setEndDate(moment().subtract(1, 'days'));
        }, 1000);
    }
}


function exportData(url) {
    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    if($("#btn-export-logs-cancel").length >0 ) $("#btn-export-logs-cancel").click();
}