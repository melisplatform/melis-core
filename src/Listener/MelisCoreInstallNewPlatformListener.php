<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;
use Zend\Session\Container;
class MelisCoreInstallNewPlatformListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events)
    {
        $sharedEvents      = $events->getSharedManager();
        
        $callBackHandler = $sharedEvents->attach(
        	'MelisInstaller',
        	array(
                'melis_install_last_process_start'
        	),
        	function($e){

        		$sm = $e->getTarget()->getServiceLocator();
        		$params = $e->getParams();
        		$container = new Container('melisinstaller');
        		$platforms = $params['platforms'];
         		$tablePlatform = $sm->get('MelisCoreTablePlatform');
         		$installHelper = $sm->get('InstallerHelper');
        		
        		// add the default platform
         		$tablePlatform->save(array('plf_name' => $installHelper->getMelisPlatform()));
        		
                if(!empty($platforms)) {
                    // add new platform here
                    foreach($platforms as $platform) {
                        $platformData = $tablePlatform->getEntryByField('plf_name', $platform['plf_name']);
                        $platformData = $platformData->current();
                         if(!$platformData) 
                             $tablePlatform->save(array('plf_name' => $platform['plf_name']));
                    }
                }
                
                // install lang
                $tableLang = $sm->get('MelisCoreTableLang');
                $tableLang->save(array(
                    'lang_id' => 1,
                    'lang_locale' => 'en_EN',
                    'lang_name' => 'English'
                ));
                
                $tableLang->save(array(
                    'lang_id' => 2,
                    'lang_locale' => 'fr_FR',
                    'lang_name' => 'Français'
                ));

        	},
        -1000);
        
        $this->listeners[] = $callBackHandler;
    }
}