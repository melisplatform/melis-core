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
use Laminas\Mvc\Router\Http\Segment;

/**
 * Site Redirect to real back office listener
 */
class MelisCoreUrlAccessCheckerListenner implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $callBackHandler = $events->attach(
        	MvcEvent::EVENT_FINISH, 
        	function(MvcEvent $e){

                // AssetManager, we don't want listener to be executed if it's not a php code
        	    $uri = $_SERVER['REQUEST_URI'];
        	    preg_match('/.*\.((?!php).)+(?:\?.*|)$/i', $uri, $matches, PREG_OFFSET_CAPTURE);
        	    if (count($matches) > 1)
        	        return;
        	    
        		$router = $e->getRouter();
        		$sm = $e->getApplication()->getServiceManager();
        		$routeMatch = $router->match($sm->get('request'));
                $uri = $router->getRequestUri();


                if ($routeMatch && $uri->getPath("/melis"))
        		{
                    // Retrieving the router Details, This will return URL details in Object
                    $config = $sm->get("MelisConfig");
                    $configDefaultData = $config->getItem("meliscore/datas/default");
                    $host = $configDefaultData['host'];
                    $scheme = $configDefaultData['scheme'];
                    $env = !empty(getenv('MELIS_PLATFORM')) ? getenv('MELIS_PLATFORM') : null;
                    if($env)
                    {
                        $configEnvData = $config->getItem("meliscore/datas/".$env);
                        $host  =  isset($configEnvData['host']) ? $configEnvData['host'] : $host;
                        $scheme  =  isset($configEnvData['scheme']) ? $configEnvData['scheme'] : $scheme;
                    }

                    if($uri->getHost() != $host)
                    {
                        $url = $scheme."://".$host."/melis";
                        if ($url) {
                            // Redirection
                            $response = $e->getResponse();
                            $response->setHeaders($response->getHeaders()->addHeaderLine('Location', $url));
                            $response->setHeaders($response->getHeaders()->addHeaderLine('Cache-Control', 'no-cache, no-store, must-revalidate'));
                            $response->setHeaders($response->getHeaders()->addHeaderLine('Pragma', 'no-cache'));
                            $response->setHeaders($response->getHeaders()->addHeaderLine('Expires', false));
                            $response->setStatusCode(301);
                            $response->sendHeaders();
                            exit ();
                        }
                    }

        		}
        	},
        -1000);
        
        $this->listeners[] = $callBackHandler;
    }
    
    public function detach(EventManagerInterface $events)
    {
        foreach ($this->listeners as $index => $listener) {
            if ($events->detach($listener)) {
                unset($this->listeners[$index]);
            }
        }
    }
}