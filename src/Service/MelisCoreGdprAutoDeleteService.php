<?php

namespace MelisCore\Service;

use MelisCmsUserAccount\Service\MelisCmsUserAccountGdprAutoDeleteService;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsSentTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsTable;
use Zend\Validator\File\Exists;
use Zend\Validator\File\Extension;
use Zend\Validator\IsInstanceOf;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use Zend\View\Resolver\TemplateMapResolver;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * Class MelisCoreGdprAutoDeleteService
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 * @package MelisCore\Service
 */
class MelisCoreGdprAutoDeleteService extends MelisCoreGeneralService
{
    /**
     * constants to avoid incorrect entries of events,keys and can be use everywhere
     */
    const TAGS_EVENT = "melis_core_gdpr_auto_delete_modules_tags_list";
    const TAG_LIST_KEY = "modules_tags_list";
    const TAG_KEY = "tags";
    const WARNING_EVENT = "melis_core_gdpr_auto_delete_warning_list_of_users";
    const WARNING_LIST_KEY = "modules_warning_list";
    const SECOND_WARNING_EVENT = "melis_core_gdpr_auto_delete_second_warning_list_of_users";
    const SECOND_WARNING_LIST_KEY = "modules_second_warning_list";
    const VALIDATION_KEY = "validation_key";
    const CONFIG_KEY = "config";
    const LANG_KEY = "lang";
    const SERVICE_KEY = "service_class";
    const WARNING_METHONG = '';

    /**
     * @var MelisCoreGdprAutoDeleteToolService
     */
    protected $gdprAutoDeleteToolService;

    /**
     * @var MelisGdprDeleteEmailsSentTable
     */
    protected $deleteEmailsSentTable;

    /**
     * MelisCoreGdprAutoDeleteService constructor.
     * @param MelisCoreGdprAutoDeleteToolService $autoDeleteToolService
     * @param MelisGdprDeleteEmailsSentTable $deleteEmailsSentTable
     */
    public function __construct(
        MelisCoreGdprAutoDeleteToolService $autoDeleteToolService,
        MelisGdprDeleteEmailsSentTable $deleteEmailsSentTable
    )
    {
        $this->gdprAutoDeleteToolService = $autoDeleteToolService;
        $this->deleteEmailsSentTable = $deleteEmailsSentTable;
    }
    /**
     * get the list of tags in every modules that was sent through their respective listeners
     * @return array
     */
    public function getAllModulesListOfTags()
    {
        return $this->getDataOfAnEvent(self::TAGS_EVENT, self::TAG_LIST_KEY, self::TAG_KEY);
    }

    public function runCron()
    {
        $response = [];
        $autoDeleteData = $this->getFullGdprDataForAutoDelete();
        if (!empty($autoDeleteData)) {
            foreach ($autoDeleteData as $i => $data) {
                /*
                 * checking table melis_core_gdpr_delete_emails_sent
                 */
                /*
                 * send email for those email that needs verification
                 */
//                $response[] = $this->sendWarningEmails($data);
            };
        }

        return $response;

    }

