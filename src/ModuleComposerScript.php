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
 * ModuleComposerScript
 *
 * @package    MelisCore
 * @license    https://opensource.org/licenses/OSL-3.0 Open Software License v. 3.0
 */
class ModuleComposerScript
{
    private static $serviceManager = null;
    private static $noPrint = false;

    public static function setNoPrint()
    {
        self::$noPrint = true;
    }

    public static function setServiceManager($serviceManger)
    {
        self::$serviceManager = $serviceManger;
    }

    private static function translate($text)
    {
        if (!is_null(self::$serviceManager))
            return self::$serviceManager->get('translator')->translate('tr_melis_core_composer_scrpts_'.$text);
        else
            return $text;
    }

    /**
     * This method execute php scripts in the specified directory /install/scripts
     */
    public static function executeScripts()
    {
        $isCliReqs = php_sapi_name() == 'cli' ? true : false;

        $melisPlatformPath =  $isCliReqs ? 'vendor/melisplatform/' : $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/';

        $dirs = array_filter(glob($melisPlatformPath.'*'), 'is_dir');

        $mScripts = [];
        foreach($dirs As $module){

            // Pre Autoload dump scripts
            $moduleScriptsDir =  $module.'/install/scripts/';

            if(is_dir($moduleScriptsDir)){

                $moduleScripts = array_filter(glob($moduleScriptsDir.'/*'), 'is_file');

                if(!empty($moduleScripts)){
                    // Executing scripts
                    foreach($moduleScripts As $scripts){
                        $moduleName = explode('/', $module);
                        $moduleName = $moduleName[count($moduleName)-1];
                        $moduleName = str_replace('-', '', implode('-', array_map('ucfirst', explode('-', $moduleName))));

                        $mScripts[$moduleName][] = $scripts;
                    }
                }
            }
        }

        $result = [];

        if (!empty($mScripts)){

            if (!self::$noPrint)
                print self::translate('Module scripts executed') . PHP_EOL;

            foreach ($mScripts As $module => $scripts){

                if (!self::$noPrint)
                    if (!$isCliReqs)
                        print '* <span style="color: #02de02">'. sprintf(self::translate('scripts executed'), $module) .'  </span>' . PHP_EOL;
                    else
                        print '* '. sprintf(self::translate('scripts executed'), $module) . PHP_EOL;

                foreach ($scripts As $scrpts){
                    try{
                        $result[$module][$scrpts] = require $scrpts;
                    }catch (\Exception $e){
                        print $e->getMessage();
                    }
                }
            }
        }else
            if (!self::$noPrint)
                print self::translate('No scripts executed') . PHP_EOL;

        if (!self::$noPrint)
            print PHP_EOL;

        return $result;
    }


}
