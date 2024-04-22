<?php

namespace MelisCore\Service;

use ReflectionClass;
use Laminas\Http\PhpEnvironment\Response as HttpResponse;
use Laminas\Session\Container;
use Laminas\View\Model\ViewModel;

/**
 * This Service helps you create your tool
 */
class MelisCoreToolService extends MelisServiceManager implements MelisCoreToolServiceInterface
{
    const TEXT_LIMIT = 25;
    protected $_melisToolKey;
    protected $_melisConfig;
    protected $_appConfig;
    protected $_usedKey;

    /**
     * Returns the Title of the tool
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->_appConfig['conf']['title'];
    }

    /**
     * Returns the Unique Identifier of the tool
     *
     * @return string
     */
    public function getToolId()
    {
        return $this->_appConfig['conf']['id'];
    }

    /**
     * Returns the column config (e.g: text, css, sortable)
     *
     * @return Array
     */
    public function getColumnValues()
    {
        return array_values($this->getColumns());
    }

    /**
     * Returns the columns in the app.tools.php
     *
     * @return Array;
     */
    public function getColumns()
    {
        return $this->_appConfig['table']['columns'];
    }

    /**
     * Returns the form elements of the provided form key
     *
     * @param String $formKey
     *
     * @return \Laminas\Form\ElementInterface
     */
    public function getForm($formKey)
    {
        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $toolKey = $this->getMelisToolKey();
        $formConfig = $toolKey . '/forms/' . $formKey;

        $hasFormOrderCfg = $melisConfig->getOrderFormsConfig($formKey);
        if ($hasFormOrderCfg) {
            $formConfig = $melisConfig->getFormMergedAndOrdered($formConfig, $formKey);
        } else {           

            // use the original order of the form
            $formConfig = $this->_appConfig['forms'][$formKey];            
            
            /*for the laminas form v3 compatibility*/
            if ($formConfig['elements']) {
                foreach ($formConfig['elements'] as &$formElement) {
                    $formElement = $melisConfig->parseCheckboxCheckUncheckedValues($formElement);
                }
                unset($formElement);
            }
        }

        /** @var \MelisCore\Service\MelisFormService $factory */
        $factory = $this->getServiceManager()->get('MelisCoreFormService');
        $formElements = $this->getServiceManager()->get('FormElementManager');

//        print_r(get_class($formElements));
//        exit;
        $factory->setFormElementManager($formElements);
        $form = $factory->createForm($formConfig);

        return $form;
    }


    /**
     * Returns the melis tool key configuration text
     *
     * @return string
     */
    public function getMelisToolKey()
    {
        return $this->_melisToolKey;
    }

    /**
     * Sets what configuration key in app.tools.php will be used on this tool service.
     *
     * @param String $module
     * @param String $melisToolKey
     */
    public function setMelisToolKey($module, $melisToolKey)
    {
        $this->_melisToolKey = $module . '/tools/' . $melisToolKey;

        $this->_melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $this->_appConfig = $this->_melisConfig->getItem($this->_melisToolKey);
        $this->_usedKey = $melisToolKey;
    }

    /**
     * Returns all form elements of the Tool
     *
     * @return \Laminas\Form\ElementInterface[]
     */
    public function getForms()
    {
        $formKeys = $this->_appConfig['forms'];
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $forms = [];
        foreach ($formKeys as $keys => $formValues) {
            $forms[] = $factory->createForm($this->_appConfig['forms'][$keys]);
        }

        return $forms;
    }

    /**
     * Returns all Form Keys of the tool
     *
     * @return Array
     */
    public function getFormKeys()
    {
        $formKeys = $this->_appConfig['forms'];
        $forms = [];
        foreach ($formKeys as $keys => $values) {
            $forms[] = $keys;
        }

        return $forms;
    }

    /**
     * Returns the modal content array of the form
     *
     * @param String $formKey
     *
     * @return Array
     */
    public function getModalValues($formKey)
    {
        return $this->_appConfig['modals'][$formKey];
    }

    /**
     * Returns all the modals of the tools
     *
     * @return Array
     */
    public function getAllModals()
    {
        $forms = [];
        $formKeys = $this->_appConfig['modals'];

        foreach ($formKeys as $keys => $values) {
            $forms[$keys] = $this->_appConfig['modals'][$keys];
            $forms[$keys]['content'] = $this->getModalContent($keys);
        }

        return $forms;
    }

    /**
     * Returns the contents of the modal from the provided form key
     *
     * @param String $formKey
     *
     * @return String
     */
    public function getModalContent($formKey)
    {
        $forward = $this->getServiceManager()->get('ControllerPluginManager')->get('forward');
        $content = $this->_appConfig['modals'][$formKey]['content'];
        $contentValue = $this->getViewContent($content);

        return $contentValue;
    }

