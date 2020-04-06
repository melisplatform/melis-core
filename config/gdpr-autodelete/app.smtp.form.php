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
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];