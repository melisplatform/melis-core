/* This file will be used mostly used when you want to implement a unified rendering to your tool */

/**
 * Global Variables
 */
var dStartDate = ''; //moment().subtract(29, 'days').format(melisDateFormat);
var dEndDate = ''; //moment().format(melisDateFormat);


var melisCoreTool = (function (window) {
    var $body = $("body");
        function translate(transKey) {
            var translated = translations[transKey]
            if (translated === undefined) {
                translated = transKey;
            }
            return translated;
        }

        // FOR MODALS
        function confirm(textOk, textNo, title, msg, callBackOnYes, callBackOnNo) {
            BootstrapDialog.show({
                title: title,
                message: msg,
                type: BootstrapDialog.TYPE_WARNING,
                closable: true,
                cssClass: "confirm-modal-header",
                buttons: [{
                    label: textNo, //translations.tr_meliscore_common_no
                    cssClass: 'btn-danger pull-left',
                    action: function (dialog) {
                        //callBackOnNo();
                        if (callBackOnNo !== null && typeof (callBackOnNo) === 'function') {
                            callBackOnNo();
                        }

                        dialog.close();
                    }
                }, {
                    label: textOk, //translations.tr_meliscore_common_yes
                    cssClass: 'btn-success',
                    action: function (dialog) {
                        //callBackOnYes();
                        if (callBackOnYes !== null && typeof (callBackOnYes) === 'function') {
                            callBackOnYes();
                        }
                    
                        dialog.close();
                    }
                }],
                onshown: function() {
                    var $footerBtns = $(".modal-footer");
                        if ( $footerBtns.find(".btn").length ) {
                            setTimeout(function() {
                                if ( $footerBtns.find(".btn:first-child").hasClass("btn-success") ) {
                                    $footerBtns.find(".btn:first-child").removeClass("btn-success");
                                }
                            }, 0);
                            $footerBtns.find(".btn:first-child").addClass("btn-danger pull-left").removeClass("btn-secondary btn-default");
                            $footerBtns.find(".btn").addClass("btn-success").removeClass("btn-secondary btn-default");
                        }
                }
            });
        }

        function closeDialog(title, msg, callBackOnNo) {
            BootstrapDialog.show({
                title: title,
                message: msg,
                type: BootstrapDialog.TYPE_WARNING,
                closable: true,
                buttons: [{
                    label: translations.tr_meliscore_notification_modal_Close,
                    cssClass: 'btn-danger pull-right',
                    action: function (dialog) {
                        if (callBackOnNo != null && typeof (callBackOnNo) === 'function') {
                            callBackOnNo();
                        }
                        dialog.close();
                    }
                }]
            });
        }

        // ALERTS
        function showAlert(target, highlight, message, type) {
            var $target = $(target);
                $target.removeClass();
                $target.css("display", "none");
                $target.addClass("alert alert-" + type);
                $target.html("<strong>" + highlight + "</strong> " + translate(message));
                $target.fadeIn();
        }

        function alertDanger(target, highlight, message) {
            showAlert(target, highlight, message, "danger");
        }

        function alertSuccess(target, highlight, message) {
            showAlert(target, highlight, message, "success");
        }

        function alertInfo(target, highlight, message) {
            showAlert(target, highlight, message, "info");
        }

        function alertWarning(target, highlight, message) {
            showAlert(target, highlight, message, "warning");
        }

        function hideAlert(target) {
            $(target).fadeOut();
        }

        // FORMS
        function clearForm(formId) {
            $('#' + formId)[0].reset();
        }

        function highlightErrors(success, errors, divContainer) {
            // if all form fields are error color them red
            if (success === 0 || success === false) {
                $("#" + divContainer + " .form-group label").css("color", "#686868");
                $.each(errors, function (key, error) {
                    $("#" + divContainer + " .form-control[name='" + key + "']").parents(".form-group").children(":first").css("color", "red");
                });
            }
            // remove red color for correctly inputted fields
            else {
                $("#" + divContainer + " .form-group label").css("color", "#686868");
            }
        }

        function resetLabels(form) {
            $(form).find("label").css("color", "#686868");
        }

        function processingActiveTabId() {
            var overlay = '<div id="loader" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';
                $("#"+activeTabId).append(overlay);
        }

        function processing() {
            var overlay = '<div id="loader" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';
                $(overlay).appendTo('body');
        }

        function processDone() {
            $("body #loader").remove();
        }

        function exportData(url, callback) {
            var newWindow = window.open(url, "_blank");
            
                newWindow.onload = function () {
                    newWindow.close();
                };
        }

        function isTableEmpty(table) {
            var matches = null,
                //findNum = $("div[class='dataTables_info'][id='" + table + "_info']").html(),
                findNum = $("[id='" + table + "_info']").html(),
                isEmpty = true;
                
                matches = findNum.match(/\d+/g);

            var count   = parseInt(matches[0]) > 0 ? false : true;

                isEmpty = count;

                return isEmpty;
        }

        function switchTab(tabId) {
            $('.widget-tabs a[href="' + tabId + '"]').tab('show');
        }

        function showOnlyTab(modalContainer, tabId) {
            showAllTabs(modalContainer);
            hideAllTabs(modalContainer);
            showTab(tabId);
            switchTab(tabId);
        }

        function showTab(tabId) {
            var parent = $('.widget-tabs a[href="' + tabId + '"]').parent();
                $(parent).show();
        }

        function showTabs(modalContainer, tabs) {
            //melisTool.tabs.hideAllTabs(modalContainer);
            var mTabs = tabs.split(",");
                $.each(mTabs, function (e, tabId) {
                    showTab(tabId);
                });
                switchTab(mTabs[0]);
        }

        function hideTab(modalContainer, tabId, switchTo) {
            showAllTabs(modalContainer);
            var parent = $('.widget-tabs a[href="' + tabId + '"]').parent();
                $(parent).hide();
                switchTab(switchTo);
        }

        function hideAllTabs(modalContainer) {
            var li = $(modalContainer + " .widget-head ul li").css('display', 'none');
        }

        function hideTabs(modalContainer, tabs, switchTo) {
            showAllTabs(modalContainer);
            var mTabs = tabs.split(",");
                $.each(mTabs, function (e, tabId) {
                    var parent = $('.widget-tabs a[href="' + tabId + '"]').parent();
                    $(parent).hide();
                });
                switchTab(switchTo);
        }

        function showAllTabs(modalContainer) {
            var li = $(modalContainer + " .widget-head ul li");
                li.css('display', 'block');
        }

        // ACTION
        function pending(targetButton) {
            // show an overlay and disable the button
            var div = "<div class='melis-modal-overlay'></div>";
                $("body").append(div);
                // $(targetButton).attr('disabled', 'disabled');
                $(targetButton).prop('disabled', true);
        }

        function done(targetButton) {
            // hide the overlay and enable the button
            $("body div.melis-modal-overlay").remove();
            //$(targetButton).attr('disabled', false);
            $(targetButton).prop('disabled', false);
        }

        // date
        function init() {
            var sToday      = translations.tr_meliscore_datepicker_today,
                sYesterday  = translations.tr_meliscore_datepicker_yesterday,
                sLast7Days  = translations.tr_meliscore_datepicker_last_7_days,
                sLast30Days = translations.tr_meliscore_datepicker_last_30_days,
                sThisMonth  = translations.tr_meliscore_datepicker_this_month,
                sLastMonth  = translations.tr_meliscore_datepicker_last_month;

                function cb(start, end) {
                    dStartDate = start.format(melisDateFormat);
                    dEndDate = end.format(melisDateFormat);
                    // default display upon initialization of date picker
                    //var icon = '<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>';
                    //$('#dt_bsdatepicker .dt_dateInfo').html("Select Date: " + icon + dStartDate + ' - ' + dEndDate + ' <b class="caret"></b>');
                }

            var rangeStringParam = {};

                rangeStringParam[sToday] = [moment(), moment()];
                rangeStringParam[sYesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
                rangeStringParam[sLast7Days] = [moment().subtract(6, 'days'), moment()];
                rangeStringParam[sLast30Days] = [moment().subtract(29, 'days'), moment()];
                rangeStringParam[sThisMonth] = [moment().startOf('month'), moment().endOf('month')];
                rangeStringParam[sLastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

                $("#dt_bsdatepicker").daterangepicker({
                    locale: {
                        format: melisDateFormat,
                        applyLabel: translations.tr_meliscore_datepicker_apply,
                        cancelLabel: translations.tr_meliscore_datepicker_cancel,
                        customRangeLabel: translations.tr_meliscore_datepicker_custom_range,
                    },
                    ranges: rangeStringParam,
                }, cb);
        }

        function changeImage(target, src) {
            if (src.files && src.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $(target).attr('src', e.target.result);
                }
                reader.readAsDataURL(src.files[0]);
            }
        }

        // used usually on page edition loading with smooth scroll to .melis-iframe
        function addOverflowHidden() {
            var overflowTimeout = setTimeout(function() {
                var $melisIframe = $("#"+activeTabId+ " .melis-iframe");
                    if ( $melisIframe.length ) {
                        $("html, body").animate({ 
                            scrollTop: ( $melisIframe.length > 0 ) ? $melisIframe.offset().top : 0 },
                            0, function() {
                                $body.css("overflow-x", "hidden");
                            });

                        clearTimeout(overflowTimeout);
                    }
            }, 500);
        }

        function removeOverflowHidden() {
            var $iFrame = $("#"+activeTabId+" .melis-iframe");
                if ( $iFrame.length ) {
                    $body.prop("style", null);
                }
        }

        /**
         * Inserts class in body tag
         * @param {string} bodyClass string class added on body tag
         */
        function addBodyClass( bodyClass ) {
            setTimeout(function() {
                var $pageElements = $("#melis-id-body-content-load .page-elements");
                    if ( $pageElements.length ) {
                        $body.addClass( bodyClass );
                    }
                    else {
                        $body.removeClass( bodyClass );
                    }
            }, 2000);
        }

        /**
         * hideModal
         * Specifically for $hideModal.hide() as per bootstrap 5.3.3
         */
        function hideModal( modalID ) {
            // works on page workflow button  
            const $hideModal = bootstrap.Modal.getOrCreateInstance("#"+modalID);
                $hideModal.hide();
        }

        /**
         * showModal
         * Specifically for $showModal.show() as per bootstrap 5.3.3
         */
        function showModal( modalID ) {
            const $showModal = new bootstrap.Modal("#"+modalID, { show: true, backdrop: true });
                $showModal.show();
        }

        /**
         * toggle bootstrap 5.3.3 collapse component
         * document.querySelector(".widget-body[data-step='1']")
         * <div class="widget-body" data-step="1"></div>,
         * $elSelector, triggers the collapse
         * collaseEl, .collapse .card .card-body
         */
        function toggleCollapse( $elSelector, collapseEl ) {
            var selectorId      = $elSelector.attr("id");
                selectClassName = $elSelector[0].classList[0];

                if ( typeof selectorId != "undefined" ) {
                    var $selector = document.getElementById(selectorId);

                        // $selector, element that triggers the collapse
                        $selector.addEventListener('click', function() {
                            var collapseElement = new bootstrap.Collapse(collapseEl, {
                                toggle: false
                            });
            
                            collapseElement.toggle();
                        });
                }
                else if ( selectClassName != "" ) {
                    const collapseElementList = document.querySelectorAll("."+selectClassName);
                    const collapseList = [...collapseElementList].map(collapseEl => new bootstrap.Collapse(collapseEl));
                }
        }
        
        return {
            // modal
            confirm: confirm,
            closeDialog: closeDialog,

            // alert
            alertDanger: alertDanger,
            alertSuccess: alertSuccess,
            alertInfo: alertInfo,
            alertWarning: alertWarning,
            hideAlert: hideAlert,

            // forms
            clearForm: clearForm,
            highlightErrors: highlightErrors,
            resetLabels: resetLabels,
            processing: processing,
            processDone: processDone,

            // table
            exportData: exportData,
            isTableEmpty: isTableEmpty,

            // tabs
            switchTab: switchTab,
            showOnlyTab: showOnlyTab,
            showTab: showTab,
            showTabs: showTabs,
            hideTab: hideTab,
            hideTabs: hideTabs,
            hideAllTabs: hideAllTabs,
            showAllTabs: showAllTabs,

            // action
            pending: pending,
            done: done,

            // date
            init: init,

            // image changer
            changeImage: changeImage,

            // overflow-x: hidden body tag
            addOverflowHidden : addOverflowHidden,
            removeOverflowHidden : removeOverflowHidden,

            // adds a class on body tag
            addBodyClass : addBodyClass,

            // utility function hide and show bootstrap modal 5.3.3
            hideModal : hideModal,
            showModal : showModal,

            // utility function to add loading on activeTabId
            processingActiveTabId: processingActiveTabId
        }
})(window);