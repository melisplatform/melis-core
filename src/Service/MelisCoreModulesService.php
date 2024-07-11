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
use Laminas\Config\Config;
use Laminas\Config\Writer\PhpArray;
use Laminas\Session\Container;
use MelisCore\Controller\ModulesController;
use MelisCore\View\Helper\MelisCoreHeadPluginHelper;
use MatthiasMullie\Minify;

class MelisCoreModulesService extends MelisServiceManager
{
    private const MELIS_SITES_FOLDER = 'MelisSites';

    /**
     * @var Composer
     */
    protected $composer;

    /**
     * Returns the module name, module package, and its' version
     *
     * @param null $moduleName - provide the module name if you want to get the package specific information
     *
     * @return array
     */
    public function getModulesAndVersions($moduleName = null)
    {
        $tmpModules = [];

        $melisComposer = new \MelisComposerDeploy\MelisComposer();
        $melisInstalledPackages = $melisComposer->getInstalledPackages();

        foreach ($melisInstalledPackages as $package) {
            $packageModuleName = isset($package->extra) ? (array)$package->extra : null;
            $module = null;
            if (isset($packageModuleName['module-name'])) {
                $module = $packageModuleName['module-name'];
            }

            if ($module) {
                $tmpModules[$module] = [
                    'package' => $package->name,
                    'module' => $module,
                    'version' => $package->version,
                ];

                if ($module == $moduleName) {
                    break;
                }
            }

        }

        $userModules = $this->getUserModules();
        $exclusions = ['MelisModuleConfig', 'MelisSites'];

        foreach ($userModules as $module) {
            if (!in_array($module, $exclusions)) {
                $class = $_SERVER['DOCUMENT_ROOT'] . '/../module/' . $module . '/Module.php';
                $class = file_get_contents($class);

                $package = $module;
                $version = '1.0';

                if (preg_match_all('/@(\w+)\s+(.*)\r?\n/m', $class, $matches)) {

                    $result = array_combine($matches[1], $matches[2]);
                    $version = isset($result['version']) ? $result['version'] : '1.0';
                    $package = isset($result['module']) ? $result['module'] : $module;

                }
                $tmpModules[$package] = [
                    'package' => $package,
                    'module' => $package,
                    'version' => $version,
                ];

            }
        }


        $modules = $tmpModules;


        if (!is_null($moduleName)) {
            return isset($modules[$moduleName]) ? $modules[$moduleName] : null;
        }

        return $modules;
    }

    /**
     * @return \Composer\Composer
     */
    public function getComposer()
    {
        if (is_null($this->composer)) {
            $composer = new \MelisComposerDeploy\MelisComposer();
            $this->composer = $composer->getComposer();
        }

        return $this->composer;
    }

    /**
     * @param Composer $composer
     *
     * @return $this
     */
    public function setComposer(Composer $composer)
    {
        $this->composer = $composer;

        return $this;
    }

    /**
     * @return array
     */
    public function getUserModules()
    {
        $userModules = $_SERVER['DOCUMENT_ROOT'] . '/../module';

        $modules = [];
        if ($this->checkDir($userModules)) {
            $modules = $this->getDir($userModules);
        }

        /**
         * Check if the folder(module) is valid. Current check(s) applied:
         *  - has "Module.php" file?
         */
        foreach ($modules as $moduleIndex => $module) {
            $modulePath = $userModules . DIRECTORY_SEPARATOR . $module . DIRECTORY_SEPARATOR;

            if ($module === self::MELIS_SITES_FOLDER) {
                /** skip check */
                continue;
            }

            if (!is_file($modulePath . "Module.php")) {
                /** Module.php file was not found - remove module from the list */
                unset($modules[$moduleIndex]);
            }
        }

        return $modules;
    }

    /**
     * This will check if directory exists and it's a valid directory
     *
     * @param $dir
     *
     * @return bool
     */
    protected function checkDir($dir)
    {
        if (file_exists($dir) && is_dir($dir)) {
            return true;
        }

        return false;
    }

