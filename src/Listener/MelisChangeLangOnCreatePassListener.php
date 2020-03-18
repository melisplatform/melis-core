<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Zend\Escaper\Escaper;
use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\Mvc\MvcEvent;
use Zend\Mvc\Router\Http\Segment;
use Zend\Uri\Http;
use Zend\Session\Container;


class MelisChangeLangOnCreatePassListener implements ListenerAggregateInterface
{
    public function attach(EventManagerInterface $events)
    {
        $callBackHandler = $events->attach(
        	MvcEvent::EVENT_ROUTE, 
        	function(MvcEvent $e){
        	    
        	    // AssetManager, we don't want listener to be executed if it's not a php code
        	    $uri = $_SERVER['REQUEST_URI'];

        	    preg_match('/.*\.((?!php).)+(?:\?.*|)$/i', $uri, $matches, PREG_OFFSET_CAPTURE);

        	    if (count($matches) > 1)
        	        return;
                $route = isset(explode('/',$uri)[2]) ? explode('/',$uri)[2] : null;
                $rhash = isset(explode('/',$uri)[3]) ? explode('/',$uri)[3] : null;
                $sm = $e->getApplication()->getServiceManager();

        	    if($route == "generate-password"){

                    /** @var MelisCoreCreatePasswordService $melisCreatePass */
                    $melisCreatePass = $sm->get('MelisCoreCreatePassword');

                    $usr = $melisCreatePass->getUserByHash($rhash);
                    $usrLang = $usr->usr_lang_id;

                    $melisLangTable = $sm->get('MelisCore\Model\Tables\MelisLangTable');
                    $melisUserTable = $sm->get('MelisCore\Model\Tables\MelisUserTable');
                    $melisCoreAuth = $sm->get('MelisCoreAuth');

                    $datasLang = $melisLangTable->getEntryById($usrLang);


                    // If the language was found and then exists
                    if (!empty($datasLang))
                    {
                        $datasLang = $datasLang->current();

                        // Update session locale for melis BO
                        $container = new Container('meliscore');
                        $container['melis-lang-id'] = $usrLang;
                        if(isset($datasLang->lang_locale)){
                            $container['melis-lang-locale'] = $datasLang->lang_locale;
                            $container['melis-login-lang-locale'] = $datasLang->lang_locale;
                        }

                        // Get user id from session auth
                        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
                        if(!isset($userAuthDatas->usr_lang_id))
                            $userAuthDatas  = (object) array("usr_lang_id" => '');

                        // Update auth user session
                        $userAuthDatas->usr_lang_id = $usrLang;
                    }
                }
        	},
        100);
        
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