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
// 					    array(
// 					        'spec' => array(
// 					            'name' => 'usr_rem',
// 					            'type' => 'checkbox',
//                                  'options' => array(
//                                      'label' => 'tr_meliscore_login_remember_me',
//                                      'label_attributes' => array('class'=>'checkbox'),
//                                  ),
// 					        ),
// 					    ),
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
                        array(
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
                        ),
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
                        'melis_core_platform_color_sidebar_bg_color' => array(
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
                        ),
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
			),
		),
	),
);