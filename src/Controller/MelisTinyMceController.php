<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use MelisCore\Service\MelisCoreRightsService;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;
use Zend\Session\Container;

class MelisTinyMceController extends AbstractActionController
{
    public function getTinyMceConfigAction()
    {
		$success       = 0;
		$tinyMCEconfig = '';
		$request       = $this->getRequest();

		if ($request->isPost())
		{
            $modulesSvc = $this->getServiceLocator()->get('ModulesService');
		    // Getting the Posted Values
    		$postValues = get_object_vars($request->getPost());

    		$type = $postValues['type'];
    		$selector = $postValues['selector'];
    		$options = !empty($postValues['options']) ? $postValues['options'] : array();
    		
    		// Get the list of TinyMce configuration files declared
    		$config = $this->serviceLocator->get('config');
    		$configTinyMce = $config['tinyMCE'];
    		
    		// Checking if the type requested is exist on configuration
    		if (isset($configTinyMce[$type]))
    		{
    		    $configDir = $configTinyMce[$type];
    		    // Getting the module name
    		    $nameModuleTab = explode('/', $configDir);
    		    $nameModule = $nameModuleTab[0];
    		    // Getting the path of the Module
    		    $path = $modulesSvc->getModulePath($nameModule);
    		    // Generating the directory of the requested TinyMCE configuration
    		    $tinyMCEconfig = $path . str_replace($nameModule, '', $configDir);
    		}
    		
    		if (!is_null($tinyMCEconfig))
    		{
    		    // Getting the tinyMCE configuration from php file
    		    $tinyMCEconfig = include($tinyMCEconfig);
    		    // Assigning selector of the tinyMCE
    		    $tinyMCEconfig['selector'] = (!empty($selector)) ? $selector : '';
    		    // Set Language of the TinyMCE
    		    $container = new Container('meliscore');
    		    $locale = $container['melis-lang-locale'];
    		    $tinyMCEconfig['language'] = ($locale != 'en_EN') ? $locale : 'en';
    		    
    		    if (!empty($options))
    		    {
    		        // Merging Default TinyMCE configuration with Options from request
    		        $tinyMCEconfig = array_merge($tinyMCEconfig, $options);
    		    }
    		    $success = 1;
    		}

            /**
             * This listener is for users or developers who wants to extend the functionality of tinyMCE, especially when adding new extensions.
             */

            $config = $this->getEventManager()->trigger('meliscore_tinymce_config', $this);
            $tmpCfg = array();

            // reconstruct data
            foreach($config as $configKey => $cfg) {

                if($cfg) {
                    foreach($cfg['configuration'] as $configKey => $configVal) {
                        $tmpCfg[$configKey] = $configVal;
                    }
                }

                if(isset($cfg['exclude']) && !empty($cfg['exclude'])) {
                    // remove the excluded configuration(s)
                    foreach($cfg['exclude'] as $exclude) {
                        if(isset($tmpCfg[$exclude])) {
                            unset($tmpCfg[$exclude]);
                        }
                    }
                }


            }


            // merge reconstructed data to tinyMCE configuration
            foreach($tmpCfg as $idx => $cfg) {
                if($cfg) {
                    // get the merged and additional tinyMCE configurations
                    $tinyMCEconfig = \Zend\Stdlib\ArrayUtils::merge($tinyMCEconfig, $cfg);
                }
            }

		}
		
		$response = array(
		    'success' => $success,
		    'config'  => $tinyMCEconfig
		);
		
		return new JsonModel($response);
    }



}

