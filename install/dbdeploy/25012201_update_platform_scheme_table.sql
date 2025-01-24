ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_top_logo` TEXT NULL AFTER `pscheme_is_active`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_user_profile` TEXT NULL AFTER `pscheme_top_logo`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_menu` TEXT NULL AFTER `pscheme_user_profile`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_footer` TEXT NULL AFTER `pscheme_menu`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_header_navigation` TEXT NULL AFTER `pscheme_footer`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_bubble_plugins` TEXT NULL AFTER `pscheme_header_navigation`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_dashboard_plugins` TEXT NULL AFTER `pscheme_bubble_plugins`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_dashboard_plugins_menu` TEXT NULL AFTER `pscheme_dashboard_plugins`; 

UPDATE `melis_core_platform_scheme` SET `pscheme_top_logo` = '{"melis_core_platform_theme_toggle_btn_color": "#ce5459","melis_core_platform_theme_toggle_btn_hover_color":"#fff","melis_core_platform_theme_logo_bg_color":"#e61c23","melis_core_platform_theme_logo_text_color":"#fff","melis_core_platform_theme_logo_text_font_size":18}'
    WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);

UPDATE `melis_core_platform_scheme` SET `pscheme_user_profile` = '{"melis_core_platform_theme_user_profile_bg_color": "#373737", 
    "melis_core_platform_theme_user_profile_img_border_color": "#4e4e4e", "melis_core_platform_theme_user_profile_img_border_radius": "50%",
    "melis_core_platform_theme_user_profile_name_text_color": "#fff",  "melis_core_platform_theme_user_profile_status_text_icon_color": "#198754"}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);

UPDATE `melis_core_platform_scheme` SET `pscheme_menu` = '{"melis_core_platform_theme_menu_bg_color": "#373737", "melis_core_platform_theme_menu_hover_color": "#2c2c2c", 
    "melis_core_platform_theme_menu_focus_color": "#e61c23", "melis_core_platform_theme_menu_border_bottom_color":"#2c2c2c", "melis_core_platform_theme_menu_text_icon_color": "#fff", 
    "melis_core_platform_theme_submenu_bg_color": "#373737", "melis_core_platform_theme_submenu_text_icon_color": "#5a5a5a", "melis_core_platform_theme_submenu_text_icon_hover_color": "#fff",
    "melis_core_platform_theme_submenu_hover_active_bg_color": "#3a3a3a"}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);    

UPDATE `melis_core_platform_scheme` SET `pscheme_footer` = '{"melis_core_platform_theme_footer_text_fontsize": 10, 
    "melis_core_platform_theme_footer_link_text_color": "#e61c23", "melis_core_platform_theme_footer_text_color": "#686868"}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);

UPDATE `melis_core_platform_scheme` SET `pscheme_header_navigation` = '{"melis_core_platform_theme_header_text_icon_color": "#fff", 
    "melis_core_platform_theme_header_text_icon_active_color": "#e61c23", "melis_core_platform_theme_header_bg_color": "#e61c23", 
    "melis_core_platform_theme_header_bg_active_color": "#fff"}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);



UPDATE `melis_core_platform_scheme` SET `pscheme_bubble_plugins` = '{"melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_color": "#fff",
    "melis_core_platform_theme_bubble_plugin_hide_btn_text_icon_hover_color": "#466baf", "melis_core_platform_theme_bubble_plugin_hide_btn_bg_border_color": "#466baf", 
    "melis_core_platform_theme_bubble_plugin_hide_btn_bg_hover_color": "#fff", "melis_core_platform_theme_bubble_plugin_hide_btn_text_font_size": 10, 
    "melis_core_platform_theme_bubble_plugin_widget_bg_color": "#fff", "melis_core_platform_theme_bubble_plugin_widget_btn_bg_color": "#fff", 
    "melis_core_platform_theme_bubble_plugin_widget_btn_text_hover_color": "#fff", "melis_core_platform_theme_bubble_plugin_widget_header_text_icon_color": "#fff", 
    "melis_core_platform_theme_bubble_plugin_widget_header_text_icon_font_size": 25, "melis_core_platform_theme_bubble_plugin_updates_header_text_icon_color": "#686868",
    "melis_core_platform_theme_bubble_plugin_news_header_bg_color": "#424242", "melis_core_platform_theme_bubble_plugin_updates_header_bg_color": "#e7e7e7", 
    "melis_core_platform_theme_bubble_plugin_notif_header_bg_color": "#72af46", "melis_core_platform_theme_bubble_plugin_msg_header_bg_color": "#466baf", 
    "melis_core_platform_theme_bubble_plugin_news_btn_border_text_color": "#424242", "melis_core_platform_theme_bubble_plugin_notif_btn_border_text_color": "#72af46", 
    "melis_core_platform_theme_bubble_plugin_msg_btn_border_text_color": "#466baf", "melis_core_platform_theme_bubble_plugin_updates_btn_text_hover_color": "#797979", 
    "melis_core_platform_theme_bubble_plugin_news_btn_border_color": "#424242", "melis_core_platform_theme_bubble_plugin_news_btn_bg_hover_color": "#424242", 
    "melis_core_platform_theme_bubble_plugin_widget_header_btn_txt_font_size": 14, "melis_core_platform_theme_bubble_plugin_widget_back_header_bg_color": "#424242", 
    "melis_core_platform_theme_bubble_plugin_widget_back_header_text_color": "#fff", "melis_core_platform_theme_bubble_plugin_widget_back_header_text_font_size": 14, 
    "melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_bg_color": "#fafafa", "melis_core_platform_theme_bubble_plugin_widget_back_header_close_btn_icon_color": "#797979", 
    "melis_core_platform_theme_bubble_plugin_widget_back_content_header_text_color": "#000", "melis_core_platform_theme_bubble_plugin_widget_back_content_details_text_color": "#000"}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);


