<?php

namespace MelisCore\Service;

class MelisCoreLogService  extends MelisCoreGeneralService
{
    /**
     * Common action log types
     */
    const ADD = 'ADD';
    const UPDATE = 'UPDATE';
    const DELETE= 'DELETE';

    /**
     * Saving action to logs using Melis Core Service
     *
     * @param $result - 1 or 0
     * @param $title - log title
     * @param $message - message
     * @param $logCode - code of the log/log identifier
     * @param $itemId - the ID of the item to save - null if no ID
     */
    public function logAction($result, $title, $message, $logCode, $itemId)
    {
        $flashMessenger = $this->getServiceManager()->get('MelisCoreFlashMessenger');

        $icon = ($result) ? $flashMessenger::INFO:  $flashMessenger::WARNING;

        $flashMessenger->addToFlashMessenger($title, $message, $icon);

        $this->saveLog($title, $message, $result, $logCode, $itemId);
    }
	
	/**
	 * This method will return the list of logs 
	 * 
	 * @param int $typeId if specified, this will return only with the same TypeId related to the melis_core_log_type
	 * @param int $itemId if specified, this will return only with the same ItemId related to any table
	 * @param int $userId if specified, this will return only with the same UserId related to the melis_core_user
	 * @param Date $dateCreationMin if specified, this will return only logs that equal or greater than the specified date
	 * @param Date $dateCreationMax if specified, this will return only logs that equal or greater than the specified date
	 * @param int $start this will return data result that index number start on the specified value
	 * @param int $limit this will return data limited to the specified value
	 * @param int $order this will order the result data to "desc" or "asc"
	 * @param String $search if specified this will return data only that will match to the search value as keyword
	 * @return Array
	 */
	public function getLogList($typeId = null, $itemId = null, $userId = null, $dateCreationMin = null, $dateCreationMax = null, 
                                    $start = 0, $limit = null, $order = null, $search = null, $status = null)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = array();

	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_log_list_start', $arrayParameters);
	    // Service implementation end

	    // Retrieving the list of logs
	    $melisCoreTableLog = $this->getServiceManager()->get('MelisCoreTableLog');
	    $logList = $melisCoreTableLog->getLogList($arrayParameters['typeId'], $arrayParameters['itemId'], $arrayParameters['userId'], $arrayParameters['dateCreationMin'],
	                                                $arrayParameters['dateCreationMax'], $arrayParameters['start'], $arrayParameters['limit'], $arrayParameters['order'], $arrayParameters['search'], $arrayParameters['status']);
	    $logs = array();
	    foreach ($logList As $key => $val)
	    {
	        // Using the getLog function this will return Log Entity and added to results
	        array_push($results, $this->getLog($val->log_id));
	    }
	    
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_log_list_end', $arrayParameters);
	     
