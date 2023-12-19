(function($) {
    // https://codepen.io/Elodieb/pen/OJyLxXm

    // return the selected mini template through select dropdown
    function getSelectedMiniTemplate() {
        var $selectedAccordion = $('.accordion dt');

            $selectedAccordion.on("click", function() {
                return $(this).data("url");
            });
    }

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
                        var dCategoryText = $(v).attr("title");
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

    // ajax
    function processAjax() {
        $.ajax({
            type: 'GET',
            url: '/melis/MelisCore/MelisTinyMce/getTinyTemplates',
            dataType: 'json',
            cache: false
        }).done(function(data) {
            // var uText = getUniqueText(data);
            setTimeout(function() {
                appendAccordion(data);
            }, 1000);
        }).fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
    }

    function siteNameHtml( siteName, index ) {
        return '<h3>'+ siteName +'</h3>' +
                '<div id="site-category-'+index+'" class="site-category accordion" data-site-name="'+ siteName +'"></div>';
    }

    function mainCategoryHtml( mainCategoryText, mainCategorySiteName, index ) {
        return '<h3>'+ mainCategoryText +'</h3>' +
                '<div id="main-category-'+index+'" class="main-category common-category" data-site-name="'+ mainCategorySiteName +'"></div>'; // data-cat-id="'+ categoryId +'
      }

    function otherCategoryHtml( otherCategory, otherCategorySiteName, index ) {
        return '<h3>'+ otherCategory +'</h3>' +
                '<div id="other-category-'+index+'" class="other-category common-category" data-site-name="'+ otherCategorySiteName +'"></div>';
    }

    function appendOtherCategoryToSiteCategory( $miniTemplateButtons ) {
        var $accordion              = $("#accordion-mini-template"),
            $siteCategory           = $(".site-category"),
            siteCategorySiteName    = $siteCategory.data('site-name');

            var countHashOccurrence = 0,
                countCategoryOccurrence = 0;

                // occurrences of # for .other-category, 
                $miniTemplateButtons.each(function(i, v) {
                    let $button     = $(v);
                        dParent     = $button.data('parent'),
                        dCategory   = $button.data('type');

                        if ( dParent === '#' ) {
                            countHashOccurrence++;
                        }

                        //console.log("appendOtherCategoryToSiteCategory() $miniTemplateButtons.each() dCategory: ", dCategory);
                        if ( dCategory === 'category' ) {
                            countCategoryOccurrence++;
                        }
                });

                //console.log("countHashOccurrence: ", countHashOccurrence);
                // .other-category
                if ( countHashOccurrence ) {
                    var uniqueSiteNames = getUniqueSiteName( $miniTemplateButtons );
                    for ( var index = 0; index < uniqueSiteNames.length; index++ ) {
                        var otherCategorySiteName   = uniqueSiteNames[index],
                            otherCategory           = 'Other Category', // translations.tr_meliscore_tinymce_mini_template_other_category,
                            otherCatHtml            = '';

                            otherCatHtml = otherCategoryHtml( otherCategory, otherCategorySiteName, index );

                            // append .other-category to the right .site-category
                            if ( siteCategorySiteName === otherCategorySiteName ) {
                                $accordion.find('.site-category').append( otherCatHtml );
                            }
                    }
                }

                //console.log("countCategoryOccurrence: ", countCategoryOccurrence);
                // .main-category
                if ( countCategoryOccurrence ) {
                    var uniqueSiteNames = getUniqueSiteName( $miniTemplateButtons );
                        for ( var index = 0; index < uniqueSiteNames.length; index++ ) {
                            var mainCategorySiteName    = uniqueSiteNames[index],
                                mainCatHtml             = '';

                                var uniqueMainCategoryText = getUniqueCategoryText( $miniTemplateButtons );
                                    for ( var j = 0; j < uniqueMainCategoryText.length; j++ ) {
                                        var mainCategoryText = uniqueMainCategoryText[j];

                                            // categoryId, refer to comment {template lists} template.id
                                            mainCatHtml = mainCategoryHtml( mainCategoryText, mainCategorySiteName, j );

                                            // append .other-category to the right .site-category
                                            if ( siteCategorySiteName === mainCategorySiteName ) {
                                                $accordion.find('.site-category').append( mainCatHtml );
                                            }
                                    }
                        }
                }
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
                            "class"           : 'mini-template-button', // d-none
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
                            "data-site-name"    : dSiteName
                        });
                    }

                    if ( dImageSource != '' ) {
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
                appendOtherCategoryToSiteCategory( $miniTemplateButtons );

                // re-arranging the mini template buttons to its own category based on data attributes
                $.each( $miniTemplateButtons, function(i, v) {
                    var $btn            = $(v),
                        title           = $btn.text(),
                        id              = $btn.data("id"),
                        parent          = $btn.data("parent"),
                        type            = $btn.data("type"),
                        siteName        = $btn.data("site-name"),
                        $otherCategory  = $(".other-category"),
                        $mainCategory   = $(".main-category");

                        /**
                         * Check if mini-template should be inside a main category or
                         * If parent == '#' means it is under .other-category
                         */
                        if ( parent === '#' ) {
                            // .other-category
                            $.each($otherCategory, function(i, v) {
                                var $otherCategoryElement = $(v),
                                    otherCategorySiteName = $otherCategoryElement.data("site-name");
                                    
                                    if ( siteName === otherCategorySiteName ) {
                                        $accordion.find('.other-category').append( $btn );
                                    }
                            });
                        }
                        else {
                            // for .main-category
                            $.each($mainCategory, function(i, v) {
                                var $mainCategoryElement = $(v),
                                    mainCategorySiteName = $mainCategoryElement.data('site-name');
                                    /* mainCategoryId = $mainCategoryElement.data("cat-id"), // data attribute value
                                    $mainCategoryId = $(".main-category[data-cat-id='"+mainCategoryId+"']"); // jQuery selector */

                                    /* if ( mainCategoryId === parent ) {
                                        $mainCategoryId.append( $btn );
                                    } */
                                    // console.log('appendAccordion() siteName === mainCategorySiteName: ', siteName === mainCategorySiteName);
                                    if ( siteName === mainCategorySiteName ) {
                                        $accordion.find('.main-category').append( $btn );
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

                // hightlight buttons
                highlightButtons($miniTemplateButtons);
    }

    // Insert html content mini template into tinymce editor
    function run() {
        var tinymceData = getSelectedMiniTemplate();
            if ( tinymceData ) {
                parent.tinymce.activeEditor.insertContent(tinymceData);
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

            //setTimeout(function() {
                processAjax();    
            //}, 1000);

            $("#insert-btn").on("click", run);

            $("#close-btn").on("click", function() {
                parent.tinymce.activeEditor.windowManager.close();
            });
        });
    });
}(jQuery));