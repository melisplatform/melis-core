-- -----------------------------------------------------
-- Table `melis_core_dashboards`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `melis_core_dashboards` ;

CREATE TABLE IF NOT EXISTS `melis_core_dashboards` (
  `d_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Dashboard primary key',
  `d_dashboard_id` VARCHAR(50) NOT NULL COMMENT 'Dashboard id or Zone id',
  `d_user_id` INT(11) NOT NULL COMMENT 'Dashboard user id',
  `d_content` TEXT NULL COMMENT 'Dashboard xmd content',
  PRIMARY KEY (`d_id`),
  INDEX `fk_melis_core_dashboards_melis_core_user1_idx` (`d_user_id` ASC))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;