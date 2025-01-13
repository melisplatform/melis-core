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

        function jqueryRangeSliderFontSize() {
            var // logo text font size
                $rangeLogoTextSliderMin     = $("#logo-font-size-range-slider-min"),
                $rangeLogoTextSliderValue   = $(".logo-font-size-range-slider-value"),
                // footer text font size
                $rangeFooterTextSliderMin   = $("#footer-version-font-size-range-slider-min"),
                $rangeFooterTextSliderValue = $(".footer-version-font-size-range-slider-value");

                $rangeLogoTextSliderMin.slider({
                    range: "min",
                    value: 18,
                    min: 1,
                    max: 30,
                    slide: function(event, ui) {
                        $rangeLogoTextSliderValue.val(ui.value);
                    }
                });

                $rangeLogoTextSliderValue.val( $rangeLogoTextSliderMin.slider("value") );

                $rangeFooterTextSliderMin.slider({
                    range: "min",
                    value: 10,
                    min: 1,
                    max: 30,
                    slide: function(event, ui) {
                        $rangeFooterTextSliderValue.val(ui.value);
                    }
                });

                $rangeFooterTextSliderValue.val( $rangeFooterTextSliderMin.slider("value") );
        }

        $body.on("click", ".platform-theme-options-toggle, .open-theme-options", function() {
            jqueryRangeSliderFontSize();
        });
        // end evo/platform-scheme
});