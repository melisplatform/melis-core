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
					'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
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
			        'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
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
			        'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
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
			),
		),
	),
);