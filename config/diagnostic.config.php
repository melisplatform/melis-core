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
                
                'basicTest' => array(
                    'controller' => 'Diagnostic',
                    'action' => 'testModuleLoadFolder',
                    'payload' => array(
                        'label' => 'tr_melis_diag_test_module_config_title',
                        'folderPath' => array(
                            $_SERVER['DOCUMENT_ROOT'] .'/../config',
                        ),
                        'files' => array(
                             $_SERVER['DOCUMENT_ROOT'] .'/../config/melis.module.load.php'
                        )
                    )
                ),
                
                'checkImportantFolders' => array(
                    'controller' => 'Diagnostic',
                    'action' => 'checkImportantFolders',
                    'payload' => array(
                        'label' => 'tr_melis_diagnostic_test_important_folders',
                        'folderPath' => array(
                            'vendor/melisplatform/melis-core/public/images/login',
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