    /**
     * Retrieves the content of the view file
     *
     * @param Array $dispatchHandler
     *
     * @return string
     */
    public function getViewContent($dispatchHandler)
    {
        $forward = $this->getServiceManager()->get('ControllerPluginManager')->get('forward');
        $module = $dispatchHandler['module'];
        $controller = $dispatchHandler['controller'];
        $actionView = $dispatchHandler['action'];

        $action = $this->convertToNormalFunction($actionView);

        $viewModel = new ViewModel();
        $viewModel = $forward->dispatch($module . '\\Controller\\' . $controller, ['action' => $action]);

        $renderer = $this->getServiceManager()->get('Laminas\View\Renderer\RendererInterface');
        $html = new \Laminas\Mime\Part($renderer->render($viewModel));

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
     * This is used whenever you want to convert phtml files names into an action name
     *
     * @param string $action
     *
     * @return string
     */
    public function convertToNormalFunction($action)
    {
        $actionStr = '';
        $actionView = explode('-', $action);
        $loopCtr = 0;
        foreach ($actionView as $actionWords) {
            if ($loopCtr > 0) {
                $actionStr .= ucfirst($actionWords);
            } else {
                $actionStr .= $actionWords;
            }

            $loopCtr++;
        }

        return $actionStr;
    }

    /**
     * Returns a single modal
     *
     * @param $modalKey
     *
     * @return array
     */
    public function getModal($modalKey)
    {

        $forms = [];
        $formKeys = $this->_appConfig['modals'][$modalKey];

        $forms[$modalKey]['id'] = $this->_appConfig['modals'][$modalKey]['id'];
        $forms[$modalKey]['class'] = $this->_appConfig['modals'][$modalKey]['class'];
        $forms[$modalKey]['tab-header'] = $this->_appConfig['modals'][$modalKey]['tab-header'];
        $forms[$modalKey]['tab-text'] = $this->_appConfig['modals'][$modalKey]['tab-text'];
        $forms[$modalKey]['content'] = $this->getModalContent($modalKey);

        return $forms;
    }

    /**
     * Returns an array of searchable columns that will be used whenever search function is used in the Data Table
     *
     * return array
     */
    public function getSearchableColumns()
    {
        $seachableCols = [];

        if ($this->_appConfig['table']['searchables']) {
            $seachableCols = $this->_appConfig['table']['searchables'];
        }

        return $seachableCols;
    }

    /**
     * Returns the format of the date depending on what locale
     * @todo THIS IS TEMPORARY, NEED TO CREATE A FUNCTION FOR GLOBAL USE
     * @param $date
     * @param $delimiter
     *
     * @return mixed|string
     */
    public function formatToQueryDate($date, $delimiter)
    {
        $sDate = '';
        if (!empty($date)) {
            if ($date != '0') {
                $sDate = str_replace($delimiter, '-', $date);
                // breakdown dates
                $aDate = explode('-', $sDate);

                $container = new Container('meliscore');
                $locale = $container['melis-lang-locale'];

                $iYear = $aDate[2];
                $iMonth = 0;
                $iDay = 0;

                switch ($locale) {
                    case 'fr_FR':
                        $iMonth = $aDate[1];
                        $iDay = $aDate[0];
                        break;
                    case 'en_EN':
                        $iMonth = $aDate[0];
                        $iDay = $aDate[1];
                        break;
                }
                $sDate = $iYear . '-' . $iMonth . '-' . $iDay;
            }
        }

        return $sDate;
    }

    /**
     * Returns a limited text
     *
     * @param String $text
     *
     * @return string
     */
    public function limitedText($text, $limit = self::TEXT_LIMIT)
    {
        $postString = '...';
        $strCount = 0;
        if(!empty($text))
            $strCount = strlen($text);

        $sLimitedText = $text;

        if ($strCount > $limit) {
            $sLimitedText = mb_substr($text, 0, $limit) . $postString;
        }

        return $sLimitedText;

    }

    /**
     * This functions reads the configuration inside the app.tool array config
     *
     * @param null $targetTable
     * @param bool $allowReInit
     * @param bool $selectCheckbox
     * @param array $tableOption
     * @param string $type
     *
     * @return string
     */
    public function getDataTableConfiguration($targetTable = null, $allowReInit = false,
                                            $selectCheckbox = false, $tableOption = [], $tableLangTrans = 'default')
    {
        $translator = $this->getServiceManager()->get('translator');
        $dtJScript = '';

        if (empty($this->_appConfig))
            return $dtJScript;

        $table = $this->_appConfig['table'];

        if ($table) {
            $tableId = is_null($targetTable) ? $table['target'] : $targetTable;
            $ajaxUrl = $table['ajaxUrl'];
            $dataFunction = !empty($table['dataFunction']) ? 'data: ' . $table['dataFunction'] : '';
            $ajaxCallBack = !empty($table['ajaxCallback']) ? $table['ajaxCallback'] . ';' : '';
            $initComplete = !empty($table['initComplete']) ? $table['initComplete'] . ';' : '';
            $filters = $table['filters'];
            $columns = $table['columns'];
            $actionContainer = $table['actionButtons'];

            $jsSdomContentInit = '';
            $tableTop = '<"filter-bar container-fluid"<"row"';

            $left = $filters['left'];
            $center = $filters['center'];
            $right = $filters['right'];
            $leftDom = '<"fb-dt-left col-xs-12 col-md-4"';
            $centerDom = '<"fb-dt-center col-xs-12 col-md-4"';
            $rightDom = '<"fb-dt-right col-xs-12 col-md-4"';

            // datatables predefined filter plugins
            $preDefDTFilter = ['l', 'f'];

            $searchInputClass = '';

            // render the buttons in the left section of the filter bar
            foreach ($left as $leftKey => $leftValue) {
                $htmlContent = $this->getViewContent($leftValue);
                if (!in_array($htmlContent, $preDefDTFilter)) {
                    $leftDom .= '<"' . $leftKey . '">';
                    $jsSdomContentInit .= '$("'.$tableId.'_wrapper .filter-bar .' . $leftKey . '").html(\'' . $this->replaceQuotes($htmlContent) . '\');';
                } else {
                    $leftDom .= '<"' . $leftKey . '"' . $htmlContent . '>';
                    if ($htmlContent == 'f') {
                        $searchInputClass = $leftKey;
                    }
                }
            }

            // render the buttons in the center section of the filter bar
            foreach ($center as $centerKey => $centerValue) {
                $htmlContent = $this->getViewContent($centerValue);
                if (!in_array($htmlContent, $preDefDTFilter)) {
                    $centerDom .= '<"' . $centerKey . '">';
                    $jsSdomContentInit .= '$("'.$tableId.'_wrapper .filter-bar .' . $centerKey . '").html(\'' . $htmlContent . '\');';
                } else {
                    $centerDom .= '<"' . $centerKey . '"' . $htmlContent . '>';
                    if ($htmlContent == 'f') {
                        $searchInputClass = $centerKey;
                    }
                }

            }

            // render the buttons in the right sectuib if the filter bar
            foreach ($right as $rightKey => $rightValue) {
                $htmlContent = $this->getViewContent($rightValue);
                $htmlContent = $this->replaceQuotes($htmlContent);
                if (!in_array($htmlContent, $preDefDTFilter)) {
                    $rightDom .= '<"' . $rightKey . '">';
                    $jsSdomContentInit .= '$("'.$tableId.'_wrapper .filter-bar .' . $rightKey . '").html(\'' . $htmlContent . '\');';
                } else {
                    $rightDom .= '<"' . $rightKey . '"' . $htmlContent . '>';
                    if ($htmlContent == 'f') {
                        $searchInputClass = $rightKey;
                    }
                }

            }

            $tableSearchPlugin = '';
            if (!empty($searchInputClass)) {
                $tableSearchPlugin = '$(\'.' . $searchInputClass . ' input[type="search"]\').off();
                                    $(\'.' . $searchInputClass . ' input[type="search"]\').typeWatch({
                                            captureLength: 2,
                                            callback: function(value) {
                                            ' . str_replace("#", "$", $tableId) . '.search(value).draw();   
                                            }
                                        });';
            }


            $tableTop .= $leftDom . '>' . $centerDom . '>' . $rightDom . '>>>';
            $tableBottom = '<"bottom" t<"pagination-cont"rip>>';

            // check if the filter array configuration is empty
            if (empty($left) && empty($center) && empty($right)) {
                $sDomStructure = '';
            } else {
                // if not filters found, filter-bar class content should not be displayed
                $sDomStructure = $tableTop . $tableBottom;
            }

            // Action Buttons
            $actionButtons = '';
            $action = '';
            $forward = $this->getServiceManager()->get('ControllerPluginManager')->get('forward');
            $actionCount = 0;
            foreach ($actionContainer as $actionKey => $actionContent) {
                $actionButtons .= $this->getViewContent($actionContent) . ' ';
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
            foreach ($colKeyId as $colId) {
                $jsonColumns .= '{"data":"' . $colId . '"},';
            }

            if (!empty($actionButtons)) {
                // $jsonColumns .= '{"data":"actions"}; commented, generates warning, https://datatables.net/tn/4
                $jsonColumns .= '{"data":null}';

                // Preparing the Table Action column Buttons
                $actionColumn = '{
                                    "targets": -1,
                                    "data": null,
                                    "mRender": function (data, type, full) {
                                        return \'<div>' . $actionButtons . '</div>\';
                                    },
                                    "bSortable" : false,
                                    "sClass" : \'dtActionCls\',
                                }';
            }
            $jsonColumns .= ']';

            $fnName = 'fn' . $tableId . 'init';

            $reInitTable = '';
            if ($allowReInit) {
                $reInitTable = '     
                var dTable = $("' . $tableId . '").DataTable();
                if(dTable !== undefined) {
                    dTable.destroy();    
                }';
            }
            // select checkbox extension
            $select = '';
            $selectColDef = '';
            if ($selectCheckbox) {
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
            $unSortableColumns = [];
            $columnCtr = 0;
            foreach ($columns as $colKey => $colArrValue) {
                if (isset($colArrValue['sortable'])) {
                    // Getting unsortable columns
                    $isSortable = $colArrValue['sortable'] == false ? array_push($unSortableColumns, $columnCtr) : '';
                }
                $columnCtr++;
            }
            $unSortableColumnsStr = '';
            if (!empty($unSortableColumns)) {
                // Creating config string for Unsortable Columns
                $unSortableColumnsStr = '{ targets: [' . implode(',', $unSortableColumns) . '], bSortable: false},';
            }
            // Column Unsortable End

            // Preparing Table Column Styles
            $columnsStyles = [];
            $columnCtr = 0;
            foreach ($columns as $colKey => $colArrValue) {
                if (isset($colArrValue['css'])) {
                    // Getting Style of the columns
                    $columnStyles = $colArrValue['css'];
                }
                // Adding the Ctr/index/number of the column
                $columnStyles['targets'] = $columnCtr;

                array_push($columnsStyles, $columnStyles);
                $columnCtr++;
            }
            $columnsStylesStr = '';
            if (!empty($columnsStyles)) {
                // Creating Column config string
                foreach ($columnsStyles As $sVal) {
                    $columnStyle = [];
                    foreach ($sVal As $cKey => $cVal) {
                        if (in_array($cKey, ['width', 'targets', 'visible'])) {
                            $cVal = (is_numeric($cVal)) ? $cVal : '"' . $cVal . '"';
                            array_push($columnStyle, '"' . $cKey . '": ' . $cVal);
                        }
                    }
                    $columnsStylesStr .= '{ ' . implode(', ', $columnStyle) . ' },' . PHP_EOL;
                }
            }
            // Columns Styles End

            // Default Melis Table Configuration
            // This can be override from Param
            $defaultTblOptions = [
                'paging' => 'true',
                'ordering' => 'true',
                'serverSide' => 'true',
                'searching' => 'true',
                'pageLength' => '10',
            ];
            // Merging Default Configuration and Param Configuration
            // This process will override default config if index exist on param config
            $finalTblOption = array_merge($defaultTblOptions, $tableOption);
            // Table Option
            $finalTblOptionStr = '';
            foreach ($finalTblOption As $key => $val) {
                if (is_array($val)) {
                    // If Option has multiple options
                    $val = json_encode($val);
                }
                $finalTblOptionStr .= $key . ': ' . $val . ',' . PHP_EOL;
            }

            // Table language translations
            if (!$tableLangTrans)
                $tableLangTrans = 'default';
            $language = 'melisDataTable.tableLanguage.'.$tableLangTrans;


            //remove special characters in function name
            $fnName = preg_replace('/\W/', '', $fnName);
            // simulate javascript code function here
            $dtJScript = 'window.' . $fnName . ' = function() {
                ' . $reInitTable . '
                var ' . str_replace("#", "$", $tableId) . ' = $("' . $tableId . '").DataTable({
                    ' . $select . '
                    ' . $finalTblOptionStr . '
                    responsive:true,
                    processing: true,
                    lengthMenu: [ [5, 10, 25, 50], [5, 10, 25, 50] ],
                    ajax: {
                        url: "' . $ajaxUrl . '",
                        type: "POST",
                        ' . $dataFunction . '
                    },
                    initComplete : function(oSettings, json) {
                        ' . $initComplete . '  
                    },
                    fnDrawCallback: function(oSettings) {
                        ' . $ajaxCallBack . '
                    },
                    columns: ' . $jsonColumns . ',
                    language: ' . $language . ',
                    sDom : \'' . $sDomStructure . '\',
                    bSort: true,
                    searchDelay: 1500,
                    columnDefs: [
                        ' . $columnsStylesStr . '  
                        ' . $unSortableColumnsStr . '
                        ' . $selectColDef . '
                        { responsivePriority: 1, targets: 0 },';

            if ($actionColumn != "") {
                $dtJScript .= '{responsivePriority:2, targets: -1 },'; // make sure action column stays whenever the window is resized
            }
            $dtJScript .= $actionColumn . '
                    ],
                }).columns.adjust().responsive.recalc();
                return ' . str_replace("#", "$", $tableId) . ';
            };
            var ' . str_replace("#", "$", $tableId) . ' = ' . $fnName . '();
            $("' . $tableId . '").on("init.dt", function(e, settings) {
                ' . $jsSdomContentInit . '
                ' . $tableSearchPlugin . '   
            });';
        }

        return $dtJScript;
    }

