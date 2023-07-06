<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use MelisCore\Service\MelisGeneralService;
use Laminas\Session\Container;
use Laminas\Stdlib\ArrayUtils;
use Laminas\View\Model\JsonModel;

class MelisCoreSystemMaintenanceService extends MelisGeneralService
{
    public function getItemById($id)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $arrayParameters = $this->sendEvent('Systemmaintenance_service_get_item_start', $arrayParameters);

        $SystemmaintenanceTable = $this->getServiceManager()->get('SystemmaintenanceTable');
        $item = $SystemmaintenanceTable->getEntryById($arrayParameters['id'])->current();

        $arrayParameters['results'] = $item;
        $arrayParameters = $this->sendEvent('Systemmaintenance_service_get_item_end', $arrayParameters);
        return $arrayParameters['results'];
    }

    public function getList($start = null, $limit = null, $searchKeys = [], $searchValue = null, $orderKey = null, $order = 'ASC', $langId = 1, $count = false)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $arrayParameters = $this->sendEvent('systemmaintenance_service_get_list_start', $arrayParameters);

        $systemmaintenanceTable = $this->getServiceManager()->get('SystemmaintenanceTable');
        $list = $systemmaintenanceTable->getList(
            $arrayParameters['start'],
            $arrayParameters['limit'],
            $arrayParameters['searchKeys'],
            $arrayParameters['searchValue'],
            $arrayParameters['orderKey'],
            $arrayParameters['order'],
            $arrayParameters['langId'],
            $arrayParameters['count']
        );

        $arrayParameters['results'] = $list;
        $arrayParameters = $this->sendEvent('systemmaintenance_service_get_list_end', $arrayParameters);
        return $arrayParameters['results'];
    }

    public function saveItem($data, $id = null)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $arrayParameters = $this->sendEvent('systemmaintenance_service_save_item_start', $arrayParameters);

        if ($data) {
            $systemmaintenanceTable = $this->getServiceManager()->get('SystemmaintenanceTable');
            $res = $systemmaintenanceTable->save($arrayParameters['data'], $arrayParameters['id']);
        }

        $arrayParameters['result'] = $res;
        $arrayParameters = $this->sendEvent('systemmaintenance_service_save_item_end', $arrayParameters);
        return $arrayParameters['result'];
    }

    public function deleteItem($id)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $arrayParameters = $this->sendEvent('systemmaintenance_service_delete_item_start', $arrayParameters);

        $systemmaintenanceTable = $this->getServiceManager()->get('SystemmaintenanceTable');
        $res = $systemmaintenanceTable->deleteById($arrayParameters['id']);

        $arrayParameters['result'] = $res;
        $arrayParameters = $this->sendEvent('systemmaintenance_service_delete_item_end', $arrayParameters);
        return $arrayParameters['result'];
    }

    /**
     * Deletion of page cache from the Zend Server
     * using zend API page_cache_remove_cached_contents_by_rule
     * https://help.zend.com/zend/current/content/zendserverapi/zend_page_cache-php_api.htm
     * 
     * to learn about page cache link below
     * https://help.zend.com/zend/current/content/page_cache_concept.htm
     */
    public function clearPageCache()
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $arrayParameters = $this->sendEvent('systemmaintenance_service_delete_item_start', $arrayParameters);

        $success = 0;
        // Checking zend server web api function if exist
        if (function_exists('page_cache_remove_cached_contents_by_rule')) {

            // Getting list of rules from config
            $config = $this->getServiceManager()->get('config');
            $rules = $config['maintenance-mode']['zend-server']['page-cache-rules'];

            if (!empty($rules) && is_array($rules)) {
                foreach ($rules As $rule) {
                    page_cache_remove_cached_contents_by_rule($rule);
                }
                $success = 1;
            }
        }

        $arrayParameters['result']['success'] = $success;
        $arrayParameters = $this->sendEvent('systemmaintenance_service_delete_item_end', $arrayParameters);
        return $arrayParameters['result'];
    }


}