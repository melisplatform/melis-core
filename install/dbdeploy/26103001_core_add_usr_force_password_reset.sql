-- "Force password reset at next login": set by an administrator in the Users tool, the user
-- then has to choose a new password at the next login before getting in. Cleared as soon as the
-- user sets a new password (reset page, password creation link, own profile).
-- Idempotent (MySQL 8 has no ADD COLUMN IF NOT EXISTS): also run as Flyway on the servers.
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'melis_core_user'
    AND COLUMN_NAME = 'usr_force_password_reset'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE `melis_core_user` ADD COLUMN `usr_force_password_reset` TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''1 = the user must choose a new password at the next login'' AFTER `usr_last_pass_update_date`',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
