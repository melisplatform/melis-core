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

	public function getEmailSentByValidationKey($validationKey)
    {
        // table selection query
        $select = $this->tableGateway->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        // email
        $select->where->equalTo('mgdprs_validation_key', $validationKey);

        return $this->tableGateway->selectWith($select);
    }
}
