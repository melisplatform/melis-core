<?php
namespace MelisCore\Service;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * Class MelisCoreGdprAutoDeleteService
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 * @package MelisCore\Service
 */

use MelisCore\Model\Tables\MelisGdprDeleteEmailsLogsTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsSentTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsTable;
use Zend\Validator\File\Exists;
use Zend\Validator\File\Extension;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use Zend\View\Resolver\TemplateMapResolver;

class MelisCoreGdprAutoDeleteService extends MelisCoreGeneralService
{
    /**
     * constants to avoid incorrect entries of events,keys and can be use everywhere
     */
    const MODULE_LIST_KEY = "modules_list";
    /*
     * optional keys event
     */
    const TAGS_EVENT           = "melis_core_gdpr_auto_delete_modules_tags_list";
    const WARNING_EVENT        = "melis_core_gdpr_auto_delete_warning_list_of_users";
    const SECOND_WARNING_EVENT = "melis_core_gdpr_auto_delete_second_warning_list_of_users";
    const DELETE_EVENT         = "melis_core_gdpr_auto_delete_for_delete_users";
    const DELETE_ACTION_EVENT  = "melis_core_gdpr_auto_delete_action_delete";
    /*
     * optional constant keys
     */
    const TAG_LIST_KEY            = "modules_tags_list";
    const WARNING_LIST_KEY        = "modules_warning_list";
    const SECOND_WARNING_LIST_KEY = "modules_second_warning_list";
    const TAG_KEY                 = "tags";
    const VALIDATION_KEY          = "validationKey";
    const CONFIG_KEY              = "config";
    const LANG_KEY                = "lang";
    /*
     * logs type
     */
    const LANG_KEY_NOT_FOUND = "lang-key-not-found";
    const TAGS_ERROR_LOG = "tags-error-log";
    const EMAIL_CONTENT_ERROR_LOG = "email-content-error-log";
    const TECHNICAL_ISSUE = "technical-issue";

    /**
     * @var
     */
    protected $logs = [];

    /**
     * errors
     *
     * @var
     */
    protected $errors;

    /**
     * @var MelisCoreGdprAutoDeleteToolService
     */
    protected $gdprAutoDeleteToolService;

    /**
     * @var MelisGdprDeleteEmailsSentTable
     */
    protected $deleteEmailsSentTable;

    /**
     * @var MelisGdprDeleteEmailsLogsTable
     */
    protected $emailsLogsTable;

    /**
     * MelisCoreGdprAutoDeleteService constructor.
     * @param MelisCoreGdprAutoDeleteToolService $autoDeleteToolService
     * @param MelisGdprDeleteEmailsSentTable $deleteEmailsSentTable
     * @param MelisGdprDeleteEmailsLogsTable $emailsLogsTable
     */
    public function __construct(
        MelisCoreGdprAutoDeleteToolService $autoDeleteToolService,
        MelisGdprDeleteEmailsSentTable $deleteEmailsSentTable,
        MelisGdprDeleteEmailsLogsTable $emailsLogsTable
    )
    {
        $this->gdprAutoDeleteToolService = $autoDeleteToolService;
        $this->deleteEmailsSentTable = $deleteEmailsSentTable;
        $this->emailsLogsTable = $emailsLogsTable;
    }
    /**
     * get the list of tags in every modules that was sent through their respective listeners
     *
     * @return array
     */
    public function getAllModulesListOfTags()
    {
        return $this->getDataOfAnEvent(self::TAGS_EVENT, self::TAG_LIST_KEY, self::TAG_KEY);
    }

    /**
     * get the list of users that for deletion
     *
     * @return array
     */
    public function getUsersForDeletion()
    {
        return $this->getDataOfAnEvent(self::DELETE_EVENT,self::DELETE_USERS_KEY);
    }

    public function runCron()
    {
        // retrieving list of modules and list of sites
        $autoDelConfig = $this->gdprAutoDeleteToolService->getAllGdprAutoDeleteConfigData();
        //etrieving list of users' emails for first warning
        if (!empty($autoDelConfig)) {
            foreach ($autoDelConfig as $idx => $config) {
                // send email for first warning users
                $this->sendEmailForWarningUsers($config);
                // send mail for second warnign users
                $this->sendEmailForSecondWarningUsers($config);
                // send email for deleted users
                $this->deleteSendEmailForDeletedUsers($config);
            }

            return true;
        }

        return false;
    }

