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

            // dynamic dnd, issue: https://mantis2.uat.melistechnology.fr/view.php?id=8466
            reloadMelisIframe();
        });

        $body.on("click", "#resetPlatformScheme", function() {
            console.log(`#resetPlatformScheme !!!`);
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
                        cache       : 'reload', // false
                        contentType : false,
                        dataType    : 'json'
                    }).done(function(data) {
                        if(data.success) {
                            melisCoreTool.processing();
                            location.reload(true);

                            console.log(`cache: 'reload', location.reload(true) !!!`);

                            // dynamic dnd, issue: https://mantis2.uat.melistechnology.fr/view.php?id=8466
                            reloadMelisIframe();
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
});

window.reloadMelisIframe = function() {
    const $melisIframe = $(`[data-meliskey="meliscms_page"]`).find(".meliscms-page-tab-edition .melis-iframe");
        if ($melisIframe) {
            $melisIframe[0]?.contentWindow.location.reload();
        }
};

/* window.reloadMelisIframe = function() {
    const $melisIframe = $(`[data-meliskey="meliscms_page"]`).find(".meliscms-page-tab-edition .melis-iframe");
        if ($melisIframe) {
            //console.log({$melisIframe});
            $melisIframe.each((i, v) => {
                //setTimeout(() => {
                    // reload iframe content with timestamp
                    let $this       = $(v),
                        iframeId    = $this.attr("id"),
                        src         = $("#"+iframeId).attr("src");

                        console.log({src});
                        if (src) {
                            let newSrc = src + "?v=" + new Date().getTime();

                                $this.attr("src", newSrc);
                        }
                        else {
                            console.error('Iframe src is undefined');
                        }

                        $this.on("load", () => {
                            //console.log(`$this.on load !!!`);
                            let $iframe     = $this,
                                iframeDoc   = $iframe[0]?.contentDocument || $iframe[0]?.contentWindow?.document,
                                timestamp   = new Date().getTime();
                                // $iframe[0]?.contentWindow.location.reload();

                                console.log({iframeDoc});
                                //console.log({$iframe});

                                if (!iframeDoc) {
                                    console.error("Cannot access iframe document. Is it same-origin?");
                                    return;
                                }

                                console.log(`$(iframeDoc).find('link[rel="stylesheet"]').length: `, $(iframeDoc).find('link[rel="stylesheet"]').length);

                                // update all <link href="stylesheet">
                                $(iframeDoc).find(`link[rel="stylesheet"]`).each(() => {
                                    let href = $(this).attr("href").split("?")[0];
                                        $(this).attr("href", href + "?v=" + timestamp);
                                });

                                // update all <script src="">
                                $(iframeDoc).find(`script[src]`).each(() => {
                                    let src = $(this).attr("src").split("?")[0];
                                        $(this).attr("src", src + "?v=" + timestamp);
                                });
                        });
                    //console.log(`setTimeout 2000 !!!`);
                //}, 2000);
            });
        }
}; */