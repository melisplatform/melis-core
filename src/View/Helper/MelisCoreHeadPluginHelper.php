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

    /**
     * @param string $path
     * @param bool   $returnBundle  serve the prebuilt bundle rather than the file list
     * @param bool   $forBundling   TRUE when MelisCoreModulesService is BUILDING a bundle from
     *                              this list, as opposed to rendering a page. The two cannot be
     *                              told apart by $returnBundle: the builder and a render with
     *                              bundling turned off both pass false.
     */
    public function __invoke($path = '/', $returnBundle = false, $forBundling = false)
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

                $loginJsBundle = $bundleFolder . '/'.ModulesController::BUNDLE_FOLDER_NAME.'/js/bundle-all-login.js';

                // A login bundle older than melisCsrf.js is ignored, and the plain file list used
                // instead until it is rebuilt: an older bundle may embed an outdated copy of the
                // emitter, which would patch XMLHttpRequest a second time.
                $emitterFile = __DIR__ . '/../../../public/js/core/melisCsrf.js';
                $bundleUsable = is_file($loginJsBundle)
                    && (!is_file($emitterFile) || filemtime($loginJsBundle) >= filemtime($emitterFile));

                if ($bundleUsable) {
                    $container = new Container('meliscore');
                    $locale = $container['melis-lang-locale'];
                    $jsFiles = [];
                    $jsFiles[] = '/melis/get-translations?locale=' . $locale;
                    $jsFiles[] = '/melis/get-login-js-bundles'.$time;
                }
            }
        }

        if ($path == 'meliscore_login') {
            // The emitter is kept out of the login bundle and injected on its own at render time,
            // so the page only ever holds one copy.
            $jsFiles = $forBundling
                ? $this->withoutCsrfEmitter($jsFiles)
                : $this->withCsrfEmitterFirst($jsFiles);
        }
		
		return [
            'js' => $jsFiles,
            'css' => $cssFiles
        ];
	}

    /**
     * The CSRF emitter on the login page, whatever the mode: plain file list, per-module
     * bundles, or a pre-built login bundle (`etc/bundles/js/bundle-all-login.js`). It is loaded
     * on its own, first, so it does not depend on when the bundle was last built; the script
     * installs itself once.
     *
     * @param string[] $jsFiles
     * @return string[]
     */
    /** The emitter, in any stamped form, removed: used while a bundle is being built. */
    private function withoutCsrfEmitter(array $jsFiles)
    {
        $emitter = '/MelisCore/js/core/melisCsrf.js';

        return array_values(array_filter($jsFiles, function ($item) use ($emitter) {
            return strpos((string) $item, $emitter) === false;
        }));
    }

    private function withCsrfEmitterFirst(array $jsFiles)
    {
        $emitter = '/MelisCore/js/core/melisCsrf.js';

        // Stamped with the file's mtime, like the bundles: the emitter is served with a one-day
        // Cache-Control and no validator, so an unstamped URL means a browser keeps the copy it
        // already has for a day after a deploy - and a fix to the emitter never reaches the login
        // page. The URL stays stable, hence cacheable, until the file actually changes.
        $file = __DIR__ . '/../../../public/js/core/melisCsrf.js';
        $stamped = $emitter . '?v=' . (is_file($file) ? filemtime($file) : '0');

        // Filter on the unstamped path so an entry carrying any stamp is matched too.
        $jsFiles = array_values(array_filter($jsFiles, function ($item) use ($emitter) {
            return strpos((string) $item, $emitter) === false;
        }));

        // Keep the translations first: the emitter needs nothing, the rest may need both.
        $translations = [];
        if (!empty($jsFiles) && strpos((string) $jsFiles[0], '/melis/get-translations') === 0) {
            $translations = [array_shift($jsFiles)];
        }

        return array_merge($translations, [$stamped], $jsFiles);
    }
}