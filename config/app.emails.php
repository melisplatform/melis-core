<?php 
return array(
    'plugins' => array(
        'meliscore' => array(
            'emails' => array(
                'LOSTPASSWORD' => array(
                    'email_name' => 'Lost Password',
                    'layout' => '/MelisCore/view/layout/layoutEmail.phtml',
                    'headers' => array(
                        'from' => 'noreply@melistechnology.com',
                        'from_name' => 'Melis Technology',
                        'replyTo' => '',
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
                    'layout' => '/MelisCore/view/layout/layoutEmail.phtml',
                    'headers' => array(
                        'from' => 'noreply@melistechnology.com',
                        'from_name' => 'Melis Technology',
                        'replyTo' => '',
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
                    'layout' => '/MelisCore/view/layout/layoutEmail.phtml',
                    'headers' => array(
                        'from' => 'noreply@melistechnology.com',
                        'from_name' => 'Melis Technology',
                        'replyTo' => '',
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