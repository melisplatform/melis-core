ALTER TABLE `melis_core_bo_emails`
ADD `boe_content_layout_title` VARCHAR(255) NOT NULL  AFTER `boe_content_layout`,
ADD `boe_content_layout_logo` TEXT NOT NULL  AFTER `boe_content_layout_title`,
ADD `boe_content_layout_ftr_info` TEXT NOT NULL  AFTER `boe_content_layout_logo`;