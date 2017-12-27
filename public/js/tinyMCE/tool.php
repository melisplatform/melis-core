<?php
	return array(
	    'mode' => 'textareas',
		'relative_urls' => false,
		'selector' => 'tool-editable-selector',
		'language' => 'en',
		'inline' => false,
		'menubar' => false,
		'forced_root_block' => 'p',
		'cleanup' => false,
		'verify_html' => false,
	    'setup' => 'melisTinyMCE.tinyMceActionEvent',
	    'paste_auto_cleanup_on_paste' => true,
		'plugins' => array(
		    'advlist autolink lists link image charmap print preview anchor',
		    'searchreplace visualblocks code fullscreen',
		    'insertdatetime media table contextmenu paste'
	    ),
	    'toolbar' => 'undo redo | styleselect | bold italic | link image |  alignleft aligncenter alignright alignjustify',
	    'init_instance_callback' => 'tinyMceCleaner',
	); 