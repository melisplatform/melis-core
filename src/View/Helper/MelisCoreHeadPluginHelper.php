<?php

namespace MelisCore\View\Helper;

use Laminas\ServiceManager\ServiceManager;
use Laminas\View\Helper\AbstractHelper;
use MelisCore\Controller\ModulesController;
use MelisCore\Library\MelisAppConfig;
use Laminas\Session\Container;

class MelisCoreHeadPluginHelper extends AbstractHelper
{
	public $serviceManager;

    public function setServiceManager(ServiceManager $serviceManager)
    {
        $this->serviceManager = $serviceManager;
    }

    public function __invoke($path = '/', $returnBundle = false)
	{
		$melisAppConfig = $this->serviceManager->get('MelisCoreConfig');
		
		$appsConfig = $melisAppConfig->getItem($path);
		if ($path != '/') {
	        $path = substr($path, 1, strlen($path));
	        $appsConfig = [$path => $appsConfig];
	    }
	    
		$jsFiles = [];
		$cssFiles = [];

		foreach ($appsConfig as $keyPlugin => $appConfig)
		{	
			$jsFiles = array_merge($jsFiles, $melisAppConfig->getItem("/$keyPlugin/ressources/js"));
			$cssFiles = array_merge($cssFiles, $melisAppConfig->getItem("/$keyPlugin/ressources/css"));
		}

        /**
         * if we return the bundled files or not
         */
        if($returnBundle) {
            /**
             * check if we are in login page
             */
            if ($path == 'meliscore_login') {
                $platformTable = $this->serviceManager->get('MelisCoreTablePlatform');
                $platformData = $platformTable->getEntryByField('plf_name', getenv('MELIS_PLATFORM'))->current();
                $time = '';
                if(!empty($platformData))
                    $time = '?v='.$platformData->plf_bundle_cache_time;
                /**
                 * check if bundle for login is available
                 */
                $docroot = $_SERVER['DOCUMENT_ROOT'];
                $bundleFolder = $docroot.'/../etc';

                if (file_exists($bundleFolder . '/'.ModulesController::BUNDLE_FOLDER_NAME.'/css/bundle-all-login.css')) {
                    $cssFiles = [];
                    $cssFiles[] = '/melis/get-login-css-bundles'.$time;
                }

                if (file_exists($bundleFolder . '/'.ModulesController::BUNDLE_FOLDER_NAME.'/js/bundle-all-login.js')) {
                    $container = new Container('meliscore');
                    $locale = $container['melis-lang-locale'];
                    $jsFiles = [];
                    $jsFiles[] = '/melis/get-translations?locale=' . $locale;
                    $jsFiles[] = '/melis/get-login-js-bundles'.$time;
                }
            }
        }

        if ($path == 'meliscore_login') {
            $jsFiles = $this->withCsrfEmitterFirst($jsFiles);
        }
		
		return [
            'js' => $jsFiles,
            'css' => $cssFiles
        ];
	}

    /**
     * The CSRF emitter (audit 10.0) on the login page, whatever the mode: plain file list,
     * per-module bundles, or a pre-built login bundle (`etc/bundles/js/bundle-all-login.js`).
     * That last one replaces the whole list, and a bundle built before the emitter existed
     * silently drops it: every legacy login POST then fails with "Invalid CSRF token". Loading
     * the file on its own, first, does not depend on when the bundle was last built; the script
     * installs itself once, so a bundle that also contains it is harmless.
     *
     * @param string[] $jsFiles
     * @return string[]
     */
    private function withCsrfEmitterFirst(array $jsFiles)
    {
        $emitter = '/MelisCore/js/core/melisCsrf.js';
        $jsFiles = array_values(array_filter($jsFiles, function ($file) use ($emitter) {
            return strpos((string) $file, $emitter) === false;
        }));

        // Keep the translations first: the emitter needs nothing, the rest may need both.
        $translations = [];
        if (!empty($jsFiles) && strpos((string) $jsFiles[0], '/melis/get-translations') === 0) {
            $translations = [array_shift($jsFiles)];
        }

        return array_merge($translations, [$emitter], $jsFiles);
    }
}