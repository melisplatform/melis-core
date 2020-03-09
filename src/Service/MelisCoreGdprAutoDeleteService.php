<?php

namespace MelisCore\Service;

use MelisCore\Model\Tables\MelisGdprDeleteEmailsSentTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsTable;
use Zend\Validator\File\Exists;
use Zend\Validator\File\Extension;
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

    public function runCron()
    {
        $response = [];
        $autoDeleteData = $this->getFullGdprDataForAutoDelete();
        if (!empty($autoDeleteData)) {
            foreach ($autoDeleteData as $i => $data) {
                /*
                 * send email for those email that needs verification
                 */
                $response[] = $this->sendWarningEmails($data);
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
        $autoDeleteConfigData = $this->gdprAutoDeleteToolService->getAllGdprAutoDeleteConfigDataWithEmailTrans();
        // retrieving list of users' emails for first warning
        if (!empty($autoDeleteConfigData)) {
            foreach ($autoDeleteConfigData as $idx => $val) {
                /*
                 * tags set by the modules
                 */
                $modulesListOfTags = $this->getAllModulesListOfTags();
                if (!empty($modulesListOfTags)) {
                    foreach ($modulesListOfTags as $moduleName => $tags) {
                        if ($val['mgdprc_module_name'] == $moduleName) {
                            $autoDeleteConfigData[$idx]['tags'] = $tags;
                        }
                    }
                }
                /*
                 * warning users set by the modules
                 */
                $modulesWarningListsOfUsers = $this->getAllModulesWarningListOfUsers();
                if (!empty($modulesWarningListsOfUsers)) {
                    foreach ($modulesWarningListsOfUsers as $moduleName => $emails) {
                        if ($val['mgdprc_module_name'] == $moduleName) {
                            $autoDeleteConfigData[$idx]['warning_users'] = $emails;
                        }
                    }
                }
                /*
                 *  second warning users set by the modules
                 */
                $modulesSecondWarningListOfUsers = $this->getAllModulesSecondWarningListOfUsers();
                if (!empty($modulesSecondWarningListOfUsers)) {
                    foreach ($modulesSecondWarningListOfUsers as $moduleName => $emails) {
                        if ($val['mgdprc_module_name'] == $moduleName) {
                            $autoDeleteConfigData[$idx]['second_warning_users'] = $emails;
                        }
                    }
                }
            }
        }

        return $autoDeleteConfigData;
    }

    /**
     * get the list of tags in every modules that was sent through their respective listeners
     * @return array
     */
    public function getAllModulesListOfTags()
    {
        return $this->getDataOfAnEvent(self::TAGS_EVENT, self::TAG_LIST_KEY, self::TAG_KEY);
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

    public function sendWarningEmails($data)
    {
        $response = [];

        // get all warning users
        foreach ($data['warning_users'] as $email => $emailOptions) {
            $langId = $emailOptions[MelisCoreGdprAutoDeleteService::CONFIG_KEY][MelisCoreGdprAutoDeleteService::LANG_KEY];
            $emailContent = $this->gdprAutoDeleteToolService->getAlertEmailsTransData($data['mgdprc_id'], MelisGdprDeleteEmailsTable::EMAIL_WARNING, $langId);
            $response[] = [
                'email' => $email,
                $this->sendEmail(
                    $data['mgdprc_email_conf_from_email'],
                    $data['mgdprc_email_conf_from_name'],
                    $email,
                    'Jerremei Rago',
                    $data['mgdprc_email_conf_reply_to'],
                    $emailContent->mgdpre_subject,
                    $this->prepareEmailLayout($data, $emailContent->mgdpre_html),
                    $emailContent->mgdpre_text
                )
            ];


        }

        return $response;
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
    public function sendEmail($emailFrom, $emailFromName, $emailTo, $emailToName = null, $replyTo, $subject, $messageHtml, $messageText = null)
    {
        try {
            $email = $this->getServiceLocator()->get('MelisCoreEmailSendingService');
            $email->sendEmail(
                $emailFrom,
                $emailFromName,
                $emailTo,
                $emailToName,
                $replyTo,
                $subject,
                $messageHtml,
                $messageText
            );
        } catch (\Exception $err) {
            die($err->getMessage());
        }
    }

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
        // set variables for the view model
        $viewModel->setVariables([
            'title' => $viewData['mgdprc_email_conf_layout_title'],
            'headerLogoLink' => 'Host',
            'headerLogo' => 'Logo',
            'footerInfo' => $viewData['mgdprc_email_conf_layout_desc'],
            'content' => wordwrap($content, FALSE),
            'fromName' => $viewData['mgdprc_email_conf_from_name']
        ]);

        return $view->render($viewModel);

    }

    private function print($data)
    {
        echo "<pre>";
        print_r($data);
        echo "</pre>";
    }
}