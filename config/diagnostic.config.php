<?php

return array(

    'plugins' => array(
        'diagnostic' => array(
            'conf' => array(
                // user rights exclusions
                'rightsDisplay' => 'none',
            ),
            'MelisCore' => array(
                'testFolder' => 'test',
                'moduleTestName' => 'MelisCoreTest',
                'db' => array(),
                'methods' => array(
                    'testSendEmail' => array(
                        'payloads' => array(
                            'recipient' => 'ianborla@mail.com',
                            'recipient_name' => 'Ian Borla',
                            'subject' => 'Test Email',
                            'message' => '<h1>Diagnostic Test Email</h1><p>Please ignore this message.</p>',
                            'from_email' => 'ffesch@mail.local',
                            'from_name'  => 'Diagnostic Tester',
                        ),
                    ),
                ),
            ),
        ),
    ),


);