    /**
     * @return mixed
     */
    public function getFullGdprDataForAutoDelete()
    {
        // retrieving list of modules and list of sites
        $autoDeleteConfigData = $this->gdprAutoDeleteToolService->getAllGdprAutoDeleteConfigData();
        // retrieving list of users' emails for first warning
        if (!empty($autoDeleteConfigData)) {
            foreach ($autoDeleteConfigData as $idx => $config) {
                /*
                 * tags set by the modules
                 */
                $modulesListOfTags = $this->getAllModulesListOfTags();
                if (!empty($modulesListOfTags)) {
                    foreach ($modulesListOfTags as $moduleName => $tags) {
                        if ($config['mgdprc_module_name'] == $moduleName) {
                            $autoDeleteConfigData[$idx]['tags'] = $tags;
                        }
                    }
                }
                /*
                 * if alert email status is in active then we get the list of warning users to mailed for revalidation
                 */
                if ($config['mgdprc_alert_email_status']) {
                    // check if the is days of inactivity set
                    if ($config['mgdprc_alert_email_days'] > 0) {
                        // get the verified and correct list of warning users
                        $modulesWarningListsOfUsers = $this->getCorrectWarningListOfUsersEmail($config);
                        if (!empty($modulesWarningListsOfUsers)) {
                            foreach ($modulesWarningListsOfUsers as $moduleName => $emails) {
                               // from here we now can send email for those users that needs revalidation
                                $this->sendWarningEmails($config,$emails);
                            }
                        }
                    } else {
                        echo "Error logs no inactivity days was set";
                    }

                }
//                /*
//                 * if alert email resend is in active then we get the list of second warning users to mailed for revalidation again
//                 */
//                if ($val['mgdprc_alert_email_resend']) {
//                    // get the verified and correct list of second warning users
//                    $modulesSecondWarningListOfUsers = $this->getAllModulesSecondWarningListOfUsers();
//                    if (!empty($modulesSecondWarningListOfUsers)) {
//                        foreach ($modulesSecondWarningListOfUsers as $moduleName => $emails) {
//                            if ($val['mgdprc_module_name'] == $moduleName) {
//                                $autoDeleteConfigData[$idx]['second_warning_users'] = $emails;
//                            }
//                        }
//                    }
//                }
            }
        }

        print_r($autoDeleteConfigData);
        die;
        return $autoDeleteConfigData;
    }

    /**
     * @param $email
     * @param $dateTime
     * @return mixed
     */
    public function getEmailSentAlertByEmailDatetime($email, $dateTime)
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_auto_delete_get_emaiL_sent_data_by_email_start', $arrayParameters);
        // get the updated value of a variable
        foreach ($arrayParameters as $var => $val) {
            $$var = $val;
        }
        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $this->deleteEmailsSentTable->getEmailSentAlertDataByEmailAndDate($email,$dateTime)->current();
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_auto_delete_get_emaiL_sent_data_by_email_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * @param $configData
     * @return array
     */
    public function getCorrectWarningListOfUsersEmail($configData)
    {
        $correctWarningEmails = [];
        // get all modules warning list of users from listeners
        $warningUsersFromListener = $this->getAllModulesWarningListOfUsers();
        if (!empty($warningUsersFromListener)) {
            foreach ($warningUsersFromListener as $module => $moduleData) {
                // check if user email is in the module
                if (isset($moduleData[self::SERVICE_KEY]) && !empty($moduleData[self::SERVICE_KEY])) {
                    // run the method on the service_class that set on the listener of the module
                    $correctWarningEmails[$module] = $this->getClassMethodData(
                        $moduleData[self::SERVICE_KEY],
                        'getWarningListOfUsers',
                        [
                            'siteId' => $configData['mgdprc_site_id'],
                            'alert_days_inactivity' => $configData['mgdprc_alert_email_days']
                        ]);
                    // check email if it is already mailed
                    $this->verifyAlertEmailSentStatus($correctWarningEmails);
                }
            }
        }

        return $correctWarningEmails;
    }

    /**
     * check if the email is already mailed
     * @param $correctEmails
     * @param $datetime
     * @return array
     */
    public function verifyAlertEmailSentStatus($correctEmails)
    {
        $finalListOfEmailsToEmail = [];
        if (!empty($correctEmails)) {
            foreach ($correctEmails as $email => $emailOptions) {
                $data = $this->getEmailSentAlertByEmailDatetime($email, date('Y-m-d'));
                if (empty($data)) {
                    // now we know the email is not yet emailed
                    $finalListOfEmailsToEmail[$email] = $emailOptions;
                }
            }
        }

        return $finalListOfEmailsToEmail;
    }
    /**
     * @param $layout
     * @param $viewData
     * @param $content
     * @return string
     */
    private function createEmailViewTemplate($layout, $viewData, $content)
    {
        // php renderer
        $view = new PhpRenderer();
        // template resolver
        $resolver = new TemplateMapResolver();
        // view model
        $viewModel = new ViewModel();
        // set map for the layout
        $resolver->setMap([
            'mail-template' => $layout
        ]);
        // set resolver for the view
        $view->setResolver($resolver);
        // set template for the view
        $viewModel->setTemplate('mail-template');
        $uri = $this->getServiceLocator()->get('request')->getUri();
        // set variables for the view model
        $viewModel->setVariables([
            'title'          => "Title",
            'headerLogoLink' => 'Host',
            'headerLogo'     => !empty($viewData['mgdprc_email_conf_layout_logo']) ?  $viewData['mgdprc_email_conf_layout_logo'] : "http://dev9.test.melistechnology.fr/img/MelisTech.png",
            'footerInfo'     => $viewData['mgdprc_email_conf_layout_desc'],
            'content'        => wordwrap($content, FALSE),
            'fromName'       => $viewData['mgdprc_email_conf_from_name']
        ]);


        return $view->render($viewModel);

    }

