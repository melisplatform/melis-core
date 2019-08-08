(function($) {
	var $body = $("body");
	var module = null;
	var runAllMode = false;
	var totalExec = 0;
	var totalAvailableTest = 0;
	var execPerMod = 4;
	var execChecker = null;	
	var hideVal = translations.tr_melis_module_diagnostics_tool_header_hide_all;
	
	$body.on("click", "#btnDiagRunAll", function() {
		totalExec = 0;
		totalAvailableTest = parseInt($(".btn-run-module-test").size()) * execPerMod
		runAllMode = true;
		
		
		if($("#btnDiagRunAll").html() == hideVal) {

			changeContent("#btnDiagRunAll", translations.tr_melis_module_diagnostics_tool_header_run_al);
			resetStartButton("");
			console.log("hide all");
		}
		
		if(runAllMode && $("#btnDiagRunAll").html() != hideVal) {
			console.log("run");
			$(".btn-run-module-test").trigger("click");
			changeContent("#btnDiagRunAll", translations.tr_melis_module_diagnostics_tool_header_run_al);
			runAllMode = false;
			
		}
		


	});
	
	$body.on("click", ".btn-run-module-test", function(){
		module = $(this).data("modules");
		moduleElement = ".btn-run-module-test[data-modules='"+module+"']";
		
		
		var value = $(moduleElement).html().trim();
		var runTest = translations.tr_melis_module_diagnostics_run_test;
		var hideValue = translations.tr_melis_module_diagnostics_collapse;
		
		
		$("#collapse"+ module).collapse('toggle');
		
		if(value == runTest) {
			startTestButton(module);
			checkModule("start", module);
		}
		
		if(value == hideValue) {
			var progressBar = "#pb"+module;
			var logger = "#well"+module;
			resetProgBar(progressBar);
			$(logger).html("");

			$(moduleElement).html(runTest).removeClass("btn-info").addClass("btn-success");
			module = null;
		}

	});

	function startTestButton(m) {
		var btn = ".btn-run-module-test";
		if(m != "") {
			btn = ".btn-run-module-test[data-modules='"+m+"']";
		}
		changeContent(btn, translations.tr_melis_module_diagnostics_testing);
		$(btn).removeClass("btn-success");
		$(btn).addClass("btn-danger");
		if(!runAllMode) {
			$(".btn-run-module-test").attr("disabled", "disabled");
		}
	}
	
	function resetStartButton(m) {
		var btn = ".btn-run-module-test";
		if(m != "") {
			btn = ".btn-run-module-test[data-modules='"+m+"']";
		}
		changeContent(btn, translations.tr_melis_module_diagnostics_collapse);
		$(btn).removeClass("btn-danger");
		$(btn).addClass("btn-info");
		setTimeout(function() {
			$(".btn-run-module-test").removeAttr("disabled");
		}, 1000);
		
	}

	function incProgBar(pb, value) {
		var progCurrentVal = parseInt($(pb).attr("aria-valuenow"));
		var newVal = progCurrentVal + value;
		$(pb).attr("aria-valuenow", newVal);
		$(pb).html(newVal + "%");
		$(pb).css("width", newVal + "%");
	}
	
	function resetProgBar(pb) {
		$(pb).attr("aria-valuenow", 0);
		$(pb).html("0%");
		$(pb).css("width", "0%");
	}
	
	function addLog(log, value, type) {
		$(log).append("<p class='"+type+"'>"+value+"</p>");
	}
	
	function addSuccessLog(log, value) {
		addLog(log, "OK: "+value, "text-success");
	}
	
	function addErrorLog(log, value) {
		addLog(log, "KO: " + value, "text-danger");
	}
	
	function addWarningLog(log, value) {
		addLog(log, "OK: " + value, "text-warning");
	}
	
	function changeContent(target, content) {
		setTimeout(function() {
			
			$(target).html(content);
			
		}, 500);
	}
	
	function checkModule(action, mod) {
		var pb = "#pb"+mod
		var log = "#well"+mod;
		totalExec++;
		if(action == undefined || action == null) {
			return false;
		}
		
		$.ajax({
			url: '/melis/MelisCore/ModuleDiagnostic/' + action + "?v=" + new Date().getTime(),
			dataType: 'json',
			data: {module : mod},
			type: 'POST',
			cache: false
		}).done(function(data) {
			if(data) {

				$.each(data.messages, function(status, checking) {

					switch(checking.success) {
						case 1:
							addSuccessLog(log, checking.message);
						break;
						case 2:
							addWarningLog(log, checking.message);
						break;
						case 0:
							addErrorLog(log, checking.message);
						break;
					}

				});

				if(data.next) {
					checkModule(data.next, mod);
				}
				
				if(data.progressBarValue != null) {
					var inc = parseInt(data.progressBarValue);
					incProgBar(pb, inc);
				}

				if(data.stopProcess){
					addSuccessLog(log, translations.tr_melis_module_aborted);
					resetStartButton(mod);
				}
			}
			else {
				addWarningLog(log, translations.tr_melis_module_no_more_results);
				addErrorLog(log, translations.tr_melis_module_aborted);
				resetStartButton(mod);
			}
		}).fail(function(xhr, textStatus, errorThrown) {
			addWarningLog(log, translations.tr_melis_module_no_more_results);
			addErrorLog(log, mod + " " + errorThrown);
			addErrorLog(log, translations.tr_melis_module_aborted);
			resetStartButton(mod);
		});
	}
	
//	function checkExecutions() {
//		execChecker = setInterval(function() {
//			if(totalExec == totalAvailableTest) {
//				$("#btnDiagRunAll").html(translations.tr_melis_module_diagnostics_tool_header_run_all);
//				if($("#btnDiagRunAll").html() == translations.tr_melis_module_diagnostics_tool_header_run_all) {
//					stopExecutions();
//					console.log('equals');
//				}
//			}
//			console.log('execution is running');
//		}, 100);
//		
//	}
//	
//	function stopExecutions() {
//		clearInterval(execChecker);
//		execChecker = null;
//		$(".collapse").collapse("hide");
//	}
	
})(jQuery);