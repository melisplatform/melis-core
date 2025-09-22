UPDATE `melis_core_platform_scheme` SET `pscheme_user_profile` = '{"melis_core_platform_theme_user_profile_bg_color": "#373737", 
    "melis_core_platform_theme_user_profile_img_border_color": "#4e4e4e", "melis_core_platform_theme_user_profile_img_border_radius": "50%",
    "melis_core_platform_theme_user_profile_name_text_color": "#fff",  "melis_core_platform_theme_user_profile_status_text_icon_color": "#198754",
    "melis_core_platform_theme_user_profile_edit_btn_bg_color": "#e61c23",
    "melis_core_platform_theme_user_profile_edit_btn_border_color": "#2c2c2c",
    "melis_core_platform_theme_user_profile_edit_btn_icon_color": "#fff",
    "melis_core_platform_theme_user_profile_edit_btn_hover_bg_color": "#fff",
    "melis_core_platform_theme_user_profile_edit_btn_hover_icon_color": "#e61c23",
    "melis_core_platform_theme_user_profile_edit_btn_hover_border_color": "#e61c23",
    "melis_core_platform_theme_user_profile_logout_btn_bg_color": "#2c2c2c",
    "melis_core_platform_theme_user_profile_logout_btn_icon_color": "#fff",
    "melis_core_platform_theme_user_profile_logout_btn_hover_bg_color": "#e61c23",
    "melis_core_platform_theme_user_profile_logout_btn_hover_icon_color": "#2c2c2c"
}'
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
    "melis_core_platform_theme_modal_content_save_btn_hover_text_color": "#72af46",
    "melis_core_platform_theme_modal_border_width": "0"
}'
WHERE `melis_core_platform_scheme`.`pscheme_id` IN (1,2);