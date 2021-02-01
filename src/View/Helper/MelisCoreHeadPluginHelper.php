<?php

namespace MelisCore\View\Helper;

use Laminas\ServiceManager\ServiceManager;
use Laminas\View\Helper\AbstractHelper;
use MelisCore\Library\MelisAppConfig;

class MelisCoreHeadPluginHelper extends AbstractHelper
{
	public $serviceManager;

    public function setServiceManager(ServiceManager $serviceManager)
    {
        $this->serviceManager = $serviceManager;
    }

    public function __invoke($path = '/')
	{
		$melisAppConfig = $this->serviceManager->get('MelisCoreConfig');
		
		$appsConfig = $melisAppConfig->getItem($path);
		if ($path != '/') {
	        $path = substr($path, 1, strlen($path));
	        $appsConfig = [$path => $appsConfig];
	    }
	    
		$jsFiles = [];
		$cssFiles = [];
		foreach ($appsConfig as $keyPlugin => $appConfig)
		{	
			$jsFiles = array_merge($jsFiles, $melisAppConfig->getItem("/$keyPlugin/ressources/js"));
			$cssFiles = array_merge($cssFiles, $melisAppConfig->getItem("/$keyPlugin/ressources/css"));
		}
		
		return ['js' => $jsFiles,
					 'css' => $cssFiles];
	}
}