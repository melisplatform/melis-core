-- ============================================================================
-- 26092201_core_security_audit_log.sql
-- Security audit trail (DEKRA correction plan, item 21.0).
--
-- Three things happen here:
--   1. melis_core_log.log_user_id becomes nullable. Security events that have no logged-in
--      user (a login attempt on an account that does not exist) could not be stored before:
--      MelisCoreLogService::saveLog() drops the row when the user id is null, and the column
--      was NOT NULL anyway. This is why a password sweep over unknown logins left no trace.
--   2. Three columns are added: the client IP, the login that was typed (for failed attempts
--      on unknown accounts, where no user id exists) and a small free-form JSON context.
--   3. The security log types are seeded, with their EN/FR names, so they can be filtered in
--      the Logs tool from the first run instead of appearing only after their first use.
--
-- Every statement is idempotent: this file has to run on environments where melis-core's own
-- dbdeploy scripts already did part of the job, and on fresh installs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. melis_core_log.log_user_id -> nullable
-- ----------------------------------------------------------------------------
SET @is_nullable := (
  SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'melis_core_log'
    AND COLUMN_NAME = 'log_user_id'
);
SET @ddl := IF(@is_nullable = 'NO',
  'ALTER TABLE `melis_core_log` MODIFY `log_user_id` INT NULL COMMENT ''User who triggered the event, NULL for anonymous events (login attempts)''',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------------------------------------------------------
-- 2. New columns
-- ----------------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'melis_core_log'
    AND COLUMN_NAME = 'log_ip'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE `melis_core_log` ADD COLUMN `log_ip` VARCHAR(45) NULL COMMENT ''Client IP (IPv4 or IPv6)'' AFTER `log_user_id`',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'melis_core_log'
    AND COLUMN_NAME = 'log_login_attempted'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE `melis_core_log` ADD COLUMN `log_login_attempted` VARCHAR(255) NULL COMMENT ''Login typed on a failed attempt, when no user id can be resolved'' AFTER `log_ip`',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'melis_core_log'
    AND COLUMN_NAME = 'log_context'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE `melis_core_log` ADD COLUMN `log_context` TEXT NULL COMMENT ''Small JSON context (user agent, file path, exported row count...)'' AFTER `log_login_attempted`',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index used by the detection rules: "how many failures from this IP in the last N minutes".
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'melis_core_log'
    AND INDEX_NAME = 'idx_ip_date'
);
SET @ddl := IF(@idx_exists = 0,
  'ALTER TABLE `melis_core_log` ADD KEY `idx_ip_date` (`log_ip`, `log_date_added`)',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- melis-core's own dbdeploy script 26042201 adds these indexes too, but it is not guaranteed to
-- have run here, and the detection rules below depend on them being present.
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'melis_core_log'
    AND INDEX_NAME = 'idx_type'
);
SET @ddl := IF(@idx_exists = 0,
  'ALTER TABLE `melis_core_log` ADD KEY `idx_type` (`log_type_id`)',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'melis_core_log'
    AND INDEX_NAME = 'idx_date'
);
SET @ddl := IF(@idx_exists = 0,
  'ALTER TABLE `melis_core_log` ADD KEY `idx_date` (`log_date_added`)',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------------------------------------------------------
-- 3. Seed the security log types + their EN (lang 1) and FR (lang 2) names
--
-- The list is spelled out inline as a derived table (SELECT ... UNION ALL ...) rather than
-- loaded into a temporary table: the deploy accounts do not hold CREATE TEMPORARY TABLES,
-- so a CREATE TEMPORARY TABLE there fails with error 1044 "Access denied ... to database",
-- which is what stopped this migration on dev4. A derived table needs no privilege beyond
-- the SELECT and INSERT already required.
--
-- Two things are spelled out on the literals, both needed because the connection charset is
-- not guaranteed (flyway connects in utf8mb4, the mysql client in a container may not):
--   _utf8mb4'...'  the bytes in this file are UTF-8 and must be read as such, otherwise the
--                  accented French names are stored as mojibake on a latin1 connection, and
--                  COLLATE utf8mb4_general_ci is rejected outright with error 1253.
--   COLLATE ...    `code` is compared against melis_core_log_type.logt_code, which is
--                  utf8mb4_general_ci. A derived-table column carries implicit coercibility
--                  just like a real one, so two different implicit collations meeting in the
--                  join give "Illegal mix of collations". Declaring it on the first branch of
--                  the UNION fixes the collation of the whole derived table.

INSERT INTO `melis_core_log_type` (`logt_code`)
SELECT t.`code`
FROM (
  SELECT _utf8mb4'LOGIN_OK' COLLATE utf8mb4_general_ci AS `code`,
         _utf8mb4'Successful login' COLLATE utf8mb4_general_ci AS `name_en`,
         _utf8mb4'Connexion réussie' COLLATE utf8mb4_general_ci AS `name_fr`
  UNION ALL SELECT _utf8mb4'LOGOUT', _utf8mb4'Logout', _utf8mb4'Déconnexion'
  UNION ALL SELECT _utf8mb4'WRONG_LOGIN_CREDENTIALS', _utf8mb4'Wrong credentials', _utf8mb4'Identifiants incorrects'
  UNION ALL SELECT _utf8mb4'LOGIN_FAIL_UNKNOWN_USER', _utf8mb4'Login on unknown account', _utf8mb4'Connexion sur compte inconnu'
  UNION ALL SELECT _utf8mb4'ACCOUNT_LOCKED', _utf8mb4'Account locked', _utf8mb4'Compte verrouillé'
  UNION ALL SELECT _utf8mb4'ACCOUNT_UNLOCKED', _utf8mb4'Account unlocked', _utf8mb4'Compte déverrouillé'
  UNION ALL SELECT _utf8mb4'USER_EXPORT', _utf8mb4'User data export', _utf8mb4'Export de données utilisateurs'
  UNION ALL SELECT _utf8mb4'SENSITIVE_READ', _utf8mb4'Sensitive data read', _utf8mb4'Lecture de données sensibles'
  UNION ALL SELECT _utf8mb4'FILE_UPLOAD', _utf8mb4'File uploaded', _utf8mb4'Fichier téléversé'
  UNION ALL SELECT _utf8mb4'FILE_DELETE', _utf8mb4'File deleted', _utf8mb4'Fichier supprimé'
  UNION ALL SELECT _utf8mb4'FILE_RENAME', _utf8mb4'File renamed', _utf8mb4'Fichier renommé'
  UNION ALL SELECT _utf8mb4'FILE_MOVE', _utf8mb4'File moved or copied', _utf8mb4'Fichier déplacé ou copié'
  UNION ALL SELECT _utf8mb4'FILE_EDIT', _utf8mb4'File edited', _utf8mb4'Fichier modifié'
  UNION ALL SELECT _utf8mb4'FILE_CREATE_DIR', _utf8mb4'Folder created', _utf8mb4'Dossier créé'
  UNION ALL SELECT _utf8mb4'SECURITY_ALERT', _utf8mb4'Security alert sent', _utf8mb4'Alerte de sécurité envoyée'
) t
WHERE NOT EXISTS (
  SELECT 1 FROM `melis_core_log_type` lt WHERE lt.`logt_code` = t.`code`
);

INSERT INTO `melis_core_log_type_trans` (`logtt_lang_id`, `logtt_type_id`, `logtt_name`, `logtt_description`)
SELECT 1, lt.`logt_id`, t.`name_en`, t.`name_en`
FROM (
  SELECT _utf8mb4'LOGIN_OK' COLLATE utf8mb4_general_ci AS `code`,
         _utf8mb4'Successful login' COLLATE utf8mb4_general_ci AS `name_en`,
         _utf8mb4'Connexion réussie' COLLATE utf8mb4_general_ci AS `name_fr`
  UNION ALL SELECT _utf8mb4'LOGOUT', _utf8mb4'Logout', _utf8mb4'Déconnexion'
  UNION ALL SELECT _utf8mb4'WRONG_LOGIN_CREDENTIALS', _utf8mb4'Wrong credentials', _utf8mb4'Identifiants incorrects'
  UNION ALL SELECT _utf8mb4'LOGIN_FAIL_UNKNOWN_USER', _utf8mb4'Login on unknown account', _utf8mb4'Connexion sur compte inconnu'
  UNION ALL SELECT _utf8mb4'ACCOUNT_LOCKED', _utf8mb4'Account locked', _utf8mb4'Compte verrouillé'
  UNION ALL SELECT _utf8mb4'ACCOUNT_UNLOCKED', _utf8mb4'Account unlocked', _utf8mb4'Compte déverrouillé'
  UNION ALL SELECT _utf8mb4'USER_EXPORT', _utf8mb4'User data export', _utf8mb4'Export de données utilisateurs'
  UNION ALL SELECT _utf8mb4'SENSITIVE_READ', _utf8mb4'Sensitive data read', _utf8mb4'Lecture de données sensibles'
  UNION ALL SELECT _utf8mb4'FILE_UPLOAD', _utf8mb4'File uploaded', _utf8mb4'Fichier téléversé'
  UNION ALL SELECT _utf8mb4'FILE_DELETE', _utf8mb4'File deleted', _utf8mb4'Fichier supprimé'
  UNION ALL SELECT _utf8mb4'FILE_RENAME', _utf8mb4'File renamed', _utf8mb4'Fichier renommé'
  UNION ALL SELECT _utf8mb4'FILE_MOVE', _utf8mb4'File moved or copied', _utf8mb4'Fichier déplacé ou copié'
  UNION ALL SELECT _utf8mb4'FILE_EDIT', _utf8mb4'File edited', _utf8mb4'Fichier modifié'
  UNION ALL SELECT _utf8mb4'FILE_CREATE_DIR', _utf8mb4'Folder created', _utf8mb4'Dossier créé'
  UNION ALL SELECT _utf8mb4'SECURITY_ALERT', _utf8mb4'Security alert sent', _utf8mb4'Alerte de sécurité envoyée'
) t
JOIN `melis_core_log_type` lt ON lt.`logt_code` = t.`code`
WHERE NOT EXISTS (
  SELECT 1 FROM `melis_core_log_type_trans` tr
  WHERE tr.`logtt_type_id` = lt.`logt_id` AND tr.`logtt_lang_id` = 1
);

INSERT INTO `melis_core_log_type_trans` (`logtt_lang_id`, `logtt_type_id`, `logtt_name`, `logtt_description`)
SELECT 2, lt.`logt_id`, t.`name_fr`, t.`name_fr`
FROM (
  SELECT _utf8mb4'LOGIN_OK' COLLATE utf8mb4_general_ci AS `code`,
         _utf8mb4'Successful login' COLLATE utf8mb4_general_ci AS `name_en`,
         _utf8mb4'Connexion réussie' COLLATE utf8mb4_general_ci AS `name_fr`
  UNION ALL SELECT _utf8mb4'LOGOUT', _utf8mb4'Logout', _utf8mb4'Déconnexion'
  UNION ALL SELECT _utf8mb4'WRONG_LOGIN_CREDENTIALS', _utf8mb4'Wrong credentials', _utf8mb4'Identifiants incorrects'
  UNION ALL SELECT _utf8mb4'LOGIN_FAIL_UNKNOWN_USER', _utf8mb4'Login on unknown account', _utf8mb4'Connexion sur compte inconnu'
  UNION ALL SELECT _utf8mb4'ACCOUNT_LOCKED', _utf8mb4'Account locked', _utf8mb4'Compte verrouillé'
  UNION ALL SELECT _utf8mb4'ACCOUNT_UNLOCKED', _utf8mb4'Account unlocked', _utf8mb4'Compte déverrouillé'
  UNION ALL SELECT _utf8mb4'USER_EXPORT', _utf8mb4'User data export', _utf8mb4'Export de données utilisateurs'
  UNION ALL SELECT _utf8mb4'SENSITIVE_READ', _utf8mb4'Sensitive data read', _utf8mb4'Lecture de données sensibles'
  UNION ALL SELECT _utf8mb4'FILE_UPLOAD', _utf8mb4'File uploaded', _utf8mb4'Fichier téléversé'
  UNION ALL SELECT _utf8mb4'FILE_DELETE', _utf8mb4'File deleted', _utf8mb4'Fichier supprimé'
  UNION ALL SELECT _utf8mb4'FILE_RENAME', _utf8mb4'File renamed', _utf8mb4'Fichier renommé'
  UNION ALL SELECT _utf8mb4'FILE_MOVE', _utf8mb4'File moved or copied', _utf8mb4'Fichier déplacé ou copié'
  UNION ALL SELECT _utf8mb4'FILE_EDIT', _utf8mb4'File edited', _utf8mb4'Fichier modifié'
  UNION ALL SELECT _utf8mb4'FILE_CREATE_DIR', _utf8mb4'Folder created', _utf8mb4'Dossier créé'
  UNION ALL SELECT _utf8mb4'SECURITY_ALERT', _utf8mb4'Security alert sent', _utf8mb4'Alerte de sécurité envoyée'
) t
JOIN `melis_core_log_type` lt ON lt.`logt_code` = t.`code`
WHERE NOT EXISTS (
  SELECT 1 FROM `melis_core_log_type_trans` tr
  WHERE tr.`logtt_type_id` = lt.`logt_id` AND tr.`logtt_lang_id` = 2
);
