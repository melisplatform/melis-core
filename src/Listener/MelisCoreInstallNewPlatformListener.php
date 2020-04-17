<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use MelisCore\Listener\MelisCoreGeneralListener;
use Laminas\Session\Container;
class MelisCoreInstallNewPlatformListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $this->attachEventListener(
            $events,
        	'MelisInstaller',
        	[
                'melis_install_last_process_start'
        	],
        	function($e){

        		$sm = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
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
                             $tablePlatform->save(array('plf_name' => $platform['plf_name'], 'plf_update_marketplace' => 1));
                    }
                }
        	},
        -1000
        );
    }
}