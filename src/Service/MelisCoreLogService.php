<?php

namespace MelisCore\Service;

class MelisCoreLogService  extends MelisGeneralService
{
	/**
	 * Whether melis_core_log has the security columns of flyway V36.
	 * Resolved once per request (null = not looked up yet).
	 *
	 * @var bool|null
	 */
	private static $hasSecurityColumns = null;

	/**
	 * Common action log types
	 */
	const ADD = 'ADD';
	const UPDATE = 'UPDATE';
	const DELETE = 'DELETE';

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

		$icon = ($result) ? $flashMessenger::INFO :  $flashMessenger::WARNING;

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
	public function getLogList(
		$typeId = null,
		$itemId = null,
		$userId = null,
		$dateCreationMin = null,
		$dateCreationMax = null,
		$start = 0,
		$limit = null,
		$order = null,
		$search = null,
		$status = null
	) {
		$arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
		$results = array();

		$arrayParameters = $this->sendEvent('meliscore_log_list_start', $arrayParameters);

		$melisCoreTableLog = $this->getServiceManager()->get('MelisCoreTableLog');
		$logList = $melisCoreTableLog->getLogList(
			$arrayParameters['typeId'],
			$arrayParameters['itemId'],
			$arrayParameters['userId'],
			$arrayParameters['dateCreationMin'],
			$arrayParameters['dateCreationMax'],
			$arrayParameters['start'],
			$arrayParameters['limit'],
			$arrayParameters['order'],
			$arrayParameters['search'],
			$arrayParameters['status']
		);

		// Collect rows and unique type IDs in one pass
		$rows    = [];
		$typeIds = [];
		foreach ($logList as $row) {
			$rows[]                    = $row;
			$typeIds[$row->log_type_id] = true;
		}

		// Batch-load all log types used on this page (avoids 1 query per row)
		$logTypesMap     = [];
		$logTypeTransMap = [];
		if (!empty($typeIds)) {
			$logTypeTable      = $this->getServiceManager()->get('MelisCoreTableLogType');
			$logTypeTransTable = $this->getServiceManager()->get('MelisCoreTableLogTypeTrans');

			foreach (array_keys($typeIds) as $tid) {
				$logType = $logTypeTable->getEntryById($tid)->current();
				$logTypesMap[$tid] = $logType ?: null;

				$transRows = [];
				foreach ($logTypeTransTable->getLogTypeTranslations($tid, null) as $t) {
					$transRows[] = $t;
				}
				$logTypeTransMap[$tid] = $transRows;
			}
		}

		// Build entities from already-fetched rows — no per-row DB re-fetch
		foreach ($rows as $row) {
			$logEntity = new \MelisCore\Entity\MelisLog();
			$logEntity->setId($row->log_id);
			$logEntity->setLog($row);
			$logEntity->setType($logTypesMap[$row->log_type_id] ?? null);
			$logEntity->setTranslations($logTypeTransMap[$row->log_type_id] ?? []);
			$results[] = $logEntity;
		}

		$arrayParameters['results'] = $results;
		$arrayParameters = $this->sendEvent('meliscore_log_list_end', $arrayParameters);

		return $arrayParameters['results'];
	}

