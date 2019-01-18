<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;
use MelisCore\MelisSetupInterface;

/**
 * @property bool $showOnMarketplacePostSetup
 */
class MelisSetupPostDownloadController extends AbstractActionController implements MelisSetupInterface
{
    /** @var bool $showOnMarketplacePostSetup - flag for Marketplace whether to display the setup form or not */
    public $showOnMarketplacePostSetup = false;

    /**
     * @return \Zend\View\Model\ViewModel
     */
    public function getFormAction()
    {
        $request = $this->getRequest();

        //startSetup button indicator
        $btnStatus = (bool) $request->getQuery()->get('btnStatus');

        $form = $this->getForm();
        $container = new Container('melis_modules_configuration_status');
        $formData = isset($container['formData']) ? (array) $container['formData'] : null;

        if ($formData) {
            $form->setData($formData);
        }

        $view = new ViewModel();
        $view->setTerminal(true);
        $view->setVariable('form', $form);
        $view->btnStatus = $btnStatus;

        return $view;
    }

    /**
     * @return \Zend\View\Model\JsonModel
     */
    public function validateFormAction()
    {
        $success = 0;
        $message = 'tr_install_setup_message_ko';
        $errors = [];

        $data = $this->getTool()->sanitizeRecursive($this->params()->fromRoute());

        $form = $this->getForm();
        $form->setData($data);

        if ($form->isValid()) {
            $success = 1;
            $message = 'tr_install_setup_message_ok';
        } else {
            $errors = $this->formatErrorMessage($form->getMessages());
        }

        $response = [
            'success' => $success,
            'message' => $this->getTool()->getTranslation($message),
            'errors' => $errors,
            'form' => 'melis_core_setup_user_form',
        ];

        return new JsonModel($response);
    }

    /**
     * @return \Zend\View\Model\JsonModel
     */
    public function submitAction()
    {
        $success = 0;
        $message = 'tr_install_setup_message_ko';
        $errors = [];

        $data = $this->getTool()->sanitizeRecursive($this->params()->fromRoute());


        $form = $this->getForm();
        $form->setData($data);


        if ($form->isValid()) {

            $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
            $tableUser = $this->getServiceLocator()->get('MelisCoreTableUser');

            $userLogin = $form->get('login')->getValue();
            $userEmail = $form->get('email')->getValue();
            $password = $melisCoreAuth->encryptPassword($form->get('password')->getValue());
            $userFirstname = $form->get('firstname')->getValue();
            $userLastname = $form->get('lastname')->getValue();


            $container = new Container('melis_modules_configuration_status');
            $hasErrors = false;

            foreach ($container->getArrayCopy() as $module) {
                if (!$module) {
                    $hasErrors = true;
                }
            }

            if (false === $hasErrors) {

                try {

                    $userId = $tableUser->save([

                        'usr_status' => 1,
                        'usr_login' => $userLogin,
                        'usr_email' => $userEmail,
                        'usr_password' => $password,
                        'usr_firstname' => $userFirstname,
                        'usr_lastname' => $userLastname,
                        'usr_lang_id' => 1,
                        'usr_admin' => 1,
                        'usr_role_id' => 1,
                        'usr_rights' => '<?xml version="1.0" encoding="UTF-8"?><document type="MelisUserRights" author="MelisTechnology" version="2.0"><meliscms_pages>
                                        	<id>-1</id>
                                        </meliscms_pages>
                                        <meliscore_interface>
                                        </meliscore_interface>
                                        <meliscore_leftmenu>
                                        	<meliscore_toolstree_section>
                                        	</meliscore_toolstree_section>
                                        	<meliscms_toolstree_section>
                                        	</meliscms_toolstree_section>
                                        	<melismarketing_toolstree_section>
                                        	</melismarketing_toolstree_section>
                                        	<meliscommerce_toolstree_section>
                                        	</meliscommerce_toolstree_section>
                                        	<melisothers_toolstree_section>
                                        	</melisothers_toolstree_section>
                                        	<meliscustom_toolstree_section>
                                        	</meliscustom_toolstree_section>
                                        	<id>meliscore_leftmenu_root</id>
                                        </meliscore_leftmenu>
                                        </document>',
                    ]);

                    $installerSession = new Container('melisinstaller');
                    // save platforms
                    $melisCorePlatformTable = $this->getServiceLocator()->get('MelisCoreTablePlatform');
                    $defaultPlatform = getenv('MELIS_PLATFORM');
                    $platforms = isset($installerSession['environments']) ? $installerSession['environments'] : null;

                    $melisCorePlatformTable->save(['plf_name' => $defaultPlatform]);

                    if (isset($platforms['new'])) {
                        foreach ($platforms['new'] as $platform) {
                            $melisCorePlatformTable->save([
                                'plf_name' => $platform[0]['sdom_env'],
                                'plf_update_marketplace' => 1,
                            ]);
                        }
                    }

                    // Dashboard
                    $this->generateDashboardPlugins($userId);


                    $success = 0;
                    $message = 'tr_install_setup_message_ok';

                } catch (\Exception $e) {
                    $errors = $e->getMessage();
                }


            }

        } else {
            $errors = $this->formatErrorMessage($form->getMessages());
        }

        $response = [
            'success' => $success,
            'message' => $this->getTool()->getTranslation($message),
            'errors' => $errors,
            'form' => 'melis_core_setup_user_form',
        ];

        return new JsonModel($response);
    }

