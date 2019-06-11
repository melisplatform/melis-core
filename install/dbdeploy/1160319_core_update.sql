-- -----------------------------------------------------
-- Table `melis_core_dashboards`
-- -----------------------------------------------------
ALTER TABLE `melis_core_log` ADD `log_status` BOOLEAN NULL DEFAULT TRUE AFTER `log_date_added`;