	    return $arrayParameters['results'];
	}
	
	/**
	 * This method will return the Log Entity
	 * @param int $logId primary key of the log data
	 * @return MelisLog[] Log object
	 */
	public function getLog($logId)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = array();
	     
	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_get_log_start', $arrayParameters);
	    // Service implementation end
	    
	    $logEntity = new \MelisCore\Entity\MelisLog();
	    $melisCoreTableLog = $this->getServiceManager()->get('MelisCoreTableLog');
	    
	    if (!empty($arrayParameters['logId']) && is_numeric($arrayParameters['logId']))
	    {
	        $log = $melisCoreTableLog->getEntryById($arrayParameters['logId'])->current();
	        
	        if (!empty($log))
	        {
	            // Log Entity setters
	            $logEntity->setId($log->log_id);
	            $logEntity->setLog($log);
	            $logEntity->setType($this->getLogType($log->log_type_id));
	            $logEntity->setTranslations($this->getLogTypeTranslations($log->log_type_id));
	        }
	    }
	    
	    $results = $logEntity;
	    
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_get_log_end', $arrayParameters);
	    
	    return $arrayParameters['results'];
	}
	
	/**
	 * This method will return the Type of the Log
	 * @param int $logTypeId the primary key of the Log Type
	 * @return MelisLogType[] LogType object
	 */
	public function getLogType($logTypeId)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = array();
	    
	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_get_log_type_start', $arrayParameters);
	    // Service implementation end

	    $melisCoreTableLogType = $this->getServiceManager()->get('MelisCoreTableLogType');
	    
	    if (!empty($arrayParameters['logTypeId']) && is_numeric($arrayParameters['logTypeId']))
	    {
	        $logType = $melisCoreTableLogType->getEntryById($arrayParameters['logTypeId'])->current();
	        if (!empty($logType))
	        {
	            $results = $logType;
	        }
	    }
	    
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_get_log_type_end', $arrayParameters);
	     
	    return $arrayParameters['results'];
	}
	
	/**
	 * This method will return Log Type using typeCode of the Log Type
	 * @param String $logTypeCode the type code of the Log Type
	 * @return MelisLogType[] LogType object
	 */
	public function getLogTypeByTypeCode($logTypeCode)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = array();
	    
	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_get_log_type_by_code_start', $arrayParameters);
	    // Service implementation end
	    
	    $melisCoreTableLogType = $this->getServiceManager()->get('MelisCoreTableLogType');
	    
	    if (!empty($arrayParameters['logTypeCode']))
	    {
	        $logType = $melisCoreTableLogType->getEntryByField('logt_code', $arrayParameters['logTypeCode'])->current();
	        if (!empty($logType))
	        {
	            $results = $logType;
	        }
	    }
	    
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_get_log_type_by_code_end', $arrayParameters);
	     
	    return $arrayParameters['results'];
	}
	
	/**
	 * This method will return the Log Type Translations
	 * @param int $logTypeId the primary key of the Log Type
	 * @param int $langId if specified, this will return only with the same langId
	 * @return @return MelisLogTypeTrans[] LogTypeTrans object
	 */
	public function getLogTypeTranslations($logTypeId, $langId = null)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = array();
	     
	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_get_log_type_start', $arrayParameters);
	    // Service implementation end
	     
	    $melisCoreTableLogTypeTrans = $this->getServiceManager()->get('MelisCoreTableLogTypeTrans');
	     
	    if (!empty($arrayParameters['logTypeId']) && is_numeric($arrayParameters['logTypeId']))
	    {
	        $logTypeTrans = $melisCoreTableLogTypeTrans->getLogTypeTranslations($arrayParameters['logTypeId'], $arrayParameters['langId']);

	        foreach ($logTypeTrans As $key => $val)
	        {
	            array_push($results, $val);
	        }
	    }
	     
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_get_log_type_end', $arrayParameters);
	    
	    return $arrayParameters['results'];
	}
	
	/**
	 * This method will save the log
	 * @param String $title, title of the log data
	 * @param String $message, Message of the log data
	 * @param int $status, the status of the action "1" or "0"
	 * @param String $typeCode, Type Code of the Log type
	 * @param int $itemId, ItemId of the log
	 * @param int $logId, the primary key of Log, if specified this will update the log
	 * @return Int|null if the saving is failed
	 */
	public function saveLog($title, $message, $status, $typeCode, $itemId = null, $logId = null)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = null;
	     
	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_save_log_start', $arrayParameters);
	    // Service implementation end
	     
	    $melisCoreTableLog = $this->getServiceManager()->get('MelisCoreTableLog');
	    
	    // Get Current User ID
	    $userId = null;
	    $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
	    $userAuthDatas =  $melisCoreAuth->getStorage()->read();
	    if ($userAuthDatas)
	    {
	        $userId = (int) $userAuthDatas->usr_id;
	    }
	    
	    // Checking if the Typecode exist, else this will save as new TypeCode entry
	    $logType = $this->getLogTypeByTypeCode($arrayParameters['typeCode']);
	    $logTypeId = null;
	    if (!empty($logType))
	    {
	        $logTypeId = $logType->logt_id;
	    }
	    else
	    {
	        try {
	            // Save LogType as new Data
	            $logTypeId = $this->saveLogType($arrayParameters['typeCode']);
	        }
	        catch(\Exception $e){}
	    }
	    
	    if (!is_null($userId) && !is_null($logTypeId))
	    {
	        // Preparing the Log data for saving
	        $log = array(
	            'log_title' => $arrayParameters['title'],
	            'log_message' => $arrayParameters['message'],
	            'log_action_status' => ($arrayParameters['status']) ? 1 : 0,
	            'log_type_id' => $logTypeId,
	            'log_item_id' => $arrayParameters['itemId'],
	            'log_user_id' => $userId,
	            'log_date_added' => date('Y-m-d H:i:s'),
	        );
	         
	        try
	        {
	            // Save Log
	            $results = $melisCoreTableLog->save($log, $arrayParameters['logId']);
	        }
	        catch(\Exception $e){
	            echo $e->getMessage();
            }
	    }
	    
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_save_log_end', $arrayParameters);
	    
	    return $arrayParameters['results'];
	}
	
	/**
	 * This method will save Log type using the new LogTypeCode
	 * @param String $logTypeCode, the TypeCode of the LogType
	 * @param int $logTypeId if specified this will updated the LogType
	 * @return Int|null if the saving is failed
	 */
	public function saveLogType($logTypeCode, $logTypeId = null)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = null;
	     
	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_save_log_type_start', $arrayParameters);
	    // Service implementation end
	     
	    $melisCoreTableLogType = $this->getServiceManager()->get('MelisCoreTableLogType');
	    
	    if (!empty($arrayParameters['logTypeCode']))
	    {
	        $data = array(
	            'logt_code' => $logTypeCode
	        );
	        
	        try {
	            $results = $melisCoreTableLogType->save($data, $arrayParameters['logTypeId']);
	        }
	        catch(\Exception $e){}
	    }
	    
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_save_log_type_end', $arrayParameters);
	    
	    return $arrayParameters['results'];
	}
	
	/**
	 * This method will save the Log type Translations
	 * 
	 * @param Array $logTypeTrans
	 * @param int $logTypeTransId
	 * @return Int|null if the saving is failed
	 */
	public function saveLogTypeTrans($logTypeTrans, $logTypeTransId = null)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = null;
	    
	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_save_log_type_trans_start', $arrayParameters);
	    // Service implementation end
	    
	    $melisCoreTableLogTypeTrans = $this->getServiceManager()->get('MelisCoreTableLogTypeTrans');
	    
	    try {
	        $results = $melisCoreTableLogTypeTrans->save($arrayParameters['logTypeTrans'], $arrayParameters['logTypeTransId']);
	    }
	    catch(\Exception $e){}
	    
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_save_log_type_trans_end', $arrayParameters);
	     
	    return $arrayParameters['results'];
	}
	
	public function deleteLogTypeTrans($logTypeTransId)
	{
	    // Event parameters prepare
	    $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
	    $results = null;
	     
	    // Sending service start event
	    $arrayParameters = $this->sendEvent('meliscore_save_log_type_trans_start', $arrayParameters);
	    // Service implementation end
	     
	    $melisCoreTableLogTypeTrans = $this->getServiceManager()->get('MelisCoreTableLogTypeTrans');
	     
	    try {
	        $results = $melisCoreTableLogTypeTrans->deleteById($arrayParameters['logTypeTransId']);
	    }
	    catch(\Exception $e){}
	     
	    // Adding results to parameters for events treatment if needed
	    $arrayParameters['results'] = $results;
	    // Sending service end event
	    $arrayParameters = $this->sendEvent('meliscore_save_log_type_trans_end', $arrayParameters);
	    
	    return $arrayParameters['results'];
	}
}