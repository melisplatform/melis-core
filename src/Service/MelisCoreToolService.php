<?php

namespace MelisCore\Service;
use Zend\View\Model\ViewModel;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use MelisCore\Service\MelisCoreToolServiceInterface;
use ReflectionClass;
use Zend\Session\Container;
use Zend\Http\Response;
use Zend\View\Model\JsonModel;
/**
 * This Service helps you create your tool
 */
class MelisCoreToolService implements MelisCoreToolServiceInterface, ServiceLocatorAwareInterface
{
    public $serviceLocator;
    
    protected $_melisToolKey; 
    protected $_melisConfig;
    protected $_appConfig;
    protected $_usedKey;

    const TEXT_LIMIT = 25;
    
    public function setServiceLocator(ServiceLocatorInterface $sl)
    {
        $this->serviceLocator = $sl;
        return $this;
    }
    
    public function getServiceLocator()
    {
        return $this->serviceLocator;
    }
    
    /**
     * Sets what configuration key in app.tools.php will be used on this tool service.
     * @param String $module
     * @param String $melisToolKey
     */
    public function setMelisToolKey($module, $melisToolKey) 
    {
        $this->_melisToolKey = $module.'/tools/'.$melisToolKey;
        
        $this->_melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $this->_appConfig = $this->_melisConfig->getItem($this->_melisToolKey);
        $this->_usedKey = $melisToolKey;
    }
    
    /**
     * Returns the melis tool key configuration text
     * @return string
     */
    public function getMelisToolKey()
    {
        return $this->_melisToolKey;
    }
    
    /**
     * Returns the Title of the tool
     */
    public function getTitle()
    {
        return $this->_appConfig['conf']['title'];
    }
    
    /**
     * Returns the Unique Identifier of the tool
     */
    public function getToolId()
    {
        return $this->_appConfig['conf']['id'];
    }
    
    /**
     * Returns the columns in the app.tools.php
     * @return Array;
     */
    public function getColumns()
    {
        return $this->_appConfig['table']['columns'];
    }
    
    /**
     * Returns the column config (e.g: text, css, sortable)
     * @return Array
     */
    public function getColumnValues()
    {
        return array_values($this->getColumns());
    }
    
    /**
     * Returns the form elements of the provided form key
     * @param String $formKey
     * @return \Zend\Form\ElementInterface
     */
    public function getForm($formKey)
    {

        $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $toolKey = $this->getMelisToolKey();
        $formConfig = $toolKey.'/forms/'.$formKey;
        
        $hasFormOrderCfg = $melisConfig->getOrderFormsConfig($formKey);
        if($hasFormOrderCfg) {
            $formConfig = $melisConfig->getFormMergedAndOrdered($formConfig, $formKey);
        }
        else {
            // use the original order of the form
            $formConfig = $this->_appConfig['forms'][$formKey];
        }
        
        $factory = new \Zend\Form\Factory();
        $formElements = $this->serviceLocator->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($formConfig);
        
        
        
        return $form;
    }
    
    /**
     * Returns all form elements of the Tool
     * @return \Zend\Form\ElementInterface[]
     */
    public function getForms()
    {
        $formKeys = $this->_appConfig['forms'];
        $factory = new \Zend\Form\Factory();
        $formElements = $this->serviceLocator->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $forms = array();
        foreach($formKeys as $keys => $formValues)
        {
            $forms[] = $factory->createForm($this->_appConfig['forms'][$keys]);
        }
        
        return $forms;
        
    }
    
    /**
     * Returns all Form Keys of the tool
     * @return Array
     */
    public function getFormKeys()
    {
        $formKeys = $this->_appConfig['forms'];
        $forms = array();
        foreach($formKeys as $keys => $values)
        {
            $forms[] = $keys;
        }
        
        return $forms;
    }
    
    /**
     * Returns the modal content array of the form
     * @param String $formKey
     * @return Array
     */
    public function getModalValues($formKey)
    {
        return $this->_appConfig['modals'][$formKey];
    }
    
    /**
     * Returns all the modals of the tools
     * @return Array
     */
    public function getAllModals()
    {
        $forms = array();
        $formKeys = $this->_appConfig['modals'];
        
        foreach($formKeys as $keys => $values)
        {
            
            $forms[$keys] = $this->_appConfig['modals'][$keys];
            $forms[$keys]['content'] = $this->getModalContent($keys);
        }

        return $forms;
    }

