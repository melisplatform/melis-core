-- -----------------------------------------------------
-- Table `melis_core_user_connection_date`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `melis_core_user_connection_date` ;

CREATE TABLE IF NOT EXISTS `melis_core_user_connection_date` (
  `usrcd_id` INT NOT NULL AUTO_INCREMENT,
  `usrcd_usr_login` INT NOT NULL,
  `usrcd_last_login_date` DATETIME NOT NULL,
  `usrcd_last_connection_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usrcd_id`),
  INDEX `fk_usr_login_idx` (`usrcd_usr_login` ASC),
  INDEX `fk_usr_last_login_date_idx` (`usrcd_last_login_date` ASC))
ENGINE = InnoDB;

ALTER TABLE `melis_core_user` ADD `usr_is_online` BOOLEAN NULL AFTER `usr_last_login_date`;