    /**
        * Quote correction for better execution in queries
        *
        * @param $text
        *
        * @return string
        */
    private function replaceQuotes($text)
    {
        return str_replace(["'", "’"], chr(92) . "'", $text);
    }

    /**
        * Exports the data inside the data table in CSV
        * @see \MelisCore\Service\MelisCoreToolServiceInterface::exportDataToCsv()
        * @param $data
        * @param null $fileName
        *
        * @param null $customSeparator
        * @param null $customIsEnclosed
        * @return string|HttpResponse
        */
    public function exportDataToCsv($data, $fileName = null, $customSeparator = null, $customIsEnclosed = null)
    {
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');

        $csvConfig = $melisCoreConfig->getItem('meliscore/datas/default/export/csv');
        $csvFileName = '';
        $separator = empty($customSeparator) ? $csvConfig['separator'] : $customSeparator;

        if($customIsEnclosed != null)
            $enclosed = $customIsEnclosed == 0 ? '' : '"';
        else
            $enclosed = $csvConfig['enclosed'];

        $striptags = (int) $csvConfig['striptags'] == 1 ? true : false;
        $response = '';

        // check what file name to use when exporting
        if (!empty($this->_appConfig['export']) && !empty($this->_appConfig['export']['csvFileName'])) {
            $csvFileName = $this->_appConfig['export']['csvFileName'];
        } else {
            $csvFileName = $csvConfig['defaultFileName'];
        }

        if ($data) {
            $csvColumn = $data[0];

            $content = '';
            $ctr = 0;

            // for columns
            foreach ($csvColumn as $key => $colText) {
                $content .= $key . $separator;
            }
            $content .= "\r\n";

            // for contents
            foreach ($data as $dataKey => $dataValue) {

                foreach ($dataValue as $key => $value) {

                    if ($striptags) {
                        if(!empty($value)) {
                            $value = html_entity_decode($value);
                            $value = strip_tags($value);
                        }
                    } else {
                        if (is_int($value)) {
                            $value = (string) $value;
                        }
                    }
                    // convert UTF-8 to UTF-16LE encoding for excel encoding rendering
//                    $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
                    $content .= $enclosed . $this->replaceAccents($value) . $enclosed . $separator;

                }
                $content .= "\r\n";
            }

            if (!is_null($fileName) || !empty($fileName)) {
                $csvFileName = $fileName;
            }

            $response = new HttpResponse();
            $headers = $response->getHeaders();
            $headers->addHeaderLine('Content-Type', 'text/csv; charset=utf-8');
            $headers->addHeaderLine('Content-Disposition', "attachment; filename=\"" . $csvFileName . "\"");
            $headers->addHeaderLine('Accept-Ranges', 'bytes');
            $headers->addHeaderLine('Content-Length', strlen($content));
            $headers->addHeaderLine('fileName', $csvFileName);
            $response->setContent($content);
        }

        return $response;
    }

