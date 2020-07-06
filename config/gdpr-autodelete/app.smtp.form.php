<?php

return [
    'plugins' => [
        'MelisCoreGdprAutoDelete' => [
            'tools' => [
                'melis_core_gdpr_auto_delete' => [
                    'forms' => [
                        'melisgdprautodelete_smtp_form' => [
                            'attributes' => [
                                'name' => 'melisgdprautodelete_smtp_form',
                                'method' => 'POST',
                                'action' => '',
                                'class' => 'melisgdprautodelete_smtp_form',
                                'id' => 'melisgdprautodelete_smtp_form'
                            ],
                            'hydrator' => 'Laminas\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'mgdpr_smtp_id',
                                        'type' => "hidden",
                                        'attributes' => [
                                            'id' => 'mgdpr_smtp_id'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpr_smtp_host',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_smtp_form_mgdpr_smtp_host',
                                            'tooltip' => "tr_smtp_form_mgdpr_smtp_host tooltip",
                                        ],
                                        'attributes' => [
                                            'required' => 'required',
                                            'placeholder' => 'Host'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpr_smtp_username',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'tr_smtp_form_mgdpr_smtp_username',
                                            'tooltip' => "tr_smtp_form_mgdpr_smtp_username tooltip",
                                        ],
                                        'attributes' => [
                                            'required' => 'required',
                                            'placeholder' => 'Username'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpr_smtp_password',
                                        'type' => "password",
                                        'options' => [
                                            'label' => 'tr_smtp_form_mgdpr_smtp_password',
                                            'tooltip' => "tr_smtp_form_mgdpr_smtp_password tooltip",
                                        ],
                                        'attributes' => [
                                            'required' => 'required',
                                            'class' => 'form-control',
                                            'placeholder' => 'Password'
                                        ]
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpr_smtp_confirm_password',
                                        'type' => "password",
                                        'options' => [
                                            'label' => 'tr_smtp_form_mgdpr_smtp_confirm_password',
                                            'tooltip' => "tr_smtp_form_mgdpr_smtp_confirm_password tooltip",
                                        ],
                                        'attributes' => [
                                            'required' => 'required',
                                            'class' => 'form-control',
                                            'placeholder' => 'Password'
                                        ]
                                    ]
                                ],
                            ],
                            'input_filter' => [
                                'mgdpr_smtp_host' => [
                                    'name' => 'mgdpr_smtp_host',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ]
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim']
                                    ]
                                ],
                                'mgdpr_smtp_username' => [
                                    'name' => 'mgdpr_smtp_username',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ]
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim']
                                    ]
                                ],
                                'mgdpr_smtp_password' => [
                                    'name' => 'mgdpr_smtp_password',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
                                                ]
                                            ]
                                        ]
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim']
                                    ]
                                ],
                                'mgdpr_smtp_confirm_password' => [
                                    'name' => 'mgdpr_smtp_confirm_password',
                                    'required' => true,
                                    'label' => 'test',
                                    'validators' => [
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_emails_mngt_tool_general_properties_form_empty',
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
                        ]
                    ]
                ]
            ]
        ]
    ]
];