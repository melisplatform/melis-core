<?php
namespace MelisCore\Model\Tables;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use Zend\Db\TableGateway\TableGateway;

class MelisGdprDeleteEmailsSentTable extends MelisGenericTable
{
    /**
     * MelisGdprDeleteConfigTable constructor.
     * @param TableGateway $tableGateway
     */
	public function __construct(TableGateway $tableGateway)
	{
		parent::__construct($tableGateway);
		$this->idField = 'mgdprs_id';
	}

	public function getEmailSentAlertDataByEmailAndDate($email , $dateTime)
    {
        // table selection query
        $select = $this->tableGateway->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        // email
        $select->where->equalTo('mgdprs_email', $email);
        // datetime
        $select->where->equalTo('mgdprs_alert_email_sent_date', $dateTime);

        return $this->tableGateway->selectWith($select);
    }
}
