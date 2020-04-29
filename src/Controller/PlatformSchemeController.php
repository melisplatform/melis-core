<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\Session\ValidatorChain;
use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use MelisCore\Service\MelisCoreRightsService;
use Laminas\Validator\File\IsImage;
use Laminas\File\Transfer\Adapter\Http;
use Laminas\Validator\File\Size;
use Laminas\Validator\File\Extension;
use Laminas\Validator;
/**
 * Platform Color Tool
 */
class PlatformSchemeController extends AbstractActionController
{

    const SCHEME_FOLDER_PERMISSION = 0755;

    /**
     * Tool display container
     * @return ViewModel
     */
    public function toolContainerAction()
    {

        $form = $this->getForm();
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $view = new ViewModel();

        $view->melisKey = $this->getMelisKey();
        $view->hasAccess = $this->hasAccess($melisKey);

        $schemeData = $this->getPlatformSchemeSvc()->getCurrentScheme();

        if ($schemeData) {
            $colors = json_decode($schemeData->getColors(), true);
            if ($colors) {
                $form->setData($colors);
            }
        }

        $view->setVariable('form', $form);
        $view->schemes = $schemeData;

        return $view;
    }



    public function saveAction()
    {
        $success      = 0;
        $errors       = array();
        $textTitle    = 'tr_meliscore_platform_scheme';
        $textMessage  = 'tr_meliscore_platform_scheme_save_ko';
        $request      = $this->getRequest();
        $imgErrors    = array();
        $folderErrors = array();
        // for now directly modify the MELIS_SCHEME_1
        $schemeId = 2;

        if ($request->isPost()) {

            $invalidImageError = $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_image_is_invalid');
            $post              = $this->melisTool()->sanitizeRecursive($request->getPost()->toArray());
            $colors            = isset($post['colors']) ? $post['colors'] : null;
            $images            = $request->getFiles()->toArray();
            $form              = $this->getForm();

            $form->setData(json_decode($colors, 1));

            if ($form->isValid()) {


                /**
                 * Flag holder for file input that has file(s) uploaded
                 */
                $nonEmptyImages = array();

                /**
                 * Validator for file image extension
                 */
                $extension = new Extension(array(
                    'extension' => $this->getAllowedUploadableExtension(),
                    'messages' => array(
                        'fileExtensionFalse' => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_image_invalid_extension'),
                        'fileExtensionNotFound' => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_image_invalid_extension'),
                    )
                ));

                /**
                 * Validator which checks if the file is an image
                 */
                $imgValidator = new IsImage();

                /**
                 * check for uploaded images, if input file has uploaded an image then store
                 * it on a temporary array.
                 */
                foreach($images as $name => $image) {
                    if(isset($image['name']) && !empty($image['name'])) {
                        $nonEmptyImages[] = $name;
                    }
                }


                /**
                 * Apply validation before uploading
                 */
                foreach($nonEmptyImages as $idx => $name) {

                    /**
                     * this will check if the file ext of the uploaded file is valid
                     */
                    if(!$extension->isValid($images[$name])) {
                        $imgErrors[$name] = array(
                            'fileExtensionFalse' => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_image_invalid_extension'),
                            'label'              => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_form_'.$name)
                        );
                    } else {
                        /**
                         * if valid, then will check if it is a valid image, this is to avoid PHP eval exploitation
                         */
                        if(!$imgValidator->isValid($images[$name])) {
                            $imgErrors[$name] = array(
                                'invalidImage' => $invalidImageError,
                                'label'        => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_form_'.$name)
                            );
                        }
                    }
                }

                /**
                 * If there's no error on the first checking, then prepare it for uploading
                 */
                if(empty($imgErrors)) {

                    /**
                     * This will get/create the platform-scheme folder inside media folder
                     */
                    $platformSchemeMediaPath = $this->getSchemeFolder();

                    /**
                     * Absolute and physical path where the file image should be uploaded
                     */
                    $absPath = $_SERVER['DOCUMENT_ROOT'].$platformSchemeMediaPath;

                    /**
                     * Check if the physical directory exist
                     */
                    if(file_exists($absPath)) {

                        /**
                         * and if it is writable
                         */
                        if(is_writable($absPath)) {

                            /**
                             * image file size  validator
                             */
                            $imageMaxSize = $this->getMaxImageSize();
                            $size         = new Size(array(
                                'max' => $imageMaxSize,
                                'messages' => array(
                                    'fileSizeTooBig'   => $this->melisTool()->getTranslation('tr_meliscommerce_documents_upload_too_small',
                                        array( $this->convertWithBytes($imageMaxSize) )),
                                    'fileSizeNotFound' => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_image_not_exist'),
                                )
                            ));


                            /**
                             * this will hold the data that will be used in saving into the table
                             */
                            $savableData = array();

                            foreach($nonEmptyImages as $idx => $name) {

                                $fileName = $images[$name]['name'];

                                /**
                                 * Create new instance for Http
                                 */
                                $adapter = new Http();

                                // re-apply validators for second checking
                                $adapter->setValidators(array($size, $extension), $name);

                                if($adapter->isValid($name)) {

                                    /**
                                     * Set the path where the file(s) should be uploaded
                                     */
                                    $adapter->setDestination($absPath);

                                    /**
                                     * Forece override file if the file already exists
                                     */
                                    $adapter->addFilter('FileRename', array(
                                        'target'    => $fileName,
                                        'overwrite' => true,
                                    ));

                                    /**
                                     * upload images to platform-scheme directory
                                     */
                                    if($adapter->receive($name)) {
                                        /**
                                         * Store to $savableData if file upload was successful
                                         */
                                        $savableData['pscheme_'.$name] = $platformSchemeMediaPath . $fileName;
                                    }
                                }
                                else {

                                    $adapterError = $adapter->getMessages();

                                    /**
                                     * this will display the errors from the adapter error messages
                                     */
                                    if($adapterError && is_array($adapterError)) {
                                        foreach($adapterError as $key => $message) {
                                            $imgErrors[$name] = array(
                                                $key     => $invalidImageError,
                                                $message => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_form_'.$name)
                                            );
                                        }
                                    }

                                }
                            }

                            /**
                             * Validation for Sidebar header title
                             */
                            $sidebarHeaderTitle = isset($post['sidebar_header_text']) ? $post['sidebar_header_text'] : $this->melisTool()->getTranslation('tr_meliscore_header Title');
                            $validatorChain     = new Validator\ValidatorChain();

                            $validatorChain->attach(
                                new Validator\StringLength(array(
                                    'min' => 5,
                                    'max' => 45,
                                    'messages' => array(
                                        Validator\StringLength::TOO_LONG => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_sidebar_header_title_too_long'),
                                        Validator\StringLength::TOO_SHORT => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_sidebar_header_title_too_short')
                                    )
                                ))
                            );

                            if(!$validatorChain->isValid($sidebarHeaderTitle)) {
                                $chainErrors = $validatorChain->getMessages();
                                foreach($chainErrors as $errKey => $errVal) {
                                    $imgErrors['sidebar_header_text'] = array(
                                        $errKey => $errVal,
                                        'label' => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_form_sidebar_header_title')
                                    );
                                }
                            }

                            /**
                             * Check again whether the $imgErrors is cleared with errors
                             */
                            if(empty($imgErrors)) {
                                /**
                                 * update database, for now directly modify MELIS_PLATFORM_SCHEME_1
                                 */
                                $data = array_merge(array(
                                    'pscheme_colors' => $colors,
                                    'pscheme_sidebar_header_text' => $sidebarHeaderTitle
                                    ), $savableData);
                                $success = $this->getPlatformSchemeSvc()->saveScheme($data, $schemeId, true);

                                /**
                                 * Return "1" if saving was successful
                                 */
                                if($success) {

                                    // generate a new scheme.css file in public
                                    ini_set('memory_limit', '-1');
                                    set_time_limit(0);
                                    $content = $this->melisTool()->getViewContent([
                                        'module' => 'MelisCore',
                                        'controller' => 'PlatformScheme',
                                        'action' => 'getStyleColorCss'
                                    ]);
                                    $assetsFolder = $_SERVER['DOCUMENT_ROOT'].'/assets/css/';

                                    if(file_exists($assetsFolder)) {

                                        file_put_contents($assetsFolder.'schemes.css', $content);
                                    }
                                    else {
                                        mkdir($assetsFolder, 0777, true);
                                        file_put_contents($assetsFolder.'schemes.css', $content);
                                    }

                                    $success = 1;
                                    $textMessage = 'tr_meliscore_platform_scheme_save_ok';
                                }
                            }

                        }
                        // <!-- end is_writable -->
                        else {
                            $folderErrors['platform_scheme'] = array(
                                'folderNotExists' => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_folder_no_permission'),
                                'label'           => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme')
                            );
                        }
                    }
                    // <!-- end file_exists -->
                    else {

                        $folderErrors['platform_scheme_folder'] = array(
                            'folderNotExists' => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme_folder_not_exists'),
                            'label'           => $this->melisTool()->getTranslation('tr_meliscore_platform_scheme')
                        );
                    }
                }

            } else {
                $errors = $this->formatErrorMessage($form->getMessages());
            }

        }

        $response = array(
            'success' => $success,
            'errors'  => array_merge($errors, $imgErrors, $folderErrors),
            'textTitle'   => $this->melisTool()->getTranslation($textTitle),
            'textMessage' => $this->melisTool()->getTranslation($textMessage)
        );

        $this->getEventManager()->trigger('melis_core_platform_scheme_save_end', $this, array_merge($response, array('typeCode' => 'CORE_PLATFORM_SCHEME_SAVE', 'itemId' => $schemeId, 'id' => $schemeId)));

        return new JsonModel($response);

    }


