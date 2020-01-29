// GLOABAL SCOPE / GLOBAL VARIABLES ===================================================================================================

// current tab open
var activeTabId;

//Melis Core Functionalities
var melisCore = (function(window){

    var version = "2.0.0";

    //CACHE SELECTORS =================================================================================================================
    var $body           = $("body"),
        $navTabs        = $("#melis-id-nav-bar-tabs"),
        $flashMessenger = $("#flash-messenger"),
        $centerContent  = $("#melis-id-body-content-load"),
        screenSize      = jQuery(window).width(),

        // responsive menu 767px, tablet and phone
        $header         = $("#id_meliscore_header"),
        $res            = $("#res-page-cont"),
        $resArrow       = $("#res-page-cont span i"),
        $tabConOuter    = $("#melis-navtabs-container-outer"),
        $tabConInner    = $("#melis-navtabs-container-inner"),
        $tabArrowTop    = $("#tab-arrow-top"),
        $pluginBtn      = $("#melisDashBoardPluginBtn"),
        $pluginBox      = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
        // fixes conlict between jquery ui and bootstrap same function name .tooltip()
        jqeBsTooltip    = $.fn.tooltip.noConflict();

    $.fn.tlp = jqeBsTooltip;

    // MAIN FUNCTIONS =================================================================================================================

    // CHANGE LANGUAGE
    window.melisChangeLanguage = function(langId){
        var datastring = { langId: langId };
        $.ajax({
            type        : 'GET',
            url         : '/melis/change-language',
            data        : datastring,
            dataType    : 'json',
            encode      : true
        }).done(function(data) {
            if (data.success){
                location.reload();
            }
            else{
                alert( translations.tr_meliscore_error_language );
            }
        }).fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
    }

    // REQUEST LOST PASSWORD
    $('#idformmeliscoreforgot').submit(function(event) {
        var datastring = $("#idformmeliscoreforgot").serialize();

        $.ajax({
            type        : 'POST',
            url         : '/melis/lost-password-request',
            data        : datastring,
            dataType    : 'json',
            encode      : true
        }).done(function(data) {
            if (data.success) {
                melisTool.alerts.showSuccess('#lostpassprompt', "", data.message);
                $('#idformmeliscoreforgot')[0].reset();
            }
            else{
                melisTool.alerts.showDanger('#lostpassprompt', translations.tr_meliscore_common_error+"!", data.message);
            }
        }).fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
        event.preventDefault();
    });

    function sessionCheck() {
        var isLoading = $('body #loader').length;
        if (!isLoading) {
            isLogin();
            var checkEvery = 1;
            setInterval(function() {
                isLogin();
            }, (checkEvery * 60) * 1000);
        }
    }
    
    function isLogin() {
    	$.ajax({
            type: 'GET',
            url: '/melis/islogin',
            dataType: 'json'
        }).done(function(data) {
            if(!data.login) {
                window.location.reload(true);
            }
        }).fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
    }

    function escapeHtml (string) {
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

        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
    }

    // FLASH MESSENGER
    function flashMessenger() {
        $.ajax({
            type: 'GET',
            url: '/melis/MelisCore/MelisFlashMessenger/getflashMessage',
            dataType: 'json'
        }).done(function(data) {
            // check if there is a flash message
            if(data.flashMessage.length) {
                $flashMessenger.removeClass("empty-notif");
                $body.find("#flash-messenger").prev().find(".badge").removeClass("hidden");

                var ctr = 0;
                $body.find("#flash-messenger").empty();
                var tempData = '';
                var clearData = "<li style='border-left: 0 solid #ce5459;'><button id='clearNotifBtn' class='btn btn-primary' style='width:100%; border-width:0'>"+translations.tr_meliscore_clear_notifications+"</button></li>";
                $.each(data, function(index, element) {
                    $.each(element, function(index, fm){
                        tempData += "" +
                            "<li>" +
                            "	<span class='rounded-circle media-object "+fm.image+"'></span>" +
                            "   <div class='media'>" +
                            "       <div class='media-body'>" +
                            "           <a  class='strong text-primary'>"+(fm.title)+"</a><span class='time-email'>"+fm.date_trans+' '+fm.time+"</span>" +
                            "<div class='clearfix'></div>"+(fm.message)+
                            "</div>" +
                            "</div>" +
                            "</li>";
                        ctr++;
                    });
                });
                $body.find("#flash-messenger").append(clearData);
                $body.find("#flash-messenger").append(tempData);
                $body.find("#id_meliscore_header_flash_messenger.dropdown.notification a span.badge").text(ctr);
            }
        }).fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
    }

    $body.on("click", "#btnResetRights", function(){

        melisCoreTool.pending("#btnResetRights");

        melisCoreTool.confirm(
            translations.tr_meliscmsnews_common_label_yes,
            translations.tr_meliscmsnews_common_label_no,
            translations.tr_meliscore_tool_user_reset_rights,
            translations.tr_meliscmsnews_common_label_reset_rights_msg,
            function () {
                resetUserRights();
            });

        melisCoreTool.done("#btnResetRights");
    });
    $body.on("click", "#btnResetRightsNew", function(){

        melisCoreTool.pending("#btnResetRightsNew");

        melisCoreTool.confirm(
            translations.tr_meliscmsnews_common_label_yes,
            translations.tr_meliscmsnews_common_label_no,
            translations.tr_meliscore_tool_user_reset_rights,
            translations.tr_meliscmsnews_common_label_reset_rights_msg,
            function () {
                var tree = $("#new-rights-fancytree").fancytree("getTree");
                tree.findAll(function(node){
                    if(node.isSelected() === true){
                        node.setSelected(false);
                    }
                });
            });

        melisCoreTool.done("#btnResetRightsNew");
    });

    function resetUserRights () {
        var tree = $("#rights-fancytree").fancytree("getTree");
        tree.findAll(function(node){
            if(node.isSelected() === true){
                node.setSelected(false);
            }
        });
        var formData= new FormData();
        formData.append("usr_id", $("#edituserid").html());
        var ctr = 0;
        $.each(userRightsData, function (i, e) {
            $.each(e, function (a, b) {
                formData.append(a, JSON.stringify(userRightsData[ctr]));
            });
            ctr++;
        });
        $.ajax({
            type: 'POST',
            url: '/melis/MelisCore/ToolUser/resetUserRights',
            data: formData,
            processData: false,
            cache: false,
            contentType: false,
            dataType: 'json',
        }).done(function (data) {
            if(data.success){
                if($("#user-name-link").attr("data-user-id") === $("#edituserid").html())
                    melisHelper.zoneReload("id_meliscore_leftmenu","meliscore_leftmenu");
                getRightsTree($("#edituserid").html());
                // call melisOkNotification
                melisHelper.melisOkNotification(data.textTitle, data.textMessage, '#72af46' );
                // update flash messenger values
                melisCore.flashMessenger();
            }
        }).fail(function () {

        });
    }

    $body.find("#id_meliscore_header_flash_messenger").mouseleave(function () {
        if( $body.find("#flash-messenger").prev().find(".badge").hasClass("hidden") === false )
            $body.find("#flash-messenger").prev().find(".badge").addClass("hidden");
    });

    $body.on("click", "#clearNotifBtn", function(){
        clearFlashMessages();
    });

    function clearFlashMessages() {
        $.ajax({
            type: 'GET',
            url: '/melis/MelisCore/MelisFlashMessenger/clearFlashMessage',
            dataType: 'json'
        }).done(function(data) {
            if(data.flashMessage) {
                if( $flashMessenger.hasClass("empty-notif") === false )
                    $flashMessenger.addClass("empty-notif");
                if( $body.find("#flash-messenger").prev().find(".badge").hasClass("hidden") === false )
                    $body.find("#flash-messenger").prev().find(".badge").addClass("hidden");

                $body.find("#flash-messenger").empty();
                tempData = "" +
                    '<li class="empty-notif-li">' +
                    '<div class="media">' +
                    "<span>"+data.trans+"</span>" +
                    '</div>' +
                    '</li>';
                $body.find("#flash-messenger").append(tempData);
            }
        }).fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
    }

    // FIRST RENDER - runs when the page is first loaded
    function firstRender() {
        $(".nav-tabs li:first-child").addClass("active")
        $(".tab-content > div:first-child").addClass("active");

        if ( screenSize <= 767 && $tabArrowTop.length > 0 && $pluginBox.hasClass("shown") ) {
            $tabArrowTop.addClass("hide-arrow");
        }
    }

    // OPEN TOOLS - opens the tools from the sidebar
    function openTools(){
        var data = $(this).data();
        melisHelper.tabOpen( data.toolName, data.toolIcon, data.toolId, data.toolMeliskey, '', data.toolParentMenu);
    }

    // OPEN DASHBOARD - opens the dashboard from the sidebar
    function openDashboard() {
        // responsive, on 767px and below
        /* if ( activeTabId === "id_meliscore_toolstree_section_dashboard" ) {
            $("#sidebar-menu").trigger("click");
        } */
        melisHelper.tabOpen( 'Dashboard', 'fa-dashboard',  "id_meliscore_toolstree_section_dashboard", "meliscore_dashboard", {dashboardId : "id_meliscore_toolstree_section_dashboard"});
    }

    // REFRESH DASHBOARD ITEMS - refreshes the dashboard widgets
    function refreshZone() {
        var melisKey = $(this).closest("div.widget-parent").data("meliskey");
        var zoneId = $(this).closest("div.widget-parent").attr("id");
        melisHelper.zoneReload(zoneId, melisKey);
    }

    // REFRESH TABLE ITEMS
    function refreshTable() {
        var melisKey = $(this).parents(".container-level-a").data("meliskey");
        var zoneId = $(this).parents(".container-level-a").attr("id");
        melisHelper.zoneReload(zoneId, melisKey);
    }

    // SIDEBAR MENU CLICK (toggle), .toggle-sidebar
    function sidebarMenuClick() {
        // for the sidebar functionalities
        var $melisLeftMenu      = $("#id_meliscore_leftmenu"),
            $melisContent       = $("#content"),
            $melisFooter        = $("#id_meliscore_footer"),
            sidebarOffsetLeft   = $melisLeftMenu.position().left,
            sidebarWidth        = $melisLeftMenu.outerWidth(),
            contentOffsetLeft   = $melisContent.position().left,
            contentWidth        = $melisContent.outerWidth();

        if ( sidebarOffsetLeft == 0 ) {
            $melisLeftMenu.css("left", -sidebarWidth );
            $body.addClass('sidebar-mini');

            $melisFooter.addClass('slide-left');
            //$melisContent.closest(".col").removeClass("col-md-7 col-lg-10").addClass("col-12");
        }
        else {
            $melisLeftMenu.css("left", "0");
            $body.removeClass('sidebar-mini');
            $melisFooter.removeClass('slide-left');
            //$melisContent.closest(".col").removeClass("col-12").addClass("col-md-7 col-lg-10");
        }

        $("#newplugin-cont").removeClass("show-menu");

        // HOOK - scroll the page by 1px to trigger the scroll event that resizes the pageActions container
        // check if activeTabId has a number. if it has then we assume its a page
        var matches = activeTabId.match(/\d+/g);
        
        if (matches != null && matches !== 'undefined') {
            $("html, body").animate({scrollTop: jQuery(window).scrollTop()+1 },0);
        }

        // fix for the iframe height scrollbar issue when we open/close the sidebar. the timeout is for the sidebar transition
        setTimeout(function(){
            var $f = $("#"+ activeTabId + " .melis-iframe");

            if( $($f).length ) {
                $f[0].contentWindow.melisPluginEdition.calcFrameHeight();  //works
            }
            // dataTable responsive plugin ----=[ PLUGIN BUG FIX ]=-----
            $("table.dataTable").DataTable().columns.adjust().responsive.recalc();
        }, 1000);
    }

    /* if ( typeof melisDashBoardDragnDrop === 'undefined' )
        $("#disable-left-menu-overlay").show(); */

    // MAIN TAB MENU CLICK - run codes when a tab in the main tab menu is clicked
    function tabMenuClick() {
        var $this           = $(this),
            tabContentID    = $this.data("id"),
            $tabLi          = $this.closest("li"),
            meliskey        = $tabLi.data("tool-meliskey"),
            $tabContent     = $("#"+tabContentID+".tab-panel-dashboard");
            
            // assign active tab id
            activeTabId = tabContentID;

            // remove all active and active-parent class
            $("#melis-id-nav-bar-tabs li").each(function() {
                $this.removeClass("active");
                $this.removeClass("active-parent on");
            });

            // highlight all parents li of selected element
            $this.closest("li").addClass("active").parents("li").addClass("active-parent on");

            // iframe height issue in pages
            if ($.browser) {
                // Firefox bug issue temp fix
                var iHeight;
                setTimeout(function(){
                    iHeight = $("#"+activeTabId+" .melis-iframe").contents().find("html").height();
                    $("#"+activeTabId+" .melis-iframe").height(iHeight);
                }, 1);
            }
            else{
                var iHeight = $("#"+activeTabId+" .melis-iframe").contents().find("html").height();
                $("#"+activeTabId+" .melis-iframe").height( iHeight+20 );
            }

            // if in mobile hide 'PAGES' menu when clicking / opening a page
            if(screenSize <= 767){ //if(screenSize <= 768)
                $("#res-page-cont").trigger('click');
                $("#res-page-cont i").removeClass("move-arrow");

                if ( $tabArrowTop.length ) {
                    $tabArrowTop.removeClass("hide-arrow");
                }

                $('html, body').animate({scrollTop:0},500);
            }

            // scroll top every time we click a tab to RESET the scrollbars and return page actions to original position
            $("#"+ activeTabId + " .page-head-container").removeAttr("style");
            $("#"+ activeTabId + " .page-head-container > .innerAll").removeClass('sticky-pageactions');
            $("#"+ activeTabId + " .page-head-container > .innerAll").removeAttr("style");
            $('html, body').animate({scrollTop:0},0);

            // dataTable responsive plugin ----=[ PLUGIN BUG FIX ]=-----
            $("table.dataTable").DataTable().columns.adjust().responsive.recalc();

            // detect dashboard tab panel
            if( $("#"+activeTabId).hasClass("tab-panel-dashboard") ) {
                // show dashboard plugin menu
                $("body .melis-core-dashboard-dnd-box").fadeIn();
                $("body .melis-core-dashboard-dnd-box.show").fadeIn();
            } else {
                // hide dashboard plugin menu
                $("body .melis-core-dashboard-dnd-box").fadeOut();
                $("body .melis-core-dashboard-dnd-box.show").fadeOut();
            }

            // data-tool-meliskey="meliscore_dashboard"
            if ( meliskey === 'meliscore_dashboard' && ! $tabLi.hasClass("active") && $pluginBox.hasClass("shown") ) {
                $pluginBox.removeClass("shown");
            }
            
            // switch to the clicked tab and also the tab container
            melisHelper.tabSwitch( activeTabId );
            
            /*
             * Check current dashboard and make necessary adjustments
             * like .grid-stack width in connection with plugin menu box
             */
            if ( $tabContent.hasClass("active") && typeof melisDashBoardDragnDrop !== "undefined" ) {
                melisDashBoardDragnDrop.checkDashboard();
            }
    }

    /*
     * This function will close all opened tabs
     */
    function closedOpenTabs() {
        var listData = $("#melis-id-nav-bar-tabs li");
        // loop all tab list
        listData.each(function() {
            var dataID =  $(this).attr('data-tool-id');
            if ( dataID !== "id_meliscore_toolstree_section_dashboard" ) {
                melisHelper.tabClose(dataID);
            }
        });
        // detect if mobile / tablet
        if( screenSize <= 767 ) {
            $("#newplugin-cont").toggleClass("show-menu");
        }
        $("#close-all-tab").hide();        
    }

    // --=[ MULTI LAYER MODAL FEATURE ]=--
    $(document).on('show.bs.modal', '.modal', function (event) {
        // id_meliscms_find_page_tree_container 10001
        // modal-backdrop 10000
        // fix for z-index issue on blog/news comments add comment, $(".meliscms_center_tabs[data-meliskey='melissb_page_comments']").find(".active")
        var id = $(this)[0].id;

            if ( id === "id_meliscms_find_page_tree_container" ) {
                setTimeout(function() {
                    $(this).css('z-index', 10001);
                    $('.modal-backdrop').not('.modal-stack').css('z-index', 10000).addClass('modal-stack');
                }, 100);
            } 
            else {
                var zIndex = 1040 + (10 * $('.modal:visible').length);
                $(this).css('z-index', zIndex);
                setTimeout(function() {
                    $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
                }, 0);
            }
    });

    // ---=[ MODAL BUGFIX ]=--- for showing 2 level modals
    $(document).on('hidden.bs.modal', '.modal', function (event) {
        var check = $body.find(".modal-backdrop").length; // .modal-backdrop
        if(check){
            $body.addClass("modal-open");
        }
        else{
            if (document.documentMode || /Edge/.test(navigator.userAgent)) {
                var scrollTop = $('html, body').scrollTop();

                // remove flickering issue on edge
                $('html').css({'height': '100%'});
                $body.css('overflow', 'auto');
                    setTimeout(function() {
                        $('html, body').scrollTop(scrollTop);
                    }, 300);
                }
            // clear melis modals container
            $("#melis-modals-container").empty();
        }
    });

    // ---=[ START ]=--- MULTI VALUE INPUT FILED JS --------------------------------------------------

    // focus the tag box when we click
    $body.on("click", ".multi-value-input", function(){
        $(this).find(".tag-creator input").focus();
    });

    // remove a specific tag
    $body.on("click", ".multi-value-input .remove-tag", function(){
        var that = $(this).parents('.multi-value-input');
        $(this).parent('li').fadeOut(500, function(){  // run it when the fadeOut completes the action

            $(this).remove();

            // get all datas
            var tagDatas = [];
            that.children('li:not(:last-child)').each(function(index){
                tagDatas.push( $(this).children('span').text() );
            });

            // set the datas in data-tags and the actual data inside the input
            that.find(".melis-multi-val-input").data("tags", tagDatas);
            that.find(".melis-multi-val-input").attr("data-tags", tagDatas);
        });
    });

    // add a specific tag. triggered by a comma (,)
    var commaHandler = false;
    $body.on("keydown", ".multi-value-input .tag-creator input", function(event){

        var tagValue = $(this).val();

        // check if comma was pressed
        if(event.keyCode == 188) {
            if( commaHandler === false && tagValue && tagValue !== ',' ){

                var newLi = '<li><span>' + tagValue + '</span><a class="remove-tag fa fa-times"></a></li>';
                $(newLi).insertBefore( $(this).parent("li") );
                $(this).val('');
                commaHandler = true;

                // get all datas
                var tagDatas = [];
                $(this).parents('.multi-value-input').children('li:not(:last-child)').each(function(index){
                    tagDatas.push( $(this).children('span').text() );
                });

                // set the datas
                $(this).data("tags", tagDatas); //sets actual data that can be called using .data();
                $(this).attr("data-tags", tagDatas); //sets data inside attr for viewing only
            }
            else{
                $(this).val('');
            }
        }
    });

    // add a specific tag. triggered by a comma (,)
    $body.on("keyup", ".multi-value-input .tag-creator input", function(event){
        if(event.keyCode == 188) {
            $(this).val('').focus();
            commaHandler = false;
        }
    });

    // ---=[ END ]=--- MULTI VALUE INPUT FILED JS --------------------------------------------------

    // detect IE8 and above, and edge
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
        // remove flickering issue on edge
        // $('html').css('overflow', 'hidden');
        // $body.css('overflow', 'auto');
        $("#id_meliscore_leftmenu").css("-webkit-transform", "translate3d(0px, 0px, 0px)");
    }
    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    if(isIE11) {
        $('html').css('overflow', 'hidden');
        $body.css('overflow', 'auto');
    }

    // TAB DRAGGABLE
    function tabDraggable(el, disabled) {
        $(el).sortable({
            tolerance: "intersect",
            animation: 150,
            containment: "parent",
            axis: "x",
            disabled: disabled
        });
    }

    tabDraggable("#melis-id-nav-bar-tabs", false);

    // switch widget nav-tabs even if href begins with a digit e.g. #1_id_cmspage
    function navTabsSwitch() {
        var $this               = $(this),
            href                = $this.attr("href"),
            id                  = href.replace("#", "");

            // .tab-pane [this a hrefs]
            $this.addClass("active");
            $this.closest("li").addClass("active");

            // a hrefs siblings
            $this.closest("li").siblings().removeClass("active");
            $this.closest("li").siblings().find("a").removeClass("active");
            

            // .tab-content
            $(href).siblings().removeClass("active");
            $(href).addClass("active");
            
            return false;
    }

    // pagination of dataTables data, prior to bootstrap 4 changes on pagination classes
    function paginateDataTables() {
        var paginate = setInterval(function() {
            var $paginate = $(".dataTables_paginate"),
                $page_item = $paginate.find(".pagination li"),
                $page_link = $page_item.find("a");

                if ( $paginate.length ) {
                    $page_item.addClass("page-item");
                    $page_link.addClass("page-link");

                    clearInterval( paginate );
                }
        }, 500);

    }

    // BIND & DELEGATE EVENTS =================================================================================================================

    // switch nav-tabs even if href begins with a digit e.g. #1_id_cmspage
    $body.on("shown.bs.tab", ".nav-tabs li a", navTabsSwitch).filter(":first").click();

    // toggle plugin menu in mobile
    $body.on("click", "#plugin-menu", function(){
        $("#id_meliscore_leftmenu").removeAttr('style');
        $("#id_meliscore_footer").addClass('slide-left');

        $("#newplugin-cont").toggleClass("show-menu");
        $body.removeClass('sidebar-mini');
    });

    // toggle sidebar menu
    $body.on("click", "#sidebar-menu", sidebarMenuClick);

    // main tab menu clicks (using bootstrap 'shown.bs.tab' event)
    $body.on("shown.bs.tab", "#melis-id-nav-bar-tabs li a.tab-element", tabMenuClick);

    // open tool treeview
    $body.on("click", '.melis-opentools', openTools);

    // open dashboard
    $body.on("click", '.melis-opendashboard', openDashboard);

    // refresh dashboard widgets
    $body.on("click", '.melis-refreshZone', refreshZone);

    // refresh tables
    $body.on("click", '.melis-refreshTable', refreshTable);

    // close all open tab
    $body.on('click', '#close-all-tab', closedOpenTabs);

    // $body.on("click", '.melis-core-dashboard-filter-btn', disableShowPlugLists);
    $body.on("click", '.melis-core-dashboard-filter-btn', showPlugLists);
    $body.on("click", '.melis-core-dashboard-category-btn', showCatPlugLists);

    /**
     * chart class
     * [.flotchart-holder]
     * [.cms-pros-dash-chart-line-graph]
     * [.commerce-dashboard-plugin-sales-revenue-placeholder]
     */
    /* $body.on("shown.bs.tab", "#melis-id-nav-bar-tabs li a[data-toggle='tab']", function(e) {
        var target      = e.target;
            meliskey    = $(target).closest("li").data("tool-meliskey"),
            $activeTab  = $("#"+activeTabId);

            if ( meliskey === "meliscore_dashboard" ) {
                if ( typeof prospectsDashboardLineChart !== "undefined" && 
                $activeTab.find(".cms-pros-dash-chart-line-graph").length > 0 ) {
                    prospectsDashboardLineChart.loadChart();
                }
                
                if ( typeof commerceDashboardPluginSalesRevenue !== "undefined" && 
                $activeTab.find(".commerce-dashboard-plugin-sales-revenue-placeholder").length > 0 ) {
                    commerceDashboardPluginSalesRevenue.loadChart();
                }
            }
    }); */

    // jQuery ui tooltip style
    $(".melis-core-dashboard-plugin-snippets").tooltip({
        position: {
            my: "left center",
            at: "left+110% center",
            using: function( position, feedback ) {
                var $this = $(this);
                    $this.css( position );
                    $this
                        .addClass( "melis-dashboard-plugin-tooltip" )
                        .addClass( feedback.vertical )
                        .addClass( feedback.horizontal )
                        .appendTo( this );
            }
        },
    });

    $(".melis-core-dashboard-plugin-snippets").hover(function() {
        var $this = $(this);
            $this.children(".melis-dashboard-plugin-tooltip").fadeIn();
    });
    
    $body.on("click", ".melis-dashboard-plugins-menu", function(){
        data = $(this).data();
        //var dashName = data.dashName === 'MelisCore' ? 'Dashboard' : data.dashName;

        melisHelper.tabOpen( data.dashName, data.dashIcon, data.dashId, "meliscore_dashboard", {dashboardId : data.dashId}, '', function() {
            // check dashboard if melisDashBoardDragnDrop is defined
            if ( typeof melisDashBoardDragnDrop !== 'undefined' ) {
                melisDashBoardDragnDrop.checkDashboard();
            }
        });
    });

    /* 
     * Subtracts the .grid-stack width with the plugins sidebar's width so that it would not overlap
     * workaround solution for the issue: http://mantis.melistechnology.fr/view.php?id=2418
     * this is also applied on mobile responsive as it would not allow to drop plugins if sidebar is position fixed
     * in melisCore.js @ 494 #melisDashBoardPluginBtn click event
     */
    $body.on("click", "#melisDashBoardPluginBtn", showToggleDashboardPluginMenu);

    // this function is called from render-dashboard-plugins.phtml
    function showToggleDashboardPluginMenu() {
        var $gs             = $body.find("#" + activeTabId + " .grid-stack"),
            gsi             = $gs.find(".grid-stack-item").length
            minWidth        = $gs.data("min-width"),
            maxWidth        = $gs.data("max-width");

            $pluginBox.toggleClass("shown");

            // responsive main tab menu button
            if ( $tabArrowTop.length && screenSize <= 767 ) {
                if ( $pluginBox.hasClass("shown") ) {
                    $tabArrowTop.addClass("hide-arrow");
                } else {
                    $tabArrowTop.removeClass("hide-arrow");
                }
            }

            // check if plugins menu is open, adjust .grid-stack width accordingly
            if ( minWidth !== "undefined" && maxWidth !== "undefined" ) {
                if ( $pluginBox.hasClass("shown") ) {
                    $gs.animate({
                        width: minWidth
                    }, 3);
                } 
                else {
                    $gs.animate({
                        width: maxWidth
                    }, 3);
                }
            }
    }

    // responsive menu functionalities
    $body.on("click", "#res-page-cont", function() {
        $("#melis-id-nav-bar-tabs").slideToggle(300);
        $tabConOuter.addClass("hide-res-menus");
        $resArrow.toggleClass("move-arrow");
    });

    // new responsive menu behavior as per http://mantis.melistechnology.fr/view.php?id=3849
    $body.on("click", "#res-page-cont i", function() {
        $tabArrowTop.removeClass("hide-arrow");
        $tabConOuter.addClass("hide-res-menus");
        $resArrow.toggleClass("move-arrow");
    });

    // responsive menu arrow button 767px and below for showing/hiding content main tabs
    $body.on("click", "#tab-arrow-top", function() {
        var $this = $(this);
            $tabConInner.show();
            $res.trigger("click");
            $tabConOuter.removeClass("hide-res-menus");
    });

    function showPlugLists() {
        if($(this).hasClass("active")) {
            $(this).removeClass("active")
                .siblings(".melis-core-dashboard-plugin-snippets-box")
                .slideUp();
            $(this).siblings(".melis-core-dashboard-plugin-snippets-box")
                .find(".melis-core-dashboard-category-btn.active")
                .removeClass("active")
                .siblings(".melis-core-dashboard-category-plugins-box")
                .slideUp();

        } else {
            $(".melis-core-dashboard-filter-btn.active").removeClass("active").siblings(".melis-core-dashboard-plugin-snippets-box").slideUp();
            $(this).addClass("active");
            $(".melis-core-dashboard-filter-btn.active").siblings(".melis-core-dashboard-plugin-snippets-box").slideDown();
        }
    }

    function showCatPlugLists() {
        if($(this).hasClass("active")) {
            $(this).removeClass("active").siblings(".melis-core-dashboard-category-plugins-box").slideUp();
        } else {
            $(".melis-core-dashboard-category-btn.active").removeClass("active").siblings(".melis-core-dashboard-category-plugins-box").slideUp();
            $(this).addClass("active");
            $(".melis-core-dashboard-category-btn.active").siblings(".melis-core-dashboard-category-plugins-box").slideDown();
        }
    }

    // for appending custom checkbox element, on modal container
    function loadCustomCheckboxElement() {
        var $checkbox       = $body.find(".melis-check-box");

            $.each($checkbox, function() {
                var $this   = $(this),
                    $id     = $this.attr("id");

                    $this.parent("div").addClass("cls-checkbox");
                    $this.parent("div").append("<label for=" + $id + " class='cls-checkbox-label'></label>");
            });
    }

    // simple browser detect, common browser only
    function browserDetect() {
        var $html   = $("html"),
            ua      = navigator.userAgent;
        
                /* MSIE used to detect old browsers and Trident used to newer ones, Edge for Microsoft Edge */
                if ( ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1 || ua.indexOf("Edge/") > -1 ) {
                    $html.addClass("ie_edge");
                } else if ( ua.indexOf("Chrome/") > -1 ) {
                    $html.addClass("chrome");
                } else if ( ua.indexOf("Safari/") > -1 ) {
                    $html.addClass("safari");
                } else if ( ua.indexOf("Firefox/") > -1 ) {
                    $html.addClass("firefox");
                }

            var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

                if ( isOpera ) {
                    $html.addClass("opera");
                }
    }










    // WINDOW RESIZE FUNCTIONALITIES ========================================================================================================
    $(window).resize(function() {
        var $tabMenu = $("#tab-menu");

            screenSize = jQuery(window).width();

            // dataTable responsive plugin ----=[ PLUGIN BUG FIX ]=-----
            $("table.dataTable").DataTable().columns.adjust().responsive.recalc();

            if( screenSize <= 767 ){
                tabDraggable("#melis-id-nav-bar-tabs", true);
                $tabMenu.addClass("no-gutters");
            } else {
                tabDraggable("#melis-id-nav-bar-tabs", false);
                $tabMenu.removeClass("no-gutters");
            }

            //check tabExpander() when window is resized
            if( screenSize >= 768 ){

                // put plugins back to its original container
                $("#newplugin-cont ul.ul-cont > li").each(function(key, value){
                    $(this).find("span.title").remove();
                    $("#id_meliscore_header .navbar-right").append( $(this) );
                });

                // check tabExpander();
                tabExpander.checkTE();

                //hide plugins & reset defaults
                $("#newplugin-cont").removeClass("show-menu");
                $("#res-page-cont i").removeClass("move-arrow");

            }
            else {

                $body.removeClass("sidebar-mini");

                // reset layout and remove styles
                $("#content, #id_meliscore_leftmenu, #id_meliscore_footer").removeAttr("style");

                // check tabExpander();
                tabExpander.Disable();

                // move plugins to another <div>
                $("#id_meliscore_header .navbar-right > li").each(function(key, value){
                    $(this).children("a").append("<span class='title'>"+ $(this).data("title") +"</span>");
                    $("#newplugin-cont ul.ul-cont").append( $(this) );
                });
            }
    });

    // WINDOW SCROLL FUNCTIONALITIES ========================================================================================================
    if( screenSize <= 767 ) {
        // move plugins to another <div>
        $("#id_meliscore_header .navbar-right > li").each(function(key, value){
            $(this).children("a").append("<span class='title'>"+ $(this).data("title") +"</span>");
            $("#newplugin-cont ul.ul-cont").append( $(this) );
        });
    }

    // INITIALIZE ===================================================================================================================

    // browser detect
    browserDetect();

    // set active tabs etc, flash messenger etc
    firstRender();

    // active tab Id
    activeTabId = $navTabs.find('li.active').children("a").data("id");

    // flash messenger
    flashMessenger();

    sessionCheck();

    /* Responsive Fix on Dashboard */
    $('.dashboard-workflow-container .nav-tabs li').height($('.dashboard-workflow-container .nav-tabs').height());

    // melis cms tools tree
    if ( $("#meliscms_toolstree_section").length > 0 ) {
        $("#site-tree-cont").prependTo("#meliscms_toolstree_section_tools").removeClass('hidden').show();
    }








    /*
     * RETURN ========================================================================================================================
     * include your newly created functions inside the object so it will be accessible in the outside scope
     * sample syntax in calling it outside - melisCore.firstRender;
     */

    return {
        // key - access name outside                                 // value - name of function above
        flashMessenger                                  :           flashMessenger,
        firstRender                                     :           firstRender,
        openTools		                                :           openTools,
        melisChangeLanguage                             :           melisChangeLanguage,
        resizeScreen                                    :           window.resizeScreen,
        screenSize										:			screenSize,
        escapeHtml										: 			escapeHtml,
        tabDraggable                                    :           tabDraggable,
        closedOpenTabs                                  :           closedOpenTabs,
        loadCustomCheckboxElement                       :           loadCustomCheckboxElement,
        showToggleDashboardPluginMenu                   :           showToggleDashboardPluginMenu, // update on this js file, since dashboard notification
        paginateDataTables                              :           paginateDataTables
    };
})(window);