    /**
     * send email
     * @param $emailFrom
     * @param $emailFromName
     * @param $emailTo
     * @param null $emailToName
     * @param $replyTo
     * @param $subject
     * @param $messageHtml
     * @param null $messageText
     */
    public function sendEmail(
        $emailFrom,
        $emailFromName,
        $emailTo,
        $emailToName = null,
        $replyTo,
        $subject,
        $messageHtml,
        $messageText = null
    ) {
        return $this->getServiceLocator()->get('MelisCoreEmailSendingService')->sendEmail(
            $emailFrom,
            $emailFromName,
            $emailTo,
            $emailToName,
            $replyTo,
            $subject,
            $messageHtml,
            $messageText
        );
    }

    /**
     * exclusive only for class extending the MelisCoreGdprAutoDeleteInterface
     * @param $class
     * @param $method
     * @param array $params ( array so we can have multiple value at one parameter )
     * @return mixed
     * @throws \Exception
     */
    private function getClassMethodData($class, $method, array $params = [] )
    {
        // check if class exists
        if (!class_exists($class)) {
            // throw error
            throw new \Exception("Class " . $class . " does not exists.");
        }
        // check if method exists on the class
        if (!in_array($method, get_class_methods($this->getServiceLocator()->get($class)))) {
            throw new \Exception("Method " . $method . " was not found in the class " . $class);
        }

        return $this->getServiceLocator()->get($class)->$method($params);
    }

    /**
     * trigger an event and then get data based from main key to retrieve or with sub key to retrieve
     * @param $mvcEventName
     * @param $mainKeyToRetrieve
     * @param null $subKeyToRetrieve
     * @return array
     */
    private function getDataOfAnEvent($mvcEventName, $mainKeyToRetrieve, $subKeyToRetrieve = null)
    {
        // trigger zend mvc event
        $list = $this->getEventManager()->trigger($mvcEventName);
        $data = [];
        // get the returned data from each module listener
        for ($list->rewind(); $list->valid(); $list->next()) {
            // check if current data is not empty
            if (!empty($list->current())) {
                // get the lists
                foreach ($list->current()[$mainKeyToRetrieve] as $moduleName => $moduleOptions) {
                    if (!is_null($subKeyToRetrieve)) {
                        $data[$moduleName] = $moduleOptions[$subKeyToRetrieve] ?? [];
                    } else {
                        $data[$moduleName] = $moduleOptions;
                    }
                }
            }
        };

        return $data;
    }

    /**
     * @param $module
     * @return mixed
     */
    public function getWarningUsersByModule($module)
    {
        // get all modules warnign list of users first
        $warningUsers = $this->getAllModulesWarningListOfUsers();
        // check if not empty
        if (!empty($warningUsers)) {
            // loop and get module option by module
            foreach ($warningUsers as $moduleName => $moduleOpt) {
                if ($moduleName == $module) {
                    // remove class key
                    if (isset($moduleOpt['service_class']))
                        unset($moduleOpt['service_class']);
                    // return
                    return $moduleOpt;
                }
            }
        }
    }
    /**
     * @param $module
     * @return mixed
     */
    public function getSecondWarningUsersByModule($module)
    {
        // get all modules warnign list of users first
        $secondWarningUsers = $this->getAllModulesSecondWarningListOfUsers();
        // check if not empty
        if (!empty($secondWarningUsers)) {
            // loop and get module option by module
            foreach ($secondWarningUsers as $moduleName => $moduleOpt) {
                if ($moduleName == $module) {
                    // remove class key
                    if (isset($moduleOpt['service_class']))
                        unset($moduleOpt['service_class']);

                    return $moduleOpt;
                }
            }
        }
    }

