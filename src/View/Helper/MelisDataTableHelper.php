<?php

namespace MelisCore\View\Helper;

use Laminas\ServiceManager\ServiceManager;
use Laminas\View\Helper\AbstractHelper;

class MelisDataTableHelper extends AbstractHelper
{
    private $serviceManager;

    public function setServiceManager(ServiceManager $serviceManager)
    {
        $this->serviceManager = $serviceManager;
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
        if(!empty($tableConfig['actionButtons'])){
            $columnName .= '<th>'.$translator->translate('tr_meliscore_global_action').'</th>';
        }
        
        //add column to header
        $thead .= $columnName;
        $thead .= "</tr></thead>";

        // get filters view content      
        $tableConfig['filters'] = $this->getFiltersContent($tableConfig['filters']);       


        // get action button content  
        if(!empty($tableConfig['actionButtons'])){
            $tableConfig['actionButtons'] = $this->getActionButtonsContent($tableConfig['actionButtons']);
        }

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

    /**
     * get filters view content using dispatch handler
     */
    public function getFiltersContent($config)
    {
        // left
        $config['left'] = $this->getContent($config['left'] ?? []) ?? "";    
        //center
        $config['center'] = $this->getContent($config['center'] ?? []) ?? "";
        // right
        $config['right'] = $this->getContent($config['right'] ?? []) ?? "";    

        return $config;
    }

    /**
     * get action buttons view content using dispatch handler
     */
    public function getActionButtonsContent($actionButtonConfig)
    {
        return $this->getContent($actionButtonConfig);
    }

    /**
     * get content
     */
    private function getContent($config)
    {
        if (!empty($config) && is_array($config)) {
            foreach ($config as $i => $handler) {
                // set content
                $config[$i] = $this->getViewContent($handler);
            }
        }

        return $config;
    }

    /**
     * get view content using dispatch handler
     */
    public function getViewContent($dispatchConfig)
    {
        return $this->getService('MelisCoreTool')->getViewContent($dispatchConfig); 
    }

    /**
     * get class from service manager
     */
    private function getService($service)
    {
        return $this->serviceManager->get($service);
    }
}
