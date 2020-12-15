<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\Session\Container;
use Laminas\View\Model\JsonModel;

class MelisTinyMceController extends MelisAbstractActionController
{
    const MINI_TEMPLATES_FOLDER = 'miniTemplatesTinyMce';

    public function getTinyMceConfigAction()
    {
        $success = 0;
        $tinyMCEconfig = '';
        $request = $this->getRequest();

        if ($request->isPost()) {
            $modulesSvc = $this->getServiceManager()->get('ModulesService');
            // Getting the Posted Values
            $postValues = $request->getPost()->toArray();

            $type = $postValues['type'];
            $selector = $postValues['selector'];
            $options = !empty($postValues['options']) ? $postValues['options'] : array();

            // Get the list of TinyMce configuration files declared
            $config = $this->getServiceManager()->get('config');
            $configTinyMce = $config['tinyMCE'];

            // Checking if the type requested is exist on configuration
            if (isset($configTinyMce[$type])) {
                $configDir = $configTinyMce[$type];
                // Getting the module name
                $nameModuleTab = explode('/', $configDir);
                $nameModule = $nameModuleTab[0];
                // Getting the path of the Module
                $path = $modulesSvc->getModulePath($nameModule);
                // Generating the directory of the requested TinyMCE configuration
                $tinyMCEconfig = $path . str_replace($nameModule, '', $configDir);
            }

            if (!is_null($tinyMCEconfig)) {
                // Getting the tinyMCE configuration from php file
                $tinyMCEconfig = include($tinyMCEconfig);
                // Assigning selector of the tinyMCE
                $tinyMCEconfig['selector'] = (!empty($selector)) ? $selector : '';
                // Set Language of the TinyMCE
                $container = new Container('meliscore');
                $locale = $container['melis-lang-locale'];
                $tinyMCEconfig['language'] = ($locale != 'en_EN') ? $locale : 'en';

                if (!empty($options)) {

                    // Parsing boolean values from posted string values
                    $options = array_map(function($val){
                        if (in_array($val, ["true", "false"]))
                            return ($val == "true") ?? false;
                        else
                            return $val;
                    }, $options);

                    // Merging Default TinyMCE configuration with Options from request
                    $tinyMCEconfig = array_merge($tinyMCEconfig, $options);
                }
                $success = 1;
            }

            /**
             * This listener is for users or developers who wants to extend the functionality of tinyMCE, especially when adding new extensions.
             */

            $config = $this->getEventManager()->trigger('meliscore_tinymce_config', $this);
            $tmpCfg = array();

            // reconstruct data
            foreach ($config as $configKey => $cfg) {

                if ($cfg) {
                    foreach ($cfg['configuration'] as $configKey => $configVal) {
                        $tmpCfg[$configKey] = $configVal;
                    }
                }

                if (isset($cfg['exclude']) && !empty($cfg['exclude'])) {
                    // remove the excluded configuration(s)
                    foreach ($cfg['exclude'] as $exclude) {
                        if (isset($tmpCfg[$exclude])) {
                            unset($tmpCfg[$exclude]);
                        }
                    }
                }
            }

            // merge reconstructed data to tinyMCE configuration
            foreach ($tmpCfg as $idx => $cfg) {
                if ($cfg) {
                    // get the merged and additional tinyMCE configurations
                    $tinyMCEconfig = \Laminas\Stdlib\ArrayUtils::merge($tinyMCEconfig, $cfg);
                }
            }

        }

        $response = array(
            'success' => $success,
            'config' => $tinyMCEconfig
        );

        return new JsonModel($response);
    }

    public function reconfigureTinyMce()
    {
        $success = 0;
        $tinyMCEconfig = '';
        $request = $this->getRequest();

        $modulesSvc = $this->getServiceManager()->get('ModulesService');
        // Getting the Posted Values
        $postValues = $request->getPost()->toArray();

        $type = $postValues['type'];
        $selector = $postValues['selector'];
        $options = !empty($postValues['options']) ? $postValues['options'] : array();

        // Get the list of TinyMce configuration files declared
        $config = $this->getServiceManager()->get('config');
        $configTinyMce = $config['tinyMCE'];

        return $configTinyMce;
    }

