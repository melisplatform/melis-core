<?php
namespace MelisCore\Model\Tables;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use Laminas\Db\Sql\Where;

class MelisGdprDeleteEmailsTable extends MelisGenericTable
{
    /**
     * saved warning email type
     */
    const EMAIL_WARNING = "1";
    /**
     * saved deleted email type
     */
    const EMAIL_DELETED = "2";

    /**
     * Model table
     */
    const TABLE = 'melis_core_gdpr_delete_emails';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'mgdpre_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }

	public function getAlertEmailsTransData($configId, $type = null, $langId = null)
    {
        // table selection query
        $select = $this->getTableGateway()->getSql()->select();
        // columns to select
        $select->columns(array('*'));
        if ($configId) {
            $select->where->equalTo('mgdpre_config_id', $configId);
        }
        // module filter
        if ($type) {
            $select->where->equalTo('mgdpre_type', $type);
        }
        if ($langId) {
            $select->where->equalTo('mgdpre_lang_id', $langId);
        }

        return $this->getTableGateway()->selectWith($select);
    }


}
