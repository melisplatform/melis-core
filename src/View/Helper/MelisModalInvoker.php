<?php
namespace MelisCore\View\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * Creates an anchor link button to open a Modal 
 *
 */
class MelisModalInvoker extends AbstractHelper
{
    protected $_button = '';
    
    const MELIS_MODAL_INVOKER_DISMISS = 'data-bs-dismiss';
    const MELIS_MODAL_INVOKER_INVOKE  = 'data-bs-toggle';
    
    /**
     * Renders an anchored link element that will target a modal to invoke<br/>
     * You can put unlimited numbers of attributes and it will be dynamically added<br/>
     * to anchored link element.
     * 
     * @param array $attribs
     * @param string $type - accepted values `invoke` and `dismiss`
     * @return string
     */
    public function render(array $attribs, $type = 'invoke')
    {
        // add another array for targetting a modal
        $additionalAttrib = ($type == 'invoke') ? array(self::MELIS_MODAL_INVOKER_INVOKE => 'modal') : array(self::MELIS_MODAL_INVOKER_DISMISS => 'modal');
        $attr = '';
        
        if($attribs && is_array($attribs)) {
            
            // merge the additional attribute to target modal
            $newAttribs = array_merge($additionalAttrib, $attribs); 
            
            foreach($newAttribs as $attribKey => $attribValue) {
                
                // text will be added on a separate process, so only <a> attributes will be added here
                if($attribKey != 'text')
                    $attr .= $attribKey . ' ="' . $attribValue . '" ';
            }
            
        }
        
        $this->_button = '<a ' . $attr . '>' . $newAttribs['text'] . '</a>';
        
        return $this->_button;
        
    }
}