<?php

namespace MelisCore;

return [
    'plugins' => [
        __NAMESPACE__ => [
            'setup' => [
                'download' => [
                    'form' => [
                        'melis_core_setup_user_form' => [
                            'attributes' => [
                                'name' => 'melis_core_setup_user_form',
                                'id' => 'melis_core_setup_user_form',
                                'method' => 'POST',
                                'action' => '',
                            ],
                            'hydrator' => 'Zend\Stdlib\Hydrator\ArraySerializable',
                            'elements' => [
                                [
                                    'spec' => [
                                        'name' => 'login',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melis_installer_new_user_login',
                                            'tooltip' => 'tr_melis_installer_new_user_login_info',
                                        ],
                                        'attributes' => [
                                            'id' => 'login',
                                            'value' => '',
                                            'placeholder' => 'tr_melis_installer_new_user_login',
                                            'text-required' => '*',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'email',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melis_installer_new_user_email',
                                            'tooltip' => 'tr_melis_installer_new_user_email_info',
                                        ],
                                        'attributes' => [
                                            'id' => 'email',
                                            'value' => '',
                                            'placeholder' => 'tr_melis_installer_new_user_email',
                                            'class' => 'form-control',
                                            'text-required' => '*',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'password',
                                        'type' => 'Password',
                                        'options' => [
                                            'label' => 'tr_melis_installer_new_user_password',
                                            'tooltip' => 'tr_melis_installer_new_user_password_info',
                                        ],
                                        'attributes' => [
                                            'id' => 'password',
                                            'value' => '',
                                            'placeholder' => 'tr_melis_installer_new_user_password',
                                            'class' => 'form-control',
                                            'text-required' => '*',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'confirmPassword',
                                        'type' => 'Password',
                                        'options' => [
                                            'label' => 'tr_Melis_installer_new_user_confirm_password',
                                            'tooltip' => 'tr_Melis_installer_new_user_confirm_password_info',
                                        ],
                                        'attributes' => [
                                            'id' => 'confirmPassword',
                                            'value' => '',
                                            'placeholder' => 'tr_Melis_installer_new_user_confirm_password',
                                            'class' => 'form-control',
                                            'text-required' => '*',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'firstname',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melis_installer_new_user_first_name',
                                            'tooltip' => 'tr_melis_installer_new_user_first_name_info',
                                        ],
                                        'attributes' => [
                                            'id' => 'firstname',
                                            'value' => '',
                                            'placeholder' => 'tr_melis_installer_new_user_first_name',
                                            'text-required' => '*',
                                        ],
                                    ],
                                ],
                                [
                                    'spec' => [
                                        'name' => 'lastname',
                                        'type' => 'MelisText',
                                        'options' => [
                                            'label' => 'tr_melis_installer_new_user_last_name',
                                            'tooltip' => 'tr_melis_installer_new_user_last_name_info',
                                        ],
                                        'attributes' => [
                                            'id' => 'lastname',
                                            'value' => '',
                                            'placeholder' => 'tr_melis_installer_new_user_last_name',
                                            'text-required' => '*',
                                        ],
                                    ],
                                ],
                            ], // end elements
                            'input_filter' => [
                                'login' => [
                                    'name' => 'login',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_login_max',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_login_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'regex', false,
                                            'options' => [
                                                'pattern' => '/^[A-Za-z][A-Za-z0-9]*$/',
                                                'messages' => [\Zend\Validator\Regex::NOT_MATCH => 'tr_melis_installer_new_user_login_invalid'],
                                                'encoding' => 'UTF-8',
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'email' => [
                                    'name' => 'email',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'EmailAddress',
                                            'options' => [
                                                'domain' => 'true',
                                                'hostname' => 'true',
                                                'mx' => 'true',
                                                'deep' => 'true',
                                                'message' => 'tr_melis_installer_new_user_email_invalid',
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_email_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'password' => [
                                    'name' => 'password',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => '\MelisInstaller\Validator\MelisPasswordValidator',
                                            'options' => [
                                                'min' => 8,
                                                'messages' => [
                                                    \MelisInstaller\Validator\MelisPasswordValidator::TOO_SHORT => 'tr_melis_installer_new_user_pass_short',
                                                    \MelisInstaller\Validator\MelisPasswordValidator::NO_DIGIT => 'tr_melis_installer_new_user_pass_invalid',
                                                    \MelisInstaller\Validator\MelisPasswordValidator::NO_LOWER => 'tr_melis_installer_new_user_pass_invalid',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_pass_max',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_pass_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'confirmPassword' => [
                                    'name' => 'confirmPassword',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => '\MelisInstaller\Validator\MelisPasswordValidator',
                                            'options' => [
                                                'min' => 8,
                                                'messages' => [
                                                    \MelisInstaller\Validator\MelisPasswordValidator::TOO_SHORT => 'tr_melis_installer_new_user_pass_short',
                                                    \MelisInstaller\Validator\MelisPasswordValidator::NO_DIGIT => 'tr_melis_installer_new_user_pass_invalid',
                                                    \MelisInstaller\Validator\MelisPasswordValidator::NO_LOWER => 'tr_melis_installer_new_user_pass_invalid',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                'max' => 255,
                                                'messages' => [
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_pass_max',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_pass_empty',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'Identical',
                                            'options' => [
                                                'token' => 'password',
                                                'messages' => [
                                                    \Zend\Validator\Identical::NOT_SAME => 'tr_melis_installer_new_user_pass_no_match',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'firstname' => [
                                    'name' => 'firstname',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max' => 255,
                                                'messages' => [
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_first_name_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_first_name_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                                'lastname' => [
                                    'name' => 'lastname',
                                    'required' => true,
                                    'validators' => [
                                        [
                                            'name' => 'StringLength',
                                            'options' => [
                                                'encoding' => 'UTF-8',
                                                //'min'      => 1,
                                                'max' => 255,
                                                'messages' => [
                                                    \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_last_name_long',
                                                ],
                                            ],
                                        ],
                                        [
                                            'name' => 'NotEmpty',
                                            'options' => [
                                                'messages' => [
                                                    \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_last_name_empty',
                                                ],
                                            ],
                                        ],
                                    ],
                                    'filters' => [
                                        ['name' => 'StripTags'],
                                        ['name' => 'StringTrim'],
                                    ],
                                ],
                            ], // end input_filter
                        ],
                    ],
                ],
            ],
        ],
    ],
];
