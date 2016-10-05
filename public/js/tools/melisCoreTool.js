/* This file will be used mostly used when you want to implement a unified rendering to your tool */

/**
 * Global Variables
 */
var dStartDate = ''; //moment().subtract(29, 'days').format(melisDateFormat);
var dEndDate   = ''; //moment().format(melisDateFormat);


var melisCoreTool = (function(window){

	// FOR MODALS
	function confirm(textOk, textNo, title, msg, callBackOnYes) {
		BootstrapDialog.show({
			title: title,
			message: msg,
			type: BootstrapDialog.TYPE_WARNING,
			closable: true,
			buttons: [{
                label: textNo, //translations.tr_meliscore_common_no
                cssClass: 'btn-danger pull-left',
                action: function(dialog) {
                	dialog.close();
                }
            }, {
                label: textOk, //translations.tr_meliscore_common_yes
                cssClass: 'btn-success',
                action: function(dialog) {
                	callBackOnYes();
                	dialog.close();
                }
            }]
		});
	}
	
	// ALERTS
	function showAlert(target, highlight, message, type) {
		$(target).removeClass();
		$(target).css("display", "none");
		$(target).addClass("alert alert-" + type);
		$(target).html("<strong>" + highlight + "</strong> " + message);
		$(target).fadeIn();
	}
	
	function alertDanger(target, highlight, message) {
		showAlert(target, highlight, message, "danger");
	}
	
	function alertSuccess(target, highlight, message) {
		showAlert(target, highlight, message, "success");
	}
	
	
	function alertInfo(target, highlight, message) {
		showAlert(target, highlight, message, "info");
	}
	
	function alertWarning(target, highlight, message) {
		showAlert(target, highlight, message, "warning");
	}
	
	function hideAlert(target) {
		$(target).fadeOut();
	}
	
	// FORMS
	function clearForm(formId) {
		$('#' + formId)[0].reset();
	}
	
	function highlightErrors(success, errors, divContainer) {
		// if all form fields are error color them red
		if(success === 0){
			$("#" + divContainer + " .form-group label").css("color","#686868");
			$.each( errors, function( key, error ) { 
				$("#" + divContainer + " .form-control[name='"+key +"']").prev("label").css("color","red");
			});
		}
		// remove red color for correctly inputted fields
		else{
			$("#" + divContainer + " .form-group label").css("color","#686868");
		}
	}
	
	function resetLabels(form) {
		$(form).find("label").css("color", "#686868");
	}
	
	function processing() {
		var overlay = '<div id="loader" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';;
		$(overlay).appendTo('body');
	}
	
	function processDone() {
		$("body #loader").remove();
	}
	
	function exportData(url, callback) {
		var newWindow = window.open(url, "_blank");
		newWindow.onload = function() {
			newWindow.close();
		};
		
	}
	
	function isTableEmpty(table) {
		var matches = null;
		var findNum = $("div[class='dataTables_info'][id='"+table+"_info']").html();
		var isEmpty = true;
		matches = findNum.match(/\d+/g);
		var count = parseInt(matches[0]) > 0 ? false : true;
		isEmpty = count;

		return isEmpty;
	}
	
	function switchTab(tabId) {
		$('.widget-tabs a[href="'+ tabId +'"]').tab('show');
	}
	
	function showOnlyTab(modalContainer, tabId) {
		showAllTabs(modalContainer);
		hideAllTabs(modalContainer);
		showTab(tabId);
		switchTab(tabId);
	}
	
	function showTab(tabId) {
		var parent = $('.widget-tabs a[href="'+ tabId +'"]').parent();
		$(parent).show();
	}
	
	function showTabs(modalContainer, tabs) {
		//melisTool.tabs.hideAllTabs(modalContainer);
		var mTabs = tabs.split(",");
		$.each(mTabs, function(e, tabId) {
			showTab(tabId);
		});
		switchTab(mTabs[0]);
	}
	
	function hideTab(modalContainer, tabId, switchTo) {
		showAllTabs(modalContainer);
		var parent = $('.widget-tabs a[href="'+ tabId +'"]').parent();
		$(parent).hide();
		switchTab(switchTo);
	}
	
	function hideAllTabs(modalContainer) {
		var li = $(modalContainer + " .widget-head ul li").css('display', 'none');
	}
	
	function hideTabs(modalContainer, tabs, switchTo) {
		showAllTabs(modalContainer);
		var mTabs = tabs.split(",");
		$.each(mTabs, function(e, tabId) {
			var parent = $('.widget-tabs a[href="'+ tabId +'"]').parent();
			$(parent).hide();
		});
		switchTab(switchTo);
	}
	
	function showAllTabs(modalContainer) {
		var li = $(modalContainer + " .widget-head ul li");
		li.css('display', 'block');	
	}
	
	// ACTION
	function pending(targetButton) {
		// show an overlay and disable the button
		var div = "<div class='melis-modal-overlay'></div>";
		$("body").append(div);
		$(targetButton).attr('disabled', 'disabled');
	}
	
	function done(targetButton) {
		// hide the overlay and enable the button
		$("body div.melis-modal-overlay").remove();
		$(targetButton).removeAttr('disabled');
	}
	
	// date 
	function init() {
		var sToday = translations.tr_meliscore_datepicker_today;
		var sYesterday = translations.tr_meliscore_datepicker_yesterday;
		var sLast7Days = translations.tr_meliscore_datepicker_last_7_days;
		var sLast30Days = translations.tr_meliscore_datepicker_last_30_days;
		var sThisMonth = translations.tr_meliscore_datepicker_this_month;
		var sLastMonth = translations.tr_meliscore_datepicker_last_month;
		
		function cb(start, end) {
			dStartDate = start.format(melisDateFormat);
			dEndDate   = end.format(melisDateFormat);
			// default display upon initialization of date picker
			//var icon = '<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>';
			//$('#dt_bsdatepicker .dt_dateInfo').html("Select Date: " + icon + dStartDate + ' - ' + dEndDate + ' <b class="caret"></b>');
		}
		var rangeStringParam = {};
		rangeStringParam[sToday] = [moment(), moment()];
		rangeStringParam[sYesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
		rangeStringParam[sLast7Days] = [moment().subtract(6, 'days'), moment()];
		rangeStringParam[sLast30Days] = [moment().subtract(29, 'days'), moment()];
		rangeStringParam[sThisMonth] = [moment().startOf('month'), moment().endOf('month')];
		rangeStringParam[sLastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
		
		$("#dt_bsdatepicker").daterangepicker({
	    	locale : {
	    		format: melisDateFormat,
	    		applyLabel: translations.tr_meliscore_datepicker_apply,
	    		cancelLabel: translations.tr_meliscore_datepicker_cancel,
	    		customRangeLabel: translations.tr_meliscore_datepicker_custom_range,
	    	},
	        ranges: rangeStringParam,
	    }, cb);
	}
	

	
	return {
		// modal
		confirm 		: confirm,
		
		// alert
		alertDanger 	: alertDanger,
		alertSuccess 	: alertSuccess,
		alertInfo 		: alertInfo,
		alertWarning 	: alertWarning,
		hideAlert 		: hideAlert,
		
		// forms
		clearForm		: clearForm,
		highlightErrors : highlightErrors,
		resetLabels		: resetLabels,
		processing		: processing,
		processDone		: processDone,
		
		// table
		exportData		: exportData,
		isTableEmpty	: isTableEmpty,
		
		// tabs
		switchTab		: switchTab,
		showOnlyTab		: showOnlyTab,
		showTab			: showTab,
		showTabs		: showTabs,
		hideTab			: hideTab,
		hideTabs		: hideTabs,
		hideAllTabs		: hideAllTabs,
		showAllTabs		: showAllTabs,
		
		// action
		pending			: pending,
		done			: done,
		
		// date
		init			: init,
	}
		
})(window);