    /**
     * Returns a single modal
     * @param unknown $modalKey
     */
    public function getModal($modalKey)
    {
        
        $forms = array();
        $formKeys = $this->_appConfig['modals'][$modalKey];

        $forms[$modalKey]['id'] = $this->_appConfig['modals'][$modalKey]['id'];
        $forms[$modalKey]['class'] = $this->_appConfig['modals'][$modalKey]['class'];
        $forms[$modalKey]['tab-header'] = $this->_appConfig['modals'][$modalKey]['tab-header'];
        $forms[$modalKey]['tab-text'] = $this->_appConfig['modals'][$modalKey]['tab-text'];
        $forms[$modalKey]['content'] = $this->getModalContent($modalKey);

        return $forms;
    }
    
    /**
     * Returns the contents of the modal from the provided form key
     * @param String $formKey
     * @return String
     */
    public function getModalContent($formKey)
    {
        $forward = $this->getServiceLocator()->get('ControllerPluginManager')->get('forward');
        $content = $this->_appConfig['modals'][$formKey]['content'];
        
        $contentValue = $this->getViewContent($content);
        
        return $contentValue;

    }
    
    /**
     * Returns an array of searchable columns that will be used whenever search function is used in the Data Table
     * return array
     */
    public function getSearchableColumns() 
    {   
        $seachableCols = array();
        
        if($this->_appConfig['table']['searchables'])
            $seachableCols = $this->_appConfig['table']['searchables'];
        
        return $seachableCols;
    }
    
    /**
     * Returns the format of the date depending on what locale
     * @todo THIS IS TEMPORARY, NEED TO CREATE A FUNCTION FOR GLOBAL USE
     */
	public function formatToQueryDate($date, $delimiter)
	{

	    $sDate = '';
	    if(!empty($date)){
	        if($date != '0') {
	            $sDate = str_replace($delimiter, '-', $date);
	            // breakdown dates
	            $aDate = explode('-', $sDate);
	             
	            $container = new Container('meliscore');
	            $locale = $container['melis-lang-locale'];
	        
	            $iYear  = $aDate[2];
	            $iMonth = 0;
	            $iDay   = 0;
	        
	            switch($locale) {
	                case 'fr_FR':
	                    $iMonth = $aDate[1];
	                    $iDay   = $aDate[0];
	                    break;
	                case 'en_EN':
	                    $iMonth = $aDate[0];
	                    $iDay   = $aDate[1];
	                    break;
	            }
	             
	            $sDate = $iYear . '-' . $iMonth . '-' . $iDay;
	        }
	    }
        
        return $sDate;
	}
	
	/**
	 * Returns a limited text
	 * @param String $text
	 * @return String
	 */
	public function limitedText($text,$limit = self::TEXT_LIMIT) 
	{
       $postString = '...';
       $strCount = strlen($text);
       $sLimitedText = $text;
       
       if($strCount > $limit)
       {
           $sLimitedText = mb_substr($text, 0, $limit) . $postString;
       }
       
       return $sLimitedText;
       
	}
	
