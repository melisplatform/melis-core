<?php
namespace MelisCore\Model\Tables;

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2020 Melis Technology (http://www.melistechnology.com)
 *
 */

use Laminas\Db\TableGateway\TableGateway;

class MelisGdprDeleteEmailsSmtpTable extends MelisGenericTable
{
	/**
     * Model table
     */
    const TABLE = 'melis_core_gdpr_delete_emails_smtp';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'mgdpr_smtp_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
	}
}
