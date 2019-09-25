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

        if (!empty($mScripts)){

            print 'Module scripts executed' . PHP_EOL;

            foreach ($mScripts As $module => $scripts){

                if (!$isCliReqs)
                    print '* <span style="color: #02de02">'. $module . ' scripts executed </span>' . PHP_EOL;
                else
                    print '* '. $module . ' scripts executed' . PHP_EOL;

                foreach ($scripts As $scrpts){
                    try{
                        require $scrpts;
                    }catch (\Exception $e){
                        print $e->getMessage();
                    }
                }
            }
        }else
            print 'No scripts executed' . PHP_EOL;

        print PHP_EOL;
    }
}
