(function($) {
    /**
     * Returns a unique site names from an array.
     * @param {*} $elemArray 
     * @returns uniqueArray
     */
    function getUniqueSiteName( $elemArray ) {
        var listArray = [], uniqueArray = [], counting = 0, found = false;
            $.each($elemArray, function(i, v) {
              var siteName = $(v).data("site-name");
                if ( $.inArray( siteName, listArray ) == -1 ) {
                  listArray.push( siteName );
                }
            });

            for ( var x = 0; x < listArray.length; x++ ) {
              for ( var y = 0; y < uniqueArray.length; y++ ) {
                if ( listArray[x] == uniqueArray[y] ) {
                  found = true;
                }
              }
              counting++;
              if ( counting == 1 && found == false ) {
                uniqueArray.push( listArray[x] );
              }
              found = false;
              counting = 0;
            }
            
            return uniqueArray;
    }

    // unique main category
    function getUniqueCategoryText( $elemArray ) {
        var listArray = [], uniqueArray = [], counting = 0, found = false;
            $.each($elemArray, function(i, v) {
                var dType = $(v).data("type");
                    
                    if ( dType === 'category' ) {
                        // $(v).attr("title")
                        var dCategoryText = $(v).find("span").text();
                            if ( $.inArray( dCategoryText, listArray ) == -1 ) {
                                listArray.push( dCategoryText );
                            }
                    }
            });

            for ( var x = 0; x < listArray.length; x++ ) {
              for ( var y = 0; y < uniqueArray.length; y++ ) {
                if ( listArray[x] == uniqueArray[y] ) {
                  found = true;
                }
              }
              counting++;
              if ( counting == 1 && found == false ) {
                uniqueArray.push( listArray[x] );
              }
              found = false;
              counting = 0;
            }
            
            return uniqueArray;
    }

    // unique main category
    function getUniqueMainCategoryId( $elemArray ) {
        var listArray = [], uniqueArray = [], counting = 0, found = false;
            
            $.each($elemArray, function(i, v) {
                var dType = $(v).data("type");
                    
                    if ( dType === 'category' ) {
                        var dId = $(v).data("id");
                            if ( $.inArray( dId, listArray ) == -1 ) {
                                listArray.push( dId );
                            }
                    }
            });

            for ( var x = 0; x < listArray.length; x++ ) {
              for ( var y = 0; y < uniqueArray.length; y++ ) {
                if ( listArray[x] == uniqueArray[y] ) {
                  found = true;
                }
              }
              counting++;
              if ( counting == 1 && found == false ) {
                uniqueArray.push( listArray[x] );
              }
              found = false;
              counting = 0;
            }
            
            return uniqueArray;
    }

    // ajax
    function processAjax() {
        // var miniTemplateUrl = window.parent.melisTinyMCE.miniTemplateUrl();
        // var miniTemplateUrl = parent.tinymce.activeEditor.options.get("mini_templates_url");
            $.ajax({
                type: 'GET',
                url: parent.tinymce.activeEditor.options.get("mini_templates_url"),
                dataType: 'json',
                cache: false
            })
            .done(function(data) {
                setTimeout(function() {
                    appendAccordion(data);
                }, 1000);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                alert( parent.translations.tr_meliscore_error_message );
            });
    }

    // accordion
    function appendAccordion(data) {
        var $accordion = $("#accordion-mini-template");
        /* var previewConfig = getPreviewConfig();
        var fallbackSiteId = previewConfig.site_id || ""; */
            
            // template lists
            for ( var i = 0; i < data.length; i++ ) {
                var template        = data[i],
                    dId             = template.id,
                    dParent         = template.parent,
                    dText           = template.text,
                    dType           = template.type,
                    dModule         = template.module,
                    dSiteName       = template.site_name,
                    // dSiteId         = template.site_id || template.siteId || fallbackSiteId,
                    dImageSource    = template.imgSource,
                    dUrl            = template.url,
                    buttons         = '';

                var trimDText       = dText.replaceAll("-", " "); // $button = $("button[title='"+trimDText+"']")

                    // mini-template buttons
                    if ( dType === 'mini-template' ) {
                        buttons = $("<button />", {
                            "title"           : trimDText,
                            "id"              : 'btn_'+i,
                            "class"           : 'mini-template-button',
                            "data-id"         : dId,
                            "data-module"     : dModule,
                            "data-parent"     : dParent,
                            "data-type"       : dType,
                            "data-site-name"  : dSiteName,
                            //"data-site-id"    : dSiteId,
                            "data-url"        : dUrl
                        });
                    }


                    // category
                    if ( dType === 'category' ) {
                        buttons = $("<button />", {
                            "title"             : trimDText,
                            "class"             : 'mini-template-button category d-none',
                            "data-type"         : dType,
                            "data-site-name"    : dSiteName,
                            //"data-site-id"      : dSiteId,
                            "data-id"           : dId
                        });
                    }

                    if ( dImageSource != '' && typeof dImageSource != 'undefined' ) {
                        var $image  = "<img src=" + dImageSource + " width='195px' style='display: block; width: 195px; height: auto; margin: 0 auto 0.5rem;' />";
                            buttons.append( $image );
                    }                    

                    buttons.prepend( "<span>" + trimDText + "</span>");
                    
                    $accordion.append( buttons );
            }

            /**
             * Appending of site category
             * Creating site category based on unique values from button's data-site-name
             */
            var $miniTemplateButtons = $accordion.find(".mini-template-button");

                // .site-category
                createSiteCategory( $miniTemplateButtons );
                
                // .main-category, .other-category
                $.when(
                    appendMainCategoryToSiteCategory( $miniTemplateButtons )
                ).then(function() {
                    // re-arranging the mini template buttons to its own category based on data attributes
                    $.each( $miniTemplateButtons, function(i, v) {
                        var $btn            = $(v),
                            title           = $btn.text(),
                            id              = $btn.data("id"),
                            parent          = $btn.data("parent"),
                            type            = $btn.data("type"),
                            siteName        = $btn.data("site-name"),
                            $siteCategory   = $(".site-category"),
                            $mainCategory   = $(".main-category");

                            /**
                             * Check if mini-template should be inside a main category or
                             * If parent == '#' means it is under .site-category
                             */
                            if ( parent === '#' ) {
                                // .site-category
                                $.each($siteCategory, function(i, v) {
                                    var $siteCategoryElement = $(v),
                                        siteCategorySiteName = $siteCategoryElement.data("site-name");
                                        
                                        if ( siteName === siteCategorySiteName ) {
                                            $accordion.find('.site-category').append( $btn );
                                        }
                                });
                            }
                            else {
                                // for .main-category
                                $.each($mainCategory, function(i, v) {
                                    var $mainCategoryElement = $(v),
                                        mainCategorySiteName = $mainCategoryElement.data("site-name"),
                                        mainCategoryId       = $mainCategoryElement.data("id");
                                        
                                        if ( siteName === mainCategorySiteName && parent === mainCategoryId ) {
                                            $("#"+$mainCategoryElement.attr("id")).append($btn);
                                        }
                                });
                            }

                            /**
                             * Remove this not needed element added by jquery ui accordion.
                             * <span class="ui-accordion-header-icon ui-icon fa fa-arrow-circle-right"></span>
                             */
                            $btn.find(".fa-arrow-circle-right").remove();

                            /**
                             * Highlight the clicked button to determine from in active.
                             */
                            $btn.on("click", function(e) {
                                var $this = $(this);
                                var type = $this.data("type") || $this.attr("data-type");

                                    $this.toggleClass("active").siblings().removeClass("active");

                                    /**
                                     * For the issue on displaying all available mini templates.
                                     * Some button when clicked it closes the accordion
                                     */
                                    if (type !== "mini-template" && $this.hasClass('ui-accordion-header')) {
                                        $this.closest(".site-category").prev(".ui-accordion-header").trigger("click");
                                    }
                            });
                    });
                }).then(function() {
                    /**
                     * 1. Remove buttons with classes .mini-template-button.category.d-none directly under .main-category
                     * 2. Remove .accordion classes, display none and height on button directly under .site-category
                     */
                    var $siteCategory       = $accordion.find(".site-category"),
                        $siteCategoryBtns   = $siteCategory.find(".mini-template-button"), // .mini-template-button(s) under a .site-category
                        $mainCategory       = $siteCategory.find(".main-category"),
                        $mainCategoryBtns   = $mainCategory.find(".mini-template-button"); // .mini-template-button(s) under a .main-category

                        // $.each($siteCategoryBtns, function(i, v) {
                        //     var $btn = $(v);
                        //         // removes style attribute with display: none; height: 115px;
                        //         $btn.removeAttr("style");

                        //     // removes all accordion related classes
                        //     const clsList = $btn[0].classList;
                        //         clsList.forEach((clsName) => {
                        //             if ( clsName.startsWith("ui-") ) {
                        //                 $btn[0].classList.remove(clsName);
                        //             }
                        //         });
                        // });

                        $.each($mainCategoryBtns, function(i, v) {
                            var $btn = $(v);
                                // removes style attribute with display: none; height: 115px;
                                $btn.removeAttr("style");

                                // generated button from dType 'category'
                                $btn.find(".category.d-none").remove();

                                // removes all accordion related classes
                            const clsList = $btn[0].classList;
                                clsList.forEach((clsName) => {
                                    if ( clsName.startsWith("ui-") ) {
                                        $btn[0].classList.remove(clsName);
                                    }
                                });
                        });

                        // adding of custom css class for spacing
                        $siteCategory.find(".main-category:last").prev(".ui-accordion-header").addClass("custom-last-child");
                        $siteCategory.find(".main-category:last").addClass("custom-last-child");

                /**
                 * Turns lists of sites and categories into accordion
                 */
                var icons = {
                    header: 'fa fa-arrow-circle-right',
                    activeHeader: 'fa fa-arrow-circle-down'
                };

                $(".accordion").accordion({
                    animate: 400,
                    autoHeight: true,
                    collapsible: true,
                    icons: icons
                });

                //cleanup accordion generated styles and classes for better display of buttons
                 var $siteCategory     = $accordion.find(".site-category"),
                     $siteCategoryBtns   = $siteCategory.find(".mini-template-button");
                $.each($siteCategoryBtns, function(i, v) {
                    var $btn = $(v);
                        // removes style attribute with display: none; height: 115px;
                        $btn.removeAttr("style");

                    // removes all accordion related classes
                    const clsList = $btn[0].classList;
                        clsList.forEach((clsName) => {
                            if ( clsName.startsWith("ui-") ) {
                                $btn[0].classList.remove(clsName);
                            }
                        });
                });

                $(".accordion").niceScroll({cursorcolor:"#CB4040", cursorborder: "#CB4040"});

                $("body").on("click", ".ui-accordion-header", function() {
                    $(".accordion").getNiceScroll().resize();
                });

                // hightlight buttons
                highlightButtons($miniTemplateButtons);

                // get selected mini template form .mini-template-button
                getSelectedMiniTemplate($miniTemplateButtons);
                });
    }

    // create category section
    function createSiteCategory( $miniTemplateButtons ) {
        var $accordion      = $("#accordion-mini-template"),
            uniqueSiteNames = getUniqueSiteName( $miniTemplateButtons );
            // cycle through the unique site names for .site-category
            for ( var index = 0; index < uniqueSiteNames.length; index++ ) {
                var siteName = uniqueSiteNames[index],
                    siteHtml = '';
                    
                    // site category
                    if ( siteName != 'undefined' ) {
                        var siteId = getSiteIdByName($miniTemplateButtons, siteName);
                        siteHtml = siteNameHtml( siteName, index, siteId );
                        $accordion.prepend( siteHtml );
                    }      
            }
    }

    function getSiteIdByName($miniTemplateButtons, siteName) {
        var resolvedSiteId = "";
        $.each($miniTemplateButtons, function(i, v) {
            var $btn = $(v);
            if ($btn.data("site-name") === siteName) {
                resolvedSiteId = $btn.data("site-id") || $btn.attr("data-site-id") || "";
                return false;
            }
        });
        return resolvedSiteId;
    }

    function appendMainCategoryToSiteCategory( $miniTemplateButtons ) {
        var $accordion = $("#accordion-mini-template");

            var countHashOccurrence = 0,
                countCategoryOccurrence = 0;

                // occurrences of # for .other-category, 
                $.each($miniTemplateButtons, function(i, v) {
                    let $button     = $(v);
                        dParent     = $button.data('parent'),
                        dType       = $button.data('type');

                        if ( dParent === '#' ) {
                            countHashOccurrence++;
                        } 
                        
                        if ( dType === 'category' ) {
                            countCategoryOccurrence++;
                        }
                });

                // .main-category
                if ( countCategoryOccurrence ) {
                    var uniqueSiteNames = getUniqueSiteName( $miniTemplateButtons );
                    var uniqueMainCategoryText = getUniqueCategoryText( $miniTemplateButtons );
                    var ids = uniqueTypeCategoryIds();

                    for ( var index = 0; index < uniqueSiteNames.length; index++ ) {
                        var mainCategorySiteName = uniqueSiteNames[index];

                        for ( var i = 0; i < ids.length; i++ ) {
                            var mainCategoryText = uniqueMainCategoryText[i];
                            var categoryId = ids[i];

                            if ( ! categoryHasMiniTemplates($miniTemplateButtons, categoryId, mainCategorySiteName) ) {
                                continue;
                            }

                            $accordion.find('.site-category').each(function() {
                                var $siteCategory = $(this);
                                if ($siteCategory.data('site-name') === mainCategorySiteName) {
                                    $siteCategory.append(
                                        mainCategoryHtml(mainCategoryText, mainCategorySiteName, categoryId, i)
                                    );
                                }
                            });
                        }
                    }
                }
    }

    function categoryHasMiniTemplates($miniTemplateButtons, categoryId, siteName) {
        var hasMiniTemplates = false;
            $.each($miniTemplateButtons, function(i, v) {
                var $button = $(v);
                if (
                    $button.data("type") === "mini-template" &&
                    $button.data("parent") === categoryId &&
                    $button.data("site-name") === siteName
                ) {
                    hasMiniTemplates = true;
                    return false;
                }
            });

        return hasMiniTemplates;
    }

    // get the unique data-id of a data-type: category .mini-template-button
    function uniqueTypeCategoryIds() {
        var uniqueIds           = [];                     
            // data-id: 2-test2 and 1-test, data-type: category
            $.each( $(".mini-template-button[data-type='category']"), function(i, v) {
                var $btn    = $(v),
                    id      = $btn.data("id");

                    if ( uniqueIds.indexOf(id) === -1 ) {
                        uniqueIds.push(id);
                    }                                                    
            });

            return uniqueIds;
    }

    // get the selected mini template
    function getSelectedMiniTemplate( $miniTemplateButtons ) {
        setTimeout(function() {
            var $siteCategory   = $("#accordion-mini-template > .site-category"),
                $commonCategory = $("#accordion-mini-template > .common-category");
               
                // preview mini template at first load without clicking of buttons
                if ( $siteCategory.length ) {
                    var $mainCategoryBtn            = $("#accordion-mini-template > .site-category.ui-accordion-content-active .main-category > .mini-template-button:first-child"),
                        miniTemplateBtnDataUrl      = "",
                        miniTemplateBtnDataModule   = "";

                        // with .main-category
                        if ( $mainCategoryBtn.length ) {
                            miniTemplateBtnDataUrl      = $mainCategoryBtn.data("url");
                            miniTemplateBtnDataModule   = $mainCategoryBtn.data("module");
                        }
                        // no .main-category
                        else {
                            var $siteCategoryChildBtn   = $("#accordion-mini-template > .site-category.ui-accordion-content-active > .mini-template-button:first-child");
                                miniTemplateBtnDataUrl  = $siteCategoryChildBtn.data("url");
                                miniTemplateBtnDataModule = $siteCategoryChildBtn.data("module");
                        }

                        if (miniTemplateBtnDataUrl) {
                            previewMiniTemplate(miniTemplateBtnDataUrl, miniTemplateBtnDataModule);
                        }
                }
                
                $.each($miniTemplateButtons, function(i, v) {
                    var $btn = $(v);
                        
                        // check if direct parent is the .accordion
                        if ( $btn.parent(".accordion").length ) {
                            const clsList = $btn[0].classList;
                                clsList.forEach((clsName) => {
                                    if ( clsName.startsWith("ui-") ) {
                                        $btn[0].classList.remove(clsName);
                                    }
                                });
                        }

                        // Ensure template buttons stay interactive after accordion/nicescroll mutations.
                        $btn.removeClass("ui-state-disabled");
                        $btn.prop("disabled", false);
                        $btn.css("pointer-events", "auto");
                });

                // Delegated handler so all sites/categories (including dynamically moved nodes) are clickable.
                $("body").off("click.miniTemplatePreview", ".mini-template-button");
                $("body").on("click.miniTemplatePreview", ".mini-template-button", function(e) {
                    var $btn = $(this);
                    var type = $btn.data("type") || $btn.attr("data-type") || "";

                    // Only mini-template items should trigger preview changes.
                    if (type !== "mini-template") {
                        return;
                    }

                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    var url         = $btn.data("url") || $btn.attr("data-url") || "",
                        siteModule  = $btn.data("module") || $btn.attr("data-module") || "";
                        if (url) {
                            previewMiniTemplate(url, siteModule);
                        }
                });

                // Hard-stop accordion from toggling when selecting real mini-template buttons.
                $("#accordion-mini-template")
                    .off("mousedown.miniTemplatePreview mouseup.miniTemplatePreview click.miniTemplatePreview", ".mini-template-button[data-type='mini-template']")
                    .on("mousedown.miniTemplatePreview mouseup.miniTemplatePreview click.miniTemplatePreview", ".mini-template-button[data-type='mini-template']", function(e) {
                        e.stopPropagation();
                        if (e.type === "click") {
                            var $btn = $(this);
                            var url         = $btn.data("url") || $btn.attr("data-url") || "",
                                siteModule  = $btn.data("module") || $btn.attr("data-module") || "";
                                if (url) {
                                    previewMiniTemplate(url, siteModule);
                                }
                            e.preventDefault();
                            e.stopImmediatePropagation();
                        }
                    });
        }, 1000);
    }

    // displays mini template in iframe
    function previewMiniTemplate(url, siteModule) {
        var $preview    = $("#preview-mini-template"),
            $prevIframe = $preview.find(".preview-iframe");

            if (!$prevIframe.length || !url) {
                return;
            }

            $.ajax({
                type: "GET",
                url: url,
                dataType: "html",
                cache: false
            })
            .done(function(templateHtml) {
                var site_module = siteModule ? siteModule : (getPreviewConfig().site_module || null);
                    if (site_module) {
                        renderTemplateWithSiteShell($prevIframe[0], templateHtml, site_module);
                    } else {
                        renderTemplateWithSiteShell($prevIframe[0], templateHtml);
                    }
            })
            .fail(function() {
                alert(parent.translations.tr_meliscore_error_message);
            });
    }

    function getPreviewMode() {
        return parent.tinymce.activeEditor.options.get("mini_template_preview_mode") || "auto";
    }

    function getActivePageEditionIframe() {
        return window.parent.$("#" + parent.activeTabId).find(".melis-iframe").first();
    }

    function setupPreviewViewport() {
        var $preview = $("#preview-mini-template");
        var $iframe = $preview.find(".preview-iframe");

        // keep preview usable for long pages/templates inside the TinyMCE dialog.
        $preview.css({
            "height": "85vh", // 70
            "min-height": "420px",
            "overflow": "auto"
        });

        $iframe.css({
            "width": "100%",
            "height": "100%",
            "display": "block",
            "overflow": "auto"
        });

        $iframe.attr("scrolling", "yes");
    }

    // insertion of melis-demo-cms mini template css in iframe head, disabled for now
    function insertDemoMiniTemplateCss() {
        setTimeout(function() {
            // https://mantis2.uat.melistechnology.fr/view.php?id=6103, detect if melis-demo-cms or melis-demo-commerce css files will be inserted on the preview iframe
            var $previewIframe      = $("#preview-mini-template iframe"),
                $previewIframeHead  = $previewIframe.contents().find("head"),
                // possible inserting of melis-demo-cms cssUrl inside active tinymce editor iframe
                // $activeEditorIframe = $(parent.tinymce.activeEditor).contents().find("head"),
                cssUrl              = [[
                    '/MelisDemoCms/css/bootstrap.min.css',
                    '/MelisDemoCms/vendors/themify-icon/themify-icons.css',
                    '/MelisDemoCms/vendors/elagent/style.css',
                    '/MelisDemoCms/css/style.css'
                ], [
                    '/MelisDemoCommerce/js/vendor/modernizr-2.8.3.min.js',
                    '/MelisDemoCommerce/css/bootstrap.min.css',
                    '/MelisDemoCommerce/css/core.css',
                    '/MelisDemoCommerce/css/shortcode/shortcodes.css',
                    '/MelisDemoCommerce/css/owl.carousel.css',
                    '/MelisDemoCommerce/css/owl.theme.default.css',
                    '/MelisDemoCommerce/css/owl.theme.green.min.css',
                    '/MelisDemoCommerce/css/style.css',
                    '/MelisDemoCommerce/css/responsive.css',
                    '/MelisDemoCommerce/css/animate.css',
                    '/MelisDemoCommerce/css/custom.css',
                    '/MelisDemoCommerce/css/skin/skin-default.css'
                ]];

                if ( $previewIframe.length ) {
                    let $previewIframeSrc   = $previewIframe.attr("src"),
                        previewModuleText   = '',
                        moduleUrl           = '';
                        
                        previewModuleText = $previewIframeSrc.split("\\")[1] ? $previewIframeSrc.split("\\")[1] : $previewIframeSrc.split("/")[1];

                        switch(previewModuleText) {
                            case "MelisDemoCms":
                                moduleUrl = cssUrl[0];
                                break;
                            case "MelisDemoCommerce":
                                moduleUrl = cssUrl[1];
                                break;
                            default:
                                console.log(parent.tinymce.util.I18n.translate("No demo site detected."));
                        }

                        $.each( moduleUrl, function(i, v) {
                            var el = document.createElement("link");

                                el.href     = moduleUrl[i];
                                el.rel      = "stylesheet";
                                el.media    = "screen";
                                el.type     = "text/css";

                                $previewIframeHead.append( el );
                        });
                }
        }, 1000);
    }

    function siteNameHtml( siteName, index, siteId ) {
        return '<h3 data-site-id="'+ siteId +'">'+ siteName +'</h3>' +
                '<div id="site-category-'+index+'" class="site-category accordion" data-site-name="'+ siteName +'" data-site-id="'+ siteId +'"></div>';
    }

    function mainCategoryHtml( mainCategoryText, mainCategorySiteName, mainCategoryId, index ) {
        return '<h3>'+ mainCategoryText +'</h3>' +
                '<div id="main-category-'+index+'" class="main-category common-category" data-id="'+mainCategoryId+'" data-site-name="'+ mainCategorySiteName +'"></div>'; // data-cat-id="'+ categoryId +'
    }

    function otherCategoryHtml( otherCategory, otherCategorySiteName, index ) {
        return '<h3>'+ otherCategory +'</h3>' +
                '<div id="other-category-'+index+'" class="other-category common-category" data-site-name="'+ otherCategorySiteName +'"></div>';
    }

    // highlight effect on buttons
    function highlightButtons( $miniTemplateButtons ) {
        $.each( $miniTemplateButtons, function(i, v) {
            var $btn               = $(v),
                classesToRemoved    = ['ui-accordion-header', 'ui-corner-top', 'ui-state-default', 'ui-accordion-icons', 'ui-accordion-header-collapsed', 'ui-corner-all'], // j
                classesToAdd        = ['ui-accordion-content', 'ui-corner-bottom', 'ui-helper-reset', 'ui-widget-content'], // k
                classList           = $btn.attr('class').split(/\s+/); // i

                /**
                 * Remove this not needed element added by jquery ui accordion.
                 * <span class="ui-accordion-header-icon ui-icon fa fa-arrow-circle-right"></span>
                 */
                $btn.find(".fa-arrow-circle-right").remove();

                /**
                 * Highlight the clicked button to determine from in active.
                 */
                $btn.on("click", function(e) {
                    var $this = $(this);
                    var type = $this.data("type") || $this.attr("data-type");

                        $this.toggleClass("active").siblings().removeClass("active");

                        /**
                         * For the issue on displaying all available mini templates.
                         * Some button when clicked it closes the accordion
                         */
                        if (type !== "mini-template" && $this.hasClass('ui-accordion-header')) {
                            $this.closest(".site-category").prev(".ui-accordion-header").trigger("click");
                        }
                });
        });
    }

    // Insert html content mini template into tinymce editor
    function insertMiniTemplate() {
        var $iframeDoc      = $("#preview-mini-template iframe").contents(),
            miniTemplate    = "",
            $previewContent = $iframeDoc.find(".mini-template-preview-content").first();

        if ($previewContent.length) {
            miniTemplate = $previewContent.html();
        } else {
            // Fallback for older preview markup
            var bodyEl = $iframeDoc.find("body")[0];
                miniTemplate = bodyEl ? bodyEl.innerHTML : "";
        }

        if (miniTemplate) {
            if (parent.tinymce && parent.tinymce.activeEditor) {
                parent.tinymce.activeEditor.focus();
                if (
                    parent.tinymce.activeEditor.__miniTemplateBookmark &&
                    parent.tinymce.activeEditor.selection &&
                    typeof parent.tinymce.activeEditor.selection.moveToBookmark === "function"
                ) {
                    try {
                        parent.tinymce.activeEditor.selection.moveToBookmark(parent.tinymce.activeEditor.__miniTemplateBookmark);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            parent.tinymce.activeEditor.insertContent(miniTemplate);
        }
        parent.tinymce.activeEditor.windowManager.close();
    }

    /**
     * Init template with mustach
     */
    $(function() {
        var data = {
            Cancel: parent.tinymce.util.I18n.translate("Cancel"),
            Insert: parent.tinymce.util.I18n.translate("Insert")
        };

        // Use jQuery's get method to retrieve the contents of our template file, then render the template.
        $.get("view/content-section.html", function(template) {
            $("#template-container").append(Mustache.render(template, data));
            setupPreviewViewport();

            processAjax();

            $("#insert-btn").on("click", insertMiniTemplate);

            $("#close-btn").on("click", function() {
                parent.tinymce.activeEditor.windowManager.close();
            });
        });
    });
}(jQuery));

window.extractTemplateBodyHtml = function(templateHtml) {
    var parser = new DOMParser(),
        tplDoc = parser.parseFromString(templateHtml, "text/html");

        $(tplDoc).find("link[rel='stylesheet'], style, script").remove();
    
        return tplDoc.body ? tplDoc.body.innerHTML : templateHtml;
};

window.resolvePreviewSourceDoc = function() {
    var isTextareaMode = false;

        // 1) page edition mode (iframe in active tab)
        try {
            if (window.parent && parent.activeTabId && window.parent.$) {
                var $frame = window.parent.$("#" + parent.activeTabId).find(".melis-iframe").first();
                    if ($frame.length && $frame[0].contentDocument) {
                        return $frame[0].contentDocument;
                    }
            }
        } catch (e) {
            console.error(e);
        }

        // 2) tinyMCE textarea/tool mode (inline false)
        try {
            if (window.parent && parent.tinymce && parent.tinymce.activeEditor) {
                if (parent.tinymce.activeEditor.inline === false) {
                    isTextareaMode = true;
                    return null;
                }

                if (typeof parent.tinymce.activeEditor.getDoc === "function") {
                    var editorDoc = parent.tinymce.activeEditor.getDoc();
                        if (editorDoc && editorDoc.documentElement) {
                            return editorDoc;
                        }
                }
            }
        } catch (e) {
            console.error(e);
        }

        // Prevent preview leakage from parent textarea/document context.
        if (isTextareaMode) {
            return null;
        }

        // 3) last fallback: parent document
        try {
            if (window.parent && window.parent.document && window.parent.document.documentElement) {
                return window.parent.document;
            }
        } catch (e) {
            console.error(e);
        }

        return null;
};

window.renderStandaloneMiniTemplatePreview = function(previewIframeEl, templateBodyHtml) {
    var outDoc = previewIframeEl.contentWindow.document;
    var standaloneHtml = [
        "<!DOCTYPE html>",
        "<html>",
        "<head>",
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        "<style>",
        "html, body { height: auto; min-height: 100%; overflow-y: auto; overflow-x: hidden; margin: 0; padding: 0; background: #fff; }",
        "body { padding: 1rem; box-sizing: border-box; }",
        ".mini-template-preview-content { width: 100%; }",
        "img { max-width: 100%; height: auto; }",
        "</style>",
        "</head>",
        "<body>",
        '<div class="mini-template-preview-content">' + templateBodyHtml + "</div>",
        "</body>",
        "</html>"
    ].join("");

    outDoc.open();
    outDoc.write(standaloneHtml);
    outDoc.close();
};

window.resolvePreviewShellUrl = function(shellUrl, previewConfig) {
    if (!shellUrl) {
        return "";
    }

    var resolvedSiteId      = previewConfig.site_id || "",
        resolvedSiteModule  = previewConfig.site_module || "";

    return shellUrl
        .replace("{siteId}", resolvedSiteId)
        .replace("{siteModule}", resolvedSiteModule);
};

window.renderTemplateWithRuntimeLayout = function(previewIframeEl, templateHtml) {
        var sourceDoc   = resolvePreviewSourceDoc(),
            parser      = new DOMParser(),
            tplDoc      = parser.parseFromString(templateHtml, "text/html");

            $(tplDoc).find("link[rel='stylesheet'], style, script").remove();

        var tplBodyHtml = tplDoc.body ? tplDoc.body.innerHTML : templateHtml;

            if (!sourceDoc || !sourceDoc.documentElement) {
                renderStandaloneMiniTemplatePreview(previewIframeEl, tplBodyHtml);
                return;
            }

        var pageDoc             = parser.parseFromString(sourceDoc.documentElement.outerHTML, "text/html"),
            dropzoneSelector    = ".melis-dragdropzone:first";

            if (parent.tinymce && parent.tinymce.activeEditor && parent.tinymce.activeEditor.options) {
                dropzoneSelector = parent.tinymce.activeEditor.options.get("mini_template_dropzone_selector") || dropzoneSelector;
            }

            removePreviewEditorArtifacts(pageDoc);           
            replaceOnlyPreviewDropzone(pageDoc, tplBodyHtml, dropzoneSelector);           
            ensureHeaderSpacer(pageDoc);            
            dedupeHeadStyles(pageDoc);          
            removeTinyMceAndMelisEditorScripts(pageDoc);           
            moveUniqueScriptsToFooter(pageDoc);
            enforcePreviewScrollStyles(pageDoc);           

        var outDoc = previewIframeEl.contentWindow.document;
            outDoc.open();
            outDoc.write("<!DOCTYPE html>\n" + pageDoc.documentElement.outerHTML);
            outDoc.close();
};

/**
 * Resolves site context for shell-based preview (tools, mini-template manager, etc.).
 * CMS page edition uses resolvePreviewSourceDoc() + renderTemplateWithRuntimeLayout() instead.
 */
window.parseSiteIdFromMiniTemplatesUrl = function() {
    try {
        if (parent.tinymce && parent.tinymce.activeEditor && parent.tinymce.activeEditor.options) {
            var templatesUrl = parent.tinymce.activeEditor.options.get("mini_templates_url") || "";
            if (templatesUrl && templatesUrl.indexOf("?") !== -1) {
                var params = new URLSearchParams(templatesUrl.split("?")[1] || "");
                return params.get("siteId") || "";
            }
        }
    } catch (e) {
        console.error(e);
    }

    return "";
};

window.getPreviewSiteContext = function() {
    var siteId = "",
        siteModule = "",
        editorOptions = null,
        miniTemplateConfig = {};

    try {
        if (parent.tinymce && parent.tinymce.activeEditor && parent.tinymce.activeEditor.options) {
            editorOptions = parent.tinymce.activeEditor.options;
            miniTemplateConfig = editorOptions.get("melis_minitemplate") || {};
            siteId = miniTemplateConfig.site_id || "";
            siteModule = editorOptions.get("mini_template_site_module") || "";
        }
    } catch (e) {
        console.error(e);
    }

    if (!siteId) {
        siteId = parseSiteIdFromMiniTemplatesUrl();
    }

    // Mini Template Manager and other Melis tools (textarea / inline: false).
    try {
        if (window.parent && window.parent.$) {
            var $parent = window.parent.$,
                $siteIdField = $parent("#mini-template-manager-site-id").first(),
                $siteModuleField = $parent("#miniTemplateSiteModule").first();

            if (!siteId && $siteIdField.length && $siteIdField.val()) {
                siteId = $siteIdField.val();
            }

            if (!siteModule && $siteModuleField.length && $siteModuleField.val()) {
                siteModule = $siteModuleField.val();
            }
        }
    } catch (e) {
        console.error(e);
    }

    siteModule = siteModule ||
        $("#accordion-mini-template .mini-template-button.active[data-type='mini-template']").first().data("module") ||
        $("#accordion-mini-template .mini-template-button[data-type='mini-template']").first().data("module") ||
        "";

    return {
        siteId: siteId ? String(siteId) : "",
        siteModule: siteModule ? String(siteModule) : ""
    };
};

window.getMiniTemplateManagerSiteId = function() {
    return getPreviewSiteContext().siteId;
};

window.getPreviewConfig = function() {
    var previewSiteContext  = getPreviewSiteContext(),
        editorOptions       = null;

        if (parent.tinymce && parent.tinymce.activeEditor && parent.tinymce.activeEditor.options) {
            editorOptions = parent.tinymce.activeEditor.options;
        }

        return {
            preview_mode: editorOptions ? (editorOptions.get("mini_template_preview_mode") || "auto") : "auto",
            preview_shell_url: editorOptions ? (editorOptions.get("mini_template_preview_shell_url") || "") : "",
            site_module: previewSiteContext.siteModule,
            site_id: previewSiteContext.siteId || null
        };
};

window.renderTemplateWithSiteShell = function(previewIframeEl, templateHtml, siteModule = null) {
    var previewConfig   = getPreviewConfig(),
        mode            = previewConfig.preview_mode || "auto",
        shellUrl        = resolvePreviewShellUrl(previewConfig.preview_shell_url || "", previewConfig);

        if (mode === "page_layout") {
            renderTemplateWithRuntimeLayout(previewIframeEl, templateHtml);
            return;
        }
        if (mode === "standalone") {
            // pass templateHtml without extractTemplateBodyHtml()
            renderStandaloneMiniTemplatePreview(previewIframeEl, templateHtml);
            return;
        }

    // CMS page edition (inline + melis-iframe): clone the live page layout with header/footer.
    var sourceDoc = resolvePreviewSourceDoc();
        if (sourceDoc && sourceDoc.documentElement && mode === "auto") {
            renderTemplateWithRuntimeLayout(previewIframeEl, templateHtml);
            return;
        }

        // Tools (Mini Template Manager, news, etc.): fetch front-office shell server-side.
        if (shellUrl) {
            var previewSiteContext = getPreviewSiteContext();
            $.ajax({
                type: "GET",
                url: shellUrl,
                dataType: "html",
                data: {
                    siteModule: siteModule || previewSiteContext.siteModule,
                    siteId: previewSiteContext.siteId
                },
                cache: false
            }).done(function(shellHtml) {
                renderTemplateWithFetchedShell(previewIframeEl, templateHtml, shellHtml);
            }).fail(function() {
                // fallback if shell fetch fails, no extractTemplateBodyHtml()
                renderStandaloneMiniTemplatePreview(previewIframeEl, templateHtml);
            });
            
            return;
        }
    
    // no extractTemplateBodyHtml()
    renderStandaloneMiniTemplatePreview(previewIframeEl, templateHtml);
};

window.renderTemplateWithFetchedShell = function(previewIframeEl, templateHtml, shellHtml) {
    var parser              = new DOMParser(),
        shellDoc            = parser.parseFromString(shellHtml, "text/html"),
        tplBodyHtml         = extractTemplateBodyHtml(templateHtml),
        dropzoneSelector    = ".melis-dragdropzone:first";

        if (parent.tinymce && parent.tinymce.activeEditor && parent.tinymce.activeEditor.options) {
            dropzoneSelector = parent.tinymce.activeEditor.options.get("mini_template_dropzone_selector") || dropzoneSelector;
        }
        
        removePreviewEditorArtifacts(shellDoc);   
        replaceOnlyPreviewDropzone(shellDoc, tplBodyHtml, dropzoneSelector);   
        ensureHeaderSpacer(shellDoc);   
        dedupeHeadStyles(shellDoc);    
        removeTinyMceAndMelisEditorScripts(shellDoc);    
        moveUniqueScriptsToFooter(shellDoc);    
        enforcePreviewScrollStyles(shellDoc);

    var outDoc = previewIframeEl.contentWindow.document;
        outDoc.open();
        outDoc.write("<!DOCTYPE html>\n" + shellDoc.documentElement.outerHTML);
        outDoc.close();
};

// remove preview editor artifacts
window.removePreviewEditorArtifacts = function(doc) {
    $(doc).find(".melis-plugin-tools-box, .m-plugin-sub-tools, .tox, .tox-tinymce-aux, .mce-tinymce").remove();
    $(doc).find(".melis-cms-dnd-box, #cmsPluginsMenuContent, #melisPluginBtn").remove();
    $(doc).find("textarea.tool-editable-selector, textarea.html-editable-selector").removeClass("tool-editable-selector html-editable-selector");
    $(doc).find("[contenteditable='true']").removeAttr("contenteditable");

    // remove editor classes
    $(doc).find(".melis-ui-outlined").removeClass("melis-ui-outlined");
    $(doc).find(".melis-plugin-indicator").remove();
    $(doc).find(".html-editable, .melis-editable").removeClass("html-editable, melis-editable");
};

window.ensureHeaderSpacer = function(doc) {
    var $existingSpacer = $(doc).find('div[style*="height: 93px"]').first();
        if ($existingSpacer.length) {
            return;
        }

    var $header     = $(doc).find("header:first"),
        spacerHtml  = '<div style="height: 93px"></div>';

        if ($header.length) {
            $(spacerHtml).insertAfter($header);
        } else {
            $(doc.body).prepend(spacerHtml);
        }
};

window.replaceOnlyPreviewDropzone = function(doc, templateBodyHtml, dropzoneSelector) {
    var $targetZone = $(doc).find(dropzoneSelector).first();
        if (!$targetZone.length) {
            $targetZone = $(doc).find(".dnd-plugins-content .melis-dragdropzone:first").first();
        }

        if ($targetZone.length) {
            //$targetZone.removeClass("no-content highlight content-added ui-sortable");
            //$targetZone.removeAttr("data-dragdropzone-id");
            $targetZone.html('<div class="mini-template-preview-content">' + templateBodyHtml + '</div>');
        } else {
            var $header             = $(doc).find("header:first"),
                $footer             = $(doc).find("footer:first"),
                replacementBlock    = '<div class="melis-dragdropzone"><div class="mini-template-preview-content">' + templateBodyHtml + '</div></div>';       

                if ($header.length && $footer.length) {
                    $header.nextUntil($footer).remove();
                    $(replacementBlock).insertAfter($header);
                    return;
                }

            var $contentTarget = $(doc).find("main:first, #content:first, .page-content:first, .content:first").first();
                if ($contentTarget.length) {
                    $contentTarget.html(replacementBlock);
                } else {
                    $(doc.body).html(replacementBlock);
                }
        }
};

window.dedupeHeadStyles = function(doc) {
    var seenHref = new Set();
        $(doc.head).find("link[rel='stylesheet']").each(function () {
            var href = (this.getAttribute("href") || "").trim();
                if (!href) return;
            var key = href.split("#")[0];
                if (seenHref.has(key)) {
                    $(this).remove();
                } else {
                    seenHref.add(key);
                }
        });
};

window.moveUniqueScriptsToFooter = function(doc) {
    var seenSrc         = new Set(),
        inlineSeen      = new Set(),
        $allScripts     = $(doc).find("script"),
        uniqueScripts   = [];

        $allScripts.each(function () {
            var src = (this.getAttribute("src") || "").trim();
                if (src) {
                    var key = src.split("#")[0];
                        if (!seenSrc.has(key)) {
                            seenSrc.add(key);
                            uniqueScripts.push(this.cloneNode(true));
                        }
                } else {
                    var txt = (this.textContent || "").trim();
                        if (txt && !inlineSeen.has(txt)) {
                            inlineSeen.add(txt);
                            uniqueScripts.push(this.cloneNode(true));
                        }
                }
        });

        $allScripts.remove();

        var body = doc.body || doc.documentElement;
            uniqueScripts.forEach(function (s) { body.appendChild(s); });
};

window.removeTinyMceAndMelisEditorScripts = function(doc) {
    $(doc).find("script").each(function () {
        var scriptId    = (this.getAttribute("id") || "").toLowerCase(),
            src         = (this.getAttribute("src") || "").toLowerCase(),
            txt         = (this.textContent || "").toLowerCase();

            if (
                scriptId === "jquery-checker" ||
                //src.indexOf("tinymce") !== -1 ||
                src.indexOf("melistinymce") !== -1 ||
                src.indexOf("melis-tinymce") !== -1 ||
                src.indexOf("/meliscore/js/tinymce/") !== -1 ||
                src.indexOf("/melisfront/plugins/js/") !== -1 ||
                src.indexOf("/meliscms/") !== -1 ||
                src.indexOf("dragndrop") !== -1 ||
                src.indexOf("findpage.tool.js") !== -1 ||
                src.indexOf("plugins.edition.js") !== -1 ||
                src.indexOf("front.pagelock.js") !== -1 ||
                src.indexOf("plugin.melisdragdropzone.js") !== -1 ||
                src.indexOf("plugin.melistagHTML.init.js") !== -1 ||
                src.indexOf("plugin.cmsslider.init.js") !== -1 ||
                src.indexOf("plugin.melisgdprbanner.init.js") !== -1 ||
                src.indexOf("plugin.related.data.js") !== -1 ||
                txt.indexOf("tinymce.init") !== -1 ||
                txt.indexOf("melistinymce") !== -1 ||
                txt.indexOf("melis_tinymce") !== -1 ||
                txt.indexOf("/meliscore/js/tinymce/") !== -1 ||
                txt.indexOf("/melisfront/plugins/js/") !== -1 ||
                txt.indexOf("melisdragdropzone") !== -1 ||
                txt.indexOf("melispluginedition") !== -1
            ) {
                $(this).remove();
            }
    });
};

window.enforcePreviewScrollStyles = function(doc) {
    var styleId = "mini-template-preview-scroll-style";
        if ($(doc.head).find("#" + styleId).length) {
            return;
        }

    var style = doc.createElement("style");
        style.id = styleId;
        style.type = "text/css";
        style.textContent = [
            "html, body {",
            "  height: auto !important;",
            "  min-height: 100% !important;",
            "  overflow-y: auto !important;",
            "  overflow-x: hidden !important;",
            "}",
            "body {",
            "  position: static !important;",
            "}"
        ].join("\n");

        doc.head.appendChild(style);
};