    /**
     * @return JsonModel
     */
    public function resetToDefaultAction()
    {
        $success      = 0;
        $request      = $this->getRequest();
        /*$message      = 'Failed to restore platform scheme';
        $title        = 'Restore platform scheme';*/
        $message      = 'tr_meliscore_platform_scheme_failed_restore_message';
        $title        = 'tr_meliscore_platform_scheme_failed_restore_title';
        // for now directly modify the MELIS_SCHEME_1
        $schemeId = 2;

        if ($request->isXmlHttpRequest()) {

            $success  = $this->getPlatformSchemeSvc()->resetScheme($schemeId);
            // generate a new scheme.css file in public
            ini_set('memory_limit', '-1');
            set_time_limit(0);
            $content = $this->melisTool()->getViewContent([
                'module' => 'MelisCore',
                'controller' => 'PlatformScheme',
                'action' => 'getStyleColorCss'
            ]);
            $assetsFolder = $_SERVER['DOCUMENT_ROOT'].'/assets/css/';

            if(file_exists($assetsFolder)) {
                file_put_contents($assetsFolder.'schemes.css', $content);
            }
            else {
                mkdir($assetsFolder, 0777, true);
                file_put_contents($assetsFolder.'schemes.css', $content);
            }
            $message  = 'tr_meliscore_platform_scheme_success_restore_message';
        }

        $response = array(
            'success' => $success,

            'textTitle'   => $this->melisTool()->getTranslation($title),
            'textMessage' => $this->melisTool()->getTranslation($message)
        );

        $this->getEventManager()->trigger('melis_core_platform_scheme_save_end', $this, array_merge($response, array('typeCode' => 'CORE_PLATFORM_SCHEME_RESET', 'itemId' => $schemeId, 'id' => $schemeId)));

        return new JsonModel($response);
    }

