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
                                            'label' => 'Module',
                                            'tooltip' => 'Module',
                                            'empty_option' => 'Choose module',
                                            'disable_inarray_validator' => true,
                                        ],
                                        'attributes' => [
                                            'required' => 'required',
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
                                        ],
                                        'attributes' => [
                                            'required' => 'true',
                                            'class' => 'form-control',
                                            'value' => 1
                                        ],

                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_alert_email_days',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_days',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_days tooltip'
                                        ],
                                        'attributes' => [
                                            'placeholder' => '365',
                                            'class' => 'mgdprc_alert_email_days form-control col-md-2'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_alert_email_resend',
                                        'type' => "checkbox",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_resend',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_resend tooltip',
                                            'switch_options' => [
                                                'label-on' => 'Yes',
                                                'label-off' => 'No',
                                                'icon' => "glyphicon glyphicon-resize-horizontal",
                                            ]
                                        ],
                                        'attributes' => [
                                            'value' => 1
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_delete_days',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_delete_days',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_cron_alert_email_delete_days tooltip'
                                        ],
                                        'attributes' => [
                                            'placeholder' => '365',
                                            'class' => 'mgdprc_delete_days form-control col-md-2'
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
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
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
                                            'label' => 'Sender name',
                                            'tooltip' => 'Name of the sender',
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
                                            'label' => 'Sender email (From)',
                                            'tooltip' => 'Email of the sender (from)',
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
                                            'label' => 'Reply to',
                                            'tooltip' => 'Reply to',
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
                                            'tooltip' => "Each email allows to replace words (Tags) by a value. The list of accepted tags depends and changes according to each email. These tags can then be placed in the content of the email by writing their name between brackets (ex: [NAME])",
                                        ],
                                        'attributes' => [
                                            'data-label-text' => 'tr_melis_core_gdpr_autodelete_label_email_setup_tags',
                                            'class' => 'melis-multi-val-input',
                                            'placeholder' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_tag_accepted_list_placeholder'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_layout',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_email_setup_layout',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_email_setup_layout tooltip',
                                        ],
                                        'attributes' => [
                                            'placeholder' => 'melis-core/view/layout/layoutEmail.phtml',
                                            'value' => 'melis-core/view/layout/layoutEmail.phtml'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdprc_email_conf_layout_title',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_email_setup_title',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_email_setup_title tooltip',
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
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_email_setup_logo',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_email_setup_logo tooltip',
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
                                            'label' => 'tr_melis_core_gdpr_autodelete_label_email_setup_layout_desc',
                                            'tooltip' => 'tr_melis_core_gdpr_autodelete_label_email_setup_layout_desc tooltip',
                                        ]
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
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ], [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_melis_core_gdpr_autodelete_invalid_email',
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
                                'mgdprc_email_conf_from_email' => [
                                    'name' => 'mgdprc_email_conf_from_email',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ], [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_melis_core_gdpr_autodelete_invalid_email',
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
                                'mgdprc_email_conf_reply_to' => [
                                    'name' => 'mgdprc_email_conf_reply_to',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ], [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain'   => 'true',
                                                'hostname' => 'true',
                                                'mx'       => 'true',
                                                'deep'     => 'true',
                                                'message'  => 'tr_melis_core_gdpr_autodelete_invalid_email',
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
                                'mgdprc_email_conf_layout' => [
                                    'name' => 'mgdprc_email_conf_layout',
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
                                            'tooltip' => "Each email allows to replace words (Tags) by a value. The list of accepted tags depends and changes according to each email. These tags can then be placed in the content of the email by writing their name between brackets (ex: [NAME])",
                                        ],
                                        'attributes' => [
                                            'required' => 'required',
                                            'class' => 'melis-multi-val-input',
                                            'data-label-text' => 'Replacement tags accepted',
                                            'placeholder' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_tag_accepted_list_placeholder'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_subject',
                                        'type' => "text",
                                        'options' => [
                                            'label' => 'Subject',
                                            'tooltip' => 'Subject of the email',
                                        ],
                                        'attributes' => [
                                            'required' => 'true',
                                            'class' => 'form-control'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_html',
                                        'type' => "MelisCoreTinyMCE",
                                        'options' => [
                                            'label' => 'Message',
                                            'tooltip' => 'Message of the email',
                                        ],
                                        'attributes' => [
                                            'required' => 'true',
                                            'class' => 'form-control'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_text',
                                        'type' => "textarea",
                                        'options' => [
                                            'label' => 'Text Version',
                                            'tooltip' => 'Message of the email in text version',
                                        ],
                                        'attributes' => [
                                            'required' => 'true',
                                            'class' => 'form-control'
                                        ]
                                    ],
                                ],
                            ],
                            'input_filter' => [
                                'mgdpre_email_tags' => [
                                    'name' => 'mgdpre_email_tags',
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
                        ],
                        // </editor-fold>
                          // <editor-fold desc="GDPR Alert email form delete">
                        'melisgdprautodelete_add_edit_alert_email_delete' => [
                            'attributes' => array(
                                'name' => 'melisgdprautodelete_add_edit_alert_email_delete',
                                'method' => 'POST',
                                'action' => '',
                                'class' => 'melisgdprautodelete_add_edit_alert_email_delete'
                            ),
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_email_tags',
                                        'type' => "text",
                                        'options' => [
                                            'tooltip' => "Each email allows to replace words (Tags) by a value. The list of accepted tags depends and changes according to each email. These tags can then be placed in the content of the email by writing their name between brackets (ex: [NAME])",
                                        ],
                                        'attributes' => [
                                            'required' => 'true',
                                            'class' => 'melis-multi-val-input',
                                            'data-label-text' => 'Replacement tags accepted',
                                            'placeholder' => 'tr_meliscore_emails_mngt_tool_general_properties_form_boe_tag_accepted_list_placeholder'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_subject',
                                        'type' => "text",
                                        'options' => [
                                            'label' => 'Subject',
                                            'tooltip' => 'Subject of the email',
                                        ],
                                        'attributes' => [
                                            'required' => 'true',
                                            'class' => 'form-control'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_html',
                                        'type' => "MelisCoreTinyMCE",
                                        'options' => [
                                            'label' => 'Message',
                                            'tooltip' => 'Message of the email',
                                        ],
                                        'attributes' => [
                                            'required' => 'true',
                                            'class' => 'form-control'
                                        ]
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpre_text',
                                        'type' => "textarea",
                                        'options' => [
                                            'label' => 'Text Version',
                                            'tooltip' => 'Message of the email in text version',
                                        ],
                                        'attributes' => [
                                            'required' => 'true',
                                            'class' => 'form-control'
                                        ]
                                    ]
                                ]
                            ]
                        ]// </editor-fold>
                    ]
                ]
            ]
        ]
    ]
];