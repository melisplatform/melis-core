$(function() {
    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    var $body = $("body");

        function escapeHtml (string) {
            return String(string).replace(/[&<>"'`=\/]/g, function (s) {
                return entityMap[s];
            });
        }

        $body.on("click", "#savePlatformScheme, .save-platform-theme-options", function() {
            $("form#melis_core_platform_scheme_images").trigger("submit");

            // dynamic dnd, issue: https://mantis2.uat.melistechnology.fr/view.php?id=8466
            //reloadMelisIframe();
        });

        $body.on("click", "#resetPlatformScheme", function() {
            melisCoreTool.confirm(
                translations.tr_meliscore_common_yes,
                translations.tr_meliscore_tool_emails_mngt_generic_from_header_cancel,
                // translations.tr_meliscore_general_proceed,
                translations.tr_meliscore_platform_scheme_reset_text,
                translations.tr_meliscore_platform_scheme_reset_confirm,
                function() {
                    melisCoreTool.pending(".button");

                    $.ajax({
                        type    : 'GET',
                        url     : 'melis/MelisCore/PlatformScheme/resetToDefault',
                        processData : false,
                        cache       : false,
                        contentType : false,
                        dataType    : 'json',
                    }).done(function(data) {
                        if(data.success) {
                            melisCoreTool.processing();
                            window.location.reload(true);

                            // dynamic dnd, issue: https://mantis2.uat.melistechnology.fr/view.php?id=8466
                            //reloadMelisIframe();
                        }
                        else {
                            melisHelper.melisKoNotification(data.title, data.message, data.errors);
                        }
                        melisCoreTool.done(".button");
                    }).fail(function() {
                        melisCoreTool.done(".button");
                    });
                }
            );


        });

        $body.on("submit", "form#melis_core_platform_scheme_images", function(e) {
            var formData        = new FormData(this),
                colorFormData   = $("form#melis_core_platform_scheme_form").serializeArray(),
                colors          = {},
                platformTheme    = {},
                platformThemeData = $("form#melis_core_platform_theme_option_form").serializeArray();

                $.each(colorFormData, function(i, v) {
                    colors[v['name']] = v['value'];
                });

                $.each(platformThemeData, function(i, v) {
                    //check if is checkbox
                    let elemCheckbox = $("form#melis_core_platform_theme_option_form").find("[name^='"+v["name"]+"']");
                    //let elemCheckbox = $("form#melis_core_platform_theme_option_form") .find("[name^='" + $.escapeSelector(v["name"]) + "']");
                                       
                    if (elemCheckbox.attr('type') == 'checkbox') {
                        if (!platformTheme[v["name"]]) {
                            platformTheme[v["name"]] = [];
                        }                 
                        platformTheme[v["name"]].push(v["value"]);

                    } else {                
                        platformTheme[v["name"]] = v["value"];
                    }                    
                });

                formData.append('colors', JSON.stringify(colors));
                formData.append('platformTheme', JSON.stringify(platformTheme));

                melisCoreTool.pending(".button");
                
                melisCoreTool.addOverflowHidden();

                $.ajax({
                    type    : 'POST',
                    url     : 'melis/MelisCore/PlatformScheme/save',
                    data    : formData,
                    processData : false,
                    cache       : false,
                    contentType : false,
                    dataType    : 'json'
                }).done(function(data) {
                    if(data.success) {
                        melisCoreTool.removeOverflowHidden();

                        melisCoreTool.processing();
                        location.reload(true);
                    }
                    else {
                        melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                    }
                    melisCoreTool.done(".button");
                }).fail(function() {
                    melisCoreTool.done(".button");
                });

                e.preventDefault();
        });

        $body.on("keyup", "input#sidebar_header_text", function() {
            var $this           = $(this),
                text            = escapeHtml($this.val()),
                textLength      = text.replace(/\s/g, "").length,
                $headerTitle    = $("#platform-scheme-sidebar-header-title");

                if ( !text ) {
                    text = translations['tr_meliscore_header Title'];
                }
                if ( textLength > 13 ) {
                    $headerTitle.addClass("ml-header");
                } else {
                    $headerTitle.removeClass("ml-header");
                }
                $headerTitle.html(text);
        });

        /**
         * evo/platform-scheme
         */
        $body.on("click", ".platform-theme-options-toggle", function() {
            $('.platform-theme-options').addClass("open-tools");
            $('.platform-theme-options-overlay').fadeIn();
            $('.platform-theme-options-toggle').hide();
        });

        $body.on("click", ".platform-theme-options-overlay, .close-tools", function () {
            $('.platform-theme-options').removeClass("open-tools");
            $('.platform-theme-options-overlay').fadeOut();
            $('.platform-theme-options-toggle').fadeIn();
        });

        // Add event listeners for shown and hidden events
        $body.on("shown.bs.collapse", ".platform-theme-options-tools-info .accordion", function (e) {
            // Highlight the header button of the active panel
            $(e.target)
            .prev('.accordion-header')
            .addClass('active-header');
        });

        $body.on("hidden.bs.collapse", ".platform-theme-options-tools-info .accordion", function (e) {
            // Remove the highlight from the header button when the panel is hidden
            $(e.target)
            .prev('.accordion-header')
            .removeClass('active-header');
        });

        $body.on("click", ".open-theme-options", function() {
            $(".platform-theme-options-toggle").trigger("click");
        });

        $body.on("click", ".platform-theme-options-toggle, .open-theme-options", function() {
            // range number slider
            rangeSliderSize.setRangeSliderSize();

            // range decimal step
            //rangeDecimalSlider.setRangeDecimalSlider();
        });
        // end evo/platform-scheme
});