    /**
        * Replaces characters with accents into normal character
        *
        * @param string $str
        *
        * @return string
        */
    public function replaceAccents($str)
    {
        $newValue = '';
        $oldVal = $this->stringSplitUnicode($str);
        $replaceTable = [
            'ъ' => 'b', 'Ь' => 'b', 'Ъ' => 'b', 'ь' => 'b',
            'Ă' => 'A', 'Ą' => 'A', 'À' => 'A', 'Ã' => 'A', 'Á' => 'A', 'Æ' => 'A', 'Â' => 'A', 'Å' => 'A', 'Ä' => 'A',
            'Þ' => 'B',
            'Ć' => 'C', 'ץ' => 'C', 'Ç' => 'C',
            'È' => 'E', 'Ę' => 'E', 'É' => 'E', 'Ë' => 'E', 'Ê' => 'E',
            'Ğ' => 'G',
            'İ' => 'I', 'Ï' => 'I', 'Î' => 'I', 'Í' => 'I', 'Ì' => 'I',
            'Ł' => 'L',
            'Ñ' => 'N', 'Ń' => 'N',
            'Ø' => 'O', 'Ó' => 'O', 'Ò' => 'O', 'Ô' => 'O', 'Õ' => 'O', 'Ö' => 'O',
            'Ş' => 'S', 'Ś' => 'S', 'Ș' => 'S', 'Š' => 'S',
            'Ț' => 'T',
            'Ù' => 'U', 'Û' => 'U', 'Ú' => 'U', 'Ü' => 'U',
            'Ý' => 'Y',
            'Ź' => 'Z', 'Ž' => 'Z', 'Ż' => 'Z',
            'â' => 'a', 'ǎ' => 'a', 'ą' => 'a', 'á' => 'a', 'ă' => 'a', 'ã' => 'a', 'Ǎ' => 'a', 'а' => 'a', 'А' => 'a', 'å' => 'a', 'à' => 'a', 'א' => 'a', 'Ǻ' => 'a', 'Ā' => 'a', 'ǻ' => 'a', 'ā' => 'a', 'ä' => 'a', 'æ' => 'a', 'Ǽ' => 'a', 'ǽ' => 'a',
            'б' => 'b', 'ב' => 'b', 'Б' => 'b', 'þ' => 'b',
            'ĉ' => 'c', 'Ĉ' => 'c', 'Ċ' => 'c', 'ć' => 'c', 'ç' => 'c', 'ц' => 'c', 'צ' => 'c', 'ċ' => 'c', 'Ц' => 'c', 'Č' => 'c', 'č' => 'c', 'Ч' => 'ch', 'ч' => 'ch',
            'ד' => 'd', 'ď' => 'd', 'Đ' => 'd', 'Ď' => 'd', 'đ' => 'd', 'д' => 'd', 'Д' => 'D', 'ð' => 'd',
            'є' => 'e', 'ע' => 'e', 'е' => 'e', 'Е' => 'e', 'Ə' => 'e', 'ę' => 'e', 'ĕ' => 'e', 'ē' => 'e', 'Ē' => 'e', 'Ė' => 'e', 'ė' => 'e', 'ě' => 'e', 'Ě' => 'e', 'Є' => 'e', 'Ĕ' => 'e', 'ê' => 'e', 'ə' => 'e', 'è' => 'e', 'ë' => 'e', 'é' => 'e',
            'ф' => 'f', 'ƒ' => 'f', 'Ф' => 'f',
            'ġ' => 'g', 'Ģ' => 'g', 'Ġ' => 'g', 'Ĝ' => 'g', 'Г' => 'g', 'г' => 'g', 'ĝ' => 'g', 'ğ' => 'g', 'ג' => 'g', 'Ґ' => 'g', 'ґ' => 'g', 'ģ' => 'g',
            'ח' => 'h', 'ħ' => 'h', 'Х' => 'h', 'Ħ' => 'h', 'Ĥ' => 'h', 'ĥ' => 'h', 'х' => 'h', 'ה' => 'h',
            'î' => 'i', 'ï' => 'i', 'í' => 'i', 'ì' => 'i', 'į' => 'i', 'ĭ' => 'i', 'ı' => 'i', 'Ĭ' => 'i', 'И' => 'i', 'ĩ' => 'i', 'ǐ' => 'i', 'Ĩ' => 'i', 'Ǐ' => 'i', 'и' => 'i', 'Į' => 'i', 'י' => 'i', 'Ї' => 'i', 'Ī' => 'i', 'І' => 'i', 'ї' => 'i', 'і' => 'i', 'ī' => 'i', 'ĳ' => 'ij', 'Ĳ' => 'ij',
            'й' => 'j', 'Й' => 'j', 'Ĵ' => 'j', 'ĵ' => 'j', 'я' => 'ja', 'Я' => 'ja', 'Э' => 'je', 'э' => 'je', 'ё' => 'jo', 'Ё' => 'jo', 'ю' => 'ju', 'Ю' => 'ju',
            'ĸ' => 'k', 'כ' => 'k', 'Ķ' => 'k', 'К' => 'k', 'к' => 'k', 'ķ' => 'k', 'ך' => 'k',
            'Ŀ' => 'l', 'ŀ' => 'l', 'Л' => 'l', 'ł' => 'l', 'ļ' => 'l', 'ĺ' => 'l', 'Ĺ' => 'l', 'Ļ' => 'l', 'л' => 'l', 'Ľ' => 'l', 'ľ' => 'l', 'ל' => 'l',
            'מ' => 'm', 'М' => 'm', 'ם' => 'm', 'м' => 'm',
            'ñ' => 'n', 'н' => 'n', 'Ņ' => 'n', 'ן' => 'n', 'ŋ' => 'n', 'נ' => 'n', 'Н' => 'n', 'ń' => 'n', 'Ŋ' => 'n', 'ņ' => 'n', 'ŉ' => 'n', 'Ň' => 'n', 'ň' => 'n',
            'о' => 'o', 'О' => 'o', 'ő' => 'o', 'õ' => 'o', 'ô' => 'o', 'Ő' => 'o', 'ŏ' => 'o', 'Ŏ' => 'o', 'Ō' => 'o', 'ō' => 'o', 'ø' => 'o', 'ǿ' => 'o', 'ǒ' => 'o', 'ò' => 'o', 'Ǿ' => 'o', 'Ǒ' => 'o', 'ơ' => 'o', 'ó' => 'o', 'Ơ' => 'o', 'œ' => 'o', 'Œ' => 'o', 'ö' => 'o',
            'פ' => 'p', 'ף' => 'p', 'п' => 'p', 'П' => 'p',
            'ק' => 'q',
            'ŕ' => 'r', 'ř' => 'r', 'Ř' => 'r', 'ŗ' => 'r', 'Ŗ' => 'r', 'ר' => 'r', 'Ŕ' => 'r', 'Р' => 'r', 'р' => 'r',
            'ș' => 's', 'с' => 's', 'Ŝ' => 's', 'š' => 's', 'ś' => 's', 'ס' => 's', 'ş' => 's', 'С' => 's', 'ŝ' => 's', 'Щ' => 'sch', 'щ' => 'sch', 'ш' => 'sh', 'Ш' => 'sh', 'ß' => 's',
            'т' => 't', 'ט' => 't', 'ŧ' => 't', 'ת' => 't', 'ť' => 't', 'ţ' => 't', 'Ţ' => 't', 'Т' => 't', 'ț' => 't', 'Ŧ' => 't', 'Ť' => 't', '™' => 'tm',
            'ū' => 'u', 'у' => 'u', 'Ũ' => 'u', 'ũ' => 'u', 'Ư' => 'u', 'ư' => 'u', 'Ū' => 'u', 'Ǔ' => 'u', 'ų' => 'u', 'Ų' => 'u', 'ŭ' => 'u', 'Ŭ' => 'u', 'Ů' => 'u', 'ů' => 'u', 'ű' => 'u', 'Ű' => 'u', 'Ǖ' => 'u', 'ǔ' => 'u', 'Ǜ' => 'u', 'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'У' => 'u', 'ǚ' => 'u', 'ǜ' => 'u', 'Ǚ' => 'u', 'Ǘ' => 'u', 'ǖ' => 'u', 'ǘ' => 'u', 'ü' => 'u',
            'в' => 'v', 'ו' => 'v', 'В' => 'v',
            'ש' => 'w', 'ŵ' => 'w', 'Ŵ' => 'w',
            'ы' => 'y', 'ŷ' => 'y', 'ý' => 'y', 'ÿ' => 'y', 'Ÿ' => 'y', 'Ŷ' => 'y',
            'Ы' => 'y', 'ž' => 'z', 'З' => 'z', 'з' => 'z', 'ź' => 'z', 'ז' => 'z', 'ż' => 'z', 'ſ' => 'z', 'Ж' => 'zh', 'ж' => 'zh',
        ];

        foreach ($oldVal as $charKey => $ch) {
            if (in_array($ch, array_keys($replaceTable))) {
                $newValue .= str_replace($ch, $replaceTable[$ch], $ch);
            } else {
                $newValue .= $ch;
            }
        }

        return $newValue;
    }

