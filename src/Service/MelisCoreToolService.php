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
            

            // render the buttons in the left section of the filter bar
            foreach($left as $leftKey => $leftValue) {
                $htmlContent = $this->getViewContent($leftValue);
                if(!in_array($htmlContent, $preDefDTFilter)) {
                    $leftDom .= '<"'.$leftKey.'">';
                    $jsSdomContentInit .= '$(".'.$leftKey.'").html(\'' . $htmlContent . '\');';
                }
                else {
                    $leftDom .= '<"'.$leftKey.'"'. $htmlContent. '>';
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
                }
            
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
            
            
            
           // actions
           $actionButtons = '';
           $action = '';
           $forward = $this->getServiceLocator()->get('ControllerPluginManager')->get('forward');
           $actionCount = 0;
           foreach($actionContainer as $actionKey => $actionContent) 
           {
                    $actionButtons .= $this->getViewContent($actionContent);
           }

           // remove unnecessary new lines and text paragraphs (not <p> tags)
           $actionButtons = trim(preg_replace('/\s\s+/', ' ', $actionButtons)); 
           
           // retrieve the css configuration inside each columns
           $colCtr = 1; // starts with index 1 since this will be used in JS configuration for jquery nth-child
           $colKeyId = array_keys($columns);
           
           // column configurations
           $colPostInitConfig = '';
           foreach($columns as $colKey => $colArrValue)
           {
               $varName = 'oTh'.$colKey;
               $isSortable = $colArrValue['sortable'] == false ? $varName.'.off();' : '';
               $colPostInitConfig .= 'var '.$varName. ' = $("'.$tableId.' thead tr").find("th:nth-child('.$colCtr.')");'.PHP_EOL;
               $colPostInitConfig .= $varName.'.css('.json_encode($colArrValue['css']).');'.PHP_EOL;
               $colPostInitConfig .= $isSortable.PHP_EOL;
               $colPostInitConfig .= PHP_EOL;
               $colCtr++;
           }
           
           
           // convert columns in Javascript JSON
           $jsonColumns = '[';
           foreach($colKeyId as $colId) {
               $jsonColumns .= '{"data":"'.$colId.'"},';
           }
           $jsonColumns .= '{"data":"actions"}]';

           
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
           
           $defaultTblOptions = array(
               'paging' => 'true',
               'ordering' => 'true',
               'serverSide' => 'true',
               'searching' => 'true',
           );
           
           $finalTblOption = array_merge($defaultTblOptions, $tableOption);
           
           // Table Option
           $finalTblOptionStr = '';
           foreach ($finalTblOption As $key => $val){
               if (is_array($val)){
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
                       lengthMenu: [ [5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"] ],
                       pageLength: 10,
                       ajax: {
                            url: "' . $ajaxUrl . '",
                            type: "POST",
                            '.$dataFunction.'
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
					   columnDefs: [
						 '. $selectColDef .'
						 { responsivePriority: 1, targets: 0 },
						 { responsivePriority: 2, targets: -1 }, // make sure action column stays whenever the window is resized
						 {
							 "targets": -1,
							 "data": null,
							 "mRender": function (data, type, full) {
								 return \''.$actionButtons.'\';
							 },
							 "bSortable" : false, 
							 "sClass" : \'dtActionCls\',
						 }
					 ],
                   }).columns.adjust().responsive.recalc();

	                return '.str_replace("#","$",$tableId).';
               };
	                    
                var '.str_replace("#","$",$tableId).' = '.$fnName.'();
               
		      $(document).on("init.dt", function(e, settings) {
				    '.$colPostInitConfig.$jsSdomContentInit.'
				         
		      });
           ';
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
	        'Å '=>'S', 'Å¡'=>'s', 'Ä�'=>'Dj', 'Ä‘'=>'dj', 'Å½'=>'Z', 'Å¾'=>'z', 'ÄŒ'=>'C', 'Ä�'=>'c', 'Ä†'=>'C', 'Ä‡'=>'c',
	        'Ã€'=>'A', 'Ã�'=>'A', 'Ã‚'=>'A', 'Ãƒ'=>'A', 'Ã„'=>'A', 'Ã…'=>'A', 'Ã†'=>'A', 'Ã‡'=>'C', 'Ãˆ'=>'E', 'Ã‰'=>'E',
	        'ÃŠ'=>'E', 'Ã‹'=>'E', 'ÃŒ'=>'I', 'Ã�'=>'I', 'ÃŽ'=>'I', 'Ã�'=>'I', 'Ã‘'=>'N', 'Ã’'=>'O', 'Ã“'=>'O', 'Ã”'=>'O',
	        'Ã•'=>'O', 'Ã–'=>'O', 'Ã˜'=>'O', 'Ã™'=>'U', 'Ãš'=>'U', 'Ã›'=>'U', 'Ãœ'=>'U', 'Ã�'=>'Y', 'Ãž'=>'B', 'ÃŸ'=>'Ss',
	        'Ã '=>'a', 'Ã¡'=>'a', 'Ã¢'=>'a', 'Ã£'=>'a', 'Ã¤'=>'a', 'Ã¥'=>'a', 'Ã¦'=>'a', 'Ã§'=>'c', 'Ã¨'=>'e', 'Ã©'=>'e',
	        'Ãª'=>'e', 'Ã«'=>'e', 'Ã¬'=>'i', 'Ã­'=>'i', 'Ã®'=>'i', 'Ã¯'=>'i', 'Ã°'=>'o', 'Ã±'=>'n', 'Ã²'=>'o', 'Ã³'=>'o',
	        'Ã´'=>'o', 'Ãµ'=>'o', 'Ã¶'=>'o', 'Ã¸'=>'o', 'Ã¹'=>'u', 'Ãº'=>'u', 'Ã»'=>'u', 'Ã½'=>'y', 'Ã½'=>'y', 'Ã¾'=>'b',
	        'Ã¿'=>'y', 'Å”'=>'R', 'Å•'=>'r'
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
	

	
}