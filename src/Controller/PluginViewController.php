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
use Zend\View\Model\JsonModel;
use MelisCore\Service\MelisCoreRightsService;

/**
 * This class renders Melis CMS appConfig views recursively
 * to generate web interface based on it
 */
class PluginViewController extends AbstractActionController
{
	/**
	 * Generates recursively views depending on the appConfig file
	 *
	 * @param string $key Child name view
	 * @param string $fullKey Path in the appConfig file
	 * 
	 * @return \Zend\View\Model\ViewModel
	 */
	public function generateRec($key, $fullKey, $recDatas = array())
	{

        $isXmlHttpRequest = false;
        if ($this->getRequest()->isXmlHttpRequest())
            $isXmlHttpRequest = true;

		$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
		
		/**
		 * Get the corresponding appConfig part
		 */
		$itemConfig = $melisAppConfig->getItem($fullKey);
		
		if (!empty($itemConfig['datas']))
			$recDatas = array_merge_recursive($recDatas, $itemConfig['datas']);
		
		/**
		 * If we find a conf/type in the app.config, then we'll match it with
		 * the correct plugin conf.
		 */
		if (!empty($itemConfig['conf']) && !empty($itemConfig['conf']['type']))
		{
			$fullKey = $itemConfig['conf']['type'];
			$itemConfigOld = $itemConfig;
			$itemConfig = $melisAppConfig->getItem($itemConfig['conf']['type']);
			if (!empty($itemConfig['datas']))
			{
				$recDatas = array_merge_recursive($recDatas, $itemConfig['datas']);
			}

			if ($itemConfig) {
                $itemConfig['conf'] = array_merge($itemConfig['conf'], $itemConfigOld['conf']);
            }

		}
		

		/**
		 * Second check if rendering is allowed for the user
		 * according to his rights
		 */
		$melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
		$melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
		$xmlRights = $melisCoreAuth->getAuthRights();
		$isAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_INTERFACE, $fullKey);
		$isDisabled = $melisAppConfig->isInterfaceDisabled($key);

		
		
		if (!$isAccessible || $isDisabled)
		{
			$view = new ViewModel();
			$view->setTemplate('melis-core/plugin-view/disabled');
			$view->setVariable('norights', true);
			return $view;
		}

		/**
		 * Reorder children interface depending on MelisModuleConfig
		 * to fit the user's preference
		 */
		if (!empty($itemConfig['interface']))
			$itemConfig['interface'] = $this->orderInterfaceChildren($key, $itemConfig['interface']);
		
		/**
		 *  Creates the view based on the config
		 *  If forward key is found, forward will dispatch to the appropriate module/controller action and view
		 *  Datas will also be included in the forward if provided inside appConfig
		 *  If forward is not present, the default plugin-view template will be used to echo the key and then will
		 *  logicaly continue inside children in the interface section.
		 */
		$view = new ViewModel();
        $melisKeyFollow = isset($itemConfig['conf']['follow_regular_rendering']) ? $itemConfig['conf']['follow_regular_rendering'] : true;

//        echo $fullKey . PHP_EOL;

