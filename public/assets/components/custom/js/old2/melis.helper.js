// define module
var MelisHelper = (function (window) {
    var testvar = 2,
        testfn = function () {
            console.log("testfn = " + testvar);
        };
    var _canLog = MELIS.debug;

    function _log(mode, msg) {
        /**
         * Usage: logMsg("%o was toggled", this);
         */
        if (!_canLog) {
            return;
        }
        // Remove first argument
        var args = Array.prototype.slice.apply(arguments, [1]);
        // Prepend timestamp
        var dt = new Date();
        var tag = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + "." + dt.getMilliseconds();
        args[0] = tag + " - " + args[0];
        try {
            switch (mode) {
                case "info":
                    window.console.info.apply(window.console, args);
                    break;
                case "warn":
                    window.console.warn.apply(window.console, args);
                    break;
                case "error":
                    window.console.error.apply(window.console, args);
                    break;
                default:
                    window.console.log.apply(window.console, args);
                    break;
            }
        } catch (e) {
            if (!window.console) {
                _canLog = false; // Permanently disable, when logging is not supported by the browser
            } else if (e.number === -2146827850) {
                // fix for IE8, where window.console.log() exists, but does not support .apply()
                window.console.log(args.join(", "));
            }
        }
    }

    return {
        log: function (mode, msg) {
            _log(mode, msg);
        },
        getOptionsValFromId: function (key) {
            return $.grep(MELIS.treeOptionsVal, function (e) {
                return e.id == key;
            })
        },
        getOptionsValFromIdAnsOption: function (key, option) {
            var obj = $.grep(MELIS.treeOptionsVal, function (e) {
                return e.id == key;
            });
            return obj.optionsVal[option];
        },
        getOptionsValFromActiveIdAnsOption: function () {
            var obj = $.grep(MELIS.treeOptionsVal, function (e) {
                return e.id == MELIS.active_key;
            });
            return obj[0].optionsVal[MELIS.active_option];
        },
        getIdMenuItem: function (key) {
            return MELIS.plugins.tree.idItem + key;
        },
        getIdLevelA: function (key) {
            return MELIS.plugins.tabs.levelA.idItem + key;
        },
        getIdPageFormKey: function (key) {
            return MELIS.plugins.pages.idItem + key;
        },
        getIdPage: function () {
            return MELIS.plugins.pages.idItem + '-key_' + MELIS.active_key + '-option_' + MELIS.active_option;
        },
        getIdMenuItemCurrent: function () {
            return MELIS.plugins.tree.idItem + MELIS.active_key;
        },
        getIdLevelACurrent: function () {
            return MELIS.plugins.tabs.levelA.idItem + MELIS.active_key;
        },
        getActiveLevelAByClass: function(){
          return   $('#' + MELIS.plugins.tabs.levelA.idLevelA + " > ul > li.active").data('key');
        },
        getIdPageCurrent: function () {
            return MELIS.plugins.pages.idItem + MELIS.active_key;
        },
        getActiveCurrentItemLevelA: function () {

            if ($('#' + MELIS.plugins.tabs.levelA.idLevelA + " li#" + MelisHelper.getIdLevelACurrent()).attr('data-option')) {
                MELIS.active_option = $('#' + MELIS.plugins.tabs.levelA.idLevelA + " li#" + MelisHelper.getIdLevelACurrent()).attr('data-option');
            } else {
                MELIS.active_option = $('#' + MELIS.plugins.tabs.levelA.idLevelA + " li#" + MelisHelper.getIdLevelACurrent()).attr('data-defaultoptions');
            }
            return true;
        },
        setActiveCurrentItemLevelB: function () {
            if (MelisHelper.getActiveCurrentItemLevelA()) {
                $("#" + MELIS.plugins.tabs.levelB.idLevelB + " li.active").removeClass("active");
                $("#" + MELIS.plugins.tabs.levelB.idLevelB + " li[data-option=" + MELIS.active_option + "]").addClass("active");
            }
            MelisHelper.setActiveCurrentView();
        },
        setActiveCurrentView: function () {

            //console.log('setActiveCurrentView');
            $("#" + MELIS.idBodyContentLoader + ' .' + MELIS.classNewPageInclude.commun).removeClass('active').hide();

            if(MELIS.active_key == "home"){
                $("#id-maintabs-home").show();
            }else{
                if (!$("#" + MelisHelper.getIdPage()).length) {
                    $("#" + MELIS.idBodyContentLoader).append(MelisHelper.templateContent());
                } else {
                    $("#" + MelisHelper.getIdPage()).addClass('active').show();
                }
            }

        },
        getIframeId: function (id) {
            return "iframe-" + id;
        },
        getXhrId: function (id) {
            return "xhr-" + id;
        },
        initTinymce: function () {
            tinymce.init({
                selector: "h1.editable",
                inline: true,
                toolbar: "undo redo",
                menubar: false
            });
            tinymce.init({
                selector: "div.editable",
                inline: true,
                plugins: ["advlist autolink lists link image charmap print preview anchor", "searchreplace visualblocks code fullscreen", "insertdatetime media table contextmenu paste"],
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
            });
        },
        templateContent: function () {


            var optionVal = MelisHelper.getOptionsValFromActiveIdAnsOption();

            var _typeload = optionVal.typeload,
                _src = optionVal.src,
                _class = '';

            switch (_typeload) {
                case 'iframe':
                    _class = ' tab-pane ' + MELIS.classNewPageInclude.iframe + ' ';
                    break;
                case 'xhr':
                    _class = ' tab-pane full-width ' + MELIS.classNewPageInclude.xhr + ' ';
                    break;
                default:
                    _class = ' tab-pane ' + MELIS.classNewPageInclude.iframe + ' ';
            }

            return jQuery('<div/>', {
                id: MelisHelper.getIdPage(),
                class: 'active ' + MELIS.classNewPageInclude.commun + _class,
                'data-key': MELIS.active_key,
                'data-option': MELIS.active_option,
                'data-typeload': _typeload,
                'data-src': _src,
                html: function () {
                    var result;
                    switch (_typeload) {
                        case 'iframe':
                            $('body').removeClass('bodyxhr');
                            result = '<iframe name="myiframe" id="' + MelisHelper.getIframeId(MelisHelper.getIdPage()) + '" class="myiframe iframe-content" src="' + _src + '" width="' + $('#' + MELIS.idBodyContentLoader).width() + 'px" height="' + $('#' + MELIS.idBodyContentLoader).height() + 'px"></iframe>';
                            break;
                        case 'xhr':
                            $('body').addClass('bodyxhr');
                            result = '<div id="' + MelisHelper.getXhrId(MelisHelper.getIdPage()) + '"></div>';
                            $.ajax({
                                type: "POST",
                                url: _src,
                                success: function (msg) {
                                    $("#" + MelisHelper.getXhrId(MelisHelper.getIdPage()) ).html(msg);
                                }
                            });
                            break;
                        default:
                            result = '<iframe name="myiframe" id="iframe-' + MelisHelper.getIdPage() + '" class="myiframe iframe-content" src="' + _src + '" width="' + $('#' + MELIS.idBodyContentLoader).width() + 'px" height="' + $('#' + MELIS.idBodyContentLoader).height() + 'px"></iframe>';
                    }
                    return result;
                }

            });
        },
        tempaleContentIframe: function () {
            return '';
        },

        // click to element level A
        initNewItemMainTabs: function (key, element, options) {

            $(element).find('.btntablink').on('click', function () {
                MELIS.active_key = key;
                if(key == 'home'){
                    MelisHelper.initItemDynatree(key);
                }else{
                    MelisHelper.initItemDynatree(key);
                    MelisHelper.initShowOptions(options);
                }
            });
        },
        initItemDynatree: function (key) {
            $("#" + MELIS.plugins.tree.idItem + key).trigger('click');
            $("#" + MELIS.plugins.tree.id + " .dynatree-node." + MELIS.plugins.tree.classActive).removeClass(MELIS.plugins.tree.classActive);
            $("#" + MELIS.plugins.tree.idItem + key + " > .dynatree-node").addClass(MELIS.plugins.tree.classActive);
        },
        initActiveDynatree: function (key) {
            $("#" + MELIS.plugins.tree.idItem + key).trigger('click');
            $("#" + MELIS.plugins.tree.id + " .dynatree-node." + MELIS.plugins.tree.classActive).removeClass(MELIS.plugins.tree.classActive);
            $("#" + MELIS.plugins.tree.idItem + key + " > .dynatree-node").addClass(MELIS.plugins.tree.classActive);
        },
        initShowOptions: function (items) {
            if (items) {
                $("#" + MELIS.plugins.tabs.levelB.idWrapLevelB).show();
                $('body').removeClass("hide-levelB").addClass("show-levelB");
                $("#" + MELIS.plugins.tabs.levelB.idLevelB + " li").hide();
                var i = 0,
                    ActiveCurrentItemLevelA = MelisHelper.getActiveCurrentItemLevelA();
                items.forEach(function (entry) {
                    i++;
                    $("#" + MELIS.plugins.tabs.levelB.idLevelB + " li[data-option=" + entry + "]").show();
                });
                //alert(MELIS.active_option);
                MelisHelper.setActiveCurrentItemLevelB();
            } else {
                $("#" + MELIS.plugins.tabs.levelB.idWrapLevelB).hide();
                $('body').removeClass("show-levelB").addClass("hide-levelB");
                MelisHelper.setActiveCurrentView();
            }
            //MelisHelper.log(items);
        },
        initOptions: function () {
            $("#" + MELIS.plugins.tabs.levelB.idLevelB + " li").bind("click", function () {
                var entry = $(this).attr('data-option');
                MELIS.active_option = entry;
                $('#' + MELIS.plugins.tabs.levelA.idLevelA + " li#" + MelisHelper.getIdLevelACurrent()).attr('data-option', entry);
                MelisHelper.setActiveCurrentView();
            });
        }
    };
})(window);