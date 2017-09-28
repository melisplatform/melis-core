<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Json\Json;

class MelisCoreRightsService implements MelisCoreRightsServiceInterface, ServiceLocatorAwareInterface
{
	public $serviceLocator;
	
	const MELISCORE_PREFIX_INTERFACE = 'meliscore_interface';
	const MELISCORE_PREFIX_TOOLS = 'meliscore_tools';
	
	public function setServiceLocator(ServiceLocatorInterface $sl)
	{
		$this->serviceLocator = $sl;
		return $this;
	}
	
	public function getServiceLocator()
	{
		return $this->serviceLocator;
	}

	
	public function isAccessible($xmlRights, $sectionId, $itemId)
	{
		$rightsObj = simplexml_load_string($xmlRights);
		if (empty($rightsObj))
			return true;
		
		// Interface case is opposite, we list items where the user is not allowed
		if ($sectionId == self::MELISCORE_PREFIX_INTERFACE)
		{
			foreach ($rightsObj->$sectionId->id as $interfaceId)
			{
				if ((string)$interfaceId == $itemId || (string)$interfaceId == self::MELISCORE_PREFIX_INTERFACE . '_root')
					return false;
			}
			
			return true;
		}
		
		// Tools
		if ($sectionId == self::MELISCORE_PREFIX_TOOLS)
		{
			foreach ($rightsObj->$sectionId->id as $toolId)
			{
				if ((string)$toolId == $itemId || (string)$toolId == self::MELISCORE_PREFIX_TOOLS . '_root')
					return true;
			}
			
			// If it reaches here, it means tools are not directly checked, but maybe some sections are
			$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
			$melisKeys = $melisAppConfig->getMelisKeys();
			$appconfigpath = $melisKeys['meliscore_toolstree'];
			$appsConfig = $melisAppConfig->getItem($appconfigpath);
				
			foreach ($appsConfig['interface'] as $keySection => $section)
			{
				foreach ($section['interface'] as $keyTool => $tool)
				{
					if ($keyTool == $itemId) 
					{
						
						// We found the item's section, now let's check the rights to maybe find the section
						foreach ($rightsObj->$sectionId->id as $toolId)
						{
							if ((string)$toolId == $keySection)
								return true;
						}
						return false;
					}
				}
			}
		}
		
		return false;
	}
	
	private function getInterfaceKeysRecursive($keyInterface, $userXml)
	{
		$melisCoreUser = $this->getServiceLocator()->get('MelisCoreUser');
		$melisAppConfig =$this->getServiceLocator()->get('MelisCoreConfig');
		$configInterface = $melisAppConfig->getItem($keyInterface);	
		
		if (!empty($configInterface['conf']) && !empty($configInterface['conf']['type']))
		{
			$fullKey = $configInterface['conf']['type'];
			$configInterfaceOld = $configInterface;
			$configInterface = $melisAppConfig->getItem($configInterface['conf']['type']);
			if (!empty($configInterface['datas']))
			{
				$recDatas = array_merge_recursive($recDatas, $configInterface['datas']);
			}
			$configInterface['conf'] = array_merge($configInterface['conf'], $configInterfaceOld['conf']);
			$keyInterface = $fullKey;
		}


		
		if (isset($configInterface['conf']['rightsDisplay']))
		{
			$isReference = false;
			if (!empty($configInterface['conf']['type']))
				$isReference = true;
			
			switch ($configInterface['conf']['rightsDisplay'])
			{
				case 'source' 			:   if ($isReference)
												return null;
											break;
				case 'referencesonly' 	: 	if (!$isReference)
												return null;
											break;
				case 'none' 			: 	return null;
											break;;
				case 'all' 				: 
				default					:
											break;
			}
		}
		
		$selectedInterface = $melisCoreUser->isItemRightChecked($userXml, self::MELISCORE_PREFIX_INTERFACE, $keyInterface);
		$keyPrefixed = self::MELISCORE_PREFIX_INTERFACE . '_' . $keyInterface;
		
		$name = '';
		if (!empty($configInterface['conf']['name']))
			$name = $configInterface['conf']['name'];
		else
		{
			$tabName = explode('/', $keyInterface);
			$name = $tabName[count($tabName) - 1];
		}
		
		$showCheckbox = true;
		if (!empty($configInterface['conf']['rights_checkbox_disable']))
		    $showCheckbox = false;
		
		$item = array(
			'key' => $keyPrefixed,
			'title' => $name,
			'lazy' => false,
			'selected' => $selectedInterface,
			'iconTab' => '',
		    'checkbox' => $showCheckbox,
			'melisData' => array(
				'colorSelected' => '#CB4040',
			),
		    'children' => array(),
		);
		
		
		if (!empty($configInterface['interface']))
		{
			foreach ($configInterface['interface'] as $keyChildConfig => $valueChildConfig)
			{
				$child = $this->getInterfaceKeysRecursive($keyInterface . '/interface/' . $keyChildConfig, $userXml);
				if ($child)
					$item['children'][] = $child;
			} 
		}
		
		return $item;
	}
	
