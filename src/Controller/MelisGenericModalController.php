<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\View\Model\ViewModel;
// use Laminas\View\Model\JsonModel;
// use MelisCore\Service\MelisCoreRightsService;

/**
 * This class renders Melis CMS appConfig views recursively
 * to generate web interface based on it
 */
class MelisGenericModalController extends AbstractActionController
{
    public function genericModalAction()
    {
		$id = $this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));
		$melisKey = $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey', ''));
         
        $view = new ViewModel();
        $view->setTerminal(true);
        $view->id = $id;
        $view->melisKey = $melisKey;
         
        return $view;
    }

    public function reloadGenericModalAction()
    {
        $view = new ViewModel();
        $view->setTerminal(true);
        $view->id = $id;
        $view->melisKey = $melisKey;

        return $view;
    }

    public function emptyGenericModalAction()
    {
        $id = $this->params()->fromRoute('id', $this->params()->fromQuery('id', ''));
        $melisKey = $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey', ''));
         
        $view = new ViewModel();
        $view->setTerminal(true);
        $view->id = $id;
        $view->melisKey = $melisKey;
        
        return $view;
    }

}

