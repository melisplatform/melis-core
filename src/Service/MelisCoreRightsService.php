<?php

namespace MelisCore\Service;

use Zend\Json\Json;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

class MelisCoreRightsService implements MelisCoreRightsServiceInterface, ServiceLocatorAwareInterface
{
    const MELISCORE_PREFIX_INTERFACE = 'meliscore_interface';
    const MELIS_PLATFORM_TOOLS_PREFIX = 'meliscore_leftmenu';
    const MELISCORE_PREFIX_TOOLS = 'meliscore_toolstree_section';
    const MELISCMS_PREFIX_TOOLS = 'meliscms_toolstree_section';
    const MELISMARKETING_PREFIX_TOOLS = 'melismarketing_toolstree_section';
    const MELISCOMMERCE_PREFIX_TOOLS = 'meliscommerce_toolstree_section';
    const MELISOTHERS_PREFIX_TOOLS = 'melisothers_toolstree_section';
    const MELISCUSTOM_PREFIX_TOOLS = 'meliscustom_toolstree_section';
    const MELISMARKETPLACE_PREFIX_TOOLS = 'melismarketplace_toolstree_section';
    const MELIS_DASHBOARD = '/meliscore_dashboard';
    const MELIS_CMS_SITE_TOOLS = 'meliscms_site_tools';

    const OLD_MELISCMS_TOOLSTREE = 'meliscms_toolstree';
    /** @var \Zend\ServiceManager\ServiceLocatorInterface $serviceLocator */
    public $serviceLocator;
    /** @var array */
    private $tools = [];
    /** @var string|null - cache holder for section parents */
    private $sectionParent = null;

    /**
     * Extends the functionality of $this->isAccessible method
     * but can only be used on tools
     *
     * @param $key
     *
     * @return bool
     */
    public function canAccess($key): bool
    {
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $xmlRights = $melisCoreAuth->getAuthRights();

        $isAccessible = $this->isAccessible($xmlRights, self::MELIS_PLATFORM_TOOLS_PREFIX, $key);

        $isInterfaceAccessible = $this->isAccessible($xmlRights, self::MELISCORE_PREFIX_INTERFACE, $key);

        return $isAccessible && $isInterfaceAccessible;
    }

    /**
     * @return \Zend\ServiceManager\ServiceLocatorInterface
     */
    public function getServiceLocator(): ServiceLocatorInterface
    {
        return $this->serviceLocator;
    }

    /**
     * @param \Zend\ServiceManager\ServiceLocatorInterface $sl
     *
     * @return $this
     */
    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;

