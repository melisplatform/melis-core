<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Zend\Db\TableGateway\TableGateway;

class MelisBOEmailsDetailsTable extends MelisGenericTable
{
    public function __construct(TableGateway $tableGateway)
    {
        parent::__construct($tableGateway);
        $this->idField = 'boed_id';
    }
    
    /*
     * Fetching Email details By LangID
     * */
    public function getEmailDetailsByEmailId($emailId, $langId = null){
        $select = $this->tableGateway->getSql()->select();
        
        $select->where('boed_email_id ='.$emailId);
        if($langId != null){
            $select->where('boed_lang_id ='.$langId);
        }
        
        $resultSet = $this->tableGateway->selectWith($select);
        return $resultSet;
    }
}