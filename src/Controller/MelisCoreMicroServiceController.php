<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\View\Model\JsonModel;
use Laminas\View\Model\ViewModel;
use Laminas\Db\ResultSet\HydratingResultSet;
use Laminas\Session\Container;

class MelisCoreMicroServiceController extends MelisAbstractActionController
{
    /**
     * This handles the requests and the displays of the
     * requested service and method
     * @return JsonModel
     */
    public function runAction()
    {
        $success = false;
        $message = 'tr_meliscore_microservice_api_key_no_access';
        $data = [];
        $errors = [];
        $hasError = false;
        $apiKey = $this->params()->fromRoute('api_key');
        $module = ucfirst($this->params()->fromRoute('module'));
        $service = ucfirst($this->params()->fromRoute('service_alias'));
        $method = $this->params()->fromRoute('service_method');

        $translator = $this->getServiceManager()->get('translator');
        $userApiData = $this->getMicroServiceAuthTable()->getUserByApiKey($apiKey)->current();

        /**
         * If user API data is not empty, then proceed on checking its' content
         */
        if ($userApiData) {

            // set the langauge 
            $melisLangTable = $this->getServiceManager()->get('MelisCore\Model\Tables\MelisLangTable');
            $langData = $melisLangTable->getEntryById($userApiData->usr_lang_id)->current();
            if($langData) {
                $container = new Container('meliscore');
                $container['melis-lang-locale'] = $langData->lang_locale;
            }

            /**
             * check whether user's accessibility is still "active" or not
             */
            $isUserCanExec = (bool)$userApiData->msoa_status;

            /**
             * If user's API option is still "active"
             */
            if ($isUserCanExec) {

                // check if the module in the route param exists
                $moduleSvc = $this->getServiceManager()->get('ModulesService');
                $modules = $moduleSvc->getAllModules();

                /**
                 * Checker whether the provided module in the route parameter does exists in Laminas Active Modules
                 */
                if (in_array($module, $modules)) {

                    // check if the service alias exists
                    $config = $this->getServiceManager()->get('config');
                    $services = array_merge($config['service_manager']['aliases'], $config['service_manager']['factories']);
                    $servicesKeys = array_keys($services);
                    
                    /**
                     * Checker whether the requested Service exists in the platform
                     */
                    if (in_array($service, $servicesKeys)) {

                        $tool = $this->getServiceManager()->get('MelisCoreTool');
                        $post = $tool->sanitizeRecursive($this->getRequest()->getPost());

                        $servicePath = "\\$module\\Service\\$service";
                        $methodExists = method_exists($servicePath, $method);
                        //echo func_num_args($servicePath."\\" . $method);
                        $coreConfig = $this->getServiceManager()->get('MelisCoreConfig');
                        $form = $coreConfig->getItem('microservice/' . $module . '/' . $service . '/' . $method);
                       

                        /**
                         * Checker whether the requested method exists in the provided Service, and return JSON if
                         * requested method is POST
                         */
                        if ($post && $methodExists) {
                            /**
                             * If form configuration in app.microservice.php is properly configured depending on the provided
                             * route parameters, then we will use its' configuration to interact with the service
                             * and make an invocation to it using ReflectionMethod so we can get the data that is being
                             * returned after invoking the method.
                             */
                            if ($form) {

                                /**
                                 * This listener trigger allows you to modify the structure of your post data, this is useful whenever your method arguments requires an array argument
                                 * in this way, we would be able to modify its' structure depending the needs of the metod.
                                 */
                                $post = $this->getEventManager()->trigger('melis_core_microservice_route_param', $this, array('module' => $module, 'service' => $service, 'method' => $method, 'post' => $post));

                                /**
                                 * This condition checks whether the trigger returns a good data
                                 */
                                if (isset($post[0]) && isset($post[0]['post'])) {

                                    $post = $post[0]['post'];

                                    $form = $this->getForm($form);
                                    $form->setData($post);

                                    if ($form->isValid()) {

                                        $tmpInstance = new $servicePath();
                                        $tmpInstance->setServiceManager($this->getServiceManager());

                                        $setEventManagerMethodExists = (bool) method_exists($servicePath, 'setEventManager');

                                        if($setEventManagerMethodExists) {
                                            $tmpInstance->setEventManager($this->getEventManager());
                                        }

                                        $reflectionMethod = new \ReflectionMethod($servicePath, $method);

                                        /**
                                         * allow method to accept dynamic arguments
                                         */
                                        $data = $reflectionMethod->invokeArgs($tmpInstance, $post);
                                        

                                        /**
                                         * This listener trigger handles the modification of the results returned by invokeArgs
                                         */
                                        $tmpData = $this->getEventManager()->trigger('melis_core_microservice_amend_data', $this, array('module' => $module, 'service' => $service, 'method' => $method, 'post' => $post, 'results' => $data));
                                      
                                        if(isset($tmpData[0]) && isset($tmpData['0']['results'])) {
                                            $data = $tmpData[0]['results'];
                                        }

                                        // Check data if it's an Object
                                        if(is_object($data)){
                                          
                                            // This will check if the property of an object is protected
                                            $obj = new \ReflectionObject($data);
                                            $objIsProtected = $obj->getProperties(\ReflectionProperty::IS_PROTECTED);

                                            // This is for HydratingResultSet Object
                                            if($data instanceof HydratingResultSet){
                                                $data = $data->toArray();
                                            }

                                            // This is for Object that is protected
                                            if($objIsProtected){
                                                $data = $this->tool()->convertObjectToArray($data);
                                            }
                                        }
                                        // Check data if it's an array
                                        if(is_array($data)){
                                            
                                            $data = $this->tool()->convertObjectToArray($data);
                                        }

                                        $message = 'tr_meliscore_microservice_request_ok';
                                        $success = true;
                                    } else {
                                        $errors = $form->getMessages();
                                    }
                                } else {
                                    $errors['invalid_post_parameters'] = (array) $post;
                                }
                            }

                            /**
                             * If no error encountered, then we will return a JSON response including its' service returned data
                             */
                            if (!$errors) {

                                $response = [
                                    'success'  => $success,
                                    'message'  => $translator->translate($message),
                                    'response' => $data,
                                    'errors'   => $errors
                                ];

                                return new JsonModel($response);
                            } 
                            /**
                             * If provided arguments has errors then return the form with the error message(s)
                             */
                            else {
                                // get the form configuration in app.microservice configuration file
                                $this->layout('layout/layoutBlank');
                                $view = new ViewModel();
                                $view->setTerminal(true);
                                $view->form = $form;
                                $view->methodName = $method;
                                return $view;
                            }
                        } else {
                            /**
                             * If the request method is GET then we display the form
                             */
                            if ($methodExists) {
                                /**
                                 * Display the form that will be used to provide data for the service method arguments
                                 * 
                                 */
                              
                                if ($form) {

                                    //Get the number of arguments passed
                                    $arguments =  new \ReflectionMethod($servicePath, $method);
                                    $numberOfParameters = $arguments->getNumberOfParameters();
                                    //Display the form only when there is parameter(s)
                                    if($numberOfParameters > 0 )
                                     {
                                        // get the form configuration in app.microservice configuration file
                                        $this->layout('layout/layoutBlank');
                                        $view = new ViewModel();
                                        $view->setTerminal(true);
                                        $view->form = $this->getForm($form);
                                        $view->methodName = $method;
                                        return $view;
                                    }
                                    else {

                                        $tmpInstance = new $servicePath();
                                        $tmpInstance->setgetServiceManager($this->getServiceManager());
                                        $reflectionMethod = new \ReflectionMethod($servicePath, $method);

                                         // Check data if it's an Object
                                        if(is_object($data)){
                                          
                                            // This will check if the property of an object is protected
                                            $obj = new \ReflectionObject($data);
                                            $objIsProtected = $obj->getProperties(\ReflectionProperty::IS_PROTECTED);

                                            // This is for HydratingResultSet Object
                                            if($data instanceof HydratingResultSet){
                                                $data = $data->toArray();
                                            }

                                            // This is for Object that is protected
                                            if($objIsProtected){
                                                $data = $this->tool()->convertObjectToArray($data);
                                            }
                                        }
                                        // Check data if it's an array
                                        if(is_array($data)){
                                            
                                            $data = $this->tool()->convertObjectToArray($data);
                                        }

                                        $message = 'tr_meliscore_microservice_request_ok';
                                        $success = true;

                                        if (!$errors) {
                                            $response = [
                                                'success'  => $success,
                                                'message'  => $translator->translate($message),
                                                'response' => $data,
                                                'errors'   => $errors
                                           ];

                                            return new JsonModel($response);
                                        } 
                                    }
                                } else {
                                    $message = 'tr_meliscore_microservice_form_ko';
                                    $hasError = true;
                                }
                            } else {
                                $message = 'tr_meliscore_microservice_method_ko';
                                $hasError = true;
                            }

                        }
                    } else {
                        $message = 'tr_meliscore_microservice_service_ko';
                        $hasError = true;
                    }
                } else {
                    $message = 'tr_meliscore_microservice_module_ko';
                    $hasError = true;
                }

            }else{
                $message = 'tr_meliscore_microservice_api_key_inactive';
                $hasError = true;
            }   


        } else {
            $message = 'tr_meliscore_microservice_api_key_invalid';
            $hasError = true;
        }

        /**
         * If there's an error, we display the JSON response
         */
        if ($hasError) {
            $response = [
                'success' => $success,
                'message' => $translator->translate($message),
                'response' => $data,
                'errors' => $errors
            ];
            return new JsonModel($response);
        }
        die;

    }

