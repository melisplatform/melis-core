<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;
use MelisCore\Service\MelisCoreRightsService;
use MelisCore\Service\MelisCoreConfigService;
/**
 * This class renders Melis CMS
 */
class TreeToolsController extends AbstractActionController
{
    const CORE      = 'meliscore';
    const CMS       = 'meliscms';
    const MARKETING = 'melismarketing';
    const COMMERCE  = 'meliscommerce';
    const OTHERS    = 'melisothers';
    const CUSTOM    = 'meliscustom';

    public function testAction()
    {
        /** @var \MelisCore\Service\MelisCoreRightsService $melisCoreRights */
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        d($melisCoreRights->canAccess('melis_market_place_business_app_menu'));
        d($melisCoreRights->canAccess('meliscore_tool_system_config'));
        d($melisCoreRights->canAccess('meliscore_dashboard_recent_activity'));
//        $canAccess = $melisCoreRights->canAccess('/meliscore');
//        $canAccess = $melisCoreRights->canAccess('meliscore_tool_system_config');
        dd("done");
    }

	/**
	 * Renders the leftmenu accordion/tree of tools
	 * @return ViewModel
	 */
    public function renderTreeToolsAction(): ViewModel
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');

    	$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
    	$melisKeys = $melisAppConfig->getMelisKeys();

    	// Get the order list for ordering tools
    	$appconfigpath = $melisKeys[$melisKey];

    	$appsConfig = $melisAppConfig->getItem($appconfigpath);
		$orderInterface = $melisAppConfig->getOrderInterfaceConfig($melisKey);
    	$tools = array();

    	// Gets the rights of the user
    	$melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
    	$melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
    	$xmlRights = $melisCoreAuth->getAuthRights();

    	// Merge config if melisKey is "Others"
        if ($melisKey == 'melisothers_toolstree_section') {
            $appsConfig['interface'] = array_merge($appsConfig['interface'], $this->moveToolsToOthersCategory());
        }

    	// Show sections first
    	foreach($appsConfig['interface'] as $key => $toolSectionName)
    	{
            $isNavChild   = false;

    		// First level, sections
    		$tools[$key] = array(
    			'toolsection_id' => $toolSectionName['conf']['id'] ?? $key,
    			'toolsection_name' => $toolSectionName['conf']['name'] ?? $key,
    			'toolsection_meliskey' => $toolSectionName['conf']['melisKey'] ?? $key,
    			'toolsection_icon' => $toolSectionName['conf']['icon'] ?? 'fa-cube',
                'toolsection_forward' => $toolSectionName['forward'] ?? [],
                'toolsection_children' => array(),
    		);
    		
    		// Second level, tools
    		foreach($toolSectionName['interface'] as $keyTool => $toolName)
    		{

    		    $icon = (!empty($toolName['conf']['icon'])) ? $toolName['conf']['icon'] : 'fa-cube';

    		    if ($icon) {
    		       $isNavChild = true;
                }


    			$isAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELIS_PLATFORM_TOOLS_PREFIX, $keyTool);
    		    $isInterfaceAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_INTERFACE, $keyTool);

