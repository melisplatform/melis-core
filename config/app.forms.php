<?php

return array(
	'plugins' => array(
		'meliscore' => array(
			'forms' => array(
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
                                    'class' => 'form-control',
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
                                    'class' => 'form-control',
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
                                    'class' => 'form-control',
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
                                    'class' => 'form-control',
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