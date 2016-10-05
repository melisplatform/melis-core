<?php
namespace MelisCore\View\Helper;

use Zend\View\Helper\AbstractHelper;

/**
 * Renders a bootstrap Modal with Tabs
 *
 */
class MelisModal extends AbstractHelper
{
    protected $_modal;
    protected $_modalId;
    protected $_tabs;
    protected $_contents;
    protected $_defaultTab = 0;
    protected $_hasCloseButton = false;
    protected $_attributes = '';
    
    /**
     * Sets the ID of the modal
     * @param string $id
     */
    public function setModalId($id = 'modal-id')
    {
        $this->_modalId = $id;
    }
    
    /**
     * Returns the ID of the modal
     * @return string
     */
    public function getModalId()
    {
        return $this->_modalId;
    }
    
    public function setAttributes($attrib = array()) 
    {
        
        $tmpAttrib = '';
        
        if(is_array($attrib)) {
            foreach($attrib as $attrKey => $attrVal) {
                $tmpAttrib .= $attrKey . '="' . $attrVal . '" ';
            }
        }
        
        $this->_attributes = $tmpAttrib;
    }
    
    public function getAttributes()
    {
        return $this->_attributes;
    }
    
    /**
     * @deprecated
     * Sets the Tab & Contents of the Modal
     * Format
     * setTabs(array(
     *      'Tab1' => array(
     *          'target' => 'tab-1',
     *          'class' => 'glyphicons user',
     *          'header' => 'Heading',
     *          'value' => 'Personal details'
     *      ),
     *      'Tab2' => array(
     *          'target' => 'tab-1',
     *          'class' => 'glyphicons user',
     *          'header' => '',
     *          'value' => 'Personal details'
     *      ),
     *      
     * ));
     * @param array $tabs
     */
    public function setTabs(array $tabs, $activeTab = '')
    {
        $loopCtr = 0;
        $active  = 'class="active"';
        $this->_defaultTab = $this->getTabPosition($tabs, $activeTab);
        if($tabs && is_array($tabs))
        {
            foreach($tabs as $attrib => $values)
            {
                if($this->_defaultTab == $loopCtr)
                {
                    $this->_tabs .= '<li '.$active.'><a href="#'.$values['id'].'" class="'.$values['class'].'" data-toggle="tab"><i></i><span class="strong">'.$values['tab-header'].'</span>'.$values['tab-text'].'</a></li>';
                }
                else 
                {
                    $this->_tabs .= '<li><a href="#'.$values['id'].'" class="'.$values['class'].'" data-toggle="tab"><i></i><span class="strong">'.$values['tab-header'].'</span>'.$values['tab-text'].'</a></li>';
                }
                $loopCtr++;
            }
            $this->setContents($tabs);
        }  
    }
    
    /**
     * Sets a single tab in a modal without an active tab
     * @param array $tab
     */
    public function setTabContent(array $tab)
    {
        if($tab && is_array($tab)) {
            
            foreach($tab as $attrib => $values)
            {
                $this->_tabs .= '<li><a href="#'.$values['id'].'" class="'.$values['class'].'" data-toggle="tab"><i></i><span class="strong">'.$values['tab-header'].'</span>'.$values['tab-text'].'</a></li>';
            }
            $this->setContent($tab);
        }
    }
    
    /**
     *
     * Manually set which Tab should be active 
     * @param String $tabId
     */
    public function setActiveTab($tabId) 
    {
       //find the tab id in the tabs string
       $posTabText = strpos($this->_tabs, $tabId);
       $postContentText = strpos($this->_contents, '<div class="tab-pane" id="'.$tabId.'">');
       // for the tab
       if($posTabText !== false) {

           $capturedText = substr($this->_tabs, 0, $posTabText) . $tabId;
           $activeState  = str_replace('<li>', '<li class="active">', $capturedText);
           $reStateTab = $this->_tabs;
           $this->_tabs = str_replace($capturedText, $activeState, $reStateTab);
           
           // for the content
           $capturedContentText = substr($this->_contents, 0, $postContentText);
           $activeContentState  = str_replace('<div class="tab-pane" id="'.$tabId.'">', '<div class="tab-pane active" id="'.$tabId.'"  data-edited="true">', $capturedContentText);
           $reStateContent = $this->_contents;
           $this->_contents = str_replace($capturedContentText, $activeContentState, $reStateContent);
       }

    }
    