    /**
     * Returns all the sub-folders in the provided path
     *
     * @param String $dir
     * @param array $excludeSubFolders
     *
     * @return array
     */
    protected function getDir($dir, $excludeSubFolders = [])
    {
        $directories = [];
        if (file_exists($dir)) {
            $excludeDir = array_merge(['.', '..', '.gitignore'], $excludeSubFolders);
            $directory = array_diff(scandir($dir), $excludeDir);

            foreach ($directory as $d) {
                if (is_dir($dir . '/' . $d)) {
                    $directories[] = $d;
                }
            }

        }

        return $directories;
    }

    /**
     * @return array
     */
    public function getSitesModules()
    {
        $userModules = $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisSites';

        $modules = [];
        if ($this->checkDir($userModules)) {
            $modules = $this->getDir($userModules);
        }

        return $modules;
    }

    /**
     * Returns all the modules that has been created by Melis
     *
     * @return array
     */
    public function getMelisModules()
    {
        $modules = [];
        foreach ($this->getAllModules() as $module) {
            if (strpos($module, 'Melis') !== false || strpos($module, 'melis') !== false) {
                $modules[] = $module;
            }
        }

        return $modules;
    }

    /**
     * Returns all the modules
     */
    public function getAllModules()
    {
        return array_merge($this->getUserModules(), $this->getVendorModules());
    }

    /**
     * Returns all melisplatform-module packages loaded by composer
     * @return array
     */
    public function getVendorModules()
    {
        $melisComposer = new \MelisComposerDeploy\MelisComposer();
        $melisInstalledPackages = $melisComposer->getInstalledPackages();

        $packages = array_filter($melisInstalledPackages, function ($package) {

            $type = $package->type;
            $extra = $package->extra ?? [];
            $isMelisModule = true;

            if (!empty($extra)) {

                if (property_exists($extra, 'melis-module')) {
                    $key = 'melis-module';
                    if (!$extra->$key)
                        $isMelisModule = false;
                }

                /** @var CompletePackage $package */
                return $type === 'melisplatform-module' &&
                    property_exists($extra, 'module-name') && $isMelisModule;
            }
        });

        $modules = array_map(function ($package) {
            $extra = (array)$package->extra;
            /** @var CompletePackage $package */
            return $extra['module-name'];
        }, $packages);

        sort($modules);

        return $modules;
    }

    /**
     * Returns an array of modules or packages that is dependent to the module name provided
     *
     * @param $moduleName
     * @param bool $convertPackageNameToNamespace
     * @param bool $getOnlyActiveModules - returns only the active modules
     *
     * @return array
     */
    public function getChildDependencies($moduleName, $convertPackageNameToNamespace = true, $getOnlyActiveModules = true)
    {
        $modules = $this->getAllModules();
        $matchModule = $convertPackageNameToNamespace ? $moduleName : $this->convertToPackageName($moduleName);
        $dependents = [];

        foreach ($modules as $module) {
            $dependencies = $this->getDependencies($module, $convertPackageNameToNamespace);

            if ($dependencies) {
                if (in_array($matchModule, $dependencies)) {
                    $dependents[] = $convertPackageNameToNamespace ? $module : $this->convertToPackageName($module);
                }
            }
        }

        if (true === $getOnlyActiveModules) {

            $activeModules = $this->getActiveModules();
            $modules = [];

            foreach ($dependents as $module) {
                $modules[] = $module;
            }

            $dependents = $modules;
        }

        return $dependents;
    }

    /**
     * convert module name into package name, example: MelisCore will become melis-core
     *
     * @param $module
     *
     * @return string
     */
    private function convertToPackageName($module)
    {
        $moduleName = strtolower(preg_replace('/([a-zA-Z])(?=[A-Z])/', '$1-', $module));

        return $moduleName;
    }

