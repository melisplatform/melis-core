ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_login_page` TEXT NOT NULL AFTER `pscheme_footer`; 

UPDATE `melis_core_platform_scheme` SET `pscheme_login_page` = '{
    "melis_core_platform_theme_login_page_footer_text_color": "#fff",
    "melis_core_platform_theme_login_page_header_bg_color": "#fff",
    "melis_core_platform_theme_login_page_header_text_font_size": "21",
    "melis_core_platform_theme_login_page_header_text_icon_color": "#686868",
    "melis_core_platform_theme_login_page_form_text_font_size": "13",
    "melis_core_platform_theme_login_page_form_text_color": "#e61c23",
    "melis_core_platform_theme_login_page_form_submit_btn_font_size": "16",
    "melis_core_platform_theme_login_page_form_submit_btn_bg_color": "#e61c23",
    "melis_core_platform_theme_login_page_form_submit_btn_border_color": "#e61c23",
    "melis_core_platform_theme_login_page_form_bottom_text_font_size": "13",
    "melis_core_platform_theme_login_page_form_bottom_remember_text_color": "#686868",
    "melis_core_platform_theme_login_page_form_bottom_forgot_password_text_color": "#e61c23"
}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);


ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_platform_theme_box` TEXT NOT NULL AFTER `pscheme_drag_drop`; 
UPDATE `melis_core_platform_scheme` SET `pscheme_platform_theme_box` = '{
    "melis_core_platform_theme_options_panel_bg_color": "#fff",
    "melis_core_platform_theme_options_panel_title_text_color": "#686868",
    "melis_core_platform_theme_options_panel_title_text_font_size": "13",
    "melis_core_platform_theme_options_panel_header_close_btn_color": "#686868",
    "melis_core_platform_theme_options_panel_header_close_btn_font_size": "14",
    "melis_core_platform_theme_options_panel_header_border_width": "1",
    "melis_core_platform_theme_options_panel_header_border_color": "#eeeeee",
    "melis_core_platform_theme_options_panel_options_input_radio_border_color": "#dee2e6",
    "melis_core_platform_theme_options_panel_options_input_radio_checked_border_bg_color": "#0d6efd",
    "melis_core_platform_theme_options_panel_options_title_bg_color": "#ffffff",
    "melis_core_platform_theme_options_panel_options_title_expanded_bg_color": "#ffffff",
    "melis_core_platform_theme_options_panel_options_title_label_icon_and_texts_color": "#686868",
    "melis_core_platform_theme_options_panel_options_input_text_bg_color": "#ffffff",
    "melis_core_platform_theme_options_panel_options_input_text_color": "#444444",
    "melis_core_platform_theme_options_panel_options_range_slider_ui_handle_bg_border_color": "#c5c5c5",
    "melis_core_platform_theme_options_panel_options_range_slider_ui_min_bg_color": "#e61c23",
    "melis_core_platform_theme_options_panel_options_range_slider_ui_widget_content_bg_color": "#e9e9e9",
    "melis_core_platform_theme_options_panel_options_btn_group_bg_color": "#fafafa",
    "melis_core_platform_theme_options_panel_options_btn_group_border_color": "#cecece",
    "melis_core_platform_theme_options_panel_options_btn_group_text_color": "#797979",
    "melis_core_platform_theme_options_panel_options_tip_info_text_color": "#686868",
    "melis_core_platform_theme_options_panel_options_tip_info_text_font_size": "17",
    "melis_core_platform_theme_options_panel_save_btn_bg_border_color": "#e61c23",
    "melis_core_platform_theme_options_panel_save_btn_text_color": "#ffffff",
    "melis_core_platform_theme_options_panel_save_btn_hover_bg_color": "#ffffff",
    "melis_core_platform_theme_options_panel_save_btn_hover_text_color": "#e61c23"
}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);
