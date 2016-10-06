<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use Composer\Composer;
use Composer\Factory;
use Composer\IO\NullIO;
use Composer\Package\CompletePackage;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Config\Config;
use Zend\Config\Writer\PhpArray;

class MelisCoreModulesService implements ServiceLocatorAwareInterface 
{
    
    public $serviceLocator;

    /**
     * @var Composer
     */
    protected $composer;
    
    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }
    
    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }

    /**
     * @param Composer $composer
     * @return $this
     */
    public function setComposer(Composer $composer)
    {
        $this->composer = $composer;
        
        return $this;
    }

    /**
     * @return Composer
     */
    public function getComposer()
    {
        if (is_null($this->composer)) {
            // required by composer factory but not used to parse local repositories
            if (!isset($_ENV['COMPOSER_HOME'])) {
                putenv("COMPOSER_HOME=/tmp");
            }
            $factory = new Factory();
            $this->setComposer($factory->createComposer(new NullIO())); 
        }
        
        return $this->composer;
    }
    
    /**
     * Returns all the modules
     */
    public function getAllModules()
    {
        // Returns all the modules from both possible directories of modules
        $userModules = MELIS_MODULE_CONFIG_FOLDER;
        $modules = array();
        if($this->checkDir($userModules)) {
            $modules = array_merge($this->getDir($userModules), $this->getVendorModules());
        }
        
        return $modules;
    }

    /**
     * Returns all melisplatform-module packages loaded by composer
     * @return array
     */
    public function getVendorModules()
    {
        $repos = $this->getComposer()->getRepositoryManager()->getLocalRepository();
        
        $packages = array_filter($repos->getPackages(), function($package) {
            /** @var CompletePackage $package */
            return $package->getType()==='melisplatform-module' && array_key_exists('module-name', $package->getExtra());
        });
        
        $modules = array_map(function ($package) {
            /** @var CompletePackage $package */
            return $package->getExtra()['module-name'];
        }, $packages);
        
        sort($modules);
        
        return $modules;
    }
     
    /**
     * Returns all the important modules
     * @param array $excludeModulesOnReturn | exclude some modules that you don't want to be included in return
     * @return array
     */
    public function getCoreModules($excludeModulesOnReturn = array())
    {
        $modules = array(
            'meliscore' => 'MelisCore',
            'melisinstaller' => 'MelisInstaller',
            'melisengine' => 'MelisEngine',
            'melisfront' => 'MelisFront',
            'melissites' => 'MelisSites',
            'melismoduleconfig' => 'MelisModuleConfig',
        );
        
        if($excludeModulesOnReturn) {
            foreach($excludeModulesOnReturn as $exMod) {
                if(isset($modules[$exMod])  && $modules[$exMod]) {
                    unset($modules[$exMod]);
                }
            }
        }

        return $modules;
    }
    
    /**
     * Returns the full path of the module
     * @param String $moduleName
     */
    public function getModulePath($moduleName, $returnFullPath = true) 
    {
        $path = '';
        $userModules = MELIS_MODULE_CONFIG_FOLDER;
        if(in_array($moduleName, $this->getAllModules())) {
            if($this->checkDir($userModules.$moduleName)) {
                if(!$returnFullPath) {
                    $path = $userModules.$moduleName;
                }
                else {
                    $path = $_SERVER['DOCUMENT_ROOT'].'/../'.$userModules.$moduleName;
                }
            }
        }

        return $path;
    }
    
    /**
     * Returns all modules plugins that does not belong or treated as core modules
     * @return unknown[]
     */
    public function getModulePlugins($excludeModulesOnReturn = array())
    {
        $modules = array();
        $excludeModules = array_values($this->getCoreModules());
        foreach($this->getAllModules() as $module) {
            if(!in_array($module, array_merge($excludeModules,$excludeModulesOnReturn))) {
                $modules[] = $module;
            }
        }

        return $modules;
        
    }
    
    /**
     * Returns all the modules that has been created by Melis
     * @return array
     */
    public function getMelisModules()
    {
        $modules = array();
        foreach($this->getAllModules() as $module) {
            if(strpos($module, 'Melis') !== false || strpos($module, 'melis') !== false) {
                $modules[] = $module;
            }
        }
        
        return $modules;
    }
    
    /**
     * Creates module loader file
     * @param unknown $pathToStore
     */
    public function createModuleLoader($pathToStore, $modules = array(), $topModules = array('meliscore', 'melisfront', 'melisengine'), $bottomModules = array('melismoduleconfig'))
    {
        $tmpFileName = 'module.load.php.tmp';
        $fileName = 'module.load.php';
        if($this->checkDir($pathToStore)) {
            $coreModules = $this->getCoreModules();    
            $topModules = array_reverse($topModules);
            foreach($topModules as $module) {
                if(isset($coreModules[$module]) && $coreModules[$module]) {
                    array_unshift($modules, $coreModules[$module]);
                }
                else {
                    array_unshift($modules, $module);
                }
                
            }
            
            foreach($bottomModules as $module) {
                if(isset($coreModules[$module]) && $coreModules[$module]) {
                    array_push($modules, $coreModules[$module]);
                }
                else {
                    array_push($modules, $module);
                }
            }
            
            $config = new Config($modules, true);
            $writer = new PhpArray();
            $conf = $writer->toString($config);
            $conf = preg_replace('/    \d+/u', '', $conf); // remove the number index
            $conf = str_replace('=>', '', $conf); // remove the => characters.
            file_put_contents($pathToStore.'/'.$tmpFileName, $conf);
            
            if(file_exists($pathToStore.'/'.$tmpFileName)) {
                // check if the array is not empty
                $checkConfig = include($pathToStore.'/'.$tmpFileName);
                if(count($checkConfig) > 1) {
                    // delete the current module loader file
                    unlink($pathToStore.'/'.$fileName);
                    // rename the module loader tmp file into module.load.php
                    rename($pathToStore.'/'.$tmpFileName, $pathToStore.'/'.$fileName);
                    // if everything went well
                    return true;
                }
            }

        }
        
        return false;

    }
    
    /**
     * Returns all the modules that has been loaded in zend
     * @return unknown[]
     */
    public function getActiveModules()
    {
        $mm = $this->getServiceLocator()->get('ModuleManager');
        $loadedModules = array_keys($mm->getLoadedModules());
        $pluginModules = $this->getModulePlugins();
        $modules = array();
        foreach($loadedModules as $module) {
            if(in_array($module, $pluginModules)) {
                $modules[] = $module;
            }
        }
        
        
        return $modules;
    }
    
    /**
     * This will check if directory exists and it's a valid directory
     * @param unknown $dir
     */
    protected function checkDir($dir)
    {
        if(file_exists($dir) && is_dir($dir))
        {
            return true;
        }
        
        return false;
    }
    
    /**
     * Returns all the sub-folders in the provided path
     * @param String $dir
     * @param array $excludeSubFolders
     * @return array
     */
    protected function getDir($dir, $excludeSubFolders = array())
    {
        $directories = array();
        if(file_exists($dir)) {
            $excludeDir = array_merge(array('.', '..', '.gitignore'), $excludeSubFolders);
            $directory  = array_diff(scandir($dir), $excludeDir);
    
            foreach($directory as $d) {
                if(is_dir($dir.'/'.$d)) {
                    $directories[] = $d;
                }
            }
    
        }
    
        return $directories;
    }
}