    			if ($isAccessible && $isInterfaceAccessible)
    				$tools[$key]['toolsection_children'][$keyTool] = array('tool_id' => $toolName['conf']['id'] ?? $keyTool,
    																	   'tool_name' => $toolName['conf']['name'] ?? "<strike>$keyTool</strike>",
    																	   'tool_icon' => $icon,
    																	   'tool_forward' => isset($toolName['forward']) ? $toolName['forward'] : [],
    																	   'tool_melisKey' => $toolName['conf']['melisKey'] ?? $keyTool);
    			 
    		}

    		$tools[$key]['toolsection_has_nav_chid'] = $isNavChild;
    	}
    	
    	$sections = $tools;
    	
    	// Reordering sections
    	$toolsOrdered = array();
    	foreach ($orderInterface as $orderKeySection => $sectionTools)
    	{
    		if (!empty($sections[$orderKeySection]))
    		{
    			if (empty($toolsOrdered[$orderKeySection]))
    				$toolsOrdered[$orderKeySection] = array();
    			$toolsOrdered[$orderKeySection] = $tools[$orderKeySection];
    			unset($toolsOrdered[$orderKeySection]['toolsection_children']);
    			unset($sections[$orderKeySection]);
    		}
    	}
    	foreach ($sections as $keyInterfaceSection => $childinterface)
    	{
    		if (empty($toolsOrdered[$keyInterfaceSection]))
    			$toolsOrdered[$keyInterfaceSection] = array();
    		$toolsOrdered[$keyInterfaceSection] = $tools[$keyInterfaceSection];
    		unset($toolsOrdered[$keyInterfaceSection]['toolsection_children']);
    	}

    	// Reordering tools inside sections
    	foreach ($toolsOrdered as $keySection => $toolsSection)
    	{
    		$sectionOrderInterface = array();
    		if (!empty($orderInterface[$keySection]))
    			$sectionOrderInterface = $orderInterface[$keySection];
    		$toolsSectionOrdered = array();

    		foreach ($sectionOrderInterface as $orderKey)
    		{
    			if (!empty($tools[$keySection]['toolsection_children'][$orderKey]))
    			{
    				$toolsOrdered[$keySection]['toolsection_children'][$orderKey] = $tools[$keySection]['toolsection_children'][$orderKey];
    				unset($tools[$keySection]['toolsection_children'][$orderKey]);
    			}
    		}

    		foreach ($tools[$keySection]['toolsection_children'] as $keyInterface => $childinterface)
    		{
    			$toolsOrdered[$keySection]['toolsection_children'][$keyInterface] = $childinterface;
    		}
    	}
    	
    	$view = new ViewModel();
    	$view->tools = $toolsOrdered;
     	$view->melisKey = $melisKey;
    	 
     	return $view;
    }

    /**
     * Retrieves all configuration under left menu configuration
     * with an exception to those allowable left menu configurations
     *
     * @return array
     */
    private function moveToolsToOthersCategory(): array
    {
        $leftMenu = $this->getConfig()->getItem('meliscore/interface/meliscore_leftmenu/interface');
        $mergeToOthers = [];

        foreach ($leftMenu as $melisKey => $item) {
            if (!in_array($melisKey, $this->getAllowedLeftMenuConfig())) {
                $mergeToOthers[$melisKey] = $item;
            }
        }

        return $mergeToOthers;
    }

    /**
     * Returns the melisKeys of the allowed left menu configuration
     * @return array
     */
    private function getAllowedLeftMenuConfig(): array
    {
        return [
            'meliscore_leftmenu_identity',
            'meliscore_leftmenu_dashboard',
            'meliscore_toolstree_section',
            'meliscms_sitetree',
            'meliscms_toolstree_section',
            'melismarketing_toolstree_section',
            'meliscommerce_toolstree_section',
            'melisothers_toolstree_section',
            'meliscustom_toolstree_section',
            'meliscore_footer'
        ];
    }

    /**
     * @return ViewModel
     */
    public function renderFirstTreeToolsAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        /** @var \MelisCore\Service\MelisCoreConfigService $melisAppConfig */
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');

        $melisKeys = $melisAppConfig->getMelisKeys();

        // Get the order list for ordering tools
        $appconfigpath = $melisKeys['meliscore_toolstree'];
        $appsConfig = $melisAppConfig->getItem($appconfigpath);
        $orderInterface = $melisAppConfig->getOrderInterfaceConfig('meliscore_toolstree');
        $tools = array();

        $sections = $tools;

        // Reordering tools inside sections
        foreach ($toolsOrdered as $keySection => $toolsSection)
        {
            $sectionOrderInterface = array();
            if (!empty($orderInterface[$keySection]))
                $sectionOrderInterface = $orderInterface[$keySection];
            $toolsSectionOrdered = array();


            foreach ($tools[$keySection]['toolsection_children'] as $keyInterface => $childinterface)
            {
                $toolsOrdered[$keySection]['toolsection_children'][$keyInterface] = $childinterface;
            }
        }

        $view = new ViewModel();
        $view->tools = $toolsOrdered;
        $view->melisKey = $melisKey;

        return $view;
    }


    /**
     * @return MelisCoreConfigService
     */
    private function getConfig(): MelisCoreConfigService
    {
        return $this->getServiceLocator()->get('MelisCoreConfig');
    }

}
