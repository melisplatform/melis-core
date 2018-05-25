<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Json\Json;

class MelisCoreRightsService implements MelisCoreRightsServiceInterface, ServiceLocatorAwareInterface
{
    public $serviceLocator;
    private $tools = [];

    const MELISCORE_PREFIX_INTERFACE    = 'meliscore_interface';
    const MELIS_PLATFORM_TOOLS_PREFIX   = 'meliscore_leftmenu';
    const MELISCORE_PREFIX_TOOLS        = 'meliscore_toolstree_section';
    const MELISCMS_PREFIX_TOOLS         = 'meliscms_toolstree_section';
    const MELISMARKETING_PREFIX_TOOLS   = 'melismarketing_toolstree_section';
    const MELISCOMMERCE_PREFIX_TOOLS    = 'meliscommerce_toolstree_section';
    const MELISOTHERS_PREFIX_TOOLS      = 'melisothers_toolstree_section';
    const MELISCUSTOM_PREFIX_TOOLS      = 'meliscustom_toolstree_section';

    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }

    /**
     * @return ServiceLocatorInterface
     */
    public function getServiceLocator(): ServiceLocatorInterface
    {
        return $this->serviceLocator;
    }


    /**
     * Extends the functionality of $this->isAccessible method
     * but can only be used on tools
     * @param $key
     * @return bool
     */
    public function canAccessTool($key): bool
    {
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $xmlRights     = $melisCoreAuth->getAuthRights();
        $isAccessible  = $this->isAccessible($xmlRights, self::MELIS_PLATFORM_TOOLS_PREFIX, $key);

        return $isAccessible;
    }

    /**
     * Checks if the user can access a specific function
     * @param $xmlRights
     * @param $sectionId
     * @param $itemId
     * @return bool
     */
    public function isAccessible($xmlRights, $sectionId, $itemId): bool
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
        if ($sectionId == self::MELIS_PLATFORM_TOOLS_PREFIX)
        {
            foreach ($rightsObj->$sectionId->id as $toolId)
            {
                if ((string)$toolId == $itemId || (string)$toolId == self::MELIS_PLATFORM_TOOLS_PREFIX . '_root')
                    return true;

                switch ($toolId) {
                    case self::MELISCORE_PREFIX_TOOLS:
                        return true;
                        break;
                    case self::MELISCMS_PREFIX_TOOLS:
                        return true;
                        break;
                    case self::MELISMARKETING_PREFIX_TOOLS:
                        return true;
                        break;
                    case self::MELISCOMMERCE_PREFIX_TOOLS:
                        return true;
                        break;
                    case self::MELISOTHERS_PREFIX_TOOLS:
                        return true;
                        break;
                    case self::MELISCUSTOM_PREFIX_TOOLS:
                        return true;
                        break;
                }
            }

            // If it reaches here, it means tools are not directly checked, but maybe some sections are
            $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
            $melisKeys = $melisAppConfig->getMelisKeys();
            $appconfigpath = $melisKeys[self::MELIS_PLATFORM_TOOLS_PREFIX];
            $appsConfig = $melisAppConfig->getItem($appconfigpath);

            foreach ($appsConfig['interface'] as $keySection => $section)
            {
                if (isset($section['interface'])) {
                    foreach ($section['interface'] as $keyTool => $tool) {
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
        }

        return false;
    }

    private function getInterfaceKeysRecursive($keyInterface, $userXml)
    {
        $melisCoreUser = $this->getServiceLocator()->get('MelisCoreUser');
        $melisAppConfig =$this->getServiceLocator()->get('MelisCoreConfig');
        $configInterface = $melisAppConfig->getItem($keyInterface);

        if (!empty($configInterface['conf']) && !empty($configInterface['conf']['type'])) {
            $fullKey = $configInterface['conf']['type'];
            $configInterfaceOld = $configInterface;
            $configInterface = $melisAppConfig->getItem($configInterface['conf']['type']);
            if (!empty($configInterface['datas'])) {
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
        $melisCoreUser  = $this->getServiceLocator()->get('MelisCoreUser');
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $melisKeys      = $melisAppConfig->getMelisKeys();

        $appConfigPaths = [
            self::MELISCORE_PREFIX_TOOLS,
            self::MELISCMS_PREFIX_TOOLS,
            self::MELISMARKETING_PREFIX_TOOLS,
            self::MELISCOMMERCE_PREFIX_TOOLS,
            self::MELISOTHERS_PREFIX_TOOLS,
            self::MELISCUSTOM_PREFIX_TOOLS,
        ];

        $tools = [];

        foreach ($appConfigPaths as $idx => $path) {
            $appConfigPath  = $melisKeys[$path];
            $appsConfig     = $melisAppConfig->getItem($appConfigPath);
            $orderInterface = $melisAppConfig->getOrderInterfaceConfig($path);
            $selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELIS_PLATFORM_TOOLS_PREFIX, $path);


            // tool category
            $tools[$idx] = array(
                'key' => $path,
                'title' => $appsConfig['conf']['name'] ?? $path,
                'lazy' => false,
                'children' => array(),
                'selected' => $selectedTools,
                'iconTab' => '',
                'melisData' => array(
                    'colorSelected' => '#99C975',
                ),
            );

            // first level, sections
            $appCtr = 0;
            foreach ($appsConfig['interface'] as $appKey => $appSection) {

                $selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELIS_PLATFORM_TOOLS_PREFIX, $appKey);
                $tools[$idx]['children'][$appCtr] = array(
                    'key' => $appKey,
                    'title' => $appSection['conf']['name'] ?? $appKey,
                    'lazy' => false,
                    'children' => array(),
                    'selected' => $selectedTools,
                    'iconTab' => '',
                    'melisData' => array(
                        'colorSelected' => '#99C975',
                    ),
                );

                // Second level, tools
                $appToolCtr = 0;
                foreach($appSection['interface'] as $toolKey => $toolName)
                {
                    $selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELIS_PLATFORM_TOOLS_PREFIX, $toolKey);
                    $icon = $toolName['conf']['icon'] ?? null;

                    if ($icon) {
                        $tools[$idx]['children'][$appCtr]['children'][$appToolCtr] = array(
                            'key' => $toolKey,
                            'title' => $toolName['conf']['name'] ?? $toolKey,
                            'children' => array(),
                            'lazy' => false,
                            'selected' => $selectedTools,
                            'iconTab' => '',
                            'melisData' => array(
                                'colorSelected' => '#99C975',
                            ),
                        );
                    }
                    $appToolCtr++;
                }
                $appCtr++;
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
        $selectedRootTools = $melisCoreUser->isItemRightChecked($xml, self::MELIS_PLATFORM_TOOLS_PREFIX, self::MELIS_PLATFORM_TOOLS_PREFIX . '_root');

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
                'key' => self::MELIS_PLATFORM_TOOLS_PREFIX . '_root',
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

    /**
     * Generates an XML rights
     * @param $id
     * @param $datas
     * @param bool $isRole
     * @return array
     */
    public function createXmlRightsValues($id, $datas, $isRole = false): array
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
        $nodesTools = Json::decode($datas[self::MELIS_PLATFORM_TOOLS_PREFIX . '_root']);

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
        $toolsNode  = self::MELIS_PLATFORM_TOOLS_PREFIX . '_root';
        $xmlRights .= '<' . self::MELIS_PLATFORM_TOOLS_PREFIX . '>' . self::XML_ENDLINE;
        if (!empty($nodesTools) && !empty($nodesTools->$toolsNode))
        {
            foreach ($nodesTools->$toolsNode as $idTool)
            {
                if ($idTool != $toolsNode)
                    $idUnPrefixed = str_replace(self::MELIS_PLATFORM_TOOLS_PREFIX . '_', '', $idTool);
                else
                    $idUnPrefixed = $idTool;
                $xmlRights .= self::XML_SPACER . '<id>' . $idUnPrefixed . '</id>' . self::XML_ENDLINE;
            }
        }
        $xmlRights .= '</' . self::MELIS_PLATFORM_TOOLS_PREFIX . '>' . self::XML_ENDLINE;

        return array('meliscore_rights' => $xmlRights);
    }
}