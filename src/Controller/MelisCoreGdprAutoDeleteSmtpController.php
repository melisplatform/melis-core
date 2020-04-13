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
        // get smtp config
        $smtpConfigData = $this->getGdprAutoDeleteSmtpTable()->fetchAll()->current();
        $hasConfig = false;
        if (! empty($smtpConfigData)) {
            $hasConfig = true;
        }
        // smtp form
        $view->setVariable('smtpForm', $this->getGdprAutoDeleteSmtpForm($smtpConfigData));
        // set has config
        $view->setVariable('hasConfig', $hasConfig);

        return $view;
    }

    /**
     * @param null $data
     * @return mixed
     */
    private function getGdprAutoDeleteSmtpForm($data = null)
    {
        $form = $this->getTool()->getForm('melisgdprautodelete_smtp_form');
        if (!empty($data)) {
            $form->setData((array) $data);
            // change place holder of the password
            $form->get('mgdpr_smtp_password')->setAttribute('placeholder','tr_meliscore_login_pass_placeholder');
            $form->get('mgdpr_smtp_confirm_password')->setAttribute('placeholder','tr_meliscore_login_pass_placeholder');
        }

        return $form;
    }

    /**
     * @return JsonModel
     */
    public function saveSmtpConfigAction()
    {
        $id = null;
        $success = 0;
        // request
        $request = $this->getRequest();
        if ($request->isPost()){
            $params = get_object_vars($request->getPost());
            // set data for validation
            $form = $this->getGdprAutoDeleteSmtpForm();
            // remove filter if it s empty for updating to keep it's current password
            if (!empty($params['mgdpr_smtp_id'])) {
                if (empty($params['mgdpr_smtp_password']) ||  empty($params['mgdpr_smtp_confirm_password'])) {
                    $form->getInputFilter()->remove('mgdpr_smtp_password');
                    $form->getInputFilter()->remove('mgdpr_smtp_confirm_password');
                }
            }
            // set data
            $form = $form->setData($params);
            if ($form->isValid()) {
                $formData = $form->getData();
                if (!empty($formData['mgdpr_smtp_password']) && !empty($formData['mgdpr_smtp_confirm_password'])) {
                    $formData['mgdpr_smtp_password'] = $this->verifyUserPassword($formData['mgdpr_smtp_password'], $formData['mgdpr_smtp_confirm_password']);
                }
                if (empty($this->formErrors)) {
                    // remove confirm password field
                    unset($formData['mgdpr_smtp_confirm_password']);
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
                    $success = true;
                }

            } else {
                $this->formErrors = array_merge($this->translateFields($form->getMessages()), $this->formErrors);
            }
        }
        return new JsonModel([
            'success' => $success,
            'item'    => $id,
            'errors' => $this->formErrors
        ]);
    }

    public function deleteSmtpAction()
    {
        $id = null;
        $success = false;
        // request
        $request = $this->getRequest();
        if ($request->isPost()){
            $params = get_object_vars($request->getPost());
            if ($params['id']) {
                $id = $params['id'];
                $this->getGdprAutoDeleteSmtpTable()->deleteById($params['id']);
                $success = true;
            }
        }

        return new JsonModel([
            'success' => $success,
            'item'    => $id,
            'errors' => $this->formErrors
        ]);
    }

    /**
     * translate fields
     *
     * @param $formErrors
     * @return mixed
     */
    private function translateFields($formErrors)
    {
        $translator = $this->getServiceLocator()->get('translator');
        foreach ($formErrors as $i => $val) {
            $formErrors[$i]['label'] = $translator->translate('tr_smtp_form_' . $i);
        }

        return $formErrors;
    }

    private function verifyUserPassword($password, $confirmpassword)
    {
        $validatedPassword = null;
        if ($password == $confirmpassword) {
            $validatedPassword = $password;
        } else {
            $this->formErrors['mgdpr_smtp_password'] = [
                'label' => 'Password',
                'message' => 'Password does not match'
            ];
        }


        return $validatedPassword;
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