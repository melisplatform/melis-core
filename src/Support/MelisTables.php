<?php

namespace MelisCore\Support;

/**
 * This is a list of known Melis Platform tables
 *
 * Class MelisMarketPlaceTables
 * @package MelisMarketPlace\Support
 */
class MelisTables
{
    /**
     * @const RELATIONAL_DATA holds the string value of 'relational_data"
     */
    const RELATIONAL_DATA = 'relational_data';

    /**
     * @const RELATION holds the string value of "relation"
     */
    const RELATION = 'relation';

    /**
     * @const QUERY holds the string value of "query"
     */
    const QUERY = 'query';

    /**
     * @const SQL holds the string value of "sql"
     */
    const SQL = 'sql';

    /**
     * @const FOREIGN_KEY holds the string value of "%foreign_key%" which will be used to swap to a real foreign key value
     */
    const FOREIGN_KEY = '%foreign_key%';

    /**
     * @const FOREIGN_KEY holds the string value of "%root_foreign_key%" which will be used to swap to the data map root parent foreign key
     */
    const ROOT_FOREIGN_KEY = '%root_foreign_key%';

    /**
     * @const AUTO_INCREMENT holds the string value of "%auto_increment%" which will be used to swap to a real value
     */
    const AUTO_INCREMENT = '%auto_increment';

    /**
     * @const PRIMARY_KEY holds the string value of "primary_key", primarily used to specify the value of the primary key
     */
    const PRIMARY_KEY = 'primary_key';
}
