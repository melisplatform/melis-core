<?php
	return array(
	    'mode' => 'textareas',
		'relative_urls' => false,
		'selector' => 'tool-editable-selector',
		'language' => 'en',
		'inline' => false,
		'menubar' => false,
		'force_br_newlines' => false,
		'force_p_newlines' => false,
		'forced_root_block' => '',
		'cleanup' => false,
		'verify_html' => false,
	    'setup' => 'melisTinyMCE.tinyMceActionEvent',
		'plugins' => array(
		    'advlist autolink lists link image charmap print preview anchor',
		    'searchreplace visualblocks code fullscreen',
		    'insertdatetime media table contextmenu paste'
	    ),
	    'toolbar' => 'undo redo | styleselect | bold italic | link image |  alignleft aligncenter alignright alignjustify',
	    'init_instance_callback' => 'tinyMceCleaner',
	); 