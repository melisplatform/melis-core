-- -----------------------------------------------------
-- Update default MelisPlatform colors `melis_core_platform_scheme`
-- -----------------------------------------------------
START TRANSACTION;
UPDATE `melis_core_platform_scheme` SET `pscheme_colors`= '{\"melis_core_platform_color_primary_color\":\"#e61c23\",\"melis_core_platform_color_secondary_color\":\"#c52127\"}' where pscheme_id = 1;
UPDATE `melis_core_platform_scheme` SET `pscheme_colors`= '{\"melis_core_platform_color_primary_color\":\"#e61c23\",\"melis_core_platform_color_secondary_color\":\"#c52127\"}' where pscheme_id = 2;

COMMIT;