    /**
     * Returns the dependencies of the module
     *
     * @param $moduleName
     * @param bool $convertPackageNameToNamespace - set to "true" to convert all package name into their actual Module name
     *
     * @return array
     */
    public function getDependencies($moduleName, $convertPackageNameToNamespace = true)
    {
        $modulePath = $this->getModulePath($moduleName);
        $dependencies = [];

        if ($modulePath) {

            $defaultDependencies = ['melis-core'];
            $dependencies = $defaultDependencies;
            $composerPossiblePath = [$modulePath . '/composer.json'];
            $composerFile = null;

            // search for the composer.json file
            foreach ($composerPossiblePath as $file) {
                if (file_exists($file)) {
                    $composerFile = file_get_contents($file);
                }
            }

            // if composer.json is found
            if ($composerFile) {

                $composer = json_decode($composerFile, true);
                $requires = isset($composer['require']) ? $composer['require'] : null;
                if ($requires) {
                    $requires = array_map(function ($a) {
                        // remove melisplatform prefix
                        return str_replace(['melisplatform/', ' '], '', trim($a));
                    }, array_keys($requires));

                    $dependencies = $requires;
                }
            }

            if ($convertPackageNameToNamespace) {
                $tmpDependencies = [];
                $toolSvc = $this->getServiceManager()->get('MelisCoreTool');

                foreach ($dependencies as $dependency) {
                    $tmpDependencies[] = ucfirst($toolSvc->convertToNormalFunction($dependency));
                }

                $dependencies = $tmpDependencies;
            }
        }

        return $dependencies;
    }

    /**
     * Returns the full path of the module
     *
     * @param $moduleName
     * @param bool $returnFullPath
     *
     * @return string
     */
    public function getModulePath($moduleName, $returnFullPath = true)
    {
        $path = $this->getUserModulePath($moduleName, $returnFullPath);
        if ($path == '') {
            $path = $this->getComposerModulePath($moduleName, $returnFullPath);
        }

        return $path;
    }

    public function getUserModulePath($moduleName, $returnFullPath = true)
    {
        $path = '';
        $userModules = $_SERVER['DOCUMENT_ROOT'] . '/../';

        if (in_array($moduleName, $this->getUserModules())) {
            if ($this->checkDir($userModules . 'module/' . $moduleName)) {
                if (!$returnFullPath) {
                    $path = '/module/' . $moduleName;
                } else {
                    $path = $userModules . 'module/' . $moduleName;
                }
            }
        }

        return $path;
    }

    /**
     * Get site path
     *
     * @param $siteName
     * @param bool $returnFullPath
     * @return string
     */
    public function getUserSitePath($siteName, $returnFullPath = true)
    {
        $path = '';
        $melisSitesPath = $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisSites';

        if ($this->checkDir($melisSitesPath . DIRECTORY_SEPARATOR . $siteName)) {
            if (!$returnFullPath) {
                $path = '/MelisSites/' . $siteName;
            } else {
                $path = $melisSitesPath . '/' . $siteName;
            }
        }

        return $path;
    }

    public function getComposerModulePath($moduleName, $returnFullPath = true)
    {
        $melisComposer = new \MelisComposerDeploy\MelisComposer();
        return $melisComposer->getComposerModulePath($moduleName, $returnFullPath);
    }

    /**
     * Returns all the modules that has been loaded in laminas
     *
     * @param array $exclude
     *
     * @return array
     */
    public function getActiveModules($exclude = [])
    {
        $mm = $this->getServiceManager()->get('ModuleManager');
        $loadedModules = array_keys($mm->getLoadedModules());
        $pluginModules = $this->getModulePlugins();
        $modules = [];
        foreach ($loadedModules as $module) {
            if (in_array($module, $pluginModules)) {
                if (!in_array($module, $exclude)) {
                    $modules[] = $module;
                }
            }
        }

        return $modules;
    }

    /**
     * Returns all modules plugins that does not belong or treated as core modules
     *
     * @param array $excludeModulesOnReturn
     *
     * @return array
     */
    public function getModulePlugins($excludeModulesOnReturn = [])
    {
        $modules = [];
        $excludeModules = array_values($this->getCoreModules());
        foreach ($this->getAllModules() as $module) {
            if (!in_array($module, array_merge($excludeModules, $excludeModulesOnReturn))) {
                $modules[] = $module;
            }
        }

        return $modules;

    }

    /**
     * Returns all the important modules
     *
     * @param array $excludeModulesOnReturn | exclude some modules that you don't want to be included in return
     *
     * @return array
     */
    public function getCoreModules($excludeModulesOnReturn = [])
    {
        $modules = [
            'melisdbdeploy' => 'MelisDbDeploy',
            'meliscomposerdeploy' => 'MelisComposerDeploy',
            'meliscore' => 'MelisCore',
            'melisinstaller' => 'MelisInstaller',
            'melissites' => 'MelisSites',
            'melisassetmanager' => 'MelisAssetManager',
        ];

        if ($excludeModulesOnReturn) {
            foreach ($excludeModulesOnReturn as $exMod) {
                if (isset($modules[$exMod]) && $modules[$exMod]) {
                    unset($modules[$exMod]);
                }
            }
        }

        return $modules;
    }

