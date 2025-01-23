ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_top_logo` TEXT NULL AFTER `pscheme_is_active`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_user_profile` TEXT NULL AFTER `pscheme_top_logo`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_menu` TEXT NULL AFTER `pscheme_user_profile`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_footer` TEXT NULL AFTER `pscheme_menu`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_header_navigation` TEXT NULL AFTER `pscheme_footer`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_bubble_plugins` TEXT NULL AFTER `pscheme_header_navigation`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_dashboard_plugins` TEXT NULL AFTER `pscheme_bubble_plugins`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_dashboard_plugins_menu` TEXT NULL AFTER `pscheme_dashboard_plugins`; 