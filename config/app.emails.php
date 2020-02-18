<?php 
return array(
    'plugins' => array(
        'meliscore' => array(
            'datas' => array(
                'default' => array(
                    'emails' => array(
                        'default_layout_title' => 'Melis Technology',
                        'default_layout_ftr_info' => 'Melis Technology<br>Address: 4 rue du Dahomey, 75011 Paris France<br>Phone: (+33) 972 386 280<br>Mail: contact@melistechnology.com'
                    )
                )
            ),
            'emails' => array(
                'LOSTPASSWORD' => array(
                    'email_name' => 'Lost Password',
                    'layout' => 'melis-core/view/layout/layoutEmail.phtml',
                    'headers' => array(
                        'from' => 'noreply@melistechnology.com',
                        'from_name' => 'Melis Technology',
                        'replyTo' => 'noreply@melistechnology.com',
                        'tags' => 'USER_LOGIN,URL',
                    ),
                    'contents' => array(
                        'en_EN' => array(
                            'subject' => 'tr_meliscore_email_lost_password_Subject',
                            'html' => 'tr_meliscore_email_lost_password_html_Content',
                            'text' => 'tr_meliscore_email_lost_password_text_Content',
                        ),
                        'fr_FR' => array(
                            'subject' => 'tr_meliscore_email_lost_password_Subject',
                            'html' => 'tr_meliscore_email_lost_password_html_Content',
                            'text' => 'tr_meliscore_email_lost_password_text_Content',
                        ),
                    ),
                ),
                'ACCOUNTCREATION' => array(
                    'email_name' => 'Account Creation',
                    'layout' => 'melis-core/view/layout/layoutEmail.phtml',
                    'headers' => array(
                        'from' => 'noreply@melistechnology.com',
                        'from_name' => 'Melis Technology',
                        'replyTo' => 'noreply@melistechnology.com',
                        'tags' => 'NAME,EMAIL,LOGIN,PASSWORD',
                    ),
                    'contents' => array(
                        'en_EN' => array(
                            'subject' => 'tr_meliscore_email_create_account_Subject',
                            'html' => 'tr_meliscore_email_create_account_html_Content',
                            'text' => '',
                        ),
                        'fr_FR' => array(
                            'subject' => 'tr_meliscore_email_create_account_Subject',
                            'html' => 'tr_meliscore_email_create_account_html_Content',
                            'text' => '',
                        ),
                    ),
                ),
                'PASSWORDCREATION' => array(
                    'email_name' => 'Password Creation',
                    'layout' => 'melis-core/view/layout/layoutEmail.phtml',
                    'headers' => array(
                        'from' => 'noreply@melistechnology.com',
                        'from_name' => 'Melis Technology',
                        'replyTo' => 'noreply@melistechnology.com',
                        'tags' => 'NAME,EMAIL,LOGIN,PASSWORD',
                    ),
                    'contents' => array(
                        'en_EN' => array(
                            'subject' => 'tr_meliscore_email_create_account_Subject',
                            'html' => 'tr_meliscore_email_create_account_html_Content',
                            'text' => '',
                        ),
                        'fr_FR' => array(
                            'subject' => 'tr_meliscore_email_create_account_Subject',
                            'html' => 'tr_meliscore_email_create_account_html_Content',
                            'text' => '',
                        ),
                    ),
                ),
                'PASSWORDMODIFICATION' => array(
                    'email_name' => 'Password Modification',
                    'layout' => 'melis-core/view/layout/layoutEmail.phtml',
                    'headers' => array(
                        'from' => 'noreply@melistechnology.com',
                        'from_name' => 'Melis Technology',
                        'replyTo' => 'noreply@melistechnology.com',
                        'tags' => 'NAME,PASSWORD',
                    ),
                    'contents' => array(
                        'en_EN' => array(
                            'subject' => 'tr_meliscore_email_password_modification_Subject',
                            'html' => 'tr_meliscore_email_password_modification_html_Content',
                            'text' => '',
                        ),
                        'fr_FR' => array(
                            'subject' => 'tr_meliscore_email_password_modification_Subject',
                            'html' => 'tr_meliscore_email_password_modification_html_Content',
                            'text' => '',
                        ),
                    ),
                ),
            )
        )
    )
);