CREATE TABLE `melis_core_create_password` (
  `mcp_id` int(11) NOT NULL,
  `mcp_login` varchar(255) DEFAULT NULL,
  `mcp_email` varchar(255) DEFAULT NULL,
  `mcp_hash` varchar(255) DEFAULT NULL,
  `mcp_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `melis_core_create_password` ADD PRIMARY KEY(`mcp_id`);

ALTER TABLE `melis_core_create_password` CHANGE `mcp_id` `mcp_id` INT(11) NOT NULL AUTO_INCREMENT;