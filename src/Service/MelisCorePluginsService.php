<?php

namespace MelisCore\Service;

use Laminas\ServiceManager\ServiceManager;
use Laminas\Session\Container;

class MelisCorePluginsService extends MelisGeneralService
{
    const DASHBOARD_PLUGIN_TYPE = "dashboard";
    const TEMPLATING_PLUGIN_TYPE = "templating";
    /**
     * @var $pluginsTbl \MelisCore\Model\Tables\MelisPluginsTable
     */
    public $pluginsTbl;

    /**
     * @param ServiceManager $service
     */
    public function setServiceManager(ServiceManager $service)
    {
        parent::setServiceManager($service);
        $this->pluginsTbl = $service->get('MelisPluginsTable');
    }

    /**
     * @return mixed
     */
    public function getTemplatingPlugins()
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $results = array();
        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_get_templating_plugins_start', $arrayParameters);
        // Implementation start
        $melisConfig = $this->getServiceManager()->get('config');
        // get plugin config
        $plugins = $melisConfig['plugins'];
        $dashboardPlugins = [];
        // put plugins into a variable
        if (! empty($plugins)) {
        	$templatingPluygins = [];
            foreach ($plugins as $moduleName => $val) {
                // get templating plugins.
                if (isset($val['plugins']) && ! empty($val['plugins'])) {
                    $templatingPluygins[$moduleName] = [];
                    // templating plugins
                    foreach ($val['plugins'] as $pluginName => $pluginConfig) {
                        if ($pluginName != "MelisFrontDragDropZonePlugin") {
                            array_push($templatingPluygins[$moduleName],$pluginName);
                        }
                    }
                }
            }
            $results = $templatingPluygins;
        }
        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] =  $results;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_get_templating_plugins_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Return all dashboard plugins
     * @return mixed
     */
    public function getDashboardPlugins($pluginNameOnly = false)
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $results = array();
        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_get_dashboard_plugins_start', $arrayParameters);
        // Implementation start
        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $dashboardPlugins = $melisConfig->getItem('/meliscore/interface/melis_dashboardplugin/interface/melisdashboardplugin_section');
        $plugins = [];
        if (isset($dashboardPlugins['interface']) && count($dashboardPlugins['interface'])) {
            foreach ($dashboardPlugins['interface'] as $pluginName => $pluginConf) {
                $plugin = $pluginConf;
                $path = $pluginConf['conf']['type'] ?? null;
                if ($path) {
                    $plugin = $melisConfig->getItem($path);
                }
                if(!isset($plugin['datas']['skip_plugin_container'])) {
                    $name = $plugin['datas']['plugin_id'] ?? $plugin['datas']['plugin'];
                    $module = $plugin['forward']['module'];
                    $plugins[$module][] = $name;
                }
            }
            $results = $plugins;
        }

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] =  $results;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_get_dashboard_plugins_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * @param array $pluginData (plugin details)
     * @return bool
     */
    public function savePlugin(array $pluginData) : bool
    {
        $status = false;
        if (is_array($pluginData) && !empty($pluginData)) {
            // save plugin info in db
            $id = $this->pluginsTbl->save($pluginData);
            if (! empty($id)) {
                $status = true;
            }
        }

        return $status;
    }

    /**
     * to check if the plugin is new or not
     * @param $pluginName
     * @return bool
     */
    public function pluginIsNew($pluginName) : bool
    {
        $status = false;
        $pluginData = $this->pluginsTbl->getEntryByField('plugin_name',$pluginName)->current();
        // get date installed
        if (! empty($pluginData)) {
            $dateInstalled = $pluginData->plugin_date_installed;
            $newPluginNotificationDuration = $this->getNewPluginNotifMenuDuration();
            $dateElapse = null;
            // add 10 days
            // for templating plugins
            if ($pluginData->plugin_type == self::TEMPLATING_PLUGIN_TYPE) {
                $dateElapse    = strtotime("+$newPluginNotificationDuration day",strtotime($dateInstalled));
            }
            // for dashboard plugins
            if ($pluginData->plugin_type == self::DASHBOARD_PLUGIN_TYPE) {
                $dateElapse    = strtotime("+$newPluginNotificationDuration day",strtotime($dateInstalled));
            }

            $dateElapse    = date('Y-m-d h:i:s', $dateElapse);
            $dateToday     = date('Y-m-d h:i:s');
            // compare two date time
            if ($dateToday < $dateElapse) {
                $status = true;
            }
        }

        return $status;
    }

    /**
     *  - return all plugins of a module (dashboard and templating (cms page edition))
     * @param $moduleName - this must correspond to the key in the config
     *                       - ex. [meliscore] refer to \melis-core\config\dashboard-plugins\MelisCoreDashboardDragDropZonePlugin.config.php
     * @return array
     */
    public function getModulePlugins($moduleName)
    {
        $modulePlugins = [];
        if (! empty($moduleName)) {
            // dashboard plugins
            $dashboardPlugins = $this->getDashboardPlugins();
            if (isset($dashboardPlugins[$moduleName]) && ! empty($dashboardPlugins[$moduleName])) {
                $modulePlugins['dashboard'] = $dashboardPlugins[$moduleName];
            }
            // templating plugins
            $templatingPlugins = $this->getTemplatingPlugins();
            if (isset($templatingPlugins[$moduleName]) && ! empty($templatingPlugins[$moduleName])) {
                $modulePlugins['templating'] = $templatingPlugins[$moduleName];
            }
        }

        return $modulePlugins;
    }

    /**
     * Get all plugins in melis platform
     * @return array
     */
    public function getAllPlugins()
    {
        return array_merge($this->getDashboardPlugins(), $this->getTemplatingPlugins());
    }

    /**
     * This will get the modules categories from marketplace domain http://marketplace.melisplatform.com/melis-packagist/get-package-group
     * if no internet connection it returns null
     * @return array|mixed
     */
    public function getPackagistCategories($reloadModules = false)
    {
        $container = new Container('meliscore');

        if (!empty($container['melis-packagist-categories']) && !$reloadModules)
            return $container['melis-packagist-categories'];

        // get the marketplace sections for the modules
        $marketPlaceModuleCategories = @file_get_contents("http://marketplace.melisplatform.com/melis-packagist/get-package-group", true);
        // decode to make it an array
        $marketPlaceModuleCategories = json_decode($marketPlaceModuleCategories);
        $simplifiedModuleCategories = [];
        if (! empty($marketPlaceModuleCategories)) {
            // simplified data into one array
            foreach ($marketPlaceModuleCategories as $idx => $val) {
                // check category if it is empty
                // we will not include section(s) does'nt have any modules under
                if ($val->module_count > 0) {
                    $simplifiedModuleCategories[$idx] = $val->mp_group_name;
                }
            }
        }

        $container['melis-packagist-categories'] = $simplifiedModuleCategories;

        return $simplifiedModuleCategories;
    }

    /**
     * Will check of all dashboard plugins and will insert a new record if it is new
     * @return array
     */
    public function checkDashboardPlugins()
    {
        $newPlugins = [];
        // get dashboard plugins
        $dashboardPlugins  = $this->getDashboardPlugins();
        // save dashboard plugins
        if (! empty($dashboardPlugins)) {
            foreach ($dashboardPlugins as $moduleName => $plugins) {
                if (is_array($plugins) && ! empty($plugins)) {
                    foreach ($plugins as $idx => $pluginName) {
                        // check if plugin is already exists
                        // we only save for those plugins that are not on db
                        $pluginData = $this->pluginsTbl->getEntryByField('plugin_name',$pluginName)->current();
                        if (empty($pluginData) || !$pluginData) {
                            $tmpData = [
                                'plugin_name' => $pluginName,
                                'plugin_module' => $moduleName,
                                'plugin_date_installed' => date('Y-m-d h:i:s'),
                                'plugin_type' => self::DASHBOARD_PLUGIN_TYPE
                            ];
                            if($this->pluginsTbl->save($tmpData)) {
                                $newPlugins[] = $pluginName;
                            }
                        }
                    }
                }
            }
        }

        return  $newPlugins;
    }

    /**
     * Will check of all templating plugins and will insert a new record if it is new
     * @return array
     */
    public function checkTemplatingPlugins()
    {
        $newPlugins = [];
        // get templating plugins
        $templatingPlugins = $this->getTemplatingPlugins();
        // save templating plugins
        if (! empty($templatingPlugins)) {
            foreach ($templatingPlugins as $moduleName => $plugins) {
                if (is_array($plugins) && ! empty($plugins)) {
                    foreach ($plugins as $idx => $pluginName) {
                        // check if plugin is already exists
                        // we only save for those plugins that are not on db
                        $pluginData = $this->pluginsTbl->getEntryByField('plugin_name',$pluginName)->current();
                        if (empty($pluginData) || !$pluginData) {
                            $tmpData = [
                                'plugin_name' => $pluginName,
                                'plugin_module' => $moduleName,
                                'plugin_date_installed' => date('Y-m-d h:i:s'),
                                'plugin_type' => self::TEMPLATING_PLUGIN_TYPE
                            ];
                            if ($this->pluginsTbl->save($tmpData)) {
                                $newPlugins[] = $pluginName;
                            }
                        }
                    }
                }
            }
        }

        return  $newPlugins;
    }
    public function getLatestPlugin($pluginType)
    {
        return (array) $this->pluginsTbl->getLatestPlugin($pluginType)->current();
    }
    /**
     * getting the configuration key for new plugin menu handler notification duration [new_plugin_notification][menu_handler]
     * file location : /melis-core/config/app.interface.php
     * @return mixed
     */
    public function getNewPluginMenuHandlerNotifDuration()
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_get_new_plugin_menu_handler_notif_duration_start', $arrayParameters);
        // Implementation start
        $melisConfig = $this->getServiceManager()->get('config');
        // get plugin config
        $pluginMenuHandlerDuration = $melisConfig['plugins']['meliscore']['datas']['new_plugin_notification']['menu_handler'] ?? "5";

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] =  $pluginMenuHandlerDuration;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_get_new_plugin_menu_handler_notif_duration_end', $arrayParameters);

        return $arrayParameters['results'];
    }
    /**
     * getting the configuration key for new plugin notification duration [new_plugin_notification][inside_menu]
     * file location : /melis-core/config/app.interface.php
     * @return mixed
     */
    public function getNewPluginNotifMenuDuration()
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_get_new_plugin_notif_menu_duration_start', $arrayParameters);
        // Implementation start
        $melisConfig = $this->getServiceManager()->get('config');
        // get plugin config
        $newPluginNotifInsideMenu = $melisConfig['plugins']['meliscore']['datas']['new_plugin_notification']['inside_menu'] ?? "10";
        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] =  $newPluginNotifInsideMenu;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_get_new_plugin_notif_menu_duration_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * @param $pluginModuleName if set to true then it will base like (meliscms,meliscore,meliscmsslider) if not  then like(melis-cms,melis-core,melis-cms-slider)
     */
    public function getMelisPublicModules($pluginModuleName = false, $dashboardPlugin = false, $reloadModules = false)
    {
        $container = new Container('meliscore');

        if (!empty($container['melis-public-modules']) && !$reloadModules)
            return $container['melis-public-modules'];

        $melisPublicModulesWithSection = @file_get_contents("http://marketplace.melisplatform.com/melis-packagist/get-package-list", true);

        $publicModules = [];
        if (! empty($melisPublicModulesWithSection)) {
            // json_decode to make it an arrays
            $melisPublicModulesWithSection = json_decode($melisPublicModulesWithSection);
            foreach ($melisPublicModulesWithSection as $idx => $moduleInfo) {
                // remove 'melisplatform/' word
                $packageName = str_replace('melisplatform/','',$moduleInfo->packageName);
                /*
                 * special case for plugin config of module name
                 */
                if ($pluginModuleName) {
                    // remove dashes
                    $packageName = str_replace('-','',$packageName);
                }
                if ($dashboardPlugin) {
                    $packageName = str_replace('-','',implode('-', array_map('ucfirst', explode('-', $packageName))));
                }

                $publicModules[$packageName] = [
                    'section' => $moduleInfo->packageSection
                ];
            }
        }

        // Adding to Current user session
        $container['melis-public-modules'] = $publicModules;

        return $publicModules;
    }
}
