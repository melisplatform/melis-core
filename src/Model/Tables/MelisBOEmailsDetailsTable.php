<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;
use MelisCore\Model\Tables\Factory\TableGatewayInterface;

class MelisBOEmailsDetailsTable extends MelisGenericTable implements TableGatewayInterface
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
        
        $select->where('boed_email_id ='.$emailId);
        if($langId != null){
            $select->where('boed_lang_id ='.$langId);
        }
        
        $resultSet = $this->tableGateway->selectWith($select);
        return $resultSet;
    }
}