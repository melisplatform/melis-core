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
use Laminas\Mvc\MvcEvent;
use MelisCore\Listener\MelisGeneralListener;
use Laminas\ServiceManager\ServiceManager;
/**
 * Site Maintenance listener
 */
class MelisCoreMaintenanceListener extends MelisGeneralListener implements ListenerAggregateInterface
{
    public $serviceManager;

    public function getServiceManager()
    {
        return $this->serviceManager;
    }

    public function attach(EventManagerInterface $events, $priority = -9999)
    {
        $callBackHandler = $events->attach(
        MvcEvent::EVENT_ROUTE, 
        function(MvcEvent $e){

        /* This code block is retrieving the site ID based on the current page ID. It first gets the
        router and request objects from the MvcEvent, then matches the route to get the
        parameters. It then uses the MelisEngineTree service to get the site associated with the
        page ID, and retrieves the site ID from the site object. This site ID is later used to
        check if the site is in maintenance mode. */
            $router = $e->getRouter();
            $request = $e->getRequest();
            $routeM = $router->match($request);
            $routeName = $routeM->getMatchedRouteName();
            $params = $routeM->getParams();
            $pageTreeService = $e->getApplication()->getServiceManager()->get('MelisEngineTree');
            $module = explode('/', $routeName);
            if (!is_int(array_search('melis_front_melisrender', $module))) {
                if(!isset($params['idpage'])) {
                    return;
                }
                $site = $pageTreeService->getSiteByPageId($params['idpage']);
                $siteId = $site->site_id;
            
                $protocol = "http://";
                if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === "on") {
                    $protocol = "https://";
                }
                $currentSite = $protocol.$_SERVER['SERVER_NAME'].''.$_SERVER['REQUEST_URI'];
                // $file = "./maintenance/503/maintenance.json";
                $file = getcwd()."/data/maintenance-503/maintenance.json";
                if(file_exists($file) && !isset($_GET['maintenance_mode'])) {
                    $currentData = file_get_contents($file);
                    $currentData = json_decode($currentData);
                    foreach($currentData as $data) {
                        if(($data->is_maintenance_mode == 1 && $siteId == $data->site_id)) {
                            // get host of the current and maintenance site
                            $maintenanceLink = null;
                            $currentSiteURL = parse_url($currentSite);
                            $maintenanceURL = parse_url($data->maintenance_url);
                            $response = $e->getResponse();
                            if($currentSiteURL['host'] == $maintenanceURL['host']) {
                                $query = http_build_query(array_merge($_GET,['maintenance_mode'=>1]));
                                $path = isset($maintenanceURL['path']) ? $maintenanceURL['path'] : '';
                                if(!isset($maintenanceURL['path'])) {
                                    // GET SITE URL BY SITE ID
                                    $maintenanceLink = $pageTreeService->getHomePageLink($data->site_id, true).'?'.$query;
                                } else {
                                    $maintenanceLink = $protocol.$maintenanceURL['host'].$path.'?'.$query;
                                }
                            } else {
                                $maintenanceLink = $data->maintenance_url;
                            }
    
                            $response->send();
                            $response->setHeaders($response->getHeaders ()->addHeaderLine('Location', $maintenanceLink));
                            $response->setHeaders($response->getHeaders ()->addHeaderLine('Cache-Control', 'no-cache, no-store, must-revalidate'));
                            $response->setHeaders($response->getHeaders ()->addHeaderLine('Pragma', 'no-cache'));
                            $response->setHeaders($response->getHeaders ()->addHeaderLine('Expires', true));
                            $response->setStatusCode(503);
                            $response->sendHeaders();
                            die();
    
                        }
                    }
                }
            }
        },
        $priority);
        $this->listeners[] = $callBackHandler;

    }



}