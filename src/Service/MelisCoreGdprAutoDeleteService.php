<?php
namespace MelisCore\Service;
/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * Class MelisCoreGdprAutoDeleteService
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 * @package MelisCore\Service
 */

class MelisCoreGdprAutoDeleteService extends MelisCoreGeneralService implements MelisCoreGdprAutoDeleteInterface
{
    /**
     * constants to avoid incorrect entries of events,keys and can be use everywhere
     */
    const TAGS_EVENT              = "melis_core_gdpr_auto_delete_modules_tags_list";
    const TAG_LIST_KEY            = "modules_tags_list";
    const TAG_KEY                 = "tags";
    const WARNING_EVENT           = "melis_core_gdpr_auto_delete_warning_list_of_users";
    const WARNING_LIST_KEY        = "modules_warning_list";
    const SECOND_WARNING_EVENT    = "melis_core_gdpr_auto_delete_second_warning_list_of_users";
    const SECOND_WARNING_LIST_KEY = "modules_second_warning_list";
    const VALIDATION_KEY          = "validation_key";
    const CONFIG_KEY              = "config";
    const LANG_KEY                = "lang";

    /**
     * @var MelisCoreGdprAutoDeleteToolService
     */
    protected $gdprAutoDeleteToolService;

    /**
     * MelisCoreGdprAutoDeleteService constructor.
     * @param MelisCoreGdprAutoDeleteToolService $autoDeleteToolService
     */
    public function __construct(MelisCoreGdprAutoDeleteToolService $autoDeleteToolService)
    {
        $this->gdprAutoDeleteToolService = $autoDeleteToolService;
    }

    /**
     * get the list of tags in every modules that was sent through their respective listeners
     * @return array
     */
    public function getListOfTags()
    {
        return $this->getDataOfAnEvent(self::TAGS_EVENT,self::TAG_LIST_KEY,self::TAG_KEY);
    }

    /**
     * get the list of warning users in every modules that was sent through their respective listeners
     * @return array
     */
    public function getWarningListOfUsers()
    {
        return $this->getDataOfAnEvent(self::WARNING_EVENT,self::WARNING_LIST_KEY);
    }

    /**
     * get the list of second warning users in every modules that was sent through their respective listeners
     * @return array
     */
    public function getSecondWarningListOfUsers()
    {
        return $this->getDataOfAnEvent(self::SECOND_WARNING_EVENT,self::SECOND_WARNING_LIST_KEY);
    }

    /**
     * @param $validationKey
     */
    public function getUserPerValidationKey($validationKey)
    {
        // TODO: Implement getUserPerValidationKey() method.
    }
    public function updateGdprUserStatus($validationKey)
    {
        // TODO: Implement updateGdprUserStatus() method.
    }
    public function removeOldUnvalidatedUsers()
    {
        // TODO: Implement removeOldUnvalidatedUsers() method.
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
       for ($list->rewind();$list->valid();$list->next()) {
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

   public function runCron()
   {
       $autoDeleteData =  $this->getFullGdprDataForAutoDelete();
       if (!empty($autoDeleteData)) {
           $this->print($autoDeleteData);
       }

       die;
   }
    public function getFullGdprDataForAutoDelete()
    {
        // retrieving list of modules and list of sites
        $autoDeleteConfigData =  $this->gdprAutoDeleteToolService->getAllGdprAutoDeleteConfigDataWithEmailTrans();
        // retrieving list of users' emails for email warning
        if (!empty($autoDeleteConfigData)) {
            foreach ($autoDeleteConfigData as $idx => $val) {
                /*
                 * tags set by the modules
                 */
                if (!empty($this->getListOfTags())) {
                    foreach ($this->getListOfTags() as $moduleName => $tags) {
                        if ($val['mgdprc_module_name'] == $moduleName) {
                            $autoDeleteConfigData[$idx]['tags'] = $tags;
                        }
                    }
                }
                /*
                 * warnign users set by the modules
                 */
                if (!empty($this->getWarningListOfUsers())) {
                    foreach ($this->getWarningListOfUsers() as $moduleName => $emails) {
                        if ($val['mgdprc_module_name'] == $moduleName) {
                            $autoDeleteConfigData[$idx]['warning_users'] = $emails;
                        }
                    }
                }
                /*
                 *  second warnign users set by the modules
                 */
                if (!empty($this->getSecondWarningListOfUsers())) {
                    foreach ($this->getSecondWarningListOfUsers() as $moduleName => $emails) {
                        if ($val['mgdprc_module_name'] == $moduleName) {
                            $autoDeleteConfigData[$idx]['second_warning_users'] = $emails;
                        }
                    }
                }
            }
        }

        return $autoDeleteConfigData;
    }

   private function print($data)
   {
       echo "<pre>";print_r($data);echo "</pre>";
   }
}