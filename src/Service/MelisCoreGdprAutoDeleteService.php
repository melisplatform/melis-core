<?php
namespace MelisCore\Service;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

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
    // validation key use
    const VALIDATION_KEY          = "validation_key";
    const CONFIG_KEY              = "config";
    const LANG_KEY                = "lang";
    const TAGS_EVENT              = "melis_core_gdpr_auto_delete_modules_tags_list";
    const TAG_LIST_KEY            = "modules_tags_list";
    const TAG_KEY                 = "tags";
    const WARNING_EVENT           = "melis_core_gdpr_auto_delete_warning_list_of_users";
    const WARNING_LIST_KEY        = "modules_warning_list";
    const SECOND_WARNING_EVENT    = "melis_core_gdpr_auto_delete_second_warning_list_of_users";
    const SECOND_WARNING_LIST_KEY = "modules_second_warning_list";

    /**
     * get the list of tags in every modules that was sent through their respective listeners
     * @return array
     */
    public function getModulesListOfTags()
    {
        return $this->getDataOfAnEvent(self::TAGS_EVENT,self::TAG_LIST_KEY,self::TAG_KEY);
    }

    /**
     * get the list of warning users in every modules that was sent through their respective listeners
     * @return array
     */
    public function getModulesWarningListOfUsers()
    {
        return $this->getDataOfAnEvent(self::WARNING_EVENT,self::WARNING_LIST_KEY);
    }

    /**
     * get the list of second warning users in every modules that was sent through their respective listeners
     * @return array
     */
    public function getModulesSecondWarningListOfUsers()
    {
        return $this->getDataOfAnEvent(self::SECOND_WARNING_EVENT,self::SECOND_WARNING_LIST_KEY);
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
}