-- -----------------------------------------------------
-- Table `melis_core_microservice_auth`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `melis_core_microservice_auth` ;

CREATE TABLE IF NOT EXISTS `melis_core_microservice_auth` (
  `msoa_id` INT NOT NULL AUTO_INCREMENT,
  `msoa_user_id` INT NOT NULL,
  `msoa_status` TINYINT(1) NULL DEFAULT 0,
  `msoa_api_key` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`msoa_id`),
  INDEX `fk_user_id_idx` (`msoa_user_id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `melis_core_microservice_logs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `melis_core_microservice_logs` ;

CREATE TABLE IF NOT EXISTS `melis_core_microservice_logs` (
  `msl_id` INT NOT NULL AUTO_INCREMENT,
  `msl_user_id` INT NOT NULL,
  `msl_payload` TEXT NOT NULL,
  `msl_response` TEXT NULL,
  `msl_url` TEXT NOT NULL,
  `msl_date_requested` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`msl_id`),
  INDEX `fk_user_id_idx` (`msl_user_id` ASC))
ENGINE = InnoDB;