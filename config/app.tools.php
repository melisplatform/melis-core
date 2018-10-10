<?php

return array( 
    'plugins' => array(
        'melisModuleDiagnostics' => array(
            'conf' => array(
                // user rights exclusions
                'rightsDisplay' => 'none',
            ),
            'tools' => array(
                'melis_module_diagnostic_tool_config' => array(
                    'conf' => array(
                        'title' => 'tr_melis_module_diagnostics_title',
                        'id' => ''
                    ),
                ),
            ),
        ),
        'meliscore' => array(
            'tools' => array(
                'meliscore_tool_user' => array(
                    'conf' => array(
                        'title' => 'tr_meliscore_tool_user',
                        'id' => 'id_meliscore_tool_user_management',
                    ),
                    'table' => array(
                        // table ID
                        'target' => '#tableToolUserManagement',
                        'ajaxUrl' => '/melis/MelisCore/ToolUser/getUser',
                        'dataFunction' => '',
                        'ajaxCallback' => 'initRetrieveUser()', 
                        'filters' => array(
                            'left' => array(
                                'tooluser-limit' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-limit'
                                ),
                            ),
                            'center' => array(
                                'tooluser-search' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-search'
                                ),
                            ),
                            'right' => array(
                                'tooluser-export' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-export'
                                ),
                                'tooluser-refresh' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-refresh'
                                ),
                            ),
                        ),
                        'columns' => array(
                            'usr_id' => array(
                                'text' => 'tr_meliscore_tool_user_col_id',
                                'css' => array('width' => '1%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'usr_login' => array(
                                'text' => 'tr_meliscore_tool_user_col_username',
                                'css' => array('width' => '10%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'usr_is_online' => array(
                                'text' => 'tr_meliscore_tool_user_col_power tooltip',
                                'css' => array('width' => '1%', 'padding-right' => '0'),
                                'sortable' => false,

                            ),
                            'usr_status' => array(
                                'text' => 'tr_meliscore_tool_user_col_status',
                                'css' => array('width' => '1%', 'padding-right' => '0'),
                                'sortable' => false,
                                
                            ),
                            'usr_image' => array(
                                'text' => 'tr_meliscore_tool_user_col_profile',
                                'css' => array('width' => '1%', 'padding-right' => '0'),
                                'sortable' => false,
                                
                            ),
                            'usr_email' => array(
                                'text' => 'tr_meliscore_tool_user_col_Email',
                                'css' => array('width' => '25%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'usr_firstname' => array(
                                'text' => 'tr_meliscore_tool_user_col_name',
                                'css' => array('width' => '25%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                            'usr_last_login_date' => array(
                                'text' => 'tr_meliscore_tool_user_col_last_login',
                                'css' => array('width' => '20%', 'padding-right' => '0'),
                                'sortable' => true,
                                
                            ),
                        ),
                    
                        // define what columns can be used in searching
                        'searchables' => array('usr_id', 'usr_status', 'usr_login', 'usr_email','usr_firstname','usr_lastname','usr_last_login_date','usr_email'),
                        'actionButtons' => array(
                            'edit' => array(
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-content-action-edit',
                            ),
                            'delete' => array(
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-content-action-delete',
                            ),
                        )
                    ),
                    'export' => array(
                        'csvFileName' => 'meliscore_user_export.csv',  
                    ),


                    
                    'modals' => array(
                        'meliscore_tool_user_empty_modal' => array( // empty modal content
                            'id' => 'id_meliscore_tool_user_empty_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => 'tr_meliscore_tool_user',
                            'tab-text' => 'tr_meliscore_tool_user_modal_empty',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-empty'
                            ),
                        ),
                        'meliscore_tool_user_new_modal' => array( // add new user
                            'id' => 'id_meliscore_tool_user_new_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_new',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-new'
                            ),
                        ),
                        'meliscore_tool_user_new_rights_modal' => array( // rights for the new user
                            'id' => 'id_meliscore_tool_user_new_rights_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_new_rights',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-new-rights'
                            ),
                        ),
                        'meliscore_tool_user_edit_modal' => array( // edit user's information modal content
                            'id' => 'id_meliscore_tool_user_edit_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_modal_edit',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-edit'
                            ),
                        ),
                        'meliscore_tool_user_rights_modal' => array( // rights modal content
                            'id' => 'id_meliscore_tool_user_rights_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_modal_rights',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-rights'
                            ),
                        ),
                        'meliscore_tool_user_view_date_connection_modal' => array(
                            'id' => 'id_meliscore_tool_user_view_date_connection_modal',
                            'class' => 'glyphicons list',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_view_date_connection',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-view-date-connection-modal'
                            ),
                        ),

                        'meliscore_tool_user_microservice_modal' => array(
                            'id' => 'id_meliscore_tool_user_microservice_modal',
                            'class' => 'glyphicons cogwheels',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_microservice_tab_title',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'MelisCoreMicroService',
                                'action' => 'render-tool-user-view-micro-service-modal'
                            ),
                        ),

                    ),
                    
                    'forms' => array(
                        'meliscore_tool_user_form_new' => array(
                            'attributes' => array(
                                'name' => 'newusermanagement',
                                'id' => 'idnewusermanagement',
                                'method' => 'POST',
                                'enctype' => 'multipart/form-data',
                                'action' => '',
                                'novalidate' => 'novalidate',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'usr_login',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_username',
                                            'tooltip' => 'tr_meliscore_tool_user_col_username tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_login',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_username',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_status',
                                        'type' => 'Zend\Form\Element\Select',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_status',
                                            'tooltip' => 'tr_meliscore_tool_user_col_status tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'disable_inarray_validator' => true,
                                            'value_options' => array(
                                                '0' => 'tr_meliscore_common_inactive',
                                                '1' => 'tr_meliscore_common_active',
                                            ),
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_status',
                                            'value' => '',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_email',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_Email',
                                            'tooltip' => 'tr_meliscore_tool_user_col_Email tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_email',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_Email',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_password',
                                        'type' => 'Password',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_password tooltip',
                                            'label_options' => array(
                                                'disable_html_escape' => true,
                                            )
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_password',
                                            'class' => 'form-control',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_confirm_password',
                                        'type' => 'Password',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_confirm_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_confirm_password tooltip',
                                            'label_options' => array(
                                                'disable_html_escape' => true,
                                            )
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_confirm_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_confirm_password',
                                            'class' => 'form-control',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_firstname',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_first_name',
                                            'tooltip' => 'tr_meliscore_tool_user_col_first_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_firstname',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_first_name',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_lastname',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_last_name',
                                            'tooltip' => 'tr_meliscore_tool_user_col_last_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_lastname',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_last_name',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_lang_id',
                                        'type' => 'MelisCoreLanguageSelect',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_form_language',
                                            'tooltip' => 'tr_meliscore_tool_user_form_language tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'disable_inarray_validator' => true,
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_lang_id',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_admin',
                                        'type' => 'MelisText',
                                        'options' => array(),
                                        'attributes' => array(
                                            'class' => 'usr_admin',
                                            'id' => 'n_usr_admin',
                                            'data-label' => 'tr_meliscore_tool_user_col_admin',
                                            'data-tooltip' => 'tr_meliscore_tool_user_col_admin tooltip',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_image',
                                        'type' => 'file',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_profile',
                                            'tooltip' => 'tr_meliscore_tool_user_col_profile tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_n_usr_image',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_profile',
                                            'onchange' => 'toolUserManagement.imagePreview("#new-profile-image", this);',
                                            'class' => 'filestyle',
                                            'data-buttonText' => 'Select Image',
                                        ),
                                    ),
                                ),
                            ), // end elements
                            'input_filter' => array(
                                'usr_login' => array(
                                    'name'     => 'usr_login',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_login_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_login_error_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'regex', false,
                                            'options' => array(
                                                'pattern' => '/^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$/',
                                                'messages' => array(\Zend\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_login_invalid'),
                                                'encoding' => 'UTF-8',
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),  
                                'usr_status' => array(
                                    'name'     => 'usr_status',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_status_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'InArray',
                                            'options' => array(
                                                'haystack' => array(1, 0),
                                                'messages' => array(
                                                    \Zend\Validator\InArray::NOT_IN_ARRAY => 'tr_meliscore_tool_user_usr_status_error_invalid',
                                                ),
                                            )
                                        ),
                                    ),
                                    'filters'  => array(
                                    ),
                                ),

                                'usr_email' => array(
                                    'name'     => 'usr_email',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_email_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'EmailAddress',
                                            'options' => array(
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_meliscore_tool_user_invalid_email',
                                            )
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_password' => array(
                                    'name'     => 'usr_password',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_password_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => '\MelisCore\Validator\MelisPasswordValidator',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'min' => 8,
                                                'messages' => array(
                                                    \MelisCore\Validator\MelisPasswordValidator::TOO_SHORT => 'tr_meliscore_tool_user_usr_password_error_low',
                                                    \MelisCore\Validator\MelisPasswordValidator::NO_DIGIT => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                    \MelisCore\Validator\MelisPasswordValidator::NO_LOWER => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_password_error_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_confirm_password' => array(
                                    'name'     => 'usr_confirm_password',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_confirm_password_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => '\MelisCore\Validator\MelisPasswordValidator',
                                            'options' => array(
                                                'min' => 8,
                                                'messages' => array(
                                                    \MelisCore\Validator\MelisPasswordValidator::TOO_SHORT => 'tr_meliscore_tool_user_usr_confirm_password_error_low',
                                                    \MelisCore\Validator\MelisPasswordValidator::NO_DIGIT => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                    \MelisCore\Validator\MelisPasswordValidator::NO_LOWER => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_confirm_password_error_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_firstname' => array(
                                    'name'     => 'usr_firstname',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_firstname_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_firstname_error_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'regex', false,
                                            'options' => array(
                                                'pattern' => '/(\w)+/',
                                                'messages' => array(\Zend\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_firstname_invalid'),
                                                'encoding' => 'UTF-8',
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_lastname' => array(
                                    'name'     => 'usr_lastname',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lastname_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_lastname_error_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'regex', false,
                                            'options' => array(
                                                'pattern' => '/(\w)+/',
                                                'messages' => array(\Zend\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_lastname_invalid'),
                                                'encoding' => 'UTF-8',
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_lang_id' => array(
                                    'name'     => 'usr_lang_id',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lang_id_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'IsInt',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                    \Zend\I18n\Validator\IsInt::INVALID => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                )
                                            )
                                        ),
                                    ),
                                    'filters'  => array(
                                    ),
                                ),
                            ), // end input filter
                        ), // end new user form
                        'meliscore_tool_user_form_edit' => array(
                            'attributes' => array(
                                'name' => 'usermanagement',
                                'id' => 'idusermanagement',
                                'method' => 'POST',
                                'enctype' => 'multipart/form-data',
                                'action' => '',
                                'novalidate' => 'novalidate',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'usr_id',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_id',
                                            'tooltip' => 'tr_meliscore_tool_user_col_id tooltip',
                                            
                                        ),
                                        'attributes' => array(
                                            'id' => 'tool_user_management_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ),
                                    ),
                                ),
                                
                                array(
                                    'spec' => array(
                                        'name' => 'usr_login',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_username',
                                            'tooltip' => 'tr_meliscore_tool_user_col_username tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'tool_user_management_login',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ),
                                    ),
                                ),
                                
                                array(
                                    'spec' => array(
                                        'name' => 'usr_status',
                                        'type' => 'Zend\Form\Element\Select',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_status',
                                            'tooltip' => 'tr_meliscore_tool_user_col_status tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'value_options' => array(
                                                '0' => 'tr_meliscore_common_inactive',
                                                '1' => 'tr_meliscore_common_active',
                                            ),
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_status',
                                            'value' => '',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                
                                array(
                                    'spec' => array(
                                        'name' => 'usr_email',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_Email',
                                            'tooltip' => 'tr_meliscore_tool_user_col_Email tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_email',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_Email',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                
                                array(
                                    'spec' => array(
                                        'name' => 'usr_password',
                                        'type' => 'Password',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_password tooltip',
                                            'label_options' => array(
                                                'disable_html_escape' => true,
                                            )
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_confirm_password',
                                        'type' => 'Password',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_confirm_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_confirm_password tooltip',
                                            'label_options' => array(
                                                'disable_html_escape' => true,
                                            )
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_confirm_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ),
                                    ),
                                ),
                                
                                array(
                                    'spec' => array(
                                        'name' => 'usr_firstname',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_first_name',
                                            'tooltip' => 'tr_meliscore_tool_user_col_first_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_firstname',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_first_name',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),   
                                
                                array(
                                    'spec' => array(
                                        'name' => 'usr_lastname',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_last_name',
                                            'tooltip' => 'tr_meliscore_tool_user_col_last_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_lastname',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_last_name',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_lang_id',
                                        'type' => 'MelisCoreLanguageSelect',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_form_language',
                                            'tooltip' => 'tr_meliscore_tool_user_form_language tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'disable_inarray_validator' => true,
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_lang_id',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_admin',
                                        'type' => 'MelisText',
                                        'options' => array(),
                                        'attributes' => array(
                                            'id' => 'usr_admin',
                                            'class' => 'usr_admin',
                                            'data-label' => 'tr_meliscore_tool_user_col_admin',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_image',
                                        'type' => 'file',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_profile',
                                            'tooltip' => 'tr_meliscore_tool_user_col_profile tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_image',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_profile',
                                            'onchange' => 'toolUserManagement.imagePreview("#profile-image", this);',
                                            'class' => 'filestyle',
                                            'data-buttonText' => 'Select Image',
                                        ),
                                    ),
                                ),

                            ), // end edit elements
                            'input_filter' => array(
                                'usr_id' => array(
                                    'name'     => 'usr_id',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'IsInt',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_tool_user_usr_id',
                                                    \Zend\I18n\Validator\IsInt::INVALID => 'tr_meliscore_tool_user_usr_id',
                                                )
                                            )
                                        ),
                                    ),
                                    'filters' => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_status' => array(
                                    'name'     => 'usr_status',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_status_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'InArray',
                                            'options' => array(
                                                'haystack' => array(1, 0),
                                                'messages' => array(
                                                    \Zend\Validator\InArray::NOT_IN_ARRAY => 'tr_meliscore_tool_user_usr_status_error_invalid',
                                                ),
                                            )
                                        ),
                                    ),
                                    'filters'  => array(
                                    ),
                                ),
                                'usr_email' => array(
                                    'name'     => 'usr_email',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_email_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                          'name' => 'EmailAddress',
                                           'options' => array(
                                               'domain'   => 'true',
                                               'hostname' => 'true',
                                               'mx'       => 'true',
                                               'deep'     => 'true',
                                               'message'  => 'tr_meliscore_tool_user_invalid_email',
                                           )
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),

                                
                                'usr_firstname' => array(
                                    'name'     => 'usr_firstname',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_firstname_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_firstname_error_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'regex', false,
                                            'options' => array(
                                                'pattern' => '/(\w)+/',
                                                'messages' => array(\Zend\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_firstname_invalid'),
                                                'encoding' => 'UTF-8',
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_lastname' => array(
                                    'name'     => 'usr_lastname',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lastname_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_lastname_error_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'regex', false,
                                            'options' => array(
                                                'pattern' => '/(\w)+/',
                                                'messages' => array(\Zend\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_lastname_invalid'),
                                                'encoding' => 'UTF-8',
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_lang_id' => array(
                                    'name'     => 'usr_lang_id',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lang_id_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'IsInt',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                    \Zend\I18n\Validator\IsInt::INVALID => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                )
                                            )
                                        ),
                                    ),
                                    'filters'  => array(
                                    ),
                                ),
                            ), // end input filter
                        ), // end edit form
                    ), // end forms
                ),//end user tool management 
                'meliscore_user_profile_management' =>  array(
                    'forms' => array(
                        'meliscore_user_profile_form' => array(
                            'attributes' => array(
                                'name' => 'userprofilemanagement',
                                'id' => 'iduserprofilemanagement',
                                'method' => 'POST',
                                'enctype' => 'multipart/form-data',
                                'action' => '',
                                'novalidate' => 'novalidate',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'usr_email',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_Email',
                                            'tooltip' => 'tr_meliscore_tool_user_col_Email tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_profile_email',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_Email',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                
                                array(
                                    'spec' => array(
                                        'name' => 'usr_password',
                                        'type' => 'Password',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_password tooltip',
                                            'label_options' => array(
                                                'disable_html_escape' => true,
                                            )
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_profile_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_confirm_password',
                                        'type' => 'Password',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_col_confirm_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_confirm_password tooltip',
                                            'label_options' => array(
                                                'disable_html_escape' => true,
                                            )
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_profile_confirm_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_lang_id',
                                        'type' => 'MelisCoreLanguageSelect',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_user_form_language',
                                            'tooltip' => 'tr_meliscore_tool_user_form_language tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'disable_inarray_validator' => true,
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_usr_profile_lang_id',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'usr_image',
                                        'type' => 'file',
                                        'attributes' => array(
                                            'id' => 'id_usr_profile_image',
                                            'value' => '',
                                        ),
                                    ),
                                ),
                                
                            ), // end edit elements
                            'input_filter' => array(
                                'usr_email' => array(
                                    'name'     => 'usr_email',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_email_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'EmailAddress',
                                            'options' => array(
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_meliscore_tool_user_invalid_email',
                                            )
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'usr_lang_id' => array(
                                    'name'     => 'usr_lang_id',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lang_id_error_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'IsInt',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                    \Zend\I18n\Validator\IsInt::INVALID => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                )
                                            )
                                        ),
                                    ),
                                    'filters'  => array(
                                    ),
                                ),
                            ), // end input filter
                        ), // end user profile edit form
                    ),//end from
                ),// end user profile management
                // Platform Tool
                'meliscore_platform_tool' => array(
                    'conf' => array(
                        'title' => 'tr_meliscore_tool_platform_title',
                        'id' => 'id_meliscore_platform_tool',
                    ),
                    'table' => array(
                        'target' => '#tablePlatforms',
                        'ajaxUrl' => '/melis/MelisCore/Platforms/getPlatforms',
                        'dataFunction' => '',
                        'ajaxCallback' => 'initCorePlatformListTable()',
                        'filters' => array(
                            'left' => array(
                                'platform_limit' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Platforms',
                                    'action' => 'render-platform-content-filters-limit',
                                ),
                            ),
                            'center' => array(
                                'platform_search' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Platforms',
                                    'action' => 'render-platform-content-filters-search',
                                ),
                            ),
                            'right' => array(
                                'platform_refresh' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Platforms',
                                    'action' => 'render-platform-content-filters-refresh',
                                )
                            ),
                        ),
                        'columns' => array(
                            'plf_id' => array(
                                'text' => 'tr_meliscore_tool_platform_forms_id',
                                'css' => array('width' => '1%'),
                                'sortable' => true,
                            ),
                            'plf_update_marketplace' => array(
                                'text' => 'Marketplace',
                                'css' => array('width' => '10%'),
                                'sortable' => true,
                            ),
                            'plf_name' => array(
                                'text' => 'tr_meliscore_tool_platform_forms_name',
                                'css' => array('width' => '79%'),
                                'sortable' => true,
                            ),
                        ),
                        'searchables' => array(
                            'plf_id',
                            'plf_name',
                        ),
                        'actionButtons' => array(
                            'platform_edit' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Platforms',
                                'action' => 'render-platform-content-action-edit',
                            ),
                            'platform_delete' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Platforms',
                                'action' => 'render-platform-content-action-delete',
                            )
                        ),
                        
                    ),
                    'forms' => array(
                        'meliscore_platform_generic_form' => array(
                            'attributes' => array(
                                'name' => 'corePlatform',
                                'id' => 'corePlatform',
                                'method' => 'POST',
                                'action' => '',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'plf_id',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_platform_forms_id',
                                            'tooltip' => 'tr_meliscore_tool_platform_forms_id tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'plf_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'plf_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_platform_forms_name',
                                            'tooltip' => 'tr_meliscore_tool_platform_forms_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'plf_name',
                                            'value' => '',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'plf_update_marketplace',
                                        'type' => 'Select',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_platform_update_marketplace',
                                            'tooltip' => 'tr_meliscore_tool_platform_update_marketplace tooltip',
                                            'switchOptions' => array(
                                                'label' => 'tr_meliscore_common_allow',
                                                'label-on' => 'tr_meliscore_common_yes',
                                                'label-off' => 'tr_meliscore_common_no',
                                                'icon' => "glyphicon glyphicon-resize-horizontal",
                                            ),
                                            'value_options' => array(
                                                'on' => 'on',
                                            ),
                                            'disable_inarray_validator' => true
                                        ),
                                        'disable_inarray_validator' => true,
                                        'attributes' => array(
                                            'id' => 'plf_update_marketplace',
                                            'value' => 1,
                                        ),
                                    ),
                                ),
                            ),
                            'input_filter' => array(
                                'plf_id' => array(
                                    'name'     => 'plf_id',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'IsInt',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_invalid_id',
                                                    \Zend\I18n\Validator\IsInt::INVALID => 'tr_meliscore_invalid_id',
                                                )
                                            )
                                        ),
                                    ),
                                    'filters' => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'plf_name' => array(
                                    'name'     => 'plf_name',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 100,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_platform_forms_name_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_platform_forms_name_empty',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'plf_update_marketplace' => [
                                    'name'     => 'plf_update_marketplace',
                                    'required' => false,
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ]
                            ),
                        ),
                    ),
                ),
                // end Platform tool
                
                // Language tool
                'meliscore_language_tool' => array(
                    'conf' => array(
                        'title' => 'tr_meliscore_tool_language',
                        'id' => 'id_meliscore_language_tool',
                    ), 
                    'table' => array(
                        'target' => '#tableLanguages',
                        'ajaxUrl' => '/melis/MelisCore/Language/getLanguages',
                        'dataFunction' => '',
                        'ajaxCallback' => 'initLangBOJs()',
                        'filters' => array(
                            'left' => array(
                                'meliscore_tool_language_content_filters_limit' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Language',
                                    'action' => 'render-tool-language-content-filters-limit',
                                ),
                            ),
                            'center' => array(
                                'meliscore_tool_language_content_filters_search' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Language',
                                    'action' => 'render-tool-language-content-filters-search',
                                ),
                            ),
                            'right' => array(
                                'meliscore_tool_language_content_filters_refresh' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Language',
                                    'action' => 'render-tool-language-content-filters-refresh',
                                ),
                            ),
                        ),
                        'columns' => array(
                            'lang_id' => array(
                                'text' => 'tr_meliscore_tool_language_lang_id',
                                'css' => array('width' => '1%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'lang_name' => array(
                                'text' => 'tr_meliscore_tool_language_lang_name',
                                'css' => array('width' => '49%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'lang_locale' => array(
                                'text' => 'tr_meliscore_tool_language_lang_locale',
                                'css' => array('width' => '40%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                        ),
                        'searchables' => array(
                            'lang_id', 'lang_locale', 'lang_name'
                        ),
                        'actionButtons' => array(
                            'meliscore_tool_language_content_apply' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-content-action-apply',
                            ),
                            'meliscore_tool_language_content_update' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-content-action-update',
                            ),
                            'meliscore_tool_language_content_delete' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-content-action-delete',
                            ),
                        ),
                    ), // end table
                    'modals' => array(
                        'meliscore_tool_language_modal_content_empty' => array( // empty modal content
                            'id' => 'id_meliscore_tool_language_modal_content_empty',
                            'class' => 'glyphicons remove',
                            'tab-header' => 'tr_meliscore_tool_user',
                            'tab-text' => 'tr_meliscore_tool_user_modal_empty',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-modal-empty-handler'
                            ),
                        ),
                        'meliscore_tool_language_modal_content_new' => array(
                            'id' => 'id_meliscore_tool_language_modal_content_new',
                            'class' => 'glyphicons plus',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_language_new',
                            'content' => array(
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-modal-add-content'
                            ),
                        ),
                    ), //end modals
                    'forms' => array(
                        'meliscore_tool_language_generic_form' => array(
                            'attributes' => array(
                                'name' => 'formlang',
                                'id' => 'idformlang',
                                'method' => 'POST',
                                'action' => '',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'lang_id',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            //'label' => 'tr_meliscore_tool_language_lang_id',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_lang_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                            'class' => 'hidden'
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'lang_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_language_lang_name',
                                            'tooltip' => 'tr_meliscore_tool_language_lang_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_lang_name',
                                            'value' => '',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'lang_locale',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_tool_language_lang_locale',
                                            'tooltip' => 'tr_meliscore_tool_language_lang_locale2 tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'id_lang_locale',
                                            'value' => '',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),

                            ),
                            'input_filter' => array(
                                'lang_id' => array(
                                    'name'     => 'lang_id',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'IsInt',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_invalid_id',
                                                    \Zend\I18n\Validator\IsInt::INVALID => 'tr_meliscore_invalid_id',
                                                )
                                            )
                                        ),
                                    ),
                                    'filters' => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'lang_locale' => array(
                                    'name'     => 'lang_locale',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 10,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_language_lang_locale_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_language_lang_locale_empty',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'lang_name' => array(
                                    'name'     => 'lang_name',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 10,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_language_lang_name_long',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_language_lang_name_empty',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                            ),
                        ),
                    ), // end form
                ),
                // end Language tool
                // Email Management Tool
                'meliscore_emails_mngt_tool' => array(
                    'conf' => array(
                        'title' => 'tr_meliscore_email_mngt_tool',
                        'id' => 'id_meliscore_email_mngt_tool',
                    ),
                    'conf' => array(
                        'title' => 'tr_meliscore_tool_language',
                        'id' => 'id_meliscore_language_tool',
                    ),
                    'table' => array(
                        'target' => '#tableEmailMngt',
                        'ajaxUrl' => '/melis/MelisCore/EmailsManagement/getEmailsEntries',
                        'dataFunction' => '',
                        'ajaxCallback' => 'reInitTableEmailMngt();',
                        'filters' => array(
                            'left' => array(
                                'meliscore_tool_language_content_filters_limit' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Language',
                                    'action' => 'render-tool-language-content-filters-limit',
                                ),
                            ),
                            'center' => array(
                                'meliscore_tool_tool_emails_mngt_table_search' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'EmailsManagement',
                                    'action' => 'render-tool-emails-mngt-table-search',
                                ),
                            ),
                            'right' => array(
                                'meliscore_tool_tool_emails_mngt_table_refresh' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'EmailsManagement',
                                    'action' => 'render-tool-emails-mngt-table-refresh',
                                ),
                            ),
                        ),
                        'columns' => array(
                            'boe_id' => array(
                                'text' => 'tr_meliscore_tool_email_mngt_boe_id',
                                'css' => array('width' => '1%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'boe_indicator' => array(
                                'text' => 'tr_meliscore_tool_email_mngt_boe_indicator',
                                'css' => array('width' => '3%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'boe_name' => array(
                                'text' => 'tr_meliscore_tool_email_mngt_boe_name',
                                'css' => array('width' => '16%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'boe_code_name' => array(
                                'text' => 'tr_meliscore_tool_email_mngt_boe_code_name',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'boe_lang' => array(
                                'text' => 'tr_meliscore_tool_email_mngt_boe_lang',
                                'css' => array('width' => '15%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'boe_from_name' => array(
                                'text' => 'tr_meliscore_tool_email_mngt_boe_from_name',
                                'css' => array('width' => '20%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'boe_from_email' => array(
                                'text' => 'tr_meliscore_tool_email_mngt_boe_from_email',
                                'css' => array('width' => '10%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'boe_reply_to' => array(
                                'text' => 'tr_meliscore_tool_email_mngt_boe_reply_to',
                                'css' => array('width' => '10%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                        ),
                        'searchables' => array(
                            'boe_id', 'boe_name', 'boe_code_name'
                        ),
                        'actionButtons' => array(
                            'meliscore_tool_language_content_apply' => array(
                                'module' => 'MelisCore',
                                'controller' => 'EmailsManagement',
                                'action' => 'render-tool-emails-mngt-content-action-edit',
                            ),
                            'meliscore_tool_language_content_delete' => array(
                                'module' => 'MelisCore',
                                'controller' => 'EmailsManagement',
                                'action' => 'render-tool-emails-mngt-content-action-delete',
                            ),
                        ),
                    ), // end table 
                    'forms' => array(
                        'meliscore_emails_mngt_tool_general_properties_form' => array(
                            'attributes' => array(
                                'name' => 'generalPropertiesForm',
                                'id' => 'idGeneralPropertiesForm',
                                'method' => 'POST',
                                'action' => '',
                                'enctype' => 'multipart/form-data',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'boe_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_name',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_name',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_code_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_code_name',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_code_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_code_name',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_from_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_name',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_name tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_code_name',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_from_email',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_email',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_email tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_from_email',
                                            'required' => 'required',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_reply_to',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_reply_to',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_reply_to tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_reply_to',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_tag_accepted_list',
                                        'type' => 'MelisCoreMultiValInput',
                                        'attributes' => array(
                                            'id' => 'boe_tag_accepted_list',
                                            'data-label-text' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_tag_accepted_list',
                                            'placeholder' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_tag_accepted_list_placeholder',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_content_layout',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_content_layout',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_content_layout_title',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_title',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_title tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_content_layout_title',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_content_layout_logo',
                                        'type' => 'File',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_logo',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_logo tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_content_layout_logo',
                                            'value' => '',
                                            'onchange' => '',
                                            'class' => 'filestyle',
                                            'data-buttonText' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_logo_select_image',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boe_content_layout_ftr_info',
                                        'type' => 'Textarea',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_ftr_info',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_ftr_info tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_content_layout_ftr_info',
                                            'class' => 'form-control',
                                            'rows' => 5
                                        ),
                                    ),
                                ),
                            ),
                            'input_filter' => array(
                                'boe_name' => array(
                                    'name'     => 'boe_name',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),

                                    ),
                                ),
                                'boe_code_name' => array(
                                    'name'     => 'boe_code_name',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name' => 'regex', false,
                                            'options' => array(
                                                'pattern' => '/[\w]+/',
                                                'messages' => array(\Zend\Validator\Regex::INVALID => 'tr_emails_management_emal_boe_code_name_invalid'),
                                                'encoding' => 'UTF-8',
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'boe_from_name' => array(
                                    'name'     => 'boe_from_name',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'boe_from_email' => array(
                                    'name'     => 'boe_from_email',
                                    'required' => true,
                                    'validators' => array(
                                        array(
                                            'name'    => 'EmailAddress',
                                            'options' => array(
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_meliscore_emails_mngt_tool_general_properties_form_invalid_email',
                                            )
                                        ),
                                        array(
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ),
                                            ),
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'boe_reply_to' => array(
                                    'name'     => 'boe_reply_to',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'EmailAddress',
                                            'options' => array(
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_meliscore_emails_mngt_tool_general_properties_form_invalid_email',
                                            )
                                        ),
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'boe_content_layout' => array(
                                    'name'     => 'boe_content_layout',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'boe_content_layout_title' => array(
                                    'name'     => 'boe_content_layout_title',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                            ),
                        ),
                        'meliscore_emails_mngt_tool_emails_details_form' => array(
                            'attributes' => array(
                                'name' => 'emailsDetailsForm',
                                'id' => 'idemailsDetailsForm',
                                'method' => 'POST',
                                'action' => '',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'boed_id',
                                        'type' => 'MelisText',
                                        'attributes' => array(
                                            'id' => 'boed_id',
                                            'class' => 'hidden',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boed_subject',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_subject',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_subject tooltip',
                                        ),
                                        'attributes' => array(
                                            'id' => 'boe_from_name',
                                            'value' => '',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boed_html',
                                        'type' => 'TextArea',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_html',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_html tooltip',
                                        ),
                                        'attributes' => array(
                                            'class' => 'form-control',
                                            'rows' => 10,
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'boed_text',
                                        'type' => 'TextArea',
                                        'options' => array(
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_text',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_text tooltip',
                                        ),
                                        'attributes' => array(
                                            'class' => 'form-control',
                                            'rows' => 10,
                                        ),
                                    ),
                                ),
                            ),
                            // filter here
                        )
                    )
                ),
                // End of Email Management Tool
                
                // Logs tool
                'meliscore_logs_tool' => array(
                    'conf' => array(
                        'title' => 'tr_meliscore_logs_tool',
                        'id' => 'id_meliscore_logs_tool',
                    ),
                    'table' => array(
                        'target' => '#tableMelisLogs',
                        'ajaxUrl' => '/melis/MelisCore/Log/getLogs',
                        'dataFunction' => 'initLogDataTable',
                        'ajaxCallback' => '',
                        'initComplete' => 'initDatePicker()',
                        'filters' => array(
                            'left' => array(
                                'meliscore_logs_tool_table_limit' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-limit',
                                ),
                                'meliscore_logs_tool_table_date_range' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-date-range',
                                ),
                            ),
                            'center' => array(
                                'meliscore_logs_tool_table_search' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-search',
                                ),
                                'meliscore_logs_tool_table_user_filter' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-user-filter',
                                ),
                            ),
                            'right' => array(
                                'meliscore_logs_tool_table_type_filter' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-type-filter',
                                ),
                                'meliscore_logs_tool_table_refresh' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-refresh',
                                ),
                            ),
                        ),
                        'columns' => array(
                            'log_id' => array(
                                'text' => 'tr_meliscore_logs_tool_log_id',
                                'css' => array('width' => '1%'),
                                'sortable' => true,
                            ),
                            'log_title' => array(
                                'text' => 'tr_meliscore_logs_tool_log_title',
                                'css' => array('width' => '20%'),
                                'sortable' => false,
                            ),
                            'log_message' => array(
                                'text' => 'tr_meliscore_logs_tool_log_message',
                                'css' => array('width' => '30%'),
                                'sortable' => false,
                            ),
                            'log_user' => array(
                                'text' => 'tr_meliscore_logs_tool_log_user',
                                'css' => array('width' => '15%'),
                                'sortable' => false,
                            ),
                            'log_type' => array(
                                'text' => 'tr_meliscore_logs_tool_log_type',
                                'css' => array('width' => '15%'),
                                'sortable' => false,
                            ),
                            'log_item_id' => array(
                                'text' => 'tr_meliscore_logs_tool_log_item_id',
                                'css' => array('width' => '5%'),
                                'sortable' => false,
                            ),
                            'log_date_added' => array(
                                'text' => 'tr_meliscore_logs_tool_log_date_added',
                                'css' => array('width' => '15%'),
                                'sortable' => false,
                            ),
                        ),
                        'searchables' => array(),
                        'actionButtons' => array(),
                    ),
                    'forms' => array(
                        'meliscore_logs_tool_log_type_form' => array(
                            'attributes' => array(
                                'name' => 'logTypeForm',
                                'id' => '',
                                'method' => '',
                                'action' => '',
                                'class' => 'logTypeForm',
                            ),
                            'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'logtt_id',
                                        'type' => 'hidden',
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'logtt_lang_id',
                                        'type' => 'hidden',
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'logtt_type_id',
                                        'type' => 'hidden',
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'logtt_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_logs_tool_log_type_name',
                                        ),
                                        'attributes' => array(
                                            'id' => 'logtt_name',
                                        ),
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'logtt_description',
                                        'type' => 'Textarea',
                                        'options' => array(
                                            'label' => 'tr_meliscore_logs_tool_log_type_description',
                                        ),
                                        'attributes' => array(
                                            'id' => 'logtt_name',
                                            'rows' => 10,
                                            'class' => 'form-control',
                                        ),
                                    ),
                                ),
                                
                            ),
                            'input_filter' => array(
                                'logtt_name' => array(
                                    'name'     => 'logtt_name',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_logs_tool_log_input_to_long_255',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                                'logtt_description' => array(
                                    'name'     => 'logtt_description',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'StringLength',
                                            'options' => array(
                                                'encoding' => 'UTF-8',
                                                'max'      => 255,
                                                'messages' => array(
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_meliscore_logs_tool_log_input_to_long_255',
                                                ),
                                            ),
                                        ),
                                    ),
                                    'filters'  => array(
                                        array('name' => 'StripTags'),
                                        array('name' => 'StringTrim'),
                                    ),
                                ),
                            )
                        )
                    ),
                ),
                // end Language tool
                'user_view_date_connection_tool' => array(
                    'conf'  => array(),
                    'table' => array(
                        'target' => '#tableUserViewDateConnection',
                        'ajaxUrl' => '/melis/MelisCore/ToolUser/getUserConnectionData',
                        'dataFunction' => 'setUserDateConnection',
                        'ajaxCallback' => '',
                        'filters' => array(
                            'left' => array(
                                'tooluser-limit' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-limit'
                                ),
                            ),
                            'center' => array(
                            ),
                            'right' => array(
                            ),
                        ),
                        'columns' => array(
                            'usrcd_last_login_date' => array(
                                'text' => 'tr_meliscore_tool_usrcd_last_login_date',
                                'css' => array('width' => '25%', 'padding-right' => '0'),
                                'sortable' => true,
                            ),
                            'usrcd_id' => array(
                                'text' => 'tr_meliscore_date_start',
                                'css' => array('width' => '25%', 'padding-right' => '0'),
                                'sortable' => false,
                            ),
                            'usrcd_usr_login' => array(
                                'text' => 'tr_meliscore_date_end',
                                'css' => array('width' => '25%', 'padding-right' => '0'),
                                'sortable' => false,
                            ),
                            'usrcd_last_connection_time' => array(
                                'text' => 'tr_meliscore_tool_usrcd_last_connection_time',
                                'css' => array('width' => '25%', 'padding-right' => '0'),
                                'sortable' => false,
                            ),
                        ),

                        // define what columns can be used in searching
                        'searchables' => array('usrcd_last_login_date', 'usrcd_last_connection_time'),
                        'actionButtons' => array(

                        ),
                    ),
                ),
                'melis_core_gdpr_tool' => array(
                    'conf' => array(
                        'title' => 'gdpr tool',
                        'id' => 'id_melis_core_gdpr_tool'
                    ),
                    'export' => array(
                        'csvFileName' => '',
                    ),
                    'forms' => array(
                        'melis_core_gdpr_search_form' => array(
                            'attributes' => array(
                                'name' => 'melis_core_gdpr_search_form',
                                'id' => 'id_melis_core_gdpr_search_form',
                                'method' => 'POST',
                                'action' => '',
                                'class' => 'form-horizontal',
                                'role' => 'form',
                            ),
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => array(
                                array(
                                    'spec' => array(
                                        'name' => 'user_name',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melis_core_gdpr_form_name',
                                            'form_type' => 'form-horizontal',
                                        ),
                                        'attributes' => [
                                            'id' => 'melis_core_gdpr_search_form_name',
                                        ]
                                    ),
                                ),
                                array(
                                    'spec' => array(
                                        'name' => 'user_email',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_melis_core_gdpr_form_email',
                                            'form_type' => 'form-horizontal',
                                        ),
                                        'attributes' => [
                                            'id' => 'melis_core_gdpr_search_form_email',
                                        ]
                                    ),
                                ),
                            ),
                            'input_filter' => array(
                                'user_name' => array(
                                    'name' => 'user_name',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name'    => 'regex', false,
                                            'options' => array(
                                                'pattern' => '/[\D-+#$]/',
                                                'message'=> 'tr_melis_core_gdpr_tool_form_user_name_with_numbers_error',
                                            ),
                                        ),
                                    ),
                                    'filters' => array(

                                    ),
                                ),
                                'user_email' => array(
                                    'name' => 'user_email',
                                    'required' => false,
                                    'validators' => array(
                                        array(
                                            'name' => 'EmailAddress',
                                            'options' => array(
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_melis_core_gdpr_tool_form_email_invalid_format',
                                            ),
                                        ),
                                    ),
                                    'filters' => array(

                                    ),
                                ),
                            ),
                        ),
                    ),
                ),//end gdpr
            ),
        ),
    ),
);