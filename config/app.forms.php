<?php

return array(
    'plugins' => array(
        'meliscore' => array(
            'forms' => array(
                'meliscore_other_config_login_account_lock_form' => [
                    'attributes' => [
                        'name' => 'otherConfigForm',
                        'id' => 'login-lock-form',
                        'method' => 'POST',
                        'action' => '',
                    ],
                    'hydrator' => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => [
                        [
                            'spec' => [
                                'name' => 'login_account_lock_status',
                                'type' => 'Select',
                                'options' => [
                                    'tooltip' => 'tr_meliscore_tool_other_config_activate_the_lock_account_option_for_failed_login_attempts_tooltip',
                                    'label' => 'tr_meliscore_tool_other_config_activate_the_lock_account_option_for_failed_login_attempts',
                                    'checked_value' => '1',
                                    'unchecked_value' => '0',
                                    'switchOptions' => array(
                                        'label-on' => 'tr_meliscore_tool_other_config_login_account_lock_status_active',
                                        'label-off' => 'tr_meliscore_tool_other_config_login_account_lock_status_inactive',
                                        'label' => "<i class='glyphicon glyphicon-resize-horizontal'></i>",
                                    ),
                                    'disable_inarray_validator' => true,
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'login_account_lock_status'
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'login_account_admin_email',
                                'type' => 'MelisText',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_login_account_admin_email',
                                    'tooltip' => 'tr_meliscore_tool_other_config_login_account_admin_email_tooltip',
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'login_account_admin_email'
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'login_account_lock_number_of_attempts',
                                'type' => 'MelisText',
                                'options' => [
                                    'tooltip' => 'tr_meliscore_tool_other_config_number_of_attempts_before_account_is_locked_tooltip',
                                    'label' => 'tr_meliscore_tool_other_config_number_of_attempts_before_account_is_locked',
                                    'class' => 'd-flex flex-row justify-content-between',
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'login_account_lock_number_of_attempts'
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'login_account_type_of_lock',
                                'type' => 'Laminas\Form\Element\Radio',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_type_of_lock',
                                    'tooltip' => 'tr_meliscore_tool_other_config_type_of_lock_tooltip',
                                    'value_options' => array(
                                        'admin' => 'Admin',
                                        'timer' => 'Timer',
                                    ),
                                    'label_attributes' => array(
                                        'class' => 'melis-radio-box',
                                    ),
                                ],
                                'attributes' => [
                                    'id' => 'login_account_type_of_lock',
                                    'class' => 'form-control',
                                    'required' => false,
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'login_account_duration_days',
                                'type' => 'MelisText',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_duration_of_lock_days',
                                    'class' => 'd-flex flex-row justify-content-between',
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'login_account_duration_days'
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'login_account_duration_hours',
                                'type' => 'MelisText',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_duration_of_lock_hours',
                                    'class' => 'd-flex flex-row justify-content-between',
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'login_account_duration_hours'
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'login_account_duration_minutes',
                                'type' => 'MelisText',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_duration_of_lock_minutes',
                                    'class' => 'd-flex flex-row justify-content-between',
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'login_account_duration_minutes'
                                ],
                            ],
                        ],
                    ],
                    'input_filter' => [
                        'login_account_admin_email' => [
                            'name' => 'login_account_admin_email',
                            'required' => true,
                            'validators' => [
                                [
                                    'name' => 'NotEmpty',
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
                        'login_account_lock_number_of_attempts' => [
                            'name'     => 'login_account_lock_number_of_attempts',
                            'required' => true,
                            'validators' => [
                                [
                                    'name' => 'NotEmpty',
                                    'options' => [
                                        'messages' => [
                                            \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_not_be_empty',
                                        ],
                                    ],
                                ],
                                [
                                    'name' => 'Regex',
                                    'options' => [
                                        'pattern' => '/^[0-9]+$/',
                                        'messages' => [
                                            \Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric'
                                        ],
                                        'encoding' => 'UTF-8',
                                    ],
                                ]
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'login_account_duration_days' => [
                            'name'     => 'login_account_duration_days',
                            'required' => true,
                            'validators' => [
                                [
                                    'name' => 'NotEmpty',
                                    'options' => [
                                        'messages' => [
                                            \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_not_be_empty',
                                        ],
                                    ],
                                ],
                                [
                                    'name' => 'Regex',
                                    'options' => [
                                        'pattern' => '/^[0-9]+$/',
                                        'messages' => [
                                            \Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric'
                                        ],
                                        'encoding' => 'UTF-8',
                                    ],
                                ]
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'login_account_duration_hours' => [
                            'name'     => 'login_account_duration_hours',
                            'required' => true,
                            'validators' => [
                                [
                                    'name' => 'NotEmpty',
                                    'options' => [
                                        'messages' => [
                                            \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_not_be_empty',
                                        ],
                                    ],
                                ],
                                [
                                    'name' => 'Regex',
                                    'options' => [
                                        'pattern' => '/^[0-9]+$/',
                                        'messages' => [
                                            \Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric'
                                        ],
                                        'encoding' => 'UTF-8',
                                    ],
                                ]
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'login_account_duration_minutes' => [
                            'name'     => 'login_account_duration_minutes',
                            'required' => true,
                            'validators' => [
                                [
                                    'name' => 'NotEmpty',
                                    'options' => [
                                        'messages' => [
                                            \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_not_be_empty',
                                        ],
                                    ],
                                ],
                                [
                                    'name' => 'Regex',
                                    'options' => [
                                        'pattern' => '/^[0-9]+$/',
                                        'messages' => [
                                            \Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric'
                                        ],
                                        'encoding' => 'UTF-8',
                                    ],
                                ]
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                    ],
                ],
                'meliscore_other_config_password_validity_form' => [
                    'attributes' => [
                        'name' => 'otherConfigForm',
                        'id' => 'password-validity-form',
                        'method' => 'POST',
                        'action' => '',
                    ],
                    'hydrator' => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => [
                        [
                            'spec' => [
                                'name' => 'password_validity_status',
                                'type' => 'Select',
                                'options' => [
                                    'tooltip' => 'tr_meliscore_tool_other_config_password_validity_lifetime_status_tooltip',
                                    'label' => 'tr_meliscore_tool_other_config_password_validity_lifetime_status',
                                    'checked_value' => '1',
                                    'unchecked_value' => '0',
                                    'switchOptions' => array(
                                        'label-on' => 'tr_meliscore_tool_other_config_password_validity_lifetime_status_active',
                                        'label-off' => 'tr_meliscore_tool_other_config_password_validity_lifetime_status_inactive',
                                        'label' => "<i class='glyphicon glyphicon-resize-horizontal'></i>",
                                    ),
                                    'disable_inarray_validator' => true,
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'password_validity_status'
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'password_validity_lifetime',
                                'type' => 'MelisText',
                                'options' => [
                                    'tooltip' => 'tr_meliscore_tool_other_config_password_validity_lifetime_tooltip',
                                    'label' => 'tr_meliscore_tool_other_config_password_validity_lifetime',
                                    'class' => 'd-flex flex-row justify-content-between',
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'password_validity_lifetime'
                                ],
                            ],
                        ],
                    ],
                    'input_filter' => [
                        'password_validity_lifetime' => [
                            'name'     => 'password_validity_lifetime',
                            'required' => true,
                            'validators' => [
                                [
                                    'name' => 'NotEmpty',
                                    'options' => [
                                        'messages' => [
                                            \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_not_be_empty',
                                        ],
                                    ],
                                ],
                                [
                                    'name' => 'Regex',
                                    'options' => [
                                        'pattern' => '/^[0-9]+$/',
                                        'messages' => [
                                            \Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric'
                                        ],
                                        'encoding' => 'UTF-8',
                                    ],
                                ]
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                    ],
                ],
                'meliscore_other_config_password_duplicate_form' => [
                    'attributes' => [
                        'name' => 'otherConfigForm',
                        'id' => 'password-duplicate-form',
                        'method' => 'POST',
                        'action' => '',
                    ],
                    'hydrator' => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => [
                        [
                            'spec' => [
                                'name' => 'password_duplicate_status',
                                'type' => 'Select',
                                'options' => [
                                    'tooltip' => 'tr_meliscore_tool_other_config_password_duplicate_status_tooltip',
                                    'label' => 'tr_meliscore_tool_other_config_password_duplicate_status',
                                    'checked_value' => '1',
                                    'unchecked_value' => '0',
                                    'switchOptions' => array(
                                        'label-on' => 'tr_meliscore_tool_other_config_password_duplicate_status_active',
                                        'label-off' => 'tr_meliscore_tool_other_config_password_duplicate_status_inactive',
                                        'label' => "<i class='glyphicon glyphicon-resize-horizontal'></i>",
                                    ),
                                    'disable_inarray_validator' => true,
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'password_duplicate_status'
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'password_duplicate_lifetime',
                                'type' => 'MelisText',
                                'options' => [
                                    'tooltip' => 'tr_meliscore_tool_other_config_password_duplicate_lifetime_tooltip',
                                    'label' => 'tr_meliscore_tool_other_config_password_duplicate_lifetime',
                                    'class' => 'd-flex flex-row justify-content-between',
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'password_duplicate_lifetime'
                                ],
                            ],
                        ],
                    ],
                    'input_filter' => [
                        'password_duplicate_lifetime' => [
                            'name'     => 'password_duplicate_lifetime',
                            'required' => true,
                            'validators' => [
                                [
                                    'name' => 'NotEmpty',
                                    'options' => [
                                        'messages' => [
                                            \Laminas\Validator\NotEmpty::IS_EMPTY => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_not_be_empty',
                                        ],
                                    ],
                                ],
                                [
                                    'name' => 'Regex',
                                    'options' => [
                                        'pattern' => '/^[0-9]+$/',
                                        'messages' => [
                                            \Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric'
                                        ],
                                        'encoding' => 'UTF-8',
                                    ],
                                ]
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                    ],
                ],
                'meliscore_other_config_password_complexity_form' => [
                    'attributes' => [
                        'name' => 'otherConfigForm',
                        'id' => 'password-complexity-form',
                        'method' => 'POST',
                        'action' => '',
                    ],
                    'hydrator' => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => [
                        [
                            'spec' => [
                                'name' => 'password_complexity_number_of_characters',
                                'type' => 'MelisText',
                                'options' => [
                                    'tooltip' => 'Specify the minimum number of characters required for a password.',
                                    'label' => 'tr_meliscore_tool_other_config_password_complexity_number_of_characters',
                                    'class' => 'd-flex flex-row justify-content-between',
                                ],
                                'attributes' => [
                                    'class' => 'form-control',
                                    'id' => 'password_complexity_number_of_characters'
                                ],
                            ],
                        ],
                        [
                            'spec' => [
                                'name' => 'password_complexity_use_special_characters',
                                'type' => 'Checkbox',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_password_complexity_special_characters',
                                    'checked_value' => '1',
                                    'unchecked_value' => '0',
                                    'disable_inarray_validator' => true,
                                ],
                                'attributes' => [
                                    'class' => 'form-control text-center',
                                    'id' => 'password_complexity_use_special_characters',
                                    'style' => "cursor:pointer;width:20px;height:20px;margin:0 auto;"
                                ]
                            ]
                        ],
                        [
                            'spec' => [
                                'name' => 'password_complexity_use_lower_case',
                                'type' => 'Checkbox',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_password_complexity_lower_case',
                                    'checked_value' => '1',
                                    'unchecked_value' => '0',
                                    'disable_inarray_validator' => true,
                                ],
                                'attributes' => [
                                    'class' => 'form-control text-center',
                                    'id' => 'password_complexity_use_lower_case',
                                    'style' => "cursor:pointer;width:20px;height:20px;margin:0 auto;"
                                ]
                            ]
                        ],
                        [
                            'spec' => [
                                'name' => 'password_complexity_use_upper_case',
                                'type' => 'Checkbox',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_password_complexity_upper_case',
                                    'checked_value' => '1',
                                    'unchecked_value' => '0',
                                    'disable_inarray_validator' => true,
                                ],
                                'attributes' => [
                                    'class' => 'form-control text-center',
                                    'id' => 'password_complexity_use_upper_case',
                                    'style' => "cursor:pointer;width:20px;height:20px;margin:0 auto;"
                                ]
                            ]
                        ],
                        [
                            'spec' => [
                                'name' => 'password_complexity_use_digit',
                                'type' => 'Checkbox',
                                'options' => [
                                    'label' => 'tr_meliscore_tool_other_config_password_complexity_digit',
                                    'checked_value' => '1',
                                    'unchecked_value' => '0',
                                    'disable_inarray_validator' => true,
                                ],
                                'attributes' => [
                                    'class' => 'form-control text-center',
                                    'id' => 'password_complexity_use_digit',
                                    'style' => "cursor:pointer;width:20px;height:20px;margin:0 auto;"
                                ]
                            ]
                        ],
                    ],
                    'input_filter' => [
                        'password_complexity_number_of_characters' => [
                            'name'     => 'password_complexity_number_of_characters',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'Regex',
                                    'options' => [
                                        'pattern' => '/^[0-9]+$/',
                                        'messages' => [
                                            \Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_tool_other_config_password_validity_lifetime_must_be_numeric'
                                        ],
                                        'encoding' => 'UTF-8',
                                    ],
                                ]
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'password_complexity_use_special_characters' => [
                            'name' => 'password_complexity_use_special_characters',
                            'required' => false,
                        ],
                        'password_complexity_use_lower_case' => [
                            'name' => 'password_complexity_use_lower_case',
                            'required' => false,
                        ],
                        'password_complexity_use_upper_case' => [
                            'name' => 'password_complexity_use_upper_case',
                            'required' => false,
                        ],
                        'password_complexity_use_digit' => [
                            'name' => 'password_complexity_use_digit',
                            'required' => false,
                        ],
                    ],
                ],
                'meliscore_login' => array(
                    'attributes' => array(
                        'name' => 'meliscore_login',
                        'id' => 'idformmeliscorelogin',
                        'method' => 'POST',
                        //'action' => '/melis/MelisCore/MelisAuth/authenticate',
                    ),
                    'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => array(
                        array(
                            'spec' => array(
                                'name' => 'usr_login',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_login_form_Login',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_login',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_login_form_Login',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'usr_password',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_meliscore_login_form_Password',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_password',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_login_form_Password',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'login_submit',
                                'type' => 'Submit',
                                'attributes' => array(
                                    'value' => 'tr_meliscore_login_form_submittext_Connect',
                                    'id' => 'login_submit',
                                    'class' => 'btn btn-primary btn-block',
                                ),
                            ),
                        ),
                        /* array(
					        'spec' => array(
					            'name' => 'usr_rem',
					            'type' => 'checkbox',
                                 'options' => array(
                                     'label' => 'tr_meliscore_login_remember_me',
                                     'label_attributes' => array('class'=>'checkbox'),
                                 ),
					        ),
					    ), */
                    ),
                ),
                'meliscore_forgot' => array(
                    'attributes' => array(
                        'name' => 'meliscore_forgot',
                        'id' => 'idformmeliscoreforgot',
                        'method' => 'POST',
                        'novalidate' => 'novalidate',
                        //'action' => '/melis/lost-password-request',
                    ),
                    'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => array(
                        array(
                            'spec' => array(
                                'name' => 'usr_email',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_forgot_form_email',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_login',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_forgot_form_email',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'usr_login',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_forgot_form_login',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_login',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_forgot_form_login',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'forgot_submit',
                                'type' => 'submit',
                                'attributes' => array(
                                    'value' => 'tr_meliscore_forgot_form_submit',
                                    'id' => 'forgot_submit',
                                    'class' => 'btn btn-primary btn-block',
                                ),
                            ),
                        ),
                    ),
                ),

                'meliscore_resetpass' => array(
                    'attributes' => array(
                        'name' => 'meliscore_reset_pass',
                        'id' => 'idformmeliscoreresetpass',
                        'method' => 'POST',
                        'novalidate' => 'novalidate',
                    ),
                    'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => array(
                        array(
                            'spec' => array(
                                'name' => 'usr_pass',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_meliscore_reset_password',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_pass',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_reset_password',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'usr_pass_confirm',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_meliscore_reset_password_confirm',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_pass_confirm',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_reset_password_confirm',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'reset_submit',
                                'type' => 'submit',
                                'attributes' => array(
                                    'value' => 'tr_meliscore_reset_password_button',
                                    'id' => 'reset_submit',
                                    'class' => 'btn btn-primary btn-block',
                                ),
                            ),
                        ),
                    ),
                ),
                'meliscore_generatepass' => array(
                    'attributes' => array(
                        'name' => 'meliscore_generate_password',
                        'id' => 'idformmeliscoregeneratepass',
                        'method' => 'POST',
                        'novalidate' => 'novalidate',
                    ),
                    'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => array(
                        array(
                            'spec' => array(
                                'name' => 'usr_pass',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_meliscore_reset_password',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_pass',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_reset_password',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'usr_pass_confirm',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_meliscore_reset_password_confirm',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_pass_confirm',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_reset_password_confirm',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'generate_submit',
                                'type' => 'submit',
                                'attributes' => array(
                                    'value' => 'tr_meliscore_generate_password_button',
                                    'id' => 'generate_submit',
                                    'class' => 'btn btn-primary btn-block',
                                ),
                            ),
                        ),
                    ),
                ),
                'meliscore_renewpass' => array(
                    'attributes' => array(
                        'name' => 'meliscore_renew_password',
                        'id' => 'idformmeliscorerenewpass',
                        'method' => 'POST',
                        'novalidate' => 'novalidate',
                    ),
                    'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => array(
                        array(
                            'spec' => array(
                                'name' => 'usr_pass',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_meliscore_reset_password',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_pass',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_reset_password',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'usr_pass_confirm',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_meliscore_reset_password_confirm',
                                ),
                                'attributes' => array(
                                    'id' => 'id_usr_pass_confirm',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_reset_password_confirm',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'renew_submit',
                                'type' => 'submit',
                                'attributes' => array(
                                    'value' => 'tr_meliscore_renew_password_button',
                                    'id' => 'renew_submit',
                                    'class' => 'btn btn-primary btn-block',
                                ),
                            ),
                        ),
                    ),
                ),
                // Platform Color scheme form
                'melis_core_platform_scheme_form' => array(
                    'attributes' => array(
                        'name' => 'melis_core_platform_scheme_form',
                        'id' => 'melis_core_platform_scheme_form',
                        'class' => 'd-md-flex flex-row justify-content-between row',
                        'method' => 'POST',
                    ),
                    'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => array(
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_color_primary_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_color_primary',
                                    'tooltip' => 'tr_meliscore_platform_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_color_primary_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_color_primary',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_color_secondary_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_color_secondary',
                                    'tooltip' => 'tr_meliscore_platform_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_color_secondary_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'placeholder' => 'tr_meliscore_platform_color_secondary',
                                ),
                            ),
                        ),
                        /* array(
                            'spec' => array(
                                'name' => 'melis_core_platform_color_sidebar_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_color_sidebar_bg',
                                    'tooltip' => 'tr_meliscore_platform_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_color_sidebar_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'placeholder' => 'color',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_color_login_link_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_color_login_link',
                                    'tooltip' => 'tr_meliscore_platform_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_color_login_link_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'placeholder' => 'color',
                                ),
                            ),
                        ), */
                    ),
                    'input_filter' => array(
                        'melis_core_platform_color_primary_color' => array(
                            'name'     => 'melis_core_platform_color_primary_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_color_secondary_color' => array(
                            'name'     => 'melis_core_platform_color_secondary_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        /* 'melis_core_platform_color_sidebar_bg_color' => array(
                            'name'     => 'melis_core_platform_color_sidebar_bg_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex', false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_color_login_link_color' => array(
                            'name'     => 'melis_core_platform_color_login_link_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex', false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ), */
                    )
                ),
                // End Platform Color scheme form

                // Platform scheme images form
                'melis_core_platform_scheme_images_form' => array(
                    'attributes' => array(
                        'name' => 'melis_core_platform_scheme_images_form',
                        'id' => 'melis_core_platform_scheme_images_form',
                        'method' => 'POST',
                    ),
                    'elements' => array(),
                    'input_filter' => array()
                ),

                // Platform Theme Option form
                'melis_core_platform_theme_option_form' => array(
                    'attributes' => array(
                        'name' => 'melis_core_platform_theme_option_form',
                        'id' => 'melis_core_platform_theme_option_form',
                        'class' => 'd-md-flex flex-row justify-content-between row',
                        'method' => 'POST',
                    ),
                    'hydrator'  => 'Laminas\Hydrator\ArraySerializableHydrator',
                    'elements' => array(
                        //Logo
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_toggle_btn_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_toggle_btn_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_toggle_btn_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_toggle_btn_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_toggle_btn_color',
                                    'category' => 'logo',
                                    'default' => '#ce5459'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_toggle_btn_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_toggle_btn_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_toggle_btn_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_toggle_btn_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_toggle_btn_hover_color',
                                    'category' => 'logo',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_logo_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_logo_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_logo_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_logo_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_logo_bg_color',
                                    'category' => 'logo',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_logo_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_logo_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_logo_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_logo_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_logo_text_color',
                                    'category' => 'logo',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_logo_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_logo_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_logo_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_logo_text_font_size',
                                    'value' => '',
                                    'class' => 'form-control logo-font-size-range-slider-value range-slider-value',
                                    'placeholder' => 'tr_meliscore_platform_theme_logo_text_font_size',
                                    'category' => 'logo',
                                    'sliderId' => 'logo-font-size-range-slider-min',
                                    'sliderClass' => 'logo-font-size-range-slider-min',
                                    'default' => 18
                                ),
                            ),
                        ),

                        //User Profile
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_user_profile_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_user_profile_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_user_profile_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_user_profile_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_user_profile_bg_color',
                                    'category' => 'user_profile',
                                    'default' => '#373737'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_user_profile_img_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_user_profile_img_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_user_profile_img_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_user_profile_img_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_user_profile_img_border_color',
                                    'category' => 'user_profile',
                                    'default' => '#4e4e4e'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_user_profile_img_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_user_profile_img_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_user_profile_img_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_user_profile_img_border_radius',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_user_profile_img_border_radius',
                                    'category' => 'user_profile',
                                    'default' => '50%'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_user_profile_name_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_user_profile_name_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_user_profile_name_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_user_profile_name_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_user_profile_name_text_color',
                                    'category' => 'user_profile',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_user_profile_status_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_user_profile_status_text_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_user_profile_status_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_user_profile_status_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_user_profile_status_text_icon_color',
                                    'category' => 'user_profile',
                                    'default' => '#198754'
                                ),
                            ),
                        ),

                        //Menu
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_menu_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_menu_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_menu_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_menu_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_menu_bg_color',
                                    'category' => 'menu',
                                    'default' => '#373737'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_menu_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_menu_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_menu_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_menu_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_menu_hover_color',
                                    'category' => 'menu',
                                    'default' => '#2c2c2c'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_menu_focus_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_menu_focus_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_menu_focus_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_menu_focus_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_menu_focus_color',
                                    'category' => 'menu',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_menu_border_bottom_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_menu_border_bottom_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_menu_border_bottom_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_menu_border_bottom_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_menu_border_bottom_color',
                                    'category' => 'menu',
                                    'default' => '#2c2c2c'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_menu_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_menu_text_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_menu_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_menu_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_menu_text_icon_color',
                                    'category' => 'menu',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_submenu_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_submenu_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_submenu_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_submenu_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_submenu_bg_color',
                                    'category' => 'menu',
                                    'default' => '#373737'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_submenu_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_submenu_text_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_submenu_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_submenu_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_submenu_text_icon_color',
                                    'category' => 'menu',
                                    'default' => '#5a5a5a'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_submenu_text_icon_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_submenu_text_icon_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_submenu_text_icon_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_submenu_text_icon_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_submenu_text_icon_hover_color',
                                    'category' => 'menu',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_submenu_hover_active_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_submenu_hover_active_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_submenu_hover_active_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_submenu_hover_active_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_submenu_hover_active_bg_color',
                                    'category' => 'menu',
                                    'default' => '#3a3a3a'
                                ),
                            ),
                        ),

                        //Footer
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_login_page_footer_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_login_page_footer_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_login_page_footer_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_login_page_footer_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    //'placeholder' => 'tr_meliscore_platform_theme_footer_text_color',
                                    'category' => 'footer',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_footer_text_fontsize',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_footer_text_fontsize',
                                    'tooltip' => 'tr_meliscore_platform_theme_footer_text_fontsize_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_footer_text_fontsize',
                                    'value' => '',
                                    'class' => 'footer-version-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_footer_text_fontsize',
                                    'category' => 'footer',
                                    'sliderId' => 'footer-version-font-size-range-slider-min',
                                    'sliderClass' => 'footer-version-font-size-range-slider-min',
                                    'default' => 10
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_footer_link_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_footer_link_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_footer_link_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_footer_link_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_footer_link_text_color',
                                    'category' => 'footer',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_footer_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_footer_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_footer_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_footer_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_footer_text_color',
                                    'category' => 'footer',
                                    'default' => '#686868'
                                ),
                            ),
                        ),

                        //Header
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_header_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_header_text_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_header_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_header_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_header_text_icon_color',
                                    'category' => 'header',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_header_text_icon_active_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_header_text_icon_active_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_header_text_icon_active_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_header_text_icon_active_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_header_text_icon_active_color',
                                    'category' => 'header',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_header_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_header_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_header_bg_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_header_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_header_bg_color',
                                    'category' => 'header',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_header_bg_active_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_header_bg_active_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_header_bg_active_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_header_bg_active_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_header_bg_active_color',
                                    'category' => 'header',
                                    'default' => '#fff'
                                ),
                            ),
                        ),

                        //Bubble plugins
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_icon_color',
                                    'category' => 'bubble',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_icon_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_icon_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_icon_hover_color',
                                    'category' => 'bubble',
                                    'default' => '#466baf'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_hide_btn_bg_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_bg_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_bg_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_hide_btn_bg_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_bg_border_color',
                                    'category' => 'bubble',
                                    'default' => '#466baf'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_hide_btn_bg_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_bg_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_bg_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_hide_btn_bg_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_bg_hover_color',
                                    'category' => 'bubble',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_hide_btn_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_hide_btn_text_font_size',
                                    'value' => '',
                                    'class' => 'hide-btn-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_hide_btn_text_font_size',
                                    'category' => 'bubble',
                                    'sliderId' => 'hide-btn-text-font-size-range-slider-min',
                                    'sliderClass' => 'hide-btn-text-font-size-range-slider-min',
                                    'default' => '10'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_bg_color',
                                    'category' => 'bubble',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_btn_bg_color',
                                    'category' => 'bubble',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_btn_text_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_btn_text_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_btn_text_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_btn_text_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_btn_text_hover_color',
                                    'category' => 'bubble',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_header_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_text_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_header_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_text_icon_color',
                                    'category' => 'bubble',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_header_text_icon_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_text_icon_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_text_icon_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_header_text_icon_font_size',
                                    'value' => '',
                                    'class' => 'widget-header-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_text_icon_font_size',
                                    'category' => 'bubble',
                                    'sliderId' => 'widget-header-text-font-size-range-slider-min',
                                    'sliderClass' => 'widget-header-text-font-size-range-slider-min',
                                    'default' => 25
                                ),
                            ),
                        ),
                        // added by junry 02/18/2025, for all cards front button text font size
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_front_btn_txt_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_bubble_plugin_widget_front_btn_txt_font_size',
                                    'tooltip' => 'tr_melis_core_platform_theme_bubble_plugin_widget_front_btn_txt_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_front_btn_txt_font_size',
                                    'value' => '',
                                    'class' => 'widget-front-button-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_bubble_plugin_widget_front_btn_txt_font_size',
                                    'category' => 'bubble',
                                    'sliderId' => 'widget-front-button-text-font-size-range-slider-min',
                                    'sliderClass' => 'widget-front-button-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_updates_header_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_updates_header_text_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_updates_header_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_updates_header_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_updates_header_text_icon_color',
                                    'category' => 'bubble',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_news_header_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_news_header_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_news_header_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_news_header_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_news_header_bg_color',
                                    'category' => 'bubble',
                                    'default' => '#424242'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_updates_header_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_updates_header_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_updates_header_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_updates_header_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_updates_header_bg_color',
                                    'category' => 'bubble',
                                    'default' => '#e7e7e7'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_notif_header_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_notif_header_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_notif_header_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_notif_header_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_notif_header_bg_color',
                                    'category' => 'bubble',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_msg_header_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_msg_header_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_msg_header_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_msg_header_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_msg_header_bg_color',
                                    'category' => 'bubble',
                                    'default' => '#466baf'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_news_btn_border_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_border_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_border_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_news_btn_border_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_border_text_color',
                                    'category' => 'bubble',
                                    'default' => '#424242'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_notif_btn_border_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_notif_btn_border_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_notif_btn_border_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_notif_btn_border_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_notif_btn_border_text_color',
                                    'category' => 'bubble',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_msg_btn_border_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_msg_btn_border_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_msg_btn_border_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_msg_btn_border_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_msg_btn_border_text_color',
                                    'category' => 'bubble',
                                    'default' => '#466baf'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_updates_btn_text_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_updates_btn_text_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_updates_btn_text_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_updates_btn_text_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_updates_btn_text_hover_color',
                                    'category' => 'bubble',
                                    'default' => '#797979'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_news_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_news_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_border_color',
                                    'category' => 'bubble',
                                    'default' => '#424242'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_news_btn_bg_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_bg_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_bg_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_news_btn_bg_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_news_btn_bg_hover_color',
                                    'category' => 'bubble',
                                    'default' => '#424242'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_header_btn_txt_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_btn_txt_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_btn_txt_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_header_btn_txt_font_size',
                                    'value' => '',
                                    'class' => 'widget-button-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_header_btn_txt_font_size',
                                    'category' => 'bubble',
                                    'sliderId' => 'widget-button-text-font-size-range-slider-min',
                                    'sliderClass' => 'widget-button-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_bg_color',
                                    'category' => 'bubble',
                                    'default' => '#424242'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_text_color',
                                    'category' => 'bubble',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_text_font_size',
                                    'value' => '',
                                    'class' => 'widget-back-header-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_text_font_size',
                                    'category' => 'bubble',
                                    'sliderId' => 'widget-back-header-text-font-size-range-slider-min',
                                    'sliderClass' => 'widget-back-header-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_close_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_close_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_close_btn_bg_color',
                                    'category' => 'bubble',
                                    'default' => '#fafafa'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_close_btn_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_close_btn_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_header_close_btn_icon_color',
                                    'category' => 'bubble',
                                    'default' => '#797979'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_back_content_header_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_content_header_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_content_header_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_back_content_header_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_content_header_text_color',
                                    'category' => 'bubble',
                                    'default' => '#000'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_bubble_plugin_widget_back_content_details_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_content_details_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_content_details_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_bubble_plugin_widget_back_content_details_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_bubble_plugin_widget_back_content_details_text_color',
                                    'category' => 'bubble',
                                    'default' => '#000'
                                ),
                            ),
                        ),

                        //Dashboard Plugins
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_border_radius',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_border_radius',
                                    'category' => 'dashboard_plugin',
                                    'default' => '0px'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_bg_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#cff4fc'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_border_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#9eeaf9'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#055160'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_size',
                                    'value' => '',
                                    'class' => 'dashboard-plugin-no-plugin-alert-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_text_font_size',
                                    'category' => 'dashboard_plugin',
                                    'sliderId' => 'dashboard-plugin-no-plugin-alert-font-size-range-slider-min',
                                    'sliderClass' => 'dashboard-plugin-no-plugin-alert-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_style',
                                'type' => Laminas\Form\Element\MultiCheckbox::class,
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_text_font_style',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_text_font_style_tooltip',
                                    'value_options' => [
                                        'option1' => [
                                            'value' => 'bold',
                                            'label' => '<strong>B</strong>',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                            ],
                                        ],
                                        'option2' => [
                                            'value' => 'italic',
                                            'label' => '<em>I</em>',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                            ],
                                        ],
                                        'option3' => [
                                            'value' => 'uppercase',
                                            'label' => 'TT',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                                'style' => 'text-transform: uppercase;'
                                            ],
                                        ],
                                        'option4' => [
                                            'value' => 'underline',
                                            'label' => 'U',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                                'style' => 'text-transform: underline;'
                                            ],
                                        ],
                                    ]
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_style',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_no_plugin_alert_text_font_style',
                                    'category' => 'dashboard_plugin',
                                    'required' => false,
                                    'default' => ''
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_bg_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#424242'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_text_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#424242'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_text_font_size',
                                    'value' => '',
                                    'class' => 'plugin-header-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_text_font_size',
                                    'category' => 'dashboard_plugin',
                                    'sliderId' => 'plugin-header-text-font-size-range-slider-min',
                                    'sliderClass' => 'plugin-header-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_bg_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#fafafa'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_border_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#cecece'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_icon_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#797979'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_bg_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_bg_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_bg_hover_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#e7e7e7'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_border_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_border_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_header_btns_border_hover_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#e7e7e7'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_body_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_body_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_body_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_body_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_body_bg_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#ffffff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_plugin_body_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_body_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_body_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_body_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_plugin_body_border_color',
                                    'category' => 'dashboard_plugin',
                                    'default' => '#ebebeb'
                                ),
                            ),
                        ),

                        //Dashboard Plugins menu
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_bg_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#373737'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_border_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_border_width',
                                    'value' => '',
                                    'class' => 'plugins-menu-box-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_border_width',
                                    'category' => 'dashboard_plugin_menu',
                                    'sliderId' => 'plugins-menu-box-border-width-range-slider-min',
                                    'sliderClass' => 'plugins-menu-box-border-width-range-slider-min',
                                    'default' => 4
                                ),
                            ),
                        ),
                        // to be added on database
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dashboard_plugin_menu_box_title_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dashboard_plugin_menu_box_title_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dashboard_plugin_menu_box_title_bg_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_font_size',
                                    'value' => '',
                                    'class' => 'plugins-menu-box-title-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_font_size',
                                    'category' => 'dashboard_plugin_menu',
                                    'sliderId' => 'plugins-menu-box-title-font-size-range-slider-min',
                                    'sliderClass' => 'plugins-menu-box-title-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_font_style',
                                'type' => Laminas\Form\Element\MultiCheckbox::class,
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_font_style',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_font_style_tooltip',
                                    'value_options' => [
                                        'option1' => [
                                            'value' => 'bold',
                                            'label' => '<strong>B</strong>',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                            ],
                                        ],
                                        'option2' => [
                                            'value' => 'italic',
                                            'label' => '<em>I</em>',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                            ],
                                        ],
                                        'option3' => [
                                            'value' => 'uppercase',
                                            'label' => 'TT',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                                'style' => 'text-transform: uppercase;'
                                            ],
                                        ],
                                        'option4' => [
                                            'value' => 'underline',
                                            'label' => 'U',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                                'style' => 'text-transform: underline;'
                                            ],
                                        ],
                                    ]
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_font_style',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_title_font_style',
                                    'category' => 'dashboard_plugin_menu',
                                    'required' => false,
                                    'default' => ''
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#2c2c2c'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#373737'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#373737'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_font_size',
                                    'value' => '',
                                    'class' => 'filter-box-button-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_font_size',
                                    'category' => 'dashboard_plugin_menu',
                                    'sliderId' => 'filter-box-button-text-font-size-range-slider-min',
                                    'sliderClass' => 'filter-box-button-text-font-size-range-slider-min',
                                    'default' => 12
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_new_plugin_indicator_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_new_plugin_indicator_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_new_plugin_indicator_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_new_plugin_indicator_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_new_plugin_indicator_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_text_font_size',
                                    'value' => '',
                                    'class' => 'new-plugin-indicator-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_menu_plugin_new_plugin_indicator_text_font_size',
                                    'category' => 'dashboard_plugin_menu',
                                    'sliderId' => 'new-plugin-indicator-text-font-size-range-slider-min',
                                    'sliderClass' => 'new-plugin-indicator-text-font-size-range-slider-min',
                                    'default' => 7
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_category_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_category_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_menu_plugin_category_btn_text_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_category_btn_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_category_btn_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_font_size',
                                    'value' => '',
                                    'class' => 'category-btn-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_category_btn_text_font_size',
                                    'category' => 'dashboard_plugin_menu',
                                    'sliderId' => 'category-btn-text-font-size-range-slider-min',
                                    'sliderClass' => 'category-btn-text-font-size-range-slider-min',
                                    'default' => 11
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_plugin_title_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_plugin_title_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_plugin_title_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_plugin_menu_title_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_plugin_title_text_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_plugin_title_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_plugin_title_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_plugin_title_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_plugin_title_text_font_size',
                                    'value' => '',
                                    'class' => 'plugin-title-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_plugin_title_text_font_size',
                                    'category' => 'dashboard_plugin_menu',
                                    'sliderId' => 'plugin-title-text-font-size-range-slider-min',
                                    'sliderClass' => 'plugin-title-text-font-size-range-slider-min',
                                    'default' => 12
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_border_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_text_color',
                                    'category' => 'dashboard_plugin_menu',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_font_size',
                                    'value' => '',
                                    'class' => 'delete-all-btn-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dashboard_plugin_menu_delete_all_btn_text_font_size',
                                    'category' => 'dashboard_plugin_menu',
                                    'sliderId' => 'delete-all-btn-text-font-size-range-slider-min',
                                    'sliderClass' => 'delete-all-btn-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),

                        //Start for the Components Options
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_bg_color',
                                    'category' => 'modal',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_border_color',
                                    'category' => 'modal',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_border_radius_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_border_radius_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_border_radius_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_border_radius_size',
                                    'value' => '',
                                    'class' => 'modal-border-radius-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'melis_core_platform_theme_modal_border_radius_size',
                                    'category' => 'modal',
                                    'sliderId' => 'modal-border-radius-size-range-slider-min',
                                    'sliderClass' => 'modal-border-radius-size-range-slider-min',
                                    'default' => 0
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_nav_tabs_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_nav_tabs_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_nav_tabs_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_nav_tabs_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_nav_tabs_bg_color',
                                    'category' => 'modal',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_nav_tabs_active_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_nav_tabs_active_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_nav_tabs_active_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_nav_tabs_active_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_nav_tabs_active_bg_color',
                                    'category' => 'modal',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_nav_tabs_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_nav_tabs_text_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_nav_tabs_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_nav_tabs_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_nav_tabs_text_icon_color',
                                    'category' => 'modal',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_nav_tabs_text_icon_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_nav_tabs_text_icon_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_nav_tabs_text_icon_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_nav_tabs_text_icon_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_nav_tabs_text_icon_hover_color',
                                    'category' => 'modal',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_nav_tabs_text_icon_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_nav_tabs_text_icon_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_nav_tabs_text_icon_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_nav_tabs_text_icon_font_size',
                                    'value' => '',
                                    'class' => 'modal-tabs-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'melis_core_platform_theme_modal_nav_tabs_text_icon_font_size',
                                    'category' => 'modal',
                                    'sliderId' => 'modal-tabs-font-size-range-slider-min',
                                    'sliderClass' => 'modal-tabs-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_nav_tabs_border_right_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_nav_tabs_border_right_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_nav_tabs_border_right_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_nav_tabs_border_right_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_nav_tabs_border_right_color',
                                    'category' => 'modal',
                                    'default' => '#e5e5e5'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_nav_tabs_border_right_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_nav_tabs_border_right_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_nav_tabs_border_right_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_nav_tabs_border_right_width',
                                    'value' => '',
                                    'class' => 'modal-border-right-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'melis_core_platform_theme_modal_nav_tabs_border_right_width',
                                    'category' => 'modal',
                                    'sliderId' => 'modal-border-right-width-range-slider-min',
                                    'sliderClass' => 'modal-border-right-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_text_color',
                                    'category' => 'modal',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_text_font_size',
                                    'value' => '',
                                    'class' => 'modal-content-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'melis_core_platform_theme_modal_content_text_font_size',
                                    'category' => 'modal',
                                    'sliderId' => 'modal-content-text-font-size-range-slider-min',
                                    'sliderClass' => 'modal-content-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_text_font_styles',
                                'type' => Laminas\Form\Element\MultiCheckbox::class,
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_text_font_styles',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_text_font_styles_tooltip',
                                    'value_options' => [
                                        'option1' => [
                                            'value' => 'bold',
                                            'label' => '<strong>B</strong>',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                            ],
                                        ],
                                        'option2' => [
                                            'value' => 'italic',
                                            'label' => '<em>I</em>',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                            ],
                                        ],
                                        'option3' => [
                                            'value' => 'uppercase',
                                            'label' => 'TT',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                                'style' => 'text-transform: uppercase;'
                                            ],
                                        ],
                                        'option4' => [
                                            'value' => 'underline',
                                            'label' => 'U',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                                'style' => 'text-transform: underline;'
                                            ],
                                        ],
                                    ]
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_text_font_styles',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_text_font_styles',
                                    'category' => 'modal',
                                    'required' => false,
                                    'default' => ''
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_close_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_close_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_close_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_close_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_close_btn_bg_color',
                                    'category' => 'modal',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_close_btn_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_close_btn_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_close_btn_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_close_btn_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_close_btn_hover_bg_color',
                                    'category' => 'modal',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_close_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_close_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_close_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_close_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_close_btn_border_color',
                                    'category' => 'modal',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_close_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_close_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_close_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_close_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_close_btn_text_color',
                                    'category' => 'modal',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_close_btn_hover_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_close_btn_hover_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_close_btn_hover_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_close_btn_hover_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_close_btn_hover_text_color',
                                    'category' => 'modal',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_save_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_save_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_save_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_save_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_save_btn_bg_color',
                                    'category' => 'modal',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_save_btn_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_save_btn_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_save_btn_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_save_btn_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_save_btn_hover_bg_color',
                                    'category' => 'modal',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_save_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_save_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_save_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_save_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_save_btn_border_color',
                                    'category' => 'modal',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_save_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_save_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_save_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_save_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_save_btn_text_color',
                                    'category' => 'modal',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_modal_content_save_btn_hover_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_modal_content_save_btn_hover_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_modal_content_save_btn_hover_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_modal_content_save_btn_hover_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_modal_content_save_btn_hover_text_color',
                                    'category' => 'modal',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),

                        //Start Dialog
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_content_header_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_content_header_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_content_header_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_content_header_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_content_header_bg_color',
                                    'category' => 'dialog',
                                    'default' => '#f99319'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_content_header_title_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_content_header_title_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_content_header_title_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_content_header_title_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_content_header_title_color',
                                    'category' => 'dialog',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_content_header_title_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_content_header_title_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_content_header_title_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_content_header_title_font_size',
                                    'value' => '',
                                    'class' => 'dialog-title-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_content_header_title_font_size',
                                    'category' => 'dialog',
                                    'sliderId' => 'dialog-title-font-size-range-slider-min',
                                    'sliderClass' => 'dialog-title-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_close_button_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_close_button_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_close_button_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_close_button_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_close_button_color',
                                    'category' => 'dialog',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_close_button_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_close_button_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_close_button_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_close_button_font_size',
                                    'value' => '',
                                    'class' => 'dialog-close-btn-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_close_button_font_size',
                                    'category' => 'dialog',
                                    'sliderId' => 'dialog-close-btn-font-size-range-slider-min',
                                    'sliderClass' => 'dialog-close-btn-font-size-range-slider-min',
                                    'default' => 13
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_content_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_content_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_content_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_content_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_content_bg_color',
                                    'category' => 'dialog',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_content_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_content_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_content_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_content_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_content_border_color',
                                    'category' => 'dialog',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_content_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_content_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_content_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_content_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_content_text_color',
                                    'category' => 'dialog',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_content_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_content_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_content_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_content_text_font_size',
                                    'value' => '',
                                    'class' => 'dialog-content-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_content_text_font_size',
                                    'category' => 'dialog',
                                    'sliderId' => 'dialog-content-text-font-size-range-slider-min',
                                    'sliderClass' => 'dialog-content-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_no_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_no_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_no_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_no_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_no_btn_bg_color',
                                    'category' => 'dialog',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_no_btn_bg_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_no_btn_bg_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_no_btn_bg_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_no_btn_bg_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_no_btn_bg_hover_color',
                                    'category' => 'dialog',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_no_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_no_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_no_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_no_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_no_btn_border_color',
                                    'category' => 'dialog',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_no_btn_border_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_no_btn_border_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_no_btn_border_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_no_btn_border_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_no_btn_border_hover_color',
                                    'category' => 'dialog',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_no_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_no_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_no_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_no_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_no_btn_text_color',
                                    'category' => 'dialog',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_no_btn_text_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_no_btn_text_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_no_btn_text_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_no_btn_text_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_no_btn_text_hover_color',
                                    'category' => 'dialog',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_yes_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_yes_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_yes_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_yes_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_yes_btn_bg_color',
                                    'category' => 'dialog',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_yes_btn_bg_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_yes_btn_bg_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_yes_btn_bg_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_yes_btn_bg_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_yes_btn_bg_hover_color',
                                    'category' => 'dialog',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_yes_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_yes_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_yes_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_yes_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_yes_btn_border_color',
                                    'category' => 'dialog',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_yes_btn_border_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_yes_btn_border_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_yes_btn_border_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_yes_btn_border_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_yes_btn_border_hover_color',
                                    'category' => 'dialog',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_yes_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_yes_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_yes_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_yes_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_yes_btn_text_color',
                                    'category' => 'dialog',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_yes_btn_text_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_yes_btn_text_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_yes_btn_text_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_yes_btn_text_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_yes_btn_text_hover_color',
                                    'category' => 'dialog',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dialog_btn_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_dialog_btn_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_dialog_btn_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dialog_btn_text_font_size',
                                    'value' => '',
                                    'class' => 'dialog-button-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_dialog_btn_text_font_size',
                                    'category' => 'dialog',
                                    'sliderId' => 'dialog-button-text-font-size-range-slider-min',
                                    'sliderClass' => 'dialog-button-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),

                        //Form Elements
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_bg_color',
                                    'category' => 'form_elements',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_text_color',
                                    'category' => 'form_elements',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_select_option_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_select_option_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_select_option_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_select_option_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_select_option_bg_color',
                                    'category' => 'form_elements',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_select_option_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_select_option_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_select_option_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_select_option_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_select_option_text_color',
                                    'category' => 'form_elements',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_input_elements_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_input_elements_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_input_elements_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_input_elements_border_radius',
                                    'value' => '',
                                    'class' => 'form-inputs-element-border-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_input_elements_border_radius',
                                    'category' => 'form_elements',
                                    'sliderId' => 'form-inputs-element-border-radius-range-slider-min',
                                    'sliderClass' => 'form-inputs-element-border-radius-range-slider-min',
                                    'default' => 0
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_input_elements_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_input_elements_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_input_elements_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_input_elements_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_input_elements_text_color',
                                    'category' => 'form_elements',
                                    'default' => '#444'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_input_elements_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_input_elements_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_input_elements_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_input_elements_border_width',
                                    'value' => '',
                                    'class' => 'form-inputs-element-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_input_elements_border_width',
                                    'category' => 'form_elements',
                                    'sliderId' => 'form-inputs-element-border-width-range-slider-min',
                                    'sliderClass' => 'form-inputs-element-border-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_input_elements_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_input_elements_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_input_elements_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_input_elements_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_input_elements_border_color',
                                    'category' => 'form_elements',
                                    'default' => '#dee2e6'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_input_elements_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_input_elements_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_input_elements_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_input_elements_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_input_elements_bg_color',
                                    'category' => 'form_elements',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_input_text_disable_readonly_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_input_text_disable_readonly_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_bg_color',
                                    'category' => 'form_elements',
                                    'default' => '#e9ecef'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_input_text_disable_readonly_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_input_text_disable_readonly_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_border_color',
                                    'category' => 'form_elements',
                                    'default' => '#dee2e6'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_input_text_disable_readonly_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_input_text_disable_readonly_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_input_text_disable_readonly_text_color',
                                    'category' => 'form_elements',
                                    'default' => '#dee2e6'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_submit_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_button_submit_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_button_submit_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_submit_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_button_submit_bg_color',
                                    'category' => 'form_elements',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_submit_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_button_submit_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_button_submit_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_submit_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_button_submit_text_color',
                                    'category' => 'form_elements',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_submit_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_button_submit_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_button_submit_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_submit_border_radius',
                                    'value' => '',
                                    'class' => 'form-button-submit-border-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_button_submit_border_radius',
                                    'category' => 'form_elements',
                                    'sliderId' => 'form-button-submit-border-radius-range-slider-min',
                                    'sliderClass' => 'form-button-submit-border-radius-range-slider-min',
                                    'default' => 0
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_submit_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_button_submit_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_button_submit_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_submit_border_width',
                                    'value' => '',
                                    'class' => 'form-button-submit-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_button_submit_border_width',
                                    'category' => 'form_elements',
                                    'sliderId' => 'form-button-submit-border-width-range-slider-min',
                                    'sliderClass' => 'form-button-submit-border-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_submit_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_form_button_submit_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_form_button_submit_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_submit_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_form_button_submit_border_color',
                                    'category' => 'form_elements',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_submit_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_submit_hover_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_submit_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_submit_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_submit_hover_bg_color',
                                    'category' => 'form_elements',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_submit_hover_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_submit_hover_border_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_submit_hover_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_submit_hover_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_submit_hover_border_color',
                                    'category' => 'form_elements',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_submit_hover_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_submit_hover_text_icon_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_submit_hover_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_submit_hover_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_submit_hover_text_icon_color',
                                    'category' => 'form_elements',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_cancel_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_cancel_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_cancel_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_cancel_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_cancel_bg_color',
                                    'category' => 'form_elements',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_cancel_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_cancel_text_icon_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_cancel_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_cancel_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_cancel_text_icon_color',
                                    'category' => 'form_elements',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_cancel_border_radius_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_cancel_border_radius_size',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_cancel_border_radius_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_cancel_border_radius_size',
                                    'value' => '',
                                    'class' => 'form-button-cancel-border-radius-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_form_button_cancel_border_radius_size',
                                    'category' => 'form_elements',
                                    'sliderId' => 'form-button-cancel-border-radius-size-range-slider-min',
                                    'sliderClass' => 'form-button-cancel-border-radius-size-range-slider-min',
                                    'default' => 0
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_cancel_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_cancel_border_width',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_cancel_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_cancel_border_width',
                                    'value' => '',
                                    'class' => 'form-button-cancel-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_form_button_cancel_border_width',
                                    'category' => 'form_elements',
                                    'sliderId' => 'form-button-cancel-border-width-range-slider-min',
                                    'sliderClass' => 'form-button-cancel-border-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_cancel_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_cancel_border_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_cancel_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_cancel_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_cancel_border_color',
                                    'category' => 'form_elements',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_cancel_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_cancel_hover_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_cancel_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_cancel_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_cancel_hover_bg_color',
                                    'category' => 'form_elements',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_cancel_hover_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_cancel_hover_border_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_cancel_hover_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_cancel_hover_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_cancel_hover_border_color',
                                    'category' => 'form_elements',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_form_button_cancel_hover_text_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_form_button_cancel_hover_text_icon_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_form_button_cancel_hover_text_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_form_button_cancel_hover_text_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'melis_core_platform_theme_form_button_cancel_hover_text_icon_color',
                                    'category' => 'form_elements',
                                    'default' => '#fff'
                                ),
                            ),
                        ),

                        //Tabs
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_head_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_head_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_head_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_head_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_head_bg_color',
                                    'category' => 'tab',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_head_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_head_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_head_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_head_border_width',
                                    'value' => '',
                                    'class' => 'tab-widget-head-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_head_border_width',
                                    'category' => 'tab',
                                    'sliderId' => 'tab-widget-head-border-width-range-slider-min',
                                    'sliderClass' => 'tab-widget-head-border-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_head_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_head_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_head_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_head_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_head_border_color',
                                    'category' => 'tab',
                                    'default' => '#e5e5e5'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_head_nav_item_and_link_height',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_head_nav_item_and_link_height',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_head_nav_item_and_link_height_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_head_nav_item_and_link_height',
                                    'value' => '',
                                    'class' => 'tab-widget-head-nav-item-and-link-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_head_border_width',
                                    'category' => 'tab',
                                    'sliderId' => 'tab-widget-head-nav-item-and-link-width-range-slider-min',
                                    'sliderClass' => 'tab-widget-head-nav-item-and-link-width-range-slider-min',
                                    'default' => 70
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_nav_item_border_right_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_nav_item_border_right_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_nav_item_border_right_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_nav_item_border_right_width',
                                    'value' => '',
                                    'class' => 'tab-widget-head-nav-item-border-right-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_head_border_width',
                                    'category' => 'tab',
                                    'sliderId' => 'tab-widget-head-nav-item-border-right-width-range-slider-min',
                                    'sliderClass' => 'tab-widget-head-nav-item-border-right-width-range-slider-min',
                                    'default' => 0
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_nav_item_border_right_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_nav_item_border_right_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_nav_item_border_right_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_nav_item_border_right_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_nav_item_border_right_color',
                                    'category' => 'tab',
                                    'default' => '#e5e5e5'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_nav_link_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_nav_link_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_nav_link_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_nav_link_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_nav_link_text_color',
                                    'category' => 'tab',
                                    'default' => '#7c7c7c'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_nav_link_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_nav_link_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_nav_link_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_nav_link_text_font_size',
                                    'value' => '',
                                    'class' => 'tab-widget-nav-link-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_nav_link_text_font_size',
                                    'category' => 'tab',
                                    'sliderId' => 'tab-widget-nav-link-text-font-size-range-slider-min',
                                    'sliderClass' => 'tab-widget-nav-link-text-font-size-range-slider-min',
                                    'default' => 14
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_nav_link_min_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_nav_link_min_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_nav_link_min_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_nav_link_min_width',
                                    'value' => '',
                                    'class' => 'tab-widget-nav-link-min-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_nav_link_min_width',
                                    'category' => 'tab',
                                    'sliderId' => 'tab-widget-nav-link-min-width-range-slider-min',
                                    'sliderClass' => 'tab-widget-nav-link-min-width-range-slider-min',
                                    'default' => 90
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_nav_link_text_align',
                                'type' => 'Laminas\Form\Element\Radio',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_nav_link_text_align',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_nav_link_text_align_tooltip',
                                    'value_options' => array(
                                        'left' => '<label class="btn btn-default" for="melis_core_platform_theme_tab_widget_nav_link_text_align_left"><i class="bi bi-text-left"></i></label>',
                                        'center' => '<label class="btn btn-default" for="melis_core_platform_theme_tab_widget_nav_link_text_align_center"><i class="bi bi-text-center"></i></label>',
                                        'right' => '<label class="btn btn-default" for="melis_core_platform_theme_tab_widget_nav_link_text_align_right"><i class="bi bi-text-right"></i></label>',
                                    ),
                                    'label_attributes' => array(
                                        'class' => 'melis-radio-box',
                                    ),
                                    'disable_inarray_validator' => true,
                                ),
                                'attributes' => array(
                                    'value' => '',
                                    'placeholder' => '',
                                    'class' => 'form-control',
                                    'id' => 'melis_core_platform_theme_tab_widget_nav_link_text_align',
                                    'category' => 'tab',
                                    'default' => 'center'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_nav_link_icon_height',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_nav_link_icon_height',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_nav_link_icon_height_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_nav_link_icon_height',
                                    'value' => '',
                                    'class' => 'tab-widget-nav-link-height-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_nav_link_icon_height',
                                    'category' => 'tab',
                                    'sliderId' => 'tab-widget-nav-link-height-range-slider-min',
                                    'sliderClass' => 'tab-widget-nav-link-height-range-slider-min',
                                    'default' => 37
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_link_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_link_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_link_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_link_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_link_icon_color',
                                    'category' => 'tab',
                                    'default' => '#9d9d9d'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_tab_widget_link_icon_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_tab_widget_link_icon_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_tab_widget_link_icon_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_tab_widget_link_icon_font_size',
                                    'value' => '',
                                    'class' => 'tab-widget-link-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_tab_widget_link_icon_font_size',
                                    'category' => 'tab',
                                    'sliderId' => 'tab-widget-link-font-size-range-slider-min',
                                    'sliderClass' => 'tab-widget-link-font-size-range-slider-min',
                                    'default' => 24
                                ),
                            ),
                        ),

                        //Start Datepicker
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_border_width',
                                    'value' => '',
                                    'class' => 'datepicker-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_border_width',
                                    'category' => 'datepicker',
                                    'sliderId' => 'datepicker-border-width-range-slider-min',
                                    'sliderClass' => 'datepicker-border-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#ddd'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_border_radius',
                                    'value' => '',
                                    'class' => 'datepicker-border-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_border_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'datepicker-border-radius-range-slider-min',
                                    'sliderClass' => 'datepicker-border-radius-range-slider-min',
                                    'default' => 4
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_text_align',
                                'type' => 'Laminas\Form\Element\Radio',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_button_text_align',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_button_text_align_tooltip',
                                    'value_options' => array(
                                        'left' => '<label class="btn btn-default" for="melis_core_platform_theme_datepicker_prev_next_data_action_button_text_align_left"><i class="bi bi-text-left"></i></label>',
                                        'center' => '<label class="btn btn-default" for="melis_core_platform_theme_datepicker_prev_next_data_action_button_text_align_center"><i class="bi bi-text-center"></i></label>',
                                        'right' => '<label class="btn btn-default" for="melis_core_platform_theme_datepicker_prev_next_data_action_button_text_align_right"><i class="bi bi-text-right"></i></label>',
                                    ),
                                    'label_attributes' => array(
                                        'class' => 'melis-radio-box',
                                    ),
                                    'disable_inarray_validator' => true,
                                ),
                                'attributes' => array(
                                    'value' => '',
                                    'placeholder' => '',
                                    'class' => 'form-control',
                                    'id' => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_text_align',
                                    'category' => 'datepicker',
                                    'default' => ''
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_prev_next_data_action_btn_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_btn_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_btn_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_prev_next_data_action_btn_border_radius',
                                    'value' => '',
                                    'class' => 'datepicker-btn-border-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_btn_border_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'datepicker-btn-border-radius-range-slider-min',
                                    'sliderClass' => 'datepicker-btn-border-radius-range-slider-min',
                                    'default' => 4
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_button_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_button_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_button_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#212529'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_button_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_button_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_prev_next_data_action_button_hover_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#f8f9fa'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_dow_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_dow_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_dow_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_dow_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_dow_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_dow_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_dow_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_dow_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_dow_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_dow_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_table_th_td_text_align',
                                'type' => 'Laminas\Form\Element\Radio',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_table_th_td_text_align',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_table_th_td_text_align_tooltip',
                                    'value_options' => array(
                                        'left' => '<label class="btn btn-default" for="melis_core_platform_theme_datepicker_table_th_td_text_align_left"><i class="bi bi-text-left"></i></label>',
                                        'center' => '<label class="btn btn-default" for="melis_core_platform_theme_datepicker_table_th_td_text_align_center"><i class="bi bi-text-center"></i></label>',
                                        'right' => '<label class="btn btn-default" for="melis_core_platform_theme_datepicker_table_th_td_text_align_right"><i class="bi bi-text-right"></i></label>',
                                    ),
                                    'label_attributes' => array(
                                        'class' => 'melis-radio-box',
                                    ),
                                    'disable_inarray_validator' => true,
                                ),
                                'attributes' => array(
                                    'value' => 'center',
                                    'placeholder' => '',
                                    'class' => 'form-control',
                                    'id' => 'melis_core_platform_theme_datepicker_table_th_td_text_align',
                                    'category' => 'datepicker',
                                    'default' => 'center'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_day_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_day_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_day_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_day_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_day_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#212529'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_day_text_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_day_text_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_day_text_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_day_text_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_day_text_hover_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#eee'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_day_old_weekend_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_day_old_weekend_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_day_old_weekend_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_day_old_weekend_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_day_old_weekend_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#999'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_day_active_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_day_active_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_day_active_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_day_active_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_day_active_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_day_active_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_day_active_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_day_active_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_day_active_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_day_active_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_timepicker_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_timepicker_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_timepicker_btn_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_icon_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_timepicker_btn_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_icon_color',
                                    'category' => 'datepicker',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_timepicker_btn_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_timepicker_btn_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_timepicker_btn_hover_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_timepicker_arrow_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_timepicker_arrow_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_timepicker_arrow_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_timepicker_arrow_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_timepicker_arrow_btn_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_timepicker_arrow_btn_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_timepicker_arrow_btn_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_timepicker_arrow_btn_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_timepicker_arrow_btn_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_timepicker_arrow_btn_hover_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#f8f9fa'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_timepicker_time_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_timepicker_time_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_timepicker_time_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_timepicker_time_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_timepicker_time_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_datepicker_timepicker_time_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_datepicker_timepicker_time_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_datepicker_timepicker_time_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_datepicker_timepicker_time_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_datepicker_timepicker_time_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#212529'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_border_width',
                                    'value' => '',
                                    'class' => 'daterangepicker-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_border_width',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-border-width-range-slider-min',
                                    'sliderClass' => 'daterangepicker-border-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#ddd'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_border_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-border-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_border_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-border-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-border-radius-range-slider-min',
                                    'default' => 4
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#f5f5f5'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_text_font_size',
                                    'value' => '',
                                    'class' => 'daterangepicker-button-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_text_font_size',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-button-text-font-size-range-slider-min',
                                    'sliderClass' => 'daterangepicker-button-text-font-size-range-slider-min',
                                    'default' => 13
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_border_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-button-border-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_border_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-button-border-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-button-border-radius-range-slider-min',
                                    'default' => 4
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_border_width',
                                    'value' => '',
                                    'class' => 'daterangepicker-button-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_border_width',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-button-border-width-range-slider-min',
                                    'sliderClass' => 'daterangepicker-button-border-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#f5f5f5'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_border_bottom_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_border_bottom_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_border_bottom_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_border_bottom_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_border_bottom_color',
                                    'category' => 'datepicker',
                                    'default' => '#e5e5e5'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_bg_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_bg_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_bg_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_bg_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_bg_hover_color',
                                    'category' => 'datepicker',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_text_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_text_hover_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_text_hover_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_text_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_text_hover_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_button_hover_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_button_hover_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_button_hover_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_button_hover_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_button_hover_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_active_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_active_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_active_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_active_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_active_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#357ebd'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_active_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_active_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_active_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_active_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_active_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_active_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_active_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_active_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_active_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_active_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#eee'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_active_in_range_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_active_in_range_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#ebf4f8'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_active_in_range_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_active_in_range_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#eee'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_active_in_range_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_active_in_range_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#000'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_active_in_range_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_active_in_range_border_width',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_active_in_range_border_width',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-border-width-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-border-width-range-slider-min',
                                    'default' => 0
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_in_range_start_date_border_top_left_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_top_left_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_top_left_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_in_range_start_date_border_top_left_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-start-date-border-top-left-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_top_left_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-start-date-border-top-left-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-start-date-border-top-left-radius-range-slider-min',
                                    'default' => 4,
                                    'group' => 'start_date'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_in_range_start_date_border_top_right_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_top_right_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_top_right_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_in_range_start_date_border_top_right_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-start-date-border-top-right-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_top_right_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-start-date-border-top-right-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-start-date-border-top-right-radius-range-slider-min',
                                    'default' => 0,
                                    'group' => 'start_date'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_in_range_start_date_border_bottom_left_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_bottom_left_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_bottom_left_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_in_range_start_date_border_bottom_left_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-start-date-border-bottom-left-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_bottom_left_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-start-date-border-bottom-left-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-start-date-border-bottom-left-radius-range-slider-min',
                                    'default' => 4,
                                    'group' => 'start_date'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_in_range_start_date_border_bottom_right_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_bottom_right_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_bottom_right_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_in_range_start_date_border_bottom_right_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-start-date-border-bottom-right-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_in_range_start_date_border_bottom_right_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-start-date-border-bottom-right-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-start-date-border-bottom-right-radius-range-slider-min',
                                    'default' => 0,
                                    'group' => 'start_date'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_in_range_end_date_border_top_left_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_top_left_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_top_left_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_in_range_end_date_border_top_left_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-end-date-border-top-left-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_top_left_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-end-date-border-top-left-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-end-date-border-top-left-radius-range-slider-min',
                                    'default' => 0,
                                    'group' => 'end_date'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_in_range_end_date_border_top_right_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_top_right_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_top_right_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_in_range_end_date_border_top_right_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-end-date-border-top-right-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_top_right_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-end-date-border-top-right-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-end-date-border-top-right-radius-range-slider-min',
                                    'default' => 4,
                                    'group' => 'end_date'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_in_range_end_date_border_bottom_left_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_bottom_left_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_bottom_left_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_in_range_end_date_border_bottom_left_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-end-date-border-bottom-left-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_bottom_left_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-end-date-border-bottom-left-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-end-date-border-bottom-left-radius-range-slider-min',
                                    'default' => 0,
                                    'group' => 'end_date'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_in_range_end_date_border_bottom_right_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_bottom_right_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_bottom_right_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_in_range_end_date_border_bottom_right_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-in-range-end-date-border-bottom-right-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_in_range_end_date_border_bottom_right_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-in-range-end-date-border-bottom-right-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-in-range-end-date-border-bottom-right-radius-range-slider-min',
                                    'default' => 4,
                                    'group' => 'end_date'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_available_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_available_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_available_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_available_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_available_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_available_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_available_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_available_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_available_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_available_hover_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#eee'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_available_hover_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_available_hover_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_available_hover_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_available_hover_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_available_hover_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#eee'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_available_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_width',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_available_border_width',
                                    'value' => '',
                                    'class' => 'daterangepicker-day-available-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_width',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-day-available-border-width-range-slider-min',
                                    'sliderClass' => 'daterangepicker-day-available-border-width-range-slider-min',
                                    'default' => 1
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_available_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_available_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#eee'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_available_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_radius',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_available_border_radius',
                                    'value' => '',
                                    'class' => 'daterangepicker-day-available-border-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_available_border_radius',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-day-available-border-radius-range-slider-min',
                                    'sliderClass' => 'daterangepicker-day-available-border-radius-range-slider-min',
                                    'default' => 4
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_text_font_size',
                                    'value' => '',
                                    'class' => 'daterangepicker-day-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_text_font_size',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-day-text-font-size-range-slider-min',
                                    'sliderClass' => 'daterangepicker-day-text-font-size-range-slider-min',
                                    'default' => 12
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_text_align',
                                'type' => 'Laminas\Form\Element\Radio',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_text_align',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_text_align_tooltip',
                                    'value_options' => array(
                                        'left' => '<label class="btn btn-default" for="melis_core_platform_theme_daterangepicker_day_text_align_left"><i class="bi bi-text-left"></i></label>',
                                        'center' => '<label class="btn btn-default" for="melis_core_platform_theme_daterangepicker_day_text_align_center"><i class="bi bi-text-center"></i></label>',
                                        'right' => '<label class="btn btn-default" for="melis_core_platform_theme_daterangepicker_day_text_align_right"><i class="bi bi-text-right"></i></label>',
                                    ),
                                    'label_attributes' => array(
                                        'class' => 'melis-radio-box',
                                    ),
                                    'disable_inarray_validator' => true,
                                ),
                                'attributes' => array(
                                    'value' => 'center',
                                    'placeholder' => '',
                                    'class' => 'form-control',
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_text_align',
                                    'category' => 'datepicker',
                                    'default' => 'center'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_off_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_off_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_off_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_off_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_off_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_off_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_off_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_off_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_off_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_off_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#eee'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_day_off_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_day_off_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_day_off_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_day_off_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_day_off_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#999'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_selected_date_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_selected_date_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_selected_date_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_selected_date_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_selected_date_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#686868'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_selected_date_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_selected_date_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_selected_date_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_selected_date_text_font_size',
                                    'value' => '',
                                    'class' => 'daterangepicker-footer-selected-date-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_selected_date_text_font_size',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-footer-selected-date-text-font-size-range-slider-min',
                                    'sliderClass' => 'daterangepicker-footer-selected-date-text-font-size-range-slider-min',
                                    'default' => 12
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_buttons_text_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_buttons_text_font_size',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_buttons_text_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_buttons_text_font_size',
                                    'value' => '',
                                    'class' => 'daterangepicker-footer-buttons-text-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_buttons_text_font_size',
                                    'category' => 'datepicker',
                                    'sliderId' => 'daterangepicker-footer-buttons-text-font-size-range-slider-min',
                                    'sliderClass' => 'daterangepicker-footer-buttons-text-font-size-range-slider-min',
                                    'default' => 12
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#bd362f'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_cancel_btn_hover_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_bg_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_bg_color',
                                    'category' => 'datepicker',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_border_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_border_color',
                                    'category' => 'datepicker',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#fff'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_text_color',
                                    'tooltip' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_meliscore_platform_theme_daterangepicker_footer_apply_btn_hover_text_color',
                                    'category' => 'datepicker',
                                    'default' => '#72af46'
                                ),
                            ),
                        ),

                        //drag and drop
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#373737'
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_border_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_border_width',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_border_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_border_width',
                                    'value' => '',
                                    'class' => 'plugins-box-border-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_border_width',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'plugins-box-border-width-range-slider-min',
                                    'sliderClass' => 'plugins-box-border-width-range-slider-min',
                                    'default' => 12
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_border_bottom_and_left_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_border_bottom_and_left_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_border_bottom_and_left_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_border_bottom_and_left_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_border_bottom_and_left_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_title_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_title_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23'
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_title_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_text_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_title_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_text_color',
                                    'category' => 'dragdrop',
                                    'default' => '#fff',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_line_height',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_line_height',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_line_height_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_line_height',
                                    'value' => '',
                                    'class' => 'plugins-box-line-height-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_line_height',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'plugins-box-title-line-height-range-slider-min',
                                    'sliderClass' => 'plugins-box-title-line-height-range-slider-min',
                                    'default' => 12
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_title_font_styles',
                                'type' => Laminas\Form\Element\MultiCheckbox::class,
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_font_styles',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_font_styles_tooltip',
                                    'value_options' => [
                                        'bold' => [
                                            'value' => 'bold',
                                            'label' => '<strong>B</strong>',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                            ],
                                        ],
                                        'italic' => [
                                            'value' => 'italic',
                                            'label' => '<em>I</em>',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                            ],
                                        ],
                                        'uppercase' => [
                                            'value' => 'uppercase',
                                            'label' => 'TT',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                                'style' => 'text-transform: uppercase;',
                                            ],
                                        ],
                                        'underline' => [
                                            'value' => 'underline',
                                            'label' => 'U',
                                            'label_attributes' => [
                                                'class' => 'btn btn-default',
                                                'style' => 'text-decoration: underline;',
                                            ],
                                        ],
                                    ],
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_title_font_styles',
                                    'value' => '',
                                    'class' => 'form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_font_styles',
                                    'category' => 'dragdrop',
                                    'required' => false,
                                    'default' => '',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_title_letter_spacing',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_letter_spacing',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_letter_spacing_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_title_letter_spacing',
                                    'value' => '',
                                    'class' => 'plugins-box-letter-spacing-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_letter_spacing',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'plugins-box-title-letter-spacing-range-slider-min',
                                    'sliderClass' => 'plugins-box-title-letter-spacing-range-slider-min',
                                    'default' => 0,
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_title_text_align',
                                'type' => 'Laminas\Form\Element\Radio',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_text_align',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_title_text_align_tooltip',
                                    'value_options' => array(
                                        'left' => '<label class="btn btn-default" for="melis_core_platform_theme_dnd_plugins_box_title_text_align_left"><i class="bi bi-text-left"></i></label>',
                                        'center' => '<label class="btn btn-default" for="melis_core_platform_theme_dnd_plugins_box_title_text_align_center"><i class="bi bi-text-center"></i></label>',
                                        'right' => '<label class="btn btn-default" for="melis_core_platform_theme_dnd_plugins_box_title_text_align_right"><i class="bi bi-text-right"></i></label>',
                                    ),
                                    'label_attributes' => array(
                                        'class' => 'melis-radio-box',
                                    ),
                                    'disable_inarray_validator' => true,
                                ),
                                'attributes' => array(
                                    'value' => '',
                                    'placeholder' => '',
                                    'class' => 'form-control',
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_title_text_align',
                                    'category' => 'dragdrop',
                                    'default' => 'center'
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_btn_border_radius',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_border_radius',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_border_radius_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_btn_border_radius',
                                    'value' => '',
                                    'class' => 'dnd-plugins-box-button-border-radius-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_border_radius',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'dnd-plugins-box-button-border-radius-range-slider-min',
                                    'sliderClass' => 'dnd-plugins-box-button-border-radius-range-slider-min',
                                    'default' => 0,
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_btn_icon_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_icon_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_icon_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_btn_icon_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_icon_color',
                                    'category' => 'dragdrop',
                                    'default' => '#fff',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_btn_icon_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_icon_font_size',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_icon_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_btn_icon_font_size',
                                    'value' => '',
                                    'class' => 'dnd-plugins-box-button-icon-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_btn_icon_font_size',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'dnd-plugins-box-button-icon-font-size-range-slider-min',
                                    'sliderClass' => 'dnd-plugins-box-button-icon-font-size-range-slider-min',
                                    'default' => 12,
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#373737',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_width',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_width',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_width_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_width',
                                    'value' => '',
                                    'class' => 'dnd-plugins-box-category-btn-border-bottom-width-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_width',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'dnd-plugins-box-category-btn-border-bottom-width-range-slider-min',
                                    'sliderClass' => 'dnd-plugins-box-category-btn-border-bottom-width-range-slider-min',
                                    'default' => 12,
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_color',
                                    'category' => 'dragdrop',
                                    'default' => '#2c2c2c',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_text_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_text_color',
                                    'category' => 'dragdrop',
                                    'default' => '#fff',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_font_size',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_font_size',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_font_size_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_font_size',
                                    'value' => '',
                                    'class' => 'dnd-plugins-box-category-button-font-size-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_font_size',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'dnd-plugins-box-category-button-font-size-range-slider-min',
                                    'sliderClass' => 'dnd-plugins-box-category-button-font-size-range-slider-min',
                                    'default' => 12,
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_letter_spacing',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_letter_spacing',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_letter_spacing_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_letter_spacing',
                                    'value' => '',
                                    'class' => 'dnd-plugins-box-category-button-letter-spacing-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_letter_spacing',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'dnd-plugins-box-category-button-letter-spacing-range-slider-min',
                                    'sliderClass' => 'dnd-plugins-box-category-button-letter-spacing-range-slider-min',
                                    'default' => 12,
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_cms_filter_text_indent',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_cms_filter_text_indent',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_cms_filter_text_indent_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_cms_filter_text_indent',
                                    'value' => '',
                                    'class' => 'dnd-plugins-box-category-button-cms-filter-text-indent-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_cms_filter_text_indent',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'dnd-plugins-box-category-button-cms-filter-text-indent-range-slider-min',
                                    'sliderClass' => 'dnd-plugins-box-category-button-cms-filter-text-indent-range-slider-min',
                                    'default' => 12,
                                ),
                            ),
                        ),


                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_hover_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_hover_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_hover_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_hover_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_hover_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#2c2c2c',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_hover_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_hover_border_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_hover_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_hover_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_hover_border_color',
                                    'category' => 'dragdrop',
                                    'default' => '#2c2c2c',
                                ),
                            ),
                        ),

                           array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_text_align',
                                'type' => 'Laminas\Form\Element\Radio',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_text_align',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_text_align_tooltip',
                                    'value_options' => array(
                                        'left' => '<label class="btn btn-default" for="melis_core_platform_theme_dnd_plugins_box_category_btn_text_align_left"><i class="bi bi-text-left"></i></label>',
                                        'center' => '<label class="btn btn-default" for="melis_core_platform_theme_dnd_plugins_box_category_btn_text_align_center"><i class="bi bi-text-center"></i></label>',
                                        'right' => '<label class="btn btn-default" for="melis_core_platform_theme_dnd_plugins_box_category_btn_text_align_right"><i class="bi bi-text-right"></i></label>',
                                    ),
                                    'label_attributes' => array(
                                        'class' => 'melis-radio-box',
                                    ),
                                    'disable_inarray_validator' => true,
                                ),
                                'attributes' => array(
                                    'value' => '',
                                    'placeholder' => '',
                                    'class' => 'form-control',
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_text_align',
                                    'category' => 'dragdrop',
                                    'default' => 'center'
                                ),
                            ),
                        ),
                              
                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_text_opacity',
                                    'type' => 'Text',
                                    'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_text_opacity',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_text_opacity_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_category_btn_text_opacity',
                                    'value' => '',
                                    'class' => 'dnd-plugins-box-category-button-text-opacity-range-slider-value range-slider-value form-control',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_category_btn_text_opacity',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'dnd-plugins-box-category-button-text-opacity-range-slider-min',
                                    'sliderClass' => 'dnd-plugins-box-category-button-text-opacity-range-slider-min',
                                    'default' => 12,
                                    ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_bg_color',
                                'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_border_color',
                                'type' => 'Text',
                                'options' => array(
                                'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_border_color',
                                'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_border_color_tooltip',
                            ),
                            'attributes' => array(
                                'id' => 'melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_border_color',
                                'value' => '',
                                'class' => 'form-control minicolor-hex',
                                'data-control' => 'hue',
                                'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_button_active_border_color',
                                'category' => 'dragdrop',
                                'default' => '#e61c23',
                                ),
                            ),
                        ),
                        
                        array(
                            'spec' => array(
                                    'name' => 'melis_core_platform_theme_dnd_plugins_box_cms_category_box_border_bottom_color',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_box_border_bottom_color',
                                        'tooltip' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_box_border_bottom_color_tooltip',
                                    ),
                                    'attributes' => array(
                                        'id' => 'melis_core_platform_theme_dnd_plugins_box_cms_category_box_border_bottom_color',
                                        'value' => '',
                                        'class' => 'form-control minicolor-hex',
                                        'data-control' => 'hue',
                                        'placeholder' => 'tr_melis_core_platform_theme_dnd_plugins_box_cms_category_box_border_bottom_color',
                                        'category' => 'dragdrop',
                                        'default' => '#e61c23',
                                    ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_zone_plugin_outline_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                'label' => 'tr_melis_core_platform_theme_dnd_zone_plugin_outline_hover_color',
                                'tooltip' => 'tr_melis_core_platform_theme_dnd_zone_plugin_outline_hover_color_tooltip',
                            ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_zone_plugin_outline_hover_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_zone_plugin_outline_hover_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ), 

                        array(
                                'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_zone_plugin_box_shadow_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_zone_plugin_box_shadow_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_zone_plugin_box_shadow_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_zone_plugin_box_shadow_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_zone_plugin_box_shadow_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugin_sub_tools_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugin_sub_tools_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugin_sub_tools_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugin_sub_tools_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugin_sub_tools_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_layout_column_button_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                'label' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_color',
                                'tooltip' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_layout_column_button_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_layout_column_button_border_color',
                                'type' => 'Text',
                                'options' => array(
                                'label' => 'tr_melis_core_platform_theme_dnd_layout_column_button_border_color',
                                'tooltip' => 'tr_melis_core_platform_theme_dnd_layout_column_button_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_layout_column_button_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_layout_column_button_border_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_layout_column_button_hover_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_layout_column_button_hover_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_layout_column_button_hover_color_tooltip',
                                ),
                            'attributes' => array(
                                'id' => 'melis_core_platform_theme_dnd_layout_column_button_hover_color',
                                'value' => '',
                                'class' => 'form-control minicolor-hex',
                                'data-control' => 'hue',
                                'placeholder' => 'tr_melis_core_platform_theme_dnd_layout_column_button_hover_color',
                                'category' => 'dragdrop',
                                'default' => '#fff',
                                ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_layout_wrapper_outline_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_layout_wrapper_outline_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_layout_wrapper_outline_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_layout_wrapper_outline_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_layout_wrapper_outline_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ), 

                        array(
                                'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_layout_buttons_bg_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_layout_buttons_bg_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_layout_buttons_bg_color_tooltip',
                                    ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_layout_buttons_bg_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_layout_buttons_bg_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                         ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_layout_column_button_bg_red_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_red_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_red_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_layout_column_button_bg_red_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_red_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_layout_column_button_bg_red_border_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_red_border_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_red_border_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_layout_column_button_bg_red_border_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_layout_column_button_bg_red_border_color',
                                    'category' => 'dragdrop',
                                    'default' => '#e61c23',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugin_box_module_plugin_title_text_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugin_box_module_plugin_title_text_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugin_box_module_plugin_title_text_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugin_box_module_plugin_title_text_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugin_box_module_plugin_title_text_color',
                                    'category' => 'dragdrop',
                                    'default' => '#fff',
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_plugin_box_module_title_opacity',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_plugin_box_module_title_opacity',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_plugin_box_module_title_opacity_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_plugin_box_module_title_opacity',
                                    'value' => '',
                                    'class' => 'form-control range-slider-value plugin-box-module-title-decimal-input-range-slider-value',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_plugin_box_module_title_opacity',
                                    'category' => 'dragdrop',
                                    'sliderId' => 'dnd-layout-plugin-box-module-title-opacity-range-slider-min',
                                    'sliderClass' => 'dnd-layout-plugin-box-module-title-opacity-range-slider-min plugin-box-module-title-decimal-range-slider-min',
                                    'default' => 1,
                                ),
                            ),
                        ),

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_no_content_before_after_pseudo_element_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_no_content_before_after_pseudo_element_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_no_content_before_after_pseudo_element_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_no_content_before_after_pseudo_element_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_no_content_before_after_pseudo_element_color',
                                    'category' => 'dragdrop',
                                    'default' => '#ce5459',
                                ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_zone_hover_outline_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_zone_hover_outline_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_zone_hover_outline_color_tooltip',
                                    ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_zone_hover_outline_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_zone_hover_outline_color',
                                    'category' => 'dragdrop',
                                    'default' => '#ce5459',
                                ),
                            ),
                        ), 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_zone_hover_shadow_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_zone_hover_shadow_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_zone_hover_shadow_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_zone_hover_shadow_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_zone_hover_shadow_color',
                                    'category' => 'dragdrop',
                                    'default' => '#ce5459',
                                ),
                            ),
                        ),                 

                        array(
                            'spec' => array(
                                'name' => 'melis_core_platform_theme_dnd_zone_icons_color',
                                'type' => 'Text',
                                'options' => array(
                                    'label' => 'tr_melis_core_platform_theme_dnd_zone_icons_color',
                                    'tooltip' => 'tr_melis_core_platform_theme_dnd_zone_icons_color_tooltip',
                                ),
                                'attributes' => array(
                                    'id' => 'melis_core_platform_theme_dnd_zone_icons_color',
                                    'value' => '',
                                    'class' => 'form-control minicolor-hex',
                                    'data-control' => 'hue',
                                    'placeholder' => 'tr_melis_core_platform_theme_dnd_zone_icons_color',
                                    'category' => 'dragdrop',
                                    'default' => '#fff',
                                ),
                            ),
                        ),                     
                    ),                  
                                
                    'input_filter' => array(
                        'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_style' => array(
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_style',
                            'required' => false,
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_dashboard_plugin_menu_box_title_font_style' => array(
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_font_style',
                            'required' => false,
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_toggle_btn_color' => array(
                            'name'     => 'melis_core_platform_theme_toggle_btn_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_toggle_btn_hover_color' => array(
                            'name'     => 'melis_core_platform_theme_toggle_btn_hover_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_logo_bg_color' => array(
                            'name'     => 'melis_core_platform_theme_logo_bg_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_logo_text_color' => array(
                            'name'     => 'melis_core_platform_theme_logo_text_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_user_profile_bg_color' => array(
                            'name'     => 'melis_core_platform_theme_user_profile_bg_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_user_profile_img_border_color' => array(
                            'name'     => 'melis_core_platform_theme_user_profile_img_border_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_user_profile_name_text_color' => array(
                            'name'     => 'melis_core_platform_theme_user_profile_name_text_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_user_profile_status_text_icon_color' => array(
                            'name'     => 'melis_core_platform_theme_user_profile_status_text_icon_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_menu_bg_color' => array(
                            'name'     => 'melis_core_platform_theme_menu_bg_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_menu_hover_color' => array(
                            'name'     => 'melis_core_platform_theme_menu_hover_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_menu_focus_color' => array(
                            'name'     => 'melis_core_platform_theme_menu_focus_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_menu_border_bottom_color' => array(
                            'name'     => 'melis_core_platform_theme_menu_border_bottom_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_menu_text_icon_color' => array(
                            'name'     => 'melis_core_platform_theme_menu_text_icon_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_submenu_bg_color' => array(
                            'name'     => 'melis_core_platform_theme_submenu_bg_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_submenu_text_icon_color' => array(
                            'name'     => 'melis_core_platform_theme_submenu_text_icon_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_submenu_text_icon_hover_color' => array(
                            'name'     => 'melis_core_platform_theme_submenu_text_icon_hover_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'melis_core_platform_theme_submenu_hover_active_bg_color' => array(
                            'name'     => 'melis_core_platform_theme_submenu_hover_active_bg_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),

                        //footer
                        'melis_core_platform_theme_footer_link_text_color' => array(
                            'name'     => 'melis_core_platform_theme_footer_link_text_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),

                        'melis_core_platform_theme_footer_text_color' => array(
                            'name'     => 'melis_core_platform_theme_footer_text_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),

                        'melis_core_platform_theme_header_text_icon_color' => array(
                            'name'     => 'melis_core_platform_theme_header_text_icon_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),

                        'melis_core_platform_theme_header_text_icon_active_color' => array(
                            'name'     => 'melis_core_platform_theme_header_text_icon_active_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),

                        'melis_core_platform_theme_header_bg_color' => array(
                            'name'     => 'melis_core_platform_theme_header_bg_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),

                        'melis_core_platform_theme_header_bg_active_color' => array(
                            'name'     => 'melis_core_platform_theme_header_bg_active_color',
                            'required' => false,
                            'validators' => array(
                                array(
                                    'name' => 'regex',
                                    'options' => array(
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => array(\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),

                        'melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_hover_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_hide_btn_bg_border_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_hide_btn_bg_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_hide_btn_bg_hover_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_hide_btn_bg_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_btn_text_hover_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_btn_text_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_header_text_icon_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_header_text_icon_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_updates_header_text_icon_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_updates_header_text_icon_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_news_header_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_news_header_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_updates_header_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_updates_header_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_notif_header_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_notif_header_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_msg_header_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_msg_header_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_bubble_plugin_news_btn_border_text_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_news_btn_border_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_notif_btn_border_text_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_notif_btn_border_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_msg_btn_border_text_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_msg_btn_border_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_updates_btn_text_hover_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_updates_btn_text_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_news_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_news_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_news_btn_bg_hover_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_news_btn_bg_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_header_btn_txt_font_size' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_header_btn_txt_font_size',
                            'required' => false,
                            'validators' => [],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_front_btn_txt_font_size' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_front_btn_txt_font_size',
                            'required' => false,
                            'validators' => [],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_back_header_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_back_header_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_back_header_text_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_back_header_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_back_header_text_font_size' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_back_header_text_font_size',
                            'required' => false,
                            'validators' => [],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_icon_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_icon_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_back_content_header_text_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_back_content_header_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_bubble_plugin_widget_back_content_details_text_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_back_content_details_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_border_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_no_plugin_alert_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dashboard_plugin_plugin_header_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_header_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_plugin_header_text_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_header_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_icon_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_icon_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_hover_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_hover_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_plugin_body_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_body_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_plugin_body_border_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_plugin_body_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dashboard_plugin_menu_box_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_box_border_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dashboard_plugin_menu_box_title_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dashboard_plugin_menu_box_title_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dashboard_plugin_menu_box_title_font_style' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_title_font_style',
                            'required' => false,
                            'validators' => [],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dashboard_plugin_menu_plugin_title_text_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_plugin_title_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        //modal                        
                        'melis_core_platform_theme_modal_bg_color' => [
                            'name'     => 'melis_core_platform_theme_modal_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_border_color' => [
                            'name'     => 'melis_core_platform_theme_modal_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_nav_tabs_bg_color' => [
                            'name'     => 'melis_core_platform_theme_modal_nav_tabs_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_nav_tabs_active_bg_color' => [
                            'name'     => 'melis_core_platform_theme_modal_nav_tabs_active_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_nav_tabs_text_icon_color' => [
                            'name'     => 'melis_core_platform_theme_modal_nav_tabs_text_icon_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_modal_nav_tabs_text_icon_hover_color' => [
                            'name'     => 'melis_core_platform_theme_modal_nav_tabs_text_icon_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_nav_tabs_border_right_color' => [
                            'name'     => 'melis_core_platform_theme_modal_nav_tabs_border_right_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_text_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_close_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_close_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_close_btn_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_close_btn_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_close_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_close_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_close_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_close_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_close_btn_hover_text_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_close_btn_hover_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_save_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_save_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_save_btn_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_save_btn_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_save_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_save_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_modal_content_save_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_save_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_modal_content_save_btn_hover_text_color' => [
                            'name'     => 'melis_core_platform_theme_modal_content_save_btn_hover_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_modal_content_text_font_styles' => [
                            'name'     => 'melis_core_platform_theme_modal_content_text_font_styles',
                            'required' => false,
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        //Dialog
                        'melis_core_platform_theme_dialog_content_header_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_content_header_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dialog_content_header_title_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_content_header_title_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dialog_close_button_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_close_button_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dialog_content_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_content_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dialog_content_border_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_content_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_dialog_content_text_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_content_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_no_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_no_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_no_btn_bg_hover_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_no_btn_bg_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_no_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_no_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_no_btn_border_hover_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_no_btn_border_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_no_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_no_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_no_btn_text_hover_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_no_btn_text_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_yes_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_yes_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_yes_btn_bg_hover_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_yes_btn_bg_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_yes_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_yes_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_yes_btn_border_hover_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_yes_btn_border_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_yes_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_yes_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_dialog_yes_btn_text_hover_color' => [
                            'name'     => 'melis_core_platform_theme_dialog_yes_btn_text_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        //Form Elements
                        'melis_core_platform_theme_form_bg_color' => [
                            'name'     => 'melis_core_platform_theme_form_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_text_color' => [
                            'name'     => 'melis_core_platform_theme_form_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_select_option_bg_color' => [
                            'name'     => 'melis_core_platform_theme_form_select_option_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_select_option_text_color' => [
                            'name'     => 'melis_core_platform_theme_form_select_option_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_input_elements_text_color' => [
                            'name'     => 'melis_core_platform_theme_form_input_elements_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_input_elements_border_color' => [
                            'name'     => 'melis_core_platform_theme_form_input_elements_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_input_elements_bg_color' => [
                            'name'     => 'melis_core_platform_theme_form_input_elements_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_input_text_disable_readonly_bg_color' => [
                            'name'     => 'melis_core_platform_theme_form_input_text_disable_readonly_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_input_text_disable_readonly_border_color' => [
                            'name'     => 'melis_core_platform_theme_form_input_text_disable_readonly_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_input_text_disable_readonly_text_color' => [
                            'name'     => 'melis_core_platform_theme_form_input_text_disable_readonly_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_button_submit_bg_color' => [
                            'name'     => 'melis_core_platform_theme_form_button_submit_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_button_submit_text_color' => [
                            'name'     => 'melis_core_platform_theme_form_button_submit_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_form_button_submit_border_color' => [
                            'name'     => 'melis_core_platform_theme_form_button_submit_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_tab_widget_head_bg_color' => [
                            'name'     => 'melis_core_platform_theme_tab_widget_head_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_tab_widget_head_border_color' => [
                            'name'     => 'melis_core_platform_theme_tab_widget_head_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_tab_widget_nav_item_border_right_color' => [
                            'name'     => 'melis_core_platform_theme_tab_widget_nav_item_border_right_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_tab_widget_nav_link_text_color' => [
                            'name'     => 'melis_core_platform_theme_tab_widget_nav_link_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_tab_widget_link_icon_color' => [
                            'name'     => 'melis_core_platform_theme_tab_widget_link_icon_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_tab_widget_nav_link_text_align' => [
                            'name'     => 'melis_core_platform_theme_tab_widget_nav_link_text_align',
                            'required' => false,
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_text_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_border_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_prev_next_data_action_button_text_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_prev_next_data_action_button_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_dow_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_dow_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_dow_text_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_dow_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_day_text_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_day_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_day_text_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_day_text_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_day_old_weekend_text_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_day_old_weekend_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_day_active_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_day_active_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_day_active_text_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_day_active_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_timepicker_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_timepicker_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_timepicker_btn_icon_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_timepicker_btn_icon_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_timepicker_btn_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_timepicker_btn_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_timepicker_arrow_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_timepicker_arrow_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_timepicker_arrow_btn_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_timepicker_arrow_btn_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_timepicker_time_bg_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_timepicker_time_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_timepicker_time_text_color' => [
                            'name'     => 'melis_core_platform_theme_datepicker_timepicker_time_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_button_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_button_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_button_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_button_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_button_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_button_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_button_border_bottom_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_button_border_bottom_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_button_bg_hover_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_button_bg_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_button_text_hover_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_button_text_hover_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_button_hover_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_button_hover_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_active_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_active_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_active_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_active_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_active_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_active_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_active_in_range_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_active_in_range_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_active_in_range_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_active_in_range_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],

                        'melis_core_platform_theme_daterangepicker_day_active_in_range_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_active_in_range_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_available_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_available_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_available_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_available_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_available_hover_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_available_hover_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_available_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_available_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_off_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_off_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_off_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_off_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_day_off_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_day_off_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_selected_date_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_selected_date_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_cancel_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_cancel_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_cancel_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_cancel_btn_hover_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_apply_btn_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_bg_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_apply_btn_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_border_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_border_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_apply_btn_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_text_color' => [
                            'name'     => 'melis_core_platform_theme_daterangepicker_footer_apply_btn_hover_text_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/',
                                        'messages' => [\Laminas\Validator\Regex::NOT_MATCH => 'tr_meliscore_platform_color_invalid_hex'],
                                        'encoding' => 'UTF-8',
                                    ],
                                ],
                            ],
                            'filters'  => [
                                ['name' => 'StripTags'],
                                ['name' => 'StringTrim'],
                            ],
                        ],
                        'melis_core_platform_theme_datepicker_prev_next_data_action_button_text_align' => [
                            'name'     => 'melis_core_platform_theme_datepicker_prev_next_data_action_button_text_align',
                            'required' => false,
                        ],
                        'melis_core_platform_theme_datepicker_table_th_td_text_align' => [
                            'name'     => 'melis_core_platform_theme_datepicker_table_th_td_text_align',
                            'required' => false,
                        ],
                        'melis_core_platform_theme_dnd_plugins_box_title_font_styles' => [
                            'name'     => 'melis_core_platform_theme_datepicker_table_th_td_text_align',
                            'required' => false,
                        ]
                    )
                ),
            ),
        ),
    ),
);