    /**
     * Return the MelisMicroServiceAuthTable Table
     * @return array|object
     */
    private function getMicroServiceAuthTable()
    {
        $table = $this->getServiceManager()->get('MelisMicroServiceAuthTable');

        return $table;
    }

    /**
     * Create a form from the configuration
     * @param $formConfig
     * @return \Laminas\Form\ElementInterface
     */
    private function getForm($formConfig)
    {
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($formConfig);

        return $form;

    }

    /**
     * Return the MelisCoreTool Service
     * @return array|object
     */
    private function tool()
    {
        $melisTool = $this->getServiceManager()->get('MelisCoreTool');
        $melisTool->setMelisToolKey('meliscore', 'meliscore_tool_user');

        return $melisTool;
    }

    public function renderToolUserViewMicroServiceModalHandlerAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->modalContent = $this->tool()->getModal('meliscore_tool_user_microservice_modal');

        return $view;
    }

    public function renderToolUserViewMicroServiceModalAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        $melisTranslation = $this->getServiceManager()->get('MelisCoreTranslation');

        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }

    public function getUserAuthDataAction()
    {
        $success = 0;
        $data = [];
        $request = $this->getRequest();

        if ($request->isPost()) {

            $userId = (int)$request->getPost('id');
            $authData = $this->getMicroServiceAuthTable()->getUser($userId)->current();

            if ($authData) {

                $uri = $request->getUri();
                $host = $uri->getHost();
                $scheme = $uri->getScheme();
                $url = $scheme . '://' . $host.'/melis/api/'.$authData->msoa_api_key;


                $data['api_key'] = $authData->msoa_api_key;
                $data['status']  = $authData->msoa_status;
                $data['user_id'] = $userId;
                $data['url']     = $url;
                $success = 1;
            }

        }

        $response = [
            'success' => $success,
            'response' => $data
        ];

        return new JsonModel($response);
    }

    public function generateApiKeyAction()
    {
        $success = 0;
        $data    = [];
        $request = $this->getRequest();

        if ($request->isPost()) {

            $userId = (int)$request->getPost('id');
            $apiData = $this->getMicroServiceAuthTable()->getUser($userId)->current();

            if (!$apiData) {
                $this->getMicroServiceAuthTable()->save([
                    'msoa_user_id' => $userId,
                    'msoa_status'  => 1,
                    'msoa_api_key' => $this->generateCode()
                ]);

                $authData = $this->getMicroServiceAuthTable()->getUser($userId)->current();

                if ($authData) {

                    $uri = $request->getUri();
                    $host = $uri->getHost();
                    $scheme = $uri->getScheme();
                    $url = $scheme . '://' . $host.'/melis/api/'.$authData->msoa_api_key;

                    $data['api_key'] = $authData->msoa_api_key;
                    $data['status']  = $authData->msoa_status;
                    $data['url']     = $url;
                    $success = 1;
                }
            }
        }

        $response = [
            'success' => $success,
            'response' => $data
        ];

        return new JsonModel($response);
    }
    public function modifyResultAction()
    {
        $success = 0;
        $data = [];
        $request = $this->getRequest();

        if ($request->isPost()) {

            $userId = (int)$request->getPost('id');
            $authData = $this->getMicroServiceAuthTable()->getUser($userId)->current();

            $authData['result'] = $authData;

        }

        $response = [
            'success' => $success,
            'response' => $data
        ];

        return new JsonModel($response);
    }

    public function updateStatusAction()
    {
        $success = 0;
        $data    = [];
        $request = $this->getRequest();

        if ($request->isPost()) {

            $userId  = (int) $request->getPost('id');
            $status  = (int) $request->getPost('status');
            $apiData = $this->getMicroServiceAuthTable()->getUser($userId)->current();

            if ($apiData) {
                $this->getMicroServiceAuthTable()->save([
                    'msoa_status'  => $status,
                ], $apiData->msoa_id);
                $success = 1;
            }
        }

        $response = [
            'success'  => $success,
            'response' => $data
        ];

        return new JsonModel($response);
    }

    private function generateCode($length = 16)
    {
        $characters = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ=';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }

        $data = $this->getMicroServiceAuthTable()->getUserByApiKey($randomString)->current();
        if($data) {
            $this->generateCode($length);
        }
        else {
            return $randomString;
        }

    }

    /**
     * generate all available list of Microservices
     */
    public function microServicesListAction()
    {

        $view         = new ViewModel();
        $translator   = $this->getServiceManager()->get('translator');
        $apiKey       = trim($this->params()->fromRoute('api_key', ''));
        $userExists   = false;
        $microservice = array();
        $userApiData  = $this->getMicroServiceAuthTable()->getUserByApiKey($apiKey)->current(); 
        $apiStatus    = '';
        $toolTranslator = $this->getServiceManager()->get('MelisCoreTranslation');
        

        

        if($userApiData) {
            
            $apiStatus = $userApiData->msoa_status;
            $userStatus = $userApiData->usr_status;
            // to validate the API key if it's Active or Inactvie
            if($apiStatus && $userStatus){
                $config       = $this->getServiceManager()->get('MelisCoreConfig');
                $microservice = $config->getItem('microservice');
             
                // set the langauge 
                $melisLangTable = $this->getServiceManager()->get('MelisCore\Model\Tables\MelisLangTable');
                $langData = $melisLangTable->getEntryById($userApiData->usr_lang_id)->current();
                if($langData) {
                    $container = new Container('meliscore');
                    $container['melis-lang-locale'] = $langData->lang_locale;
                }

                //Exclude array 'conf' key
                if(array_key_exists('conf',$microservice)){
                    unset($microservice['conf']);
                }
                $userExists   = true;

            }else{
                $message = 'tr_meliscore_microservice_api_key_inactive';
                if (!$userStatus) {
                    $message = 'tr_meliscore_microservice_user_inactive';
                }

                if (!$apiStatus && !$userStatus) {
                    $message = 'tr_meliscore_microservice_user_api_inactive';
                }

                echo "&nbsp;&nbsp;" .$translator->translate($message);
            }
         
        }
        else{

        }
     
        $view->userExists   = $userExists;
        $view->microservice = $microservice;
        $view->apiKey       = $apiKey;
        $view->title       = 'tr_meliscore_microservice_title';
        return $view;
    }


}
