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

/**
 * This listener automatically insert announcement dashboard plugin when creating new user.
 *
 */
class MelisCoreInsertDashboardPluginListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->attachEventListener(
            $events,
        	'MelisCore',
        	[
        	    'meliscore_tooluser_savenew_info_end'
            ],
        	function($event){
                $params = $event->getParams();
                $sm = $event->getTarget()->getEvent()->getApplication()->getServiceManager();
                
                if ($params['success']) {
                    if (isset($params['datas']['usr_id'])) {
                        $userId = $params['datas']['usr_id'];
                        if(!empty($userId)) {

                            $melisConfig = $sm->get('MelisCoreConfig');
                            $announcementConfig = $melisConfig->getItem('MelisCoreDashboardAnnouncementPlugin');
                            $datas = $announcementConfig['datas'];

                            if(!empty($datas['plugin'])) {
                                //construct plugins in xml
                                $xml = '<?xml version="1.0" encoding="UTF-8"?><Plugins>';

                                $pluginId = $datas['plugin_id'] . '_' . time();
                                $xml .= '<plugin plugin="' . $datas['plugin'] . '" plugin_id="' . $pluginId . '">
                                <x-axis><![CDATA[' . $datas["x-axis"] . ']]></x-axis>
                                <y-axis><![CDATA[' . $datas["y-axis"] . ']]></y-axis>
                                <height><![CDATA[' . $datas["height"] . ']]></height>
                                <width><![CDATA[' . $datas["width"] . ']]></width>
                            </plugin>';

                                $xml .= '</Plugins>';

                                $dashboardSrv = $sm->get('MelisCoreDashboardsTable');

                                //set default dashboard plugin to user
                                $dashboardSrv->save([
                                    'd_dashboard_id' => 'id_meliscore_toolstree_section_dashboard',
                                    'd_user_id' => $userId,
                                    'd_content' => $xml
                                ]);
                            }
                        }
                    }
                }
        	}
        );
    }
}