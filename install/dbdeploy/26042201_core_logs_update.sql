-- ============================================================
-- Optimization ALTER script for melis_core_log tables
-- ============================================================

-- --------------------------------------------------------
-- melis_core_log
-- --------------------------------------------------------

-- 1. Fix column types
--    log_action_status: INT -> TINYINT(1)  (only stores 0 or 1)
--    log_id:            INT -> BIGINT      (safe headroom at millions of rows)
ALTER TABLE `melis_core_log`
    MODIFY `log_id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'Log Id',
    MODIFY `log_action_status` TINYINT(1)    NOT NULL DEFAULT 0      COMMENT 'Action status: 1=success, 0=failure';

-- 2. Add indexes for the most common query patterns:
--    - date range filters          (log_date_added)
--    - join/filter by type         (log_type_id)
--    - filter by user              (log_user_id)
--    - filter by item              (log_item_id + log_type_id)
--    - success/failure dashboards  (log_action_status + log_date_added)
--    - active/archived records     (log_status + log_date_added)
ALTER TABLE `melis_core_log`
    ADD KEY `idx_date`          (`log_date_added`),
    ADD KEY `idx_type`          (`log_type_id`),
    ADD KEY `idx_user`          (`log_user_id`),
    ADD KEY `idx_item_type`     (`log_item_id`, `log_type_id`),
    ADD KEY `idx_action_date`   (`log_action_status`, `log_date_added`),
    ADD KEY `idx_status_date`   (`log_status`, `log_date_added`);

-- --------------------------------------------------------
-- melis_core_log_type
-- --------------------------------------------------------

-- 3. Add unique index on logt_code to prevent duplicates and speed up lookups
ALTER TABLE `melis_core_log_type`
    ADD UNIQUE KEY `uq_logt_code` (`logt_code`);

-- --------------------------------------------------------
-- melis_core_log_type_trans
-- --------------------------------------------------------

-- 4. Add composite unique index (type + language = one translation per pair)
--    and a standalone index on lang_id for language-scoped queries
ALTER TABLE `melis_core_log_type_trans`
    ADD UNIQUE KEY `uq_type_lang`  (`logtt_type_id`, `logtt_lang_id`),
    ADD KEY        `idx_lang`      (`logtt_lang_id`);