        if($melisKeyFollow || $isXmlHttpRequest)
        {
            if (!empty($itemConfig['forward']) && !empty($itemConfig['forward']['controller'])
                && !empty($itemConfig['forward']['action']))
            {
                // Preparing dispatch
                $ctrlPath = $itemConfig['forward']['controller'];
                if (!empty($itemConfig['forward']['module']))
                    $ctrlPath = $itemConfig['forward']['module'] . '\\Controller\\' . $ctrlPath;

                // Add the action for dispatch
                $datas = array_merge_recursive($recDatas, array('action' => $itemConfig['forward']['action']));
                // Add the fullKey for data-id rendering

                if (!empty($itemConfig['conf']) && !empty($itemConfig['conf']['melisKey']))
                    $datas['melisKey'] = $itemConfig['conf']['melisKey'];
                else
                    $datas['melisKey'] = $fullKey;

                $datas['zoneconfig'] = $itemConfig;

                // Get the view
                try
                {
                    // maxNestedForwards for generation of interface
                    $config = $this->getServiceLocator()->get('config');
                    $specialConfigZf2 = $config['plugins']['meliscore']['datas']['zf2'];

                    $view = $this->forward()->setMaxNestedForwards($specialConfigZf2['maxNestedForwards'])->dispatch($ctrlPath, $datas);

                }
                catch (\Exception $e)
                {
                    $view = new ViewModel();
                    $view->setTemplate('melis-core/plugin-view/generate');
                    $ctrlPath = $itemConfig['forward']['controller'];
                    if (!empty($itemConfig['forward']['module']))
                        $ctrlPath = $itemConfig['forward']['module'] . '/' . $ctrlPath;;
                    $ctrlPath = $ctrlPath . '/' . $itemConfig['forward']['action'];
                    $view->setVariable('meliscore_error_dispatch',
                        'Error: ' . $ctrlPath . '<br />' . $e->getMessage());
                }
            }
            else
            {
                // Use the default template because no forward item was found in appConfig
                $view->setTemplate('melis-core/plugin-view/generate');
            }
            // Adds the appConfig section to the view for further disposal in the view
            $view->setVariable('zoneconfig', $itemConfig);
            $view->setVariables($recDatas);

            /**
             * Going recursive in interface section of appConfig to generate any
             * subplugin.
             */
            if (!empty($itemConfig['interface']))
            {

                /**
                 * Looping and getting the children in interface section to generate the children views.
                 * Key defined in the appConfig will be used as child view keys
                 */
                foreach ($itemConfig['interface'] as $keyInterface => $valueInterface)
                {
                    $subKey = $fullKey . '/interface/' . $keyInterface;
                    $subView = $this->generateRec($keyInterface, $subKey, $recDatas);

                    if(!empty($subView)) {
                        $norights = $subView->getVariable('norights');
                        if ($norights)
                        {
                            $zoneconfig = $view->getVariable('zoneconfig');
                            unset($zoneconfig['interface'][$keyInterface]);
                            $view->setVariable('zoneconfig', $zoneconfig);
                        }
                        $view->addChild($subView, $keyInterface);
                        $view->setVariable('keyInterface', $keyInterface);
                    }

                }
            }

            $view->setVariable('keyInterface', $key);

            return $view;
        }
        else {
            return null;
        }

	}
	
	/**
	 * This function takes the list of children and reorders them by comparing
	 * the order list available in MelisModuleConfig.
	 * 
	 * @param string $parentKey
	 * @param array $childrenInterface
	 * @return array
	 */
	public function orderInterfaceChildren($parentKey, $childrenInterface)
	{
		$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');		
		$orderInterface = $melisAppConfig->getOrderInterfaceConfig($parentKey);
		
		if (empty($orderInterface))
		{
			// No order defined, items are displayed directly like found in interface config
			// meaning order is made uppon config merge
			return $childrenInterface;
		}
		else
		{
			$resultOrdered = array();
			
			// We first reorder depending on order defined
			foreach ($orderInterface as $orderKey)
			{
				if (is_array($orderKey))
				{
					$resultOrdered = $orderInterface;
					break;
				}
				if (!empty($childrenInterface[$orderKey]))
				{
					$resultOrdered[$orderKey] = $childrenInterface[$orderKey];
					unset($childrenInterface[$orderKey]);
				}
			}
			
			// We add items at the end that are in the config but not present in the custom order
			foreach ($childrenInterface as $keyInterface => $childinterface)
			{
				$resultOrdered[$keyInterface] = $childinterface;
			}
			
			return $resultOrdered;
		}
		
	}
    public function renderViewRecList($zoneView)
    {
        foreach ($zoneView as $zoneViewChild)
        {
            $htmlZoneViewChild = $this->renderViewRec($zoneViewChild);
            $keyInterface = $zoneViewChild->getVariable('keyInterface');
            $zoneView->setVariable($keyInterface, $htmlZoneViewChild);
        }
        $htmlZoneView = array();

        return $htmlZoneView;
    }
	
	/**
	 * Render a view
	 * 
	 * @param ZendView $zoneView
	 * @return string
	 */
	public function renderViewRec($zoneView)
	{
		foreach ($zoneView as $zoneViewChild)
		{
			$htmlZoneViewChild = $this->renderViewRec($zoneViewChild);
			$keyInterface = $zoneViewChild->getVariable('keyInterface');
			$zoneView->setVariable($keyInterface, $htmlZoneViewChild);
		}
		$htmlZoneView = $this->getServiceLocator()
								  ->get('ViewRenderer')
								  ->render($zoneView);
		
		return $htmlZoneView;
	}
	
	/**
	 * Generate a view of the appConfig and returns it
	 * 
	 * @routeParam appconfigpath Path in the appConfig file (ex: /meliscore/interface/meliscore_header)
	 * @routeParam keyview Name of the child view for further rendering
	 * 
	 * @return \Zend\View\Model\ViewModel
	 */
    public function generateAction()
    {	
    	/**
		 * Determine if it comes from an ajax call
		 * so we can send back different datas with the html
    	 */
    	$isXmlHttpRequest = false;
    	if ($this->getRequest()->isXmlHttpRequest()) 
    		$isXmlHttpRequest = true;
    	
    	/**
		 * Get the params from php call
    	 */
    	$appconfigpath = $this->params()->fromRoute('appconfigpath', '/');
    	$keyView = $this->params()->fromRoute('keyview', 'melis');

    	/**
    	 * Else get the params from GET if ajax
    	 */
    	$datasParameters = array();
    	if ($isXmlHttpRequest)
    	{
    		$appconfigpath = $this->getRequest()->getQuery('cpath');
    		$lastKey = explode('/', $appconfigpath);
    		$keyView = $lastKey[count($lastKey) - 1];
    	}

    	/**
		 * Get the appConfig
    	 */
		$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');

		/**
		 * Get the real path, from the MelisKey, if needed
		 */
		$melisKeys = $melisAppConfig->getMelisKeys();
		
		if (!empty($melisKeys[$appconfigpath]))
			$appconfigpath = $melisKeys[$appconfigpath];
		
		$appsConfig = $melisAppConfig->getItem($appconfigpath);

		if ($isXmlHttpRequest && !empty($appsConfig['interface']))
			$appsConfig['interface'] = $this->orderInterfaceChildren($keyView, $appsConfig['interface']);
		
		list($jsCallBacks, $datasCallback) = $melisAppConfig->getJsCallbacksDatas($appsConfig);
		
		
		/**
		 * Generate the views recursively
		 * and add the corresponding appConfig part to make it accessible in the view
		 */
		$zoneView = $this->generateRec($keyView, $appconfigpath, $datasParameters);
		$zoneView->setVariable('zoneconfig', $appsConfig);
		$zoneView->setVariable('parameters', $datasParameters);
		$zoneView->setVariable('keyInterface', $keyView);

		/**
		 * Add JS calls and datas found in config, 
		 * so that it will be added in head when generating
		 */
		$zoneView->setVariable('jsCallBacks', $jsCallBacks);
		$zoneView->setVariable('datasCallback', $datasCallback);
		
		/**
		 * If ajax, return json
		 * else, return the normal view
		 */
		if ($isXmlHttpRequest)
		{
			$htmlZoneView = $this->renderViewRec($zoneView);
			
			$jsonModel = new JsonModel();
			$jsonModel->setVariables(array(
					'html' => $htmlZoneView,
					'jsCallbacks' => $jsCallBacks,
					'jsDatas' => $datasCallback
			));
			
			return $jsonModel; 
		}
		else 
		{
			/**
			 * Return view
			 */
			return $zoneView;
		}
    }

}
