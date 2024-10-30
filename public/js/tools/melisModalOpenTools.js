$(function() {
	var $body = $("body");	
		$body.on("click", ".m-dnd-tool-open", function() {
			//$('#id_meliscms_plugin_modal_container').modal('hide');
			melisCoreTool.hideModal("id_meliscms_plugin_modal_container");
		});
});
