<?php

return [
    'plugins' => [
        'melisModuleDiagnostics' => [
            'conf' => [
                // user rights exclusions
                'rightsDisplay' => 'none',
            ],
            'tools' => [
                'melis_module_diagnostic_tool_config' => [
                    'conf' => [
                        'title' => 'tr_melis_module_diagnostics_title',
                        'id' => ''
                    ],
                ],
            ],
        ],
        'meliscore' => [
            'tools' => [
                'meliscore_tool_user' => [
                    'conf' => [
                        'title' => 'tr_meliscore_tool_user',
                        'id' => 'id_meliscore_tool_user_management',
                    ],
                    'table' => [
                        // table ID
                        'target' => '#tableToolUserManagement',
                        'ajaxUrl' => '/melis/MelisCore/ToolUser/getUser',
                        'dataFunction' => 'initRetrieveUser',
                        'ajaxCallback' => '',
                        'filters' => [
                            'left' => [
                                'tooluser-limit' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-limit'
                                ]
                            ],
                            'center' => [
                                'tooluser-search' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-search'
                                ],
                            ],
                            'right' => [
                                'tooluser-export' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-export'
                                ],
                                'tooluser-refresh' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-refresh'
                                ],
                            ],
                        ],
                        'columns' => [
                            'usr_id' => [
                                'text' => 'tr_meliscore_tool_user_col_id',
                                'css' => ['width' => '1%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                            'usr_login' => [
                                'text' => 'tr_meliscore_tool_user_col_username',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                            'usr_is_online' => [
                                'text' => 'tr_meliscore_tool_user_col_power tooltip',
                                'css' => ['width' => '1%', 'padding-right' => '0'],
                                'sortable' => false,

                            ],
                            'usr_status' => [
                                'text' => 'tr_meliscore_tool_user_col_status',
                                'css' => ['width' => '1%', 'padding-right' => '0'],
                                'sortable' => false,

                            ],
                            'usr_image' => [
                                'text' => 'tr_meliscore_tool_user_col_profile',
                                'css' => ['width' => '1%', 'padding-right' => '0'],
                                'sortable' => false,

                            ],
                            'usr_email' => [
                                'text' => 'tr_meliscore_tool_user_col_Email',
                                'css' => ['width' => '25%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                            'usr_firstname' => [
                                'text' => 'tr_meliscore_tool_user_col_name',
                                'css' => ['width' => '25%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                            'usr_last_login_date' => [
                                'text' => 'tr_meliscore_tool_user_col_last_login',
                                'css' => ['width' => '20%', 'padding-right' => '0'],
                                'sortable' => true,

                            ],
                        ],

                        // define what columns can be used in searching
                        'searchables' => ['usr_id', 'usr_status', 'usr_login', 'usr_email', 'usr_firstname', 'usr_lastname', 'usr_last_login_date', 'usr_email'],
                        'actionButtons' => [
                            'edit' => [
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-content-action-edit',
                            ],
                            'delete' => [
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-content-action-delete',
                            ],
                        ],
                    ],
                    'export' => [
                        'csvFileName' => 'meliscore_user_export.csv',
                    ],


                    'modals' => [
                        'meliscore_tool_user_empty_modal' => [ // empty modal content
                            'id' => 'id_meliscore_tool_user_empty_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => 'tr_meliscore_tool_user',
                            'tab-text' => 'tr_meliscore_tool_user_modal_empty',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-empty'
                            ],
                        ],
                        'meliscore_tool_user_new_modal' => [ // add new user
                            'id' => 'id_meliscore_tool_user_new_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_new',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-new'
                            ],
                        ],
                        'meliscore_tool_user_new_rights_modal' => [ // rights for the new user
                            'id' => 'id_meliscore_tool_user_new_rights_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_new_rights',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-new-rights'
                            ],
                        ],
                        'meliscore_tool_user_edit_modal' => [ // edit user's information modal content
                            'id' => 'id_meliscore_tool_user_edit_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_modal_edit',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-edit'
                            ],
                        ],
                        'meliscore_tool_user_rights_modal' => [ // rights modal content
                            'id' => 'id_meliscore_tool_user_rights_modal',
                            'class' => 'glyphicons user',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_modal_rights',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-modal-rights'
                            ],
                        ],
                        'meliscore_tool_user_view_date_connection_modal' => [
                            'id' => 'id_meliscore_tool_user_view_date_connection_modal',
                            'class' => 'glyphicons list',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_user_view_date_connection',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'ToolUser',
                                'action' => 'render-tool-user-view-date-connection-modal'
                            ],
                        ],

                        'meliscore_tool_user_microservice_modal' => [
                            'id' => 'id_meliscore_tool_user_microservice_modal',
                            'class' => 'glyphicons cogwheels',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_microservice_tab_title',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'MelisCoreMicroService',
                                'action' => 'render-tool-user-view-micro-service-modal'
                            ],
                        ],

                    ],

                    'forms' => [
                        'meliscore_tool_user_form_new' => [
                            'attributes' => [
                                'name' => 'newusermanagement',
                                'id' => 'idnewusermanagement',
                                'method' => 'POST',
                                'enctype' => 'multipart/form-data',
                                'action' => '',
                                'novalidate' => 'novalidate',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'usr_login',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_username',
                                            'tooltip' => 'tr_meliscore_tool_user_col_username tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_n_usr_login',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_username',
                                            'required' => 'required',
                                            'autocomplete' => 'off',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_status',
                                        'type' => 'Laminas\Form\Element\Select',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_status',
                                            'tooltip' => 'tr_meliscore_tool_user_col_status tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'disable_inarray_validator' => true,
                                            'value_options' => [
                                                '0' => 'tr_meliscore_common_inactive',
                                                '1' => 'tr_meliscore_common_active',
                                            ],
                                        ],
                                        'attributes' => [
                                            'id' => 'id_n_usr_status',
                                            'value' => '',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_email',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_Email',
                                            'tooltip' => 'tr_meliscore_tool_user_col_Email tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_n_usr_email',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_Email',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_password',
                                        'type' => 'Password',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_password tooltip',
                                            'label_options' => [
                                                'disable_html_escape' => true,
                                            ],
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_password_new',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_confirm_password',
                                        'type' => 'Password',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_confirm_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_confirm_password tooltip',
                                            'label_options' => [
                                                'disable_html_escape' => true,
                                            ],
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_confirm_password_new',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_firstname',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_first_name',
                                            'tooltip' => 'tr_meliscore_tool_user_col_first_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_n_usr_firstname',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_first_name',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_lastname',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_last_name',
                                            'tooltip' => 'tr_meliscore_tool_user_col_last_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_n_usr_lastname',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_last_name',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_lang_id',
                                        'type' => 'MelisCoreLanguageSelect',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_form_language',
                                            'tooltip' => 'tr_meliscore_tool_user_form_language tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'disable_inarray_validator' => true,
                                        ],
                                        'attributes' => [
                                            'id' => 'id_n_usr_lang_id',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_admin',
                                        'type' => 'MelisText',
                                        'options' => [],
                                        'attributes' => [
                                            'class' => 'usr_admin',
                                            'id' => 'n_usr_admin',
                                            'data-label' => 'tr_meliscore_tool_user_col_admin',
                                            'data-tooltip' => 'tr_meliscore_tool_user_col_admin tooltip',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_image',
                                        'type' => 'file',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_profile',
                                            'tooltip' => 'tr_meliscore_tool_user_col_profile tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_n_usr_image',
                                            'accept' => '.gif,.jpg,.jpeg,.png',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_profile',
                                            'onchange' => 'toolUserManagement.imagePreview("#new-profile-image", this);',
                                            'class' => 'filestyle',
                                            'data-buttonText' => 'Select Image',
                                        ],
                                    ],
                                ],
                            ], // end elements
                            'input_filter' => [
                                'usr_login' => [
                                    'name' => 'usr_login',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_login_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_login_error_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$/',
                                                'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_login_invalid'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_status' => [
                                    'name' => 'usr_status',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_status_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'InArray',
                                            'options' => [
                                                'haystack' => [1, 0],
                                                'messages' => [
                                                    \Laminas\Validator\InArray::NOT_IN_ARRAY => 'tr_meliscore_tool_user_usr_status_error_invalid',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                    ],
                                ],
                                'usr_email' => [
                                    'name' => 'usr_email',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_email_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_meliscore_tool_user_invalid_email',
                                            ],
                                        ],
//                                        [
//                                            'name' => 'regex', false,
//                                            'options' => [
//                                                'pattern' => '/^[a-zA-Z0-9]+([._@]?[a-zA-Z0-9])*$/',
//                                                'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_melis_core_gdpr_autodelete_invalid_email'],
//                                                'encoding' => 'UTF-8',
//                                            ],
//                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_password' => [
                                    'name' => 'usr_password',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_password_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => '\MelisCore\Validator\MelisPasswordValidator',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'min' => 8,
                                                'messages' => [
                                                    \MelisCore\Validator\MelisPasswordValidator::TOO_SHORT => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                    \MelisCore\Validator\MelisPasswordValidator::NO_DIGIT => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                    \MelisCore\Validator\MelisPasswordValidator::NO_LOWER => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_password_error_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_confirm_password' => [
                                    'name' => 'usr_confirm_password',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_confirm_password_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => '\MelisCore\Validator\MelisPasswordValidator',
                                            'options' => [
                                                'min' => 8,
                                                'messages' => [
                                                    \MelisCore\Validator\MelisPasswordValidator::TOO_SHORT => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                    \MelisCore\Validator\MelisPasswordValidator::NO_DIGIT => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                    \MelisCore\Validator\MelisPasswordValidator::NO_LOWER => 'tr_meliscore_tool_user_usr_password_regex_not_match',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_confirm_password_error_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_firstname' => [
                                    'name' => 'usr_firstname',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_firstname_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_firstname_error_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/(\w)+/',
                                                'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_firstname_invalid'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_lastname' => [
                                    'name' => 'usr_lastname',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lastname_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_lastname_error_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/(\w)+/',
                                                'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_lastname_invalid'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_lang_id' => [
                                    'name' => 'usr_lang_id',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lang_id_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                    \Laminas\I18n\Validator\IsInt::INVALID => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                    ],
                                ],
                            ], // end input filter
                        ], // end new user form
                        'meliscore_tool_user_form_edit' => [
                            'attributes' => [
                                'name' => 'usermanagement',
                                'id' => 'idusermanagement',
                                'method' => 'POST',
                                'enctype' => 'multipart/form-data',
                                'action' => '',
                                'novalidate' => 'novalidate',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'usr_id',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_id',
                                            'tooltip' => 'tr_meliscore_tool_user_col_id tooltip',

                                        ],
                                        'attributes' => [
                                            'id' => 'tool_user_management_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ],
                                    ],
                                ],

                                [
                                    'spec' => [
                                        'name' => 'usr_login',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_username',
                                            'tooltip' => 'tr_meliscore_tool_user_col_username tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'tool_user_management_login',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ],
                                    ],
                                ],

                                [
                                    'spec' => [
                                        'name' => 'usr_status',
                                        'type' => 'Laminas\Form\Element\Select',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_status',
                                            'tooltip' => 'tr_meliscore_tool_user_col_status tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'value_options' => [
                                                '0' => 'tr_meliscore_common_inactive',
                                                '1' => 'tr_meliscore_common_active',
                                            ],
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_status',
                                            'value' => '',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],

                                [
                                    'spec' => [
                                        'name' => 'usr_email',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_Email',
                                            'tooltip' => 'tr_meliscore_tool_user_col_Email tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_email',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_Email',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],

                                [
                                    'spec' => [
                                        'name' => 'usr_password',
                                        'type' => 'Password',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_password tooltip',
                                            'label_options' => [
                                                'disable_html_escape' => true,
                                            ],
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_confirm_password',
                                        'type' => 'Password',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_confirm_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_confirm_password tooltip',
                                            'label_options' => [
                                                'disable_html_escape' => true,
                                            ],
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_confirm_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ],
                                    ],
                                ],

                                [
                                    'spec' => [
                                        'name' => 'usr_firstname',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_first_name',
                                            'tooltip' => 'tr_meliscore_tool_user_col_first_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_firstname',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_first_name',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],

                                [
                                    'spec' => [
                                        'name' => 'usr_lastname',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_last_name',
                                            'tooltip' => 'tr_meliscore_tool_user_col_last_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_lastname',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_last_name',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_lang_id',
                                        'type' => 'MelisCoreLanguageSelect',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_form_language',
                                            'tooltip' => 'tr_meliscore_tool_user_form_language tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'disable_inarray_validator' => true,
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_lang_id',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_admin',
                                        'type' => 'MelisText',
                                        'options' => [],
                                        'attributes' => [
                                            'id' => 'usr_admin',
                                            'class' => 'usr_admin',
                                            'data-label' => 'tr_meliscore_tool_user_col_admin',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_image',
                                        'type' => 'file',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_profile',
                                            'tooltip' => 'tr_meliscore_tool_user_col_profile tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_image',
                                            'accept' => '.gif,.jpg,.jpeg,.png',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_profile',
                                            'onchange' => 'toolUserManagement.imagePreview("#profile-image", this);',
                                            'class' => 'filestyle',
                                            'data-buttonText' => 'Select Image',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => array(
                                        'name' => 'usr_image_remove',
                                        'type' => 'hidden',
                                        'options' => array(),
                                        'attributes' => array(
                                            'id' => 'usr_image_remove',
                                            'value' => false,
                                        ),
                                    ),
                                ],

                            ], // end edit elements
                            'input_filter' => [
                                'usr_id' => [
                                    'name' => 'usr_id',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_tool_user_usr_id',
                                                    \Laminas\I18n\Validator\IsInt::INVALID => 'tr_meliscore_tool_user_usr_id',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_status' => [
                                    'name' => 'usr_status',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_status_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'InArray',
                                            'options' => [
                                                'haystack' => [1, 0],
                                                'messages' => [
                                                    \Laminas\Validator\InArray::NOT_IN_ARRAY => 'tr_meliscore_tool_user_usr_status_error_invalid',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                    ],
                                ],
                                'usr_email' => [
                                    'name' => 'usr_email',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_email_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_meliscore_tool_user_invalid_email',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],


                                'usr_firstname' => [
                                    'name' => 'usr_firstname',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_firstname_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_firstname_error_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/(\w)+/',
                                                'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_firstname_invalid'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_lastname' => [
                                    'name' => 'usr_lastname',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lastname_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_user_usr_lastname_error_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/(\w)+/',
                                                'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_user_usr_lastname_invalid'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_lang_id' => [
                                    'name' => 'usr_lang_id',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lang_id_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                    \Laminas\I18n\Validator\IsInt::INVALID => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                    ],
                                ],
                            ], // end input filter
                        ], // end edit form
                    ], // end forms
                ],//end user tool management 
                'meliscore_user_profile_management' => [
                    'forms' => [
                        'meliscore_user_profile_form' => [
                            'attributes' => [
                                'name' => 'userprofilemanagement',
                                'id' => 'iduserprofilemanagement',
                                'method' => 'POST',
                                'enctype' => 'multipart/form-data',
                                'action' => '',
                                'novalidate' => 'novalidate',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'usr_email',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_Email',
                                            'tooltip' => 'tr_meliscore_tool_user_col_Email tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_profile_email',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_tool_user_col_Email',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],

                                [
                                    'spec' => [
                                        'name' => 'usr_password',
                                        'type' => 'Password',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_password tooltip',
                                            'label_options' => [
                                                'disable_html_escape' => true,
                                            ],
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_profile_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_confirm_password',
                                        'type' => 'Password',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_col_confirm_password',
                                            'tooltip' => 'tr_meliscore_tool_user_col_confirm_password tooltip',
                                            'label_options' => [
                                                'disable_html_escape' => true,
                                            ],
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_profile_confirm_password',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_login_pass_placeholder',
                                            'class' => 'form-control',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_lang_id',
                                        'type' => 'MelisCoreLanguageSelect',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_user_form_language',
                                            'tooltip' => 'tr_meliscore_tool_user_form_language tooltip',
                                            'empty_option' => 'tr_meliscore_common_choose',
                                            'disable_inarray_validator' => true,
                                        ],
                                        'attributes' => [
                                            'id' => 'id_usr_profile_lang_id',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'usr_image',
                                        'type' => 'file',
                                        'attributes' => [
                                            'id' => 'id_usr_profile_image',
                                            'accept' => '.gif,.jpg,.jpeg,.png',
                                            'value' => '',
                                        ],
                                    ],
                                ],

                            ], // end edit elements
                            'input_filter' => [
                                'usr_email' => [
                                    'name' => 'usr_email',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_email_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_meliscore_tool_user_invalid_email',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'usr_lang_id' => [
                                    'name' => 'usr_lang_id',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_user_usr_lang_id_error_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                    \Laminas\I18n\Validator\IsInt::INVALID => 'tr_meliscore_tool_user_usr_lang_id_error_invalid',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                    ],
                                ],
                            ], // end input filter
                        ], // end user profile edit form
                    ],//end from
                ],// end user profile management
                // Platform Tool
                'meliscore_platform_tool' => [
                    'conf' => [
                        'title' => 'tr_meliscore_tool_platform_title',
                        'id' => 'id_meliscore_platform_tool',
                    ],
                    'table' => [
                        'target' => '#tablePlatforms',
                        'ajaxUrl' => '/melis/MelisCore/Platforms/getPlatforms',
                        'dataFunction' => '',
                        'ajaxCallback' => 'initCorePlatformListTable()',
                        'filters' => [
                            'left' => [
                                'platform_limit' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Platforms',
                                    'action' => 'render-platform-content-filters-limit',
                                ],
                            ],
                            'center' => [
                                'platform_search' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Platforms',
                                    'action' => 'render-platform-content-filters-search',
                                ],
                            ],
                            'right' => [
                                'platform_refresh' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Platforms',
                                    'action' => 'render-platform-content-filters-refresh',
                                ],
                            ],
                        ],
                        'columns' => [
                            'plf_id' => [
                                'text' => 'tr_meliscore_tool_platform_forms_id',
                                'css' => ['width' => '1%'],
                                'sortable' => true,
                            ],
                            'plf_update_marketplace' => [
                                'text' => 'Marketplace',
                                'css' => ['width' => '10%'],
                                'sortable' => true,
                            ],
                            'plf_name' => [
                                'text' => 'tr_meliscore_tool_platform_forms_name',
                                'css' => ['width' => '79%'],
                                'sortable' => true,
                            ],
                        ],
                        'searchables' => [
                            'plf_id',
                            'plf_name',
                        ],
                        'actionButtons' => [
                            'platform_edit' => [
                                'module' => 'MelisCore',
                                'controller' => 'Platforms',
                                'action' => 'render-platform-content-action-edit',
                            ],
                            'platform_delete' => [
                                'module' => 'MelisCore',
                                'controller' => 'Platforms',
                                'action' => 'render-platform-content-action-delete',
                            ],
                        ],

                    ],
                    'forms' => [
                        'meliscore_platform_generic_form' => [
                            'attributes' => [
                                'name' => 'corePlatform',
                                'id' => 'corePlatform',
                                'method' => 'POST',
                                'action' => '',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'plf_id',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_platform_forms_id',
                                            'tooltip' => 'tr_meliscore_tool_platform_forms_id tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'plf_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'plf_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_platform_forms_name',
                                            'tooltip' => 'tr_meliscore_tool_platform_forms_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'plf_name',
                                            'value' => '',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'plf_update_marketplace',
                                        'type' => 'Select',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_platform_update_marketplace',
                                            'tooltip' => 'tr_meliscore_tool_platform_update_marketplace tooltip',
                                            'switchOptions' => [
                                                'label' => 'tr_meliscore_common_status',
                                                'label-on' => 'tr_meliscore_common_yes',
                                                'label-off' => 'tr_meliscore_common_nope',
                                                'icon' => "glyphicon glyphicon-resize-horizontal",
                                            ],
                                            'value_options' => [
                                                'on' => 'on',
                                            ],
                                            'disable_inarray_validator' => true
                                        ],
                                        'disable_inarray_validator' => true,
                                        'attributes' => [
                                            'id' => 'plf_update_marketplace',
                                            'value' => 1,
                                        ],
                                    ],
                                ],
                            ],
                            'input_filter' => [
                                'plf_id' => [
                                    'name' => 'plf_id',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_invalid_id',
                                                    \Laminas\I18n\Validator\IsInt::INVALID => 'tr_meliscore_invalid_id',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'plf_name' => [
                                    'name' => 'plf_name',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 100,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_platform_forms_name_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/^[a-zA-Z0-9]*$/',
                                                'messages' => [
                                                    \Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_platform_invalid_platform_name'
                                                ],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_platform_forms_name_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'plf_update_marketplace' => [
                                    'name' => 'plf_update_marketplace',
                                    'required' => false,
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ]
                            ],
                        ],
                    ],
                ],
                // end Platform tool

                // Language tool
                'meliscore_language_tool' => [
                    'conf' => [
                        'title' => 'tr_meliscore_tool_language',
                        'id' => 'id_meliscore_language_tool',
                    ],
                    'table' => [
                        'target' => '#tableLanguages',
                        'ajaxUrl' => '/melis/MelisCore/Language/getLanguages',
                        'dataFunction' => '',
                        'ajaxCallback' => 'initLangBOJs()',
                        'filters' => [
                            'left' => [
                                'meliscore_tool_language_content_filters_limit' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Language',
                                    'action' => 'render-tool-language-content-filters-limit',
                                ],
                            ],
                            'center' => [
                                'meliscore_tool_language_content_filters_search' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Language',
                                    'action' => 'render-tool-language-content-filters-search',
                                ],
                            ],
                            'right' => [
                                'meliscore_tool_language_content_filters_refresh' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Language',
                                    'action' => 'render-tool-language-content-filters-refresh',
                                ],
                            ],
                        ],
                        'columns' => [
                            'lang_id' => [
                                'text' => 'tr_meliscore_tool_language_lang_id',
                                'css' => ['width' => '1%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'lang_name' => [
                                'text' => 'tr_meliscore_tool_language_lang_name',
                                'css' => ['width' => '49%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'lang_locale' => [
                                'text' => 'tr_meliscore_tool_language_lang_locale',
                                'css' => ['width' => '40%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'lang_is_used' => [
                                'text' => '',
                                'css' => ['width' => '40%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                        ],
                        'searchables' => [
                            'lang_id', 'lang_locale', 'lang_name'
                        ],
                        'actionButtons' => [
                            'meliscore_tool_language_content_apply' => [
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-content-action-apply',
                            ],
                            'meliscore_tool_language_content_update' => [
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-content-action-update',
                            ],
                            'meliscore_tool_language_content_delete' => [
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-content-action-delete',
                            ],
                        ],
                    ], // end table
                    'modals' => [
                        'meliscore_tool_language_modal_content_empty' => [ // empty modal content
                            'id' => 'id_meliscore_tool_language_modal_content_empty',
                            'class' => 'glyphicons remove',
                            'tab-header' => 'tr_meliscore_tool_user',
                            'tab-text' => 'tr_meliscore_tool_user_modal_empty',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-modal-empty-handler'
                            ],
                        ],
                        'meliscore_tool_language_modal_content_new' => [
                            'id' => 'id_meliscore_tool_language_modal_content_new',
                            'class' => 'glyphicons plus',
                            'tab-header' => '',
                            'tab-text' => 'tr_meliscore_tool_language_new',
                            'content' => [
                                'module' => 'MelisCore',
                                'controller' => 'Language',
                                'action' => 'render-tool-language-modal-add-content'
                            ],
                        ],
                    ], //end modals
                    'forms' => [
                        'meliscore_tool_language_generic_form' => [
                            'attributes' => [
                                'name' => 'formlang',
                                'id' => 'idformlang',
                                'method' => 'POST',
                                'action' => '',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'lang_id',
                                        'type' => 'MelisText',
                                        'options' => [
                                            //'label' => 'tr_meliscore_tool_language_lang_id',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_lang_id',
                                            'value' => '',
                                            'disabled' => 'disabled',
                                            'class' => 'd-none'
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'lang_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_language_lang_name',
                                            'tooltip' => 'tr_meliscore_tool_language_lang_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_lang_name',
                                            'value' => '',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'lang_locale',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_tool_language_lang_locale',
                                            'tooltip' => 'tr_meliscore_tool_language_lang_locale2 tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'id_lang_locale',
                                            'value' => '',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],

                            ],
                            'input_filter' => [
                                'lang_id' => [
                                    'name' => 'lang_id',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_invalid_id',
                                                    \Laminas\I18n\Validator\IsInt::INVALID => 'tr_meliscore_invalid_id',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'lang_locale' => [
                                    'name' => 'lang_locale',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 10,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_language_lang_locale_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_language_lang_locale_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'lang_name' => [
                                    'name' => 'lang_name',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 10,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_tool_language_lang_name_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_language_lang_name_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                            ],
                        ],
                    ], // end form
                ],
                // end Language tool
                // Email Management Tool
                'meliscore_emails_mngt_tool' => [
                    'conf' => [
                        'title' => 'tr_meliscore_email_mngt_tool',
                        'id' => 'id_meliscore_email_mngt_tool',
                    ],
                    'table' => [
                        'target' => '#tableEmailMngt',
                        'ajaxUrl' => '/melis/MelisCore/EmailsManagement/getEmailsEntries',
                        'dataFunction' => '',
                        'ajaxCallback' => 'reInitTableEmailMngt();',
                        'filters' => [
                            'left' => [
                                'meliscore_tool_language_content_filters_limit' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Language',
                                    'action' => 'render-tool-language-content-filters-limit',
                                ],
                            ],
                            'center' => [
                                'meliscore_tool_tool_emails_mngt_table_search' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'EmailsManagement',
                                    'action' => 'render-tool-emails-mngt-table-search',
                                ],
                            ],
                            'right' => [
                                'meliscore_tool_tool_emails_mngt_table_refresh' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'EmailsManagement',
                                    'action' => 'render-tool-emails-mngt-table-refresh',
                                ],
                            ],
                        ],
                        'columns' => [
                            'boe_id' => [
                                'text' => 'tr_meliscore_tool_email_mngt_boe_id',
                                'css' => ['width' => '1%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'boe_indicator' => [
                                'text' => 'tr_meliscore_tool_email_mngt_boe_indicator',
                                'css' => ['width' => '3%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'boe_name' => [
                                'text' => 'tr_meliscore_tool_email_mngt_boe_name',
                                'css' => ['width' => '16%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'boe_code_name' => [
                                'text' => 'tr_meliscore_tool_email_mngt_boe_code_name',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'boe_lang' => [
                                'text' => 'tr_meliscore_tool_email_mngt_boe_lang',
                                'css' => ['width' => '15%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'boe_from_name' => [
                                'text' => 'tr_meliscore_tool_email_mngt_boe_from_name',
                                'css' => ['width' => '20%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'boe_from_email' => [
                                'text' => 'tr_meliscore_tool_email_mngt_boe_from_email',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'boe_reply_to' => [
                                'text' => 'tr_meliscore_tool_email_mngt_boe_reply_to',
                                'css' => ['width' => '10%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                        ],
                        'searchables' => [
                            'boe_id', 'boe_name', 'boe_code_name'
                        ],
                        'actionButtons' => [
                            'meliscore_tool_language_content_apply' => [
                                'module' => 'MelisCore',
                                'controller' => 'EmailsManagement',
                                'action' => 'render-tool-emails-mngt-content-action-edit',
                            ],
                            'meliscore_tool_language_content_delete' => [
                                'module' => 'MelisCore',
                                'controller' => 'EmailsManagement',
                                'action' => 'render-tool-emails-mngt-content-action-delete',
                            ],
                        ],
                    ], // end table 
                    'forms' => [
                        'meliscore_emails_mngt_tool_general_properties_form' => [
                            'attributes' => [
                                'name' => 'generalPropertiesForm',
                                'id' => 'idGeneralPropertiesForm',
                                'method' => 'POST',
                                'action' => '',
                                'enctype' => 'multipart/form-data',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'boe_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_name',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_name',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_code_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_code_name',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_code_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_code_name',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_from_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_name',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_name tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_code_name',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_from_email',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_email',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_email tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_from_email',
                                            'required' => 'required',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_reply_to',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_reply_to',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_reply_to tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_reply_to',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_tag_accepted_list',
                                        'type' => 'MelisCoreMultiValInput',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_tag_accepted_list',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_boe_tag_accepted_list tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_tag_accepted_list',
                                            'placeholder' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_tag_accepted_list_placeholder',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_content_layout',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_content_layout',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_content_layout_title',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_title',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_title tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_content_layout_title',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_content_layout_logo',
                                        'type' => 'File',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_logo',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_logo tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_content_layout_logo',
                                            'value' => '',
                                            'onchange' => '',
                                            'class' => 'filestyle',
                                            'data-buttonText' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_logo_select_image',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boe_content_layout_ftr_info',
                                        'type' => 'Textarea',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_ftr_info',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_ftr_info tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_content_layout_ftr_info',
                                            'class' => 'form-control',
                                            'rows' => 5
                                        ],
                                    ],
                                ],
                            ],
                            'input_filter' => [
                                'boe_name' => [
                                    'name' => 'boe_name',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],

                                    ],
                                ],
                                'boe_code_name' => [
                                    'name' => 'boe_code_name',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex',
                                            'options' => [
                                                'pattern' => '/[\w]+/',
                                                'messages' => [
                                                    \Laminas\Validator\Regex::INVALID => 'tr_emails_management_emal_boe_code_name_invalid',
                                                    \Laminas\Validator\Regex::NOT_MATCH => 'tr_emails_management_emal_boe_code_name_invalid',
                                                ],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'boe_from_name' => [
                                    'name' => 'boe_from_name',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'boe_from_email' => [
                                    'name' => 'boe_from_email',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_meliscore_emails_mngt_tool_general_properties_form_invalid_email',
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'boe_reply_to' => [
                                    'name' => 'boe_reply_to',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_meliscore_emails_mngt_tool_general_properties_form_invalid_email',
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'boe_content_layout' => [
                                    'name' => 'boe_content_layout',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'boe_content_layout_title' => [
                                    'name' => 'boe_content_layout_title',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_emails_mngt_tool_general_properties_form_long',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                            ],
                        ],
                        'meliscore_emails_mngt_tool_emails_details_form' => [
                            'attributes' => [
                                'name' => 'emailsDetailsForm',
                                'id' => 'idemailsDetailsForm',
                                'method' => 'POST',
                                'action' => '',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'boed_id',
                                        'type' => 'MelisText',
                                        'attributes' => [
                                            'id' => 'boed_id',
                                            'class' => 'd-none',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boed_subject',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_subject',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_subject tooltip',
                                        ],
                                        'attributes' => [
                                            'id' => 'boe_from_name',
                                            'value' => '',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boed_html',
                                        'type' => 'Textarea',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_html',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_html tooltip',
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control',
                                            'rows' => 10,
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'boed_text',
                                        'type' => 'Textarea',
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_text',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_text tooltip',
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control',
                                            'rows' => 10,
                                        ],
                                    ],
                                ],
                            ],
                            // filter here
                        ],
                    ],
                ],
                // End of Email Management Tool

                // Logs tool
                'meliscore_logs_tool' => [
                    'conf' => [
                        'title' => 'tr_meliscore_logs_tool',
                        'id' => 'id_meliscore_logs_tool',
                    ],
                    'table' => [
                        'target' => '#tableMelisLogs',
                        'ajaxUrl' => '/melis/MelisCore/Log/getLogs',
                        'dataFunction' => 'initLogDataTable',
                        'ajaxCallback' => '',
                        'initComplete' => 'initDatePicker()',
                        'filters' => [
                            'left' => [
                                'meliscore_logs_tool_table_limit' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-limit',
                                ],
                                'meliscore_logs_tool_table_date_range' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-date-range',
                                ],
                            ],
                            'center' => [
                                'meliscore_logs_tool_table_search' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-search',
                                ],
                                'meliscore_logs_tool_table_user_filter' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-user-filter',
                                ],
                            ],
                            'right' => [
                                'meliscore_logs_tool_table_type_filter' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-type-filter',
                                ],
                                'meliscore_logs_tool_export' => array(
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-export'
                                ),
                                'meliscore_logs_tool_table_refresh' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'Log',
                                    'action' => 'render-logs-tool-table-refresh',
                                ],
                            ],
                        ],
                        'columns' => [
                            'log_id' => [
                                'text' => 'tr_meliscore_logs_tool_log_id',
                                'css' => ['width' => '1%'],
                                'sortable' => true,
                            ],
                            'log_title' => [
                                'text' => 'tr_meliscore_logs_tool_log_title',
                                'css' => ['width' => '20%'],
                                'sortable' => false,
                            ],
                            'log_message' => [
                                'text' => 'tr_meliscore_logs_tool_log_message',
                                'css' => ['width' => '30%'],
                                'sortable' => false,
                            ],
                            'log_user' => [
                                'text' => 'tr_meliscore_logs_tool_log_user',
                                'css' => ['width' => '15%'],
                                'sortable' => false,
                            ],
                            'log_type' => [
                                'text' => 'tr_meliscore_logs_tool_log_type',
                                'css' => ['width' => '15%'],
                                'sortable' => false,
                            ],
                            'log_item_id' => [
                                'text' => 'tr_meliscore_logs_tool_log_item_id',
                                'css' => ['width' => '5%'],
                                'sortable' => false,
                            ],
                            'log_date_added' => [
                                'text' => 'tr_meliscore_logs_tool_log_date_added',
                                'css' => ['width' => '15%'],
                                'sortable' => false,
                            ],
                        ],
                        'searchables' => [],
                        'actionButtons' => [],
                    ],
                    'forms' => [
                        'meliscore_logs_tool_log_type_form' => [
                            'attributes' => [
                                'name' => 'logTypeForm',
                                'id' => '',
                                'method' => '',
                                'action' => '',
                                'class' => 'logTypeForm',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'logtt_id',
                                        'type' => 'hidden',
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'logtt_lang_id',
                                        'type' => 'hidden',
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'logtt_type_id',
                                        'type' => 'hidden',
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'logtt_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_meliscore_logs_tool_log_type_name',
                                        ],
                                        'attributes' => [
                                            'id' => 'logtt_name',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'logtt_description',
                                        'type' => 'Textarea',
                                        'options' => [
                                            'label' => 'tr_meliscore_logs_tool_log_type_description',
                                        ],
                                        'attributes' => [
                                            'id' => 'logtt_name',
                                            'rows' => 10,
                                            'class' => 'form-control',
                                        ],
                                    ],
                                ],

                            ],
                            'input_filter' => [
                                'logtt_name' => [
                                    'name' => 'logtt_name',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_logs_tool_log_input_to_long_255',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'logtt_description' => [
                                    'name' => 'logtt_description',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Laminas\Validator\StringLength::TOO_LONG => 'tr_meliscore_logs_tool_log_input_to_long_255',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                            ],
                        ],
                        'meliscore_logs_tool_log_export_form' => [
                            'attributes' => [
                                'name' => 'logExportForm',
                                'id' => 'logExportForm',
                                'method' => '',
                                'action' => '',
                                'class' => 'logExportForm',
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                array(
                                    'spec' => array(
                                        'name' => 'log_user',
                                        'type' => 'Select',
                                        'options' => array(
                                            'label' => 'tr_meliscore_log_export_user',
                                            'tooltip' => 'tr_meliscore_log_export_user tooltip',
                                            'disable_inarray_validator' => true,
                                        ),
                                        'attributes' => array(
                                            'id' => 'log_user',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_log_export_user',
                                        ),
                                    ),
                                ),array(
                                    'spec' => array(
                                        'name' => 'log_type',
                                        'type' => 'MelisCoreLogTypeSelect',
                                        'options' => array(
                                            'label' => 'tr_meliscore_log_export_type',
                                            'tooltip' => 'tr_meliscore_log_export_type tooltip',
                                            'disable_inarray_validator' => true,
                                            'empty_option' => 'tr_meliscore_common_all',
                                        ),
                                        'attributes' => array(
                                            'id' => 'log_type',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_log_export_type',
                                        ),
                                    ),
                                ),array(
                                    'spec' => array(
                                        'name' => 'log_date_range',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_log_export_log_date_range',
                                            'tooltip' => 'tr_meliscore_log_export_log_date_range tooltip',
                                            'disable_inarray_validator' => true,
                                        ),
                                        'attributes' => array(
                                            'id' => 'log_date_range',
                                            'class' => 'melis-input-group-button',
                                            'data-button-icon' => 'fa fa-eraser',
                                            'data-button-class' => 'meliscore-clear-input',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_log_export_log_date_range',
                                        ),
                                    ),
                                ),array(
                                    'spec' => array(
                                        'name' => 'log_delimiter',
                                        'type' => 'MelisText',
                                        'options' => array(
                                            'label' => 'tr_meliscore_log_export_delimiter',
                                            'tooltip' => 'tr_meliscore_log_export_delimiter tooltip',
                                            'disable_inarray_validator' => true,
                                        ),
                                        'attributes' => array(
                                            'id' => 'log_delimiter',
                                            'value' => ';',
                                            'placeholder' => 'tr_meliscore_log_export_delimiter',
                                        ),
                                    ),
                                ),array(
                                    'spec' => array(
                                        'name' => 'log_enclosure',
                                        'type' => 'Checkbox',
                                        'options' => array(
                                            'label' => 'tr_meliscore_log_export_enclosure',
                                            'tooltip' => 'tr_meliscore_log_export_enclosure tooltip',
                                            'checked_value' => 1,
                                            'unchecked_value' => 0,
                                            'switchOptions' => array(
                                                'label-on' => 'tr_meliscore_common_yes',
                                                'label-off' => 'tr_meliscore_common_no',
                                                'label' => "<i class='glyphicon glyphicon-resize-horizontal'></i>",
                                            ),
                                            'disable_inarray_validator' => true,
                                        ),
                                        'attributes' => array(
                                            'id' => 'log_enclosure',
                                            'value' => '',
                                            'placeholder' => 'tr_meliscore_log_export_enclosure',
                                        ),
                                    ),
                                ),

                            ],
                            'input_filter' => [
                                'log_user' => array(
                                    'name' => 'log_user',
                                    'required' => false,
                                    'validators' => array(),
                                    'filters' => array(),
                                ),
                                'log_type' => array(
                                    'name' => 'log_type',
                                    'required' => false,
                                    'validators' => array(),
                                    'filters' => array(),
                                ),
                                'log_date_range' => array(
                                    'name' => 'log_date_range',
                                    'required' => false,
                                    'validators' => array(),
                                    'filters' => array(),
                                ),
                                'log_delimiter' => array(
                                    'name' => 'log_delimiter',
                                    'required' => false,
                                    'validators' => array(),
                                    'filters' => array(),
                                ),
                                'log_enclosure' => array(
                                    'name' => 'log_enclosure',
                                    'required' => false,
                                    'validators' => array(),
                                    'filters' => array(),
                                )
                            ],
                        ],
                    ],
                ],
                // end Language tool
                'user_view_date_connection_tool' => [
                    'conf' => [],
                    'table' => [
                        'target' => '#tableUserViewDateConnection',
                        'ajaxUrl' => '/melis/MelisCore/ToolUser/getUserConnectionData',
                        'dataFunction' => 'setUserDateConnection',
                        'ajaxCallback' => '',
                        'filters' => [
                            'left' => [
                                'tooluser-limit' => [
                                    'module' => 'MelisCore',
                                    'controller' => 'ToolUser',
                                    'action' => 'render-tool-user-content-filters-limit'
                                ],
                            ],
                            'center' => [
                            ],
                            'right' => [
                            ],
                        ],
                        'columns' => [
                            'usrcd_last_login_date' => [
                                'text' => 'tr_meliscore_tool_usrcd_last_login_date',
                                'css' => ['width' => '25%', 'padding-right' => '0'],
                                'sortable' => true,
                            ],
                            'usrcd_id' => [
                                'text' => 'tr_meliscore_date_start',
                                'css' => ['width' => '25%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'usrcd_usr_login' => [
                                'text' => 'tr_meliscore_date_end',
                                'css' => ['width' => '25%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                            'usrcd_last_connection_time' => [
                                'text' => 'tr_meliscore_tool_usrcd_last_connection_time',
                                'css' => ['width' => '25%', 'padding-right' => '0'],
                                'sortable' => false,
                            ],
                        ],

                        // define what columns can be used in searching
                        'searchables' => ['usrcd_last_login_date', 'usrcd_last_connection_time'],
                        'actionButtons' => [

                        ],
                    ],
                ],
                'melis_core_gdpr_tool' => [
                    'conf' => [
                        'title' => 'gdpr tool',
                        'id' => 'id_melis_core_gdpr_tool'
                    ],
                    'export' => [
                        'csvFileName' => '',
                    ],
                    'forms' => [
                        'melis_core_gdpr_search_form' => [
                            'attributes' => [
                                'name' => 'melis_core_gdpr_search_form',
                                'id' => 'id_melis_core_gdpr_search_form',
                                'method' => 'POST',
                                'action' => '',
                                'class' => 'form-horizontal'
                            ],
                            'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'user_name',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_form_name',
                                            'form_type' => 'form-horizontal',
                                        ],
                                        'attributes' => [
                                            'id' => 'melis_core_gdpr_search_form_name'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'user_email',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_form_email',
                                            'form_type' => 'form-horizontal',
                                        ],
                                        'attributes' => [
                                            'id' => 'melis_core_gdpr_search_form_email'
                                        ]
                                    ],
                                ],
                            ],
                            'input_filter' => [
                                'user_name' => [
                                    'name' => 'user_name',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/[A-Za-z]/',
                                                'message' => [\Laminas\Validator\Regex::INVALID => 'tr_melis_core_gdpr_tool_form_user_name_with_numbers_error'],
                                            ],
                                        ],
                                    ],
                                    'filters' => [

                                    ],
                                ],
                                'user_email' => [
                                    'name' => 'user_email',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_melis_core_gdpr_tool_form_email_invalid_format',
                                            ],
                                        ],
                                    ],
                                    'filters' => [

                                    ],
                                ],
                            ],
                        ],
                    ],
                ],//end gdpr
            ],
        ],
    ],
];
