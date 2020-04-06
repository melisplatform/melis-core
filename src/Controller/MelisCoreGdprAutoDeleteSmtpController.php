<?php
namespace MelisCore\Controller;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use MelisCore\Form\MelisForm;
use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;
use MelisCore\Service\MelisCoreConfigService;
use MelisCore\Service\MelisCoreGdprAutoDeleteService;
use MelisCore\Service\MelisCoreGdprAutoDeleteToolService;
use MelisCore\Service\MelisCoreToolService;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

class MelisCoreGdprAutoDeleteSmtpController extends AbstractActionController
{
    /**
     * form errors
     * @var array
     */
    private $formErrors = [];

    /**
     * @return ViewModel
     */
    public function renderContentContainerAction()
    {
        $view = new ViewModel();
        // pass meliskey
        $view->setVariable('melisKey', $this->getMelisKey());

        return $view;
    }

    /**
     * @return ViewModel
     */
    public function renderContentAction()
    {
        $view = new ViewModel();
        // pass meliskey
        $view->setVariable('melisKey', $this->getMelisKey());
        // smtp form
        $view->setVariable('smtpForm', $this->getGdprAutoDeleteSmtpForm($this->getGdprAutoDeleteSmtpTable()->fetchAll()->current()));

        return $view;
    }

    private function getGdprAutoDeleteSmtpForm($data = null)
    {
        $form = $this->getTool()->getForm('melisgdprautodelete_smtp_form');
        if (!empty($data)) {
            
            $form->setData((array) $data);
            // change place holder of the password
            $form->get('mgdpr_smtp_password')->setAttribute('placeholder','tr_meliscore_login_pass_placeholder');
        }

        return $form;
    }
    public function saveSmtpConfigAction()
    {
        $id = null;
        $request = $this->getRequest();
        if ($request->isPost()){
            $params = get_object_vars($request->getPost());
            // smtp table
            // set data for validation
            $form = $this->getGdprAutoDeleteSmtpForm()->setData($params);
            if ($form->isValid()) {
                $formData = $form->getData();
                // check if id is present
                if (isset($formData['mgdpr_smtp_id']) && !empty($formData['mgdpr_smtp_id'])) {
                    // remove field when it's empty to avoid password update
                    if (empty($formData['mgdpr_smtp_password'])) {
                        unset($formData['mgdpr_smtp_password']);
                    }
                    // update and set id for logs
                    $id = $this->getGdprAutoDeleteSmtpTable()->save($formData, $formData['mgdpr_smtp_id']);
                } else {
                    unset($formData['mgdpr_smtp_id']);
                    // save new entry
                    $id = $this->getGdprAutoDeleteSmtpTable()->save($formData);
                }
            } else {
                var_dump($form->getMessages());
                die;
            }
        }
        return new JsonModel([
            'success' => 1,
            'item'    => $id
        ]);
    }


    /**
     * @return object | \MelisCore\Model\Tables\MelisGdprDeleteEmailsSmtpTable
     */
    private function getGdprAutoDeleteSmtpTable()
    {
        return $this->getServiceLocator()->get('MelisGdprDeleteEmailsSmtp');
    }

    /**
     * this method will get the meliscore tool
     * @return object
     */
    private function getTool()
    {
        $toolSvc = $this->getServiceLocator()->get('MelisCoreTool');
        // set melis tool key
        $toolSvc->setMelisToolKey('MelisCoreGdprAutoDelete', 'melis_core_gdpr_auto_delete');

        return $toolSvc;
    }

    /**
     * this method will get the melisKey from route params
     */
    private function getMelisKey()
    {
        return $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey'), null);
    }

}