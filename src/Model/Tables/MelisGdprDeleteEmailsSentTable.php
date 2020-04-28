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

	public function getEmailSentByValidationKey($validationKey,$moduleName)
    {
        // table selection query
        $select = $this->tableGateway->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        // email
        $select->where->equalTo('mgdprs_validation_key', $validationKey);
        $select->where->equalTo('mgdprs_module_name', $moduleName);

        return $this->tableGateway->selectWith($select);
    }

    /**
     * @param $accountId
     * @param $module
     * @return int
     */
    public function deleteSentLog($accountId, $module)
    {
        return $this->tableGateway->delete([
            'mgdprs_module_name' => $module,
            'mgdprs_account_id' => $accountId,
        ]);
    }
}
