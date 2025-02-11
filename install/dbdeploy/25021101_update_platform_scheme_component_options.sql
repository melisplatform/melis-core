ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_modal` TEXT NULL AFTER `pscheme_dashboard_plugins_menu`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_dialog` TEXT NULL AFTER `pscheme_modal`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_form_elements` TEXT NULL AFTER `pscheme_dialog`; 
ALTER TABLE `melis_core_platform_scheme` ADD `pscheme_tab` TEXT NULL AFTER `pscheme_form_elements`; 

UPDATE `melis_core_platform_scheme` SET `pscheme_modal` = '{
    "melis_core_platform_theme_modal_bg_color": "#fff",
    "melis_core_platform_theme_modal_border_color": "#fff",
    "melis_core_platform_theme_modal_border_radius_size": "0",
    "melis_core_platform_theme_modal_nav_tabs_bg_color": "#fff",
    "melis_core_platform_theme_modal_nav_tabs_active_bg_color": "#fff",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_color": "#fff",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_hover_color": "#e61c23",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_font_size": "14",
    "melis_core_platform_theme_modal_nav_tabs_border_right_color": "#ce5459",
    "melis_core_platform_theme_modal_nav_tabs_border_right_width": "1",
    "melis_core_platform_theme_modal_content_text_color": "#686868",
    "melis_core_platform_theme_modal_content_text_font_size": "14",
    "melis_core_platform_theme_modal_content_text_font_styles": "",
    "melis_core_platform_theme_modal_content_close_btn_bg_color": "#fff",
    "melis_core_platform_theme_modal_content_close_btn_hover_bg_color": "#bd362f",
    "melis_core_platform_theme_modal_content_close_btn_border_color": "#bd362f",
    "melis_core_platform_theme_modal_content_close_btn_text_color": "#bd362f",
    "melis_core_platform_theme_modal_content_close_btn_hover_text_color": "#fff",
    "melis_core_platform_theme_modal_content_save_btn_bg_color": "#fff",
    "melis_core_platform_theme_modal_content_save_btn_hover_bg_color": "#72af46",
    "melis_core_platform_theme_modal_content_save_btn_border_color": "#72af46",
    "melis_core_platform_theme_modal_content_save_btn_text_color": "#fff",
    "melis_core_platform_theme_modal_content_save_btn_hover_text_color": "#72af46"
}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);

UPDATE `melis_core_platform_scheme` SET `pscheme_dialog` = '{   
    "melis_core_platform_theme_modal_bg_color": "#fff",
    "melis_core_platform_theme_modal_border_color": "#fff",
    "melis_core_platform_theme_modal_border_radius_size": "0",
    "melis_core_platform_theme_modal_nav_tabs_bg_color": "#fff",
    "melis_core_platform_theme_modal_nav_tabs_active_bg_color": "#fff",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_color": "#fff",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_hover_color": "#e61c23",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_font_size": "14",
    "melis_core_platform_theme_modal_nav_tabs_border_right_color": "#ce5459",
    "melis_core_platform_theme_modal_nav_tabs_border_right_width": "1",
    "melis_core_platform_theme_modal_content_text_color": "#686868",
    "melis_core_platform_theme_modal_content_text_font_size": "14",
    "melis_core_platform_theme_modal_content_text_font_styles": "",
    "melis_core_platform_theme_modal_content_close_btn_bg_color": "#fff",
    "melis_core_platform_theme_modal_content_close_btn_hover_bg_color": "#bd362f",
    "melis_core_platform_theme_modal_content_close_btn_border_color": "#bd362f",
    "melis_core_platform_theme_modal_content_close_btn_text_color": "#bd362f",
    "melis_core_platform_theme_modal_content_close_btn_hover_text_color": "#fff",
    "melis_core_platform_theme_modal_content_save_btn_bg_color": "#fff",
    "melis_core_platform_theme_modal_content_save_btn_hover_bg_color": "#72af46",
    "melis_core_platform_theme_modal_content_save_btn_border_color": "#72af46",
    "melis_core_platform_theme_modal_content_save_btn_text_color": "#fff",
    "melis_core_platform_theme_modal_content_save_btn_hover_text_color": "#72af46",
    "melis_core_platform_theme_dialog_content_header_bg_color": "#f99319",
    "melis_core_platform_theme_dialog_content_header_title_color": "#fff",
    "melis_core_platform_theme_dialog_content_header_title_font_size": "14",
    "melis_core_platform_theme_dialog_close_button_color": "#fff",
    "melis_core_platform_theme_dialog_close_button_font_size": "13",
    "melis_core_platform_theme_dialog_content_bg_color": "#fff",
    "melis_core_platform_theme_dialog_content_border_color": "#fff",
    "melis_core_platform_theme_dialog_content_text_color": "#686868",
    "melis_core_platform_theme_dialog_content_text_font_size": "14",
    "melis_core_platform_theme_dialog_no_btn_bg_color": "#fff",
    "melis_core_platform_theme_dialog_no_btn_bg_hover_color": "#bd362f",
    "melis_core_platform_theme_dialog_no_btn_border_color": "#bd362f",
    "melis_core_platform_theme_dialog_no_btn_border_hover_color": "#bd362f",
    "melis_core_platform_theme_dialog_no_btn_text_color": "#bd362f",
    "melis_core_platform_theme_dialog_no_btn_text_hover_color": "#fff",
    "melis_core_platform_theme_dialog_yes_btn_bg_color": "#fff",
    "melis_core_platform_theme_dialog_yes_btn_bg_hover_color": "#72af46",
    "melis_core_platform_theme_dialog_yes_btn_border_color": "#72af46",
    "melis_core_platform_theme_dialog_yes_btn_border_hover_color": "#72af46",
    "melis_core_platform_theme_dialog_yes_btn_text_color": "#72af46",
    "melis_core_platform_theme_dialog_yes_btn_text_hover_color": "#fff",
    "melis_core_platform_theme_dialog_btn_text_font_size": "14"
}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);


UPDATE `melis_core_platform_scheme` SET `pscheme_form_elements` = '{   
    "melis_core_platform_theme_form_bg_color": "#fff",
    "melis_core_platform_theme_form_text_color": "#686868",
    "melis_core_platform_theme_form_select_option_bg_color": "#fff",
    "melis_core_platform_theme_form_select_option_text_color": "#686868",
    "melis_core_platform_theme_form_input_elements_border_radius": "0",
    "melis_core_platform_theme_form_input_elements_text_color": "#444",
    "melis_core_platform_theme_form_input_elements_border_width": "0",
    "melis_core_platform_theme_form_input_elements_border_color": "#dee2e6",
    "melis_core_platform_theme_form_input_elements_bg_color": "#fff",
    "melis_core_platform_theme_form_input_text_disable_readonly_bg_color": "#e9ecef",
    "melis_core_platform_theme_form_input_text_disable_readonly_border_color": "#dee2e6",
    "melis_core_platform_theme_form_input_text_disable_readonly_text_color": "#dee2e6",
    "melis_core_platform_theme_form_button_submit_bg_color": "#fff",
    "melis_core_platform_theme_form_button_submit_text_color": "#444",
    "melis_core_platform_theme_form_button_submit_border_radius": "0",
    "melis_core_platform_theme_form_button_submit_border_width": "0",
    "melis_core_platform_theme_form_button_submit_border_color": "#444"
}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);

UPDATE `melis_core_platform_scheme` SET `pscheme_tab` = '{   
    "melis_core_platform_theme_tab_widget_head_bg_color": "#fff",
    "melis_core_platform_theme_tab_widget_head_border_width": "0",
    "melis_core_platform_theme_tab_widget_head_border_color": "#e5e5e5",
    "melis_core_platform_theme_tab_widget_head_nav_item_and_link_height": "0",
    "melis_core_platform_theme_tab_widget_nav_item_border_right_width": "0",
    "melis_core_platform_theme_tab_widget_nav_item_border_right_color": "#e5e5e5",
    "melis_core_platform_theme_tab_widget_nav_link_text_color": "#7c7c7c",
    "melis_core_platform_theme_tab_widget_nav_link_text_font_size": "0",
    "melis_core_platform_theme_tab_widget_nav_link_min_width": "0",
    "melis_core_platform_theme_tab_widget_nav_link_text_align": "",
    "melis_core_platform_theme_tab_widget_nav_link_icon_height": "0",
    "melis_core_platform_theme_tab_widget_link_icon_color": "#9d9d9d",
    "melis_core_platform_theme_tab_widget_link_icon_font_size": "0"
}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);