    /**
     * This method generate the dashboard plugins
     * after the setup, this will take all the available dashboard plugins
     * in every module and save to the newly user created
     */
    private function generateDashboardPlugins($userId = 1)
    {
        $melisModules = $_SERVER['DOCUMENT_ROOT'].'/../vendor/melisplatform/';

        $modulePlugins = array();

        foreach (scandir($melisModules) As $val){
            if (!in_array($val, array('.', '..'))){
                if (is_dir($melisModules.$val.'/config/dashboard-plugins')){

                    $modulePluginConfigs = $melisModules.$val.'/config/dashboard-plugins';
                    if (is_dir($modulePluginConfigs)){
                        foreach (scandir($modulePluginConfigs) As $conf){
                            if (!in_array($conf, array('.', '..'))){

                                $pluginConfig = require($modulePluginConfigs.'/'.$conf);
                                if (is_array($pluginConfig['plugins'])){
                                    /**
                                     * Retrieving all available dashboard plugins in every module
                                     * activated to the platform
                                     */
                                    foreach ($pluginConfig['plugins'] As $cKey => $cConf){
                                        if(!empty($cConf['dashboard_plugins'])){
                                            foreach ($cConf['dashboard_plugins'] As $pluginKey => $pluginConf){
                                                // Skipping DragDrapZone plugin
                                                if (!in_array($pluginKey, array('MelisCoreDashboardDragDropZonePlugin'))){
                                                    $modulePlugins[$pluginKey] = $pluginConf;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        /**
         * Generating Dashboard Xml
         */
        $pluginXml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<Plugins>%s'."\n".'</Plugins>';
        $pluginXmlData = '';

        if (!empty($modulePlugins)){
            $pluginIdTime = time();
            $xAxis = 0;
            $yAxis = 0;
            $ctr = 1;
            foreach ($modulePlugins As $plugin => $conf){
                $height = !empty($conf['height']) ? $conf['height'] : 6;
                $width = !empty($conf['width']) ? $conf['width'] : 6;

                // Xml data of each plugin
                $pluginXmlData .= "\n\t".'<plugin plugin="'.$plugin.'" plugin_id="'.$conf['plugin_id'].'_'.$pluginIdTime.'">'."\n";
                $pluginXmlData .= "\t\t".'<x-axis><![CDATA['.$xAxis.']]></x-axis>'."\n";
                $pluginXmlData .= "\t\t".'<y-axis><![CDATA['.$yAxis.']]></y-axis>'."\n";
                $pluginXmlData .= "\t\t".'<height><![CDATA['.$height.']]></height>'."\n";
                $pluginXmlData .= "\t\t".'<width><![CDATA['.$width.']]></width>'."\n";
                $pluginXmlData .= "\t".'</plugin>';

                // Column number of the plugin
                if ($xAxis == 0)
                    $xAxis = 6;
                elseif ($xAxis == 6)
                    $xAxis = 0;

                // Row number of the plugin
                if ($ctr % 2 == 0)
                    $yAxis += 6;

                $ctr++;
            }
        }

        // Creating the final xml of the dashboard plugins
        $pluginXml = sprintf($pluginXml, $pluginXmlData);

        /**
         * Saving dashboard plugins to database
         */
        $pluginDashboard = array(
            'd_dashboard_id' => 'id_meliscore_toolstree_section_dashboard',
            'd_user_id' => $userId,
            'd_content' => $pluginXml,
        );
        $dashboardTbl = $this->getServiceLocator()->get('MelisCoreDashboardsTable');
        $dashboardTbl->save($pluginDashboard);
    }

    /**
     * Returns the Tool Service Class
     * @return MelisCoreTool
     */
    private function getTool()
    {
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('MelisCmsSlider', 'MelisCmsSlider_details');

        return $melisTool;

    }

    /**
     * Create a form from the configuration
     *
     * @param $formConfig
     *
     * @return \Zend\Form\ElementInterface
     */
    private function getForm()
    {
        $coreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $form = $coreConfig->getItem('melis_core_setup/forms/melis_core_setup_user_form');

        $factory = new \Zend\Form\Factory();
        $formElements = $this->serviceLocator->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($form);

        return $form;

    }

    /**
     * @param array $errors
     *
     * @return array
     */
    private function formatErrorMessage($errors = [])
    {
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('melis_core_setup/forms/melis_core_setup_user_form');
        $appConfigForm = $appConfigForm['elements'];

        foreach ($errors as $keyError => $valueError) {
            foreach ($appConfigForm as $keyForm => $valueForm) {
                if ($valueForm['spec']['name'] == $keyError &&
                    !empty($valueForm['spec']['options']['label'])) {
                    $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
                }
            }
        }

        return $errors;
    }
}
