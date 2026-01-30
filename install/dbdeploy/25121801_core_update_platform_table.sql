ALTER TABLE melis_core_platform
ADD COLUMN plf_2fa_active TINYINT(1) NOT NULL DEFAULT 0
AFTER plf_scheme_file_time;