        return $this;
    }

    /**
     * @return \MelisCore\Service\MelisCoreConfigService
     */
    public function getConfig()
    {
        return $this->getServiceLocator()->get('MelisCoreConfig');
    }

    /**
     * @param $xmlRights
     * @param $sectionId
     * @param $itemId
     *
     * @return bool
     */
    public function isAccessible($xmlRights, $sectionId, $itemId)
    {
        $rightsObj = simplexml_load_string(trim($xmlRights));
        $melisAppConfig = $this->getConfig();
        $melisKeys = $melisAppConfig->getMelisKeys();

        if (empty($rightsObj)) {
            return true;
        }

        // Interface case is opposite, we list items where the user is not allowed
        if ($sectionId == self::MELISCORE_PREFIX_INTERFACE) {
                foreach ($rightsObj->$sectionId->id as $interfaceId) {
                    $interfaceId = (string) $interfaceId;
                    $nonPath = rtrim($interfaceId, '/');

                    if ($interfaceId == $itemId ||
                        $nonPath == $itemId ||
                        $interfaceId == self::MELISCORE_PREFIX_INTERFACE . '_root'
                    ) {
                        return false;
                    }

                    // explode to search for the exact key
                    $segments = explode('/',$interfaceId);
                    if (! empty($segments)) {
                        // get the total size minus -1 to get it's last value
                        $tmpId = count($segments) -1;
                        // compare , if equal the the key is excluded
                        if ($segments[$tmpId] == $itemId) {
                            return false;
                        }
                    }
                }
            return true;
        }

        // Tools
        if ($sectionId == self::MELIS_PLATFORM_TOOLS_PREFIX) {

            // check if the user has access to all business app tools
            if (isset($rightsObj->$sectionId->id)) {
                foreach ($rightsObj->$sectionId->id as $toolId) {
                    $toolId = (string) $toolId;
                    if ($toolId == $itemId || $toolId == self::MELIS_PLATFORM_TOOLS_PREFIX . '_root') {
                        return true;
                    }
                }

                // If it reaches here, it means tools are not directly checked, but maybe some sections are
                $appconfigpath = $melisKeys['meliscore_toolstree'];
                $appsConfig = $melisAppConfig->getItem($appconfigpath);
                foreach ($appsConfig['interface'] as $keySection => $section) {
                    foreach ($section['interface'] as $keyTool => $tool) {
                        if ($keyTool == $itemId) {
                            // We found the item's section, now let's check the rights to maybe find the section
                            foreach ($rightsObj->$sectionId->id as $toolId) {
                                if ((string)$toolId == $keySection)
                                    return true;
                            }
                            return false;
                        }
                    }
                }

            } else {

                $toolSectionRoots = array_map(function ($a) {
                    return $a . '_root';
                }, $this->getMelisKeyPaths());
                $toolSection = $this->getSectionParent($itemId);
                $toolIds = [];

                foreach ($this->getMelisKeyPaths() as $section) {
                    if (isset($rightsObj->$sectionId->$section->id)) {
                        foreach ((array) $rightsObj->$sectionId->$section->id as $id) {
                            $toolIds[] =  $id;
                        }
                    }

                    if (isset($rightsObj->$sectionId->$section->noparent)) {
                        foreach ((array) $rightsObj->$sectionId->$section->noparent as $noParent) {
                            $toolIds[] =  $noParent;
                        }
                    }
                }
                $toolIds[] = self::MELIS_DASHBOARD;

                // check for root section access
                if (isset($rightsObj->$sectionId->$toolSection->id)) {
                    $toolSectionsRightsId = (array) $rightsObj->$sectionId->$toolSection->id;
                }

                if (isset($rightsObj->$sectionId->$toolSection->id)) {
                    foreach ($rightsObj->$sectionId->$toolSection->id as $toolId) {
                        $toolId = trim((string) $toolId);
                        $parent = $toolSection . '_root';

                        if (in_array($parent, $toolSectionRoots) && $parent == $toolId) {
                            return true;
                        }
                    }
                }

                // If it reaches here, it means tools are not directly checked, but maybe some sections are
                $tooldIds = [];

                $appconfigpath = $melisKeys[$toolSection] ?? null;
                $appsConfig = $melisAppConfig->getItem($appconfigpath);
                $tmpToolIds = $toolIds;

                // include specified section parents
                foreach ($tmpToolIds as $tool) {

                    $parent = null;
                    if (self::MELIS_DASHBOARD !==  $tool) {
                        if (isset($melisKeys[$tool])) {
                            $parent = $this->getParentViaMelisKeyString($melisKeys[$tool], $tool);
                        }
                    }

                    // old MelisCms tool section
                    if ($parent == self::OLD_MELISCMS_TOOLSTREE) {
                        $parent = self::MELISCMS_PREFIX_TOOLS;
                    }

                    // only the add their parents if the item key is in the rights
                    if (in_array($itemId, $toolIds) ) {
                        if (! is_null($parent) && ! in_array($parent, $toolIds)) {
                            $toolIds[] = $parent;
                        }

                        // check the new list tool IDs with their parents
                        return $this->grantAccess($itemId, $toolIds);
                    }


                    // if item ID is a parent, check if one of their children is in the rights
                    if ($this->getConfig()->isParentOf($tool, $itemId)) {
                        return $this->grantAccess($tool, $toolIds);
                    }

                    // check wether the child has a parent that is in the rights
                    $parentTool = str_replace('_root', '', $tool);
                    if ($this->isParentOf($itemId, $parentTool)) {
                        return $this->grantAccess($parentTool, $toolIds);
                    }
                }

                // check the rights of those who doesn't have proper tool section assignments
                if (isset($rightsObj->$sectionId->$toolSection->noparent)) {
                    $toolIds = array_merge($toolIds, (array) $rightsObj->$sectionId->$toolSection->noparent);
                    return $this->grantAccess($itemId, $toolIds);
                }

                // direct rights access checking to tool section
                if (in_array($itemId, $this->getMelisKeyPaths())  &&
                    count($rightsObj->$sectionId->$itemId->id) > 1
                ) {
                    return true;
                } elseif (in_array($itemId, $this->getOldMelisKeyPathsAndExclusions())) {
                    return true;
                }
            }

        }

        return false;
    }

    /**
     * @param $item
     * @param $rightsTools
     *
     * @return bool
     */
    public function grantAccess($item, $rightsTools)
    {
        if (in_array($item, $rightsTools) ) {
            return true;
        }

        return false;
    }

    /**
     * @param $id
     * @param bool $isRole
     *
     * @return array
     */
    public function getRightsValues($id, $isRole = false)
    {
        $translator = $this->serviceLocator->get('translator');
        /** @var \MelisCore\Service\MelisCoreUserService $melisCoreUser */
        $melisCoreUser = $this->getServiceLocator()->get('MelisCoreUser');
        if (!$isRole) {

            $xml = $melisCoreUser->getUserXmlRights($id);
        } else {
            $xml = '';
            $tableUserRole = $this->serviceLocator->get('MelisCoreTableUserRole');
            $datasRole = $tableUserRole->getEntryById($id);
            if ($datasRole) {
                $datasRole = $datasRole->current();
                if (!empty($datasRole)) {
                    $xml = $datasRole->urole_rights;
                }
            }
        }

        $selectedRootInterface = $melisCoreUser->isItemRightChecked($xml, self::MELISCORE_PREFIX_INTERFACE, self::MELISCORE_PREFIX_INTERFACE . '_root');
        $selectedRootTools = $melisCoreUser->isItemRightChecked($xml, self::MELIS_PLATFORM_TOOLS_PREFIX, self::MELIS_PLATFORM_TOOLS_PREFIX . '_root');

        $rightsItems = [
            [
                'key' => self::MELISCORE_PREFIX_INTERFACE . '_root',
                'title' => $translator->translate('tr_meliscore_rights_Interface exclusion'),
                'lazy' => false,
                'selected' => $selectedRootInterface,
                'iconTab' => '',
                'melisData' => [
                    'colorSelected' => '#CB4040',
                ],
            ],
            [
                'key' => self::MELIS_PLATFORM_TOOLS_PREFIX . '_root',
                'title' => $translator->translate('tr_meliscore_rights_Tools'),
                'lazy' => false,
                'selected' => $selectedRootTools,
                'iconTab' => '',
                'melisData' => [
                    'colorSelected' => '#99C975',
                ],
            ],
        ];

        // interface rights
        $interfaceItems = [];
        $config = $this->getServiceLocator()->get('config');
        foreach ($config['plugins'] as $pluginName => $plugin) {
            $child = $this->getInterfaceKeysRecursive('/' . $pluginName, $xml);
            if ($child) {
                $interfaceItems[] = $child;
            }
        }
        $rightsItems[0]['children'] = $interfaceItems;


        // tools rights
        $toolsItems = $this->getToolsKeys($xml);
        $rightsItems[1]['children'] = $toolsItems;

        // Return values
        return $rightsItems;
    }

    /**
     * @param $keyInterface
     * @param $userXml
     *
     * @return array
     */
    private function getInterfaceKeysRecursive($keyInterface, $userXml)
    {
        /** @var \MelisCore\Service\MelisCoreUserService $melisCoreUser */
        $melisCoreUser = $this->getServiceLocator()->get('MelisCoreUser');
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $configInterface = $melisAppConfig->getItem($keyInterface);
        $recDatas = [];

        if (!empty($configInterface['conf']) && !empty($configInterface['conf']['type'])) {
            $fullKey = $configInterface['conf']['type'];
            $configInterfaceOld = $configInterface;
            $configInterface = $melisAppConfig->getItem($configInterface['conf']['type']);
            if (!empty($configInterface['datas'])) {
                $recDatas = array_merge_recursive($recDatas, $configInterface['datas']);
            }
            if (!empty($configInterface['conf']) && !empty($configInterfaceOld['conf'])) {
                $configInterface['conf'] = array_merge($configInterface['conf'], $configInterfaceOld['conf']);
            }
            $keyInterface = $fullKey;
        }


        if (isset($configInterface['conf']['rightsDisplay'])) {
            $isReference = false;
            if (!empty($configInterface['conf']['type'])) {
                $isReference = true;
            }

            switch ($configInterface['conf']['rightsDisplay']) {
                case 'source'            :
                    if ($isReference) {
                        return null;
                    }
                    break;
                case 'referencesonly'    :
                    if (!$isReference) {
                        return null;
                    }
                    break;
                case 'none'            :
                    return null;
                    break;;
                case 'all'                :
                default                    :
                    break;
            }
        }

        $selectedInterface = $melisCoreUser->isItemRightChecked($userXml, self::MELISCORE_PREFIX_INTERFACE, $keyInterface);
        $keyPrefixed = self::MELISCORE_PREFIX_INTERFACE . '_' . $keyInterface;

        $name = '';
        if (!empty($configInterface['conf']['name'])) {
            $name = $configInterface['conf']['name'];
        } else {
            $tabName = explode('/', $keyInterface);
            $name = $tabName[count($tabName) - 1];
        }

        $showCheckbox = true;
        if (!empty($configInterface['conf']['rights_checkbox_disable'])) {
            $showCheckbox = false;
        }

        $item = [
            'key' => $keyPrefixed,
            'title' => $name,
            'lazy' => false,
            'selected' => $selectedInterface,
            'iconTab' => '',
            'checkbox' => $showCheckbox,
            'melisData' => [
                'colorSelected' => '#CB4040',
            ],
            'children' => [],
        ];


        if (!empty($configInterface['interface'])) {
            foreach ($configInterface['interface'] as $keyChildConfig => $valueChildConfig) {
                /**
                 * don't include melis dashboard plugins
                 */
                if($keyChildConfig != 'melis_dashboardplugin' && $keyChildConfig != 'meliscore_dashboard_menu') {
                    $child = $this->getInterfaceKeysRecursive($keyInterface . '/interface/' . $keyChildConfig, $userXml);
                    if ($child) {
                        $item['children'][] = $child;
                    }
                }
            }
        }

        return $item;
    }

    /**
     * @param $userXml
     *
     * @return array
     */
    private function getToolsKeys($userXml)
    {
        $melisCoreUser = $this->getServiceLocator()->get('MelisCoreUser');
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $melisKeys = $this->getConfig()->getMelisKeys();

        $appConfigPaths = $this->getMelisKeyPaths();
        $tools = [];
        foreach ($appConfigPaths as $idx => $path) {
            $appConfigPath = $melisKeys[$path];
            $appsConfig = $melisAppConfig->getItem($appConfigPath);
            $orderInterface = $melisAppConfig->getOrderInterfaceConfig($path);
            $selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELIS_PLATFORM_TOOLS_PREFIX, $path);


            // tool category
            $tools[$idx] = [
                'key' => $path,
                'title' => $appsConfig['conf']['name'] ?? $path,
                'lazy' => false,
                'children' => [],
                'selected' => $selectedTools,
                'iconTab' => '',
                'melisData' => [
                    'colorSelected' => '#99C975',
                ],
            ];

            // first level, sections
            $appCtr = 0;
            foreach ($appsConfig['interface'] as $appKey => $appSection) {

                $selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELIS_PLATFORM_TOOLS_PREFIX, $appKey);
                $tools[$idx]['children'][$appCtr] = [
                    'key' => $appKey,
                    'title' => $appSection['conf']['name'] ?? $appKey,
                    'lazy' => false,
                    'children' => [],
                    'selected' => $selectedTools,
                    'iconTab' => '',
                    'melisData' => [
                        'colorSelected' => '#99C975',
                    ],
                ];

                // Second level, tools
                $appToolCtr = 0;
                if (isset($appSection['interface'])) {
                    foreach ($appSection['interface'] as $toolKey => $toolName) {
                        $selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELIS_PLATFORM_TOOLS_PREFIX, $toolKey);
                        $icon = $toolName['conf']['icon'] ?? null;

                        $tools[$idx]['children'][$appCtr]['children'][$appToolCtr] = [
                            'key' => $toolKey,
                            'title' => $toolName['conf']['name'] ?? $toolKey,
                            'children' => [],
                            'lazy' => false,
                            'selected' => $selectedTools,
                            'iconTab' => '',
                            'melisData' => [
                                'colorSelected' => '#99C975',
                            ],
                        ];

                        $appToolCtr++;
                    }
                }

                $appCtr++;
            }

        }
        // Reordering sections
        $sections = $tools;
        $toolsOrdered = [];
        foreach ($orderInterface as $orderKeySection => $sectionTools) {
            if (!empty($sections[$orderKeySection])) {
                if (empty($toolsOrdered[$orderKeySection])) {
                    $toolsOrdered[$orderKeySection] = [];
                }
                $toolsOrdered[$orderKeySection] = $tools[$orderKeySection];
            }
        }
        foreach ($sections as $keyInterfaceSection => $childinterface) {
            if (empty($toolsOrdered[$keyInterfaceSection])) {
                $toolsOrdered[$keyInterfaceSection] = [];
            }
            $toolsOrdered[$keyInterfaceSection] = $tools[$keyInterfaceSection];

        }

        // Reordering tools inside sections
        if ($toolsOrdered) {
            foreach ($toolsOrdered as $keySection => $toolsSection) {
                $sectionOrderInterface = [];
                if (!empty($orderInterface[$keySection])) {
                    $sectionOrderInterface = $orderInterface[$keySection];
                }
                $toolsSectionOrdered = [];

                if (!empty($sectionOrderInterface)) {
                    foreach ($sectionOrderInterface as $orderKey) {
                        if (!empty($tools[$keySection]['children'][$orderKey])) {
                            $toolsOrdered[$keySection]['children'][$orderKey] = $tools[$keySection]['children'][$orderKey];
                        }
                    }

                    foreach ($tools[$keySection]['children'] as $keyInterface => $childinterface) {
                        $toolsOrdered[$keySection]['children'][$keyInterface] = $childinterface;
                    }
                }
            }
        }

        $finalToolsOrdered = [];
        foreach ($toolsOrdered as $key => $sectionTool) {
            $toolsTmp = [];
            if (!empty($sectionTool['children'])) {
                $toolsTmp = $sectionTool['children'];
            }
            $newTools = [];

            foreach ($toolsTmp as $keyTool => $tool) {
                $newTools[] = $tool;
            }
            $sectionTool['children'] = $newTools;
            $finalToolsOrdered[] = $sectionTool;
        }

        return $finalToolsOrdered;

    }

    /**
     * Generates an XML rights
     *
     * @param $id
     * @param $datas
     * @param bool $isRole
     *
     * @return array
     */
    public function createXmlRightsValues($id, $datas, $isRole = false): array
    {
        /** @var \MelisCore\Service\MelisCoreConfigService $melisAppConfig */
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $melisKeys = $melisAppConfig->getMelisKeys();

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
        $interfaceNode = self::MELISCORE_PREFIX_INTERFACE . '_root';
        $xmlRights = '<' . self::MELISCORE_PREFIX_INTERFACE . '>' . self::XML_ENDLINE;
        if (!empty($nodesInterface) && !empty($nodesInterface->$interfaceNode)) {
            foreach ($nodesInterface->$interfaceNode as $idInterface) {
                if ($idInterface != $interfaceNode) {
                    $idUnPrefixed = str_replace(self::MELISCORE_PREFIX_INTERFACE . '_', '', $idInterface);
                } else {
                    $idUnPrefixed = $idInterface;
                }
                $xmlRights .= self::XML_SPACER . '<id>' . $idUnPrefixed . '</id>' . self::XML_ENDLINE;
            }
        }
        $xmlRights .= '</' . self::MELISCORE_PREFIX_INTERFACE . '>' . self::XML_ENDLINE;

        // Creating tools xml
        $toolsNode = self::MELIS_PLATFORM_TOOLS_PREFIX . '_root';
        $xmlRights .= '<' . self::MELIS_PLATFORM_TOOLS_PREFIX . '>' . self::XML_ENDLINE;

        // here we list all the available tool sections
        foreach ($this->getMelisKeyPaths() as $toolSection) {
            $xmlRights .=  self::XML_SPACER . '<' . $toolSection . '>' . self::XML_ENDLINE;
            if (!empty($nodesTools) && !empty($nodesTools->$toolsNode)) {
                foreach ($nodesTools->$toolsNode as $idTool) {
                    $parent = $this->getSectionParent($idTool) ?? null;

                    if (! $parent) {
                        // check if this tool ID exists in xml
                        if (! preg_match("/$idTool/", $xmlRights) && $idTool !== $toolsNode) {
                            $xmlRights .= self::XML_SPACER . self::XML_SPACER . '<noparent>' . $idTool . '</noparent>' . self::XML_ENDLINE;
                        }
                    } else {
                        if ($parent === $toolSection && $idTool !== $toolsNode) {
                            $id = $idTool === $parent ? $idTool . '_root' : $idTool;
                            $xmlRights .= self::XML_SPACER . self::XML_SPACER . '<id>' . $id . '</id>' . self::XML_ENDLINE;
                        }
                    }
                }
            }
            $xmlRights .=  self::XML_SPACER . '</' . $toolSection . '>' . self::XML_ENDLINE;
        }

        // for general business, if it's checked then we just saved its root
        if (!empty($nodesTools) && !empty($nodesTools->$toolsNode)) {
            foreach ($nodesTools->$toolsNode as $idTool) {
                if ($idTool === $toolsNode) {
                    $xmlRights .= self::XML_SPACER . '<id>' . $toolsNode . '</id>' . self::XML_ENDLINE;
                }
            }
        }

        $xmlRights .= '</' . self::MELIS_PLATFORM_TOOLS_PREFIX . '>' . self::XML_ENDLINE;

        return ['meliscore_rights' => $xmlRights];
    }

    /**
     * @return array
     */
    public function getRightsToolKeys()
    {
        return [
            self::MELIS_PLATFORM_TOOLS_PREFIX . '_root',
            self::MELISCORE_PREFIX_TOOLS,
            self::MELISCMS_PREFIX_TOOLS,
            self::MELIS_DASHBOARD,
            self::MELISMARKETING_PREFIX_TOOLS,
            self::MELISCOMMERCE_PREFIX_TOOLS,
            self::MELISOTHERS_PREFIX_TOOLS,
            self::MELISCUSTOM_PREFIX_TOOLS,
            self::MELISMARKETPLACE_PREFIX_TOOLS,
        ];
    }

    /**
     * @return array
     */
    public function getMelisKeyPaths()
    {
        return [
            self::MELISCORE_PREFIX_TOOLS,
            self::MELISCMS_PREFIX_TOOLS,
            self::MELISMARKETING_PREFIX_TOOLS,
            self::MELISCOMMERCE_PREFIX_TOOLS,
            self::MELISOTHERS_PREFIX_TOOLS,
            self::MELISCUSTOM_PREFIX_TOOLS,
            self::MELISMARKETPLACE_PREFIX_TOOLS,

        ];
    }

    /**
     * @return array
     */
    public function getOldMelisKeyPathsAndExclusions()
    {
        return [
            self::OLD_MELISCMS_TOOLSTREE,
            self::MELIS_CMS_SITE_TOOLS
        ];
    }

    /**
     * @param $melisKeys
     * @param $child
     *
     * @return mixed|null
     */
    public function getToolParent($melisKeys, $child)
    {
        $parent = null;
        $toolsTreeKeys = array_merge($this->getMelisKeyPaths(), $this->getOldMelisKeyPathsAndExclusions());
        $toolsNodeRoot = array_map (function ($a) {
            return $a . '_root';
        }, $this->getMelisKeyPaths());

        if (null !== $child && is_string($child) && isset($melisKeys[$child])) {
            $melisKey = $melisKeys[$child];
            if (in_array($child, $toolsTreeKeys)) {
                $parent = $child;
            } else {
                $parent = $this->getParentViaMelisKeyString($melisKey,  $child);
                if (! in_array($parent, $toolsTreeKeys)) {
                    $parent = $this->getToolParent($melisKeys, $parent);
                }
            }
        }

        // if the provided child is a root node
        if (is_string($child)) {
            if (in_array(trim($child), $toolsNodeRoot)) {
                $parent = str_replace('_root', '', $child);
            }
        }

        switch ($parent) {
            case self::OLD_MELISCMS_TOOLSTREE:
                $parent = self::MELISCMS_PREFIX_TOOLS;
                break;
        }

        return $parent;
    }

    /**
     * @param $melisKey
     * @param $child
     *
     * @return mixed|null
     */
    public function getParentViaMelisKeyString($melisKey, $child)
    {
        if (! $melisKey) {
            return $child;
        }

        $melisKeys = explode('/', $melisKey);
        if (is_array($melisKeys) && count($melisKeys) > 1) {
            $parentIdx = array_search($child, $melisKeys) - 1;
            if (isset($melisKeys[$parentIdx]) && 'interface' === $melisKeys[$parentIdx]) {
                $parentIdx = array_search($child, $melisKeys) - 2;
            }
            return $melisKeys[$parentIdx] ?? null;
        }
    }

    /**
     * @param $melisKey
     * @param null $data
     *
     * @return string
     */
    public function getSectionParent($melisKey, $data = null)
    {
        $data = is_null($data) ? $this->getToolSectionMap() : $data;

        foreach ($data as $idx => $tool) {
            if ($tool['key'] === $melisKey) {
                $this->sectionParent = $tool['section'];
            }

            if (!empty($tool['children']) && $tool['key'] !== $melisKey) {
                $this->getSectionParent($melisKey, $tool['children']);
            }
        }

        return $this->sectionParent;
    }

    /**
     * @param $toolKey
     * @param $parentKey
     *
     * @return null|string
     */
    public function isParentOf($toolKey, $parentKey, $data = null)
    {
        $data = is_null($data) ? $this->getToolSectionMap() : $data;

        foreach ($data as $idx => $tool) {
            if ($tool['key'] === $toolKey) {
                $this->sectionParent = $tool['parent'];
            }

            if (!empty($tool['children']) && $tool['key'] !== $toolKey) {
                $this->isParentOf($toolKey, $parentKey, $tool['children']);
            }
        }

        return $this->sectionParent == $parentKey;
    }

    /**
     * @return array
     */
    public function getToolSectionMap()
    {
        $melisKeys = $this->getConfig()->getMelisKeys();

        $appConfigPaths = $this->getMelisKeyPaths();

        $tools = [];

        foreach ($appConfigPaths as $idx => $path) {
            $appConfigPath = $melisKeys[$path];
            $appsConfig = $this->getConfig()->getItem($appConfigPath);
            $orderInterface = $this->getConfig()->getOrderInterfaceConfig($path);

            // tool category
            $tools[$idx] = [
                'key' => $path,
                'title' => $appsConfig['conf']['name'] ?? $path,
                'lazy' => false,
                'section' => $path,
                'parent' => 'meliscore_left_menu',
                'children' => [],
            ];

            // first level, sections
            $appCtr = 0;
            foreach ($appsConfig['interface'] as $appKey => $appSection) {

                $tools[$idx]['children'][$appCtr] = [
                    'key' => $appKey,
                    'title' => $appSection['conf']['name'] ?? $appKey,
                    'lazy' => false,
                    'section' => $path,
                    'parent' => $path,
                    'children' => [],
                ];

                // Second level, tools
                $appToolCtr = 0;
                if (isset($appSection['interface'])) {
                    foreach ($appSection['interface'] as $toolKey => $toolName) {
                        $icon = $toolName['conf']['icon'] ?? null;

                        if ($icon) {
                            $tools[$idx]['children'][$appCtr]['children'][$appToolCtr] = [
                                'key' => $toolKey,
                                'title' => $toolName['conf']['name'] ?? $toolKey,
                                'children' => [],
                                'section' => $path,
                                'parent' => $appKey,
                                'lazy' => false,
                            ];
                        }
                        $appToolCtr++;
                    }
                    $appCtr++;
                }
            }
        }

        return $tools;
    }
}
