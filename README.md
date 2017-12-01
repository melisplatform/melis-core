# melis-core

MelisCore provides a full back-office platform, ready to use and accepting plenty of modules to run on top of it.

## Getting Started

These instructions will get you a copy of the project up and running on your machine.

### Prerequisites

You will need to install melisplatform/melis-asset-manager in order to have this module running.  
This will automatically be done when using composer.

### Installing

Run the composer command:
```
composer require melisplatform/melis-core
```

In order to get the skeleton, run the following command and bring MelisCore, MelisCms and other modules:  
```
composer create-project melisplatform/melis-cms-skeleton .
```

**[Access Melis Platform's setup video and documentation here](https://www.melistechnology.com/melistechnology/resources/download-documentation/id/17)**  


### Database    

Database model is accessible on the MySQL Workbench file:  
/melis-core/install/sql/model  
Database will be installed through composer and its hooks.  
In case of problems, SQL files are located here:  
/melis-core/install/sql  


## Tools & Elements provided

* User Management Tool
* Login & Lost Password
* Main Dashboard
* Profile
* TinyMCE Editor
* Modules Tool
* Diagnostic Tool
* Logs Tool
* Platforms Tool
* Back-Office Email Management Tool
* Back-Office Language Tool
* Microservices system

## Running the code

### MelisCore's interface designing  

Melis Platform is designed by following a recursive array that defines all rendered parts of the interface.  
This recursive array can be found here:  
/melis-core/config/app.interface.php  
All modules that add content to the back office must implement this system and merge their configuration to the ZF2 config.  
```
'plugins' => array(
	'meliscore' => array(
		'interface' => array(
			// First child of the interface with key name meliscore_header
			// This child has an absolute path of /plugins/meliscore/interface/meliscore_header
			'meliscore_header' => array(
				'conf' => array(
					'id' => 'id_meliscore_header',
					// But this child also as a relative path, easier of meliscore_header, also called melisKey
					'melisKey' => 'meliscore_header',
					'name' => 'tr_meliscore_header',
				),
				// Forward: how to generate this part by calling module/controller/action
				// This will also give back JS to be called for initializations
				'forward' => array(
					'module' => 'MelisCore',
					'controller' => 'Index',
					'action' => 'header',
					'jscallback' => '',
					'jsdatas' => array()
				),
				'interface' => array(
					// Continue recursively
				),
			),
		),
	),
),
```
**[See Full documentation on modules and interface designing here](https://www.melistechnology.com/MelisTechnology/resources/documentation/back-office/module-functions/MelisPlatformsinterfaceprinciple)**

### Reordering the children of an interface    

As configuration between modules are merged with each other in the module's order, it doesn't always correspond to the actual order you'd like to be displayed.  
It is possible to define a specific order by creating a key 'interface_ordering' at the root and listing children keys in a specific order:  
```
'interface_ordering' => array(
    // reordering le left pannel of Melis Platform
	'meliscore_leftmenu' => array(
		'meliscore_leftmenu_identity',  // identity zone first
		'meliscore_leftmenu_dashboard', // acces to dashboard second
		'meliscms_sitetree',		// site tree 3rd
		'meliscore_toolstree',		// tools tree 4th
		'meliscore_footer',		// footer last
	),
```


### MelisCore Services  

MelisCore provides many services to be used in other modules.  
Find them in the folder: /melis-core/src/Service  

* MelisCoreConfig  
This service deals with the interface config files that generates the back-office interface.  
All files "/config/app.interface.php" from all modules are merged together to create a big configuration.  
This service will then handle it and all the specificities from MelisPlatform.  
Access to the configuration only through this service as it will run many scripts (translations, melisKey, etc).  
File: /melis-core/src/Service/MelisCoreConfigService.php  
```
// Example 1
// Get the service
$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
// Get the subpart of the config file
$appsConfigCenter = $melisAppConfig->getItem('/meliscore/interface/meliscore_center/');
```
```
// Example 2
// Get the service
$melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
// Get a form config, always use getFormMergedAndOrdered
$appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('meliscore/tools/meliscore_logs_tool/forms/meliscore_logs_tool_log_type_form','meliscore_logs_tool_log_type_form');
```
```
// Example 3
// Get the service
$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
// Get the "datas" part of the "meliscore" key in the config and, using getItemPerPlatform, select depending on the platform you're on
$datas = $melisAppConfig->getItemPerPlatform('/meliscore/datas');
```

* MelisCoreAuthService  
Gets the user's auth and validates authentication, extends ZF AuthenticationService
File: /melis-core/src/Service/MelisCoreAuthService.php  
```
// Get the service
$melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');  
// check identity
$logged = $melisCoreAuth->hasIdentity()  
```

* MelisCoreRights  
Get the rights defined for the user and adapt access to the different elements of the interface:  
File: /melis-core/src/Service/MelisCoreRightsService.php  
```
// Get the services  
$melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
$melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
if($melisCoreAuth->hasIdentity())
{
	// Get the user's rights
	$xmlRights = $melisCoreAuth->getAuthRights();
	
	// Check if the user has an exclusion of access to /meliscore_dashboard
	$isAccessible = $melisCoreRights->isAccessible($xmlRights,
							MelisCoreRightsService::MELISCORE_PREFIX_INTERFACE,
							'/meliscore_dashboard');
}        
```  

* MelisCoreFlashMessenger  
Add logs to flash messenger and get some notifications in the back office  
```
$flashMessenger = $this->getServiceLocator()->get('MelisCoreFlashMessenger');
$flashMessenger->addToFlashMessenger('title', 'message', $flashMessenger::WARNING);
```  

* MelisCoreBOEmailService  
File: /melis-core/src/Service/MelisCoreBOEmailService.php    
Add or override emails sent from the back office to send them from your modules and manage them through a tool  
```
// Get the service
$melisEmailBO = $this->getServiceLocator()->get('MelisCoreBOEmailService');  
// Send the mail and fills the blanks in the mail (tags), get the language version
$melisEmailBO->sendBoEmailByCode('ACCOUNTCREATION',  $tags, $email_to, $name_to, $langId);  
```
**[See Full documentation on back-office emails here](https://www.melistechnology.com/MelisTechnology/resources/documentation/back-office/email-management-system/Presentationoftheemailmanagement)**


### MelisCore Forms  

#### Forms factories
All Melis CMS forms are built using Form Factories.  
All form configuration are available in the file: /melis-core/config/app.forms.php  
Any module can override or add items in this form by building the keys in an array and marge it in the Module.php config creation part.  
``` 
return array(
	'plugins' => array(
	
		// MelisCms array
		'meliscore' => array(
		
			// Form key
			'forms' => array(
			
				// MelisCore login form
				'meliscore_login' => array(
					'attributes' => array(
						'name' => 'meliscore_login',
						'id' => 'idformmeliscorelogin',
						'method' => 'POST',
					),
					'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
					'elements' => array(  
						array(
							'spec' => array(
								...
							),
						),
					),
					'input_filter' => array(      
						'usr_login' => array(
							...
						),   
					),
				),
			),
		),
	),
),
``` 

#### Forms elements
MelisCore provides many form elements to be used in forms:  
* MelisCoreLanguageSelect: a dropdown to select a language of the platform  
* MelisCoreSiteSelect: a dropdown to select a site  
* MelisToggleButton: an on-off button designed for Melis Platform  
* MelisText: a input field  

#### Overriding / Adding / Changing order of the fields

Existing forms can be updated to add new fields by simply declaring the form in your module's config and update the key for your form.  
To reuse the previous example, going back to the meliscore_login key, then adding new fields, eventually merged all together:  
``` 
return array(
	'plugins' => array(
		// MelisCms array
		'meliscore' => array(
			// Form key
			'forms' => array(
				// MelisCore login form
				'meliscore_login' => array(
					'elements' => array(  
					),
					'input_filter' => array(     
					),
``` 

At some point, it could be a nessecity to reorder the fields for a specific project.  
Declare a key 'forms_ordering' and a subkey nammed like the form.  
Then just place existing elements in the order needed.  No need to place all of them, start with what is reordered and stop when it's finished, other existing form elements will automatically be added at the end.  
```
return array(
	// key at the root for listing forms' order modifications
	'forms_ordering' => array(
   
		// change the order of the MelisCore email management form tool.
		'meliscore_emails_mngt_tool_general_properties_form' => array(
			'elements' => array(
				// Name will now be first
				array(
					'spec' => array(
						'name' => 'boe_code_name',
					),
				),
				// "From" email will be second
				array(
					'spec' => array(
						'name' => 'boe_from_email',
					),
				),
               
				// Rest of the form's field will come in order after
			),
		),
	),
);
```

MelisCoreConfig Service provides a method called getFormMergedAndOrdered that will get the form and give it back reordered:  
```
// Get the service
$melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
// Get a form config, always use getFormMergedAndOrdered
$appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('meliscore/tools/meliscore_logs_tool/forms/meliscore_logs_tool_log_type_form','meliscore_logs_tool_log_type_form');
```


### Listening to services and update behavior with custom code  
Most services trigger events so that the behavior can be modified.  
```  
public function attach(EventManagerInterface $events)
{
	$sharedEvents = $events->getSharedManager();

	$callBackHandler = $sharedEvents->attach(
		'MelisCore',
		array(
			'meliscore_tooluser_save_end', 
		),
		function($e){

			$sm = $e->getTarget()->getServiceLocator();
    		
    		// custom code
    	},
    100);
    
    $this->listeners[] = $callBackHandler;
}
```  

### Javascript helpers provided with MelisCore    

#### Melis Helpers

Most helpers are located in the file:  
/melis-core/public/js/core/melisHelper.js  
* zoneReload: Reloads an html zone using the MelisKey and an ajax call
* createModal: Creates a modal and put a template inside
* melisOkNotification: generates a green notification
* melisKoNotification: generates a red notification
* tabSwitch: switches the main tabs
* tabClose: closes a tab
* tabOpen: opens a tab
* loadingZone: wraps a div in a loading design
* removeLoadingZone: removes the loading design  

**[See Full documentation on back-office emails here](https://www.melistechnology.com/MelisTechnology/resources/documentation/back-office/module-functions/ZoneReloadHelper)**



#### TinyMCE and configurations  

MelisCore brings TinyMCE as its editor and has one configuration.  
TinyMCE helper is located here:  
/melis-core/public/js/tinyMCE/melis_tinymce.js  
```  
// Creating a tinyMCE zone with config "tool" on the selected item and overriding some parameters from conf
melisTinyMCE.createTinyMCE("tool", selector, {height: 200, relative_urls: false});
```  
Configurations:  
* tool: the default config for tools that use html editor  
Creating other config is possible. Add the config in a file then declare the file in the module.config.php file of the module:  
```  
// Config Files  
'tinyMCE' => array(  
	'html' => 'MelisCore/public/js/tinyMCE/tool.php',  
),  
```   
**[See Full documentation on TinyMCE and Melis Platform here](https://www.melistechnology.com/MelisTechnology/resources/documentation/back-office/configuration-of-tinymce/Configurationfilesoverview)**


## Authors

* **Melis Technology** - [www.melistechnology.com](https://www.melistechnology.com/)

See also the list of [contributors](https://github.com/melisplatform/melis-core/contributors) who participated in this project.


## License

This project is licensed under the OSL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details