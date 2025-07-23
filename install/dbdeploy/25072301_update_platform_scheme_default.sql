UPDATE `melis_core_platform_scheme` SET `pscheme_dialog` = '{      
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

UPDATE `melis_core_platform_scheme` SET `pscheme_dashboard_plugins_menu` = '{"melis_core_platform_theme_dashboard_plugin_menu_box_bg_color": "#373737", 
    "melis_core_platform_theme_dashboard_plugin_menu_box_border_color": "#e61c23", "melis_core_platform_theme_dashboard_plugin_menu_box_border_width": 4, 
    "melis_core_platform_theme_dashboard_plugin_menu_box_title_color": "#fff", "melis_core_platform_theme_dashboard_plugin_menu_box_title_font_size": 14, 
    "melis_core_platform_theme_dashboard_plugin_menu_box_title_font_style": "normal", "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_border_top_color": "#2c2c2c", 
    "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_bg_color": "#373737", "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_border_color": "#373737", 
    "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_color": "#fff", "melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_font_size": 12, 
    "melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_color": "#72af46", "melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_text_font_size": 7, 
    "melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_color": "#fff","melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_font_size": 11, 
    "melis_core_platform_theme_dashboard_plugin_menu_plugin_title_text_color": "#fff", "melis_core_platform_theme_dashboard_plugin_menu_plugin_title_text_font_size": 12,
    "melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_color": "#e61c23", "melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_border_color": "#e61c23", 
    "melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_color": "#fff", "melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_font_size": 14, 
    "melis_core_platform_theme_dashboard_plugin_menu_box_title_bg_color": "#e61c23"}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);


UPDATE `melis_core_platform_scheme` SET `pscheme_modal` = '{
    "melis_core_platform_theme_modal_bg_color": "#fff",
    "melis_core_platform_theme_modal_border_color": "#fff",
    "melis_core_platform_theme_modal_border_radius_size": "0",
    "melis_core_platform_theme_modal_nav_tabs_bg_color": "#e61c23",
    "melis_core_platform_theme_modal_nav_tabs_active_bg_color": "#fff",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_color": "#fff",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_hover_color": "#e61c23",
    "melis_core_platform_theme_modal_nav_tabs_text_icon_font_size": "14",
    "melis_core_platform_theme_modal_nav_tabs_border_right_color": "#e5e5e5",
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


UPDATE `melis_core_platform_scheme` SET `pscheme_tab` = '{   
    "melis_core_platform_theme_tab_widget_head_bg_color": "#fff",
    "melis_core_platform_theme_tab_widget_head_border_width": "1",
    "melis_core_platform_theme_tab_widget_head_border_color": "#e5e5e5",
    "melis_core_platform_theme_tab_widget_head_nav_item_and_link_height": "70",
    "melis_core_platform_theme_tab_widget_nav_item_border_right_width": "0",
    "melis_core_platform_theme_tab_widget_nav_item_border_right_color": "#e5e5e5",
    "melis_core_platform_theme_tab_widget_nav_link_text_color": "#7c7c7c",
    "melis_core_platform_theme_tab_widget_nav_link_text_font_size": "14",
    "melis_core_platform_theme_tab_widget_nav_link_min_width": "90",
    "melis_core_platform_theme_tab_widget_nav_link_text_align": "center",
    "melis_core_platform_theme_tab_widget_nav_link_icon_height": "37",
    "melis_core_platform_theme_tab_widget_link_icon_color": "#9d9d9d",
    "melis_core_platform_theme_tab_widget_link_icon_font_size": "24"
}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);