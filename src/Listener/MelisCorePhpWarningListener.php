<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\Mvc\MvcEvent;
use Zend\Mvc\Router\Http\Segment;
use Zend\View\Model\ViewModel;

/**
 * Site 404 catcher listener
 */
class MelisCorePhpWarningListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $callBackHandler = $events->attach(
        	MvcEvent::EVENT_FINISH, 
        	function(MvcEvent $e){
        	    
        		$sm = $e->getApplication()->getServiceManager();
        		$router = $e->getRouter();
        		
        		$routeMatch = $router->match($sm->get('request'));

                $response = $e->getResponse();

                $page = $response->getContent();

        		if (!empty($_SESSION['melis_php_warnings'])){

                    $filePersmissionTitle = 'File permission denied';
        		    $warning = array();

        		    // Fetching warning errors from session
                    foreach ($_SESSION['melis_php_warnings'] As $val){
                        $warning[] = '<b>Warning</b>: '.$val['description'] . ' in ' . $val['file'] . ', on line <b>' . $val['line'] .'</b>'.PHP_EOL;
                    }

                    // removing/unsetting warning data from session
                    unset($_SESSION['melis_php_warnings']);

                    $response->setStatusCode(500);

                    // Url request will render warning message(s) with layout
                    if (!$e->getTarget()->getRequest()->isXmlHttpRequest()){

                        // Adding the warning message to the response content
                        $response->setContent(implode('<br>', $warning).'<br><br>'.$page);

                        // Generating view
                        $renderer = $sm->get('ViewRenderer');
                        $view = new ViewModel();
                        $view->setTemplate('layout/warning');
                        $view->filePersmissionTitle = $filePersmissionTitle;
                        $view->content = $response->getContent();
                        echo $renderer->render($view);
                        exit();

                    }else{
                        $warning = str_replace('<b>', '', implode("\n", $warning));
                        $warning = str_replace('</b>', '',$warning);

                        // Addning title
                        $warning = $filePersmissionTitle."\n\n".$warning;
                        // Adding the warning message to the response content
                        $response->setContent($warning."\n\n".$page);
                    }
                }
        	});
        
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