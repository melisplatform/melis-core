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
                        'melis_core_platform_color_secondary_color' => array(
                            'name'     => 'melis_core_platform_color_secondary_color',
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
                    'elements' => array(

                    ),
                    'input_filter' => array(

                    )
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                    false,
                                    'options' => array(
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                        'melis_core_platform_theme_bubble_plugin_widget_back_header_bg_color' => [
                            'name'     => 'melis_core_platform_theme_bubble_plugin_widget_back_header_bg_color',
                            'required' => false,
                            'validators' => [
                                [
                                    'name' => 'regex',
                                    'options' => [
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                                        'pattern' => '/#?([\da-fA-F]{3}|[\da-fA-F]{6})/',
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
                    )
                ),
			),
		),
	),
);