	/**
	 * This functions reads the configuration inside the app.tool array config
	 */
	public function getDataTableConfiguration($targetTable = null, $allowReInit = false, $selectCheckbox = false, $tableOption = array())
	{
	    $translator = $this->getServiceLocator()->get('translator');
	    $table = $this->_appConfig['table'];
	    $dtJScript = '';
	    
	    if($table) {
           $tableId = is_null($targetTable) ? $table['target'] : $targetTable;
           $ajaxUrl = $table['ajaxUrl'];
           $dataFunction = !empty($table['dataFunction']) ? 'data: '.$table['dataFunction'] : '';
           $ajaxCallBack = !empty($table['ajaxCallback']) ? $table['ajaxCallback'].';' : '';
           $initComplete = !empty($table['initComplete']) ? $table['initComplete'].';' : '';
           $filters = $table['filters'];
           $columns = $table['columns'];
           $actionContainer = $table['actionButtons'];
            
            $jsSdomContentInit = '';
            $tableTop = '<"filter-bar"<"row"';
            
            $left = $filters['left'];
            $center = $filters['center'];
            $right = $filters['right'];
            $leftDom = '<"fb-dt-left col-xs-12 col-md-4"';
            $centerDom = '<"fb-dt-center col-xs-12 col-md-4"';
            $rightDom = '<"fb-dt-right col-xs-12 col-md-4"';
            
            // datatables predefined filter plugins
            $preDefDTFilter = array('l', 'f');
            
            $searchInputClass = '';

            // render the buttons in the left section of the filter bar
            foreach($left as $leftKey => $leftValue) {
                $htmlContent = $this->getViewContent($leftValue);
                if(!in_array($htmlContent, $preDefDTFilter)) {
                    $leftDom .= '<"'.$leftKey.'">';
                    $jsSdomContentInit .= '$(".'.$leftKey.'").html(\'' . $htmlContent . '\');';
                }
                else {
                    $leftDom .= '<"'.$leftKey.'"'. $htmlContent. '>';
                    if ($htmlContent == 'f'){
                        $searchInputClass = $leftKey;
                    }
                }
            }
            
            // render the buttons in the center section of the filter bar
            foreach($center as $centerKey => $centerValue) {
                $htmlContent = $this->getViewContent($centerValue);
                if(!in_array($htmlContent, $preDefDTFilter)) {
                    $centerDom .= '<"'.$centerKey.'">';
                    $jsSdomContentInit .= '$(".'.$centerKey.'").html(\'' . $htmlContent . '\');';
                }
                else {
                    $centerDom .= '<"'.$centerKey.'"'. $htmlContent. '>';
                    if ($htmlContent == 'f'){
                        $searchInputClass = $centerKey;
                    }
                }
            
            }
            
            // render the buttons in the right sectuib if the filter bar
            foreach($right as $rightKey => $rightValue) {
                $htmlContent = $this->getViewContent($rightValue);
                if(!in_array($htmlContent, $preDefDTFilter)) {
                    $rightDom .= '<"'.$rightKey.'">';
                    $jsSdomContentInit .= '$(".'.$rightKey.'").html(\'' . $htmlContent . '\');';
                }
                else {
                    $rightDom .= '<"'.$rightKey.'"'. $htmlContent. '>';
                    if ($htmlContent == 'f'){
                        $searchInputClass = $rightKey;
                    }
                }
            
            }
            
            $tableSearchPlugin = '';
            if (!empty($searchInputClass)){
                $tableSearchPlugin = '$(\'.'.$searchInputClass.' input[type="search"]\').unbind();
                    	               $(\'.'.$searchInputClass.' input[type="search"]\').typeWatch({
                            				captureLength: 2,
                            				callback: function(value) {
                        	                '.str_replace("#","$",$tableId).'.search(value).draw();   
                            				}
                            			});';
            }
            
            
            $tableTop .= $leftDom.'>'.$centerDom.'>'.$rightDom.'>>>';
            $tableBottom = '<"bottom" t<"pagination-cont clearfix"rip>>';
            
            // check if the filter array configuration is empty
            if(empty($left) && empty($center) && empty($right)) {
                $sDomStructure = '';
            }
            else {
                // if not filters found, filter-bar class content should not be displayed
                $sDomStructure = $tableTop.$tableBottom;
            }
            
            // Action Buttons
            $actionButtons = '';
            $action = '';
            $forward = $this->getServiceLocator()->get('ControllerPluginManager')->get('forward');
            $actionCount = 0;
            foreach($actionContainer as $actionKey => $actionContent) 
            {
                $actionButtons .= $this->getViewContent($actionContent);
            }

            // remove unnecessary new lines and text paragraphs (not <p> tags)
            $actionButtons = trim(preg_replace('/\s+/', ' ', $actionButtons));
           
            // retrieve the css configuration inside each columns
            $colCtr = 1; // starts with index 1 since this will be used in JS configuration for jquery nth-child
            $colKeyId = array_keys($columns);
           
            // Action Column
            $actionColumn = null;
            // convert columns in Javascript JSON
            $jsonColumns = '[';
            foreach($colKeyId as $colId) {
               $jsonColumns .= '{"data":"'.$colId.'"},';
            }
            
            if (!empty($actionButtons)){
                $jsonColumns .= '{"data":"actions"}';
                
                // Preparing the Table Action column Buttons
                $actionColumn = '{
                                    "targets": -1,
                                    "data": null,
                                    "mRender": function (data, type, full) {
                                        return \'<div>'.$actionButtons.'</div>\';
        						    },
        						    "bSortable" : false,
        						    "sClass" : \'dtActionCls\',
        					    }';
            }
            $jsonColumns .= ']';
           
            $fnName = 'fn'.$tableId.'init';
           
