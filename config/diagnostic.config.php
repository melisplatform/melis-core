<?php

return array(

    'plugins' => array(
        'diagnostic' => array(
            'MelisCore' => array(
                
                // tests to execute
                'basicTest' => array(
                    'controller' => 'Diagnostic',
                    'action' => 'basicTest',
                    'payload' => array(
                        'label' => 'tr_melis_module_rights_dir',
                        'module' => 'MelisCore'
                    )
                ),
      
                'fileCreationTest' => array(
                    'controller' => 'Diagnostic',
                    'action' => 'fileCreationTest',
                    'payload' => array(
                        'label' => 'tr_melis_module_basic_action_test',
                        'path' => MELIS_MODULES_FOLDER.'MelisCore/public/',
                        'file' => 'test_file_creation.txt'
                    ),
                ),
                
                'checkImportantFolders' => array(
                    'controller' => 'Diagnostic',
                    'action' => 'checkImportantFolders',
                    'payload' => array(
                        'label' => 'tr_melis_diagnostic_test_important_folders',
                        'folderPath' => array(
                            'module/MelisCore/public/images/profiles',
                            'module/MelisCore/public/images/login',
                        ),
                    ),
                ),
        
                'testModuleTables' => array(
                    'controller' => 'Diagnostic',
                    'action' => 'testModuleTables',
                    'payload' => array(
                        'label' => 'tr_melis_module_db_test',
                        'tables' => array(
                            'melis_core_lang', 
                            'melis_core_lost_password',
                            'melis_core_platform',
                            'melis_core_user',
                        )
                    ),
                ),
            ),
        
        ),
    ),


);

