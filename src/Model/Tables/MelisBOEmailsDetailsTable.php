<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

class MelisBOEmailsDetailsTable extends MelisGenericTable
{
    /**
     * Model table
     */
    const TABLE = 'melis_core_bo_emails_details';

    /**
     * Table primary key
     */
    const PRIMARY_KEY = 'boed_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
    
    /*
     * Fetching Email details By LangID
     * */
    public function getEmailDetailsByEmailId($emailId, $langId = null){
        $select = $this->tableGateway->getSql()->select();
        
        $select->where->equalTo('boed_email_id', (int) $emailId);
        if($langId != null){
            $select->where->equalTo('boed_lang_id', (int) $langId);
        }
        
        $resultSet = $this->tableGateway->selectWith($select);
        return $resultSet;
    }
}