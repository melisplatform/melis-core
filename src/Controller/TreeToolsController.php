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
class TreeToolsController extends AbstractActionController
{
    const CORE             = 'core';
    const CMS              = 'cms';
    const MARKETING        = 'marketing';
    const COMMERCE         = 'commerce';
    const OTHERS           = 'others';
    const BUSINESS_APPS    = 'business_apps';
    private $tools         = [];
    private $loadedTools   = [];
    private $businessTools = [];

	/**
	 * Renders the leftmenu accordion/tree of tools 
	 * @return \Zend\View\Model\ViewModel
	 */
    public function renderTreeToolsAction()
    {
    	$melisKey = $this->params()->fromRoute('melisKey', '');
    	$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
    	$melisKeys = $melisAppConfig->getMelisKeys();

    	// Get the order list for ordering tools
    	$appconfigpath = $melisKeys['meliscore_toolstree'];
    	$appsConfig = $melisAppConfig->getItem($appconfigpath);	
		$orderInterface = $melisAppConfig->getOrderInterfaceConfig('meliscore_toolstree');
    	$tools = array();
    	
    	// Gets the rights of the user
    	$melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
    	$melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
    	$xmlRights = $melisCoreAuth->getAuthRights();
        
    	// Show sections first
    	foreach($appsConfig['interface'] as $key => $toolSectionName)
    	{
    		// First level, sections
    		$tools[$key] = array(
    			'toolsection_id' => $toolSectionName['conf']['id'],
    			'toolsection_name' => $toolSectionName['conf']['name'],
    			'toolsection_icon' => (!empty($toolSectionName['conf']['icon'])?($toolSectionName['conf']['icon']):('')),
    			'toolsection_children' => array(),
    		);
    		
    		// Second level, tools
    		foreach($toolSectionName['interface'] as $keyTool => $toolName)
    		{
    			$isAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_TOOLS, $keyTool);
    			if ($isAccessible)
    				$tools[$key]['toolsection_children'][$keyTool] = array('tool_id' => $toolName['conf']['id'], 
    																	   'tool_name' => $toolName['conf']['name'], 
    																	   'tool_icon' => (!empty($toolName['conf']['icon'])?($toolName['conf']['icon']):('')), 
    																	   'tool_melisKey' => $toolName['conf']['melisKey']);
    			 
    		}
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
    public function renderFirstTreeToolsAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
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
     * http://winland-tower.local/melis/MelisCore/TreeTools/categorized
     * melisHelper.zoneReload('id_meliscore_leftmenu', 'meliscore_leftmenu');
     */
    public function categorizedAction()
    {
        print_r($this->getOrderedToolsTree());
//        $this->getOrderedToolsTree();
//        print_r($this->loadedTools);

        die;
    }

    public function getOrderedToolsTree()
    {
        $path            = 'meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree/interface';
        $toolsTreeConfig = $this->getServiceLocator()->get('MelisCoreConfig')->getItem($path);
        $toolsTree       = array_merge($this->getToolsTreeConfigByCategory($toolsTreeConfig), $this->getBusinessAppToolsTree($toolsTreeConfig));

        return $toolsTree;
    }

    protected function getToolsTreeConfigByCategory($items)
    {
        foreach ($items as $key => $item) {
            if(is_array($item)) {
                if (isset($item['conf']['category'])) {
                    switch ($item['conf']['category']) {
                        case self::CORE:
                            if (!in_array($key, $this->loadedTools)) {
                                $this->tools[self::CORE][$key] = $item;
                            }
                            break;
                        case self::CMS:
                            if (!in_array($key, $this->loadedTools)) {
                                $this->tools[self::CMS][$key] = $item;
                            }
                            break;
                        case self::MARKETING:
                            if (!in_array($key, $this->loadedTools)) {
                                $this->tools[self::MARKETING][$key] = $item;
                            }
                            break;
                        case self::COMMERCE:
                            if (!in_array($key, $this->loadedTools)) {
                                $this->tools[self::COMMERCE][$key] = $item;
                            }
                            break;
                        case self::OTHERS:
                            if (!in_array($key, $this->loadedTools)) {
                                $this->tools[self::OTHERS][$key] = $item;
                            }
                            break;
                    }

                    if (isset($item['interface'])) {
                        foreach($item as $childKey => $childItem) {
                            $this->getToolsTreeConfigByCategory($childItem);
                        }
                    }

                    $this->loadedTools[$key] = $key;

                } else {
                    $this->getToolsTreeConfigByCategory($item);
                }


            }
        }

        return $this->tools;
    }

    protected function getBusinessAppToolsTree($items)
    {
        if (is_array($items)) {

            foreach ($items as $key => $item) {
                if(!in_array($key, $this->loadedTools)) {
                    $this->loadedTools[$key] = $key;
                    $this->businessTools[self::BUSINESS_APPS][$key] = $item;

                    if (isset($item['interface'])) {
                        foreach($item as $childKey => $childItem) {
                            $this->getToolsTreeConfigByCategory($childItem);
                        }
                    }

                    $this->getBusinessAppToolsTree($item);
                }
            }
        }


        return $this->businessTools;
    }
}
