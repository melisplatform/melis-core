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
class MelisFlashMessengerController extends MelisAbstractActionController
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
                // SECURITY (audit M7) : la cloche rend ces champs en HTML. Le service échappe à
                // l'ÉCRITURE, mais la re-traduction ici réintroduisait du brut (une clé tr_
                // stockée ressort traduite, HTML compris). decode→escape est idempotent : les
                // valeurs déjà échappées ne doublent pas, les traductions sont neutralisées.
                $title   = $tool->escapeHtml(html_entity_decode($translator->translate($fmValues->title), ENT_QUOTES, 'UTF-8'));
                $message = $tool->escapeHtml(html_entity_decode($translator->translate($fmValues->message), ENT_QUOTES, 'UTF-8'));
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
        
        $success = $this->params()->fromRoute('success', $this->params()->fromQuery('success', $this->params()->fromRoute('success', $this->params()->fromQuery('success', ''))));
        $title   = $this->params()->fromRoute('textTitle', $this->params()->fromQuery('textTitle', $this->params()->fromRoute('title', $this->params()->fromQuery('title', ''))));
        $message = $this->params()->fromRoute('textMessage', $this->params()->fromQuery('textMessage', $this->params()->fromRoute('message', $this->params()->fromQuery('title', ''))));
        $typeCode = $this->params()->fromRoute('typeCode', $this->params()->fromQuery('typeCode', $this->params()->fromRoute('typeCode', $this->params()->fromQuery('typeCode', ''))));
        $itemId = $this->params()->fromRoute('itemId', $this->params()->fromQuery('itemId', $this->params()->fromRoute('itemId', $this->params()->fromQuery('itemId', ''))));

        $img = $success == 1 ? $flashMessenger::INFO : $flashMessenger::WARNING;
    
        $flashMessenger->addToFlashMessenger($title, $message, $img);
        
        $logSrv = $this->getServiceManager()->get('MelisCoreLogService');
        $logSrv->saveLog($title, $message, $success, $typeCode, $itemId);
    }
}