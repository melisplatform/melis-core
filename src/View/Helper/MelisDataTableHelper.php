<?php

namespace MelisCore\View\Helper;

use Zend\View\Helper\AbstractHelper;

class MelisDataTableHelper extends AbstractHelper
{

    private $serviceManager;

    public function __construct($sm)
    {
        $this->serviceManager = $sm;
    }

    public function createTable($tableConfig)
    {
        $translator = $this->serviceManager->get('translator');
        /**
         * Prepare the table settings
         */
        $table = "<table";
        $thead = "<thead><tr>";
        $tbody = "<tbody></tbody>";
        foreach ($tableConfig['attributes'] as $configAttrib => $configValues) {
            $table .= ' ' . $configAttrib . ' = "' . $configValues . '"';
        }
        $table .= ">";

        /**
         * Construct the columns
         */
        $columnName = '';
        foreach ($tableConfig['columns'] as $colName => $colAttr) {
            $columnName .= '<th>' . $colAttr['text'] . '</th>';
        }
        //add the action column
        $columnName .= '<th>'.$translator->translate('tr_meliscore_global_action').'</th>';
        //add column to header
        $thead .= $columnName;
        $thead .= "</tr></thead>";

        /**
         * Construct the table
         */
        $table .= $thead;
        $table .= $tbody;
        $table .= "</table>";

        //call the js that will initialize the datatable
        $jsInit =
            '<script type="text/javascript">'.
                '$(document).ready(function() {'.
                    'melisHelper.melisInitDataTable('.json_encode($tableConfig).');'.
                '});'.
            '</script>';

        return $table.'<br/>'.$jsInit;
    }
}