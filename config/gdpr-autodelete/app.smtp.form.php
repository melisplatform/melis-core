<?php

return [
    'plugins' => [
        'MelisCoreGdprAutoDelete' => [
            'tools' => [
                'melis_core_gdpr_auto_delete' => [
                    'forms' => [
                        'melisgdprautodelete_smtp_form' => [
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
                                        'name' => 'mgdpr_smtp_port',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'Port',
                                            'tooltip' => "Port for the smtp",
                                        ],
                                        'attributes' => [
                                            'required' => 'required',
                                            'placeholder' => 'Port'
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
                                        'name' => 'mgdpr_smtp_ssl',
                                        'type' => "MelisText",
                                        'options' => [
                                            'label' => 'SSL',
                                            'tooltip' => "SSL type",
                                        ],
                                        'attributes' => [
                                            'placeholder' => 'TLS'
                                        ]
                                    ]
                                ],
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];