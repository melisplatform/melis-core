<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */ 

namespace MelisCore\Controller;

use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use Laminas\Json\Json;
use Laminas\Session\Container;

/**
 * This class handles Melis CMS Flash Messenger
 */
class MelisFlashMessengerController extends AbstractActionController
{ 
    
    /**
     * Renders the Flash Messenger view in Melis CMS 
     * @return \Laminas\View\Model\ViewModel
     */
    public function headerFlashMessengerAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $flashMessenger = $this->getServiceManager()->get('MelisCoreFlashMessenger');
         
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->flashMessages = $this->getflashMessageAction();
        
        return $view;
    }
    public function setFlashMessageAction()
    {
        // translator service
        $translator = $this->getServiceManager()->get('translator');

        // tool service
        $tool = $this->getServiceManager()->get('MelisCoretool');

        // flash messenger service
        $flashMessenger = $this->getServiceManager()->get('MelisCoreFlashMessenger');

        $flashMessages = Json::decode($flashMessenger->getFlashMessengerMessages());

        // flashMessages array, re-stored so we can apply translation to its content
        $fmArray = array();
        $fmCtr = 0;


        return new JsonModel(array(
            'flashMessage' => $fmArray,
        ));
    }
    public function clearFlashMessageAction(){
        // translator service
        $translator = $this->getServiceManager()->get('translator');

        // flash messenger service
        $flashMessenger = $this->getServiceManager()->get('MelisCoreFlashMessenger');

        // clear flash message
        $flashMessenger->clearFlashMessage();

        $noNotiff = $translator->translate('tr_meliscore_no_notificaions');

        return new JsonModel(array(
            'flashMessage' => true,
            'trans' => $noNotiff,
        ));
    }
    
    /**
     * Returns the flash messages content
     * @return \Laminas\View\Model\JsonModel
     */
    public function getflashMessageAction()
    {
        // translator service
        $translator = $this->getServiceManager()->get('translator');

        // tool service
        $tool = $this->getServiceManager()->get('MelisCoreTool');
        
        // flash messenger service
        $flashMessenger = $this->getServiceManager()->get('MelisCoreFlashMessenger');
        
        $flashMessages = Json::decode($flashMessenger->getFlashMessengerMessages());
        
        // flashMessages array, re-stored so we can apply translation to its content
        $fmArray = array();
        $fmCtr = 0;
        
        if($flashMessages)
        {
            foreach($flashMessages as $fmKey => $fmValues) {
                $title   = $translator->translate($fmValues->title);
                $message =  $translator->translate($fmValues->message);
                $fmArray[] = array(
                    'title' => ($title),
                    'message' => ($message),
                    'image' => $fmValues->image,
                    'time' => $fmValues->time,
                    'date' => $fmValues->date,
                    'date_trans' => $fmValues->date_trans,
                );
            }
        }
        
    	return new JsonModel(array(
    		'flashMessage' => $fmArray,
    	));
    }
    
    /**
     * Logs into the flash messenger service
     */
    public function logAction()
    {
        $flashMessenger = $this->getServiceManager()->get('MelisCoreFlashMessenger');
        
        $success = $this->params()->fromRoute('success', $this->params()->fromQuery('success', ''));
        $title   = $this->params()->fromRoute('textTitle', $this->params()->fromQuery('textTitle', ''));
        $message = $this->params()->fromRoute('textMessage', $this->params()->fromQuery('textMessage', ''));
        $typeCode = $this->params()->fromRoute('typeCode', $this->params()->fromQuery('typeCode', ''));
        $itemId = $this->params()->fromRoute('itemId', $this->params()->fromQuery('itemId', ''));
    
        $img = $success == 1 ? $flashMessenger::INFO : $flashMessenger::WARNING;
    
        $flashMessenger->addToFlashMessenger($title, $message, $img);
        
        $logSrv = $this->getServiceManager()->get('MelisCoreLogService');
        $logSrv->saveLog($title, $message, $success, $typeCode, $itemId);
    }


}