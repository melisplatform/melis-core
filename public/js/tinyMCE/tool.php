<?php
	return [
        'branding' => false,
		'relative_urls' => false,
	    'mode' => 'textareas',
	    'selector' => 'tool-editable-selector',
		'language' => 'en',
		'mobile' => [
			'theme' => 'silver',
			'height' => 300
		],
		'branding' => false,
		'inline' => false,
		'menubar' => false,
		'templates' => '/melis/MelisCore/MelisTinyMce/getTinyTemplates',
		'forced_root_block' => '',
		'paste_word_valid_elements'=> "p,b,strong,i,em,h1,h2,h3,h4",
		'cleanup' => false,
		'verify_html' => false,
	    'paste_auto_cleanup_on_paste' => true,
        'file_picker_types' => 'file image media',
        'file_picker_callback' => 'filePickerCallback',
        'images_upload_url' => '/melis/MelisCore/MelisTinyMce/uploadImage',
		'plugins' => [
            //[contextmenu, textcolor, colorpicker] this plugin is already built in the core editor as of TinyMCE v. 5
           'lists advlist autolink link paste image charmap preview anchor emoticons help hr nonbreaking',
           'searchreplace visualblocks code fullscreen',
           'insertdatetime media table minitemplate'
		],
		'external_plugins' => [
			'minitemplate' => '/MelisCore/js/minitemplate/plugin.min.js?v=20210325',			
		],
		//'content_css' => ['/MelisDemoCms/css/bootstrap.min.css','/MelisDemoCms/vendors/elagent/style.css','/MelisDemoCms/css/style.css'],
        'image_advtab' => true,
        'toolbar' => 'insertfile undo redo paste | formatselect | forecolor | bold italic strikethrough underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media minitemplate | code',
        'setup' => 'melisTinyMCE.tinyMceActionEvent',
        'init_instance_callback' => 'tinyMceCleaner'
	];

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
