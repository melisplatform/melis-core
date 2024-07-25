$(function() {
	var $body = $("body");	
		$body.on("click", ".m-dnd-tool-open", function() {
			//$('#id_meliscms_plugin_modal_container').modal('hide');
			const $cmsModalPlugin = bootstrap.Modal.getOrCreateInstance("#id_meliscms_plugin_modal_container", {
				show: true,
				keyboard: false,
				backdrop: true
			});

			$cmsModalPlugin.hide();
		});
});
