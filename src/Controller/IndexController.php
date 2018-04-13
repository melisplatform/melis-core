<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use MelisCore\Service\MelisCoreRightsService;
use Zend\Http\PhpEnvironment\Response as HttpResponse;

/**
 * This class renders Melis CMS
 */
class IndexController extends AbstractActionController
{
	/**
	 * Rendering the Melis CMS interface
	 * @return \Zend\View\Model\ViewModel
	 */
    public function melisAction()
    { 
    	$view = $this->forward()->dispatch('MelisCore\Controller\PluginView',
    			array('action' => 'generate',
    					'appconfigpath' => '/meliscore',
    					'keyview' => 'meliscore')); 
    	$this->layout()->addChild($view, 'content');
    	
    	$this->layout()->setVariable('jsCallBacks', $view->getVariable('jsCallBacks'));
    	$this->layout()->setVariable('datasCallback', $view->getVariable('datasCallback'));

        $schemeSvc  = $this->getServiceLocator()->get('MelisCorePlatformSchemeService');
        $schemeData = $schemeSvc->getCurrentScheme();

        $this->layout()->setVariable('schemes', $schemeData);

    	return $view;
    }
    
    /**
     * Shows the header section of Melis Platform
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function headerAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	$melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
    	
    	if ($melisCoreAuth->hasIdentity())
    	{
    		$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
    		$appsConfigCenter = $melisAppConfig->getItem('/meliscore/interface/meliscore_center/');
    	
    		$melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
    		$xmlRights = $melisCoreAuth->getAuthRights();
    		if (!empty($appsConfigCenter['interface']))
    		{
	    		foreach ($appsConfigCenter['interface'] as $keyInterface => $interface)
	    		{
	    			if (!empty($interface['conf']) && !empty($interface['conf']['type']))
	    				$keyTempInterface = $interface['conf']['type'];
	    			else
	    				$keyTempInterface = $keyInterface;
	    			$isAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_INTERFACE, $keyTempInterface);
	    			if (!$isAccessible)
	    			{
	    				unset($appsConfigCenter['interface'][$keyInterface]);
	    			}
	    		}
    		}
    	}
    	else
    		$appsConfigCenter = array();

        $schemeSvc  = $this->getServiceLocator()->get('MelisCorePlatformSchemeService');
        $schemeData = $schemeSvc->getCurrentScheme();
    	
    	$view                   = new ViewModel();
    	$view->melisKey         = $melisKey;
    	$view->appsConfigCenter = $appsConfigCenter;
    	$view->schemes          = $schemeData;
    	
    	return $view;
    }
    public function rightAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }
    /**
     * Shows the left menu of the Melis Platform interface
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function leftMenuAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	
    	return $view;
    }
    
    /**
     * Shows the footer of the Melis Platform interface
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function footerAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $moduleSvc       =  $this->getServiceLocator()->get('ModulesService');
        $modules         =  $moduleSvc->getAllModules();
        $platformVersion =  $moduleSvc->getModulesAndVersions('MelisCore');

        $request = $this->getRequest();
        $uri     = $request->getUri();

        $domain   = $uri->getHost();
        $scheme   = $uri->getScheme();


        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->platformVersion = $platformVersion['version'];
        $view->modules = serialize($modules);
        $view->scheme  = $scheme;
        $view->domain  = $domain;

        return $view;
    }
    
    /**
     * Shows the center zone of the Melis Platform interface
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function centerAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	
    	return $view;
    }
    
    /**
     * Shows the language select to change the language
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function headerLanguageAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	return $view;
    }

    /**
     * Shows the close button for closing of tabs
     */
    public function closeAllTabsAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        return $view;
    }

    
}