    /**
     * Generates a dynamic CSS virtual file that will be rendered
     * in the platform
     * @return ViewModel
     */
    public function getStyleColorCssAction()
    {
        $primaryColor = null;
        $secondaryColor = null;
        $view = new ViewModel();
        $response = $this->getResponse();

        $view->setTerminal(true);

        $response->getHeaders()
            ->addHeaderLine('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0')
            ->addHeaderLine('Pragma'       , 'no-cache')
            ->addHeaderLine('Content-Type' , 'text/css;charset=UTF-8');

        $schemeData = $this->getPlatformSchemeSvc()->getCurrentScheme(true);

        if ($schemeData) {

            $colors = json_decode($schemeData->getColors(), true);

            if (is_array($colors)) {
                foreach ($colors as $colorKey => $colorValue) {
                    $view->$colorKey = $colorValue;
                }
            }
        }

        return $view;
    }

    public function getCssAction()
    {

        $content = $this->melisTool()->getViewContent([
            'module' => 'MelisCore',
            'controller' => 'PlatformScheme',
            'action' => 'getStyleColorCss'
        ]);

        echo $content;
        die;
    }

    /**
     * @return \Laminas\Form\ElementInterface
     */
    private function getForm()
    {

        $config = $this->getServiceManager()->get('MelisCoreConfig');
        $formConfig = $config->getItem('meliscore/forms/melis_core_platform_scheme_form');

        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');

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
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getItem('meliscore/forms/melis_core_platform_scheme_form');
        $appConfigForm = $appConfigForm['elements'];

        foreach ($errors as $keyError => $valueError) {
            foreach ($appConfigForm as $keyForm => $valueForm) {
                if ($valueForm['spec']['name'] == $keyError &&
                    !empty($valueForm['spec']['options']['label'])
                )
                    $errors[$keyError]['label'] = $valueForm['spec']['options']['label'];
            }
        }

        return $errors;
    }

