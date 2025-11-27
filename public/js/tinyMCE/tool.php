<?php
	return [
		'relative_urls' => false,
        'base_url' => '/MelisCore/build/js/',
	    //'mode' => 'textareas',
	    'selector' => 'tool-editable-selector',
		'language' => 'en',
		'mobile' => [
			//'theme' => 'silver',
			'height' => 300
		],
		'branding' => false,
		'inline' => false,
		'mini_templates_url' => '/melis/MelisCore/MelisTinyMce/getTinyTemplates',
		'forced_root_block' => 'p',
		'image_uploadtab' => false,
		//'paste_word_valid_elements'=> "p,b,strong,i,em,h1,h2,h3,h4",
		'cleanup' => false,
		'verify_html' => false,
	    'paste_auto_cleanup_on_paste' => true,
        'file_picker_types' => 'file image media',
        'file_picker_callback' => 'filePickerCallback',
        'images_upload_url' => '/melis/MelisCore/MelisTinyMce/uploadImage',
		'plugins' => [
           'accordion', 'anchor', 'autoresize', 'autosave', 'codesample', 'directionality', 'emoticons', 'importcss', 'pagebreak', 'quickbars', 'save', 'visualchars', 'wordcount', 'lists', 'advlist', 'autolink', 'link', 'image', 'charmap', 'preview', 'anchor', 'help', 'nonbreaking', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'minitemplate' 
		],
		'external_plugins' => [
			'minitemplate' => '/MelisCore/js/minitemplate/plugin.min.js?v=20230214'
		],
        'image_advtab' => true,
		'menubar' => 'file edit view insert format tools table help',
		// formatselect = blocks
        'toolbar' => 'insertfile undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic strikethrough underline | alignleft aligncenter alignright alignjustify | bullist numlist | link unlink image | table media | lineheight outdent indent | forecolor backcolor removeformat | charmap emoticons | minitemplate code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl',
		'font_size_formats' => '0.6665rem 0.8331rem 1.0rem 1.1664rem 1.4996rem 2.0rem 2.5rem 3.0rem',
		'toolbar_mode' => 'sliding',
		'deprecation_warnings' => false,
		'promotion' => false,
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
	'forced_root_block' => 'div',
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
