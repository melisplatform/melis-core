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
window.initExportLogDateRangePicker = function(){
    melisHelper.initDateRangePicker("#log_date_range");
    $("#log_date_range").daterangepicker({
        startDate: moment().subtract(8, 'days'),
        endDate: moment().subtract(1, 'days')
	});
}

window.dateRangePickerApplyEvent = function(ev, picker) {
    $tableMelisLogs.draw();
}