    /**
     * PHP native str_split with unicode version
     *
     * @param $str
     * @param int $l
     * @return array|false|string[]
     */
    private function stringSplitUnicode($str, $l = 0)
    {
        if(!empty($str)) {
            if ($l > 0) {
                $ret = [];
                $len = mb_strlen($str, "UTF-8");
                for ($i = 0; $i < $len; $i += $l) {
                    $ret[] = mb_substr($str, $i, $l, "UTF-8");
                }

                return $ret;
            }

            return preg_split("//u", $str, -1, PREG_SPLIT_NO_EMPTY);
        }
        return [];
    }

    /**
        * Returns the selected locale ID, if locale not found it will return 1 which is English
        *
        * @return int
        */
    public function getCurrentLocaleID()
    {
        $langTable = $this->getServiceManager()->get('MelisCoreTableLang');
        $container = new Container('meliscore');
        if ($container) {
            $locale = $container['melis-lang-locale'];
            $langData = $langTable->getEntryByField('lang_locale', $locale)->current();
            if ($langData) {
                return $langData->lang_id;
            }
        }

        return 1;
    }

    /**
        * Returns the translated text based on the current locale
        *
        * @param string $translationKey
        * @param array $args
        *
        * @return string
        */
    public function getTranslation($translationKey, $args = [])
    {
        $translator = $this->getServiceManager()->get('translator');
        $translatedText = vsprintf($translator->translate($translationKey), $args);

        return $translatedText;
    }

