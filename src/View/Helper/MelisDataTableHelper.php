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

        if(!empty($tableConfig['actionButtons'])){
            $columnName .= '<th>'.$translator->translate('tr_meliscore_global_action').'</th>';
        }
        
        $thead .= $columnName;
        $thead .= "</tr></thead>";

        $tableConfig['filters'] = $this->getFiltersContent($tableConfig['filters']);       

        if(!empty($tableConfig['actionButtons'])){
            $tableConfig['actionButtons'] = $this->getActionButtonsContent($tableConfig['actionButtons']);
        }

        /**
         * Construct the table
         */
        $table .= $thead;
        $table .= $tbody;
        $table .= "</table>";

        $jsInit =
            '<script type="text/javascript">'.
                '$(function() {'.
                    'melisHelper.melisInitDataTable('.json_encode($tableConfig).');'.
                '});'.
            '</script>';

        return $table.'<br/>'.$jsInit;
    }

    public function getFiltersContent($config)
    {
        $config['left'] = $this->getContent($config['left'] ?? []) ?? "";    
        $config['center'] = $this->getContent($config['center'] ?? []) ?? "";
        $config['right'] = $this->getContent($config['right'] ?? []) ?? "";    

        return $config;
    }

    public function getActionButtonsContent($actionButtonConfig)
    {
        return $this->getContent($actionButtonConfig);
    }

    private function getContent($config)
    {
        if (!empty($config) && is_array($config)) {
            foreach ($config as $i => $handler) {

                if (isset($handler['module']) && isset($handler['controller']) && isset($handler['action'])) {
                    $config[$i] = $this->getViewContent($handler);
                }                
            }
        }

        return $config;
    }

    public function getViewContent($dispatchConfig)
    {
        return $this->getService('MelisCoreTool')->getViewContent($dispatchConfig); 
    }

    private function getService($service)
    {
        return $this->serviceManager->get($service);
    }
}
