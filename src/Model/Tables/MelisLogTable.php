<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

class MelisLogTable extends MelisGenericTable
{
	/**
	 * Model table
	 */
	const TABLE = 'melis_core_log';

	/**
	 * Table primary key
	 */
	const PRIMARY_KEY = 'log_id';

	public function __construct()
	{
		$this->idField = self::PRIMARY_KEY;
	}

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
		$select = $this->tableGateway->getSql()->select();

		$select->join(
			'melis_core_log_type',
			'melis_core_log_type.logt_id = melis_core_log.log_type_id',
			array(),
			$select::JOIN_LEFT
		);

		// Only join translation table when searching to avoid row fan-out requiring DISTINCT
		if (!is_null($search)) {
			$select->quantifier('DISTINCT');
			$select->join(
				'melis_core_log_type_trans',
				'melis_core_log_type_trans.logtt_type_id = melis_core_log_type.logt_id',
				array(),
				$select::JOIN_LEFT
			);
		}

		if (!is_null($typeId) && is_numeric($typeId) && $typeId != -1) {
			$select->where('melis_core_log_type.logt_id = ' . (int) $typeId);
		}

		if (!is_null($itemId)) {
			$select->where('melis_core_log.log_item_id = ' . (int) $itemId);
		}

		if (!is_null($status)) {
			$select->where('melis_core_log.log_status = ' . (int) $status);
		}

		if (!is_null($userId) && is_numeric($userId) && $userId != -1) {
			$select->where('melis_core_log.log_user_id = ' . (int) $userId);
		}

		// Direct datetime comparisons so MySQL can use the index on log_date_added
		if (!is_null($dateCreationMin)) {
			$select->where(new \Laminas\Db\Sql\Predicate\Expression(
				'melis_core_log.log_date_added >= ?',
				$dateCreationMin . ' 00:00:00'
			));
		}

		if (!is_null($dateCreationMax)) {
			$select->where(new \Laminas\Db\Sql\Predicate\Expression(
				'melis_core_log.log_date_added <= ?',
				$dateCreationMax . ' 23:59:59'
			));
		}

		if (!is_null($search)) {
			$likeSearch = '%' . $search . '%';
			$select->where->NEST->like('log_id', $likeSearch)
				->or->like('melis_core_log_type.logt_code', $likeSearch)
				->or->like('melis_core_log_type_trans.logtt_name', $likeSearch)
				->or->like('melis_core_log_type_trans.logtt_description', $likeSearch);
		}

		if (!is_null($start) && is_numeric($start)) {
			$select->offset((int) $start);
		}

		if (!is_null($limit) && is_numeric($limit) && $limit != -1) {
			$select->limit((int) $limit);
		}

		$select->order(array('log_id' => $order));

		return $this->tableGateway->selectWith($select);
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
		$select = $this->tableGateway->getSql()->select();
		$select->columns(['total' => new \Laminas\Db\Sql\Expression('COUNT(DISTINCT melis_core_log.log_id)')]);

		$select->join(
			'melis_core_log_type',
			'melis_core_log_type.logt_id = melis_core_log.log_type_id',
			array(),
			$select::JOIN_LEFT
		);

		if (!is_null($search)) {
			$select->join(
				'melis_core_log_type_trans',
				'melis_core_log_type_trans.logtt_type_id = melis_core_log_type.logt_id',
				array(),
				$select::JOIN_LEFT
			);
		}

		if (!is_null($typeId) && is_numeric($typeId) && $typeId != -1) {
			$select->where('melis_core_log_type.logt_id = ' . (int) $typeId);
		}

		if (!is_null($itemId)) {
			$select->where('melis_core_log.log_item_id = ' . (int) $itemId);
		}

		if (!is_null($status)) {
			$select->where('melis_core_log.log_status = ' . (int) $status);
		}

		if (!is_null($userId) && is_numeric($userId) && $userId != -1) {
			$select->where('melis_core_log.log_user_id = ' . (int) $userId);
		}

		if (!is_null($dateCreationMin)) {
			$select->where(new \Laminas\Db\Sql\Predicate\Expression(
				'melis_core_log.log_date_added >= ?',
				$dateCreationMin . ' 00:00:00'
			));
		}

		if (!is_null($dateCreationMax)) {
			$select->where(new \Laminas\Db\Sql\Predicate\Expression(
				'melis_core_log.log_date_added <= ?',
				$dateCreationMax . ' 23:59:59'
			));
		}

		if (!is_null($search)) {
			$likeSearch = '%' . $search . '%';
			$select->where->NEST->like('log_id', $likeSearch)
				->or->like('melis_core_log_type.logt_code', $likeSearch)
				->or->like('melis_core_log_type_trans.logtt_name', $likeSearch)
				->or->like('melis_core_log_type_trans.logtt_description', $likeSearch);
		}