    /**
        * Returns the User ID of the logged-in user
        *
        * @return int
        */
    public function getCurrentUserId()
    {
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
        $userAuthDatas = $melisCoreAuth->getStorage()->read();
        if ($userAuthDatas) {
            return $userAuthDatas->usr_id;
        } else {
            return null;
        }
    }

    /**
        * Used to split array data and return the data you need
        *
        * @param string $prefix of the array data
        * @param array $haystack
        *
        * @return array
        */
    public function splitData($prefix, $haystack = [])
    {
        $data = [];
        if ($haystack) {
            foreach ($haystack as $key => $value) {
                if (strpos($key, $prefix) !== false) {
                    $data[$key] = $value;
                }
            }
        }

        return $data;
    }

    /**
        * This function is the opposite of splitData, this function removes
        * the data with prefix  provided in the parameter
        *
        * @param string $prefix
        * @param array $haystack
        *
        * @return array
        */
    public function removeDataWithPrefix($prefix, $haystack = [])
    {
        $data = [];
        if ($haystack) {
            foreach ($haystack as $key => $value) {
                if (strpos($key, $prefix) !== false) {
                    unset($data[$key]);
                } else {
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
        *
        * @return \DateTime
        */
    public function dateFormatLocale($date, $time = '', $locale = null)
    {
        $container = new Container('meliscore');
        $locale = is_null($locale) ? $container['melis-lang-locale'] : $locale;

        switch ($locale) {
            case 'fr_FR':
                $date = !empty($date) ? date("d/m/Y " . $time, strtotime($date)) : null;
                break;
            default:
                $date = !empty($date) ? date("m/d/Y " . $time, strtotime($date)) : null;
                break;
        }

        return $date;
    }

    /**
        * JS script needed for the date input group
        *
        * @param string $dateField the date input group id, ex: myDateField
        * @param string $time the time format if needed, leave blank to exclude time
        *
        * @return string
        */
    public function datePickerInit($dateField, $time = '')
    {
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
        switch ($locale) {
            case 'fr_FR':
                $language = 'fr';
                $format = 'dd/mm/yyyy ' . $time;
                break;
            default:
                $language = 'en';
                $format = 'mm/dd/yyyy ' . $time;
                break;
        }
        $script = '<script type="text/javascript">
                        $(function () {
                            $(".' . $dateField . '").datepicker({
                                    language: "' . $language . '",
                                    format: "' . $format . '",
                            });
                        });
                    </script>';

        return $script;
    }

    /**
        * formats the localized date to mysql datetime
        *
        * @param string $date , the date value to be formatted
        *
        * @return \DateTime
        */
    public function localeDateToSql($date)
    {
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
        switch ($locale) {
            case 'fr_FR':
                //converts dd/mm/yyyy to yyyy-mm-dd
                $date = !empty($date) ? str_replace('/', '-', $date) : null;
                $date = !empty($date) ? date("Y-m-d", strtotime($date)) : null;
                break;
            default:
                //converts mm/dd/yyyy to yyyy-mm-dd
                $date = !empty($date) ? date("Y-m-d", strtotime($date)) : null;
                break;
        }

        return $date;
    }

    /**
        * HTML Escaper
        *
        * @param $value
        *
        * @return string
        */
    public function escapeHtml($value)
    {
        if (!empty($value)) {
            $escaper = new \Laminas\Escaper\Escaper('utf-8');
            $value = $escaper->escapeHtml($value);
        }
        
        return $value;
    }

    /**
        * This function sanitizes a single array and removes  a suspicious XSS value and SQL injection value
        *
        * @param $postArray
        * @param array $exclude - if you want to exclude a certain value, then you must put the name of the value that you want to exclude
        * @param bool $textOnly - set to "true" if you want to remove all special characters and retain only alphanumeric characters.
        * @param bool $removeFunctions - set to "false" if you don't want to remove function names that may lead to XSS injection
        *
        * @return array
        */
    public function sanitizePost($postArray, $exclude = [], $textOnly = false, $removeFunctions = true)
    {
        $post = [];

        $postArray = (array) $postArray;
        foreach ($postArray as $postKey => $postVal) {

            if (!empty($exclude)) {
                foreach ($exclude as $input) {
                    if ($input != $postKey) {
                        $post[$postKey] = $this->sanitize($postVal, $textOnly, $removeFunctions);
                    } else {
                        $post[$postKey] = $postVal;
                    }
                }
            } else {
                $post[$postKey] = $this->sanitize($postVal, $textOnly, $removeFunctions);
            }
        }

        return $post;
    }

    /**
        * This functions removes a suspicious XSS value and SQL injection value
        *
        * @param $input string|array - if the input is a string, it will sanitize the value, if the input is an array then it will call the sanitizeResursive function.
        * @param bool $textOnly - set to "true" if you want to remove all special characters and retain only alphanumeric characters.
        * @param bool $removeFunctions - set to "false" if you don't want to remove function names that may lead to XSS injection
        *
        * @return array|mixed|string
        */
    public function sanitize($input, $textOnly = false, $removeFunctions = true)
    {

        if (!is_array($input)) {
            if(!empty($input)) {
                if ($removeFunctions) {
                    $input = preg_replace('/[a-zA-Z][a-zA-Z0-9_]+(\()+([a-zA-Z0-9_\-$,\s\"]?)+(\))(\;?)/', '', $input);
                }
                $badVals = ['exec', '\\', '&amp;', '&#', '0x', '<script>', '</script>', '">', "'>"];
                $allowedTags = '<p><br><img><label><input><textarea><div><span><a><strong><i><u><em>';
                $input = str_replace($badVals, '', $input);
                $input = preg_replace('/%[a-zA-Z0-9]{2}/', '', $input);
                $input = strip_tags(trim($input), $allowedTags);

                if ($textOnly) {
                    $input = str_replace(['<', '>', "'", '"'], '', $input);
                }
            }
        } else {
            return $this->sanitizeRecursive($input, [], $textOnly, $removeFunctions);
        }

        return $input;
    }

    /**
        * This function accepts multi-dimensional array that will be recursively checked and sanitize it's value so that
        * it will removes all suspicious XSS value and SQL injection value
        *
        * @param $arrayVal
        * @param array $exclude - if you want to exclude a certain value, then you must put the name of the value that you want to exclude
        * @param bool $textOnly - set to "true" if you want to remove all special characters and retain only alphanumeric characters.
        * @param bool $removeFunctions - set to "false" if you don't want to remove function names that may lead to XSS injection
        *
        * @return array
        */
    public function sanitizeRecursive($arrayVal, $exclude = [], $textOnly = false, $removeFunctions = true)
    {
        $array = [];
        foreach ($arrayVal as $key => $value) {
            if (is_array($value)) {
                $children = $this->sanitizeRecursive($value, $exclude, $textOnly, $removeFunctions);
                $array[$key] = $children;
            } else {
                if (!in_array($key, $exclude)) {
                    $value = $this->sanitize($value, $textOnly, $removeFunctions);
                    $array[$key] = $value;
                } else {
                    $array[$key] = $value;
                }
            }
        }

        return $array;
    }

    /**
        * Maps through all array and converts objects into array if found
        *
        * @param $content
        *
        * @return array
        */
    public function convertObjectToArray($content)
    {

        if (is_object($content)) {
            $content = $content->getArrayCopy();
        }

        if (is_array($content)) {
            $new = [];

            foreach ($content as $key => $val) {
                $new[$key] = $this->convertObjectToArray($val);
            }

        } else {
            $new = $content;
        }

        return $new;
    }

    /**
        * This returns a CSV file, this function must be used on return
        * so it will return a CSV file
        *
        * @param $fileName
        * @param $data
        *
        * @return HttpResponse
        */
    public function exportCsv($fileName, $data)
    {
        $response = new HttpResponse();
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $csvConfig = $melisCoreConfig->getItem('meliscore/datas/default/export/csv');
        $separator = $csvConfig['separator'];
        $enclosed = $csvConfig['enclosed'];

        if (is_array($data)) {

            // sanitize and convert to UTF-8
            $rData = [];

            foreach ($data as $idx => $arrData) {
                if (is_array($arrData)) {
                    $rData[] = array_map(function ($d) {
                        $n = $this->sanitize($d);
                        $n = mb_convert_encoding($n, 'UTF-16LE', 'UTF-8');

                        return $n;
                    }, $arrData);
                }
            }


            $handler = fopen('php://output', 'w');
            ob_start();
            foreach ($rData as $idx => $childData) {
                fputcsv($handler, $childData, $separator, $enclosed);
            }
            fclose($handler);

            $content = ob_get_clean();

            $headers = $response->getHeaders();
            $headers->addHeaderLine('Content-Type', 'text/csv; charset=utf-8');
            $headers->addHeaderLine('Content-Disposition', "attachment; filename=\"" . $fileName . "\"");
            $headers->addHeaderLine('Accept-Ranges', 'bytes');
            $headers->addHeaderLine('Content-Length', strlen($content));
            $response->setHeaders($headers);
            $response->setContent($content);

        }

        return $response;

    }

    /**
        * Import CSV via file
        *
        * @param $file
        *
        * @return array
        */
    public function importCsv($file)
    {
        $melisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $csvConfig = $melisCoreConfig->getItem('meliscore/datas/default/export/csv');
        $separator = $csvConfig['separator'];
        $enclosed = $csvConfig['enclosed'];

        $row = 1;
        $data = [];
        if (file_exists($file)) {
            if (($handle = fopen($file, "r")) !== false) {
                while (($csvData = fgetcsv($handle, 0, $separator)) !== false) {

                    $num = count($csvData);

                    for ($c = 0; $c < $num; $c++) {
                        $data[$row][] = mb_convert_encoding($csvData[$c], 'UTF-16LE', 'UTF-8');

                    }
                    $row++;
                }
                fclose($handle);
            }
        }

        return $data;
    }

    /**
        * Check if the platform has connected to internet
        * 
        * @return bool
        */
    public function isConnected()
    {
        $connected = @fsockopen("www.google.com", 80);
        //website, port  (try 80 or 443)
        if ($connected) {
            $isCon = true; //action when connected
            fclose($connected);
        } else {
            $isCon = false; //action in connection failure
        }

        return $isCon;
    }

    /**
        * Retrieve table configuration
        */
    public function getTableConfig()
    {
        return $this->_appConfig['table'];
    }

    /**
        * Programmatically modify the table configuration during runtime
        * to fit the module's needs
        *
        * @param array $tableConfig
        */
    public function setTableConfig(array $tableConfig = [])
    {
        $this->_appConfig['table'] = $tableConfig;
    }

    /**
        * Detect if the user agent is mobile or not
        * @return false|int
        */
    public function isMobileDevice()
    {
        return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
    }

    /**
     * @param string $s
     * @return string
     */
    public function iso8859_1ToUtf8(string $s): string {
        $s .= $s;
        $len = \strlen($s);

        for ($i = $len >> 1, $j = 0; $i < $len; ++$i, ++$j) {
            switch (true) {
                case $s[$i] < "\x80": $s[$j] = $s[$i]; break;
                case $s[$i] < "\xC0": $s[$j] = "\xC2"; $s[++$j] = $s[$i]; break;
                default: $s[$j] = "\xC3"; $s[++$j] = \chr(\ord($s[$i]) - 64); break;
            }
        }

        return substr($s, 0, $j);
    }

    /**
     * @param $dateTime
     * @param null $dateType
     * @param null $timeType
     * @param null $timezone
     * @param null $calendar
     * @param null $pattern
     * @return string
     */
    public function formatDate($dateTime, $dateType = null, $timeType = null, $timezone = null, $calendar = null, $pattern = null)
    {
        if(!empty($dateTime)) {
            $container = new Container('meliscore');
            $locale = $container['melis-lang-locale'];

            if (empty($dateType))
                $dateType = \IntlDateFormatter::LONG;

            if (empty($timeType))
                $timeType = \IntlDateFormatter::MEDIUM;

            $formatter = new \IntlDateFormatter($locale, $dateType, $timeType, $timezone, $calendar, $pattern);
            return $formatter->format($dateTime);
        }
        return null;
    }
}
