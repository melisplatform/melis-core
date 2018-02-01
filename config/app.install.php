<?php
return array(
    'plugins' => array(
        'melis_core_setup' => array(
            'forms' => array(
                'melis_core_setup_user_form' => array(
                    'attributes' => array(
                        'name' => 'melis_core_setup_user_form',
                        'id'   => 'melis_core_setup_user_form',
                        'method' => 'POST',
                        'action' => '',
                    ),
                    'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                    'elements'  => array(
                        array(
                            'spec' => array(
                                'name' => 'login',
                                'type' => 'MelisText',
                                'options' => array(
                                    'label' => 'tr_melis_installer_new_user_login',
                                    'tooltip' => 'tr_melis_installer_new_user_login_info',
                                ),
                                'attributes' => array(
                                    'id' => 'login',
                                    'value' => '',
                                    'placeholder' => 'tr_melis_installer_new_user_login',
                                    'text-required' => '*',
                                )
                            )
                        ),
                        array(
                            'spec' => array(
                                'name' => 'email',
                                'type' => 'email',
                                'options' => array(
                                    'label' => 'tr_melis_installer_new_user_email',
                                    'tooltip' => 'tr_melis_installer_new_user_email_info',
                                ),
                                'attributes' => array(
                                    'id' => 'email',
                                    'value' => '',
                                    'placeholder' => 'tr_melis_installer_new_user_email',
                                    'class' => 'form-control',
                                    'text-required' => '*',
                                )
                            )
                        ),
                        array(
                            'spec' => array(
                                'name' => 'password',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_melis_installer_new_user_password',
                                    'tooltip' => 'tr_melis_installer_new_user_password_info',
                                ),
                                'attributes' => array(
                                    'id' => 'password',
                                    'value' => '',
                                    'placeholder' => 'tr_melis_installer_new_user_password',
                                    'class' => 'form-control',
                                    'text-required' => '*',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'confirmPassword',
                                'type' => 'Password',
                                'options' => array(
                                    'label' => 'tr_Melis_installer_new_user_confirm_password',
                                    'tooltip' => 'tr_Melis_installer_new_user_confirm_password_info',
                                ),
                                'attributes' => array(
                                    'id' => 'confirmPassword',
                                    'value' => '',
                                    'placeholder' => 'tr_Melis_installer_new_user_confirm_password',
                                    'class' => 'form-control',
                                    'text-required' => '*',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'firstname',
                                'type' => 'MelisText',
                                'options' => array(
                                    'label' => 'tr_melis_installer_new_user_first_name',
                                    'tooltip' => 'tr_melis_installer_new_user_first_name_info',
                                ),
                                'attributes' => array(
                                    'id' => 'firstname',
                                    'value' => '',
                                    'placeholder' => 'tr_melis_installer_new_user_first_name',
                                    'text-required' => '*',
                                )
                            )
                        ),
                        array(
                            'spec' => array(
                                'name' => 'lastname',
                                'type' => 'MelisText',
                                'options' => array(
                                    'label' => 'tr_melis_installer_new_user_last_name',
                                    'tooltip' => 'tr_melis_installer_new_user_last_name_info',
                                ),
                                'attributes' => array(
                                    'id' => 'lastname',
                                    'value' => '',
                                    'placeholder' => 'tr_melis_installer_new_user_last_name',
                                    'text-required' => '*',
                                )
                            )
                        ),
                    ), // end elements
                    'input_filter' => array(
                        'login' => array(
                            'name'     => 'login',
                            'required' => true,
                            'validators' => array(
                                array(
                                    'name'    => 'StringLength',
                                    'options' => array(
                                        'encoding' => 'UTF-8',
                                        'max'      => 255,
                                        'messages' => array(
                                            \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_login_max',
                                        ),
                                    ),
                                ),
                                array(
                                    'name' => 'NotEmpty',
                                    'options' => array(
                                        'messages' => array(
                                            \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_login_empty',
                                        ),
                                    ),
                                ),
                                array(
                                    'name' => 'regex', false,
                                    'options' => array(
                                        'pattern' => '/^[A-Za-z][A-Za-z0-9]*$/',
                                        'messages' => array(\Zend\Validator\Regex::NOT_MATCH => 'tr_melis_installer_new_user_login_invalid'),
                                        'encoding' => 'UTF-8',
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'email' => array(
                            'name'     => 'email',
                            'required' => true,
                            'validators' => array(
                                array(
                                    'name' => 'EmailAddress',
                                    'options' => array(
                                        'domain'   => 'true',
                                        'hostname' => 'true',
                                        'mx'       => 'true',
                                        'deep'     => 'true',
                                        'message'  => 'tr_melis_installer_new_user_email_invalid',
                                    )
                                ),
                                array(
                                    'name' => 'NotEmpty',
                                    'options' => array(
                                        'messages' => array(
                                            \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_email_empty',
                                        ),
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'password' => array(
                            'name'     => 'password',
                            'required' => true,
                            'validators' => array(
                                array(
                                    'name' => '\MelisInstaller\Validator\MelisPasswordValidator',
                                    'options' => array(
                                        'min' => 8,
                                        'messages' => array(
                                            \MelisInstaller\Validator\MelisPasswordValidator::TOO_SHORT => 'tr_melis_installer_new_user_pass_short',
                                            \MelisInstaller\Validator\MelisPasswordValidator::NO_DIGIT => 'tr_melis_installer_new_user_pass_invalid',
                                            \MelisInstaller\Validator\MelisPasswordValidator::NO_LOWER => 'tr_melis_installer_new_user_pass_invalid',
                                        ),
                                    ),
                                ),
                                array(
                                    'name'    => 'StringLength',
                                    'options' => array(
                                        'encoding' => 'UTF-8',
                                        'max'      => 255,
                                        'messages' => array(
                                            \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_pass_max',
                                        ),
                                    ),
                                ),
                                array(
                                    'name' => 'NotEmpty',
                                    'options' => array(
                                        'messages' => array(
                                            \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_pass_empty',
                                        ),
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'confirmPassword' => array(
                            'name'     => 'confirmPassword',
                            'required' => true,
                            'validators' => array(
                                array(
                                    'name' => '\MelisInstaller\Validator\MelisPasswordValidator',
                                    'options' => array(
                                        'min' => 8,
                                        'messages' => array(
                                            \MelisInstaller\Validator\MelisPasswordValidator::TOO_SHORT => 'tr_melis_installer_new_user_pass_short',
                                            \MelisInstaller\Validator\MelisPasswordValidator::NO_DIGIT => 'tr_melis_installer_new_user_pass_invalid',
                                            \MelisInstaller\Validator\MelisPasswordValidator::NO_LOWER => 'tr_melis_installer_new_user_pass_invalid',
                                        ),
                                    ),
                                ),
                                array(
                                    'name'    => 'StringLength',
                                    'options' => array(
                                        'encoding' => 'UTF-8',
                                        'max'      => 255,
                                        'messages' => array(
                                            \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_pass_max',
                                        ),
                                    ),
                                ),
                                array(
                                    'name' => 'NotEmpty',
                                    'options' => array(
                                        'messages' => array(
                                            \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_pass_empty',
                                        ),
                                    ),
                                ),
                                array(
                                    'name' => 'Identical',
                                    'options' => array(
                                        'token' => 'password',
                                        'messages' => array(
                                            \Zend\Validator\Identical::NOT_SAME => 'tr_melis_installer_new_user_pass_no_match',
                                        ),
                                    ),
                                )
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'firstname' => array(
                            'name'     => 'firstname',
                            'required' => true,
                            'validators' => array(
                                array(
                                    'name'    => 'StringLength',
                                    'options' => array(
                                        'encoding' => 'UTF-8',
                                        //'min'      => 1,
                                        'max'      => 255,
                                        'messages' => array(
                                            \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_first_name_long',
                                        ),
                                    ),
                                ),
                                array(
                                    'name' => 'NotEmpty',
                                    'options' => array(
                                        'messages' => array(
                                            \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_first_name_empty',
                                        ),
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                        'lastname' => array(
                            'name'     => 'lastname',
                            'required' => true,
                            'validators' => array(
                                array(
                                    'name'    => 'StringLength',
                                    'options' => array(
                                        'encoding' => 'UTF-8',
                                        //'min'      => 1,
                                        'max'      => 255,
                                        'messages' => array(
                                            \Zend\Validator\StringLength::TOO_LONG => 'tr_melis_installer_new_user_last_name_long',
                                        ),
                                    ),
                                ),
                                array(
                                    'name' => 'NotEmpty',
                                    'options' => array(
                                        'messages' => array(
                                            \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melis_installer_new_user_last_name_empty',
                                        ),
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                    ), // end input_filter
                ), // end melis_installer_user_data
            ),
        ),
    ),
);