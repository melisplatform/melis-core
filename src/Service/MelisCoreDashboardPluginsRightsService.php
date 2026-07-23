<?php

namespace MelisCore\Service;

use Laminas\Json\Json;

class MelisCoreDashboardPluginsRightsService extends MelisServiceManager implements MelisCoreRightsServiceInterface
{
    const DASHBOARD_PLUGIN_ROOT = 'melis_dashboardplugin_root';
    const MELISCORE_DASHBOARDPLUGIN_PREFIX = 'melis_dashboardplugin';
    const MELISDASHBOARDPLUGIN_PREFIX_TOOLS = 'melisdashboardplugin_section';

    public function hasPlugins(): bool
    {
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
        $xmlRights = $melisCoreAuth->getAuthRights();
        $rightsObj = simplexml_load_string(trim($xmlRights));
        if (empty($rightsObj)) {
            return false;
        }

        /** Find dashboard root */
        $key = self::MELISCORE_DASHBOARDPLUGIN_PREFIX;
        $plugins = empty($rightsObj->$key->id) ? [] : (array)$rightsObj->$key->id;
        $root = array_search(self::DASHBOARD_PLUGIN_ROOT, $plugins);

        if (is_int($root)) {
            return true;
        }

        if (empty($plugins)) {
            return false;
        } else {
            return true;
        }
    }

    public function canAccess($key): bool
    {
        // Super-administrateur (usr_admin=1) = accès TOTAL, indépendamment de son usr_rights.
        try {
            $identity = $this->getServiceManager()->get('MelisCoreAuth')->getIdentity();
            if (!empty($identity) && !empty($identity->usr_admin)) {
                return true;
            }
        } catch (\Throwable $e) { /* pas d'identité → on continue avec le gate normal */ }

        // Plugins « plateforme » marqués exclude_rights_display (ex. l'Announcement) : accordés à tous,
        // volontairement non gérables via l'arbre des droits → toujours accessibles.
        if ($this->isAlwaysGrantedDashboardPlugin($key)) {
            return true;
        }

        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
        $xmlRights = $melisCoreAuth->getAuthRights();

        // Utilisateur NON admin SANS aucun droit (XML vide/illisible) → AUCUN dashboard plugin.
        // isAccessible() renvoyait historiquement true sur des droits vides (default-ALLOW) : un
        // utilisateur sans droits voyait alors TOUS les dashboard plugins MelisCore (ticket 0010740).
        $rightsObj = @simplexml_load_string(trim((string) $xmlRights));
        if (empty($rightsObj)) {
            return false;
        }

        return $this->isAccessible($xmlRights, self::MELISCORE_DASHBOARDPLUGIN_PREFIX, $key);
    }

    /**
     * A dashboard plugin flagged `exclude_rights_display` is platform-wide: excluded from the rights
     * tree (not toggleable) and granted to everyone (e.g. MelisCoreDashboardAnnouncementPlugin). Such
     * a plugin must stay visible even for a user with no rights.
     *
     * @param string $key plugin class/melisKey
     * @return bool
     */
    private function isAlwaysGrantedDashboardPlugin($key): bool
    {
        try {
            $config = $this->getServiceManager()->get('MelisCoreConfig');
            $base = '/meliscore/interface/' . self::MELISCORE_DASHBOARDPLUGIN_PREFIX
                . '/interface/' . self::MELISDASHBOARDPLUGIN_PREFIX_TOOLS . '/interface/' . $key;
            $node = $config->getItem($base);
            $datas = $node['datas'] ?? null;
            // Modules external to MelisCore declare their datas behind a conf.type indirection.
            if ($datas === null && !empty($node['conf']['type'])) {
                $datas = $config->getItem($node['conf']['type'])['datas'] ?? null;
            }
            return !empty($datas['exclude_rights_display']);
        } catch (\Throwable $e) {
            return false;
        }
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
        $translator = $this->getServiceManager()->get('translator');
        $melisCoreUser = $this->getServiceManager()->get('MelisCoreUser');
        if (!$isRole) {
            $xml = $melisCoreUser->getUserXmlRights($id);
        } else {
            $xml = '';
            $tableUserRole = $this->getServiceManager()->get('MelisCoreTableUserRole');
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
        $melisCoreUser = $this->getServiceManager()->get('MelisCoreUser');
        /** @var \MelisCore\Service\MelisCoreConfigService $melisAppConfig */
        $melisAppConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $melisKeys = $this->getConfig()->getMelisKeys();

        $appConfigPaths = $this->getMelisKeyPaths();

        $tools = [];
        foreach ($appConfigPaths as $idx => $path) {
            $appConfigPath = $melisKeys[$path];
            $appsConfig = $melisAppConfig->getItem($appConfigPath);

            $appCtr = 0;
            foreach ($appsConfig['interface'] as $appKey => $appSection) {
                if(!isset($appSection['datas']['skip_plugin_container'])) {
                    if(!isset($appSection['datas']['exclude_rights_display'])) {//check if this plugins is excluded in rights display
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

        $dashboardPlugins = json_decode($datas[self::DASHBOARD_PLUGIN_ROOT], true);
        $dashboardPlugins = current($dashboardPlugins);

        /**
         * Always include Announcement dashboard plugins
         */
        if(!in_array('MelisCoreDashboardAnnouncementPlugin', $dashboardPlugins)){
            $dashboardPlugins[] = 'MelisCoreDashboardAnnouncementPlugin';
        }

        // parent node
        $xmlRights .= '<' . self::MELISCORE_DASHBOARDPLUGIN_PREFIX . '>' . PHP_EOL;
        foreach ($dashboardPlugins as $plugin) {
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
        return $this->getServiceManager()->get('MelisCoreConfig');
    }
}