    /**
     * This method activating a single module
     * and store to the module.load.php of the platform
     *
     * @param $module
     *
     * @return bool
     */
    public function activateModule(
        $module,
        $defaultModules = ['MelisAssetManager', 'MelisComposerDeploy', 'MelisDbDeploy', 'MelisCore'],
        $excludeModule = ['MelisModuleConfig'])
    {
        // Default melis modules
        $activeModules = $this->getActiveModules($defaultModules);

        // Removing "MelisModuleConfig" if exist on activated modules
        foreach ($activeModules as $key => $mod) {
            if (in_array($mod, $excludeModule)) {
                unset($activeModules[$key]);
            }
        }

        array_push($activeModules, $module);

        // Creating/updating module.load.php including new module
        return $this->createModuleLoader('config/', $activeModules, $defaultModules);
    }

    /**
     * Creates module loader file
     *
     * @param $pathToStore
     * @param array $modules
     * @param array $topModules
     * @param array $bottomModules
     *
     * @return bool
     */
    public function createModuleLoader($pathToStore, $modules = [],
                                       $topModules = ['melisassetmanager', 'melisdbdeploy', 'meliscomposerdeploy', 'meliscore'],
                                       $bottomModules = ['MelisModuleConfig'])
    {
        $moduleSrv = $this->getServiceManager()->get('MelisAssetManagerModulesService');
        return $moduleSrv->createModuleLoader($pathToStore, $modules, $topModules, $bottomModules);
    }

    /**
     * @param $module
     *
     * @return bool
     */
    public function loadModule($module)
    {
        if (!in_array($module, $this->getActiveModules())) {
            $moduleLoadFile = $_SERVER['DOCUMENT_ROOT'] . '/../config/melis.module.load.php';
            if (file_exists($moduleLoadFile)) {
                $modules = include $_SERVER['DOCUMENT_ROOT'] . '/../config/melis.module.load.php';

                $moduleCount = count($modules);
                $insertAtIdx = $moduleCount - 1;
                array_splice($modules, $insertAtIdx, 0, $module);

                // create the module.load file
                $this->createModuleLoader('config/', $modules, [], []);
            }
        }

        return $this->isModuleLoaded($module);
    }

    /**
     * @param $module
     *
     * @return bool
     */
    public function unloadModule($module)
    {
        if (in_array($module, $this->getActiveModules())) {
            $moduleLoadFile = $_SERVER['DOCUMENT_ROOT'] . '/../config/melis.module.load.php';
            if (file_exists($moduleLoadFile)) {
                $modules = include $_SERVER['DOCUMENT_ROOT'] . '/../config/melis.module.load.php';
                foreach ($modules as $idx => $loadedModule) {
                    if ($loadedModule === $module) {
                        unset($modules[$idx]);
                        break;
                    }
                }

                $this->createModuleLoader('config/', $modules, [], []);
            }
        }

        return !$this->isModuleLoaded($module);
    }