	private function getToolsKeys($userXml)
	{
		$melisCoreUser = $this->getServiceLocator()->get('MelisCoreUser');
		$melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
    	$melisKeys = $melisAppConfig->getMelisKeys();
		$appconfigpath = $melisKeys['meliscore_toolstree'];
		$appsConfig = $melisAppConfig->getItem($appconfigpath);
		$orderInterface = $melisAppConfig->getOrderInterfaceConfig('meliscore_toolstree');
		$tools = array();
		
		foreach($appsConfig['interface'] as $key => $toolSection)
		{
			$selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELISCORE_PREFIX_TOOLS, $key);
			$keyPrefixed = self::MELISCORE_PREFIX_TOOLS . '_' . $key;
			
			// First level, sections
			$tools[$key] = array(
									'key' => $keyPrefixed, 
									'title' => (!empty($toolSection['conf']['name']))?$toolSection['conf']['name']:$key, 
									'children' => array(),
									'lazy' => false,
									'selected' => $selectedTools,
									'iconTab' => '',
									'melisData' => array(
										'colorSelected' => '#99C975',
									),
			);
			
			// Second level, tools
			foreach($toolSection['interface'] as $keyTool => $toolName)
			{
				$selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELISCORE_PREFIX_TOOLS, $keyTool);
				$keyPrefixed = self::MELISCORE_PREFIX_TOOLS . '_' . $keyTool;
				
				$tools[$key]['children'][$keyTool] = array(
						'key' => $keyPrefixed,
						'title' => (!empty($toolName['conf']['name']))?$toolName['conf']['name']:$key,
						'children' => array(),
						'lazy' => false,
						'selected' => $selectedTools,
						'iconTab' => '',
						'melisData' => array(
								'colorSelected' => '#99C975',
						),
				);
			}
		}
		
		// Reordering sections
		$sections = $tools;
		$toolsOrdered = array();
		foreach ($orderInterface as $orderKeySection => $sectionTools)
		{
			if (!empty($sections[$orderKeySection]))
			{
				if (empty($toolsOrdered[$orderKeySection]))
					$toolsOrdered[$orderKeySection] = array();
				$toolsOrdered[$orderKeySection] = $tools[$orderKeySection];
                // commented because the child nodes of some business apps doesn't show
				//unset($toolsOrdered[$orderKeySection]['children']);
				//unset($sections[$orderKeySection]);
			}
		}
		foreach ($sections as $keyInterfaceSection => $childinterface)
		{
			if (empty($toolsOrdered[$keyInterfaceSection]))
				$toolsOrdered[$keyInterfaceSection] = array();
			$toolsOrdered[$keyInterfaceSection] = $tools[$keyInterfaceSection];
            // commented because the child nodes of some business apps doesn't show
			//unset($toolsOrdered[$keyInterfaceSection]['children']);
		}
		 
		// Reordering tools inside sections
		if ($toolsOrdered)
		{
			foreach ($toolsOrdered as $keySection => $toolsSection)
			{
				$sectionOrderInterface = array();
				if (!empty($orderInterface[$keySection]))
					$sectionOrderInterface = $orderInterface[$keySection];
				$toolsSectionOrdered = array();
			
				if (!empty($sectionOrderInterface))
				{
					foreach ($sectionOrderInterface as $orderKey)
					{
						if (!empty($tools[$keySection]['children'][$orderKey]))
						{
							$toolsOrdered[$keySection]['children'][$orderKey] = $tools[$keySection]['children'][$orderKey];
                            // commented because the child nodes of some business apps doesn't show
							//unset($tools[$keySection]['children'][$orderKey]);
						}
					}
				
					foreach ($tools[$keySection]['children'] as $keyInterface => $childinterface)
					{
						$toolsOrdered[$keySection]['children'][$keyInterface] = $childinterface;
					}
				}
			}
		}
		
		$finalToolsOrdered = array();
		foreach ($toolsOrdered as $key => $sectionTool)
		{
			$toolsTmp = array();
			if (!empty($sectionTool['children']))
				$toolsTmp = $sectionTool['children'];
			$newTools = array();
			
			foreach ($toolsTmp as $keyTool => $tool)
			{
				$newTools[] = $tool;
			}

			$sectionTool['children'] = $newTools;
			$finalToolsOrdered[] = $sectionTool;
		}
		
		return $finalToolsOrdered;
	}
	
	
	
	public function getRightsValues($id, $isRole = false)
	{
		$translator = $this->serviceLocator->get('translator');
		$melisCoreUser = $this->getServiceLocator()->get('MelisCoreUser');
		if (!$isRole)
		{
			
			$xml = $melisCoreUser->getUserXmlRights($id);
		}
		else
		{
			$xml = '';
			$tableUserRole = $this->serviceLocator->get('MelisCoreTableUserRole');
			$datasRole = $tableUserRole->getEntryById($id);
			if ($datasRole)
			{
				$datasRole = $datasRole->current();
				if (!empty($datasRole))
					$xml = $datasRole->urole_rights;
			}
		}
		
		$selectedRootInterface = $melisCoreUser->isItemRightChecked($xml, self::MELISCORE_PREFIX_INTERFACE, self::MELISCORE_PREFIX_INTERFACE . '_root');
		$selectedRootTools = $melisCoreUser->isItemRightChecked($xml, self::MELISCORE_PREFIX_TOOLS, self::MELISCORE_PREFIX_TOOLS . '_root');
		
		$rightsItems = array(
			array(
				'key' => self::MELISCORE_PREFIX_INTERFACE . '_root',
				'title' => $translator->translate('tr_meliscore_rights_Interface exclusion'),
				'lazy' => false,
				'selected' => $selectedRootInterface,
				'iconTab' => '',
				'melisData' => array(
					'colorSelected' => '#CB4040',
				),
			),
			array(
				'key' => self::MELISCORE_PREFIX_TOOLS . '_root',
				'title' => $translator->translate('tr_meliscore_rights_Tools'),
				'lazy' => false,
				'selected' => $selectedRootTools,
				'iconTab' => '',
				'melisData' => array(
					'colorSelected' => '#99C975',
				),
			),
		);
		
		// interface rights
		$interfaceItems = array();
		$config = $this->getServiceLocator()->get('config');
		foreach ($config['plugins'] as $pluginName => $plugin)
		{
			$child = $this->getInterfaceKeysRecursive('/' . $pluginName, $xml);
			if ($child)
				$interfaceItems[] = $child;
		}
		$rightsItems[0]['children'] = $interfaceItems;
		
		
		// tools rights
		$toolsItems = $this->getToolsKeys($xml);
		$rightsItems[1]['children'] = $toolsItems;

		// Return values
		return $rightsItems; 
	}
	
	public function createXmlRightsValues($id, $datas, $isRole = false)
	{
		/**
		 * Core rights make no difference between user or userrole because
		 * all nodes are shown, so we just need to check what was posted.
		 * There's no lazy tree, so no need to compare whatever in the user or role xml
		 * already existing.
		 */
		
		$nodesSeen = Json::decode($datas['treeStatus']);
		$nodesSeen = $nodesSeen->treeStatus;
		$nodesInterface = Json::decode($datas[self::MELISCORE_PREFIX_INTERFACE . '_root']);
		$nodesTools = Json::decode($datas[self::MELISCORE_PREFIX_TOOLS . '_root']);
		
		// Creating interface xml
		$interfaceNode  = self::MELISCORE_PREFIX_INTERFACE . '_root';
		$xmlRights = '<' . self::MELISCORE_PREFIX_INTERFACE . '>' . self::XML_ENDLINE;
		if (!empty($nodesInterface) && !empty($nodesInterface->$interfaceNode))
		{
			foreach ($nodesInterface->$interfaceNode as $idInterface)
			{
				if ($idInterface != $interfaceNode)
					$idUnPrefixed = str_replace(self::MELISCORE_PREFIX_INTERFACE . '_', '', $idInterface);
				else
					$idUnPrefixed = $idInterface;
				$xmlRights .= self::XML_SPACER . '<id>' . $idUnPrefixed . '</id>' . self::XML_ENDLINE;
			}
		}
		$xmlRights .= '</' . self::MELISCORE_PREFIX_INTERFACE . '>' . self::XML_ENDLINE;

		// Creating tools xml
		$toolsNode  = self::MELISCORE_PREFIX_TOOLS . '_root';
		$xmlRights .= '<' . self::MELISCORE_PREFIX_TOOLS . '>' . self::XML_ENDLINE;
		if (!empty($nodesTools) && !empty($nodesTools->$toolsNode))
		{
			foreach ($nodesTools->$toolsNode as $idTool)
			{
				if ($idTool != $toolsNode)
					$idUnPrefixed = str_replace(self::MELISCORE_PREFIX_TOOLS . '_', '', $idTool);
				else
					$idUnPrefixed = $idTool;
				$xmlRights .= self::XML_SPACER . '<id>' . $idUnPrefixed . '</id>' . self::XML_ENDLINE;
			}
		}
		$xmlRights .= '</' . self::MELISCORE_PREFIX_TOOLS . '>' . self::XML_ENDLINE;
		
		return array('meliscore_rights' => $xmlRights);
	}
}