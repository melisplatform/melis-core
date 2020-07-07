CREATE TABLE `melis_core_gdpr_delete_config` (
  `mgdprc_id` int(11) NOT NULL,
  `mgdprc_site_id` int(11) NOT NULL,
  `mgdprc_module_name` varchar(255) NOT NULL DEFAULT '0',
  `mgdprc_alert_email_status` tinyint(4) NOT NULL DEFAULT '1',
  `mgdprc_alert_email_days` int(11) DEFAULT NULL,
  `mgdprc_alert_email_resend` tinyint(4) NOT NULL DEFAULT '1',
  `mgdprc_delete_days` int(11) NOT NULL,
  `mgdprc_email_conf_from_name` varchar(255) NOT NULL,
  `mgdprc_email_conf_from_email` varchar(255) NOT NULL,
  `mgdprc_email_conf_reply_to` varchar(255) NOT NULL,
  `mgdprc_email_conf_layout` varchar(255) NOT NULL,
  `mgdprc_email_conf_layout_title` varchar(255) DEFAULT NULL,
  `mgdprc_email_conf_layout_logo` text,
  `mgdprc_email_conf_layout_desc` text,
  `mgdprc_email_conf_tags` text,
  `mgdprc_config_creation_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mgdprc_config_update_date` datetime NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `melis_core_gdpr_delete_config`
ADD PRIMARY KEY (`mgdprc_id`);

ALTER TABLE `melis_core_gdpr_delete_config`
  MODIFY `mgdprc_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

CREATE TABLE `melis_core_gdpr_delete_emails` (
  `mgdpre_id` int(11) NOT NULL,
  `mgdpre_config_id` int(11) NOT NULL,
  `mgdpre_lang_id` int(11) NOT NULL,
  `mgdpre_link` text,
  `mgdpre_type` int(11) DEFAULT NULL,
  `mgdpre_subject` varchar(255) DEFAULT NULL,
  `mgdpre_html` longtext,
  `mgdpre_text` text,
  `mgdpre_email_tags` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `melis_core_gdpr_delete_emails`
  ADD PRIMARY KEY (`mgdpre_id`),
  ADD KEY `FK_melis_core_gdpr_delete_emails_melis_core_gdpr_delete_config` (`mgdpre_config_id`);

ALTER TABLE `melis_core_gdpr_delete_emails`
  MODIFY `mgdpre_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `melis_core_gdpr_delete_emails`
  ADD CONSTRAINT `FK_melis_core_gdpr_delete_emails_melis_core_gdpr_delete_config` FOREIGN KEY (`mgdpre_config_id`) REFERENCES `melis_core_gdpr_delete_config` (`mgdprc_id`) ON DELETE CASCADE;
COMMIT;


CREATE TABLE `melis_core_gdpr_delete_emails_sent` (
  `mgdprs_id` int(11) NOT NULL,
  `mgdprs_site_id` int(11) NOT NULL,
  `mgdprs_module_name` varchar(255) NOT NULL,
  `mgdprs_validation_key` varchar(255) NOT NULL,
  `mgdprs_alert_email_sent` tinyint(4) NOT NULL DEFAULT '0',
  `mgdprs_alert_email_sent_date` datetime DEFAULT NULL,
  `mgdprs_alert_email_second_sent` tinyint(4) NOT NULL DEFAULT '0',
  `mgdprs_alert_email_second_sent_date` datetime NULL DEFAULT NULL,
  `mgdprs_account_id` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `melis_core_gdpr_delete_emails_sent`
  ADD PRIMARY KEY (`mgdprs_id`);

ALTER TABLE `melis_core_gdpr_delete_emails_sent`
  MODIFY `mgdprs_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

CREATE TABLE `melis_core_gdpr_delete_emails_logs` (
 `mgdprl_id` int(11) NOT NULL AUTO_INCREMENT,
 `mgdprl_site_id` int(11) NOT NULL,
 `mgdprl_module_name` varchar(255) NOT NULL,
 `mgdprl_warning1_ok` int(11) DEFAULT '0',
 `mgdprl_warning1_ko` int(11) DEFAULT '0',
 `mgdprl_warning2_ok` int(11) DEFAULT '0',
 `mgdprl_warning2_ko` int(11) DEFAULT '0',
 `mgdprl_delete_ok` int(11) DEFAULT '0',
 `mgdprl_delete_ko` int(11) DEFAULT '0',
 `mgdprl_warning1_ok_log` longtext,
 `mgdprl_warning1_ko_log` longtext,
 `mgdprl_warning2_ok_log` longtext,
 `mgdprl_warning2_ko_log` longtext,
 `mgdprl_delete_ok_log` longtext,
 `mgdprl_delete_ko_log` longtext,
 `mgdprl_log_date` datetime DEFAULT NULL,
 PRIMARY KEY (`mgdprl_id`)
) ENGINE=InnoDB CHARSET=utf8;

