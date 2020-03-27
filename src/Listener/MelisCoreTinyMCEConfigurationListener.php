<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;
use Laminas\Session\Container;

use MelisCore\Listener\MelisCoreGeneralListener;

class MelisCoreTinyMCEConfigurationListener extends MelisCoreGeneralListener implements ListenerAggregateInterface
{

    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $sharedEvents      = $events->getSharedManager();

        $callBackHandler = $sharedEvents->attach(
            '*',
            'meliscore_tinymce_config',
            function($e){

                $params     = $e->getParams();
                $config     = array();
                $sm         = $e->getTarget()->getEvent()->getApplication()->getServiceManager();
                $translator = $sm->get('translator');

                $config['plugins'][]                 = 'responsivefilemanager';
                $config['filemanager_title']         = $translator->translate('tr_melisore_tinymce_file_manager');
                $config['filemanager_crossdomain']   = true;
                $config['relative_urls']             = false;
                $config['external_filemanager_path'] = '/MelisCore/js/filemanager/';
                $config['external_plugins']          = array('filemanager' => '/MelisCore/js/filemanager/plugin.min.js');
                $config['image_advtab']              = true;

                return array(
                    // this will be the configuration that you would like to merge in tinyMCE configuration
                    'configuration' => array(
                        'meliscore_default_filemanager' => $config
                    ),
                    /**
                     * the key of the configuration that you would like to exclude when merging the configuration,
                     * this will be used to avoid configuration conflicts in tinyMCE, or those extensions that uses the same configuration name
                     * in tinyMCE
                     */
                    'exclude' => array('')
                );
            },
            // the priority number of your tinyMCE configuration listener should not be less than the value below
            -10000);

        $this->listeners[] = $callBackHandler;
    }
}