    /**
     * merge tags on the auto delete config
     *
     * @param $autoDeleteConfig
     * @return mixed
     */
    private function mergeTagsConfig($autoDeleteConfig)
    {
        $tags = $this->getAllModulesListOfTags();
        if (! empty($tags)) {
            foreach ($tags as $moduleName => $val) {
                if ($autoDeleteConfig['mgdprc_module_name'] == $moduleName) {
                    $autoDeleteConfig['email_setup_tags'] = $val;
                }
            }
        }

        return $autoDeleteConfig;
    }

    /**
     * send first warning email for users that are inactvie
     *
     * @param $autoDelConf
     * @return array
     */
    private function sendEmailForWarningUsers($autoDelConf)
    {
        $response = [];
        // get all modules warning list of users
        $modulesWarningListsOfUsers = $this->getAllModulesWarningListOfUsers();
        foreach ($modulesWarningListsOfUsers as $moduleName => $emails) {
            if ($moduleName == $autoDelConf['mgdprc_module_name']) {
                // if alert email status is in active then we get the list of warning users to mailed for revalidation
                if ($autoDelConf['mgdprc_alert_email_status']) {
                    // check if the is days of inactivity set
                    if ($autoDelConf['mgdprc_alert_email_days'] > 0) {
                        if (!empty($modulesWarningListsOfUsers)) {
                            // check if user is belong to current site of the config
                            foreach ($emails as $email => $emailOpts) {
                                // check emmail logs on email_sent if email is not yet mailed
                                if (empty($this->getEmailSentByValidationKey($emailOpts['config']['validationKey']))) {
                                    // check user if it belongs to the auto delete config
                                    if ($this->checkUsersSite($emailOpts[self::CONFIG_KEY]['site_id'], $autoDelConf['mgdprc_site_id'])) {
                                        // check user's inactive number of days
                                        if ($this->checkUsersInactiveDays($emailOpts, $autoDelConf['mgdprc_alert_email_days'])) {
                                            // send email
                                            $sendMail = $this->prepareSendWarningEmail(
                                                // merge tags
                                                $this->mergeTagsConfig($autoDelConf),
                                                $email,
                                                $emailOpts,
                                                MelisGdprDeleteEmailsTable::EMAIL_WARNING,
                                                true
                                            );
                                            // if no errors then save to db
                                            if (! $sendMail['hasError']) {
                                                // add new entry
                                                $this->saveEmailsSentData([
                                                    'mgdprs_site_id'     => $autoDelConf['mgdprc_site_id'],
                                                    'mgdprs_module_name' => $autoDelConf['mgdprc_module_name'],
                                                    'mgdprs_validation_key' => $emailOpts['config']['validationKey'],
                                                    'mgdprs_alert_email_sent' => 1,
                                                    'mgdprs_alert_email_sent_date' => date('Y-m-d h:i:s'),
                                                ]);
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

        return $response;
    }

    /**
     *
     * @param $autoDelConf
     * @return array
     */
    private function sendEmailForSecondWarningUsers($autoDelConf)
    {
        $response = [];
        // if alert resend email status is in active then we get the list of warning users to mailed for revalidation again
        if ($autoDelConf['mgdprc_alert_email_resend']) {
            // get all modules second warning list of users
            $modulesWarningListsOfUsers = $this->getAllModulesSecondWarningListOfUsers();
            if (!empty($modulesWarningListsOfUsers)) {
                foreach ($modulesWarningListsOfUsers as $moduleName => $emails) {
                    foreach ($emails as $email => $emailOpts) {
                        // check sites of user if it belongs to the auto delete config
                        if ($this->checkUsersSite($emailOpts[self::CONFIG_KEY]['site_id'], $autoDelConf['mgdprc_site_id'])) {
                            // check users inactive days
                            if ($this->checkUsersInactiveDays7DaysBeforeDeadline($emailOpts, $autoDelConf['mgdprc_delete_days'])) {
                                // send email
                                // check if email is already emailed for second warning
                                $data = $this->getEmailSentByValidationKey($emailOpts['config']['validationKey']);
                                // send email
                                $sendMail = $this->prepareSendWarningEmail(
                                // merge tags
                                    $this->mergeTagsConfig($autoDelConf),
                                    $email,
                                    $emailOpts
                                );
                                // if no errors then save to db
                                if (! $sendMail['hasError']) {
                                    // user was already mailed for revalidation and did not revalidate his account
                                    if (!empty($data) && !$data->mgdprs_alert_email_second_sent) {
                                        // update table gdpr delete email sent
                                        $this->saveEmailsSentData([
                                            'mgdprs_alert_email_second_sent'      => 1,
                                            'mgdprs_alert_email_second_sent_date' => date('Y-m-d h:i:s'),
                                        ], $data->mgdprs_id);
                                    } else {
                                        // email of the user have not yet emailed, add new entry
                                        $this->saveEmailsSentData([
                                            'mgdprs_site_id'     => $autoDelConf['mgdprc_site_id'],
                                            'mgdprs_module_name' => $autoDelConf['mgdprc_module_name'],
                                            'mgdprs_validation_key' => $emailOpts['config']['validationKey'],
                                            'mgdprs_alert_email_second_sent' => 1,
                                            'mgdprs_alert_email_second_sent_date' => date('Y-m-d h:i:s'),
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return $response;
    }

    /**
     * trigger auto delete action delete event
     *
     * @param $autoDelConf
     */
    private function deleteSendEmailForDeletedUsers($autoDelConf)
    {
        // trigger delete event
        $deletedUsers = $this->getDataOfAnEvent(self::DELETE_ACTION_EVENT, null, null , $autoDelConf);
        if (! empty($deletedUsers)) {
            foreach ($deletedUsers as $email => $emailOpts) {
                // send email
                $this->prepareSendWarningEmail(
                    $this->mergeTagsConfig($autoDelConf),
                    $email,
                    $emailOpts,
                    MelisGdprDeleteEmailsTable::EMAIL_DELETED
                );
            }
        }
    }

    /**
     * check user site if it belongs the current auto delete config
     *
     * @param $site
     * @param $autoDeleteSiteId
     * @return bool
     */
    private function checkUsersSite($site, $autoDeleteSiteId)
    {
        $status = false;
        // if aarray
        if (is_array($site)) {
            if (in_array($autoDeleteSiteId,$site)) {
                $status = true;
            }
        }
        // if string
        if ($site == $autoDeleteSiteId) {
            $status = true;
        }

        return $status;
    }

    /**
     * check users inactive days
     *
     * @param $emailOpt
     * @param $noOfDays
     * @return bool
     */
    private function checkUsersInactiveDays($emailOpt, $noOfDays)
    {
        $userStatus = false;
        // compare the users inactive days to auto delete config (Alert email sent after inactivity of)
        $usersDaysOfInactive = $this->getDaysDiff($emailOpt[self::CONFIG_KEY]['last_date'], date('Y-m-d'));
        iF ($usersDaysOfInactive > $noOfDays) {
            $userStatus = true;
        }

        return $userStatus;
    }

    /**
     * check users inactive days for first warning email
     *
     * @param $emailOpt
     * @param $alertEmailDays
     * @return bool
     */
    private function checkUsersInactiveDays7DaysBeforeDeadline($emailOpt, $alertEmailDays)
    {
        $status = false;
        // compare the users inactive days to auto delete config (Alert email sent after inactivity of)
        $usersDaysOfInactive = $this->getDaysDiff($emailOpt['config']['last_date'], date('Y-m-d'));

        // check if the day has come, 7 days before the delete days of inactivity
        if ($usersDaysOfInactive == ($alertEmailDays) - 7) {
            $status = true;
        }

        return $status;
    }

    /**
     * calculate the diffrence of two dates in days
     *
     * @param $date1
     * @param $date2
     * @return float
     */
    private function getDaysDiff($date1, $date2)
    {
        return round((strtotime($date2) - strtotime($date1)) / (60 * 60 * 24));
    }
    /**
     *
     * @param $validationKey
     * @return mixed
     */
    public function getEmailSentByValidationKey($validationKey)
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
        $arrayParameters['results'] = $this->deleteEmailsSentTable->getEmailSentByValidationKey($validationKey)->current();
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_gdpr_auto_delete_get_emaiL_sent_data_by_email_end', $arrayParameters);

        return $arrayParameters['results'];
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
            'title'          => $viewData['mgdprc_email_conf_layout_title'],
            'headerLogoLink' => 'https://www.google.com/',
            'headerLogo'     => !empty($viewData['mgdprc_email_conf_layout_logo']) ?  $viewData['mgdprc_email_conf_layout_logo'] : "http://dev9.test.melistechnology.fr/img/MelisTech.png",
            'footerInfo'     => $viewData['mgdprc_email_conf_layout_desc'],
            'content'        => wordwrap($content, FALSE),
            'fromName'       => $viewData['mgdprc_email_conf_from_name']
        ]);

        return $view->render($viewModel);
    }

    /**
     * send first warning for those email are inactive for the set days
     *
     * @param $emailSetupConfig
     * @param $email
     * @param $emailOptions
     * @param $type
     * @param $first
     * @return array
     */
    public function prepareSendWarningEmail($emailSetupConfig, $email ,$emailOptions, $type = MelisGdprDeleteEmailsTable::EMAIL_WARNING , $first = true )
    {
        $response = [
            'hasError' => false
        ];
        // check config key is present
        if ($this->isExists(self::CONFIG_KEY, $emailOptions)) {
            // check lang id is present
            if ($this->isExists(self::LANG_KEY,$emailOptions[self::CONFIG_KEY])) {
                // get lang id
                $langId = $emailOptions[self::CONFIG_KEY][self::LANG_KEY];
                // get alert emails required data for the email
                $alertEmailData = $this->gdprAutoDeleteToolService->getAlertEmailsTransData($emailSetupConfig['mgdprc_id'], $type, $langId);
                //  get the link of page id
                $link = $this->gdprAutoDeleteToolService->getLinkUrl($alertEmailData->mgdpre_link);
                // if link is homepage
                if ($link == "/") {
                    $uri = $this->getServiceLocator()->get('request')->getUri();
                    $alertEmailData->mgdpre_link = $uri->getScheme() . "://" . $uri->getHost();
                } else {
                    $alertEmailData->mgdpre_link = $link;
                }

                // add suffix to email subject indication of email if it is first or second
                if ($type == MelisGdprDeleteEmailsTable::EMAIL_WARNING) {
                    // default is first
                    $alertEmailData->mgdpre_subject = $alertEmailData->mgdpre_subject . " (1ˢᵗ)";
                    if (!$first) {
                        // override
                        $alertEmailData->mgdpre_subject = $alertEmailData->mgdpre_subject . " (2ⁿᵈ)";
                    }
                }
                // html email content
                $htmlContent = $this->replaceTagsByModuleTags(explode(',', $alertEmailData->mgdpre_email_tags), $alertEmailData, $emailOptions, $alertEmailData->mgdpre_html, $emailSetupConfig);
                // text version email content
                $textVersion =  $this->replaceTagsByModuleTags(explode(',', $alertEmailData->mgdpre_email_tags), $alertEmailData, $emailOptions, $alertEmailData->mgdpre_text, $emailSetupConfig);
                // check for errors
                if (empty($htmlContent['errors']) || empty($textVersion['errors'])) {
                    // send email
                    $this->sendEmail(
                        $emailSetupConfig['mgdprc_email_conf_from_email'],
                        $emailSetupConfig['mgdprc_email_conf_from_name'],
                        $email,
                        null,
                        $emailSetupConfig['mgdprc_email_conf_reply_to'],
                        $alertEmailData->mgdpre_subject,
                        $this->getEmailLayoutContent(
                            $emailSetupConfig,
                            $htmlContent['content']
                        ),
                        $textVersion['content']
                    );
                    // save log ok
                    $this->saveGdprAutoDeleteLogs(
                        $emailSetupConfig,
                        $email,
                        $type,
                        $first,
                        null,
                        true
                    );
                } else {
                    // set has error true
                    $response['hasError'] = true;
                    // logs not all tags are filled
                    $this->saveGdprAutoDeleteLogs(
                        $emailSetupConfig,
                        $email,
                        $type,
                        $first,
                        'Not all tags are filled',
                        false
                    );
                }

            } else {
                // set has error true
                $response['hasError'] = true;
                // logs lang key is missing
                $this->saveGdprAutoDeleteLogs(
                    $emailSetupConfig,
                    $email,
                    $type,
                    $first,
                    'No email content provided in asked language',
                    false
                );
            }
        }

        return $response;
    }

    /**
     * @param $data
     * @param $email
     * @param $message
     * @param $emailType
     * @param $isFirstEmail
     * @param null $success
     */
    private function saveGdprAutoDeleteLogs($data, $email, $emailType, $isFirstEmail, $message = null, $success = null)
    {
        if (is_array($data) && $data) {
            // prepare data to save
            // set some required fields
            $tmpDataToSave = [
                'mgdprl_site_id' => $data['mgdprc_site_id'],
                'mgdprl_module_name' => $data['mgdprc_module_name'],
                'mgdprl_log_date' => date('Y-m-d h:i:s')
            ];
            // check if there is already a log
            $logs = $this->getEmailsLogsByDate(date('Y-m-d'),$data['mgdprc_site_id'], $data['mgdprc_module_name']);
            // process first email warning and second warning users logs
            if ($emailType == MelisGdprDeleteEmailsTable::EMAIL_WARNING) {
                if ($isFirstEmail) {
                    $tmpDataToSave = array_merge($tmpDataToSave, $this->prepareFirstWarningLogs($success, $email, $message, $logs));
                } else {
                    $tmpDataToSave = array_merge($tmpDataToSave, $this->prepareSecondWarningLogs($success, $email, $message, $logs));
                }
            }

            // for deleted emails
            if ($emailType == MelisGdprDeleteEmailsTable::EMAIL_DELETED) {
                $tmpDataToSave = array_merge($tmpDataToSave, $this->prepareDeletedEmailLogs($success, $email, $message,$logs));
            }
            // save
            if (!empty($logs)) {
                // update log
                $this->emailsLogsTable->save($tmpDataToSave, $logs->mgdprl_id);
            } else {
                // save logs
                $this->emailsLogsTable->save($tmpDataToSave);
            }

        }
    }

    /**
     * @param $date
     * @param $siteId
     * @param $module
     * @return mixed
     */
    private function getEmailsLogsByDate($date, $siteId, $module)
    {
        return $this->emailsLogsTable->getEmailsLogsByDate($date, $siteId, $module)->current();
    }

    /**
     * @param $success
     * @param $email
     * @param $message
     * @param array $logs
     * @return array
     */
    private function prepareFirstWarningLogs($success, $email, $message, $logs = [])
    {
        $data = [];
        if ($success) {
            // for ok log;
            // set counter to 1
            $data['mgdprl_warning1_ok'] = 1;
            // set log error message
            $data['mgdprl_warning1_ok_log'] = $email;
            // check logs
            if (!empty($logs)) {
                // override and add counter
                $data['mgdprl_warning1_ok'] = (int) ($logs->mgdprl_warning1_ok + 1);
                // override message
                $data['mgdprl_warning1_ok_log'] = !empty($logs->mgdprl_warning1_ok_log) ? $logs->mgdprl_warning1_ok_log  . ";" . $email : $email;
            }
        } else {
            // message with error
            $messageWithError = $email . "/" . $message;
            // for ko log;
            $data = [
                // set counter to 1
                'mgdprl_warning1_ko' => 1,
                // set log error message
                'mgdprl_warning1_ko_log' => $messageWithError
            ];

            // check logs
            if (!empty($logs)) {
                // add counter
                $data['mgdprl_warning1_ko'] = (int) ($logs->mgdprl_warning1_ko + 1);
                // override message
                $data['mgdprl_warning1_ko_log'] = !empty($logs->mgdprl_warning1_ko_log) ? $logs->mgdprl_warning1_ko_log . "/" . $messageWithError . ";" : $messageWithError;
            }
        }

        return $data;
    }

    /**
     * @param $success
     * @param $email
     * @param $message
     * @param array $logs
     * @return array
     */
    public function prepareSecondWarningLogs($success, $email, $message, $logs = [])
    {
        $data = [];
        if ($success) {
            // for ok log;
            $data = [
                // set counter to 1
                'mgdprl_warning2_ok' => 1,
                // set log error message
                'mgdprl_warning2_ok_log' => $email
            ];
            // check logs
            if (!empty($logs)) {
                // add counter
                $data['mgdprl_warning2_ok'] = (int) ($logs->mgdprl_warning2_ok + 1);
                // override message
                $data['mgdprl_warning2_ok_log'] = !empty($logs->mgdprl_warning2_ok_log) ? $logs->mgdprl_warning2_ok_log . ";" . $email : $email;
            }
        } else {
            $messageWithError = $email . "/" . $message;
            // for ko log;
            $data = [
                // set counter to 1
                'mgdprl_warning2_ko' => 1,
                // set log error message
                'mgdprl_warning2_ko_log' => $messageWithError
            ];

            // check logs
            if (!empty($logs)) {
                // add counter
                $data['mgdprl_warning2_ko'] = (int) ($logs->mgdprl_warning2_ko + 1);
                // override message
                $data['mgdprl_warning2_ko_log'] = !empty($logs->mgdprl_warning2_ko_log) ? $logs->mgdprl_warning2_ko_log . "/" . $messageWithError . ";" : $messageWithError;
            }
        }

        return $data;
    }

    /**
     * @param $success
     * @param $email
     * @param $message
     * @param array $logs
     * @return array
     */
    public function prepareDeletedEmailLogs($success, $email, $message, $logs = [])
    {
        $data = [];
        if ($success) {
            // for ok log;
            $data = [
                // set counter to 1
                'mgdprl_delete_ok' => 1,
                // set log error message
                'mgdprl_delete_ok_log' => $email
            ];
            // check logs
            if (!empty($logs)) {
                // add counter
                $data['mgdprl_delete_ok'] = (int) ($logs->mgdprl_delete_ok + 1);
                // override message
                $data['mgdprl_delete_ok_log'] = !empty($logs->mgdprl_delete_ok_log) ? $logs->mgdprl_delete_ok_log . ";" . $email : $email;
            }
        } else {
            $messageWithError = $email . "/" . $message;
            // for ko log;
            $data = [
                // set counter to 1
                'mgdprl_delete_ko' => 1,
                // set log error message
                'mgdprl_delete_ko_log' => $messageWithError
            ];

            // check logs
            if (!empty($logs)) {
                // add counter
                $data['mgdprl_delete_ko'] = (int) ($logs->mgdprl_delete_ko + 1);
                // override message
                $data['mgdprl_delete_ko_log'] = !empty($logs->mgdprl_delete_ko_log) ? $logs->mgdprl_delete_ko_log. "/" . $messageWithError . ";" : $messageWithError;
            }
        }

        return $data;
    }


    /**
     * send email
     *
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
        $smtpDataConfig = (array) $this->getServiceLocator()->get('MelisGdprDeleteEmailsSmtp')->fetchAll()->current();
        $smtpConfig = [];
        if (!empty($smtpDataConfig)) {
            $smtpConfig = [
                'host'            => $smtpDataConfig['mgdpr_smtp_host'],
                'name'            => $smtpDataConfig['mgdpr_smtp_host'],
                'port'            => $smtpDataConfig['mgdpr_smtp_port'],
                'connectionClass' => 'plain',
                'username'        => $smtpDataConfig['mgdpr_smtp_username'],
                'password'        => $smtpDataConfig['mgdpr_smtp_password'],
                'ssl'             => $smtpDataConfig['mgdpr_smtp_ssl'],
            ];
        }

        return $this->getServiceLocator()->get('MelisCoreEmailSendingService')->sendEmail(
            $emailFrom,
            $emailFromName,
            $emailTo,
            $emailToName,
            $replyTo,
            $subject,
            $messageHtml,
            $messageText,
            $smtpConfig
        );
    }

    /**
     * add data on table melis_core_gdpr_delete_emails_sent
     *
     * @param $data
     * @param null $id
     * @return int|null
     */
    public function saveEmailsSentData($data, $id = null)
    {
        return $this->deleteEmailsSentTable->save($data, $id);
    }

    /**
     * trigger an event and then get data based from main key to retrieve or with sub key to retrieve
     *
     * @param $mvcEventName
     * @param $mainKeyToRetrieve
     * @param null $subKeyToRetrieve
     * @param array $params
     * @return array
     */
    private function getDataOfAnEvent($mvcEventName, $mainKeyToRetrieve = null, $subKeyToRetrieve = null , $params = [])
    {
        // trigger zend mvc event
        $list = $this->getEventManager()->trigger($mvcEventName,$this, $params);
        $data = [];
        // get the returned data from each module listener
        for ($list->rewind(); $list->valid(); $list->next()) {
            // check if current data is not empty
            if (!empty($list->current())) {
                if (!is_null($mainKeyToRetrieve)) {
                    // get the lists
                    foreach ($list->current()[$mainKeyToRetrieve] as $moduleName => $moduleOptions) {
                        if (!is_null($subKeyToRetrieve)) {
                            $data[$moduleName] = $moduleOptions[$subKeyToRetrieve] ?? [];
                        } else {
                            $data[$moduleName] = $moduleOptions;
                        }
                    }
                } else {
                    $data = $list->current();
                }
            }
        };

        return $data;
    }

    /**
     * get the list of warning users in every modules that was sent through their respective listeners
     *
     * @return array
     */
    public function getAllModulesWarningListOfUsers()
    {
        return $this->getDataOfAnEvent(self::WARNING_EVENT, self::WARNING_LIST_KEY);
    }

    /**
     * get the list of second warning users in every modules that was sent through their respective listeners
     *
     * @return array
     */
    public function getAllModulesSecondWarningListOfUsers()
    {
        return $this->getDataOfAnEvent(self::SECOND_WARNING_EVENT, self::SECOND_WARNING_LIST_KEY);
    }

    /**
     * check if the key is exisiting and not empty in the given array
     *
     * @param $key
     * @param array $array
     * @return bool
     */
    private function isExists($key, array $array)
    {
        if (isset($array[$key]) && ! empty($array[$key])) {
            return true;
        }

        return false;
    }

    /**
     * @param $emailData
     * @param $content
     * @return null|string
     */
    private function getEmailLayoutContent($emailData, $content)
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

    /**
     * replace tags on the content
     *
     * @param array $tags
     * @param $data
     * @param $emailOptions
     * @param $content
     * @param $setupEmailConfig
     * @return mixed|string
     */
    private function replaceTagsByModuleTags(array $tags, $data, $emailOptions, $content, $setupEmailConfig)
    {
        $tagsNotFoundOnModule = [];
        $moduleTags = $emailOptions['tags'];
        if (!empty($tags)) {
            // accepted tags
            foreach ($tags as $idx => $dbTag) {
                // replace the reserved tag and replace the content
                if ($dbTag == "URL") {
                    // url for revalidation of user
                    $moduleTags['URL'] = $data->mgdpre_link . "?u=" . (isset($emailOptions['config']['validationKey']) ? $emailOptions['config']['validationKey'] : null) ;
                }
                // look for module tags
                if (isset($moduleTags[$dbTag]) && !empty($moduleTags[$dbTag])) {
                    // get email content and replace tags
                    $content = str_replace('[' . $dbTag . ']', $moduleTags[$dbTag], $content);
                } else {
                    $tagsNotFoundOnModule[] = $dbTag;
                }
            }
        }


        return [
            'content' => $content,
            'errors' => $tagsNotFoundOnModule
        ];
    }

    private function getTranslation()
    {
        return $this->getServiceLocator()->get('translator');
    }
}