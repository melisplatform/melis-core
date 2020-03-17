<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventManagerInterface;

/**
 * Melis General Listener implements detach
 * so that other listener can extends this class and not
 * redefine those
 */
class MelisCoreGeneralListener 
{
    /**
     * @var \Laminas\Stdlib\CallbackHandler[]
     */
    protected $listeners = array();
    
	protected function getControllerAction($e)
	{
		$routeMatch = $e->getRouteMatch();
		$routeParams = $routeMatch->getParams();
		$controller = '';
		$action = '';
		
		if (!empty($routeParams['controller']))
			$controller = $routeParams['controller'];
		
		if (!empty($routeParams['action']))
			$action = $routeParams['action'];
		
		return array($controller, $action);
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