    /**
     * Returns the MelisCoreTool service
     * @return array|object
     */
    private function melisTool()
    {
        return $this->getServiceManager()->get('MelisCoreTool');
    }

    /**
     * Returns the URI path of the platform scheme folder inside media folder
     * @return string
     */
    private function getSchemeFolder()
    {
        $uriPath = '/media/platform-scheme/';
        $config  = $this->getServiceManager()->get('MelisCoreConfig');
        $path    = $config->getItem('meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree_section/interface/meliscore_tool_system_config/interface/meliscore_tool_platform_scheme');

        if($path) {
            $uriPath = isset($path['datas']['platform_scheme_dir']) ? $path['datas']['platform_scheme_dir'] : '/media/platform-scheme/';
        }

        $docRoot      = $_SERVER['DOCUMENT_ROOT'] . '';
        $schemeFolder = $docRoot.$uriPath;

        // check if the folder exists
        if(!file_exists($schemeFolder)) {
            mkdir($schemeFolder, self::SCHEME_FOLDER_PERMISSION,true);
        }
        else {
            // check writable permission
            if(!is_writable($schemeFolder)) {
                chmod($schemeFolder, self::SCHEME_FOLDER_PERMISSION);
            }
        }

        return $uriPath;
    }

    /**
     * Checks whether the user has access to this tools or not
     * @param $key
     * @return bool
     */
    private function hasAccess($key): bool
    {
        $hasAccess = $this->getServiceManager()->get('MelisCoreRights')->canAccess($key);

        return $hasAccess;
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
     * Returns the formatted byte size
     * @param $size
     * @return string
     */
    private function convertWithBytes($size)
    {
        $precision = 2;
        $base      = log($size, 1024);
        $suffixes  = array('B', 'KB', 'MB', 'GB', 'TB');
        $bytes     = round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];

        return $bytes;
    }

    /**
     * Returns the maximum file image size from the configuration
     * @return null|long
     */
    private function getMaxImageSize()
    {
        $config    = $this->getServiceManager()->get('MelisCoreConfig');
        $path      = $config->getItem('meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree_section/interface/meliscore_tool_system_config/interface/meliscore_tool_platform_scheme');
        $imagesize = null;


        if($path) {
            $imageSize = isset($path['datas']['image_size_limit']) ? $path['datas']['image_size_limit'] : null;
        }

        return $imageSize;
    }

    /**
     * Returns the allowed extensions that can be uploaded
     * @return null|string
     */
    public function getAllowedUploadableExtension()
    {
        $config = $this->getServiceManager()->get('MelisCoreConfig');
        $path   = $config->getItem('meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree_section/interface/meliscore_tool_system_config/interface/meliscore_tool_platform_scheme');
        $ext    = null;


        if($path) {
            $ext = isset($path['datas']['allowed_file_extension']) ? $path['datas']['allowed_file_extension'] : 'jpeg,jpg,png,svg,ico,gif';
        }

        return $ext;
    }

    /**
     * Returns the instance of MelisCorePlatformSchemeService
     * @return array|object
     */
    public function getPlatformSchemeSvc()
    {
        return $this->getServiceManager()->get('MelisCorePlatformSchemeService');
    }

}
