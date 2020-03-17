<?php

namespace MelisCore\View\Helper;

use Laminas\View\Helper\AbstractHelper;
use MelisCore\Library\MelisAppConfig;

class MelisCoreHeadPluginHelper extends AbstractHelper
{
	public $serviceManager;

	public function __construct($sm)
	{
		$this->serviceManager = $sm;
	}
	
	public function __invoke($path = '/')
	{
		$melisAppConfig = $this->serviceManager->get('MelisCoreConfig');
		
		$appsConfig = $melisAppConfig->getItem($path);
		if ($path != '/')
	    {
	        $path = substr($path, 1, strlen($path));
	        $appsConfig = array($path => $appsConfig);
	    }
	    
		$jsFiles = array();
		$cssFiles = array();
		foreach ($appsConfig as $keyPlugin => $appConfig)
		{	
			$jsFiles = array_merge($jsFiles, $melisAppConfig->getItem("/$keyPlugin/ressources/js"));
			$cssFiles = array_merge($cssFiles, $melisAppConfig->getItem("/$keyPlugin/ressources/css"));
		}
		
		return array('js' => $jsFiles,
					 'css' => $cssFiles);
	}
}