/**
 * Platform Scheme Evolution
 * range slider size: fonts, border width, border radius etc..
 */
var rangeSliderSize = {
    /**
     * Set range slider for different element on theme options
     */
    setRangeSliderSize: function() {
        const sliders = [
            { 
                selectorMin: ".logo-font-size-range-slider-min", 
                selectorValue: ".logo-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_logo_text_font_size").val(), 
                min: 1, 
                max: 30 
            }, // logo text, start general options
            { 
                selectorMin: ".footer-version-font-size-range-slider-min", 
                selectorValue: ".footer-version-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_footer_text_fontsize").val(), 
                min: 1, 
                max: 30 
            }, // footer text
            { 
                selectorMin: ".hide-btn-text-font-size-range-slider-min", 
                selectorValue: ".hide-btn-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_bubble_plugin_hide_btn_text_font_size").val(), 
                min: 1, 
                max: 25 
            }, // hide button text
            { 
                selectorMin: ".widget-header-text-font-size-range-slider-min", 
                selectorValue: ".widget-header-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_bubble_plugin_widget_header_text_icon_font_size").val(), 
                min: 1, 
                max: 35 
            }, // widget header text
            { 
                selectorMin: ".widget-button-text-font-size-range-slider-min", 
                selectorValue: ".widget-button-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_bubble_plugin_widget_header_btn_txt_font_size").val(), 
                min: 1,
                max: 30 
            }, // widget button text
            { 
                selectorMin: ".widget-back-header-text-font-size-range-slider-min", 
                selectorValue: ".widget-back-header-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_bubble_plugin_widget_back_header_text_font_size").val(), 
                min: 1, 
                max: 35 
            }, // widget back header text
            { 
                selectorMin: ".widget-front-button-text-font-size-range-slider-min", 
                selectorValue: ".widget-front-button-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_bubble_plugin_widget_front_btn_txt_font_size").val(), 
                min: 14, 
                max: 25 
            }, // widget front button text font size
            { 
                selectorMin: ".dashboard-plugin-no-plugin-alert-font-size-range-slider-min", 
                selectorValue: ".dashboard-plugin-no-plugin-alert-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_no_plugin_alert_text_font_size").val(), 
                min: 1, 
                max: 25 
            }, // dashboard plugin alert
            { 
                selectorMin: ".plugin-border-radius-width-range-slider-min", 
                selectorValue: ".plugin-border-radius-width-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_border_radius").val(), 
                min: 1, 
                max: 25 
            }, // dashboard plugin border radius
            { 
                selectorMin: ".plugin-header-text-font-size-range-slider-min", 
                selectorValue: ".plugin-header-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_plugin_header_text_font_size").val(), 
                min: 1, 
                max: 25 
            }, // dashboard plugin widget
            { 
                selectorMin: ".plugins-menu-box-border-width-range-slider-min", 
                selectorValue: ".plugins-menu-box-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_menu_box_border_width").val(), 
                min: 1, 
                max: 10 
            }, // dashboard plugins menu box border width
            { 
                selectorMin: ".plugins-menu-box-title-font-size-range-slider-min", 
                selectorValue: ".plugins-menu-box-title-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_menu_box_title_font_size").val(), 
                min: 1, 
                max: 30 
            }, // dashboard plugins menu box title font size
            { 
                selectorMin: ".filter-box-button-text-font-size-range-slider-min", 
                selectorValue: ".filter-box-button-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_menu_box_filter_box_btn_text_font_size").val(), 
                min: 1, 
                max: 20 
            }, // dashboard plugins menu box filter box text font size
            { 
                selectorMin: ".new-plugin-indicator-text-font-size-range-slider-min", 
                selectorValue: ".new-plugin-indicator-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_menu_new_plugin_indicator_text_font_size").val(), 
                min: 1, 
                max: 18 
            }, // dashboard plugins new plugins indicator text font size
            { 
                selectorMin: ".plugin-title-text-font-size-range-slider-min", 
                selectorValue: ".plugin-title-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_menu_plugin_title_text_font_size").val(), 
                min: 1, 
                max: 30 
            }, // dashboard plugins title text font size
            { 
                selectorMin: ".category-btn-text-font-size-range-slider-min", 
                selectorValue: ".category-btn-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_menu_category_btn_text_font_size").val(), 
                min: 1, 
                max: 30 
            }, // dashboard plugins category button text font size
            { 
                selectorMin: ".delete-all-btn-text-font-size-range-slider-min", 
                selectorValue: ".delete-all-btn-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dashboard_plugin_menu_delete_all_btn_text_font_size").val(), 
                min: 14, // 14 default for font-size, #dashboard-plugin-delete-all 
                max: 30 
            }, // dashboard plugins delete all button text font size, end of general options
            { 
                selectorMin: ".modal-border-right-width-range-slider-min", 
                selectorValue: ".modal-border-right-width-range-slider-value", 
                value: $("#melis_core_platform_theme_modal_border_right_width").val(), 
                min: 0,
                max: 10
            }, // modal border right width
            { 
                selectorMin: ".modal-border-radius-size-range-slider-min", 
                selectorValue: ".modal-border-radius-size-range-slider-value", 
                value: $("#melis_core_platform_theme_modal_border_radius_size").val(), 
                min: 0, 
                max: 10 
            }, // modal nav tabs border radius size, start component options           
            { 
                selectorMin: ".modal-tabs-font-size-range-slider-min", 
                selectorValue: ".modal-tabs-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_modal_nav_tabs_text_icon_font_size").val(), 
                min: 1, 
                max: 20 
            }, // modal nav tabs text font size
            { 
                selectorMin: ".modal-border-right-width-range-slider-min", 
                selectorValue: ".modal-border-right-width-range-slider-value", 
                value: $("#melis_core_platform_theme_modal_nav_tabs_border_right_width").val(), 
                min: 1, 
                max: 20 
            }, // modal nav tabs border right width
            { 
                selectorMin: ".modal-content-text-font-size-range-slider-min", 
                selectorValue: ".modal-content-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_modal_content_text_font_size").val(), 
                min: 1, 
                max: 25 
            }, // modal content text font size
            { 
                selectorMin: ".form-inputs-element-border-radius-range-slider-min", 
                selectorValue: ".form-inputs-element-border-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_form_input_elements_border_radius").val(), 
                min: 0, 
                max: 16 
            }, // form input elements border radius
            { 
                selectorMin: ".form-inputs-element-border-width-range-slider-min", 
                selectorValue: ".form-inputs-element-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_form_input_elements_border_width").val(), 
                min: 1, 
                max: 10 
            }, // form input elements border width
            { 
                selectorMin: ".form-button-submit-border-radius-range-slider-min", 
                selectorValue: ".form-button-submit-border-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_form_button_submit_border_radius").val(), 
                min: 0, 
                max: 10
            }, // form button/submit border radius
            { 
                selectorMin: ".form-button-submit-border-width-range-slider-min", 
                selectorValue: ".form-button-submit-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_form_button_submit_border_width").val(), 
                min: 0, 
                max: 10 
            }, // form button/submit border width
            { 
                selectorMin: ".form-button-cancel-border-radius-size-range-slider-min", 
                selectorValue: ".form-button-cancel-border-radius-size-range-slider-value", 
                value: $("#melis_core_platform_theme_form_button_cancel_border_radius_size").val(), 
                min: 0, 
                max: 10 
            }, // form button/cancel border radius
            { 
                selectorMin: ".form-button-cancel-border-width-range-slider-min", 
                selectorValue: ".form-button-cancel-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_form_button_cancel_border_width").val(), 
                min: 1, 
                max: 10 
            }, // form button/cancel border width
            { 
                selectorMin: ".dialog-title-font-size-range-slider-min", 
                selectorValue: ".dialog-title-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dialog_content_header_title_font_size").val(), 
                min: 1, 
                max: 30 
            }, // dialog header title font size
            { 
                selectorMin: ".dialog-close-btn-font-size-range-slider-min", 
                selectorValue: ".dialog-close-btn-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dialog_close_button_font_size").val(), 
                min: 1, 
                max: 27
            }, // dialog close button font size
            { 
                selectorMin: ".dialog-content-text-font-size-range-slider-min", 
                selectorValue: ".dialog-content-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dialog_content_text_font_size").val(), 
                min: 1, 
                max: 28 
            }, // dialog content text font size
            { 
                selectorMin: ".dialog-button-text-font-size-range-slider-min", 
                selectorValue: ".dialog-button-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dialog_btn_text_font_size").val(), 
                min: 1, 
                max: 28 
            }, // dialog button text font size
            { 
                selectorMin: ".tab-widget-head-border-width-range-slider-min", 
                selectorValue: ".tab-widget-head-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_tab_widget_head_border_width").val(), 
                min: 1, // 1 for default on .widget.widget-tabs-double-2>.widget-head
                max: 10 
            }, // tab widget head border width
            { 
                selectorMin: ".tab-widget-head-nav-item-and-link-width-range-slider-min", 
                selectorValue: ".tab-widget-head-nav-item-and-link-width-range-slider-value", 
                value: $("#melis_core_platform_theme_tab_widget_head_nav_item_and_link_height").val(), 
                min: 70, 
                max: 100 
            }, // tab widget head nav height
            { 
                selectorMin: ".tab-widget-head-nav-item-border-right-width-range-slider-min", 
                selectorValue: ".tab-widget-head-nav-item-border-right-width-range-slider-value", 
                value: $("#melis_core_platform_theme_tab_widget_nav_item_border_right_width").val(), 
                min: 1, 
                max: 10 
            }, // tab widget head nav border right width
            { 
                selectorMin: ".tab-widget-nav-link-text-font-size-range-slider-min", 
                selectorValue: ".tab-widget-nav-link-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_tab_widget_nav_link_text_font_size").val(), 
                min: 14, // 14 default for .widget.widget-tabs-double-2>.widget-head ul li a.glyphicons
                max: 30 
            }, // tab widget nav link text font size
            { 
                selectorMin: ".tab-widget-nav-link-min-width-range-slider-min", 
                selectorValue: ".tab-widget-nav-link-min-width-range-slider-value", 
                value: $("#melis_core_platform_theme_tab_widget_nav_link_min_width").val(), 
                min: 70,
                max: 200 
            }, // tab widget nav link text font size
            { 
                selectorMin: ".tab-widget-nav-link-height-range-slider-min", 
                selectorValue: ".tab-widget-nav-link-height-range-slider-value", 
                value: $("#melis_core_platform_theme_tab_widget_nav_link_icon_height").val(), 
                min: 37, // 37 default for .widget.widget-tabs-double-2>.widget-head ul li a.glyphicons i
                max: 60 
            }, // tab widget nav link text icon height
            { 
                selectorMin: ".tab-widget-link-font-size-range-slider-min", 
                selectorValue: ".tab-widget-link-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_tab_widget_link_icon_font_size").val(), 
                min: 24,
                max: 50 
            }, // tab widget nav link text icon font size
            { 
                selectorMin: ".datepicker-border-width-range-slider-min", 
                selectorValue: ".datepicker-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_datepicker_border_width").val(), 
                min: 0, 
                max: 10 
            }, // datepicker border width
            { 
                selectorMin: ".datepicker-border-radius-range-slider-min", 
                selectorValue: ".datepicker-border-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_datepicker_border_radius").val(), 
                min: 0, 
                max: 10 
            }, // datepicker border radius
            { 
                selectorMin: ".datepicker-btn-border-radius-range-slider-min", 
                selectorValue: ".datepicker-btn-border-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_datepicker_prev_next_data_action_btn_border_radius").val(),  
                min: 0, 
                max: 10 
            }, // datepicker timepicker previous, data action and next button border radius
            { 
                selectorMin: ".daterangepicker-button-text-font-size-range-slider-min", 
                selectorValue: ".daterangepicker-button-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_button_text_font_size").val(),  
                min: 10, 
                max: 20 
            }, // daterangepicker button text font size
            { 
                selectorMin: ".daterangepicker-border-width-range-slider-min", 
                selectorValue: ".daterangepicker-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_border_width").val(), 
                min: 0, 
                max: 10 
            }, // daterangepicker border width
            { 
                selectorMin: ".daterangepicker-border-radius-range-slider-min", 
                selectorValue: ".daterangepicker-border-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_border_radius").val(), 
                min: 0, 
                max: 10 
            }, // daterangepicker border radius
            { 
                selectorMin: ".daterangepicker-button-border-radius-range-slider-min", 
                selectorValue: ".daterangepicker-button-border-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_button_border_radius").val(), 
                min: 0, 
                max: 10 
            }, // daterangepicker ranges button border radius
            { 
                selectorMin: ".daterangepicker-button-border-width-range-slider-min", 
                selectorValue: ".daterangepicker-button-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_button_border_width").val(), 
                min: 0, 
                max: 10 
            }, // daterangepicker ranges button border width
            { 
                selectorMin: ".daterangepicker-in-range-border-width-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_day_active_in_range_border_width").val(), 
                min: 0, 
                max: 10 
            }, // daterangepicker in range border width
            { 
                selectorMin: ".daterangepicker-in-range-start-date-border-top-left-radius-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-start-date-border-top-left-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_in_range_start_date_border_top_left_radius").val(), 
                min: 4,
                max: 10 
            }, // daterangepicker in range start date border top left radius, 
            { 
                selectorMin: ".daterangepicker-in-range-start-date-border-top-right-radius-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-start-date-border-top-right-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_in_range_start_date_border_top_right_radius").val(), 
                min: 0,
                max: 10 
            }, // daterangepicker in range start date border top right radius
            { 
                selectorMin: ".daterangepicker-in-range-start-date-border-bottom-left-radius-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-start-date-border-bottom-left-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_in_range_start_date_border_bottom_left_radius").val(),
                min: 0,
                max: 10 
            }, // daterangepicker in range start date border bottom left radius
            { 
                selectorMin: ".daterangepicker-in-range-start-date-border-bottom-right-radius-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-start-date-border-bottom-right-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_in_range_start_date_border_bottom_right_radius").val(),
                min: 4,
                max: 10 
            }, // daterangepicker in range start date border bottom right radius
            { 
                selectorMin: ".daterangepicker-in-range-end-date-border-top-left-radius-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-end-date-border-top-left-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_in_range_end_date_border_top_left_radius").val(), 
                min: 0,
                max: 10 
            }, // daterangepicker in range end date border top left radius,
            { 
                selectorMin: ".daterangepicker-in-range-end-date-border-top-right-radius-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-end-date-border-top-right-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_in_range_end_date_border_top_right_radius").val(), 
                min: 4,
                max: 10 
            }, // daterangepicker in range end date border top right radius
            { 
                selectorMin: ".daterangepicker-in-range-end-date-border-bottom-left-radius-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-end-date-border-bottom-left-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_in_range_end_date_border_bottom_left_radius").val(),
                min: 4,
                max: 10 
            }, // daterangepicker in range end date border bottom left radius
            { 
                selectorMin: ".daterangepicker-in-range-end-date-border-bottom-right-radius-range-slider-min", 
                selectorValue: ".daterangepicker-in-range-end-date-border-bottom-right-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_in_range_end_date_border_bottom_right_radius").val(),
                min: 0,
                max: 10 
            }, // daterangepicker in range end date border bottom right radius
            { 
                selectorMin: ".daterangepicker-day-available-border-width-range-slider-min", 
                selectorValue: ".daterangepicker-day-available-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_day_available_border_width").val(), 
                min: 0,
                max: 10 
            }, // daterangepicker day available border width
            { 
                selectorMin: ".daterangepicker-day-available-border-radius-range-slider-min", 
                selectorValue: ".daterangepicker-day-available-border-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_day_available_border_radius").val(),
                min: 0,
                max: 10
            }, // daterangepicker day available border radius
            { 
                selectorMin: ".daterangepicker-day-text-font-size-range-slider-min", 
                selectorValue: ".daterangepicker-day-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_day_text_font_size").val(), 
                min: 10,
                max: 30
            }, // daterangepicker day text font size
            { 
                selectorMin: ".daterangepicker-footer-selected-date-text-font-size-range-slider-min", 
                selectorValue: ".daterangepicker-footer-selected-date-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_footer_selected_date_text_font_size").val(), 
                min: 10,
                max: 30
            }, // daterangepicker footer selected date text font size
            { 
                selectorMin: ".daterangepicker-footer-buttons-text-font-size-range-slider-min", 
                selectorValue: ".daterangepicker-footer-buttons-text-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_daterangepicker_footer_buttons_text_font_size").val(), 
                min: 10,
                max: 30
            }, // daterangepicker footer buttons text font size
            {
                selectorMin: ".plugins-box-border-width-range-slider-min", 
                selectorValue: ".plugins-box-border-width-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_border_width").val(),
                min: 12,
                max: 20 
            }, // dnd plugins box border width
            { 
                selectorMin: ".plugins-box-title-line-height-range-slider-min", 
                selectorValue: ".plugins-box-line-height-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_title_line_height").val(),
                min: 20,
                max: 70 
            }, // dnd plugins box title line height
            { 
                selectorMin: ".plugins-box-title-letter-spacing-range-slider-min", 
                selectorValue: ".plugins-box-letter-spacing-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_title_letter_spacing").val(),
                min: 4,
                max: 15 
            }, // dnd plugins box title letter spacing
            { 
                selectorMin: '.plugin-box-module-title-decimal-range-slider-min',
                selectorValue: '.plugin-box-module-title-decimal-input-range-slider-value',
                min: 0.5,
                max: 1,
                step: 0.01,
                value: $("#melis_core_platform_theme_dnd_plugin_box_module_title_opacity").val()
            }, // dnd plugins box title opacity
            { 
                selectorMin: ".dnd-plugins-box-button-border-radius-range-slider-min", 
                selectorValue: ".dnd-plugins-box-button-border-radius-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_btn_border_radius").val(),
                min: 4,
                max: 10
            }, // dnd plugins box button border radius, for border-top-left-radius and border-bottom-left-radius
            { 
                selectorMin: ".dnd-plugins-box-button-icon-font-size-range-slider-min", 
                selectorValue: ".dnd-plugins-box-button-icon-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_btn_icon_font_size").val(),
                min: 20,
                max: 40
            }, // dnd plugins box button icon font size
            { 
                selectorMin: ".dnd-plugins-box-category-btn-border-bottom-width-range-slider-min", 
                selectorValue: ".dnd-plugins-box-category-btn-border-bottom-width-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_category_btn_border_bottom_width").val(),
                min: 1,
                max: 5
            }, // dnd plugins box category button bottom border width
            { 
                selectorMin: ".dnd-plugins-box-category-button-font-size-range-slider-min", 
                selectorValue: ".dnd-plugins-box-category-button-font-size-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_category_btn_font_size").val(),
                min: 12,
                max: 24
            }, // dnd plugins box category button font size
            { 
                selectorMin: ".dnd-plugins-box-category-button-letter-spacing-range-slider-min", 
                selectorValue: ".dnd-plugins-box-category-button-letter-spacing-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_category_btn_letter_spacing").val(),
                min: 1,
                max: 10
            }, // dnd plugins box category button letter spacing
            { 
                selectorMin: ".dnd-plugins-box-category-button-cms-filter-text-indent-range-slider-min", 
                selectorValue: ".dnd-plugins-box-category-button-cms-filter-text-indent-range-slider-value", 
                value: $("#melis_core_platform_theme_dnd_plugins_box_category_btn_cms_filter_text_indent").val(),
                min: 29,
                max: 50
            }, // dnd plugins box category button cms filter text indent
            { 
                selectorMin: '.dnd-plugins-box-category-button-text-opacity-range-slider-min',
                selectorValue: '.dnd-plugins-box-category-button-text-opacity-range-slider-value',
                min: 0.4,
                max: 1,
                step: 0.01,
                value: $("#melis_core_platform_theme_dnd_plugins_box_category_btn_text_opacity").val()
            }, // dnd plugins box category button text opacity
            { 
                selectorMin: '.layout-column-button-decimal-range-slider-min',
                selectorValue: '.layout-column-button-decimal-input-range-slider-value',
                min: 0.8,
                max: 1,
                step: 0.01,
                value: $("#melis_core_platform_theme_dnd_layout_column_button_hover_opacity").val()
            }, // dnd layout column button hover opacity
        ];

            sliders.forEach(slider => {
                const $sliderMin = $(slider.selectorMin),
                    $sliderValue = $(slider.selectorValue);

                    this.rangeSliderInit($sliderMin, $sliderValue, "min", slider.step ?? 1, slider.value, slider.min, slider.max);
            });
    },
    /**
     * Initialize jQuery Slider Widget - range min
     * @param {jQuery} $elMin 
     * @param {jQuery} $elValue 
     * @param {String or Boolean} range
     * @param {Number} value 
     * @param {Number} min 
     * @param {Number} max 
     */
    rangeSliderInit: function($elMin, $elValue, range, step, value, min, max) {
        $elMin.slider({
            range: range,
            min: min,
            max: max,
            step: step,
            value: value,
            slide: function(event, ui) {
                const stepValue = $elMin.slider("option", "step");
                let valueNum;

                    if (typeof stepValue === 'number' && !isNaN(stepValue)) {
                        const decimalPlaces = rangeSliderSize.getDecimalPlaces(stepValue);
                            valueNum = ui.value.toFixed(decimalPlaces);
                    } 
                    else {
                        valueNum = ui.value;
                    }

                    $elValue.val(valueNum);
            }
        });

        $elValue.val($elMin.slider("value"));
    },
    getDecimalPlaces: function (num) {
        if (typeof num !== 'number' || isNaN(num)) return 0;

        const match = num.toString().match(/(?:\.(\d+))?$/);
        return match && match[1] ? match[1].length : 0;
    }
};

