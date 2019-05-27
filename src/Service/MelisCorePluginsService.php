<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

class MelisCorePluginsService extends MelisCoreGeneralService
{
    const DASHBOARD_PLUGIN_TYPE = "dashboard";
    const TEMPLATING_PLUGIN_TYPE = "templating";
    /**
     * @var servicelocator
     */
    public $serviceLocator;
    /**
     * @var $pluginsTbl \MelisCore\Model\Tables\MelisPluginsTable
     */
    public $pluginsTbl;
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
        $melisConfig = $this->serviceLocator->get('config');
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
        $melisConfig = $this->serviceLocator->get('MelisCoreConfig');
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
                    $name = $plugin['datas']['name'];
                    $module = $plugin['forward']['module'];
                    $plugins[$module] = [];
                    if ($name != "dragdropzone") {
                        array_push($plugins[$module],$name);
                    }
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
    public function getPackagistCategories()
    {
        // get the marketplace sections for the modules
        $marketPlaceModuleCategories = @file_get_contents("http://marketplace.melisplatform.com/melis-packagist/get-package-group", true);
        // decode to make it an array
        $marketPlaceModuleCategories = json_decode($marketPlaceModuleCategories);
        $simplifiedModuleCategories = [];
        if (! empty($marketPlaceModuleCategories)) {
            // simplified data into one array
            foreach ($marketPlaceModuleCategories as $idx => $val) {
                // check category if it is empty
                $checkModuleSection = @file_get_contents("http://marketplace.melisplatform.com/melis-packagist/get-packages/page/1/search//item_per_page/0/order/asc/order_by//status/2/group/$val->mp_group_id");
                $checkModuleSection = json_decode($checkModuleSection);
                // we will not include section(s) does'nt have any modules under
                if (! empty($checkModuleSection->packages)) {
                    $simplifiedModuleCategories[$idx] = $val->mp_group_name;
                }
            }
        }

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
        $melisConfig = $this->serviceLocator->get('config');
        // get plugin config
        $pluginMenuHandlerDuration = $melisConfig['plugins']['meliscore']['datas']['new_plugin_notification']['menu_handler'] ?? "10";

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
        $melisConfig = $this->serviceLocator->get('config');
        // get plugin config
        $newPluginNotifInsideMenu = $melisConfig['plugins']['meliscore']['datas']['new_plugin_notification']['inside_menu'] ?? "10";
        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] =  $newPluginNotifInsideMenu;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_get_new_plugin_notif_menu_duration_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * @param $moduleName should be package name like (melis-cms, melis-core , melis-cms-slider)
     */
    public function isModulePublic($moduleName ,$pluginModuleChecking = false)
    {
        // get all melis public modules from packagist.org
        $melisPublicModules = @file_get_contents("https://packagist.org/packages/list.json?type=melisplatform-module", true);
        $publicModuleNames = [];
        if (! empty($melisPublicModules)) {
            // json_decode to make it an arrays
            $melisPublicModules = json_decode($melisPublicModules);
            $melisPublicModules = $melisPublicModules->packageNames;
            foreach ($melisPublicModules as $idx => $packageName) {
                // removed word 'melisplatform/' were dealing only package name or module name in package format
                $publicModuleNames[] = str_replace('melisplatform/',null,$packageName);
            }
        }
        $isModulePublic = false;
        // check if the given module name is in the public module names of melisplatform
        if (in_array($moduleName,$publicModuleNames)) {
            $isModulePublic = true;
        }
        // this is special case for plugin config which has different style of text but the same module like (meliscms,meliscommerce,meliscore)
        // convert all string to lower to be sure of exact match case
        if ($pluginModuleChecking) {
            $pluginConfigModuleName = strtolower($moduleName);
            // remove all '-' on the package name
            foreach ($publicModuleNames as $idx => $packageName) {
                $publicModuleNames[$idx] = str_replace('-',null,$packageName);
            }
            // check if the module is in public packages
            if (in_array($pluginConfigModuleName,$publicModuleNames)) {
                $isModulePublic = true;
            }
        }

        return $isModulePublic;
    }
    /**
     * @param $publicModuleName should be package name like (melis-cms, melis-core , melis-cms-slider)
     */
    public function getMelisPublicModuleSection($publicModuleName , $pluginModuleName = false)
    {
        $melisPublicModulesWithSection = @file_get_contents("http://marketplace.melisplatform.com/melis-packagist/get-package-list", true);
        $moduleSection = "";
        if (! empty($melisPublicModulesWithSection)) {
            // json_decode to make it an arrays
            $melisPublicModulesWithSection = json_decode($melisPublicModulesWithSection);
            foreach ($melisPublicModulesWithSection as $idx => $moduleInfo) {
                // remove 'melisplatform/' word
                $packageName = str_replace('melisplatform/',null,$moduleInfo->packageName);
                /*
                 * special case for plugin config of module name
                 */
                if ($pluginModuleName) {
                    // remove dashes
                    $packageName = str_replace('-',null,$packageName);
                }
                // convert string to lower
                $publicModuleName = strtolower($publicModuleName);
                if ($packageName == $publicModuleName) {
                    // set the module section
                    $moduleSection = $moduleInfo->packageSection;
                }
            }

        }

        return $moduleSection;
    }
    /**
     * @param $pluginModuleName if set to true then it will base like (meliscms,meliscore,meliscmsslider) if not  then like(melis-cms,melis-core,melis-cms-slider)
     */
    public function getMelisPublicModules($pluginModuleName = false,$dashboardPlugin = false)
    {
        $melisPublicModulesWithSection = @file_get_contents("http://marketplace.melisplatform.com/melis-packagist/get-package-list", true);
        $publicModules = [];
        if (! empty($melisPublicModulesWithSection)) {
            // json_decode to make it an arrays
            $melisPublicModulesWithSection = json_decode($melisPublicModulesWithSection);
            foreach ($melisPublicModulesWithSection as $idx => $moduleInfo) {
                // remove 'melisplatform/' word
                $packageName = str_replace('melisplatform/',null,$moduleInfo->packageName);
                /*
                 * special case for plugin config of module name
                 */
                if ($pluginModuleName) {
                    // remove dashes
                    $packageName = str_replace('-',null,$packageName);
                }
                if ($dashboardPlugin) {
                    $packageName = str_replace('-',null,implode('-', array_map('ucfirst', explode('-', $packageName))));
                }

                $publicModules[$packageName] = [
                    'section' => $moduleInfo->packageSection
                ];
            }
        }
        return $publicModules;
    }

}
