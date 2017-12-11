-- -----------------------------------------------------
-- Table `melis_core_microservice_auth`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `melis_core_microservice_auth` ;


CREATE TABLE IF NOT EXISTS `melis_core_user_connection_date` (
  `usrcd_id` INT NOT NULL AUTO_INCREMENT,
  `usrcd_usr_login` INT NOT NULL,
  `usrcd_last_login_date` DATETIME NOT NULL,
  `usrcd_last_connection_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usrcd_id`),
  INDEX `fk_usr_login_idx` (`usrcd_usr_login` ASC),
  INDEX `fk_usr_last_login_date_idx` (`usrcd_last_login_date` ASC))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `melis_core_microservice_auth` (
  `msoa_id` INT NOT NULL AUTO_INCREMENT,
  `msoa_user_id` INT NOT NULL,
  `msoa_status` TINYINT(1) NULL DEFAULT 0,
  `msoa_api_key` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`msoa_id`),
  INDEX `fk_user_id_idx` (`msoa_user_id` ASC))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `melis_core_platform_scheme`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `melis_core_platform_scheme` ;

CREATE TABLE IF NOT EXISTS `melis_core_platform_scheme` (
  `pscheme_id` INT NOT NULL AUTO_INCREMENT,
  `pscheme_name` VARCHAR(45) NULL,
  `pscheme_colors` TEXT NULL,
  `pscheme_sidebar_header_logo` TEXT NULL,
  `pscheme_sidebar_header_text` VARCHAR(45) NULL,
  `pscheme_login_logo` TEXT NULL,
  `pscheme_login_background` TEXT NULL,
  `pscheme_favicon` TEXT NULL,
  `pscheme_is_active` TINYINT(1) NULL DEFAULT 0,
  PRIMARY KEY (`pscheme_id`))
  ENGINE = InnoDB;


-- -----------------------------------------------------
-- Data for table `melis_core_platform_scheme`
-- -----------------------------------------------------
START TRANSACTION;
INSERT INTO `melis_core_platform_scheme` (`pscheme_id`, `pscheme_name`, `pscheme_colors`, `pscheme_sidebar_header_logo`, `pscheme_sidebar_header_text`, `pscheme_login_logo`, `pscheme_login_background`, `pscheme_favicon`, `pscheme_is_active`) VALUES (1, 'MELIS_DEFAULT', '{\"melis_core_platform_color_primary_color\":\"#981a1f\",\"melis_core_platform_color_secondary_color\":\"#c76c70\"}', '/MelisCore/images/dashboard/melis-logo.svg', 'MELIS PLATFORM', '/MelisCore/images/login/melis-box.png', '/MelisCore/images/login/melis-blackboard.jpg', '/favicon.ico', 0);
INSERT INTO `melis_core_platform_scheme` (`pscheme_id`, `pscheme_name`, `pscheme_colors`, `pscheme_sidebar_header_logo`, `pscheme_sidebar_header_text`, `pscheme_login_logo`, `pscheme_login_background`, `pscheme_favicon`, `pscheme_is_active`) VALUES (2, 'MELIS_SCHEME_1', '{\"melis_core_platform_color_primary_color\":\"#981a1f\",\"melis_core_platform_color_secondary_color\":\"#c76c70\"}', '/MelisCore/images/dashboard/melis-logo.svg', 'MELIS PLATFORM', '/MelisCore/images/login/melis-box.png', '/MelisCore/images/login/melis-blackboard.jpg', '/favicon.ico', 1);

COMMIT;