            $reInitTable = '';
            if($allowReInit) {
            $reInitTable = '     
                var dTable = $("'.$tableId.'").DataTable();
                if(dTable !== undefined) {
                       dTable.destroy();    
                }';
            }
            // select checkbox extension
            $select = '';
            $selectColDef = '';
            if($selectCheckbox){
//                $select = 'select: {
//                             style:    "os",
//                             selector: "td:first-child"
//                          },';
                $selectColDef = '{
                                "targets": 0,                                   
                                 "bSortable":false,                                 
                                 "mRender": function (data, type, full, meta){
                                     return `<div class="checkbox checkbox-single margin-none">
                									<label class="checkbox-custom">
                										<i class="fa fa-fw fa-square-o checked"></i>
                										<input type="checkbox" checked="checked" name="id[]" value="` + $("<div/>").text(data).html() + `">
                									</label>
                								</div>  
                                            `;
                                 }
                            },';
            }
           
           /**
            * DataTable default is every Column are sortable
            * This process will get not sortable column from tool config and prepare string for datatable configuration
            **/
            $unSortableColumns = array();
            $columnCtr = 0;
            foreach($columns as $colKey => $colArrValue)
            {
                if (isset($colArrValue['sortable'])){
                    // Getting unsortable columns
                    $isSortable = $colArrValue['sortable'] == false ? array_push($unSortableColumns, $columnCtr) : '';
                }
                $columnCtr++;
            }
            $unSortableColumnsStr = '';
            if (!empty($unSortableColumns)){
                // Creating config string for Unsortable Columns
                $unSortableColumnsStr = '{ targets: ['.implode(',', $unSortableColumns).'], bSortable: false},';
            }
            // Column Unsortable End
            
            // Preparing Table Column Styles
            $columnsStyles = array();
            $columnCtr = 0;
            foreach($columns as $colKey => $colArrValue)
            {
                if (isset($colArrValue['css'])){
                    // Getting Style of the columns
                    $columnStyles = $colArrValue['css'];
                }
                // Adding the Ctr/index/number of the column
                $columnStyles['targets'] = $columnCtr;
                
                array_push($columnsStyles, $columnStyles);
                $columnCtr++;
            }
            $columnsStylesStr = '';
            if (!empty($columnsStyles)){
                // Creating Column config string
                foreach ($columnsStyles As $sVal){
                    $columnStyle = array();
                    foreach ($sVal As $cKey => $cVal){
                        if (in_array($cKey, array('width','targets','visible'))){
                            $cVal = (is_numeric($cVal)) ? $cVal : '"'.$cVal.'"';
                            array_push($columnStyle, '"'.$cKey.'": '.$cVal);
                        }
                    }
                    $columnsStylesStr .= '{ '.implode(', ', $columnStyle).' },'.PHP_EOL;
                }
            }
            // Columns Styles End
           
            // Default Melis Table Configuration
            // This can be override from Param
            $defaultTblOptions = array(
                'paging' => 'true',
                'ordering' => 'true',
                'serverSide' => 'true',
                'searching' => 'true',
            );
            // Merging Default Configuration and Param Configuration
            // This process will override default config if index exist on param config
            $finalTblOption = array_merge($defaultTblOptions, $tableOption);
           
            // Table Option
            $finalTblOptionStr = '';
            foreach ($finalTblOption As $key => $val){
                if (is_array($val)){
                    // If Option has multiple options
                    $val = json_encode($val);
                }
                $finalTblOptionStr .= $key.': '.$val.','.PHP_EOL;
            }
           
            //remove special characters in function name
            $fnName = preg_replace('/\W/', '', $fnName);
            // simulate javascript code function here
            $dtJScript = 'window.'.$fnName .' = function() {
                '.$reInitTable.'
                var '.str_replace("#","$",$tableId).' = $("'.$tableId.'").DataTable({
                    ' . $select . '
                    ' . $finalTblOptionStr . '
                    responsive:true,
                    processing: true,
                    lengthMenu: [ [5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "'.$translator->translate('tr_meliscore_all').'"] ],
                    pageLength: 10,
                    ajax: {
                        url: "' . $ajaxUrl . '",
                        type: "POST",
                        '.$dataFunction.'
                    },
                    initComplete : function(oSettings, json) {
                        '.$initComplete.'  
                    },
                    fnDrawCallback: function(oSettings) {
                        '.$ajaxCallBack.'
                    },
                    columns: '.$jsonColumns.',
				    language: {
						url: "/melis/MelisCore/Language/getDataTableTranslations",
				    },
                    sDom : \''.$sDomStructure.'\',
                    bSort: true,
                    searchDelay: 1500,
			        columnDefs: [
                        '.$columnsStylesStr.'  
                        '.$unSortableColumnsStr.'
					    '. $selectColDef .'
					    { responsivePriority: 1, targets: 0 },
					    { responsivePriority: 2, targets: -1 }, // make sure action column stays whenever the window is resized
					    '.$actionColumn.'
				    ],
                }).columns.adjust().responsive.recalc();
                return '.str_replace("#","$",$tableId).';
            };
            var '.str_replace("#","$",$tableId).' = '.$fnName.'();
	        $("'.$tableId.'").on("init.dt", function(e, settings) {
			    '.$jsSdomContentInit.'
		        '.$tableSearchPlugin.'   
	        });';
	    }
	    
	    return $dtJScript;
	}
	

	
	/**
	 * Retrieves the content of the view file
	 * @param Array $dispatchHandler
	 * @return String
	 */
	public function getViewContent($dispatchHandler)
	{
	    $forward = $this->getServiceLocator()->get('ControllerPluginManager')->get('forward');
	    $module = $dispatchHandler['module'];
	    $controller = $dispatchHandler['controller'];
	    $actionView = $dispatchHandler['action'];
	
	    $action = $this->convertToNormalFunction($actionView);
	
	    $viewModel = new ViewModel();
	    $viewModel = $forward->dispatch($module.'\\Controller\\'.$controller, array('action' => $action));
	
	    $renderer = $this->serviceLocator->get('Zend\View\Renderer\RendererInterface');
	    $html = new \Zend\Mime\Part($renderer->render($viewModel));
	
	    // since it will return an object with private properties, change the accessibility so we can get the content data we want.
	    $reflection = new ReflectionClass($html);
	    $property = $reflection->getProperty('content');
	    $property->setAccessible(true);
	
	    $content = $property->getValue($html);
	
	    // replace single quote with duoble quote
	    $content = str_replace('\'', '"', $content);
	    
	    return $content;
	}
	
	
	/**
	 * Exports the data inside the data table in CSV
	 * {@inheritDoc}
	 * @see \MelisCore\Service\MelisCoreToolServiceInterface::exportDataToCsv()
	 */
	public function exportDataToCsv($data)
	{
	    $melisCoreConfig = $this->getServiceLocator()->get('MelisCoreConfig');
	    
	    $csvConfig = $melisCoreConfig->getItem('meliscore/datas/default/export/csv');
	    $csvFileName = '';
	    $separator   = $csvConfig['separator'];
	    $enclosed    = $csvConfig['enclosed'];
	    $striptags   = (int) $csvConfig['striptags'] == 1 ? true : false;
	    $response    = '';
        // check what file name to use when exporting
	    if($this->_appConfig['export'] && $this->_appConfig['export']['csvFileName'])
	    {
	        $csvFileName = $this->_appConfig['export']['csvFileName'];
	    }
	    else 
	    {
	      $csvFileName = $csvConfig['defaultFileName'];
	       
	    }
	    

	    if($data) 
	    {
            $csvColumn = $data[0];


            $content = '';
            $ctr = 0;

            // for columns
            foreach($csvColumn as $key => $colText) {
                $content .= $key.$separator;
            }
            $content .= PHP_EOL;

            // for contents
            foreach($data as $dataKey => $dataValue) {

                foreach($dataValue as $key => $value) {

                    if($striptags) {
                        $value = html_entity_decode($value);
                        $value = strip_tags($value);
                    }
                    else {
                        if(is_int($value)) {
                            $value = (string) $value;
                        }
                    }
                    // convert UTF-8 to UTF-16LE encoding for excel encoding rendering
                    $value = mb_convert_encoding($value, 'UTF-16LE', 'UTF-8');
                    $content .= $enclosed . $this->replaceAccents($value) . $enclosed . $separator;
                    
                }
                $content .= PHP_EOL;
            }
            
            
            $response = new Response();
            $headers  = $response->getHeaders();
            $headers->addHeaderLine('Content-Type', 'text/csv; charset=utf-8');
            $headers->addHeaderLine('Content-Disposition', "attachment; filename=\"".$csvFileName."\"");
            $headers->addHeaderLine('Accept-Ranges', 'bytes');
            $headers->addHeaderLine('Content-Length', strlen($content));
            $response->setContent($content);
	    }
	    
	    return $response;
	    
	}
	
	/**
	 * Replaces characters with accents into normal character
     * @param String $str
     * @return String
	 */
	public function replaceAccents($str)
	{
	    $newValue = '';
	    $oldVal = $this->stringSplitUnicode($str);
	    $replaceTable = array(
            'ъ'=>'b', 'Ь'=>'b', 'Ъ'=>'b', 'ь'=>'b',
            'Ă'=>'A', 'Ą'=>'A', 'À'=>'A', 'Ã'=>'A', 'Á'=>'A', 'Æ'=>'A', 'Â'=>'A', 'Å'=>'A', 'Ä'=>'A',
            'Þ'=>'B',
            'Ć'=>'C', 'ץ'=>'C', 'Ç'=>'C',
            'È'=>'E', 'Ę'=>'E', 'É'=>'E', 'Ë'=>'E', 'Ê'=>'E',
            'Ğ'=>'G',
            'İ'=>'I', 'Ï'=>'I', 'Î'=>'I', 'Í'=>'I', 'Ì'=>'I',
            'Ł'=>'L',
            'Ñ'=>'N', 'Ń'=>'N',
            'Ø'=>'O', 'Ó'=>'O', 'Ò'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ö'=>'O',
            'Ş'=>'S', 'Ś'=>'S', 'Ș'=>'S', 'Š'=>'S',
            'Ț'=>'T',
            'Ù'=>'U', 'Û'=>'U', 'Ú'=>'U', 'Ü'=>'U',
            'Ý'=>'Y',
            'Ź'=>'Z', 'Ž'=>'Z', 'Ż'=>'Z',
            'â'=>'a', 'ǎ'=>'a', 'ą'=>'a', 'á'=>'a', 'ă'=>'a', 'ã'=>'a', 'Ǎ'=>'a', 'а'=>'a', 'А'=>'a', 'å'=>'a', 'à'=>'a', 'א'=>'a', 'Ǻ'=>'a', 'Ā'=>'a', 'ǻ'=>'a', 'ā'=>'a', 'ä'=>'a', 'æ'=>'a', 'Ǽ'=>'a', 'ǽ'=>'a',
            'б'=>'b', 'ב'=>'b', 'Б'=>'b', 'þ'=>'b',
            'ĉ'=>'c', 'Ĉ'=>'c', 'Ċ'=>'c', 'ć'=>'c', 'ç'=>'c', 'ц'=>'c', 'צ'=>'c', 'ċ'=>'c', 'Ц'=>'c', 'Č'=>'c', 'č'=>'c', 'Ч'=>'ch', 'ч'=>'ch',
            'ד'=>'d', 'ď'=>'d', 'Đ'=>'d', 'Ď'=>'d', 'đ'=>'d', 'д'=>'d', 'Д'=>'D', 'ð'=>'d',
            'є'=>'e', 'ע'=>'e', 'е'=>'e', 'Е'=>'e', 'Ə'=>'e', 'ę'=>'e', 'ĕ'=>'e', 'ē'=>'e', 'Ē'=>'e', 'Ė'=>'e', 'ė'=>'e', 'ě'=>'e', 'Ě'=>'e', 'Є'=>'e', 'Ĕ'=>'e', 'ê'=>'e', 'ə'=>'e', 'è'=>'e', 'ë'=>'e', 'é'=>'e',
            'ф'=>'f', 'ƒ'=>'f', 'Ф'=>'f',
            'ġ'=>'g', 'Ģ'=>'g', 'Ġ'=>'g', 'Ĝ'=>'g', 'Г'=>'g', 'г'=>'g', 'ĝ'=>'g', 'ğ'=>'g', 'ג'=>'g', 'Ґ'=>'g', 'ґ'=>'g', 'ģ'=>'g',
            'ח'=>'h', 'ħ'=>'h', 'Х'=>'h', 'Ħ'=>'h', 'Ĥ'=>'h', 'ĥ'=>'h', 'х'=>'h', 'ה'=>'h',
            'î'=>'i', 'ï'=>'i', 'í'=>'i', 'ì'=>'i', 'į'=>'i', 'ĭ'=>'i', 'ı'=>'i', 'Ĭ'=>'i', 'И'=>'i', 'ĩ'=>'i', 'ǐ'=>'i', 'Ĩ'=>'i', 'Ǐ'=>'i', 'и'=>'i', 'Į'=>'i', 'י'=>'i', 'Ї'=>'i', 'Ī'=>'i', 'І'=>'i', 'ї'=>'i', 'і'=>'i', 'ī'=>'i', 'ĳ'=>'ij', 'Ĳ'=>'ij',
            'й'=>'j', 'Й'=>'j', 'Ĵ'=>'j', 'ĵ'=>'j', 'я'=>'ja', 'Я'=>'ja', 'Э'=>'je', 'э'=>'je', 'ё'=>'jo', 'Ё'=>'jo', 'ю'=>'ju', 'Ю'=>'ju',
            'ĸ'=>'k', 'כ'=>'k', 'Ķ'=>'k', 'К'=>'k', 'к'=>'k', 'ķ'=>'k', 'ך'=>'k',
            'Ŀ'=>'l', 'ŀ'=>'l', 'Л'=>'l', 'ł'=>'l', 'ļ'=>'l', 'ĺ'=>'l', 'Ĺ'=>'l', 'Ļ'=>'l', 'л'=>'l', 'Ľ'=>'l', 'ľ'=>'l', 'ל'=>'l',
            'מ'=>'m', 'М'=>'m', 'ם'=>'m', 'м'=>'m',
            'ñ'=>'n', 'н'=>'n', 'Ņ'=>'n', 'ן'=>'n', 'ŋ'=>'n', 'נ'=>'n', 'Н'=>'n', 'ń'=>'n', 'Ŋ'=>'n', 'ņ'=>'n', 'ŉ'=>'n', 'Ň'=>'n', 'ň'=>'n',
            'о'=>'o', 'О'=>'o', 'ő'=>'o', 'õ'=>'o', 'ô'=>'o', 'Ő'=>'o', 'ŏ'=>'o', 'Ŏ'=>'o', 'Ō'=>'o', 'ō'=>'o', 'ø'=>'o', 'ǿ'=>'o', 'ǒ'=>'o', 'ò'=>'o', 'Ǿ'=>'o', 'Ǒ'=>'o', 'ơ'=>'o', 'ó'=>'o', 'Ơ'=>'o', 'œ'=>'o', 'Œ'=>'o', 'ö'=>'o',
            'פ'=>'p', 'ף'=>'p', 'п'=>'p', 'П'=>'p',
            'ק'=>'q',
            'ŕ'=>'r', 'ř'=>'r', 'Ř'=>'r', 'ŗ'=>'r', 'Ŗ'=>'r', 'ר'=>'r', 'Ŕ'=>'r', 'Р'=>'r', 'р'=>'r',
            'ș'=>'s', 'с'=>'s', 'Ŝ'=>'s', 'š'=>'s', 'ś'=>'s', 'ס'=>'s', 'ş'=>'s', 'С'=>'s', 'ŝ'=>'s', 'Щ'=>'sch', 'щ'=>'sch', 'ш'=>'sh', 'Ш'=>'sh', 'ß'=>'s',
            'т'=>'t', 'ט'=>'t', 'ŧ'=>'t', 'ת'=>'t', 'ť'=>'t', 'ţ'=>'t', 'Ţ'=>'t', 'Т'=>'t', 'ț'=>'t', 'Ŧ'=>'t', 'Ť'=>'t', '™'=>'tm',
            'ū'=>'u', 'у'=>'u', 'Ũ'=>'u', 'ũ'=>'u', 'Ư'=>'u', 'ư'=>'u', 'Ū'=>'u', 'Ǔ'=>'u', 'ų'=>'u', 'Ų'=>'u', 'ŭ'=>'u', 'Ŭ'=>'u', 'Ů'=>'u', 'ů'=>'u', 'ű'=>'u', 'Ű'=>'u', 'Ǖ'=>'u', 'ǔ'=>'u', 'Ǜ'=>'u', 'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'У'=>'u', 'ǚ'=>'u', 'ǜ'=>'u', 'Ǚ'=>'u', 'Ǘ'=>'u', 'ǖ'=>'u', 'ǘ'=>'u', 'ü'=>'u',
            'в'=>'v', 'ו'=>'v', 'В'=>'v',
            'ש'=>'w', 'ŵ'=>'w', 'Ŵ'=>'w',
            'ы'=>'y', 'ŷ'=>'y', 'ý'=>'y', 'ÿ'=>'y', 'Ÿ'=>'y', 'Ŷ'=>'y',
            'Ы'=>'y', 'ž'=>'z', 'З'=>'z', 'з'=>'z', 'ź'=>'z', 'ז'=>'z', 'ż'=>'z', 'ſ'=>'z', 'Ж'=>'zh', 'ж'=>'zh'
        );


        foreach($oldVal as $charKey => $ch) {
            if(in_array($ch, array_keys($replaceTable))) {
                $newValue .= str_replace($ch, $replaceTable[$ch], $ch);
            }
            else {
                $newValue .= $ch;
            }
        }


	    return $newValue;
	}
	
	/**
	 * Returns the selected locale ID, if locale not found it will return 1 which is English
	 */
	public function getCurrentLocaleID()
	{
	    $langTable = $this->getServiceLocator()->get('MelisCoreTableLang');
	    $container = new Container('meliscore');
	    if($container) {
	        $locale = $container['melis-lang-locale'];
	        $langData = $langTable->getEntryByField('lang_locale', $locale)->current();
	        if($langData) {
	            return $langData->lang_id;
	        }
	    }
	
	    return 1;
	}
	
	/**
	 * This is used whenever you want to convert phtml files names into an action name
	 * @param unknown $action
	 * @return String
	 */
	private function convertToNormalFunction($action)
	{
	    $actionStr = '';
	    $actionView = explode('-', $action);
	    $loopCtr = 0;
	    foreach($actionView as $actionWords)
	    {
	        if($loopCtr > 0)  {
	            $actionStr .= ucfirst($actionWords);
	        }
	        else {
	            $actionStr .= $actionWords;
	        }
	
	        $loopCtr++;
	    }
	
	    return $actionStr;
	}
	
	/**
	 * PHP native str_split with unicode version
	 * @param String $str
	 * @param int $l
	 * @return array
	 */
	private function stringSplitUnicode($str, $l = 0) {
	    if ($l > 0) {
	        $ret = array();
	        $len = mb_strlen($str, "UTF-8");
	        for ($i = 0; $i < $len; $i += $l) {
	            $ret[] = mb_substr($str, $i, $l, "UTF-8");
	        }
	        return $ret;
	    }
	    return preg_split("//u", $str, -1, PREG_SPLIT_NO_EMPTY);
	}
	
	/**
	 * Returns the translated text based on the current locale
	 * @param String $translationKey
	 * @param array $args
	 * @return string
	 */
	public function getTranslation($translationKey, $args = array()) 
	{
	    $translator = $this->getServiceLocator()->get('translator');
	    $translatedText = vsprintf($translator->translate($translationKey), $args);
	    
	    return $translatedText;
	}
	
	/**
	 * Returns the User ID of the logged-in user
	 * @return int
	 */
	public function getCurrentUserId()
	{
	    $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
	    $userAuthDatas =  $melisCoreAuth->getStorage()->read();
	    if($userAuthDatas) {
	        return $userAuthDatas->usr_id;
	    }
	    else {
	        return null;
	    }
	}
	
	/**
	 * Used to split array data and return the data you need
	 * @param String $prefix of the array data
	 * @param array $haystack
	 * @return array
	 */
	public function splitData($prefix, $haystack = array())
	{
	    $data = array();
	    if($haystack) {
	        foreach($haystack as $key => $value) {
	            if(strpos($key, $prefix) !== false) {
	                $data[$key] = $value;
	            }
	        }
	    }
	     
	    return $data;
	}
	
	/**
	 * This function is the opposite of splitData, this function removes
	 * the data with prefix  provided in the parameter
	 * @param string $prefix
	 * @param array $haystack
	 * @return array
	 */
	public function removeDataWithPrefix($prefix, $haystack = array()) 
	{
	    $data = array();
	    if($haystack) {
	        foreach($haystack as $key => $value) {
	            if(strpos($key, $prefix) !== false) {
	                unset($data[$key]);
	            }
	            else {
	                $data[$key] = $value;
	            }
	        }
	    }
	    
	    return $data;
	}
	
	/**
	 * Formats the date based on the current language
	 *
	 * @param string $date string value of the date
	 * @param string $time optional time format ie: h:i:s, leave blank to exclude time
	 * @return formatted date
	 */
	public function dateFormatLocale($date, $time = '')
	{
	    $container = new Container('meliscore');
	    $locale = $container['melis-lang-locale'];
	
	    switch($locale) {
	        case 'fr_FR':
	            $date = !empty($date)? date("d/m/Y ".$time ,strtotime($date)): null;
	            break;
	        default:
	            $date = !empty($date)? date("m/d/Y ".$time ,strtotime($date)): null ;
	            break;
	    }
	
	    return $date;
	}
	
	/**
	 * JS script needed for the date input group
	 * @param string $dateField the date input group id, ex: myDateField
	 * @param string $time the time format if needed, leave blank to exclude time
	 * @return string
	 */
	public function datePickerInit($dateField, $time = '')
	{
	    $container = new Container('meliscore');
	    $locale = $container['melis-lang-locale'];
	    switch($locale) {
	        case 'fr_FR':
	            $language = 'fr';
	            $format = 'dd/mm/yyyy '.$time;
	            break;
	        default:
	            $language = 'en';
	            $format = 'mm/dd/yyyy '.$time;
	            break;
	    }
	    $script =   '<script type="text/javascript">
                        $(function () {
                            $(".'.$dateField.'").datepicker({
                                    language: "'.$language.'",
                            		format: "'.$format.'",
                            });
                        });
                    </script>';
	
	    return $script;
	}
	
	/**
	 * formats the localized date to mysql datetime
	 * @param string $date, the date value to be formatted
	 * 
	 * @return NULL|string formatted date
	 */
	public function localeDateToSql($date)
	{
	    $container = new Container('meliscore');
	    $locale = $container['melis-lang-locale'];
	    switch($locale) {
	        case 'fr_FR':
	            //converts dd/mm/yyyy to yyyy-mm-dd
	            $date = str_replace('/', '-', $date);
	            $date = !empty(strtotime($date))? date("Y-m-d" ,strtotime($date)): null;
	            break;
	        default:
	            //converts mm/dd/yyyy to yyyy-mm-dd
	            $date = !empty(strtotime($date))? date("Y-m-d" ,strtotime($date)): null;
	            break;
	    }
	    return $date;
	}
	
}