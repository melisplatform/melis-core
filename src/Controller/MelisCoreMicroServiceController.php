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
     * Outil auquel ce contrôleur appartient (audit DEKRA 7.0) : MelisCoreAuthorizationListener
     * vérifie canAccess() sur cette clé AVANT le dispatch.
     */
    const MELIS_KEY = 'meliscore_tool_user';

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
        // SECURITY (audit H8) : la clé peut désormais arriver en header X-Melis-Api-Key
        // (une URL part dans les access logs / proxys / Referer). Le segment d'URL reste
        // supporté — strictement additif, aucune intégration existante ne casse.
        if (empty($apiKey)) {
            $headerKey = $this->getRequest()->getHeader('X-Melis-Api-Key');
            if ($headerKey) {
                $apiKey = trim($headerKey->getFieldValue());
            }
        }
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
             * SECURITY (audit H8) : la clé meurt avec son propriétaire — compte supprimé
             * (jointure LEFT sans correspondance : usr_id NULL) ou désactivé ⇒ refus.
             * L'offboarding d'un utilisateur coupe donc aussi son accès machine.
             */
            $isUserCanExec = (bool)$userApiData->msoa_status
                && !empty($userApiData->usr_id)
                && (int) $userApiData->usr_status === 1;

            /**
             * SECURITY (audit C4) : la clé ne suffit pas — le service demandé doit être
             * explicitement activé pour le PORTEUR de la clé (section <meliscore_microservice>
             * de ses droits, éditée dans le BO React ; allow-list, default-DENY). Admin :
             * bypass, comme partout ailleurs dans la plateforme.
             */
            $serviceAccessDenied = false;
            if ($isUserCanExec
                && !$this->isMicroserviceAllowedForKeyOwner($userApiData, $module, $service)) {
                $isUserCanExec = false;
                $serviceAccessDenied = true;
            }

            /**
             * SECURITY (audit H8) : trace applicative de chaque appel API — la table
             * melis_core_microservice_logs existait depuis l'installation mais n'était
             * jamais alimentée (une clé volée était indétectable). La clé est EXPURGÉE
             * de l'URL journalisée ; le log ne fait jamais échouer l'appel.
             */
            try {
                $logDb = $this->getServiceManager()->get('Laminas\Db\Adapter\AdapterInterface');
                $logPayload = json_encode([
                    'target'  => $module . '/' . $service . '/' . $method,
                    'allowed' => $isUserCanExec,
                    'denied_reason' => $isUserCanExec ? null : ($serviceAccessDenied ? 'service_not_granted' : 'key_or_owner_inactive'),
                ], JSON_UNESCAPED_SLASHES);
                $logUrl = str_replace((string) $apiKey, '***', (string) $this->getRequest()->getUriString());
                $logDb->query(
                    'INSERT INTO melis_core_microservice_logs (msl_user_id, msl_payload, msl_url) VALUES (?, ?, ?)',
                    [(int) ($userApiData->msoa_user_id ?? 0), substr((string) $logPayload, 0, 4000), substr($logUrl, 0, 2000)]
                );
            } catch (\Throwable $logError) {
                // journal best-effort
            }

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
                                         * Build POSITIONAL arguments in the method's parameter order.
                                         *
                                         * The service methods take positional args (e.g. addUser($login, $status, …)),
                                         * but the microservice form fields are named after the DB/business fields
                                         * (uac_login, uac_status, …), NOT the parameter names — only their ORDER
                                         * matches. Passing the associative $post straight to invokeArgs worked on
                                         * PHP 7 (keys ignored, used positionally) but BREAKS on PHP 8, where string
                                         * keys are treated as NAMED arguments → "Unknown named parameter $x".
                                         *
                                         * So we map the Nth declared parameter to the Nth form element's posted
                                         * value (form elements are declared in parameter order); missing values
                                         * fall back to the parameter default (or null). This restores the intended
                                         * positional invocation and ignores any extra posted keys.
                                         */
                                        $formElements = array_values($form->getElements());
                                        $args = [];
                                        foreach ($reflectionMethod->getParameters() as $i => $param) {
                                            $elementName = isset($formElements[$i]) ? $formElements[$i]->getName() : null;
                                            if ($elementName !== null && array_key_exists($elementName, $post)) {
                                                $args[] = $post[$elementName];
                                            } elseif ($param->isDefaultValueAvailable()) {
                                                $args[] = $param->getDefaultValue();
                                            } else {
                                                $args[] = null;
                                            }
                                        }

                                        // Never let a service-side error bubble up as a framework HTML 500 — this is a
                                        // JSON API. Any exception (bad input, SQL error, …) is returned as a JSON error.
                                        try {
                                            $data = $reflectionMethod->invokeArgs($tmpInstance, $args);
                                        } catch (\Throwable $e) {
                                            return new JsonModel([
                                                'success'  => false,
                                                'message'  => $translator->translate('tr_meliscore_microservice_request_ko'),
                                                'response' => [],
                                                'errors'   => ['execution' => 'The service could not process the request with the given parameters.'],
                                            ]);
                                        }
                                        

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
                                $view->apiKey = $apiKey;
                                $view->module = $module;
                                $view->serviceName = $service;
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
                                        $view->apiKey = $apiKey;
                                        $view->module = $module;
                                        $view->serviceName = $service;
                                        return $view;
                                    }
                                    else {

                                        $tmpInstance = new $servicePath();
                                        $tmpInstance->setServiceManager($this->getServiceManager());

                                        if (method_exists($servicePath, 'setEventManager')) {
                                            $tmpInstance->setEventManager($this->getEventManager());
                                        }

                                        $reflectionMethod = new \ReflectionMethod($servicePath, $method);

                                        // No parameters to build — invoke directly. Keep this a JSON API:
                                        // never let a service-side error bubble up as a framework HTML 500.
                                        try {
                                            $data = $reflectionMethod->invokeArgs($tmpInstance, []);
                                        } catch (\Throwable $e) {
                                            return new JsonModel([
                                                'success'  => false,
                                                'message'  => $translator->translate('tr_meliscore_microservice_request_ko'),
                                                'response' => [],
                                                'errors'   => ['execution' => 'The service could not process the request with the given parameters.'],
                                            ]);
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
                // Service refusé au porteur ≠ clé inactive : le message générique « no access »
                // (clé déjà traduite) ne confirme pas à un tiers que la clé serait valide par ailleurs.
                $message = $serviceAccessDenied
                    ? 'tr_meliscore_microservice_api_key_no_access'
                    : 'tr_meliscore_microservice_api_key_inactive';
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
     * SECURITY (audit C4) : le service `Module/Service` est-il autorisé pour le porteur de la
     * clé API ? Droits effectifs = usr_rights du porteur, sinon ceux de son rôle (urole_rights) ;
     * usr_admin=1 court-circuite, comme MelisCoreRightsService::canAccess. Allow-list,
     * default-DENY : cf. MelisCoreMicroserviceRightsService.
     *
     * @param object $userApiData ligne getUserByApiKey/getUser (jointure melis_core_user incluse)
     */
    private function isMicroserviceAllowedForKeyOwner($userApiData, $module, $service)
    {
        if ((int) ($userApiData->usr_admin ?? 0) === 1) {
            return true;
        }

        $rightsXml = (string) ($userApiData->usr_rights ?? '');
        if (trim($rightsXml) === '' && !empty($userApiData->usr_role_id)) {
            try {
                $role = $this->getServiceManager()->get('MelisCoreTableUserRole')
                    ->getEntryById((int) $userApiData->usr_role_id)->current();
                $rightsXml = (string) ($role->urole_rights ?? '');
            } catch (\Throwable $e) {
                // Rôle illisible : XML vide → default-DENY (fail-closed).
                $rightsXml = '';
            }
        }

        return \MelisCore\Service\MelisCoreMicroserviceRightsService::isAllowed($rightsXml, $module, $service);
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

        /** SECURITY (audit H8) : lire la clé API d'un utilisateur = outil Utilisateurs —
         *  droit exigé dans l'action même (défense en profondeur sous le gate global). */
        if (!$this->hasAccess(self::MELIS_KEY)) {
            return new JsonModel(['success' => 0, 'response' => []]);
        }

        if ($request->isPost()) {

            $userId = (int)$request->getPost('id');
            $authData = $this->getMicroServiceAuthTable()->getUser($userId)->current();

            if ($authData) {

                $uri = $request->getUri();
                $host = $uri->getHost();
                $scheme = $uri->getScheme();
                $url = $scheme . '://' . $host.'/melis/api/'.$authData->msoa_api_key;


                /**
                 * The API key of a user is being displayed. A leaked key is exactly what the
                 * audit found (item 6.0), so reading one has to leave a trace (item 21.0).
                 * The key itself is never written to the log.
                 */
                $this->getServiceManager()->get('MelisCoreSecurityAudit')
                    ->logSensitiveRead('user microservice API key', $userId);

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

        /** SECURITY (audit H8) : générer une clé API = outil Utilisateurs — droit exigé. */
        if (!$this->hasAccess(self::MELIS_KEY)) {
            return new JsonModel(['success' => 0, 'response' => []]);
        }

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

                    // A new API key now exists for this user: worth knowing when a key has to
                    // be revoked or traced back.
                    $this->getServiceManager()->get('MelisCoreSecurityAudit')
                        ->logSensitiveRead('user microservice API key generated', $userId);

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

        /** SECURITY (audit H8) : même droit que les autres actions de gestion de clés. */
        if (!$this->hasAccess(self::MELIS_KEY)) {
            return new JsonModel(['success' => 0, 'response' => []]);
        }

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

        /** SECURITY (audit H8) : activer/désactiver une clé API = outil Utilisateurs — droit exigé. */
        if (!$this->hasAccess(self::MELIS_KEY)) {
            return new JsonModel(['success' => 0, 'response' => []]);
        }

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
        /**
         * SECURITY (audit H8) : random_bytes (CSPRNG) remplace rand() — prédictible, et la
         * collation *_ci réduisait encore l'espace effectif. Format aligné sur le chemin
         * React : 32 hex = 128 bits (VARCHAR(45) ok ; la casse n'importe plus en hex).
         * $length (historique) est ignoré : un appelant ne doit pas pouvoir affaiblir la clé.
         * Corrige aussi le `return` manquant de la récursion sur collision (clé NULL possible).
         */
        do {
            $randomString = bin2hex(random_bytes(16));
            $exists = $this->getMicroServiceAuthTable()->getUserByApiKey($randomString)->current();
        } while ($exists);

        return $randomString;
    }

    /**
     * generate all available list of Microservices
     */
    public function microServicesListAction()
    {

        $view         = new ViewModel();
        $translator   = $this->getServiceManager()->get('translator');
        $apiKey       = trim($this->params()->fromRoute('api_key', ''));
        // SECURITY (audit H8) : clé acceptée aussi en header X-Melis-Api-Key (additive).
        if ($apiKey === '') {
            $headerKey = $this->getRequest()->getHeader('X-Melis-Api-Key');
            if ($headerKey) {
                $apiKey = trim($headerKey->getFieldValue());
            }
        }
        $userExists   = false;
        $microservice = array();
        $userApiData  = $this->getMicroServiceAuthTable()->getUserByApiKey($apiKey)->current(); 
        $apiStatus    = '';
        $toolTranslator = $this->getServiceManager()->get('MelisCoreTranslation');
        

        

        if($userApiData) {
            
            // SECURITY (audit H8) : même règle que runAction — clé active ET propriétaire
            // existant et actif (la clé meurt avec son compte).
            $apiStatus = $userApiData->msoa_status
                && !empty($userApiData->usr_id)
                && (int) $userApiData->usr_status === 1;
            // to validate the API key if it's Active or Inactvie
            if($apiStatus){
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

                // SECURITY (audit C4) : le catalogue d'une clé restreinte n'affiche pas les
                // services refusés à son porteur (même règle que runAction).
                foreach ($microservice as $msModule => $msServices) {
                    if (!is_array($msServices)) {
                        continue;
                    }
                    foreach (array_keys($msServices) as $msService) {
                        if (!$this->isMicroserviceAllowedForKeyOwner($userApiData, $msModule, $msService)) {
                            unset($microservice[$msModule][$msService]);
                        }
                    }
                    if (empty($microservice[$msModule])) {
                        unset($microservice[$msModule]);
                    }
                }
                $userExists   = true;

            }else{
                $message = 'tr_meliscore_microservice_api_key_inactive';

                echo "&nbsp;&nbsp;" .$translator->translate($message);
            }
         
        }
        else{

        }
     
        // Map each exposed module to its BO left-menu section (same grouping as the classic left
        // menu), derived from the module's OWN app.interface.php: the `*_toolstree_section` it
        // registers its tools under (e.g. MelisCmsProspects lives under "marketing", not "cms").
        // Modules with no interface section (e.g. the rendering engine) fall back to the core section.
        // Manual overrides: force a module into a specific section when its auto-derived section
        // isn't the one we want to show here (e.g. the rendering engine and small-business tools
        // are surfaced under the CMS section).
        $sectionOverrides = array(
            'MelisEngine'        => 'meliscms_toolstree_section',
            'MelisSmallBusiness' => 'meliscms_toolstree_section',
            // Comments has no toolstree section of its own (extends news/blog) — surface it under CMS.
            'MelisCmsComments'   => 'meliscms_toolstree_section',
            // Commerce splits its interface into config/interface/*.php (no single config/app.interface.php
            // for the auto-deriver to read) — force it into its own Commerce section.
            'MelisCommerce'      => 'meliscommerce_toolstree_section',
        );

        $moduleSections = array();
        if ($userExists) {
            $modulesSvc = $this->getServiceManager()->get('ModulesService');
            foreach (array_keys($microservice) as $moduleName) {
                if ($moduleName === 'conf') { continue; }
                if (isset($sectionOverrides[$moduleName])) {
                    $moduleSections[$moduleName] = $sectionOverrides[$moduleName];
                    continue;
                }
                $section = 'meliscore_toolstree_section';
                try {
                    $path  = $modulesSvc->getModulePath($moduleName);
                    $iface = $path ? $path . '/config/app.interface.php' : '';
                    if ($iface && is_file($iface)) {
                        $contents = file_get_contents($iface);
                        if ($contents !== false && preg_match_all('/melis[a-z]+_toolstree_section/', $contents, $mm) && !empty($mm[0])) {
                            $counts = array_count_values($mm[0]); // primary section = the most-used one
                            arsort($counts);
                            $section = (string) key($counts);
                        }
                    }
                } catch (\Throwable $e) {
                    // keep the default core section
                }
                $moduleSections[$moduleName] = $section;
            }
        }

        $view->userExists     = $userExists;
        $view->microservice   = $microservice;
        $view->moduleSections = $moduleSections;
        $view->apiKey       = $apiKey;
        $view->title       = 'tr_meliscore_microservice_title';
        // Standalone, self-contained styled page (Melis React look) — render without the legacy layout.
        $view->setTerminal(true);
        return $view;
    }


}