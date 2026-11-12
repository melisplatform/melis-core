-- Login / password policy of the "Other config" tool (Mantis #11349).
-- Was written to vendor/melisplatform/melis-core/config/app.login.php, which is lost whenever a
-- server pod is recreated. Key/value: one row per setting (same keys as
-- meliscore/datas/otherconfig_default/login). No row = the default from config/otherconfig.php.
CREATE TABLE IF NOT EXISTS `melis_core_login_config` (
  `lcfg_id` int(11) NOT NULL AUTO_INCREMENT,
  `lcfg_key` varchar(191) NOT NULL,
  `lcfg_value` longtext NULL,
  PRIMARY KEY (`lcfg_id`),
  UNIQUE KEY `lcfg_key` (`lcfg_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