UPDATE `melis_core_platform_scheme` SET `pscheme_dashboard_plugins` = '{"melis_core_platform_theme_dashboard_plugin_no_plugin_alert_bg_color": "#cff4fc", 
    "melis_core_platform_theme_dashboard_plugin_no_plugin_alert_border_color": "#9eeaf9", "melis_core_platform_theme_dashboard_plugin_no_plugin_alert_color": "#055160", 
    "melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_size": 14, "melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_style": "normal", 
    "melis_core_platform_theme_dashboard_plugin_plugin_header_bg_color": "#424242", "melis_core_platform_theme_dashboard_plugin_plugin_header_text_color": "#424242", 
    "melis_core_platform_theme_dashboard_plugin_plugin_header_text_font_size": 14, "melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_color": "#fafafa", 
    "melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_color": "#cecece", "melis_core_platform_theme_dashboard_plugin_plugin_header_btns_icon_color": "#797979", 
    "melis_core_platform_theme_dashboard_plugin_plugin_header_btns_bg_hover_color": "#e7e7e7", "melis_core_platform_theme_dashboard_plugin_plugin_header_btns_border_hover_color": "#e7e7e7", 
    "melis_core_platform_theme_dashboard_plugin_plugin_body_bg_color": "#ffffff", "melis_core_platform_theme_dashboard_plugin_plugin_body_border_color": "#ebebeb"}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);

UPDATE `melis_core_platform_scheme` SET `pscheme_dashboard_plugins_menu` = '{"melis_core_platform_theme_dashboard_plugin_menu_box_bg_color": "#373737", 
    "melis_core_platform_theme_dashboard_plugin_menu_box_border_color": "#e61c23", "melis_core_platform_theme_dashboard_plugin_menu_box_border_width": 4, 
    "melis_core_platform_theme_dashboard_plugin_menu_box_title_color": "#fff", "melis_core_platform_theme_dashboard_plugin_menu_box_title_font_size": 14, 
    "melis_core_platform_theme_dashboard_plugin_menu_box_title_font_style": "normal", "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color": "#2c2c2c", 
    "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color": "#373737", "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color": "#373737", 
    "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color": "#fff", "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_font_size": 12, "melis_core_platform_theme_dashboard_plugin_new_plugin_indicator_color": "#72af46", 
    "melis_core_platform_theme_dashboard_plugin_new_plugin_indicator_text_font_size": 7, "melis_core_platform_theme_dashboard_plugin_category_btn_text_color": "#fff", 
    "melis_core_platform_theme_dashboard_plugin_category_btn_text_font_size": 11, "melis_core_platform_theme_dashboard_plugin_plugin_title_text_color": "#fff", 
    "melis_core_platform_theme_dashboard_plugin_delete_all_btn_color": "#e61c23", "melis_core_platform_theme_dashboard_plugin_delete_all_btn_border_color": "#e61c23", 
    "melis_core_platform_theme_dashboard_plugin_delete_all_btn_text_color": "#fff", "melis_core_platform_theme_dashboard_plugin_delete_all_btn_text_font_size": 14}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);