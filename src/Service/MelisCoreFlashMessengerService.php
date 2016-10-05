<?php
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Session\Container;
use Zend\Mvc\Controller\Plugin\FlashMessenger;
use Zend\Json\Json;
class MelisCoreFlashMessengerService implements ServiceLocatorAwareInterface, MelisCoreFlashMessengerServiceInterface
{
    
    const INFO = 'glyphicon glyphicon-info-sign';
    const WARNING = 'glyphicon glyphicon-warning-sign';
    /**
     * 
     * @var $serviceLocator ServiceLocatorInterface
     */
    public $serviceLocator;
    
    /**
     * 
     * @var $fmContainer Container
     */
    protected $fmContainer;
    

    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }

    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }
    
    
    /*
     * Adds a new message in the Flash Messenger MVC helper, this will be displayed
     * in the Flash Messenger View in Melis CMS headers
     * @param String $text
     * @param String $img
     */
    public function addToFlashMessenger($title, $text, $img = 'glyphicon glyphicon-info-sign')
    {
        $this->fmContainer = new Container('fms');

        // process time
        $time = date('h:i A', strtotime(date('m/d/y H:i:s')));
        
        $translator = $this->getServiceLocator()->get('translator');
        
        $curFlashMessages = $this->fmContainer->flashMessages;
        $newFlashMessage = array(
            'title' => $translator->translate($title),
            'message'=> $translator->translate($text),
            'image'  => $img,
            'time' => $time
        );
        
        if(!empty($curFlashMessages))
        {
            array_push($curFlashMessages, $newFlashMessage);
        }
        else 
        {
            $curFlashMessages[0] = $newFlashMessage;
        }
        
        $this->fmContainer->flashMessages = $curFlashMessages;
    }
    
    /**
     * Returns all the messages stored in Melis Flash Messenger
     * @return Json
     */
    public function getFlashMessengerMessages() 
    {
        $this->fmContainer = new Container('fms');
        $flashMessages = $this->fmContainer->flashMessages;
        
        if(!empty($flashMessages))
        {
            $flashMessages = array_reverse($flashMessages);
        }
        
        return Json::encode($flashMessages);
    }
    
    /**
     * Clears all the flash messages
     */
    public function clearFlashMessage()
    {
        $this->fmContainer = new Container('fms');
        $this->fmContainer->getManager()->destroy();
    }

}