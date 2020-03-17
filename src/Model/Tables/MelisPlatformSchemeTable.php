<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model\Tables;

use Laminas\Db\TableGateway\TableGateway;

class MelisPlatformSchemeTable extends MelisGenericTable
{
    public function __construct(TableGateway $tableGateway)
    {
        parent::__construct($tableGateway);
        $this->idField = 'pscheme_id';
    }

    /**
     * Query scheme table by ID
     * @param $id
     * @param bool $colorsOnly
     * @return null|\Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getSchemeById($id, $colorsOnly = false)
    {
        $id     = (int) $id;
        $select = $this->tableGateway->getSql()->select();

        if($colorsOnly) {
            $select->columns(array(
                'pscheme_id', 'pscheme_name', 'pscheme_colors', 'pscheme_is_active'
            ));
        }


        $select->where->equalTo('pscheme_id', $id);

        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }

    /**
     * Query scheme table by name
     * @param $name
     * @param bool $colorsOnly
     * @return null|\Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getSchemeByName($name, $colorsOnly = false)
    {
        $select = $this->tableGateway->getSql()->select();

        if($colorsOnly) {
            $select->columns(array(
                'pscheme_id', 'pscheme_name', 'pscheme_colors', 'pscheme_is_active'
            ));
        }

        $select->where->equalTo('pscheme_name', $name);

        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }

    /**
     * Returns the currently active scheme
     * @param bool $colorsOnly
     * @return null|\Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getActiveScheme($colorsOnly = false)
    {
        $select = $this->tableGateway->getSql()->select();

        if($colorsOnly) {
            $select->columns(array(
                'pscheme_id', 'pscheme_name', 'pscheme_colors', 'pscheme_is_active'
            ));
        }

        $select->where->equalTo('pscheme_is_active', 1);

        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }

    /**
     * Returns the Melis default scheme
     * @param bool $colorsOnly
     * @return null|\Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getDefaultScheme($colorsOnly = false)
    {
        $select = $this->tableGateway->getSql()->select();

        if($colorsOnly) {
            $select->columns(array(
                'pscheme_id', 'pscheme_name', 'pscheme_colors', 'pscheme_is_active'
            ));
        }

        $select->where->equalTo('pscheme_name', 'MELIS_DEFAULT');

        $resultSet = $this->tableGateway->selectWith($select);

        return $resultSet;
    }



}