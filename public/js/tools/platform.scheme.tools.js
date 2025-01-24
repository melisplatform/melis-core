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

        $body.on("click", "#savePlatformScheme", function() {
            $("form#melis_core_platform_scheme_images").trigger("submit");
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
                        dataType    : 'json'
                    }).done(function(data) {
                        if(data.success) {
                            melisCoreTool.processing();
                            location.reload(true);
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
                colors          = {};

                $.each(colorFormData, function(i, v) {
                    colors[v['name']] = v['value'];
                });

                formData.append('colors', JSON.stringify(colors));

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
            rangeSliderFontSize.setRangeSliderFontSize();
        });

        $body.on("click", ".save-platform-theme-options", function(e) {
            var formData = new FormData(),
                topLogo = {},
                topLogoData = $("form#melis_core_platform_theme_option_form").find('div.top-logo').find('input').serializeArray();
               
                $.each(topLogoData, function(i, v) {
                    topLogo[v['name']] = v['value'];
                });

                formData.append('topLogo', JSON.stringify(topLogo));

                console.log(JSON.stringify(topLogo));

                melisCoreTool.pending(".button");
                
                melisCoreTool.addOverflowHidden();

                $.ajax({
                    type    : 'POST',
                    url     : 'melis/MelisCore/PlatformScheme/savePlatformTheme',
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
        // end evo/platform-scheme
});

var rangeSliderFontSize = {
    /**
     * Set range slider for different element on theme options
     */
    setRangeSliderFontSize: function() {
        var // logo text
            $rangeLogoTextSliderMin         = $(".logo-font-size-range-slider-min"),
            $rangeLogoTextSliderValue       = $(".logo-font-size-range-slider-value"),
            // footer text
            $rangeFooterTextSliderMin       = $(".footer-version-font-size-range-slider-min"),
            $rangeFooterTextSliderValue     = $(".footer-version-font-size-range-slider-value"),
            // hide button text
            $rangeHideBtnTextSliderMin      = $(".hide-btn-text-font-size-range-slider-min"),
            $rangeHideBtnTextSliderValue    = $(".hide-btn-text-font-size-range-slider-value"),
            // widget header text 
            $rangeWidgetHeaderTextSliderMin      = $(".widget-header-text-font-size-range-slider-min"),
            $rangeWidgetHeaderTextSliderValue    = $(".widget-header-text-font-size-range-slider-value"),
            // widget button text 
            $rangeWidgetButtonTextSliderMin      = $(".widget-button-text-font-size-range-slider-min"),
            $rangeWidgetButtonTextSliderValue    = $(".widget-button-text-font-size-range-slider-value"),
            // widget back header text
            $rangeWidgetBackHeaderTextSliderMin      = $(".widget-back-header-text-font-size-range-slider-min"),
            $rangeWidgetBackHeaderTextSliderValue    = $(".widget-back-header-text-font-size-range-slider-value"),
            // dashboard plugin alert
            $rangeDbPluginAlertTextSliderMin      = $(".dashboard-plugin-no-plugin-alert-font-size-range-slider-min"),
            $rangeDbPluginAlertTextSliderValue    = $(".dashboard-plugin-no-plugin-alert-font-size-range-slider-value"),
            // dashboard plugin widget
            $rangeDbPluginTextSliderMin      = $(".plugin-header-text-font-size-range-slider-min"),
            $rangeDbPluginTextSliderValue    = $(".plugin-header-text-font-size-range-slider-value"),
            // dashboard plugins menu box border width
            $rangeDbPluginsMenuBoxBorderWidthSliderMin      = $(".plugins-menu-box-border-width-range-slider-min"),
            $rangeDbPluginsMenuBoxBorderWidthSliderValue    = $(".plugins-menu-box-border-width-range-slider-value"),
            // dashboard plugins menu box title font size
            $rangeDbPluginsMenuBoxTitleFontSizeSliderMin      = $(".plugins-menu-box-title-font-size-range-slider-min"),
            $rangeDbPluginsMenuBoxTitleFontSizeSliderValue    = $(".plugins-menu-box-title-font-size-range-slider-value"),
            // dashboard plugins menu box filter box text font size
            $rangeFilterBoxBtnFontSizeSliderMin      = $(".filter-box-button-text-font-size-range-slider-min"),
            $rangeFilterBoxBtnFontSizeSliderValue    = $(".filter-box-button-text-font-size-range-slider-value"),
            // dashboard plugins new plugins indicator text font size
            $rangeNewPluginIndicatorFontSizeSliderMin      = $(".new-plugin-indicator-text-font-size-range-slider-min"),
            $rangeNewPluginIndicatorFontSizeSliderValue    = $(".new-plugin-indicator-text-font-size-range-slider-value"),
            // dashboard plugins title text font size
            $rangePluginTitleFontSizeSliderMin      = $(".plugin-title-text-font-size-range-slider-min"),
            $rangePluginTitleFontSizeSliderValue    = $(".plugin-title-text-font-size-range-slider-value"),
            // dashboard plugins category button text font size
            $rangeCategoryButtonFontSizeSliderMin      = $(".category-btn-text-font-size-range-slider-min"),
            $rangeCategoryButtonFontSizeSliderValue    = $(".category-btn-text-font-size-range-slider-value"),
            // dashboard plugins delete all button text font size
            $rangeDeleteAllButtonFontSizeSliderMin      = $(".delete-all-btn-text-font-size-range-slider-min"),
            $rangeDeleteAllButtonFontSizeSliderValue    = $(".delete-all-btn-text-font-size-range-slider-value");

            // logo text
            this.rangeSliderInit($rangeLogoTextSliderMin, $rangeLogoTextSliderValue, "min", 18, 1, 30);
            
            // footer text
            this.rangeSliderInit($rangeFooterTextSliderMin, $rangeFooterTextSliderValue, "min", 10, 1, 30);
            
            // hide button text
            this.rangeSliderInit($rangeHideBtnTextSliderMin, $rangeHideBtnTextSliderValue, "min", 10, 1, 25);
            
            // widget header text
            this.rangeSliderInit($rangeWidgetHeaderTextSliderMin, $rangeWidgetHeaderTextSliderValue, "min", 25, 1, 35);

            // widget button text
            this.rangeSliderInit($rangeWidgetButtonTextSliderMin, $rangeWidgetButtonTextSliderValue, "min", 14, 1, 30);

            // widget back header text
            this.rangeSliderInit($rangeWidgetBackHeaderTextSliderMin, $rangeWidgetBackHeaderTextSliderValue, "min", 14, 1, 35);

            // dashboard plugin alert text
            this.rangeSliderInit($rangeDbPluginAlertTextSliderMin, $rangeDbPluginAlertTextSliderValue, "min", 14, 1, 25);

            // dashboard plugin widget header text
            this.rangeSliderInit($rangeDbPluginTextSliderMin, $rangeDbPluginTextSliderValue, "min", 14, 1, 25);

            // dashboard plugins menu box border width
            this.rangeSliderInit($rangeDbPluginsMenuBoxBorderWidthSliderMin, $rangeDbPluginsMenuBoxBorderWidthSliderValue, "min", 4, 1, 10);

            // dashboard plugins menu box title font size
            this.rangeSliderInit($rangeDbPluginsMenuBoxTitleFontSizeSliderMin, $rangeDbPluginsMenuBoxTitleFontSizeSliderValue, "min", 14, 1, 30);

            // dashboard plugins menu box filter box text font size
            this.rangeSliderInit($rangeFilterBoxBtnFontSizeSliderMin, $rangeFilterBoxBtnFontSizeSliderValue, "min", 12, 1, 20);

            // dashboard plugins menu box filter box text font size
            this.rangeSliderInit($rangeNewPluginIndicatorFontSizeSliderMin, $rangeNewPluginIndicatorFontSizeSliderValue, "min", 7, 1, 18);

            // dashboard plugins title text font size
            this.rangeSliderInit($rangePluginTitleFontSizeSliderMin, $rangePluginTitleFontSizeSliderValue, "min", 12, 1, 30);

            // dashboard plugins category button text font size
            this.rangeSliderInit($rangeCategoryButtonFontSizeSliderMin, $rangeCategoryButtonFontSizeSliderValue, "min", 11, 1, 30);

            // dashboard plugins delete all button text font size
            this.rangeSliderInit($rangeDeleteAllButtonFontSizeSliderMin, $rangeDeleteAllButtonFontSizeSliderValue, "min", 14, 1, 30);
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
    rangeSliderInit: function($elMin, $elValue, range, value, min, max) {
        $elMin.slider({
            range: range,
            value: value,
            min: min,
            max: max,
            slide: function(event, ui) {
                $elValue.val(ui.value);
            }
        });

        $elValue.val($elMin.slider("value"));
    }
};