<?php
	return array(
	    'mode' => 'textareas',
		'relative_urls' => false,
		'selector' => 'tool-editable-selector',
		'language' => 'en',
		'branding' => false,
		'inline' => false,
		'menubar' => false,
		'forced_root_block' => '',
		'cleanup' => false,
		'verify_html' => false,
	    'paste_auto_cleanup_on_paste' => true,
		'plugins' => array(
			//[contextmenu, textcolor, colorpicker] this plugin is already built in the core editor as of TinyMCE v. 5
		    'advlist autolink lists link image charmap print preview anchor',
		    'searchreplace visualblocks code fullscreen',
		    'insertdatetime media table paste'
	    ),
	    'toolbar' => 'undo redo | styleselect | bold italic | link image |  alignleft aligncenter alignright alignjustify | forecolor | code',
	    'setup' => 'melisTinyMCE.tinyMceActionEvent',
	    'init_instance_callback' => 'tinyMceCleaner'
	);
