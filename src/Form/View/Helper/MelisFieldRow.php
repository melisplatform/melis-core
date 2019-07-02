<?php
namespace MelisCore\Form\View\Helper;
 
use Zend\Form\View\Helper\FormRow;
use Zend\Form\ElementInterface;
 
class MelisFieldRow extends FormRow
{
    const MELIS_TOGGLE_BUTTON_FACTORY = 'switch';
    const MELIS_SELECT_FACTORY        = 'select';
    const MELIS_MULTI_VAL_INPUT       = 'melis-multi-val-input';
    const MELIS_DRAGGABLE_INPUT       = 'melis-draggable-input';
    const MELIS_COMMERCE_DATE         = 'melis-date';
    const MELIS_COLOR_PICKER          = 'color-picker';
    const MELIS_INPUT_GROUP_BUTTON    = 'melis-input-group-button';
    const MELIS_TEXT_REQUIRED         = 'required';
    const MELIS_TEXT_WITH_BUTTON      = 'MelisTextButton';
    const MELIS_MSGR_MSG_BOX         = 'melis-messenger-msg-box';
 
	public function render(ElementInterface $element, $labelPosition = null)
	{
	    $translator = $this->getTranslator();


	    if (empty($element->getAttribute('id'))){
            /**
             *  Firefox warning issue if the label attribute "for" is empty
             *  resulting "Empty string passed to getElementById()." on console
             *  If the element has not value '' this will completely remove from element
             */
            $element->removeAttribute('id');
        }

	    if ($element->getAttribute('required') == self::MELIS_TEXT_REQUIRED){

	        $element->setLabelOptions(['disable_html_escape' => true]);
	        $label = $element->getLabel().' *';
	        $element->setLabel($label);
	    }
	    
	    if(!empty($element->getOption('tooltip'))){
            if (strpos($element->getOption('tooltip'), 'tr_') === false) {
                $element->setLabelOptions(['disable_html_escape' => true]);
                $label = $element->getLabel().'<i class="fa fa-info-circle fa-lg pull-right tip-info" data-toggle="tooltip" data-placement="left" title="" data-original-title="'.$element->getOption('tooltip').'"></i>';
                $element->setLabel($label);
            }
	    }
	    
	    if (!empty($element->getOption('open_tool'))){

	        $toolConfig = $element->getOption('open_tool');
	         
	        $element->setLabelOptions(['disable_html_escape' => true]);
	        $label = $element->getLabel().'<i class="fa fa-wrench fa-lg pull-right melis-opentools m-dnd-tool-open" data-toggle="tooltip" data-placement="left" title="" data-original-title="'.$toolConfig['tooltip'].'"
	            data-tool-icon="'.$toolConfig['tool_icon'].'"
                data-tool-name="'.$toolConfig['tool_name'].'"
                data-tool-id="'.$toolConfig['tool_id'].'"
                data-tool-meliskey="'.$toolConfig['tool_meliskey'].'"
	            ></i>';
	         
	        $element->setLabel($label);
	    }

	    if ($this->getClass($element) == self::MELIS_TOGGLE_BUTTON_FACTORY){

	        // recreate checkbox to render into a toggle button
	        $markup = '<div class="make-switch" data-on="1" data-off="0"><input type="%s" class="switch" name="%s" id="%s" value="%s" onchange="%s" %s></div>';
	        $attrib = $element->getAttributes();
	        $value  = $element->getValue();
	        $isChecked = !empty($value) ? 'checked' : '';
	        $toggleButton = sprintf($markup, $attrib['type'], $attrib['name'], $attrib['id'], $value, $attrib['onchange'], $isChecked);
	        
	        // disect label and element so it would not be included in the switch feature
	        $formElement = '<div class="form-group"><label for="'.$attrib['name'].'">'.$element->getLabel().'</label> '.$toggleButton.'</div>';

	    }elseif ($element->hasAttribute('meliscore-user-select2')){

            $slct2Id = 'selec2-'.uniqid();
            $element->setEmptyOption('tr_meliscore_common_choose');
            $attrib = $element->getAttributes();
	        $element->setAttribute('data-slct2-id', $slct2Id);
            $formElement = '<div class="form-group">
    	                       '.parent::render($element).'
	                        </div>';
            $formElement .= '<script type="text/javascript">';
            $formElement .= '$("select[data-slct2-id=\''.$slct2Id.'\']").select2();';
            $formElement .= '$("select[data-slct2-id=\''.$slct2Id.'\']").next("span").css("width", "100%");';
            $formElement .= '</script>';

        }elseif ($element->hasAttribute('meliscore-tinymce-textarea')){

            $tinyceId = 'tinyce-textarea-'.uniqid();
            $attrib = $element->getAttributes();
	        $element->setAttribute('id', $tinyceId);
	        $element->setAttribute('data-tinymce-id', $tinyceId);
            $formElement = '<div class="form-group">
    	                       '.parent::render($element).'
	                        </div>';
            $formElement .= '<script type="text/javascript">';
            $formElement .= 'melisTinyMCE.createTinyMCE("tool", "textarea[data-tinymce-id=\''.$tinyceId.'\']", {height: 200, relative_urls: false,  remove_script_host: false, convert_urls : false});';
            $formElement .= '</script>';

        }elseif (!empty($element->getOption('switch_options'))){

            $switchId = $element->getAttribute('id').uniqid();
            $switchOptions = $element->getOption('switch_options');
            if (empty($switchOptions['label']) && $switchOptions['icon'])
                $switchLabel = 'data-label-icon="glyphicon glyphicon-resize-horizontal"';
            else
                $switchLabel = !empty($switchOptions['label']) ? 'data-label="'.$switchOptions['label'].'"' : 'data-label-icon="'. $switchOptions['icon'] .'"';

            $lable = $element->getLabel();
            $element->setLabel("");

            $switch  = '<div class="form-group">';
            $switch .= '<label for="'.$element->getName().'">'. $lable .'</label>';
            $switch .= '   <div id="'. $switchId .'" class="make-switch" data-on-label="'. $switchOptions['label-on'] .'" data-off-label="'. $switchOptions['label-off'] .'" '.$switchLabel.'>';
            $switch .= parent::render($element);
            $switch .= '    </div>';
            $switch .= '</div>';
            $switch .= '<script type="text/javascript">';
            $switch .= ' $("#'. $switchId .'").bootstrapSwitch();';
            $switch .= '</script>';

            $formElement = $switch;

        }elseif (!empty($element->getOption('filestyle_options'))){

            $unqSlctor = $element->getAttribute('id').uniqid();
            $element->setAttribute('data-selector', $unqSlctor);
            $element->setAttribute('data-buttonText', $element->getAttribute('id'));
            $element->setAttribute('class', 'form-control');
            $element->setAttribute('id', $unqSlctor);
            $element->setAttribute('data-value', $element->getValue());

            $options = $element->getValue() ? ['placeholder' => $element->getValue()] : [];

            if (!empty($element->getOptions()['filestyle_options']))
                $options = array_merge($element->getOptions()['filestyle_options'], $options);

            $formElement = '<div class="form-group">';
            $formElement .= parent::render($element);
            $formElement .= '<script type="text/javascript">';
            $formElement .= '$("input[data-selector=\''. $unqSlctor .'\']").filestyle('. json_encode($options) .')';
            $formElement .= '</script>';
            $formElement .= '</div>';

        }elseif (!empty($element->getOption('switchOptions'))){

            $switchId = $element->getAttribute('id');
            $isChecked = !empty($element->getValue())? 'checked' : '';
            $switchOptions = $element->getOption('switchOptions');
            $switchLabel = $switchOptions['label'] ?? $translator->translate('tr_meliscore_tool_user_col_status');
            $switch  = '<div class="form-group">';
            $switch .= '<label for="'.$element->getName().'">'. $element->getLabel() . '</label>';
            $switch .= '    <div id="'. $switchId .'" class="make-switch" data-on-label="'. $switchOptions['label-on'] .'" data-off-label="'. $switchOptions['label-off'] .'" data-text-label="'. $switchLabel .'">';
            $switch .= '       <input type="checkbox" name="'.$element->getName().'" id="'.$element->getName().'" '.$isChecked.' value="1">';
            $switch .= '    </div>';
            $switch .= '    <script type="text/javascript">$("#'. $switchId .'").bootstrapSwitch();</script>';
            $switch .= '</div>';

            $formElement = $switch;

        }elseif ($element->getAttribute('type') == self::MELIS_SELECT_FACTORY) {

	        // render to bootstrap select element
            $elementClass = $element->getAttribute('class');
            $elementClass = implode(' ', ['form-control', $elementClass]);

    		$element->setAttribute('class', $elementClass);
    		$element->setLabelOption('class','col-sm-2 control-label');

    		if ($element->getOption('form_type') == 'form-horizontal') {
                $elementHelper       = $this->getElementHelper();
                $elementString = str_replace('id="'. $element->getAttribute('id') .'"', "", $elementHelper->render($element));

                //add style
                $newElementString = substr_replace($elementString, 'style="border-radius:0px;border-color:#e5e5e5"',50, 0);
                $formElement = '<div class="form-group">
	                                <label for=" ' . $element->getName() . ' " class="col-sm-2 control-label"> ' . $element->getOption('label') . ' </label>
	                                <div class="col-sm-10">'
	                                    . $newElementString .
	                                '</div>
                            	</div>';
            }else{
                $formElement = '<div class="form-group">' . parent::render($element, $labelPosition) . '</div>';
            }

	    }elseif ($element->getAttribute('class') == self::MELIS_MULTI_VAL_INPUT){

	        // Get Value
	        $dataTags = $element->getValue();
	        // Set Input to Null value as default
	        $element->setAttribute('value', null);
	            
            $label = '<label for="tags">' . $element->getAttribute('data-label-text') . '</label>';
            $getTags = explode(',', $dataTags);
            $ulStart = '<ul class="multi-value-input clearfix">';
            $ulEnd   = '</ul>';
            $liSpan  = '<li><span>%s</span><a class="remove-tag fa fa-times"></a></li>';
            $liInput = '<li class="tag-creator">' . parent::render($element, $labelPosition) . '</li>';
            $tagItems= '';
            
            $multiValElement = $label . $ulStart.'';
            if(!empty($dataTags)) 
	            foreach($getTags as $tagValues) 
	                $tagItems .= sprintf($liSpan, $tagValues);

            $multiValElement .=  $tagItems . $liInput. $ulEnd;
            
            $formElement = '<div class="form-group">' . $multiValElement . '</div>';

	    }elseif (strpos($element->getAttribute('class'), self::MELIS_DRAGGABLE_INPUT)){

	        $isDraggable = $element->getAttribute('data-draggable');
	        
	        if ($isDraggable){
	            $element->setLabel('');
	            $formElement = '<div class="input-group melis-draggable-input">
	                               '.parent::render($element, $labelPosition).'
                            	<span class="input-group-addon bg-primary"><i class="fa fa-arrows fa-lg" aria-hidden="true"></i></span>
                            </div>';
	        }else{
	            $formElement = '<div class="form-group">'. parent::render($element, $labelPosition).'</div>';
	        }

	    }elseif (strpos($element->getAttribute('class'), self::MELIS_COMMERCE_DATE)){

	        $label = $element->getLabel();
	        $element->setLabel('');
	        $attrib = $element->getAttributes();
	        $formElement = '<div class="form-group">
    	                       <label for="'.$element->getName().'">'.$label.'</label>
    	                        <div class="input-group date '.$attrib['dateId'].'">
    	                        '.parent::render($element).'
                                    <span class="input-group-addon">
                                        <span class="glyphicon glyphicon-calendar"></span>
                                    </span>
                                </div>
	                        </div>';

	    }elseif ($element->hasAttribute('meliscore-datetimepicker')){

            $datePickerId = 'datetimepicker-'.uniqid();
            $label = $element->getLabel();
            $element->setLabel('');
            $icon = (!empty($element->getOption('icon'))) ? $element->getOption('icon') : 'glyphicon glyphicon-calendar';
            $element->setAttributes(['autocomplete' => 'off']);
            $formElement = '<div class="form-group">
    	                       <label for="'.$element->getName().'">'.$label.'</label>
    	                        <div class="input-group date" id="'.$datePickerId.'">
    	                        '.parent::render($element).'
                                    <span class="input-group-addon">
                                        <span class="'.$icon.'"></span>
                                    </span>
                                </div>
	                        </div>';
            $defaultFormat = 'YYYY-MM-DD HH:mm:ss';
            if ($element->hasAttribute('melis-datepicker')){
                $defaultFormat = 'YYYY-MM-DD';
            }
            $elemOption = $element->getOptions();
            $dateFormat = (!empty($element->getOption('format'))) ? $element->getOption('format') : $defaultFormat;
            $formElement .= '<script type="text/javascript">';
            $formElement .= '$("#'.$datePickerId.'").datetimepicker({format: "'.$dateFormat.'"});';
            $formElement .= '</script>';

        }elseif ($element->getAttribute('class') == self::MELIS_COLOR_PICKER){

	        $attrib = $element->getAttributes();
	        $formElement = '<div class="form-group">
                                <label for="'.$element->getName().'">'.$element->getLabel().'</label>
                                <div class="input-group colorpicker-component '.$attrib['name'].'">
                                     <input type="text" name="'.$attrib['name'].'" value="" class="form-control" />
                                    <span class="input-group-addon"><i></i></span>
                                </div>
	                        </div>';

	    }elseif (!empty($element->getOption('button'))){
	        
	        $label = $element->getLabel();
	        $element->setLabel('');
	        $attrib = $element->getAttributes();
	        $formElement = '<div class="form-group">
    	                       <label for="'.$element->getName().'">'.$label.'</label>
    	                        <div class="form-group input-group '.$element->getOption('button-class').'" id="'.$element->getOption('button-id').'">
    	                        '.parent::render($element).'
                                    <span class="input-group-addon input-button-hover-pointer">
                                        <span class="'.$element->getOption('button').'"></span>
                                    </span>
                                </div>
	                        </div>';

	    }elseif ($element->getAttribute('class') == self::MELIS_INPUT_GROUP_BUTTON){

	        $type = $element->getAttribute('data-button-right');
	        
	        $buttonIcon = 'fa fa-search';
	        if (!empty($element->getAttribute('data-button-icon')))
	            $buttonIcon = $element->getAttribute('data-button-icon');

	        $buttonId = $element->getAttribute('name').'-button';
	        if ($element->getAttribute('data-button-id'))
	            $buttonId = $element->getAttribute('data-button-id');

	        $buttonClass = '';
	        if ($element->getAttribute('data-button-class'))
	            $buttonClass = $element->getAttribute('data-button-class');

	        $buttonTitle = '';
	        if ($element->getAttribute('data-button-title'))
	            $buttonTitle = $element->getAttribute('data-button-title');

	        $formElement = '<div class="form-group">
	                            <label for="">'.$element->getLabel().'</label>
	                            <div class="input-group">';
	                                
            if ($type == true)
                $formElement .='<span class="input-group-btn">
                                   <button class="btn btn-default" id="'.$buttonId.'" type="button" title="'.$buttonTitle.'"><i class="'.$buttonIcon.'"></i></button>
                                </span>';

            $inputAttr = [];
            foreach ($element->getattributes() As $key => $val)
                if ($key == 'class')
                    array_push($inputAttr, $key.'="form-control '.$val.'"');
                else
                    array_push($inputAttr, $key.'="'.$val.'"');

            $formElement .= '<input '.implode(' ', $inputAttr).' value="'.$element->getValue().'">';

            if (empty($type))
                $formElement .='<span class="input-group-btn">
                                   <button class="btn btn-default '.$buttonClass.'" id="'.$buttonId.'" type="button" title="'.$buttonTitle.'"><i class="'.$buttonIcon.'"></i></button>
                                </span>';

            $formElement .= '</div>
	                        </div>';

	    }elseif(strpos($element->getAttribute('class'), self::MELIS_MSGR_MSG_BOX)){

            $element->setLabel('');
            $formElement = '<div class="row msg-chat-no-padding">
                                <div class="col-lg-11 col-md-10 col-sm-11">
								    '.parent::render($element).'
								</div>    
								<div class="col-lg-1 col-md-2 col-sm-1">
									 <button id="btn-send-message" type="submit" class="btn btn-primary"><i class="fa fa-paper-plane fa-2x"></i></button>
								</div>
							</div>';

	    }elseif ($element->getOption('form_type') == 'form-horizontal'){

            $formElement = '<div id="' . $element->getAttribute('id') . '" class="form-group">
                                <label for=" ' . $element->getName() . ' " class="col-sm-2 control-label"> ' . $element->getOption('label') . ' </label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" name="' . $element->getName() . '">
                                </div>
                            </div>';

        }elseif ($element->getAttribute('type') != 'hidden'){

	        $formElement = '<div class="form-group ' . $element->getOption('form_type') . '">'. parent::render($element, $labelPosition).'</div>';

	    }else{

	        $formElement = parent::render($element, $labelPosition);

	    }
	    
		return $formElement;
	}
	
	/**
	 * Returns the class attribute of the element
	 * @param ElementInterface $element
	 * @return String
	 */
	protected function getClass(ElementInterface $element)
	{
	    return $element->getAttribute('class');
	}
}
