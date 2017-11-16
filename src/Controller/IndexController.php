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
    	
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	$view->appsConfigCenter = $appsConfigCenter;
    	
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
    	$platformVersion =  $moduleSvc->getModulesAndVersions('MelisCore');

    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
    	$view->platformVersion = $platformVersion['version'];

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

    public function viewSessionAction()
    {
        $container = new \Zend\Session\Container('meliscore');

        \Zend\Debug\Debug::dump($container->getArrayCopy());
        die;
    }

    public function testerAction()
    {
        echo '<pre>';

        $moduleSvc = $this->getServiceLocator()->get('ModulesService');

        $modules = $moduleSvc->getChildDependencies('MelisCms');

        print_r($modules);

        echo '</pre>';
        die;

    }
}
