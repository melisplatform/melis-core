<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;
use MelisCore\Service\MelisCoreRightsService;
/**
 * Platform Color Tool
 */
class PlatformColorController extends AbstractActionController
{

    /**
     * Tool display container
     * @return ViewModel
     */
    public function toolContainerAction()
    {

        $form = $this->getForm();

        $view = new ViewModel();

        $view->melisKey  = $this->getMelisKey();
        $view->hasAccess = $this->hasAccess();

        $platformColorTable = $this->getServiceLocator()->get('MelisCorePlatformColorTable');
        $platformColorData  = $platformColorTable->getEntryByField('pcolor_is_active', 1)->current();

        if($platformColorData) {
            $colors = json_decode($platformColorData->pcolor_settings, true);
            if($colors) {
                $form->setData($colors);
            }
        }

        $view->setVariable('form', $form);

        return $view;
    }

    /**
     * Returns the melisKey of this tool
     * @return mixed
     */
    private function getMelisKey()
    {
        $melisKey = $this->params()->fromRoute('melisKey', null);

        return $melisKey;
    }

    /**
     * Generates a dynamic CSS virtual file that will be rendered
     * in the platform
     * @return ViewModel
     */
    public function getStyleColorCssAction()
    {
        $primaryColor   = null;
        $secondaryColor = null;

        $response = $this->getResponse();
        $response->getHeaders()
            ->addHeaderLine('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0')
            ->addHeaderLine('Pragma', 'no-cache')
            ->addHeaderLine('Content-Type', 'text/css;charset=UTF-8');

        /**
         * @todo: this should be coming from the database
         */
        $platformColorTable = $this->getServiceLocator()->get('MelisCorePlatformColorTable');
        $platformColorData  = $platformColorTable->getEntryByField('pcolor_is_active', 1)->current();
        if($platformColorData) {
            $colors = json_decode($platformColorData->pcolor_settings);
            if($colors) {
                $primaryColor = $colors->melis_core_platform_color_primary_color;
                $secondaryColor = $colors->melis_core_platform_color_secondary_color;
            }
        }



        $view = new ViewModel();

        $view->setTerminal(true);

        $view->primaryColor   = $primaryColor;
        $view->secondaryColor = $secondaryColor;

        return $view;
    }

    /**
     * Checks whether the user has access to this tools or not
     * @return boolean
     */
    private function hasAccess()
    {
        $key             = 'meliscore_tool_platform_color_tool_content';
        $melisCoreAuth   = $this->getServiceLocator()->get('MelisCoreAuth');
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        $xmlRights       = $melisCoreAuth->getAuthRights();

        $isAccessible    = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_TOOLS, $key);

        return $isAccessible;
    }

    public function saveColorsAction()
    {

        $translation = $this->getServiceLocator()->get('translator');
        $success     = 0;
        $errors      = array();
        $textTitle   = 'tr_meliscore_platform_color';
        $textMessage = 'tr_meliscore_platform_color_save_ko';
        $request     = $this->getRequest();

        if($request->isPost()) {

            $post = get_object_vars($request->getPost());

            $form = $this->getForm();
            $form->setData($post);

            if($form->isValid()) {

                $platformColorTable = $this->getServiceLocator()->get('MelisCorePlatformColorTable');

                $platformColorTable->save([
                    'pcolor_id'=> 1,
                    'pcolor_settings' => json_encode($post),
                    'pcolor_is_active' => 1
                ], 1);

                $success = 1;
                $textMessage = 'tr_meliscore_platform_color_save_ok';
            }
            else {
                $errors = $this->formatErrorMessage($form->getMessages());
            }

        }

        $response = array(
            'success' => $success,
            'errors'  => $errors,
            'title' => $translation->translate($textTitle),
            'message' => $translation->translate($textMessage)
        );

        return new JsonModel($response);

    }

    /**
     * @return \Zend\Form\ElementInterface
     */
    private function getForm()
    {

        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        $formConfig = $config->getItem('meliscore/forms/melis_core_platform_color_form');

        $factory      = new \Zend\Form\Factory();
        $formElements = $this->getServiceLocator()->get('FormElementManager');

        $factory->setFormElementManager($formElements);

        $form = $factory->createForm($formConfig);

        return $form;
    }

    /**
     * Returns the a formatted error messages with its labels
     * @param array $errors
     * @return array
     */
    private function formatErrorMessage($errors = array())
    {
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('meliscore/forms/melis_core_platform_color_form');
        $appConfigForm = $appConfigForm['elements'];

        foreach ($errors as $keyError => $valueError)
        {
            foreach ($appConfigForm as $keyForm => $valueForm)
            {
                if ($valueForm['spec']['name'] == $keyError &&
                    !empty($valueForm['spec']['options']['label']))
                    $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
            }
        }

        return $errors;
    }
}