		$result = $this->tableGateway->selectWith($select)->current();

		return $result ? (int) $result->total : 0;
	}

	public function getFailedLoginAttempts($logTypeId, $userId, $date)
	{
		$select = $this->getTableGateway()->getSql()->select();

		if (!empty($logTypeId) && !empty($userId) && !empty($date)) {
			$select->columns(['count' => new \Laminas\Db\Sql\Expression('COUNT(*)')])
				->where->equalTo('log_type_id', (int) $logTypeId)
				->equalTo('log_user_id', (int) $userId)
				// Strictly AFTER the reference date (last successful login / password change /
				// unlock): with ">=" the failures logged in the same second as a successful login
				// were counted again and locked the account on the next 1-2 mistakes (audit item 16.0).
				->greaterThan('log_date_added', (string) $date);
		}

		$resultSet = $this->getTableGateway()->selectWith($select);

		if (!is_null($resultSet)) {
			return $resultSet->toArray()[0]['count'];
		}
	}

	public function getDateAccountWasLocked($logTypeId, $userId)
	{
		$select = $this->getTableGateway()->getSql()->select();

		if (!empty($logTypeId) && !empty($userId)) {
			$select->columns(['log_date_added'])
				->where->equalTo('log_type_id', (int) $logTypeId)
				->equalTo('log_user_id', (int) $userId);
				$select->order('log_id DESC')
				->limit(1);
		}

		$resultSet = $this->getTableGateway()->selectWith($select);

		if (!empty($resultSet->toArray())) {
			return $resultSet->toArray()[0]['log_date_added'];
		}

		return null;
	}

	public function getDateAccountWasUnlocked($logTypeId, $userId)
	{
		$select = $this->getTableGateway()->getSql()->select();

		if (!empty($logTypeId) && !empty($userId)) {
			$select->columns(['log_date_added'])
				->where->equalTo('log_type_id', (int) $logTypeId)
				->equalTo('log_user_id', (int) $userId);
				$select->order('log_id DESC')
				->limit(1);
		}

		$resultSet = $this->getTableGateway()->selectWith($select);

		if (!empty($resultSet->toArray())) {
			return $resultSet->toArray()[0]['log_date_added'];
		}

		return null;
	}

	/**
	 * Counts log rows since a date, for the security detection rules.
	 *
	 * Values are bound through the where() predicates (not concatenated into the SQL string),
	 * because unlike the other counts here one of them is an IP coming from the request.
	 *
	 * @param int[]       $typeIds     log types to count
	 * @param string      $since       'Y-m-d H:i:s'
	 * @param string|null $ip          restrict to one client IP
	 * @param int|null    $userId      restrict to one user
	 * @param string|null $messageLike SQL LIKE pattern on log_message
	 * @return int
	 */
	public function countSince(array $typeIds, $since, $ip = null, $userId = null, $messageLike = null)
	{
		if (empty($typeIds) || empty($since)) {
			return 0;
		}

		$select = $this->getTableGateway()->getSql()->select();
		$select->columns(['total' => new \Laminas\Db\Sql\Expression('COUNT(*)')])
			->where->in('log_type_id', $typeIds)
			->greaterThanOrEqualTo('log_date_added', $since);

		if (!empty($ip)) {
			$select->where->equalTo('log_ip', $ip);
		}

		if (!empty($userId)) {
			$select->where->equalTo('log_user_id', $userId);
		}

		if (!empty($messageLike)) {
			$select->where->like('log_message', $messageLike);
		}

		$resultSet = $this->getTableGateway()->selectWith($select);
		$rows      = $resultSet->toArray();

		return empty($rows) ? 0 : (int) $rows[0]['total'];
	}

	/**
	 * Counts log rows older than a date (retention purge).
	 *
	 * @param string $before 'Y-m-d H:i:s'
	 * @return int
	 */
	public function countBefore($before)
	{
		if (empty($before)) {
			return 0;
		}

		$select = $this->getTableGateway()->getSql()->select();
		$select->columns(['total' => new \Laminas\Db\Sql\Expression('COUNT(*)')])
			->where->lessThan('log_date_added', $before);

		$rows = $this->getTableGateway()->selectWith($select)->toArray();

		return empty($rows) ? 0 : (int) $rows[0]['total'];
	}

	/**
	 * Deletes log rows older than a date (retention purge).
	 *
	 * @param string $before 'Y-m-d H:i:s'
	 * @return int number of deleted rows
	 */
	public function deleteBefore($before)
	{
		if (empty($before)) {
			return 0;
		}

		return (int) $this->getTableGateway()->delete(function ($delete) use ($before) {
			$delete->where->lessThan('log_date_added', $before);
		});
	}
}
