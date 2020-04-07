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
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'mgdpr_smtp_id',
                                        'type' => "hidden",
                                    ]
                                ],
                                [
                                    'spec' => [
                                        'name' => 'mgdpr_smtp_host',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'Host',
                                            'tooltip' => "Host of the server",
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
                                            'label' => 'Username',
                                            'tooltip' => "Username of the user",
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
                                            'label' => 'Password',
                                            'tooltip' => "Password of the user",
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
                                            'label' => 'Confirm password',
                                            'tooltip' => "Confirm password of the user",
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
                                'mgdpr_smtp_username' => [
                                    'name' => 'mgdpr_smtp_username',
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
                                'mgdpr_smtp_confirm_password' => [
                                    'name' => 'mgdpr_smtp_confirm_password',
                                    'required' => true,
                                    'label' => 'test',
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
                        ]
                    ]
                ]
            ]
        ]
    ]
];