    /**
     * @param $module
     *
     * @return bool
     */
    public function isModuleLoaded($module)
    {
        $modules = include $_SERVER['DOCUMENT_ROOT'] . '/../config/melis.module.load.php';
        if (in_array($module, $modules)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param $module
     *
     * @return bool
     */
    public function isSiteModule($module)
    {
        $melisComposer = new \MelisComposerDeploy\MelisComposer();
        $packages = $melisComposer->getInstalledPackages();

        $repo = null;

        foreach ($packages as $package) {
            $packageModuleName = isset($package->extra) ? (array)$package->extra : null;

            if (isset($packageModuleName['module-name']) && $packageModuleName['module-name'] == $module) {
                $repo = (array)$package->extra;
                break;
            }
        }

        if (isset($repo['melis-site'])) {
            return (bool)$repo['melis-site'] ?? false;
        }

        return false;
    }

    /**
     * Merge all assets into one
     */
    public function generateBundle()
    {
        ini_set('max_execution_time', '0');

        $webPack = $this->getServiceManager()->get('MelisAssetManagerWebPack');
        $assets = $webPack->getAssets(false);

        if (!empty($assets)) {
            foreach ($assets as $type => $files) {
                $vendorFileHolder = [];
                $moduleFileHolder = [];
                $moduleFileHolderAlreadyBundled = [];
                /**
                 * We will separate all the already bundle file
                 * and for those who are in vendor and in module
                 * so we can re bundle the assets inside module folder in case
                 * its not yet bundled
                 */
                $this->segregateFiles($files, $moduleFileHolder, $vendorFileHolder, $moduleFileHolderAlreadyBundled);
                /**
                 * Lets minify all unminified files from module folder
                 */
                $arrayPaths = [];
                if ($type == 'css')
                    $this->minifyCss($moduleFileHolder, $arrayPaths);
                elseif ($type == 'js')
                    $this->minifyJs($moduleFileHolder, $arrayPaths);

                /**
                 * We merge all bundled files
                 */
                $allAssets = array_merge($vendorFileHolder, $moduleFileHolderAlreadyBundled, $arrayPaths);
                /**
                 * Combine all
                 */
                $this->combineAssets($allAssets, $type);
            }

            /**
             * Lets bundle the login assets
             */
            $this->bundleLoginAssets();

            /**
             * Copy needed assets
             */
            $this->copyNeededAssets();

            //save bundle cache time
            $platformTable = $this->getServiceManager()->get('MelisCoreTablePlatform');
            $platformData = $platformTable->getEntryByField('plf_name', getenv('MELIS_PLATFORM'))->current();

            if (!empty($platformData)) {
                $platformTable->save(['plf_bundle_cache_time' => time()], $platformData->plf_id);
            }
        }
    }

    /**
     * Function to bundle all login page assets
     */
    private function bundleLoginAssets()
    {
        $plugin = new MelisCoreHeadPluginHelper();
        $plugin->setServiceManager($this->getServiceManager());
        $assets = $plugin->__invoke('/meliscore_login');

        if (!empty($assets)) {
            foreach ($assets as $type => $files) {
                $vendorFileHolder = [];
                $moduleFileHolder = [];
                $moduleFileHolderAlreadyBundled = [];
                /**
                 * We will separate all the already bundle file
                 * and for those who are in vendor and in module
                 * so we can re bundle the assets inside module folder in case
                 * its not yet bundled
                 */
                $this->segregateFiles($files, $moduleFileHolder, $vendorFileHolder, $moduleFileHolderAlreadyBundled);
                /**
                 * Lets minify all unminified files from module folder
                 */
                $arrayPaths = [];
                if ($type == 'css')
                    $this->minifyCss($moduleFileHolder, $arrayPaths);
                elseif ($type == 'js')
                    $this->minifyJs($moduleFileHolder, $arrayPaths);

                /**
                 * We merge all bundled files
                 */
                $allAssets = array_merge($vendorFileHolder, $moduleFileHolderAlreadyBundled, $arrayPaths);
                /**
                 * Combine all
                 */
                $this->combineAssets($allAssets, $type, 'bundle-all-login');
            }
        }
    }

    /**
     *
     * We will separate all the already bundle file
     * and for those who are in vendor and in module
     * so we can re bundle the assets inside module folder in case
     * its not yet bundled
     *
     * @param $assets
     * @param $moduleFileHolder
     * @param $vendorFileHolder
     * @param $moduleFileHolderAlreadyBundled
     */
    private function segregateFiles($assets, &$moduleFileHolder, &$vendorFileHolder, &$moduleFileHolderAlreadyBundled)
    {
        $melisAppConfig = $this->serviceManager->get('MelisConfig');
        $assetManagerService = $this->getServiceManager()->get('MelisAssetManagerModulesService');

        foreach ($assets as $key => $val) {
            $filePath = explode('/', $val);
            $modulePath = $assetManagerService->getModulePath($filePath[1], false);
            if (!empty($modulePath)) {
                $moduleFilePart = explode('/', $modulePath);
                if (!empty($moduleFilePart)) {
                    if ($moduleFilePart[1] == 'module') {//in module
                        //check if bundle is enable
                        $appsConfig = $melisAppConfig->getItem(end($moduleFilePart));
                        if (empty($appsConfig))
                            $appsConfig = $melisAppConfig->getItem(strtolower(end($moduleFilePart)));

                        if (!empty($appsConfig)) {
                            if (isset($appsConfig['ressources']['build']['disable_bundle'])) {
                                if (!$appsConfig['ressources']['build']['disable_bundle']) {
                                    $moduleFileHolderAlreadyBundled[] = $val;
                                } else {
                                    $moduleFileHolder[end($moduleFilePart)][] = $val;
                                }
                            } else {
                                $moduleFileHolder[end($moduleFilePart)][] = $val;
                            }
                        }
                    } else {//in vendor
                        $vendorFileHolder[] = $val;
                    }
                }
            } else {//for special url like get-translations
                if (!empty($val))
                    $vendorFileHolder[] = $val;
            }
        }
    }

    /**
     * @param $array
     * @param $type
     * @param string $fileName
     */
    private function combineAssets($array, $type, $fileName = 'bundle-all')
    {
        if (!empty($array)) {
            $contentString = '';
            foreach ($array as $key => $val) {
                $url = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]" . $val;
                $cleanString = $this->getFileContent($url, false);//file_get_contents($url);
                if ($type == 'css') {
                    $cleanString = $this->replaceURL($cleanString, $val);
                } elseif ($type == 'js') {//make sure it ends with `;` to avoid problem on combining
                    if (!str_ends_with($cleanString, ';')) {
                        $cleanString .= ';';
                    }
                }

                $contentString .= $cleanString;
            }

            $path = $this->createDIR($type);
            $file = @fopen($path . '/' . $fileName . '.' . $type, 'w+');
            @fwrite($file, $contentString);
            @fclose($file);
        }
    }

    /**
     * @param $array
     * @param $arrayPaths
     */
    private function minifyJs($array, &$arrayPaths)
    {
        if (!empty($array)) {
            foreach ($array as $moduleName => $jsFiles) {
                $jsMinifier = new Minify\JS();
                $hostName = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]";
                foreach ($jsFiles as $key => $js) {
                    $url = $hostName . $js;
                    $jsMinifier->add($this->getFileContent($url));
                }
                $path = $this->createDIR('js');
                $path = $path . '/bundle-' . $moduleName . '.js';
                $jsMinifier->minify($path);
                $arrayPaths[] = '/' . ModulesController::BUNDLE_FOLDER_NAME . '/js/bundle-' . $moduleName . '.js';
            }
        }
    }

