<?php
/**
 * ModuleManager.php
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License v. 3.0
 * @file      ModuleManager.php
 * @link      http://github.com/melisplatform/melis-core the canonical source repo
 */

namespace MelisCore;

/**
 * ModuleManager
 *
 * @package    MelisCore
 * @license    https://opensource.org/licenses/OSL-3.0 Open Software License v. 3.0
 */
class ModuleManager
{
    /**
     * @return array
     */
    public static function getModules()
    {
        $rootMelisConfig =  MELIS_MODULE_CONFIG_FOLDER . '/MelisModuleConfig';
        $rootMelisSites = MELIS_MODULE_CONFIG_FOLDER . '/MelisSites';


        $modules = array();
        $modulesMelisBackOffice = include $rootMelisConfig . '/config/module.load.php';

        if (array_key_exists('REQUEST_URI', $_SERVER)) {
            $uri = $_SERVER['REQUEST_URI'];
            $uri1 = '';
            $tabUri = explode('/', $uri);
            if (!empty($tabUri[1]))
                $uri1 = $tabUri[1];

            if ($uri1 == 'melis' || !empty($_GET['melisSite']) || in_array($uri1, $modulesMelisBackOffice))
            {
                // Loading of the website needed for display in MelisCMS if needed
                // This won't be loaded except if asked from MelisFront
                if (!empty($_GET['melisSite']))
                {
                    if (is_file($rootMelisSites . '/' . $_GET['melisSite'] . '/config/module.load.php'))
                        $modules = array_merge($modulesMelisBackOffice, include $rootMelisSites . '/' . $_GET['melisSite'] . '/config/module.load.php');
                }
                else
                    $modules = $modulesMelisBackOffice;
            }
            else
            {
                $melisModuleName = getenv('MELIS_MODULE');
                // include in module load if Melis Module exists on this folder
                $modulePath = $rootMelisSites . '/' . $melisModuleName;
                $modules = include $modulePath . '/config/module.load.php';
            }
        } else {
            $modules = array();
        }
        return $modules;
    }
}