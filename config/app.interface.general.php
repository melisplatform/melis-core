<?php 
// Meliscore tree view tool ordering
return array(
    'plugins' => array(
        'meliscore' => array(
            'interface' => array(
                'meliscore_leftmenu' => array(
                    'interface' => array(
                        'meliscore_toolstree' => array(
                            'interface' => array(
                                'meliscore_tool_system_config' => array(
                                    'interface' => array(
                                        'meliscore_tool_user_module_management' => array(
                                            'conf' => array(
                                                'type' => 'meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree/interface/meliscore_tool_system_config/interface/meliscore_tool_user_module_management'
                                            ),
                                        ),
                                        'meliscore_tool_phpunit' => array(
                                            'conf' => array(
                                                'type' => 'meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree/interface/meliscore_tool_system_config/interface/meliscore_tool_phpunit'
                                            ),
                                        ),
                                        'meliscore_tool_language' => array(
                                            'conf' => array(
                                                'type' => 'meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree/interface/meliscore_tool_system_config/interface/meliscore_tool_language'
                                            ),
                                        ),
                                        'meliscore_tool_platform' => array(
                                            'conf' => array(
                                                'type' => 'meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree/interface/meliscore_tool_system_config/interface/meliscore_tool_platform'
                                            ),
                                        ),
                                        'meliscore_logs_tool' => array(
                                            'conf' => array(
                                                'type' => 'meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree/interface/meliscore_tool_system_config/interface/meliscore_logs_tool'
                                            ),
                                        ),
                                        'meliscore_tool_emails_mngt' => array(
                                            'conf' => array(
                                                'type' => 'meliscore/interface/meliscore_leftmenu/interface/meliscore_toolstree/interface/meliscore_tool_system_config/interface/meliscore_tool_emails_mngt'
                                            ),
                                        ),
                                    )  
                                ),
                            ),
                        ),
                    ),
                ),
            ),    
        ),
    ),
);