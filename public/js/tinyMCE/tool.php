<?php
	return array(
        'branding' => false,
		'relative_urls' => false,
	    'mode' => 'textareas',
	    'selector' => 'tool-editable-selector',
		'language' => 'en',
		'branding' => false,
		'inline' => false,
		'menubar' => false,
		'autoresize_on_init' => false,
		'templates' => 'miniTemplates',
		'forced_root_block' => '',
		'paste_word_valid_elements'=> "p,b,strong,i,em,h1,h2,h3,h4",
		'cleanup' => false,
		'verify_html' => false,
	    'paste_auto_cleanup_on_paste' => true,
        'file_picker_types' => 'file image media',
        'file_picker_callback' => 'filePickerCallback',
        'images_upload_url' => '/melis/MelisCore/MelisTinyMce/uploadImage',
		'plugins' => array(
            //[contextmenu, textcolor, colorpicker] this plugin is already built in the core editor as of TinyMCE v. 5
           'lists advlist autolink link paste image charmap preview anchor emoticons help hr nonbreaking',
           'searchreplace visualblocks code fullscreen',
           'insertdatetime media table template'
        ),
        'image_advtab' => true,
        'toolbar' => 'insertfile undo redo paste | formatselect | forecolor | bold italic strikethrough underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media template | code',
        'setup' => 'melisTinyMCE.tinyMceActionEvent',
        'init_instance_callback' => 'tinyMceCleaner'
	);

# For reference before implementing this fixed: http://mantis.melistechnology.fr/view.php?id=3675
/* return array(
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
); */