    /**
     * get the list of warning users in every modules that was sent through their respective listeners
     * @return array
     */
    public function getAllModulesWarningListOfUsers()
    {
        return $this->getDataOfAnEvent(self::WARNING_EVENT, self::WARNING_LIST_KEY);
    }

    /**
     * get the list of second warning users in every modules that was sent through their respective listeners
     * @return array
     */
    public function getAllModulesSecondWarningListOfUsers()
    {
        return $this->getDataOfAnEvent(self::SECOND_WARNING_EVENT, self::SECOND_WARNING_LIST_KEY);
    }

    /**
     * send first warning for those email are inactive for the set days
     * @param $emailSetupConfig
     * @param $emails
     * @return array
     */
    public function sendWarningEmails($emailSetupConfig, $emails)
    {
        print_r($emailSetupConfig);
        $response = [];
        // get all warning users
        foreach ($emails as $email => $emailOptions) {
            print_r($emailOptions);
            // check config key is present
            if ($this->isExists(MelisCoreGdprAutoDeleteService::CONFIG_KEY, $emailOptions)) {
                // check lang id is present
                if ($this->isExists(MelisCoreGdprAutoDeleteService::LANG_KEY,$emailOptions[MelisCoreGdprAutoDeleteService::CONFIG_KEY])) {
                    // get lang id
                    $langId = $emailOptions[MelisCoreGdprAutoDeleteService::CONFIG_KEY][MelisCoreGdprAutoDeleteService::LANG_KEY];
                    // get alert emails required data for the email
                    $emailContent = $this->gdprAutoDeleteToolService->getAlertEmailsTransData($emailSetupConfig['mgdprc_id'], MelisGdprDeleteEmailsTable::EMAIL_WARNING, $langId);
                    print_r($emailContent);
                    die;

                    // send email
                    $this->sendEmail(
                        $emailSetupConfig['mgdprc_email_conf_from_email'],
                        $emailSetupConfig['mgdprc_email_conf_from_name'],
                        $email,
                        'Jerremei Rago',
                        $emailSetupConfig['mgdprc_email_conf_reply_to'],
                        $emailContent->mgdpre_subject,
                        $this->prepareEmailLayout($emailSetupConfig, $emailContent->mgdpre_html),
                        $emailContent->mgdpre_text
                    );
                } else {
                    // logs lang id not present
                }

            } else {
                // logs config key not present
            }

        }

        return $response;
    }

    private function isExists($key, array $array)
    {
        if (isset($array[$key]) && ! empty($array[$key])) {
            return true;
        }
    }
    /**
     * @param $emailData
     * @param $content
     * @return null|string
     */
    private function prepareEmailLayout($emailData, $content)
    {
        $messageContent = null;
        $file = null;
        // file validator
        $layoutPathValidator = new Exists();
        // check layout first in vendor directory
        if ($layoutPathValidator->isValid(__DIR__ . '/../../../' . $emailData['mgdprc_email_conf_layout'])) {
            $file = __DIR__ . '/../../../' . $emailData['mgdprc_email_conf_layout'];
        }
        // if no file in vendor directory then check in module root directory
        if (!$file) {
            if ($layoutPathValidator->isValid($_SERVER['DOCUMENT_ROOT'] . '/../module/' . $emailData['mgdprc_email_conf_layout'])) {
                $file = $_SERVER['DOCUMENT_ROOT'] . '/../module/' . $emailData['mgdprc_email_conf_layout'];
            }
        }
        // check file extenstion
        if ($file) {
            $layoutExtValidator = new Extension('phtml');
            if ($layoutExtValidator->isValid($file)) {
                $messageContent = $this->createEmailViewTemplate($file, $emailData, $content);
            }
        }

        return $messageContent;
    }

    private function print($data)
    {
        echo "<pre>";
        print_r($data);
        echo "</pre>";
    }
}