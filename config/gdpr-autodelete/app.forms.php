<?php

return [
    'plugins' => [
        'MelisCoreGdprAutoDelete' => [
            'tools' => [
                'melis_core_gdpr_auto_delete' => [
                    'forms' => [
                        // <editor-fold desc="GDPR Auto delete config filters form">
                        'melisgdprautodelete_add_edit_config_filters' => [
                            'attributes' => array(
                                'name' => 'melisgdprautodelete_add_edit_config_filters',
                                'id' => 'id_melisgdprautodelete_add_edit_config_filters',
                                'method' => 'POST',
                                'action' => '',
                            ),
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_module_name',
                                        'type' => "MelisCoreGdprModuleSelect",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_auto_delete_module',
                                            'tooltip' => 'tr_melis_core_gdpr_auto_delete_module tooltip',
                                            'empty_option' => 'tr_melis_core_gdpr_auto_delete_module tooltip',
                                            'disable_inarray_validator' => true,
                                        ],
                                        'attributes' => [
                                            'required' => 'required',
                                            'id' => 'mgdprc_module_name'
                                        ]
                                    ]
                                ]
                            ],
                            'input_filter' => [
                                'mgdprc_module_name' => [
                                    'name' => 'mgdprc_module_name',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => array(
                                                'messages' => array(
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_core_gdpr_autodelete_choose_module',
                                                ),
                                            ),
                                        ],
                                    ]
                                ]
                            ]
                        ],
                        // </editor-fold>
                        // <editor-fold desc="GDPR Add edit cron config form">
                        'melisgdprautodelete_add_edit_cron_config_form' => [
                            'attributes' => array(
                                'name' => 'melisgdprautodelete_add_edit_cron_config_form',
                                'id' => 'id_melisgdprautodelete_add_edit_cron_config_form',
                                'method' => 'POST',
                                'action' => '',
                            ),
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_id',
                                        'type' => "hidden",
                                        'attributes' => [
                                            'id' => 'mgdprc_id'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_alert_email_status',
                                        'type' => "checkbox",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_status',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_status tooltip',
                                            'switch_options' => [
                                                'label-on' => 'Yes',
                                                'label-off' => 'No',
                                                'icon' => "glyphicon glyphicon-resize-horizontal",
                                            ],
                                            'checked_value' => 1,
                                            'unchecked_value' => 0,
                                            'class' => 'd-flex flex-row justify-content-between'
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control',
                                        ],

                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_alert_email_days',
                                        'type' => "text",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_days',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_days tooltip',
                                            'text_after' => "tr_melis_core_gdpr_autodelete_label_days_text"
                                        ],
                                        'attributes' => [
                                            'placeholder' => '350',
                                            'class' => 'mgdprc_alert_email_days form-control col-md-2',
                                            'style' => 'display:inline-block'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_alert_email_resend',
                                        'type' => "checkbox",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_resend',
                                            'label_attributes' => [
                                                'class' => 'd-flex flex-row justify-content-between'
                                            ],
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_resend tooltip',
                                            'switch_options' => [
                                                'label-on' => 'Yes',
                                                'label-off' => 'No',
                                                'icon' => "glyphicon glyphicon-resize-horizontal",
                                            ]
                                        ],
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_delete_days',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_delete_days',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_delete_days tooltip',
                                            'text_after' => "tr_melis_core_gdpr_autodelete_label_days_text"
                                        ],
                                        'attributes' => [
                                            'placeholder' => '350',
                                            'class' => 'mgdprc_delete_days form-control col-md-2',
                                            'required' => 'required',
                                            'style' => 'display:inline-block'
                                        ]
                                    ]
                                ]
                            ],
                            'input_filter' => [
                                'mgdprc_delete_days' => [
                                    'name' => 'mgdprc_delete_days',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ],
                                        [
                                            'name' => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_gdpr_auto_delete_not_int',
                                                ]
                                            ]
                                        ]
                                    ],
                                    'filters' => [
                                        [
                                            'name' => 'StripTags'
                                        ], [
                                            'name' => 'StringTrim'
                                        ]
                                    ]
                                ],
                                'mgdprc_alert_email_days' => [
                                    'name' => 'mgdprc_alert_email_days',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'IsInt',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\I18n\Validator\IsInt::NOT_INT => 'tr_meliscore_gdpr_auto_delete_not_int',
                                                ]
                                            ]
                                        ]
                                    ],
                                    'filters' => [
                                        [
                                            'name' => 'StripTags'
                                        ], [
                                            'name' => 'StringTrim'
                                        ]
                                    ]
                                ]
                            ]
                        ],
                        // </editor-fold>
                        // <editor-fold desc="GDPR Auto delete email setup form">
                        'melisgdprautodelete_add_edit_email_setup' => [
                            'attributes' => array(
                                'name' => 'melisgdprautodelete_add_edit_email_setup',
                                'id' => 'id_melisgdprautodelete_add_edit_email_setup',
                                'method' => 'POST',
                                'action' => '',
                                'enctype' => 'multipart/form-data'
                            ),
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_from_name',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_name',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_name tooltip',
                                        ],
                                        'attributes' => [
                                            'placeholder' => 'Melis technology',
                                            'required' => 'required'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_from_email',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_email',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_from_email tooltip',
                                            'disable_inarray_validator' => true,
                                        ],
                                        'attributes' => [
                                            'placeholder' => 'noreply@melistechnology.com',
                                            'required' => 'required',
                                            'class' => 'form-control'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_reply_to',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_reply_to',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_reply_to tooltip',
                                            'disable_inarray_validator' => true,
                                        ],
                                        'attributes' => [
                                            'placeholder' => 'noreply@melistechnology.com',
                                            'class' => 'form-control'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_tags',
                                        'type' => "text",
                                        'options' => [
                                            'tooltip' => "tr_melis_core_gdpr_autodelete_label_alert_email_tags tooltip",
                                            'not_editable' => true,
                                            'no_tags_text' => 'No tags available'
                                        ],
                                        'attributes' => [
                                            'data-label-text' => 'tr_melis_core_gdpr_autodelete_label_email_setup_tags',
                                            'class' => 'melis-multi-val-input',
                                            'style' => 'width:0;',
                                            'disabled' => 'disabled'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_layout',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout tooltip',
                                        ],
                                        'attributes' => [
                                            'placeholder' => 'melis-core/view/layout/layoutEmail.phtml',
                                            'value' => 'melis-core/view/layout/layoutEmail.phtml',
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_layout_title',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_title',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_title tooltip',
                                        ],
                                        'attributes' => [
                                            'placeholder' => 'Melis Technology',
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_layout_logo',
                                        'type' => "file",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_logo',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_logo Tooltip',
                                            'filestyle_options' => [
                                                'buttonBefore' => true,
                                                'buttonText' => 'Choose',
                                            ]
                                        ],
                                        'attributes' => [
                                            'placeholder' => 'logo',
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_layout_desc',
                                        'type' => "MelisCoreTinyMCE",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_ftr_info',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_content_layout_ftr_info tooltip',
                                        ],
                                    ]
                                ]
                            ],
                            'input_filter' => [
                                'mgdprc_email_conf_from_name' => [
                                    'name' => 'mgdprc_email_conf_from_name',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ]
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim']
                                    ]
                                ],
                                'mgdprc_email_conf_from_email' => [
                                    'name' => 'mgdprc_email_conf_from_email',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ],
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_melis_core_gdpr_autodelete_invalid_email',
                                            ]
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/^[a-zA-Z0-9]+([._@]?[a-zA-Z0-9])*$/',
                                                'messages' => [\Zend\Validator\Regex::NOT_MATCH => 'tr_melis_core_gdpr_autodelete_invalid_email'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim']
                                    ]
                                ],
                                'mgdprc_email_conf_reply_to' => [
                                    'name' => 'mgdprc_email_conf_reply_to',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'break_chain_on_failure' => true,
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ],
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_melis_core_gdpr_autodelete_invalid_email',
                                            ]
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/^[a-zA-Z0-9]+([._@]?[a-zA-Z0-9])*$/',
                                                'messages' => [\Zend\Validator\Regex::NOT_MATCH => 'tr_melis_core_gdpr_autodelete_invalid_email'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim']
                                    ]
                                ],
                                'mgdprc_email_conf_layout' => [
                                    'name' => 'mgdprc_email_conf_layout',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ]
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim']
                                    ]
                                ],
                                'mgdprc_email_conf_layout_desc' => [
                                    'name' => 'mgdprc_email_conf_layout_desc',
                                    'required' => false,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ]
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim']
                                    ]
                                ]
                            ]
                        ],
                        // </editor-fold>
                        // <editor-fold desc="GDPR Alert email form warning">
                        'melisgdprautodelete_add_edit_alert_email' => [
                            'attributes' => array(
                                'name' => 'melisgdprautodelete_add_edit_alert_email',
                                'method' => 'POST',
                                'action' => '',
                                'class' => 'melisgdprautodelete_add_edit_email_setup_form'
                            ),
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_email_tags',
                                        'type' => "text",
                                        'options' => [
                                            'tooltip' => "tr_melis_core_gdpr_autodelete_label_alert_email_tags tooltip",
                                            'not_editable' => true,
                                            'no_tags_text' => 'No tags available'
                                        ],
                                        'attributes' => [
                                            'class' => 'melis-multi-val-input',
                                            'data-label-text' => 'tr_melis_core_gdpr_autodelete_label_alert_email_tags',
                                            'style' => 'width:0;',
                                            'disabled' => 'disabled'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_subject',
                                        'type' => "text",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_subject',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_subject tooltip',
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_html',
                                        'type' => "MelisCoreTinyMCE",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_html',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_html tooltip',
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_text',
                                        'type' => "textarea",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_text',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_text tooltip',
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control'
                                        ]
                                    ],
                                ],
                            ],
                            'input_filter' => [

                            ]
                        ],
                        // </editor-fold>
                        // <editor-fold desc="GDPR Alert email form delete">
                        'melisgdprautodelete_add_edit_alert_email_delete' => [
                            'attributes' => [
                                'name' => 'melisgdprautodelete_add_edit_alert_email_delete',
                                'method' => 'POST',
                                'action' => '',
                                'class' => 'melisgdprautodelete_add_edit_alert_email_delete'
                            ],
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_email_tags',
                                        'type' => "text",
                                        'options' => [
                                            'tooltip' => "tr_meliscore_emails_mngt_tool_boe_tag_accepted_list tooltip",
                                            'not_editable' => true,
                                            'no_tags_text' => 'No tags available'
                                        ],
                                        'attributes' => [
                                            'class' => 'melis-multi-val-input',
                                            'data-label-text' => 'tr_melis_core_gdpr_autodelete_label_alert_email_tags',
                                            'style' => 'width:0;',
                                            'disabled' => 'disabled'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_subject',
                                        'type' => "text",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_subject',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_subject tooltip',
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control',
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_html',
                                        'type' => "MelisCoreTinyMCE",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_html',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_html tooltip',
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control',
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_text',
                                        'type' => "textarea",
                                        'options' => [
                                            'label' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_text',
                                            'tooltip' => 'tr_meliscore_emails_mngt_tool_emails_details_form_boed_text tooltip',
                                        ],
                                        'attributes' => [
                                            'class' => 'form-control',
                                            'required' => 'required'
                                        ]
                                    ]
                                ]
                            ],
                            'input_filter' => [
                                'mgdpre_html' => [
                                    'name' => 'mgdpre_html',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ]
                                    ],
                                ],
                                'mgdpre_subject' => [
                                    'name' => 'mgdpre_subject',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ]
                                    ],
                                ]
                            ]
                        ]// </editor-fold>
                    ]
                ]
            ]
        ]
    ]
];