    /**
     * This method sends back the list of mini-templates for TinyMCE
     * It takes the site ID as a parameter, determines the website folder
     * in order to list only the mini-templates of the website and not
     * all of them
     *
     * @return \Laminas\View\Model\JsonModel
     */
    public function getTinyTemplatesAction()
    {
        $siteId = $this->params()->fromRoute('siteId', $this->params()->fromQuery('siteId', ''));
        $tinyTemplates = [];

        if (!empty($siteId)) {
            /** @var \MelisEngine\Model\Tables\MelisTemplateTable $tplTable */
            $tplTable = $this->getServiceManager()->get('MelisEngineTableTemplate');
            $siteData = $tplTable->getData(null, $siteId, null, null, null, null, 1);
            if (!empty($siteData)) {
                $siteData = $siteData->toArray();
                $siteData = reset($siteData);
                $moduleName = $siteData['tpl_zf2_website_folder'];
                $publicPath = '/public/' . self::MINI_TEMPLATES_FOLDER;

                // Checking if the module path is vendor
                $composerSrv = $this->getServiceManager()->get('ModulesService');
                $path = $composerSrv->getComposerModulePath($moduleName);
                if (!empty($path)) {
                    $folderSite = $path . $publicPath;
                } else {
                    $folderSite = $_SERVER['DOCUMENT_ROOT'] . '/../module/MelisSites/' . $moduleName . $publicPath;
                }

                // List the mini-templates from the folder
                if (is_dir($folderSite)) {
                    if ($handle = opendir($folderSite)) {
                        while (false !== ($entry = readdir($handle))) {
                            if (is_dir($folderSite . '/' . $entry) || $entry == '.' || $entry == '..' || !$this->isImage($entry))
                                continue;
                            array_push($tinyTemplates,
                                array(
                                    'title' => $entry,
                                    'url' => "/" . $moduleName . '/' . self::MINI_TEMPLATES_FOLDER . '/' . $entry,
                                    'img' => "/" . $moduleName . '/' . self::MINI_TEMPLATES_FOLDER . '/' . str_replace('phtml', 'png', $entry)
                                )
                            );
                        }

                        closedir($handle);
                    }
                }
            }
        }

        return new JsonModel($tinyTemplates);
    }

    public function uploadImageAction()
    {
        $appConfigForm = [
            'hydrator'  => 'Laminas\Hydrator\ArraySerializable',
            'elements' => [
                [
                    'spec' => [
                        'name' => 'file',
                        'type' => 'file',
                    ],
                ],
            ],
        ];
        // Factoring Mynews event and pass to view
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($appConfigForm);

        $form->setData($this->params()->fromFiles());

        $target = $_SERVER['DOCUMENT_ROOT'].'/media/Uploads/';
        if (!is_dir($target))
            mkdir($target, 0777);

        // File Input
        $fileInput = new \Laminas\InputFilter\FileInput('file');
        $fileInput->setRequired(true);
        $fileInput->getFilterChain()->attachByName(
            'filerenameupload',
            [
                'target'    => $target.'/Uploads', // File name prefix
                'randomize' => true,
                'use_upload_extension' => true,
            ]
        );

        $form->getInputFilter()->add($fileInput);

        $file = null;
        if ($form->isValid()){
            $data = $form->getData();
            $file = '/media/Uploads/' . basename($data['file']['tmp_name']);
        }
        return new JsonModel([
            'location' => $file
        ]);
    }

    function isImage($fileName)
    {
        $image_ext = ['PNG', 'png', 'JPG', 'jpg', 'JPEG', 'jpeg'];
        foreach($image_ext as $ext){
            //if file is image, don't include it
            if(strpos($fileName, $ext) !== false) {
                return false;
            }
        }
        return true;
    }
}