// slider for decimal
var rangeDecimalSlider = {
    setRangeDecimalSlider: function() {
        const decimal_sliders = [
            {
                selectMin: '.layout-column-button-decimal-range-slider-min',
                selectValue: '.layout-column-button-decimal-input-range-slider-value',
                min: 0,
                max: 1,
                step: 0.01,
                value: $("#melis_core_platform_theme_dnd_layout_column_button_hover_opacity").val()
            },
            {
                selectMin: '.plugin-box-module-title-decimal-range-slider-min',
                selectValue: '.plugin-box-module-title-decimal-input-range-slider-value',
                min: 0,
                max: 1,
                step: 0.01,
                value: $("#melis_core_platform_theme_dnd_plugin_box_module_title_opacity").val()
            }
        ];
            decimal_sliders.forEach(slider => {
                const $sliderMin = $(slider.selectMin),
                    $sliderValue = $(slider.selectValue);

                    this.rangeDecimalInit($sliderMin, $sliderValue, "min", slider.step, slider.value, slider.min, slider.max);
            });
    },
    rangeDecimalInit: function($elMin, $elValue, range, step, value, min, max) {
        $elMin.slider({
            range: range,
            min: min,
            max: max,
            step: step,
            value: value,
            slide: function(event, ui) {
                $elValue.val(ui.value);
            }
        });

        $elValue.val($elMin.slider("value"));
    }
};

window.forceReload = function() {
    // preserve current path, query, and hash
    const url       = window.location.href.split('#')[0],
        separator   = url.includes('?') ? '&' : '?',
        reloadedUrl = url + separator + 'cb=' + Date.now();

        window.location.replace(reloadedUrl); // no redirect to a different route
};

window.reloadMelisIframe = function() {
    const $melisIframe = $(`[data-meliskey="meliscms_page"]`).find(".meliscms-page-tab-edition .melis-iframe");
        if ($melisIframe) {
            $melisIframe[0]?.contentWindow.location.reload();
        }
};