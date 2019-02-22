<?php

namespace MelisCore\Service;

use Zend\Json\Json;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

class MelisCoreDashboardPluginsRightsService implements MelisCoreRightsServiceInterface, ServiceLocatorAwareInterface
{
    public $serviceLocator;

    const MELISCORE_DASHBOARDPLUGIN_PREFIX = 'melis_dashboardplugin';
    const MELISDASHBOARDPLUGIN_PREFIX_TOOLS = 'melisdashboardplugin_section';

    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }

    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }

    public function canAccess($key): bool
    {
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $xmlRights = $melisCoreAuth->getAuthRights();
        $dashboardPlugins = $this->isAccessible($xmlRights, self::MELISCORE_DASHBOARDPLUGIN_PREFIX, $key);
        return $dashboardPlugins;
    }

    public function isAccessible($xmlRights, $sectionId, $itemId)
    {
        $rightsObj = simplexml_load_string(trim($xmlRights));
        if (empty($rightsObj)) {
            return true;
        }

        if ($sectionId == self::MELISCORE_DASHBOARDPLUGIN_PREFIX) {
            if(!empty($rightsObj->$sectionId)) {
                foreach ($rightsObj->$sectionId->id as $interfaceId) {
                    if ((string)$interfaceId == $itemId || (string)$interfaceId == self::MELISCORE_DASHBOARDPLUGIN_PREFIX . '_root')
                        return true;
                }
            }
        }
        return false;
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

        $selectedRootDashboardPlugins = $melisCoreUser->isItemRightChecked($xml, self::MELISCORE_DASHBOARDPLUGIN_PREFIX, self::MELISCORE_DASHBOARDPLUGIN_PREFIX.'_root');

        $rightsItems = array(
            array(
                'key' => self::MELISCORE_DASHBOARDPLUGIN_PREFIX . '_root',
                'title' => 'Dashboard Plugins',
                'lazy' => true,
                'melisData' => array(
                    'colorSelected' => '#99C975',
                ),
                'selected' => $selectedRootDashboardPlugins,
                'iconTab' => '',
            )
        );


        // tools rights
        $toolsItems = $this->getPluginsKeys($xml);
        $rightsItems[0]['children'] = $toolsItems;

        // Return values
        return $rightsItems;
    }

    /**
     * @param $userXml
     *
     * @return array
     */
    private function getPluginsKeys($userXml)
    {
        $melisCoreUser = $this->getServiceLocator()->get('MelisCoreUser');
        /** @var \MelisCore\Service\MelisCoreConfigService $melisAppConfig */
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $melisKeys = $this->getConfig()->getMelisKeys();

        $appConfigPaths = $this->getMelisKeyPaths();

        $tools = [];
        foreach ($appConfigPaths as $idx => $path) {
            $appConfigPath = $melisKeys[$path];
            $appsConfig = $melisAppConfig->getItem($appConfigPath);

            $appCtr = 0;
            foreach ($appsConfig['interface'] as $appKey => $appSection) {
                if(!isset($appSection['datas']['skip_plugin_container'])) {
                    $selectedTools = $melisCoreUser->isItemRightChecked($userXml, self::MELISCORE_DASHBOARDPLUGIN_PREFIX, $appKey);
                    $tools[$appCtr] = [
                        'key' => $appKey,
                        'title' => $appSection['datas']['name'] ?? $appKey,
                        'lazy' => false,
                        'children' => [],
                        'selected' => $selectedTools,
                        'iconTab' => '',
                        'melisData' => [
                            'colorSelected' => '#99C975',
                        ],
                    ];
                    $appCtr++;
                }
            }

        }
        return $tools;

    }

    /**
     * @return array
     */
    public function getMelisKeyPaths()
    {
        return [
            self::MELISDASHBOARDPLUGIN_PREFIX_TOOLS
        ];
    }

    public function createXmlRightsValues($id, $datas, $isRole = false)
    {
        $xmlRights = '';

        $dashboardPlugins = json_decode($datas['melis_dashboardplugin_root'], true);

        // parent node
        $xmlRights .= '<' . self::MELISCORE_DASHBOARDPLUGIN_PREFIX . '>' . PHP_EOL;
        foreach (current($dashboardPlugins) as $plugin) {
            $xmlRights .= "\t<id>$plugin</id>" . PHP_EOL;
        }
        $xmlRights .= '</' . self::MELISCORE_DASHBOARDPLUGIN_PREFIX . '>' . PHP_EOL;

        return array('meliscore_dashboardplugin_rights' => $xmlRights);
    }

    /**
     * @return \MelisCore\Service\MelisCoreConfigService
     */
    public function getConfig()
    {
        return $this->getServiceLocator()->get('MelisCoreConfig');
    }
}
