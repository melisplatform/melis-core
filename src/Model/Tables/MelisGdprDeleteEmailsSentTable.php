<?php
namespace MelisCore\Model\Tables;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

class MelisGdprDeleteEmailsSentTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_gdpr_delete_emails_sent';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'mgdprs_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

	public function getEmailSentByValidationKey($validationKey,$moduleName)
    {
        // table selection query
        $select = $this->getTableGateway()->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        // email
        $select->where->equalTo('mgdprs_validation_key', $validationKey);
        $select->where->equalTo('mgdprs_module_name', $moduleName);

        return $this->getTableGateway()->selectWith($select);
    }

    /**
     * @param $accountId
     * @param $module
     * @return int
     */
    public function deleteSentLog($accountId, $module)
    {
        return $this->getTableGateway()->delete([
            'mgdprs_module_name' => $module,
            'mgdprs_account_id' => $accountId,
        ]);
    }

    public function deleteEmailSentData($accountId, $module, $siteId)
    {
        return $this->getTableGateway()->delete([
            'mgdprs_module_name' => $module,
            'mgdprs_account_id' => $accountId,
            'mgdprs_site_id' => $siteId

        ]);
    }
}
