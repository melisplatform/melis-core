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
use Composer\Composer;
use Composer\IO\NullIO;
use Composer\Factory;
class MelisModuleManager
{
    /**
     * @return array
     */
    public static function getModules()
    {

        // This needs to be set when using MelisPlatform
        error_reporting(E_ALL & ~E_USER_DEPRECATED);
        if (empty(date_default_timezone_get()))
            date_default_timezone_set('Europe/Paris');
        
        $rootMelisSites = $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisSites';

        $modules = array();
        $docRoot = $_SERVER['DOCUMENT_ROOT'] ? $_SERVER['DOCUMENT_ROOT'] : '../..';
        $modulesMelisBackOffice = include $docRoot . '/../config/melis.module.load.php';

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
                $env             = getenv('MELIS_PLATFORM');
                $melisModuleName = getenv('MELIS_MODULE');

                // include in module load if Melis Module exists on this folder
                $modulePath      = $rootMelisSites . '/' . $melisModuleName;

                if(!file_exists($modulePath))
                    $modulePath =  self::getPackagePath($melisModuleName);


                $platformFile    = $docRoot . '/../config/autoload/platforms/'.$env.'.php';
                if($melisModuleName) {
                    $siteModuleLoad = $modulePath . '/config/module.load.php';
                    if(file_exists($siteModuleLoad) && file_exists($platformFile)) {
                        $modules = include $siteModuleLoad;
                    }
                    else {
                        $modules = $modulesMelisBackOffice;
                    }
                }

            }

        } else {
            $modules = array();
        }

        return $modules;
    }


    /**
     * Returns the compmoser class
     * @return Composer|null
     */
    private static function getComposer()
    {
        $composer = null;
        $docRoot  = self::docRoot();

        if (!isset($_ENV['COMPOSER_HOME'])) {
            putenv("COMPOSER_HOME=".$docRoot);
        }
        $factory = new Factory();

        $composer = $factory->createComposer(new NullIO());


        return $composer;
    }

    /**
     * Queries composer to get the package path of the module
     * @param $module
     * @return null|string
     */
    private static function getPackagePath($module)
    {
        $vendor   = self::docRoot().'vendor/';
        $packages = self::getComposer()->getRepositoryManager()->getLocalRepository();
        $package  = null;
        $module   = strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $module));
        $composer = self::docRoot().'composer.json';

        /**
         * Check if the composer.json exists
         */
        if(!file_exists($composer))
            return null;


        $packageName    = null;
        $packageVersion = null;
        $composer       = json_decode(file_get_contents($composer), true);

        /**
         * map the @module in composer.json file
         */
        if(isset($composer['require'])) {
            foreach($composer['require'] as $pkg => $version) {
                if(strrpos($pkg, $module) !== false) {
                    $packageName    = $pkg;
                    $packageVersion = $version;
                }
            }
        }

        if(!$packageName)
            return null;

        /**
         * Use the found @module to query composer in order to get
         * all the data from that module
         */
        $package = $packages->findPackage($packageName, $packageVersion);

        if(!$package)
            return null;

        /**
         * Get the package source
         */
        foreach($package->getRequires() as $req) {
            $source = $req->getsource();
        }

        $source = $vendor . $source;

        /**
         * Check whether the package source path exists
         */
        if(!file_exists($source))
            return null;

        return $source;

    }

    /**
     * Returns the document root of the current file
     * @return mixed|null|string
     */
    private static function docRoot()
    {
        $docRoot = dirname(__DIR__);
        $parts   = explode(DIRECTORY_SEPARATOR, $docRoot);
        $path = null;
        foreach($parts as $idx => $part) {
            $path .= $part . DIRECTORY_SEPARATOR;
            if($part == 'vendor')
                break;
        }
        $path = str_replace(DIRECTORY_SEPARATOR.'vendor', '', $path);
        return $path;
    }


}