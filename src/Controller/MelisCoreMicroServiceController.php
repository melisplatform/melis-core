<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;

class MelisCoreMicroServiceController extends AbstractActionController
{
    /**
     * This handles the requests and the displays of the
     * requested service and method
     * @return JsonModel
     */
    public function runAction()
    {
        $success     = false;
        $message     = 'tr_meliscore_microservice_api_key_no_access';
        $data        = [];
        $errors      = [];
        $hasError    = false;
        $apiKey      = $this->params()->fromRoute('api_key');
        $module      = ucfirst($this->params()->fromRoute('module'));
        $service     = ucfirst($this->params()->fromRoute('service_alias'));
        $method      = $this->params()->fromRoute('service_method');
        $translator  = $this->getServiceLocator()->get('translator');
        $userApiData = $this->getMicroServiceAuthTable()->getUserByApiKey($apiKey)->current();

        /**
         * If user API data is not empty, then proceed on checking its' content
         */
        if($userApiData) {

            /**
             * check whether user's accessibility is still "active" or not
             */
            $isUserCanExec = (bool) $userApiData->msoa_status;

            /**
             * If user's API option is still "active"
             */
            if($isUserCanExec) {

                // check if the module in the route param exists
                $moduleSvc = $this->getServiceLocator()->get('ModulesService');
                $modules   = $moduleSvc->getAllModules();

                /**
                 * Checker whether the provided module in the route parameter does exists in Zend Active Modules
                 */
                if(in_array($module, $modules)) {

                    // check if the service alias exists
                    $config = $this->getServiceLocator()->get('config');
                    $services = array_merge($config['service_manager']['aliases'], $config['service_manager']['factories']);
                    $servicesKeys = array_keys($services);

                    /**
                     * Checker whether the requested Service exists in the platform
                     */
                    if(in_array($service, $servicesKeys)) {

                        $tool         = $this->getServiceLocator()->get('MelisCoreTool');
                        $post         = $tool->sanitizeRecursive($this->getRequest()->getPost());

                        $servicePath  = "\\$module\\Service\\$service";
                        $methodExists = method_exists($servicePath, $method);
                        $coreConfig   = $this->getServiceLocator()->get('MelisCoreConfig');
                        $form         = $coreConfig->getItem('microservice/'.$module.'/'.$service.'/'.$method);

                        /**
                         * Checker whether the requested method exists in the provided Service, and return JSON if
                         * requested method is POST
                         */
                        if($post && $methodExists) {

                            /**
                             * If form configuration in app.microservice.php is properly configured depending on the provided
                             * route parameters, then we will use its' configuration to interact with the service
                             * and make an invocation to it using ReflectionMethod so we can get the data that is being
                             * returned after invoking the method.
                             */
                            if($form) {

                                /**
                                 * This listener trigger allows you to modify the structure of your post data, this is useful whenever your method arguments requires an array argument
                                 * in this way, we would be able to modify its' structure depending the needs of the metod.
                                 */
                                $post = $this->getEventManager()->trigger('melis_core_microservice_route_param', $this, array('module' => $module, 'service' => $service, 'method' => $method, 'post' => $post));

                                /**
                                 * This condition checks whether the trigger returns a good data
                                 */
                                if(isset($post[0]) && isset($post[0]['post'])) {

                                    $post = $post[0]['post'];

                                    $form = $this->getForm($form);
                                    $form->setData($post);

                                    if($form->isValid()) {
                                        $tmpInstance = new $servicePath();
                                        $tmpInstance->setServiceLocator($this->getServiceLocator());
                                        $reflectionMethod = new \ReflectionMethod($servicePath, $method);
                                        /**
                                         * allow method to accept dynamic arguments
                                         */
                                        $data     = (array) $reflectionMethod->invokeArgs($tmpInstance, $post);
                                        $message  = 'tr_meliscore_microservice_request_ok';
                                        $success  = true;
                                    }
                                    else {
                                        $errors = $form->getMessages();
                                    }
                                }
                                else {
                                    $errors['invalid_post_parameters'] = (array) $post;
                                }
                            }

                            /**
                             * If no error encountered, then we will return a JSON response including its' service returned data
                             */
                            if(!$errors) {
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
                            else{
                                // get the form configuration in app.microservice configuration file
                                $this->layout('layout/layoutBlank');
                                $view = new ViewModel();
                                $view->form = $this->getForm($form);

                                return $view;
                            }
                        }
                        else {
                            /**
                             * If the request method is GET then we display the form
                             */
                            if($methodExists) {

                                /**
                                 * Display the form that will be used to provide data for the service method arguments
                                 */
                                if($form) {
                                    // get the form configuration in app.microservice configuration file
                                    $this->layout('layout/layoutBlank');
                                    $view = new ViewModel();
                                    $view->form = $this->getForm($form);

                                    return $view;
                                }
                                else {
                                    $message  = 'tr_meliscore_microservice_form_ko';
                                    $hasError = true;
                                }

                            }
                            else {
                                $message  = 'tr_meliscore_microservice_method_ko';
                                $hasError = true;
                            }

                        }
                    }
                    else {
                        $message  = 'tr_meliscore_microservice_service_ko';
                        $hasError = true;
                    }
                }
                else {
                    $message  = 'tr_meliscore_microservice_module_ko';
                    $hasError = true;
                }

            }

        }
        else {
            $message  = 'tr_meliscore_microservice_api_key_invalid';
            $hasError = true;
        }

        /**
         * If there's an error, we display the JSON response
         */
        if($hasError) {
            $response = [
                'success'  => $success,
                'message'  => $translator->translate($message),
                'response' => $data,
                'errors'   => $errors
            ];
            return new JsonModel($response);
        }
        die;

    }

    private function getMicroServiceAuthTable()
    {
        $table = $this->getServiceLocator()->get('MelisMicroServiceAuthTable');

        return $table;
    }

    private function getForm($formConfig)
    {
        $factory = new \Zend\Form\Factory();
        $formElements = $this->serviceLocator->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($formConfig);

        return $form;

    }
}