    /**
     * Returns the Tabs of the Modal
     * @return string
     */
    public function getTabs()
    {
        return '<div class="widget-head"><ul class="nav nav-tabs">'.$this->_tabs.'</ul></div>';
    }
    
    /**
     * Returns the position of the Tab you want to 
     * be selected.
     * @param array $tabs
     * @param String $tabValue
     * @return int
     */
    protected function getTabPosition(array $tabs, $tabValue)
    {
        $position = 0;
        $ctr = 0;
        foreach($tabs as $keys => $values)
        {
            if($keys == $tabValue)
            {
                $position = $ctr;
            }
            $ctr++;
        }
        return $position;
    }
    
    /**
     * Sets the contents of each Modal Tab
     * @param array $contents
     */
    protected function setContents(array $contents)
    {
        $loopCtr = 0;
        if($contents && is_array($contents))
        {
            foreach($contents as $attrib => $values)
            {
                if($this->_defaultTab == $loopCtr)
                {
                    $this->_contents .= '<div class="tab-pane active" id="'.$values['id'].'"><div class="row"><div class="col-md-12">'.$values['content'].'</div></div></div>';
                }
                else 
                {
                    $this->_contents .= '<div class="tab-pane" id="'.$values['id'].'"><div class="row"><div class="col-md-12">'.$values['content'].'</div></div></div>';
                }

                $loopCtr++;
            }
        }
        
    }
    
    /**
     * Sets the content of a specific tab
     * @param array $contents
     */
    protected function setContent(array $contents)
    {

        if($contents && is_array($contents))
        {
            foreach($contents as $attrib => $values)
            {
                $this->_contents .= '<div class="tab-pane" id="'.$values['id'].'"><div class="row"><div class="col-md-12">'.$values['content'].'</div></div></div>';
            }
        }
    }

    /**
     * Returns the contents of the Modal Tab
     * @return string
     */
    public function getContents()
    {
        return '<div class="widget-body innerAll inner-2x"><div class="tab-content">'.$this->_contents.'</div></div>';
    }
    
    /**
     * Used when you want to add a close button to your modal
     * @param bool $isVibible
     */
    public function hasCloseButton($isVibible) 
    {
        $this->_hasCloseButton =  $isVibible;
    }
    
    /**
     * Returns the close button of the modal
     * @return string
     */
    protected function getCloseButton()
    {
        $closeButton = '';
        if($this->_hasCloseButton) {
            $closeButton = '
            <div class="modal-footer center margin-none">
            	<a href="#" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times"></i> Close</a>
            </div>';
        }

       return $closeButton;
    }
    
    /** 
     * Renders all config that has been set to create a modal
     * @return string
     */
    public function renderModal()
    {
        $this->_modal = '
        <div class="tooltabmodal modal fade" id="'.$this->getModalId().'" aria-hidden="true" style="display: none; " '. $this->getAttributes() . '>
        	<div class="modal-dialog">
        		<div class="modal-content">
        			<div class="modal-body padding-none">
        				<div class="wizard">
        					<div class="widget widget-tabs widget-tabs-double widget-tabs-responsive margin-none border-none">
                                '. $this->getTabs() .'
                                '. $this->getContents() .'
        					</div>
        				</div>
        			</div>
                    '.$this->getCloseButton().'
        		</div>
        	</div>
        </div>';
        
        return $this->_modal;
    }
}