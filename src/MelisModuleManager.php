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

use MelisComposerDeploy\MelisComposer;

/**
 * ModuleManager
 *
 * @package    MelisCore
 * @license    https://opensource.org/licenses/OSL-3.0 Open Software License v. 3.0
 */
class MelisModuleManager
{
    /**
     * Modules module load file
     */
    const MODULE_LOAD_FILE = 'config/module.load.php';

    /**
     * Retrieve Activated module components
     * and placed on top of the modules
     * @return array
     */
    public static function getModuleComponents()
    {
        $composer = new MelisComposer();

        $moduleComponents = [];

        foreach (self::getModules() As $module) {
            // Checking module path from composer
            $modulePath = $composer->getComposerModulePath($module);

            if (php_sapi_name() == "cli") 
                $modulePath = realpath(__DIR__ .'/../../../..' . $modulePath);

            if (!empty($module) && file_exists($modulePath . DIRECTORY_SEPARATOR . self::MODULE_LOAD_FILE)) {
                $moduleComponents = array_merge($moduleComponents , include $modulePath . DIRECTORY_SEPARATOR . self::MODULE_LOAD_FILE);
            } else {
                // Check module/ dir if module has module.load
                if (file_exists('/module/' . $module . DIRECTORY_SEPARATOR . self::MODULE_LOAD_FILE)) {
                    $moduleComponents = array_merge($moduleComponents, include '/module/'.$module. DIRECTORY_SEPARATOR .self::MODULE_LOAD_FILE);
                }
            }
        }

        return $moduleComponents;
    }

    /**
     * Retrieve Activated modules from vendor/melisplatform
     * and module/
     * @return array
     */
    public static function getModules()
    {
        $assetsModuleSrv = new \MelisAssetManager\Service\MelisModulesService();

        $docRoot = __DIR__ .'/../../../../';

        if (file_exists($docRoot. 'config/development.config.php')){
            // Development mode will show all errors
            error_reporting(E_ALL);
        } else {
            // This needs to be set when using MelisPlatform
            error_reporting(E_ALL & ~E_USER_DEPRECATED & !E_WARNING);
        }

        if (empty(date_default_timezone_get()))
            date_default_timezone_set('Europe/Paris');

        $rootMelisSites = $docRoot . 'module/MelisSites';

        $modules = array();
        $modulesMelisBackOffice = include $docRoot . 'config/melis.module.load.php';

        if (array_key_exists('REQUEST_URI', $_SERVER)) {

            $uri = $_SERVER['REQUEST_URI'];
            $uri1 = '';
            $tabUri = explode('/', $uri);
            if (!empty($tabUri[1]))
                $uri1 = $tabUri[1];

            $melisSite = self::sanitize($_GET['melisSite'] ?? null);

            if ($uri1 == 'melis' || !empty($melisSite) || in_array($uri1, $modulesMelisBackOffice))
            {
                // Loading of the website needed for display in MelisCMS if needed
                // This won't be loaded except if asked from MelisFront
                if (!empty($melisSite))
                {
                    if (file_exists($siteModuleLoad = $rootMelisSites . '/' . $melisSite . '/config/module.load.php') || 
                        file_exists($siteModuleLoad = $assetsModuleSrv->getComposerModulePath($melisSite).'/config/module.load.php')
                    ) {
                        $modules = array_merge($modulesMelisBackOffice, include $siteModuleLoad);
                    }else{
                        /**
                         * load the default modules if $melisSite
                         * is not found
                         */
                        $modules = $modulesMelisBackOffice;
                    }

                }
                else
                    $modules = $modulesMelisBackOffice;
            }
            else
            {
                $env             = getenv('MELIS_PLATFORM');
                $melisModuleName = getenv('MELIS_MODULE');
                // include in module load if Melis Module exists on this folder
                $modulePath      = $rootMelisSites . '/' . $melisModuleName;
                $platformFile    = $docRoot . 'config/autoload/platforms/'.$env.'.php';
                if($melisModuleName) {
                    $siteModuleLoad = $modulePath . '/config/module.load.php';
                    if (!file_exists($siteModuleLoad)) {
                        $siteModuleLoad = $assetsModuleSrv->getComposerModulePath($melisModuleName).'/config/module.load.php';
                    }

                    if (file_exists($siteModuleLoad) && file_exists($platformFile) ) {
                        $modules = include $siteModuleLoad;
                    }
                    else {
                        $modules = $modulesMelisBackOffice;
                    }
                }
            }

        } else {

            if (php_sapi_name() == "cli")
                $modules = $modulesMelisBackOffice;
            else
                $modules = [];
        }

        return $modules;
    }

    /**
     * Sanitizes or recursively sanitizes a value
     * @param $input
     * @param array $skip
     * @param bool $textOnly
     * @param bool $removeFunctions
     * @return array|mixed|string
     */
    public static function sanitize($input, $skip = [], $textOnly = false, $removeFunctions = true)
    {
        if(!is_array($input)) {
            if(true === $removeFunctions) {
                $input   = preg_replace('/[a-zA-Z][a-zA-Z0-9_]+(\()+([a-zA-Z0-9_\-$,\s\"]?)+(\))(\;?)/', '', $input);
            }

            $invalidValues = ['exec', '\\', '&amp;', '&#', '0x', '<script>', '</script>', '">', "'>"];
            $allowableTags = '<p><br><img><label><input><textarea><div><span><a><strong><i><u>';
            $input         = str_replace($invalidValues, '', $input);
            $input         = preg_replace('/%[a-zA-Z0-9]{2}/', '', $input);
            $input         = strip_tags(trim($input), $allowableTags);

            if($textOnly) {
                $input   = str_replace(['<', '>', "'", '"'], '', $input);
            }

            return $input;
        }
        else {

            $array = [];

            foreach($input as $key => $item) {

                if(in_array($key, $skip))
                    $array[$key] = $item;
                else {
                    if(!is_array($item))
                        $array[$key] = self::sanitize($item, $skip, $textOnly, $removeFunctions);
                    else
                        $array = array_merge($array, [$key => self::sanitize($item, $skip, $textOnly, $removeFunctions)]);
                }
            }

            return $array;
        }
    }

}
