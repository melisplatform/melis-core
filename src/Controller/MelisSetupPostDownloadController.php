<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\Session\Container;
use Laminas\View\Model\JsonModel;
use Laminas\View\Model\ViewModel;
use MelisCore\MelisSetupInterface;
use MelisMarketPlace\Support\MelisMarketPlace as MarketPlace;
use MelisMarketPlace\Support\MelisMarketPlaceCmsTables as Melis;
use MelisMarketPlace\Support\MelisMarketPlaceSiteInstall as Site;

/**
 * @property bool $showOnMarketplacePostSetup
 */
class MelisSetupPostDownloadController extends MelisAbstractActionController implements MelisSetupInterface
{
    /**
     * flag for Marketplace whether to display the setup form or not
     * @var bool $showOnMarketplacePostSetup
     */
    public $showOnMarketplacePostSetup = false;

    protected $formConfigPath = 'MelisCore/' . MarketPlace::DOWNLOAD . '/' . MarketPlace::FORM . '/melis_core_setup_user_form';

    /**
     * @return \Laminas\View\Model\ViewModel
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
     * @return \Laminas\View\Model\JsonModel
     */
    public function validateFormAction()
    {
        $success = false;
        $message = 'tr_install_setup_message_ko';
        $errors = [];

        $data = $this->getTool()->sanitizeRecursive($this->params()->fromRoute('post', $this->getRequest()->getPost()));

        $form = $this->getForm();
        $form->setData($data);

        if ($form->isValid()) {
            $success = true;
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
     * @return \Laminas\View\Model\JsonModel
     */
    public function submitAction()
    {
        $success = false;
        $message = 'tr_install_setup_message_ko';
        $errors = [];

        $data = $this->getTool()->sanitizeRecursive($this->params()->fromRoute('post', $this->getRequest()->getPost()));


        $form = $this->getForm();
        $form->setData($data);


        if ($form->isValid()) {

            $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
            $tableUser = $this->getServiceManager()->get('MelisCoreTableUser');

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
                                        <melis_dashboardplugin>
                                            <id>melis_dashboardplugin_root</id>
                                        </melis_dashboardplugin>
                                        </document>',
                    ]);

                    $installerSession = new Container('melisinstaller');
                    // save platforms
                    $melisCorePlatformTable = $this->getServiceManager()->get('MelisCoreTablePlatform');
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

                    // save to password history service
                    $passwordHistService = $this->getServiceManager()->get('MelisUpdatePasswordHistoryService');
                    $passwordHistService->saveItem($userId, $password);
                    $success = true;
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
     * after the setup, this will display the
     * MelisCoreDashboardAnnouncementPlugin as default plugin
     *
     * @param int $userId
     */
    private function generateDashboardPlugins($userId = 1)
    {
        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $announcementConfig = $melisConfig->getItem('MelisCoreDashboardAnnouncementPlugin');
        $datas = $announcementConfig['datas'];

        if(!empty($datas['plugin'])) {
            //construct plugins in xml
            $xml = '<?xml version="1.0" encoding="UTF-8"?><Plugins>';

            $pluginId = $datas['plugin_id'] . '_' . time();
            $xml .= '<plugin plugin="' . $datas['plugin'] . '" plugin_id="' . $pluginId . '">
                                <x-axis><![CDATA[' . $datas["x-axis"] . ']]></x-axis>
                                <y-axis><![CDATA[' . $datas["y-axis"] . ']]></y-axis>
                                <height><![CDATA[' . $datas["height"] . ']]></height>
                                <width><![CDATA[' . $datas["width"] . ']]></width>
                            </plugin>';

            $xml .= '</Plugins>';

            $dashboardSrv = $this->getServiceManager()->get('MelisCoreDashboardsTable');

            //set default dashboard plugin to user
            $dashboardSrv->save([
                'd_dashboard_id' => 'id_meliscore_toolstree_section_dashboard',
                'd_user_id' => $userId,
                'd_content' => $xml
            ]);
        }
    }

    /**
     * Returns the Tool Service Class
     * @return MelisCoreTool
     */
    private function getTool()
    {
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('MelisCmsSlider', 'MelisCmsSlider_details');

        return $melisTool;

    }

    /**
     * Create a form from the configuration
     *
     * @param $formConfig
     *
     * @return \Laminas\Form\ElementInterface
     */
    private function getForm()
    {
        $coreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $form = $coreConfig->getItem($this->formConfigPath);

        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
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
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem($this->formConfigPath);
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
