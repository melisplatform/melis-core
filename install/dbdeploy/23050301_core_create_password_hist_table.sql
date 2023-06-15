CREATE TABLE `melis_core_user_password_history` (
  `uph_id` int(11) NOT NULL AUTO_INCREMENT,
  `uph_user_id` int(11) NOT NULL,
  `uph_password` varchar(255) NOT NULL,
  `uph_password_updated_date` datetime NOT NULL,
  PRIMARY KEY (`uph_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


INSERT INTO `melis_core_user_password_history` (`uph_user_id`, `uph_password`, `uph_password_updated_date`)
  SELECT usr_id, usr_password, COALESCE(usr_last_pass_update_date, usr_creation_date) AS date FROM melis_core_user;