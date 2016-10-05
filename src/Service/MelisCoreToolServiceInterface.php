<?php

namespace MelisCore\Service;

interface MelisCoreToolServiceInterface 
{
    public function setMelisToolKey($module, $melisToolKey);
    
    public function getMelisToolKey();
    
    public function getTitle();
    
    public function getToolId();
    
    public function getColumns();
    
    public function getColumnValues();
    
    public function getForm($formKey);
    
    public function getForms();
    
    public function getFormKeys();
    
    public function getModalValues($formKey);
    
    public function getAllModals();
    
    public function getModal($modalKey);
    
    public function getModalContent($formKey);
    
    public function getSearchableColumns();
    
    public function formatToQueryDate($date, $delimiter);
    
    public function limitedText($text);
    
    public function getDataTableConfiguration($targetTable);
    
    public function getViewContent($dispatchHandler);
    
    public function exportDataToCsv($data);
    
    public function replaceAccents($str);
    
    
}