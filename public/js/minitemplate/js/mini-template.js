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
        var options = parent.tinymce.activeEditor.options.get("plugins");
        var miniTemplateUrl = parent.tinymce.activeEditor.options.get("mini_templates_url");
            console.log({options});
            console.log({miniTemplateUrl});
            $.ajax({
                type: 'GET',
                url: parent.tinymce.activeEditor.options.get("mini_templates_url"),
                dataType: 'json',
                cache: false
            })
            .done(function(data) {
                console.log(`processAjax() data: `, data);
                setTimeout(function() {
                    appendAccordion(data);
                }, 1000);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                // console.log(`translations: `, translations);
                // alert( translations.tr_meliscore_error_message );
                alert(parent.tinymce.util.I18n.translate('Error'));
            });
    }

    // accordion
    function appendAccordion(data) {
        var $accordion = $("#accordion-mini-template");
            
            // template lists
            for ( var i = 0; i < data.length; i++ ) {
                var template        = data[i],
                    dId             = template.id,
                    dParent         = template.parent,
                    dText           = template.text,
                    dType           = template.type,
                    dModule         = template.module,
                    dSiteName       = template.site_name,
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

                                    $this.toggleClass("active").siblings().removeClass("active");

                                    /**
                                     * For the issue on displaying all available mini templates.
                                     * Some button when clicked it closes the accordion
                                     */
                                    if ( $this.hasClass( 'ui-accordion-header' ) ) {
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
                });

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

                $(".accordion").niceScroll({cursorcolor:"#CB4040", cursorborder: "#CB4040"});

                $("body").on("click", ".ui-accordion-header", function() {
                    $(".accordion").getNiceScroll().resize();
                });

                // hightlight buttons
                highlightButtons($miniTemplateButtons);

                // get selected mini template form .mini-template-button
                getSelectedMiniTemplate($miniTemplateButtons);
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
                        siteHtml = siteNameHtml( siteName, index );
                        $accordion.prepend( siteHtml );
                    }      
            }
    }

    function appendMainCategoryToSiteCategory( $miniTemplateButtons ) {
        var $accordion              = $("#accordion-mini-template"),
            $siteCategory           = $(".site-category"),
            siteCategorySiteName    = $siteCategory.data('site-name');

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
                        for ( var index = 0; index < uniqueSiteNames.length; index++ ) {
                            var mainCategorySiteName    = uniqueSiteNames[index],
                                mainCatHtml             = '';

                                var uniqueMainCategoryText = getUniqueCategoryText( $miniTemplateButtons );
                                var ids = uniqueTypeCategoryIds();
                                    for ( var i = 0; i < ids.length; i++ ) {
                                        var mainCategoryText = uniqueMainCategoryText[i];
                                            // categoryId, refer to comment {template lists} template.id
                                            mainCatHtml = mainCategoryHtml( mainCategoryText, mainCategorySiteName, ids[i], i );
    
                                            // append .main-category to the right .site-category
                                            if ( siteCategorySiteName === mainCategorySiteName ) {
                                                $accordion.find('.site-category').append( mainCatHtml );
                                            }
                                    }
                        }
                }
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
                    var $mainCategoryBtn = $("#accordion-mini-template > .site-category.ui-accordion-content-active .main-category > .mini-template-button:first-child"),
                        miniTemplateBtnDataUrl = "";

                        // with .main-category
                        if ( $mainCategoryBtn.length ) {
                            miniTemplateBtnDataUrl = $mainCategoryBtn.data("url");
                        }
                        // no .main-category
                        else {
                            var $siteCategoryChildBtn = $("#accordion-mini-template > .site-category.ui-accordion-content-active > .mini-template-button:first-child");
                                miniTemplateBtnDataUrl = $siteCategoryChildBtn.data("url");
                        }

                        previewMiniTemplate( miniTemplateBtnDataUrl );
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

                        $btn.on("click", function() {
                            previewMiniTemplate( $(this).data("url") );
                        });
                });
        }, 1000);
    }

    // displays mini template in iframe
    function previewMiniTemplate(url) {
        var $preview    = $("#preview-mini-template"),
            $prevIframe = $preview.find(".preview-iframe");

            if ( $prevIframe.length ) {
                $prevIframe.attr("src", url);

                // melis-demo-cms or melis-demo-commerce
                insertDemoMiniTemplateCss();
            }
    }

    // insertion of melis-demo-cms mini template css in iframe head
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

    function siteNameHtml( siteName, index ) {
        return '<h3>'+ siteName +'</h3>' +
                '<div id="site-category-'+index+'" class="site-category accordion" data-site-name="'+ siteName +'"></div>';
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
                 * Loop through the class lists and compare with classes to be removed
                 */
                /*  for ( var i = 0; i < classList.length; i++ ) {
                    for ( var j = 0; j < classesToRemoved.length; j++ ) {
                    if ( classList[i] == classesToRemoved[j] ) {
                        $elem.removeClass( classList[i] ); */
                        /**
                         * Replace with classes to add
                         */
                        /* for ( var k = 0; k < classesToAdd.length; k++ ) {
                        $elem.addClass( classesToAdd[k] );
                        } */
                    /* }
                    }
                } */

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

                        $this.toggleClass("active").siblings().removeClass("active");

                        /**
                         * For the issue on displaying all available mini templates.
                         * Some button when clicked it closes the accordion
                         */
                        if ( $this.hasClass( 'ui-accordion-header' ) ) {
                            $this.closest(".site-category").prev(".ui-accordion-header").trigger("click");
                        }
                });
        });
    }

    // Insert html content mini template into tinymce editor
    function insertMiniTemplate() {
        var miniTemplate = $("#preview-mini-template iframe").contents().find("body")[0].innerHTML;
            if ( miniTemplate ) {
                parent.tinymce.activeEditor.insertContent(miniTemplate);
            }
            parent.tinymce.activeEditor.windowManager.close();
    }

    // initialize
    /* function initIframe() {
        var $iframe = $("#preview-mini-template iframe");

            // insertion of melis-demo-cms mini template css in iframe head
            if ( $iframe.length ) {
                insertMelisDemoCmsMiniTemplateCss();
            }
    } */

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

            processAjax();

            $("#insert-btn").on("click", insertMiniTemplate);

            $("#close-btn").on("click", function() {
                parent.tinymce.activeEditor.windowManager.close();
            });
        });
    });
}(jQuery));