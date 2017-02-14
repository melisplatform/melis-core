-- -----------------------------------------------------
-- Table `melis_core_log_type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `melis_core_log_type` (
  `logt_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Log type id',
  `logt_code` VARCHAR(255) NOT NULL COMMENT 'log code is the codename of the action ex. PAGE_PABLISH for publishing a page, ADD_USER for adding new user',
  PRIMARY KEY (`logt_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `melis_core_log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `melis_core_log` (
  `log_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Log Id',
  `log_title` VARCHAR(255) NOT NULL COMMENT 'log title',
  `log_message` VARCHAR(255) NOT NULL COMMENT 'log message',
  `log_action_status` INT NOT NULL DEFAULT 0 COMMENT 'The status of the action \"1\" or \"0\"',
  `log_type_id` INT(11) NOT NULL COMMENT 'log type it is the foriegn key of melis_core_type id',
  `log_item_id` INT(11) NULL COMMENT 'Log item Id is the foreign key of the item (item can be UserId, SiteId, TemplateId, ProspectId etc...)',
  `log_user_id` INT(11) NOT NULL COMMENT 'User Id who trigger the event',
  `log_date_added` DATETIME NOT NULL COMMENT 'Log date added/created',
  PRIMARY KEY (`log_id`),
  INDEX `fk_melis_core_logs_melis_core_user1_idx` (`log_user_id` ASC),
  INDEX `fk_melis_core_logs_melis_core_logs_type1_idx` (`log_type_id` ASC))
ENGINE = InnoDB
COMMENT = 'Melis Core Logs';


-- -----------------------------------------------------
-- Table `melis_core_log_type_trans`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `melis_core_log_type_trans` (
  `logtt_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Log type translation id',
  `logtt_lang_id` INT(11) NOT NULL COMMENT 'Log type Language Id',
  `logtt_type_id` INT NOT NULL COMMENT 'Log type id foreign key of melis_core_logs_type',
  `logtt_name` VARCHAR(255) NULL COMMENT 'Log type name',
  `logtt_description` VARCHAR(255) NULL COMMENT 'Log type description',
  PRIMARY KEY (`logtt_id`),
  INDEX `fk_melis_core_logs_type_trans_melis_core_lang1_idx` (`logtt_lang_id` ASC),
  INDEX `fk_melis_core_logs_type_trans_melis_core_logs_type1_idx` (`logtt_type_id` ASC))
ENGINE = InnoDB;

ALTER TABLE `melis_core_user` ADD `usr_admin` INT NOT NULL DEFAULT '0' AFTER `usr_role_id`;