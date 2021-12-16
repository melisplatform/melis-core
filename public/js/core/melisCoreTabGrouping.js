/**
 * Tab grouping v2
 * July 2021
 */
var melisCoreTabGrouping = (function($, window) {
    // variable declaration
	var $melisOpenTools = $(".sideMenu").find(".melis-opentools"),
        $navTabs        = $("#melis-id-nav-bar-tabs"),
        $coreDasboard   = $("#id_meliscore_leftmenu_dashboard"),
        //$siteTree       = $("#id-mod-menu-dynatree"),
        //$sites          = $siteTree.find("[role='treeitem']"), // treeview site
		//$sitePages      = $sites.find("[role='group'] [role='treeitem']"), // treeview site page
        mainMenuText    = $("#meliscore_toolstree_section").find("a > .toolstree-label").text(),
        $dashboardTab   = $("[data-tool-name='Dashboard']");

        /* 
        title           = 'Pages',
        icon            = 'fa-tachometer',
        zoneId          = 'id_meliscms_page_tab_list_container',
        melisKey        = 'meliscms_page_tab_list_container',
        navTabsGroup    = 'id_meliscms_page_tab_list_container', // Pages
        $navParentGroup = $(".tab-element[data-id='id_meliscms_tab_list_container']") */

        // functions / methods
        function init() {
            // left menu
            $coreDasboard.attr("data-main-menu", mainMenuText);
            
            // opened dashboard tab
            $dashboardTab.attr("data-tool-main-menu", mainMenuText); // $dashboardTab.attr("data-main-menu", mainMenuText);

            // console.log("addDataSiteMenuAttribute() $melisOpenTools.length: ", $melisOpenTools.length);
            // .melis-open-tools
            if ( $melisOpenTools.length ) {
                $.each( $melisOpenTools, function(i, v) {
                    var $menu           = $(v),
                        mainMenuText    = $menu.parents(".hasSubmenu").find("a > .toolstree-label").text();

                        $menu.attr("data-main-menu", mainMenuText);
                });
            }
        }

        // adds data menu attribute on the melis cms pages
        function addDataSiteMenuAttribute() {
            // console.log("addDataSiteMenuAttribute() !!!");
            var $siteTree       = $("#id-mod-menu-dynatree"),
                $sites          = $siteTree.find("[role='treeitem']"), // treeview site
                $sitePages      = $sites.find("[role='group'] [role='treeitem']"); // treeview site page

                // #id-mod-menu-dynatree, sites
                if ( $sites.length ) {
                    $.each( $sites, function(i, v) {
                        var $site           = $(v),
                            mainMenuAttr    = $site.attr("data-main-menu"),
                            subMenuAttr     = $site.attr("data-main-sub-menu"),
                            siteMenuText    = $site.parents(".hasSubmenu").find("a > .toolstree-label").text();

                            if ( typeof mainMenuAttr == "undefined" || mainMenuAttr == false ) {
                                $site.attr("data-main-menu", siteMenuText);
                            }
                           
                            if ( typeof subMenuAttr == "undefined" || subMenuAttr == false ) {
                                $site.attr("data-main-sub-menu", "Pages");
                            }
                    });
                }

                // console.log("$sitePages.length: ", $sitePages.length);

                // #id-mod-menu-dynatree, site pages
                /* if ( $sitePages.length ) {
                    // console.log("addDataSiteMenuAttribute() addDataSitePagesMenuAttribute() $sitesPages.length");

                    addDataSitePagesMenuAttribute( $sites );
                } */
        }

        function addDataSitePagesMenuAttribute( $sites ) {
            // console.log("addDataSitePagesMenuAttribute() !!!");
            var $sitePages = $sites.find("[role='group'] [role='treeitem']"); // treeview site page

                // site's pages
                $.each( $sitePages, function(i, v) {
                    var $page           = $(v),
                        mainMenuAttr    = $page.attr("data-main-menu"),
                        subMenuAttr     = $page.attr("data-main-sub-menu"),
                        siteMenuText    = $page.parent("[role=group]").closest("[role=treeitem]").parents(".hasSubmenu").find("a > .toolstree-label").text();

                        if ( typeof mainMenuAttr == "undefined" || mainMenuAttr == false ) {
                            $page.attr("data-main-menu", siteMenuText);
                        }

                        if ( typeof subMenuAttr == "undefined" || subMenuAttr == false ) {
                            $page.attr("data-main-sub-menu", "Pages");
                        }

                        console.log("addDataSitePagesMenuAttribute() siteMenuText: ", siteMenuText);
                });
        }

        // opening the melis cms page itself
        function openFancytreePage( pageName, data ) {
            var matches = pageName.match(/\d+/g);

                /* if ( matches != null && matches !== 'undefined' && matches !== undefined ) {

                } */

                // console.log("openFancytreePage() data.melisData: ", data.melisData);

                // if ( pageName )

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
                            // These is where adding of MelisCms even if naka undefined sa data-main-menu attribute
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

            var li = "<li class='has-sub sub-page-section-tab' data-tool-name='" + title + "' data-tool-icon='" + icon +"' data-tool-id='" + zoneId + "' data-tool-meliskey='" + melisKey + "' data-tool-main-sub-menu='" + title + "' data-tool-main-menu='MelisCms'>";
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
            openPageSubMenu : openPageSubMenu,
            addDataSiteMenuAttribute : addDataSiteMenuAttribute,
            addDataSitePagesMenuAttribute : addDataSitePagesMenuAttribute
        };
})(jQuery, window);