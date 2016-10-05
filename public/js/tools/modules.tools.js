$(document).ready(function() { 
	
	$("body").on("click", "#btnModulesSave", function() {
		var modules = [];
		var moduleSwitches = $(".module-switch");
		var on = "switch-on";
		var off= "switch-off";
		var moduleStatus = "";
		$.each(moduleSwitches , function(idx, val) {
			var moduleName = $(val).data("module-name");
			var status = $(".module-switch[data-module-name='"+ moduleName +"']").find("div").attr("class");
		    status = status.split(" ");
		    $.each(status, function(i, v) {
		        if(v == on) {
					moduleStatus = 1;
				}
				else if(v == off) {
					moduleStatus = 0;
				}
		    });
			modules.push({
				name: moduleName,
				value: moduleStatus
			});
		});
		
		modules = $.param(modules);
		melisCoreTool.confirm(
			translations.tr_meliscore_common_yes, 
			translations.tr_meliscore_common_no, 
			translations.tr_meliscore_module_management_modules, 
			translations.tr_meliscore_module_management_prompt_confirm, 
			function() {
				$.ajax({
			        type        : 'POST', 
			        url         : '/melis/MelisCore/Modules/saveModuleChanges',
			        data		: modules,
			        dataType    : 'json',
			        encode		: true,
			     }).success(function(data){
		    	 	if(data.success == 1) {
		    	 		melisCoreTool.processing();
		    	 		setTimeout(function() {window.location.reload(true) }, 3000);
		    	 	}
		    	 	else {
		    	 		melisHelper.melisKoNotification(data.textTitle, data.textMessage);
		    	 	}
		    	 	
		    	 	melisCore.flashMessenger();
			     });
			}
		);

		
	});
	
});