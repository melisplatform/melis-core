CREATE TABLE `melis_core_gdpr_delete_emails_smtp` (
  `mgdpr_smtp_id` int(11) NOT NULL,
  `mgdpr_smtp_host` varchar(255) NOT NULL,
  `mgdpr_smtp_username` varchar(255) NOT NULL,
  `mgdpr_smtp_password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `melis_core_gdpr_delete_emails_smtp`
  ADD PRIMARY KEY (`mgdpr_smtp_id`);

ALTER TABLE `melis_core_gdpr_delete_emails_smtp`
  MODIFY `mgdpr_smtp_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
