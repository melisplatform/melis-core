-- ============================================================================
-- 26092202_core_create_rate_limit_table.sql
-- Counters of the global rate limiting with progressive delay (security audit item 17.0).
--
-- One row per (scope, key): scope = login | reset | coupon, key = the client IP or, for the
-- login, the account name. MelisCoreRateLimitService counts the failures, computes the lock
-- and sweeps the rows older than a day on every write; nothing else reads this table.
-- Stored in the database on purpose: the pods scale, a per-pod memory or file counter would
-- give an attacker as many free attempts as there are pods.
-- ============================================================================

CREATE TABLE IF NOT EXISTS `melis_core_rate_limit` (
  `rl_key`          varchar(191) NOT NULL COMMENT 'sha1(scope|kind:value)',
  `rl_scope`        varchar(32)  NOT NULL,
  `rl_subject`      varchar(191) NOT NULL COMMENT 'kind:value, readable, for the log',
  `rl_count`        int(11)      NOT NULL DEFAULT 0,
  `rl_first_at`     datetime     NOT NULL COMMENT 'start of the counting window',
  `rl_last_at`      datetime     NOT NULL,
  `rl_locked_until` datetime     DEFAULT NULL,
  PRIMARY KEY (`rl_key`),
  KEY `rl_first_at` (`rl_first_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
