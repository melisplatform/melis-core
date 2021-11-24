/**
 * Tab grouping v2
 * July 2021
 */
var melisCoreTabGrouping = (function($, window) {
    // variable declaration
	var $melisOpenTools = $(".sideMenu").find(".melis-opentools"),
        $navTabs        = $("#melis-id-nav-bar-tabs"),
        $coreDasboard   = $("#id_meliscore_leftmenu_dashboard");

        /* title           = 'Pages',
        icon            = 'fa-tachometer',
        zoneId          = 'id_meliscms_page_tab_list_container',
        melisKey        = 'meliscms_page_tab_list_container',
        navTabsGroup    = 'id_meliscms_page_tab_list_container', // Pages
        $navParentGroup = $(".tab-element[data-id='id_meliscms_tab_list_container']") */

        // functions / methods
        function init() {
            var mainMenuText    = $("#meliscore_toolstree_section").find("a > .toolstree-label").text(),
                $dashboardTab   = $("[data-tool-name='Dashboard']");

                // .melis-open-tools
                $.each( $melisOpenTools, function(i, v) {
                    var $menu           = $(v),
                        main_menu_text  = $menu.parents(".hasSubmenu").find("a > .toolstree-label").text();

                        $menu.attr("data-main-menu", main_menu_text);
                });

                // left menu
                $coreDasboard.attr("data-main-menu", mainMenuText);
                
                // opened dashboard tab
                $dashboardTab.attr("data-tool-main-menu", mainMenuText);
        }

        // opening the melis cms page itself
        function openFancytreePage( pageName, data ) {
            // console.log("openFancytreePage() data: ", data);
			// title, icon, zoneId, melisKey, parameters, navTabsGroup, mainMenu, callback
			melisHelper.tabOpen( pageName, data.iconTab, data.melisData.item_zoneid, data.melisData.item_melisKey, { idPage: data.melisData.page_id }, 'id_meliscms_page_tab_list_container', 'Pages', function() {

                // opening of page sub menu
                openPageSubMenu();

                // console.log("openFancytreePage melisKey: ", data.melisData.item_melisKey);
                melisCms.pageTabOpenCallback(data.melisData.page_id);

                // show page loader, melis-core/public/js/loader.js
                loader.addActivePageEditionLoading( data.melisData.item_zoneid );
			});
		}

        // opening of page sub menu under MelisCms
        function openPageSubMenu() {
            /**
             * data.iconTab : "fa fa-home"
             * data.melisData.item_zoneid : "1_id_meliscms_page"
             * data.melisData.item_melisKey : "meliscms_page",
             * { idPage: data.melisData.page_id : "1" } parameter
             */
            var $navParentGroup = $(".tab-element[data-id='id_meliscms_tab_list_container']"),
                $navMenus       = $("#melis-id-nav-bar-tabs > li");

                // if ( $navMenus.length > 7 ) {
                    if ( $navParentGroup.length ) {
                        // addPageSectionMenu();
                        checkPageSubMenu();
                    }
                    else {
                        // console.log("$navMenus.length: ", $navMenus.length);
                        if ( $navMenus.length > 7 ) {
                            // title, icon, zoneId, melisKey, parameters, navTabsGroup, mainMenu, callback
                            melisHelper.tabOpen('MelisCms', 'fa-tachometer', 'id_meliscms_tab_list_container', 'meliscms_tab_list_container', '', 'MelisCms');
                            // addPageSectionMenu();
                            checkPageSubMenu();
                        }
                    }
                // }
        }

        // page section sub menu
        function checkPageSubMenu() {
            // check if parent group is opened, Pages
            var $melisCmsMenu       = $(".tab-element[data-id='id_meliscms_tab_list_container']"),
                $navTabCmsPage      = $("#melis-id-nav-bar-tabs").find("li[data-tool-meliskey='meliscms_page']");

            var title               = 'Pages',
                mainMenu 		    = title,
                icon                = 'fa-tachometer',
                zoneId              = 'id_meliscms_page_tab_list_container',
                melisKey            = 'meliscms_page_tab_list_container',
                navTabsGroup        = zoneId;

            var li = "<li class='has-sub sub-page-section-tab' data-tool-name='" + title + "' data-tool-icon='" + icon +"' data-tool-id='" + zoneId + "' data-tool-meliskey='" + melisKey + "' data-tool-main-sub-menu='" + title + "'>";
                li += "<a data-toggle='tab' class='dropdown-toggle menu-icon tab-element' href='#" + zoneId + "' data-id='" + zoneId + "' title='" + title.replace(/'/g, "&apos;") + "'>";
                li += "<i class='fa " + icon + " fa-2x'></i><span class='navtab-pagename'>";
                li += title + "</span></a>";
                li += "<a class='close close-tab' data-id='" + zoneId + "'>" + translations.tr_meliscore_notification_modal_Close + "</a>";
                li += "</li>";

                /**
                 * Work on having only the melis cms page 1 and 7 melis core tools opened
                 */
                
                if ( $melisCmsMenu.length ) {
                    var $pagesGroupBox    = $melisCmsMenu.closest("li"),
                        $pagesHasDropdown = $pagesGroupBox.find(".nav-group-dropdown"),
                        $subPagesGroup    = $(".tab-element[data-id='id_meliscms_page_tab_list_container']");
                        
                        if ( $pagesHasDropdown.length ) {
                            // check if menu are to many
                            if ( $pagesHasDropdown.first().height() > 350 ) {
                                $pagesHasDropdown.first().addClass("scroll");
                            }

                            // add pages li in the first nav-group-dropdown
                            // $hasdropdown.first().append(li);
                            if ( ! $subPagesGroup.closest("li").length && $navTabs.find("li[data-tool-meliskey='meliscms_page']").length ) {
                                $pagesHasDropdown.prepend(li);
                            }
                        
                            // add pages li in .nav-group-dropdown
                            appendPageSubMenus( $navTabCmsPage );
                        }
                        else {
                            // create a sub menu ul and append the pages li
                            $pagesGroupBox.append("<ul class='nav-group-dropdown'></ul>");

                            if ( ! $subPagesGroup.closest("li").length && $navTabs.find("li[data-tool-meliskey='meliscms_page']").length ) {
                                $pagesGroupBox.find(".nav-group-dropdown").prepend(li);
                            }

                            // add pages li in .nav-group-dropdown
                            appendPageSubMenus( $navTabCmsPage );
                        }
                }
        }

        // append page sub menus
        function appendPageSubMenus( $pages ) {
            // console.log("appendPageSubMenus() !!!");
            var $subPagesGroup    = $(".tab-element[data-id='id_meliscms_page_tab_list_container']"),
                $subPagesBox      = $subPagesGroup.closest("li");
                // console.log("$subPagesGroup.length: ", $subPagesGroup.length);
                if ( $subPagesGroup.length ) {
                    var $subPagesDropdown = $subPagesBox.find(".nav-group-dropdown");
                        // console.log("$subPagesDropdown.length: ", $subPagesDropdown.length);
                        if ( $subPagesDropdown.length ) {
                            if ( $subPagesDropdown.first().height() > 350 ) {
                                $subPagesDropdown.first().addClass("scroll");
                            }
                        }
                        else {
                            $subPagesBox.append("<ul class='nav-group-dropdown'></ul>");
                        }
                }
            
                $.each( $pages, function(i, v) {
                    var $page       = $(v),
                        pageData    = $page.data();

                        if ( pageData.toolMeliskey === 'meliscms_page' ) {
                            $.each( $subPagesBox, function(i, v) {
                                var $subPageBox = $(v),
                                    subPageData = $subPageBox.data();

                                    if ( pageData.toolMainSubMenu === subPageData.toolMainSubMenu ) {                                      
                                        $subPageBox.find(".nav-group-dropdown").append( $page );
                                    }
                            });
                        }
                });
        }

        // inits and events
        init();

        return {
            openFancytreePage : openFancytreePage,
            openPageSubMenu : openPageSubMenu
        };
})(jQuery, window);