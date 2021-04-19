var melisHelper = (function(){

    var version = "2.0.0";

    // CACHE SELECTORS
    var $body = $("body");
    var $navTabs = $("#melis-id-nav-bar-tabs");

    function melisTranslator(transKey){
        var translated = translations[transKey]
        if(translated === undefined){
            translated = transKey;
        }
        return translated;
    }

    // OK NOTIFICATION
    function melisOkNotification(title, message, color){
        if(!color) color = "#72af46";
        $.gritter.add({
            title: melisTranslator(title),
            text: melisTranslator(message),
            time: 3000,
            image: '/melis/MelisCore/MelisAuth/getProfilePicture?v=' + new Date().getTime(),
        });
        //set the color
        $(".gritter-item").css("background",color);
    }

    // KO NOTIFICATION
    function melisKoNotification(title, message, errors, closeByButtonOnly){
        if(!closeByButtonOnly) closeByButtonOnly = "closeByButtonOnly";
        ( closeByButtonOnly !== 'closeByButtonOnly' ) ? closeByButtonOnly = 'overlay-hideonclick' : closeByButtonOnly = '';

        var errorTexts = '<h3>'+ melisTranslator(title) +'</h3>';

        errorTexts +='<h4>'+ melisTranslator(message) +'</h4>';
        $.each( errors, function( key, error ) {
            if(key !== 'label'){

                var label = (( errors[key]['label'] == undefined ) ? ((errors['label']== undefined) ? key : errors['label'] ) : errors[key]['label'] );
                errorTexts += '<p class="modal-error-cont"><b title="'+ label + '">'+ label + ': </b>  ';

                // catch error level of object
                try {
                    $.each( error, function( key, value ) {
                        if(key !== 'label'){
                            errorTexts += '<span><i class="fa fa-circle"></i>'+ value + '</span>';
                        }
                    });
                } catch(Tryerror) {
                    if(key !== 'label'){
                        errorTexts +=  '<span><i class="fa fa-circle"></i>'+ error + '</span>';
                    }
                }
                errorTexts += '</p>';
            }
        });

        var div = "<div class='melis-modaloverlay "+ closeByButtonOnly +"'></div>";
        div += "<div class='melis-modal-cont KOnotif'>  <div class='modal-content'>"+ errorTexts +" <span class='btn btn-block btn-primary'>"+ translations.tr_meliscore_notification_modal_Close +"</span></div> </div>";
        $body.append(div);
    }
    /**
     * KO NOTIFICATION for Multiple Form
     */
    function melisMultiKoNotification(title, message, errors, closeByButtonOnly){
        if(!closeByButtonOnly) closeByButtonOnly = true;
        var closeByButtonOnly = ( closeByButtonOnly !== true ) ?  'overlay-hideonclick' : '';

        var errorTexts = '<h3>'+ melisHelper.melisTranslator(title) +'</h3>';
        errorTexts +='<h4>'+ melisHelper.melisTranslator(message) +'</h4>';

        $.each( errors, function( key, error ) {
            if(key !== 'label'){
                errorTexts += '<p class="modal-error-cont"><b>'+ (( errors[key]['label'] == undefined ) ? ((errors['label']== undefined) ? key : errors['label'] ) : errors[key]['label'] )+ ': </b>  ';
                // catch error level of object
                try {
                    $.each( error, function( key, value ) {
                        if(key !== 'label' && key !== 'form'){

                            $errMsg = '';
                            if(value instanceof Object){
                                $errMsg = value[0];
                            }else{
                                $errMsg = value;
                            }
                            errorTexts += '<span><i class="fa fa-circle"></i>'+ $errMsg + '</span>';
                        }
                    });
                } catch(Tryerror) {
                    if(key !== 'label' && key !== 'form'){
                        errorTexts +=  '<span><i class="fa fa-circle"></i>'+ error + '</span>';
                    }
                }
                errorTexts += '</p>';
            }
        });

        var div = "<div class='melis-modaloverlay "+ closeByButtonOnly +"'></div>";
        div += "<div class='melis-modal-cont KOnotif'>  <div class='modal-content'>"+ errorTexts +" <span class='btn btn-block btn-primary'>"+ translations.tr_meliscore_notification_modal_Close +"</span></div> </div>";
        $body.append(div);
    }

    /**
     * This method will Highlight an input label where an error occured
     * @param success
     * @param errors, Object array
     * @param selector, element selector
     */
    function highlightMultiErrors(success, errors, selector){
        if(!selector) selector = activeTabId;
        // remove red color for correctly inputted fields
        $("" + selector + " .form-group label").css("color", "inherit");
        // if all form fields are error color them red
        if(!success){
            $.each( errors, function( key, error ) {
                if("form" in error){
                    $.each(this.form, function( fkey, fvalue ){
                        $("#" + fvalue + " .form-control[name='"+key +"']").parents(".form-group").find("label").css("color","red");
                    });
                }else{
                    $( selector + " .form-control[name='"+key +"']").parents(".form-group").find("label").css("color","red");
                }
            });
        }
    }

    /**
     * This method will initialize a element to DataRangePicker plugin
     * @param selector, element selector
     * @param callBackFunction, callback function of the date range picker
     */
    function initDateRangePicker(selector, callBackFunction){
        setTimeout(function(){
            var target = $(selector);
                target.addClass("dt-date-range-picker");
                target.html(''+translations.tr_meliscore_datepicker_select_date+' <i class="glyphicon glyphicon-calendar fa fa-calendar"></i> <span></span> <span class="caret"></span>');

            var sToday      = translations.tr_meliscore_datepicker_today,
                sYesterday  = translations.tr_meliscore_datepicker_yesterday,
                sLast7Days  = translations.tr_meliscore_datepicker_last_7_days,
                sLast30Days = translations.tr_meliscore_datepicker_last_30_days,
                sThisMonth  = translations.tr_meliscore_datepicker_this_month,
                sLastMonth  = translations.tr_meliscore_datepicker_last_month;

            var rangeStringParam = {};

                rangeStringParam[sToday]        = [moment(), moment()];
                rangeStringParam[sYesterday]    = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
                rangeStringParam[sLast7Days]    = [moment().subtract(6, 'days'), moment()];
                rangeStringParam[sLast30Days]   = [moment().subtract(29, 'days'), moment()];
                rangeStringParam[sThisMonth]    = [moment().startOf('month'), moment().endOf('month')];
                rangeStringParam[sLastMonth]    = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

            target.daterangepicker({
                startDate: moment().subtract(1, 'month'), //moment().subtract(10, 'years')
                endDate: moment(),
                locale : {
                    format: melisDateFormat,
                    applyLabel: translations.tr_meliscore_datepicker_apply,
                    cancelLabel: translations.tr_meliscore_datepicker_cancel,
                    customRangeLabel: translations.tr_meliscore_datepicker_custom_range,
                },
                ranges: rangeStringParam
            }, function(start, end) {
                target.find("span").html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
            });

            target.on('apply.daterangepicker', function(ev, picker){
                if(callBackFunction !== undefined){
                    callBackFunction(ev, picker);
                }
            });
        }, 1000);
    }

    function initSwitch(selector){
        var targetInput = $(selector);
        if(targetInput.length){
            targetInput.each(function(){
                var parentDiv = $(this).parent("div.form-group");
                var attribRequired = '';
                if(typeof $(this).data("required") != 'undefined'){
                    attribRequired = ' *';
                }
                var attribTooltip = '';
                if(typeof $(this).data("tooltip") != 'undefined'){
                    attribTooltip = '<i class="fa fa-info-circle fa-lg" data-toggle="tooltip" data-placement="left" title="" data-original-title="' + $(this).data("tooltip") +'"></i>';
                }
                var switchBtn = '<label for="'+$(this).attr("name")+'" class="d-flex flex-row justify-content-between"><div class="label-text">'+$(this).data("label") + attribRequired + '</div>' + attribTooltip+'</label>'
                    +'<div class="make-switch user-admin-switch" data-label-icon="glyphicon glyphicon-resize-horizontal" data-on-label="'+translations.tr_meliscore_common_yes+'" data-off-label="'+translations.tr_meliscore_common_nope+'" style="display: block;">'
                    +'<input type="checkbox" name="'+$(this).attr("name")+'" id="'+$(this).attr("id")+'">'
                    +'</div>';
                parentDiv.html(switchBtn);
            });

            $('.user-admin-switch').bootstrapSwitch('destroy', true);
            $('.user-admin-switch').bootstrapSwitch();
        }
    }

    // checks if activeTabId is a cms page
    function checkIfCmsPage() {
        var $melisCms           = $body.find("#"+activeTabId+".tab-pane.container-level-a"),
            $iframeContainer    = $melisCms.find(".iframe-container"),
            $melisTabEdition    = $iframeContainer.find(".melismcs-page-tab-edition"),
            $melisIframe        = $melisTabEdition.find(".melis-iframe"),
            $melisIframeHeight  = $melisIframe.contents().find("body").height(),
            $loader             = $melisTabEdition.find("#loader"),
            $iframeChildren     = $melisIframe.contents().find("body").children();

            if ( $melisIframe.length && $iframeChildren.length ) {
                // set .melis-iframe css height
                $melisIframe.css("height", melisIframeHeight);
            }
    }

    // SWITCH ACTIVE TABS =============================================================================================================
    function tabSwitch( tabID ) {
        var $tabElement         = $("#melis-id-nav-bar-tabs a.tab-element[data-id='"+ tabID +"']"),
            subMenu             = $tabElement.closest(".nav-group-dropdown"),
            $navBarTabsLi       = $("body #melis-id-nav-bar-tabs li"),
            $navBarTabsLiCont   = $("body #melis-id-nav-bar-tabs li, .container-level-a"),
            $dndBox             = $("body .melis-core-dashboard-dnd-box");

            // update new activeTabId
            activeTabId = tabID;

            // run and check all the <li> to remove the 'active class'
            $navBarTabsLiCont.each(function() {
                var $this = $(this);
                    $this.removeClass('active');
            });

            $navBarTabsLi.each(function() {
                var $this = $(this);
                    $this.removeClass('active-parent on');
            });

            if ( $(subMenu).length ) {
                $(subMenu).parents("li").addClass("active-parent on");
            }

            //add active class to the parent of the clicked <a> ( to the <li> )
            $tabElement.closest("li").addClass("active");
            $tabElement.parent("li").parents("li").addClass("active-parent on");

            //show current selected container
            $("#" + tabID).addClass("active");

            // detect dashboard tab panel
            if( $("#"+activeTabId).hasClass("tab-panel-dashboard") ) {
                // show dashboard plugin menu
                $dndBox.fadeIn();
                $dndBox.find(".show").fadeIn();
            } else {
                // hide dashboard plugin menu
                $dndBox.fadeOut();
                $dndBox.find(".show").fadeOut();
            }
    }

    // CLOSE TAB AND REMOVE ===========================================================================================================
    function tabClose(ID, fromGroup) {

        fromGroup = (typeof fromGroup != 'undefined') ? fromGroup : false;

        /**
         * if there is no second parameter pass,
         * try to check manually if it is a
         * sub tab
         */
        if(!fromGroup){
            if($(this).closest('ul').hasClass('nav-group-dropdown')){
                fromGroup = true;
            }
        }

        var tabContentID =  (typeof ID === 'string') ? ID :  $(this).data("id");
        var currentParent = $(".tabsbar a[data-id='"+tabContentID+"']").parent("li");
        var nextActiveTab = currentParent.next("li").children().data("id");
        var prevActiveTab = currentParent.prev("li").children().data("id");
        var tabCount = $navTabs.children("li").length;
        var removedWidth = currentParent.width();
        var currentGrandParent = currentParent.parent().parent("li").find(".tab-element").data("id");

        //This is for not showing the close all tab button, data-id on .close-tab has changed to the current id_meliscore_toolstree_section_dashboard
        //if(prevActiveTab == 'id_meliscore_dashboard' && !nextActiveTab) { 
        if(prevActiveTab == 'id_meliscore_toolstree_section_dashboard' && !nextActiveTab){
            $("#close-all-tab").hide();
            $("#close-all-tab").closest("li").hide(); // fix for double border left
        }

        var navBox = currentParent.closest(".scroll");
        var hasdropdown = $(navBox).find(".nav-group-dropdown");

        if(currentParent.hasClass("active-parent")) {
            var tabMenuGroup = currentParent.find(".nav-group-dropdown");
            tabMenuGroup.find("li a.tab-element").each(function() {
                var tabeMenuDataID = $(this).data("id");
                // remove the tabs corresponds to tab menu
                $("#"+tabeMenuDataID).remove();
            });

            // when close tab menu switch the tab active
            if(tabCount >= 1) {
                if(activeTabId === tabContentID) {
                    tabSwitch(nextActiveTab);
                } else {
                    tabSwitch(prevActiveTab);
                }
            }
        }

        if( currentParent.index() === 0 ){
            if(currentParent.siblings().length === 0) {
                currentParent.parent(".nav-group-dropdown").remove();
            }
            currentParent.remove();
            $("#"+tabContentID).remove();

            if( tabCount >= 1){
                if(activeTabId === tabContentID){
                    // switch to grand parent li tab
                    tabSwitch(currentGrandParent);
                }
            }
        }
        else{
            currentParent.remove();
            $("#"+tabContentID).remove();

            if( tabCount >= 1){
                if(activeTabId === tabContentID){
                    tabSwitch(prevActiveTab);
                }
            }
        }

        // check scroll class exists
        if(navBox) {
            // check if menu are too many
            if($(navBox).height() < 400) {
                $(navBox).removeClass("scroll");
            }
        }

        // get the <ul> container width and disable the tabExpander
        var navUlContainer = 1;
        $('#id_meliscore_header #melis-id-nav-bar-tabs > li').each(function() {
            navUlContainer += $(this).outerWidth();
        });

        if( navUlContainer < $("#melis-navtabs-container-inner").width() ){
            tabExpander.checkTE();
        }
        else {

            var leftOffset = $navTabs.position().left;

            if( leftOffset === -1 ) {}
            else if( leftOffset !== 0 ) {
                //check if removed tab is not from group(sub tab) to avoid moving the other tabs
                if(!fromGroup) {
                    $("#melis-id-nav-bar-tabs").animate({
                        left: (leftOffset + removedWidth)
                    }, 0);
                }
            }
            /*else if ( leftOffset === 0 ) {
                $("#melis-id-nav-bar-tabs").animate({
                    left: leftOffset
                }, 0);
            }*/
        }
        checkSubMenu();

        // [ Mobile ] when closing a page
        if( melisCore.screenSize <= 767 ){
            //var $tabArrowTop = $("#tab-arrow-top");

                $("#res-page-cont").trigger("click");

                // check if there are no contents open
                if( $navTabs.children("li").length === 0){
                    var empty = '<strong>(' + translations.tr_meliscore_empty +')</strong>';
                    $("#res-page-cont span").append(empty);
                }

                /* if ( $tabArrowTop.length ) {
                    $tabArrowTop.removeClass("hide-arrow");
                } */
        }

        // dataTable responsive plugin ----=[ PLUGIN BUG FIX ]=-----
        $("table.dataTable").DataTable().columns.adjust().responsive.recalc();
    }

    // TAB OPEN =====================================================================================================================
    function tabOpen(title, icon, zoneId, melisKey, parameters, navTabsGroup, callback) {
        //Show the close(X) button on header
        if ( melisKey !== 'meliscore_dashboard' ) {
            $("#close-all-tab").show();
            $("#close-all-tab").closest("li").show();
        }
        //check if the tab is already open and added to the main nav
        var alreadyOpen = $("body #melis-id-nav-bar-tabs li a.tab-element[data-id='"+ zoneId +"']");

            if ( alreadyOpen.length < 1 ) {
                var li = "<li data-tool-name='"+ title +"' data-tool-icon='"+ icon +"' data-tool-id='"+ zoneId +"' data-tool-meliskey='"+melisKey+"'>";
                li += "<a data-toggle='tab' class='dropdown-toggle menu-icon tab-element' href='#"+ zoneId + "' data-id='" + zoneId + "' title='"+ title.replace(/'/g,"&apos;") +"'>";
                li += "<i class='fa "+ icon +" fa-2x'></i><span class='navtab-pagename'>";
                li += title + "</span></a>";
                li += "<a class='close close-tab' data-id='" + zoneId + "'>"+ translations.tr_meliscore_notification_modal_Close +"</a>";
                li += "</li>";

                // check if it has parent nav
                if ( navTabsGroup && navTabsGroup !== "undefined" ) {
                    var navParentGroup = $(".tab-element[data-id='"+navTabsGroup+"']");
                        if ( $(navParentGroup).length > 0 ) {
                            // find parent nav li
                            var navBox = navParentGroup.closest("li");

                            // find nav-group-dropdown that has the id of navTabsGroup
                            var hasdropdown = $(navBox).find(".nav-group-dropdown");

                            if ( $(hasdropdown).length ) {
                                // check if menu are too many
                                if( $(hasdropdown).first().height() > 350 ) {
                                    $(hasdropdown).first().addClass("scroll");
                                }

                                // add li in the first nav-group-dropdown
                                $(hasdropdown).first().append(li);

                            } 
                            else {
                                // create a sub menu ul and append the li
                                navBox.append("<ul class='nav-group-dropdown'></ul>");
                                navBox.find(".nav-group-dropdown").append(li);
                            }
                        } 
                        else {
                            $("body #melis-id-nav-bar-tabs").append(li);

                            /* if(navTabsGroup == "design_module") {
                                var liTest = "<li>";
                                liTest += "<a data-toggle='tab' class='dropdown-toggle menu-icon tab-element' href='#"+ zoneId + "' data-id='design_module'>";
                                liTest += "<i class='fa  fa-paint-brush fa-2x'></i><span class='navtab-pagename'>";
                                liTest += 'Design '+ title + "</span></a>";
                                liTest += "<a class='close close-tab' data-id='" + zoneId + "'>"+ translations.tr_meliscore_notification_modal_Close +"</a>";
                                liTest += "</li>";
                                $("body #melis-id-nav-bar-tabs").append(liTest);
                            } else {
                                // append the <li> to the menu
                                $("body #melis-id-nav-bar-tabs").append(li);
                            }*/

                        }
                } 
                else {
                    // append the <li> to the menu melis-tabnext
                    $("body #melis-id-nav-bar-tabs").append(li);
                }

                checkSubMenu();

                // [ Mobile ] when opening a page
                if ( melisCore.screenSize <= 767 ) {
                    // check if there are no contents open
                    if ( $navTabs.children("li").length > 0) {
                        $("#res-page-cont span b").remove();
                    }

                    // close sidebar after opening a page from it
                    $body.removeClass('sidebar-mini');
                    // hide sidebar footer when opening tab
                    $("#id_meliscore_footer").addClass('slide-left');
                    $("#id_meliscore_leftmenu, #id_meliscore_footer").removeAttr('style');

                    // slide up the dropdown menu
                    $("#melis-id-nav-bar-tabs").slideUp(300);
                    $("#res-page-cont i").removeClass("move-arrow");
                }

                var div = "<div data-meliskey='" + melisKey + "' id='" + zoneId + "' class='tab-pane container-level-a'></div>";
                    $('#melis-id-body-content-load').append(div);

                    //set active tab ID
                    activeTabId = zoneId;

                    //make the new tab active
                    tabSwitch(zoneId);

                    //load the page content
                    var fnCallback = null;

                    if ( callback !== undefined || callback !== null) {
                        fnCallback = callback;
                    }
                    
                    zoneReload(zoneId, melisKey, parameters, fnCallback);

                    // check if tabExpander(); needs to be activated or not
                    tabExpander.checkTE();

                    //focus the newly opened tab if tabExpander() is enabled
                    if ( tabExpander.checkStatus() === 'enabled' ){
                        if ( typeof navTabsGroup == "undefined" || typeof navTabsGroup == null ) {
                            $(".melis-tabnext").trigger("click");
                        }
                    }
                    
                    // check for meliscore_dashboard and melisDashBoardDragnDrop is defined
                    if ( typeof melisDashBoardDragnDrop !== undefined && melisKey == 'meliscore_dashboard' ) {
                        setTimeout(function() {
                            melisDashBoardDragnDrop.checkDashboard();
                        }, 2000);
                    }
                    
                    // add a melis-design class on body tag when opening a melis-design page
                    var bodyClass = 'melis-design';
                        melisCoreTool.addBodyClass( bodyClass );
            }
            else {
                //make the new tab and content active instead of reloading
                tabSwitch(zoneId);
            }
    }

    // CHECK SUBMENU =================================================================================
    function checkSubMenu() {
        $("body #melis-id-nav-bar-tabs li").each(function(){
            if($(this).children("ul").length){
                $(this).addClass("has-sub");
            } else {
                $(this).removeClass("has-sub");
            }
        });
    }

    // EXECUTE CALLBACK FUNCTIONS FROM ZONE RELOADING =================================================================================
    /*function executeCallbackFunction(functionName, context) {
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for(var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }

        // check the validity of the JS callback function
        if( context[func] !== undefined){
            return context[func].apply(context);
        }
    }*/

    // ZONE RELOADING =================================================================================================================
    function zoneReload(zoneId, melisKey, parameters, callback) {
        var datastring          = { cpath: melisKey },
            $melisCmsPage       = $body.find("#"+activeTabId+"[data-meliskey='meliscms_page'].tab-pane"),
            $iframeContainer    = $melisCmsPage.find(".iframe-container"),
            $pageEdition        = $iframeContainer.find(".meliscms-page-tab-edition");

            //add parameters value to datastring object if available
            if ( parameters !== undefined ) {
                $.each(parameters, function( index, value ) {
                    datastring[index] = value;
                });
            }

            // add the temp loader
            var tempLoader = '<div id="loader" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';
            $("#"+zoneId).append(tempLoader);
                
                // add an inline css overflow: hidden
                melisCoreTool.addOverflowHidden();
 
                $.ajax({
                    url         : '/melis/zoneview',
                    data        : datastring,
                    encode		: true,
                    dataType	: "json"
                }).done(function(data) {           
                    // remove the inline style
                    melisCoreTool.removeOverflowHidden();

                    setTimeout(function() {
                        if ( data !== null ) {
                            // hide the loader
                            //$('.container-level-a > #loader > .loader-icon').removeClass('spinning-cog').addClass('shrinking-cog');
                            
                            $("#"+zoneId).html(data.html).children().unwrap();

                            // set the current active tab based from 'activeTabId' value
                            tabSwitch(activeTabId);

                            // set active the the 'Edition' tab and its 'Tab Content'
                            $("#" + zoneId + " .nav-tabs li:first-child").addClass("active");
                            $("#" + zoneId + " .tab-content > div:first-child").addClass("active");

                            // --------------------------------------------------------------
                            // Run callback scripts here | from app.interface
                            // --------------------------------------------------------------
                            var jsCallbacks = data.jsCallbacks;

                            $.each( jsCallbacks, function( key, value ) {

                                // check if there is more than 1 function in a single jsCallback from app.interface
                                // example: 'jscallback' => 'simpleChartInit(); anotherFunction();'  separated by (space)
                                var splitFunctions = value.split(" ");

                                /*if( splitFunctions.length > 1){
                                    // run all the function extracted from a single jsCallback
                                    $.each( splitFunctions, function( key, value ) {
                                        value = value.slice(0, -3);
                                        executeCallbackFunction(value, window);
                                    });
                                }
                                else{
                                    value = value.slice(0, -3);
                                    executeCallbackFunction(value, window);
                                }*/
                                
                                $.each( splitFunctions, function( key, value ) {
                                    try {
                                        eval(value);
                                    }
                                    catch(err) {
                                        // console.log(err);
                                    }
                                });
                            });
                        }
                        else {
                            $('#melis-id-nav-bar-tabs a[data-id="' + zoneId + '"]').parent("li").remove();
                            $('#'+zoneId).remove();

                            melisHelper.melisKoNotification( "Error Fetching data", "No result was retrieved while doing this operation.", "no error datas returned", '#000' );
                        }
                        if ( callback !== undefined || callback !== null) {
                            if (callback) {
                                callback();
                            }
                        }
                    }, 300);
                }).fail(function(xhr, textStatus, errorThrown) {
                    //hide the loader
                    //$('.container-level-a > #loader > .loader-icon').removeClass('spinning-cog').addClass('shrinking-cog');
                    alert( translations.tr_meliscore_error_message );

                    $('#melis-id-nav-bar-tabs a[data-id="' + zoneId + '"]').parent("li").remove();
                    $('#'+zoneId).remove();
                });
    }

    // Requesting flag set to false so this function will set state to ready
    var createModalRequestingFlag = false;
    // CREATE MODAL =================================================================================================================
    function createModal(zoneId, melisKey, hasCloseBtn, parameters, modalUrl, callback, modalBackDrop) {
        // declaring parameters variable for old / cross browser compatability
        if (typeof(modalUrl)==='undefined') modalUrl = null;
        if (typeof(callback)==='undefined') callback = null;
        if (typeof(modalBackDrop)==='undefined') modalBackDrop = true;

        if (createModalRequestingFlag == false){

            // Requesting flag set to true so this function will execute any action while still requesting
            createModalRequestingFlag = true;

            // if no modalUrl is supplied it will use the default modal layout from melisCore
            if(modalUrl === undefined || modalUrl == null){
                modalUrl = '/melis/MelisCore/MelisGenericModal/genericModal';
            }

            var datastring = {
                id : zoneId,
                melisKey : melisKey,
                hasCloseBtn : hasCloseBtn,
                parameters: parameters,
            };

            $.ajax({
                url         : modalUrl,
                data        : datastring,
                encode		: true
            }).done(function(data) {
                // Requesting flag set to false so this function will set state to ready
                createModalRequestingFlag = false;

                $("#melis-modals-container").append(data);
                var modalID = $(data).find(".modal").attr("id");
                melisHelper.zoneReload(zoneId, melisKey, parameters);

                $("#" + modalID).modal({
                    show: true,
                    keyboard : false,
                    backdrop : modalBackDrop
                });

                if(typeof callback !== "undefined" && typeof callback === "function") {
                    callback();
                }
            }).fail(function(xhr, textStatus, errorThrown) {
                alert("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
                // Requesting flag set to false so this function will set state to ready
                createModalRequestingFlag = true;
            });
        }
    }

    function loadingHtml() {
        return '<div id="loadingZone" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';
    }

    // Stating zone to loading
    function loadingZone(targetElem) {
        if(targetElem.length){
            var tempLoader = loadingHtml();
            targetElem.attr("style", "position: relative");
            targetElem.append(tempLoader);
        }
    }

    // Removing loading state on zone
    function removeLoadingZone(targetElem) {
        if(targetElem.length){
            targetElem.find("#loadingZone").remove();
        }
    }

    // disable single tab
    function disableTab(tabId) {
        $("li a.tab-element[data-id='"+tabId+"']").css('pointer-events','none').parent().css("cursor", "not-allowed");
    }

    // enable single tab
    function enableTab(tabId) {
        $("li a.tab-element[data-id='"+tabId+"']").css('pointer-events','auto').parent().css("cursor", "pointer");
    }

    // disabled all tabs
    function disableAllTabs() {
        $.each($("#melis-id-nav-bar-tabs li a"), function(i, v) {
            var tabId = $(v).data("id");
            disableTab(tabId);
        });

        // disable navigation too
        $.each($("ul.sideMenu"), function(i ,v) {
            $(v).css('pointer-events','none').parent().css("cursor", "not-allowed");
        });
    }

    // enables all tabs
    function enableAllTabs() {
        $.each($("#melis-id-nav-bar-tabs li a"), function(i, v) {
            var tabId = $(v).data("id");
            enableTab(tabId);
        });

        $.each($("ul.sideMenu"), function(i ,v) {
            $(v).css('pointer-events','none').css('pointer-events','auto').parent().css("cursor", "pointer");
        });
    }
    // initialize datatable
    function melisInitDataTable (requiredSettings){
        if (typeof (requiredSettings) === "object") {
            var settings = {
                paging : true,
                ordering : true,
                serverSide : true,
                searching: true,
                // ordering of the table default [column,direction]
                order: [[ 0, "desc" ]],
                responsive:true,
                processing: true,
                lengthMenu: [ [5, 10, 25, 50], [5, 10, 25, 50] ],
                pageLength: 10,
                bSort: true,
                searchDelay: 1500,
                columnDefs : [
                    { responsivePriority:1, targets: 0 },
                    { responsivePriority:2, targets: -1 }
                ],
                language: {
                    url : "/melis/MelisCore/Language/getDataTableTranslations",
                },
            };
            // add ajax
            if(requiredSettings.hasOwnProperty('ajaxUrl')) {
                settings.ajax = {
                    url : requiredSettings.ajaxUrl,
                    type : "POST",
                };
            }
            // check for columns
            if(requiredSettings.hasOwnProperty('columns')) {
                var tmpColumns = [];
                var tmpDefColumns = [];
                if (Object.keys(requiredSettings.columns).length > 0) {
                    var ctr = 0;
                    // loop all columns
                    $.each(requiredSettings.columns, function(index, item) {
                        tmpColumns.push({
                            "data" : index
                        });
                        settings.columnDefs.push({
                            "width" : item.css.width,
                            'targets' : ctr
                        });
                        ctr++;
                    });
                }
                // set datatable columns
                settings.columns = tmpColumns;
            }
            if(requiredSettings.hasOwnProperty('filters')) {
                var preDefinedFilters = ['l','f'];
                var tableTop = '<"filter-bar"<"row"';
                var leftDom = '<"fb-dt-left col-xs-12 col-md-4"';
                var centerDom = '<"fb-dt-center col-xs-12 col-md-4"';
                var rightDom = '<"fb-dt-right col-xs-12 col-md-4"';
                var tableBottom = '<"bottom" t<"pagination-cont"rip>>';
                var jsSdomContentInit = [];

                // left filter area
                if(Object.keys(requiredSettings.filters.left).length > 0) {
                    // loop all left filters
                    $.each(requiredSettings.filters.left,function(index,item) {
                        // check for predefined datatble content
                        if(preDefinedFilters.indexOf(item) >= 0) {
                            // construct correct syntax of datatable filter
                            leftDom = leftDom + '<"'+ index  +'"'+ item +'>';
                        } else {
                            // construct correct syntax of datatable filter
                            leftDom = leftDom + '<"'+ index +'">';
                            // append needed function for callback function after datatable initiliazation
                            jsSdomContentInit.push(function(){
                                return $("." + index).html(item);
                            })
                        }
                    });
                }
                // center filter area
                if(Object.keys(requiredSettings.filters.center).length > 0) {
                    // loop all center filters
                    $.each(requiredSettings.filters.center,function(index,item) {
                        // check for predefined datatble content
                        if(preDefinedFilters.indexOf(item) >= 0) {
                            // construct correct syntax of datatable filter
                            centerDom = centerDom + '<"'+ index  +'"'+ item +'>';
                        } else {
                            // construct correct syntax of datatable filter
                            centerDom = centerDom + '<"'+ index +'">';
                            // append needed function for callback function after datatable initiliazation
                            jsSdomContentInit.push(function(){
                                return $("." + index).html(item);
                            })
                        }
                    });
                }
                // right filter area
                if(Object.keys(requiredSettings.filters.right).length > 0) {
                    // loop all right filters
                    $.each(requiredSettings.filters.right,function(index,item) {
                        // check for predefined datatble content
                        if(preDefinedFilters.indexOf(item) >= 0) {
                            // construct correct syntax of datatable filter
                            rightDom = rightDom + '<"'+ index  +'"'+ item +'>';
                        } else {
                            // construct correct syntax of datatable filter
                            rightDom = rightDom + '<"'+ index +'">';
                            // append needed function for callback function after datatable initiliazation
                            jsSdomContentInit.push(function(){
                                return $("." + index).html(item);
                            })
                        }
                    });
                }
                // set datatable sDom or Filters
                settings.sDom = tableTop + leftDom + ">" + centerDom + ">" + rightDom + ">>>" + tableBottom;
            }
            // add action buttons
            if (requiredSettings.hasOwnProperty('actionButtons')){
                // check if it has elements
                if(Object.keys(requiredSettings.actionButtons).length > 0) {
                    settings.columns.push({
                        "data" : "actions"
                    });
                    var actionButtons = "";
                    $.each(requiredSettings.actionButtons, function(idx, item) {
                        actionButtons = actionButtons + item + " ";
                    });
                    settings.columnDefs.push({
                        "targets" : -1,
                        "data" : null,
                        "width" : "10%",
                        "bSortable" : false,
                        "sClass" : "dtActionCls",
                        "mRender": function(){
                            return actionButtons;
                        }
                    })
                }

            }
            // // initialized datatable
            var target = $("#"+requiredSettings.attributes.id);
            var melisDataTable = target.DataTable(settings).columns.adjust().responsive.recalc();
            //run callback function for addtional filters
            target.on('init.dt',function(){
                // get all filter function
                if (jsSdomContentInit.length > 0) {
                    $.each(jsSdomContentInit,function(index,fn){
                        // run all functions
                        fn();
                    });
                }
                // get datatable search field
                var searchField = target.parent().siblings('.filter-bar').find('.search input[type="search"]');
                // unbind
                searchField.unbind();
                // for better logic trigger search when there are 2 or more characters
                searchField.typeWatch({
                    captureLength : 2,
                    callback : function(value) {
                        melisDataTable.search(value).draw();
                    }
                });
            });
        }
    }


    // BIND AND DELEGATE EVENTS =====================================================================================================

    // close tab
    $body.on("click", ".close-tab", tabClose );

    // close the KO notification
    $body.on("click", ".melis-modal-cont.KOnotif span.btn, .overlay-hideonclick, .delete-page-modal .cancel, .melis-prompt, melis-prompt .cancel", function() {
        $(".melis-modaloverlay, .melis-modal-cont").remove();
    });

    // Input-group that has clear function button
    $body.on("click", ".meliscore-clear-input", function(){
        // Clearing the input of input-group
        $(this).closest(".input-group").find("input").val("");
    });

	/*
	 * RETURN ========================================================================================================================
	 * include your newly created functions inside the array so it will be accessable in the outside scope
	 * sample syntax in calling it outside - melisHelper.zoneReload(parameters);
	 */

    return {
        //key - access name outside									// value - name of function above

        // javascript translator function
        melisTranslator									:			melisTranslator,

        // notifications
        melisOkNotification 							:       	melisOkNotification,
        melisKoNotification 							: 			melisKoNotification,

        // multiple KO notifications
        melisMultiKoNotification						: 			melisMultiKoNotification,
        highlightMultiErrors							: 			highlightMultiErrors,

        // initialize dateRangePicker
        initDateRangePicker								:			initDateRangePicker,

        // initialize bootstrap switch
        initSwitch										: 			initSwitch,

        // tabs
        tabSwitch 										: 			tabSwitch,
        tabClose 										: 			tabClose,
        tabOpen 										: 			tabOpen,

        // zone realod
        zoneReload 										: 			zoneReload,

        // modal
        createModal										:			createModal,

        // Loading zone
        loadingHtml										:			loadingHtml,
        loadingZone										:			loadingZone,
        removeLoadingZone								:			removeLoadingZone,
        disableTab								        :			disableTab,
        enableTab								        :			enableTab,
        disableAllTabs								    :			disableAllTabs,
        enableAllTabs								    :			enableAllTabs,
        // initialize datatable
        melisInitDataTable                              :           melisInitDataTable

    };

})();
