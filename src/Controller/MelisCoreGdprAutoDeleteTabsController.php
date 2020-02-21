<?php
namespace MelisCore\Controller;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;
use MelisCore\Service\MelisCoreGdprAutoDeleteService;
use MelisCore\Service\MelisCoreToolService;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

class MelisCoreGdprAutoDeleteTabsController extends AbstractActionController
{
    /**
     * @return ViewModel
     */
    public function renderContentAddEditTabsHandlerAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey',$this->getMelisKey());
        // get melis core languages for nav
        $view->setVariable('melisCoreLang'  , $this->getGdprAutoDeleteService()->getMelisCoreLang());

        return $view;
    }
    /**
     * @return ViewModel
     */
    public function renderConfigTabAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey'       ,$this->getMelisKey());
        // get form for the Cron Config
        $view->setVariable('formCronConfig' , $this->getTool()->getForm('melisgdprautodelete_add_edit_cron_config_form'));
        // get form for Email Setup
        $view->setVariable('formEmailSetup' , $this->getTool()->getForm('melisgdprautodelete_add_edit_email_setup'));

        return $view;
    }
    public function renderAlertTabAction()
    {
        // view model
        $view = new ViewModel();
        // melisKey
        $view->setVariable('melisKey',$this->getMelisKey());
        // for contents
        $view->setVariable('melisCoreLang'  , $this->getGdprAutoDeleteService()->getMelisCoreLang());
        return $view;
    }


    /**
     * this method will get the melisKey from route params
     */
    private function getMelisKey()
    {
        return $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey'), null);
    }

    /**
     * this method will get the meliscore tool
     * @return MelisCoreToolService
     */
    private function getTool()
    {
        /** @var MelisCoreToolService $toolSvc */
        $toolSvc = $this->getServiceLocator()->get('MelisCoreTool');
        // set melis tool key
        $toolSvc->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');

        return $toolSvc;
    }

    /**
     * @return MelisCoreGdprAutoDeleteService
     */
    private function getGdprAutoDeleteService()
    {
        /** @var MelisCoreGdprAutoDeleteService $gdprAutoDeleteSvc */
        $gdprAutoDeleteSvc = $this->getServiceLocator()->get('MelisCoreGdprAutoDeleteService');

        return $gdprAutoDeleteSvc;
    }

    /**
     * @return MelisGdprDeleteConfigTable
     */
    private function getGdprDeleteConfigTable()
    {
        /** @var MelisGdprDeleteConfigTable $gdprDeleteConfigTable */
        $gdprDeleteConfigTable = $this->getServiceLocator()->get('MelisGdprDeleteConfigTable');

        return $gdprDeleteConfigTable;
    }

}