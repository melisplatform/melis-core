<?php

namespace MelisCore\View\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * This class helps you create and render to a configurable HTML Table
 *
 */
class MelisGenericTable extends AbstractHelper
{
    protected $_table;
    protected $_columns;
    protected $_tableData;

    
    /**
     * Initializes the table element <br/>
     * Usage: <br/>
     * setTable(array(
     *      'id' => 'tableId',
     *      'class' => 'table tableResponsive tableStripped'
     * )); <br/>
     * If no paramater is provided, then it will provide its default parameters
     * 
     * @param array $tableConfig
     */
    public function setTable($tableConfig = array('id' => 'tableId', 'class' => 'table'))
    {
        $id = $class = '';
        $this->_table = '<table ';
       foreach($tableConfig as $configAttrib => $configValues)
       {
           $this->_table .= ' ' . $configAttrib . ' = "' . $configValues . '"';
       }
       
       
       // to avoid appended contents
       $this->_columns = '';
       $this->_tableData = '';
       
       $this->_table .= '>';
    }
    
    /**
     * Creates a configuration table column.
     * @param Array $columnText
     * @param Array $css
     * @param String $class
     */
    public function setColumns($columnText, $css = null, $class = null)
    {
        
        $ctr = 0;
        $text = '';
        $colCss = array();
        $dataClass = '';
        $thClass = '';

        foreach($columnText as $values)
        {
            $text .= '<th '.$dataClass.' class="'.$class.'">' . $values . '</th>';
            $ctr++;
        }

        
        $this->_columns .=  $text;
    }
    
    /**
     * Sets the text of a table data
     * @param String $text
     */
    public function setData($text)
    {
        $this->_tableData .= '<td >' . $text . '</td>';
    }
    
    /**
     * Inserts Table Row tag in a table
     */
    public function insertDataRow()
    {
        $this->_tableData .= '<tr>';
    }
    
    /**
     * Closes the Table Row tag in a table
     */
    public function closeDataRow()
    {
        $this->_tableData .= '</tr>';
    }
    
    /**
     * Returns the Table Tag
     * @return string
     */
    public function getTable()
    {
        return $this->_table;
    }
    
    /**
     * Returns the Table Head Tag
     * @return String
     */
    public function getColumns()
    {
        return '<thead><tr>' . $this->_columns . '</tr></thead>';
    }
    
    /**
     * Return the Table Body and its contents
     * @return String
     */
    public function getData() 
    {
        return '<tbody>' . $this->_tableData . '</tbody>';
    }
    
    /**
     * Renders an HTML Table
     * @return string
     */
    public function renderTable()
    {
        $genericTable = $this->getTable() . $this->getColumns() . $this->getData();
        
        return $genericTable . '</table>';
    }

    

}