    /**
     * @param $array
     * @param $arrayPaths
     */
    private function minifyCss($array, &$arrayPaths)
    {
        if (!empty($array)) {

            foreach ($array as $moduleName => $cssFiles) {
                $cssMinifier = new Minify\CSS();
                $hostName = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]";
                foreach ($cssFiles as $key => $css) {
                    $url = $hostName . $css;
                    /**
                     * This will replace all url inside css to put the correct url
                     */
                    $fileContent = $this->replaceURL($this->getFileContent($url), $css);
                    $cssMinifier->add($fileContent);
                }
                $path = $this->createDIR('css');
                $path = $path . '/bundle-' . $moduleName . '.css';
                $cssMinifier->minify($path);
                $arrayPaths[] = '/' . ModulesController::BUNDLE_FOLDER_NAME . '/css/bundle-' . $moduleName . '.css';
            }
        }
    }


    /**
     * @param $css
     * @param $filePath
     * @return mixed
     */
    private function replaceURL($css, $filePath)
    {
        $moduleName = 'MelisCore';
        $postPath = 'build/';
        if (!empty($filePath)) {
            $filePath = explode('/', $filePath);
            $moduleName = $filePath[1] ?? 'MelisCore';
            /**
             * Check if file is from module
             */
            $assetManagerService = $this->getServiceManager()->get('MelisAssetManagerModulesService');
            $modulePath = $assetManagerService->getModulePath($filePath[1], false);
            if (!empty($modulePath)) {
                $moduleFilePart = explode('/', $modulePath);
                if ($moduleFilePart[1] == 'module') {
                    $postPath = '';
                }
            }
        }

        $path = '/' . $moduleName . '/' . $postPath;

        // Clear out the line breaks
        $content = str_replace('<br />', '', $css);

        // Clear out bogus whitespace
        $content = preg_replace('/\(\s+/', '(', $content);
        $content = preg_replace('/\s+\)/', ')', $content);

        // Clear out quotes
//        $content = preg_replace('/(?:\'|\")/', '', $content);

        // Replaces repeating ../ patterns
        $content = preg_replace('/(?:\.\.\/)+(.*?\))/', $path . '$1', $content);

        // Prepend the path to lines that do not have a "//" anywhere
//        $content = preg_replace('/(url\((?!.*\/\/))/i', '$1'.$path, $content);

        return $content;
    }

    /**
     * This function copy necessary files
     */
    private function copyNeededAssets()
    {
        $moduleService = $this->getServiceManager()->get('MelisAssetManagerModulesService');
        $activeModules = $moduleService->getMelisActiveModules();

        $config = $this->getServiceManager()->get('config');
        foreach ($activeModules as $moduleName) {
            $loweredModuleName = strtolower($moduleName);
            $camelCaseModuleName = $this->camelToDash($moduleName);

            $neededFiles = $config['plugins'][$loweredModuleName]['datas']['bundle_all_needed_files'] ?? [];
            if (!empty($neededFiles)) {
                foreach ($neededFiles as $type => $file) {
                    $this->copyFile($file, $type, $camelCaseModuleName);
                }
            }
        }
    }

    /**
     * @param $fileNeeded
     * @param $type
     * @param $moduleName
     */
    private function copyFile($fileNeeded, $type, $moduleName)
    {
        $path = $_SERVER['DOCUMENT_ROOT'] . '/' . ModulesController::BUNDLE_FOLDER_NAME . '/'.$type;
        $dir = $_SERVER['DOCUMENT_ROOT'] . '/../vendor/melisplatform/';

        foreach($fileNeeded as $key => $file){
            $files = explode('/', $file);
            $fileName = end($files);

            $completFilePath = $moduleName.'/public'.$file;

            //make sure file does not exist yet in destination
            if(!file_exists($path.'/'.$fileName)){
                //make sure file source exist
                if(file_exists($dir.$completFilePath)){
                    if(!is_writable($dir.$completFilePath))
                        chmod($dir.$completFilePath, 0777);

                    copy($dir.$completFilePath, $path.'/'.$fileName);
                }
            }
        }
    }

    /**
     * @param $camelCase
     * @return string
     */
    private function camelToDash($camelCase) {
        return strtolower(preg_replace('/([a-zA-Z])(?=[A-Z])/', '$1-', $camelCase));
    }

    /**
     * @param $fileStr
     * @param bool $removeComments
     * @return bool|mixed|string
     */
    private function getFileContent($fileStr, $removeComments = true)
    {
//        $container = new Container('meliscore');
//        $locale = $container['melis-lang-locale'];

        if(!str_contains($fileStr, '/get-translations')) {
            if (function_exists('curl_version')) {

//                if(str_contains($fileStr, '/get-translations'))
//                    $fileStr .= '?locale=' . $locale;

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($ch, CURLOPT_URL, $fileStr);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
                $text = curl_exec($ch);
                curl_close($ch);
            } else {
                $text = file_get_contents($fileStr);
            }

            if ($removeComments)
                $text = preg_replace('!/\*.*?\*/!s', '', $text);

            return $text;
        }
        return "";
    }

    /**
     * @param $name
     * @return string
     */
    private function createDIR($name)
    {
        $path = $_SERVER['DOCUMENT_ROOT'].'/'.ModulesController::BUNDLE_FOLDER_NAME.'/'.$name;

        if(!file_exists($_SERVER['DOCUMENT_ROOT'].'/'.ModulesController::BUNDLE_FOLDER_NAME.'/'))
            mkdir($_SERVER['DOCUMENT_ROOT'].'/'.ModulesController::BUNDLE_FOLDER_NAME, 0777);

        if(!file_exists($path))
            mkdir($path, 0777);

        if(!is_writable($path.'/'))
            chmod($path.'/', 0777);

        return $path;
    }
}
