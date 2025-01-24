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
            rangeSliderSize.setRangeSliderSize();
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
            { selectorMin: ".logo-font-size-range-slider-min", selectorValue: ".logo-font-size-range-slider-value", value: 18, min: 1, max: 30 }, // logo text, start general options
            { selectorMin: ".footer-version-font-size-range-slider-min", selectorValue: ".footer-version-font-size-range-slider-value", value: 10, min: 1, max: 30 }, // footer text
            { selectorMin: ".hide-btn-text-font-size-range-slider-min", selectorValue: ".hide-btn-text-font-size-range-slider-value", value: 10, min: 1, max: 25 }, // hide button text
            { selectorMin: ".widget-header-text-font-size-range-slider-min", selectorValue: ".widget-header-text-font-size-range-slider-value", value: 25, min: 1, max: 35 }, // widget header text
            { selectorMin: ".widget-button-text-font-size-range-slider-min", selectorValue: ".widget-button-text-font-size-range-slider-value", value: 14, min: 1, max: 30 }, // widget button text
            { selectorMin: ".widget-back-header-text-font-size-range-slider-min", selectorValue: ".widget-back-header-text-font-size-range-slider-value", value: 14, min: 1, max: 35 }, // widget back header text
            { selectorMin: ".dashboard-plugin-no-plugin-alert-font-size-range-slider-min", selectorValue: ".dashboard-plugin-no-plugin-alert-font-size-range-slider-value", value: 14, min: 1, max: 25 }, // dashboard plugin alert
            { selectorMin: ".plugin-header-text-font-size-range-slider-min", selectorValue: ".plugin-header-text-font-size-range-slider-value", value: 14, min: 1, max: 25 }, // dashboard plugin widget
            { selectorMin: ".plugins-menu-box-border-width-range-slider-min", selectorValue: ".plugins-menu-box-border-width-range-slider-value", value: 4, min: 1, max: 10 }, // dashboard plugins menu box border width
            { selectorMin: ".plugins-menu-box-title-font-size-range-slider-min", selectorValue: ".plugins-menu-box-title-font-size-range-slider-value", value: 14, min: 1, max: 30 }, // dashboard plugins menu box title font size
            { selectorMin: ".filter-box-button-text-font-size-range-slider-min", selectorValue: ".filter-box-button-text-font-size-range-slider-value", value: 12, min: 1, max: 20 }, // dashboard plugins menu box filter box text font size
            { selectorMin: ".new-plugin-indicator-text-font-size-range-slider-min", selectorValue: ".new-plugin-indicator-text-font-size-range-slider-value", value: 7, min: 1, max: 18 }, // dashboard plugins new plugins indicator text font size
            { selectorMin: ".plugin-title-text-font-size-range-slider-min", selectorValue: ".plugin-title-text-font-size-range-slider-value", value: 12, min: 1, max: 30 }, // dashboard plugins title text font size
            { selectorMin: ".category-btn-text-font-size-range-slider-min", selectorValue: ".category-btn-text-font-size-range-slider-value", value: 11, min: 1, max: 30 }, // dashboard plugins category button text font size
            { selectorMin: ".delete-all-btn-text-font-size-range-slider-min", selectorValue: ".delete-all-btn-text-font-size-range-slider-value", value: 14, min: 1, max: 30 }, // dashboard plugins delete all button text font size, end of general options
            { selectorMin: ".modal-border-radius-size-range-slider-min", selectorValue: ".modal-border-radius-size-range-slider-value", value: 0, min: 0, max: 10 }, // modal nav tabs border radius size, start component options
            { selectorMin: ".modal-border-right-width-range-slider-min", selectorValue: ".modal-border-right-width-range-slider-value", value: 1, min: 0, max: 10 }, // modal nav tabs border right width
            { selectorMin: ".modal-tabs-font-size-range-slider-min", selectorValue: ".modal-tabs-font-size-range-slider-value", value: 14, min: 1, max: 20 }, // modal nav tabs text font size
            { selectorMin: ".modal-content-text-font-size-range-slider-min", selectorValue: ".modal-content-text-font-size-range-slider-value", value: 14, min: 1, max: 25 }, // modal content text font size
        ];

            sliders.forEach(slider => {
                const $sliderMin = $(slider.selectorMin),
                    $sliderValue = $(slider.selectorValue);

                    this.rangeSliderInit($sliderMin, $sliderValue, "min", slider.value, slider.min, slider.max);
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