	public function getLogCount(
		$typeId = null,
		$itemId = null,
		$userId = null,
		$dateCreationMin = null,
		$dateCreationMax = null,
		$search = null,
		$status = null
	) {
		$melisCoreTableLog = $this->getServiceManager()->get('MelisCoreTableLog');

		return $melisCoreTableLog->getLogCount(
			$typeId,
			$itemId,
			$userId,
			$dateCreationMin,
			$dateCreationMax,
			$search,
			$status
		);
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

		if (!empty($arrayParameters['logId']) && is_numeric($arrayParameters['logId'])) {
			$log = $melisCoreTableLog->getEntryById($arrayParameters['logId'])->current();

			if (!empty($log)) {
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

		if (!empty($arrayParameters['logTypeId']) && is_numeric($arrayParameters['logTypeId'])) {
			$logType = $melisCoreTableLogType->getEntryById($arrayParameters['logTypeId'])->current();
			if (!empty($logType)) {
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

		if (!empty($arrayParameters['logTypeCode'])) {
			$logType = $melisCoreTableLogType->getEntryByField('logt_code', $arrayParameters['logTypeCode'])->current();
			if (!empty($logType)) {
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

		if (!empty($arrayParameters['logTypeId']) && is_numeric($arrayParameters['logTypeId'])) {
			$logTypeTrans = $melisCoreTableLogTypeTrans->getLogTypeTranslations($arrayParameters['logTypeId'], $arrayParameters['langId']);

			foreach ($logTypeTrans as $key => $val) {
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
	 * @param array $context, optional security details (DEKRA item 21.0): client IP, login
	 *        typed on a failed attempt, explicit user id, and a small free-form array stored
	 *        as JSON. Filled by MelisCoreSecurityAuditService; any other caller can ignore it
	 *        and keeps the previous behaviour.
	 * @return Int|null if the saving is failed
	 */
	public function saveLog($title, $message, $status, $typeCode, $itemId = null, $logId = null, array $context = [])
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
		if ($userAuthDatas) {
			$userId = (int) $userAuthDatas->usr_id;
		}

		if (in_array($arrayParameters['typeCode'], ['WRONG_LOGIN_CREDENTIALS', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED'])) {
			$userId = $arrayParameters['itemId'];
		}

		// A caller may name the user explicitly: during a login the session identity is not
		// always readable yet at the moment the event is logged.
		if (!empty($context['userId'])) {
			$userId = (int) $context['userId'];
		}

		// Checking if the Typecode exist, else this will save as new TypeCode entry
		$logType = $this->getLogTypeByTypeCode($arrayParameters['typeCode']);
		$logTypeId = null;
		if (!empty($logType)) {
			$logTypeId = $logType->logt_id;
		} else {
			try {
				// Save LogType as new Data
				$logTypeId = $this->saveLogType($arrayParameters['typeCode']);
			} catch (\Exception $e) {
			}
		}

		/**
		 * Security events can happen with nobody logged in - a login attempt on an account
		 * that does not exist has no user id at all. Those used to be dropped here, which is
		 * why a sweep over unknown logins left no trace (DEKRA item 21.0). They are now kept,
		 * with a NULL user id. Every other log still requires a user, as before.
		 */
		$audit              = $this->getSecurityAudit();
		$isAnonymousAllowed = $audit && $audit->isAnonymousType($arrayParameters['typeCode']);

		/**
		 * Security events always carry the client IP, even when the caller passed no context:
		 * failed logins are logged through the flash messenger, which knows nothing about all
		 * this, and the IP is exactly what the detection rules need.
		 */
		if ($audit && empty($context['ip']) && $audit->isSecurityType($arrayParameters['typeCode'])) {
			$context['ip'] = $audit->getClientIp();
		}

		if ((!is_null($userId) || $isAnonymousAllowed) && !is_null($logTypeId)) {
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

			$log = $this->addSecurityColumns($log, $context);

			try {
				// Save Log
				$results = $melisCoreTableLog->save($log, $arrayParameters['logId']);
			} catch (\Exception $e) {
				echo $e->getMessage();
			}

			$this->notifySecurityAudit($arrayParameters, $context, $userId, $results);
		}

		// Adding results to parameters for events treatment if needed
		$arrayParameters['results'] = $results;
		// Sending service end event
		$arrayParameters = $this->sendEvent('meliscore_save_log_end', $arrayParameters);

		return $arrayParameters['results'];
	}

	/**
	 * Adds the security columns (client IP, login typed, JSON context) to a log row.
	 *
	 * The columns are created by flyway V36. They are only written when they actually exist,
	 * so the platform keeps logging normally on an environment where the migration has not run
	 * yet instead of failing on every single log write.
	 *
	 * @param array $log     row about to be saved
	 * @param array $context security details given by the caller
	 * @return array
	 */
	private function addSecurityColumns(array $log, array $context)
	{
		if (empty($context) || !$this->hasSecurityColumns()) {
			return $log;
		}

		if (!empty($context['ip'])) {
			$log['log_ip'] = substr((string) $context['ip'], 0, 45);
		}

		if (!empty($context['login_attempted'])) {
			$log['log_login_attempted'] = substr((string) $context['login_attempted'], 0, 255);
		}

		if (!empty($context['data']) && is_array($context['data'])) {
			$json = json_encode($context['data'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

			if ($json !== false) {
				$log['log_context'] = $json;
			}
		}

		return $log;
	}

	/**
	 * True when melis_core_log carries the security columns.
	 *
	 * Looked up once per request and remembered, so this costs at most one small query.
	 *
	 * @return bool
	 */
	private function hasSecurityColumns()
	{
		if (self::$hasSecurityColumns !== null) {
			return self::$hasSecurityColumns;
		}

		self::$hasSecurityColumns = false;

		try {
			$adapter = $this->getServiceManager()->get('MelisCoreTableLog')->getTableGateway()->getAdapter();
			$sql     = 'SELECT COUNT(*) AS total FROM information_schema.COLUMNS'
				. ' WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'melis_core_log\''
				. ' AND COLUMN_NAME IN (\'log_ip\', \'log_login_attempted\', \'log_context\')';

			$row = $adapter->query($sql, $adapter::QUERY_MODE_EXECUTE)->current();
			self::$hasSecurityColumns = !empty($row) && (int) $row['total'] === 3;
		} catch (\Exception $e) {
			// Unable to tell: stay on the safe side and write the row without the new columns.
		}

		return self::$hasSecurityColumns;
	}

	/**
	 * Hands the saved event to the security audit service, which mirrors it outside the
	 * database and lets the detection rules run.
	 *
	 * Wrapped so that neither externalisation nor alerting can break the action being logged.
	 */
	private function notifySecurityAudit(array $arrayParameters, array $context, $userId, $results)
	{
		$audit = $this->getSecurityAudit();

		if (!$audit) {
			return;
		}

		try {
			$audit->onLogSaved([
				'logId'           => $results,
				'typeCode'        => $arrayParameters['typeCode'],
				'title'           => $arrayParameters['title'],
				'message'         => $arrayParameters['message'],
				'status'          => $arrayParameters['status'],
				'itemId'          => $arrayParameters['itemId'],
				'userId'          => $userId,
				'ip'              => isset($context['ip']) ? $context['ip'] : null,
				'login_attempted' => isset($context['login_attempted']) ? $context['login_attempted'] : null,
				'data'            => isset($context['data']) ? $context['data'] : [],
			]);
		} catch (\Exception $e) {
			// Logging is an observer: it never changes the outcome of what it observes.
		}
	}

	/**
	 * @return \MelisCore\Service\MelisCoreSecurityAuditService|null
	 */
	private function getSecurityAudit()
	{
		try {
			return $this->getServiceManager()->get('MelisCoreSecurityAudit');
		} catch (\Exception $e) {
			return null;
		}
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

		if (!empty($arrayParameters['logTypeCode'])) {
			$data = array(
				'logt_code' => $logTypeCode
			);

			try {
				$results = $melisCoreTableLogType->save($data, $arrayParameters['logTypeId']);
			} catch (\Exception $e) {
			}
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
		} catch (\Exception $e) {
		}

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
		} catch (\Exception $e) {
		}

		// Adding results to parameters for events treatment if needed
		$arrayParameters['results'] = $results;
		// Sending service end event
		$arrayParameters = $this->sendEvent('meliscore_save_log_type_trans_end', $arrayParameters);

		return $arrayParameters['results'];
	}
}
