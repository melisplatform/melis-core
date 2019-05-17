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
        $melisConfig = $this->serviceLocator->get('config');
        $plugins = $melisConfig['plugins'];
        $dashboardPlugins = [];
        if (! empty($plugins)) {
            foreach ($plugins as $moduleName => $val) {
                // get dashboard plugins
                if (isset($val['dashboard_plugins']) && ! empty($val['dashboard_plugins'])) {
                    $dashboardPlugins[$moduleName] = [];
                    // dashboard plugins
                    foreach ($val['dashboard_plugins'] as $pluginName => $pluginConfig) {
                        if ($pluginName != "MelisCoreDashboardDragDropZonePlugin") {
                            // if pluginNameOnly is true then return only pluginNames
                            if ($pluginNameOnly) {
                                unset($dashboardPlugins[$moduleName]);
                                $dashboardPlugins[] = $pluginName;
                            } else {
                                array_push($dashboardPlugins[$moduleName],$pluginName);
                            }

                        }
                    }
                }
            }
            $results = $dashboardPlugins;
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
            // add 10 days
            $dateElapse    = strtotime("+10 day",strtotime($dateInstalled));
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
        $docRoot = $_SERVER['DOCUMENT_ROOT'] . "/marketplace-categories/";
        $data = [];
        if (file_exists($docRoot)) {
            // get the content of the file
            $data = unserialize(file_get_contents($docRoot. 'marketplace-categories.config.php' ));
        } else {
            if (!is_writable($_SERVER['DOCUMENT_ROOT'])) {
                // make the root directory writable
                chmod($_SERVER['DOCUMENT_ROOT'], 0777);
            }
            // create the directory
            mkdir($docRoot, 0777);
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
                // file name of the config
                $fileName = "marketplace-categories.config.php";
                // we will store a temporary file so that request must done only once from the server
                file_put_contents($docRoot . $fileName, serialize($simplifiedModuleCategories));
            }
            // run again the function
            $this->getPackagistCategories();
        }


        return $data;
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
                                if (isset($newPlugins['dashboard']) && is_array($newPlugins['dashboard'])) {
                                    array_push($newPlugins['dashboard'], $pluginName);
                                } else {
                                    $newPlugins[] = $pluginName;
                                }
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
                                if (isset($newPlugins['templating']) && is_array($newPlugins['templating'])) {
                                    array_push($newPlugins['templating'], $pluginName);
                                } else {
                                    $newPlugins[] = $pluginName;
                                }
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

}
