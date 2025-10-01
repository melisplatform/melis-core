<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use Laminas\View\Model\JsonModel;
use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Laminas\View\Model\ViewModel;

class MelisCoreDashboardBubbleUpdatesPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }

    /**
     * Renders the dashboard bubble updates plugin
     * @return \Laminas\View\Model\ViewModel
     */
    public function updates()
    {
        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/bubble-updates');
        return $view;
    }

    public function getUpdates()
    {
        $moduleService = $this->getServiceManager()->get('MelisAssetManagerModulesService');

        $isAccessible = false;
        //make sure marketplace is loaded
        if($moduleService->isModuleLoaded('MelisMarketPlace')) {
            $result = $this->getController()->forward()->dispatch(
                'MelisMarketPlace\Controller\MelisMarketPlace',
                ['action' => 'isMarketplaceAccessible'])->getVariables();

            $isAccessible = $result['isMarketplaceAccessible'];
        }

        if(!$isAccessible){
            return new JsonModel([
                'data' => [],
                'count' => 0
            ]);
        }

        $requestJsonUrl = $this->getMelisPackagistServer() . '/get-packages/page/1/search//item_per_page/0/order/asc/order_by//status/2/group/';
        $serverPackages = [];
        $packagesData = [];
        $tmpData = [];
        $excludedModules = [
            'MelisAssetManager',
            'MelisComposerDeploy',
            'MelisDbDeploy',
            'MelisInstaller',
            'MelisCore',
            'MelisEngine',
            'MelisFront',
        ];

        $serverPackages = @file_get_contents($requestJsonUrl);
        try {
            $serverPackages = json_decode($serverPackages, true);
        } catch (\Exception $e) {
            $serverPackages = null;
        }

        if (is_array($serverPackages)) {
            foreach ($serverPackages['packages'] as $packagist => $packageVal) {
                $tmpData[] = [
                    'packageId' => $packageVal['packageId'],
                    'packageModuleName' => $packageVal['packageTitle'],
                    'latestVersion' => $packageVal['packageVersion'],
                    'packageName' => $packageVal['packageName'],
                    'groupName' => $packageVal['packageGroupName'],
                ];

                array_push($packagesData, $packageVal['packageModuleName']);
            }
        }

        $moduleList = $moduleService->getVendorModules();
        $moduleList = array_diff($moduleList, $excludedModules);

        $data = [];
        $count = 0;

        foreach ($moduleList as $module => $moduleName) {

            $version = null;
            $packageId = null;
            $packageName = null;
            $groupName = null;
            $currentVersion = null;

            for ($i = 0; $i < count($tmpData); $i++) {

                $moduleVersion = $moduleService->getModulesAndVersions($moduleName);

                if ($moduleVersion['package'] == $tmpData[$i]['packageName']) {

                    $version = $tmpData[$i]['latestVersion'];
                    $packageId = $tmpData[$i]['packageId'];
                    $packageName = $tmpData[$i]['packageModuleName'];
                    $groupName = $tmpData[$i]['groupName'];
                    $currentVersion = $moduleVersion['version'];
                }
            }
            //Get the version difference of local modules from repo modules
            $status = 0;
            if($this->getServiceManager()->has('MelisMarketPlaceService')) {//Make sure marketplace service is active (Marketplace module is not deactivated)
                $marketplaceService = $this->getServiceManager()->get('MelisMarketPlaceService');
                $status = $marketplaceService->compareLocalVersionFromRepo($moduleName, $version);
            }

            $data[] = [
                'module_name' => $packageName,
                'latestVersion' => $version,
                'status' => $status,
                'packageId' => $packageId,
                'groupName' => $groupName,
                'currentVersion' => $currentVersion,
            ];

            if ((int) $status == -1) {
                $count++;
            }
        }

        return new JsonModel([
            'data' => $data,
            'count' => $count
        ]);
    }

    private function getMelisPackagistServer()
    {
        $env = getenv('MELIS_PLATFORM') ?: 'default';
        $config = $this->getServiceManager()->get('MelisConfig');
        $server = $config->getItem('melismarketplace_toolstree_section/datas/')['melis_packagist_server'];

        if ($server) {
            return $server;
        }
    }
}