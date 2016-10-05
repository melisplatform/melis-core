// define module
var DynatreeEvents = (function (window) {
    var
        getIdMenuItem = function (key) {
            return MELIS.plugins.tree.idItem + key;
        },
        getIdLevelA = function (key) {
            return MELIS.plugins.tabs.levelA.idItem + key;
        },
        getIdPage = function (key) {
            return MELIS.plugins.pages.idItem + key;
        },
        templateItemLevelA = function (data, key, title) {
            var idMenuItem = getIdMenuItem(key),
                iconeTab = ($("#" + idMenuItem + " .item-tree").data("iconetab") != "") ? $("#" + idMenuItem + " .item-tree").data("iconetab") : MELIS.plugins.tabs.levelA.iconeDefault;

            return jQuery('<li/>', {
                id: getIdLevelA(key),
                class: 'active',
                'data-key': key,
                'data-showOptions': (data.hideOption == true) ? 'hide' : 'show',
                'data-defaultOptions': data.options[0],
                'data-typeload': data.typeload,
                'data-src': data.src,
                html: '<a class="btntablink ' + iconeTab + '" data-key="' + key + '" data-href="#' + MelisHelper.getIdPageFormKey(key) + '" data-toggle="tab">\
                  <i class="fa fa-2x fa-' + iconeTab + '"></i>' + title + '\
               </a>\
               <a class="close" data-key="' + key + '">Close</a>'
            });
        },
        templateItemLevelAActive = function (key) {

            console.log(key);

            $('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul li.active').removeClass('active');

            $('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + getIdLevelA(key)).addClass('active');

            //MelisHelper.initItemDynatree(key);
            //MelisHelper.initShowOptions(options);
        };
    return {
        initNicescrollRails: function () {
            $('.hasNiceScroll').getNiceScroll().resize();
        },
        onRender: function (node, event) {

            var key = node.data.key,
                id = getIdMenuItem(key);

            if (node.data.optionsVal != undefined) {
                var obj = {
                    "id": node.data.key,
                    "optionsVal": node.data.optionsVal
                }
                //console.log(node.data.optionsVal);
                MELIS.treeOptionsVal.push(obj);
            }

            $(node.li).addClass(id).attr('id', id).attr('data-key', key);

            if(node.data.melisdata){
                for (var k in node.data.melisdata) {
                    if (node.data.melisdata.hasOwnProperty(k)) {
                        $(node.li).attr('data-'+k, node.data.melisdata[k]);
                    }
                }
            }

            if(node.data.iconeTab){
                $(node.li).find('.dynatree-icon').addClass('fa fa-' + node.data.icon).removeClass('dynatree-icon');
            }
            $(node.span.lastChild).attr('data-key', key);

            $("#" + MELIS.plugins.tree.idItem + MELIS.plugins.tabs.home.key + " > .dynatree-node").addClass(MELIS.plugins.tree.classActive);
            //MelisHelper.initNewItemMainTabs(MELIS.plugins.tabs.home.key, '#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + getIdLevelA(MELIS.plugins.tabs.home.key), node.data.options);
            return true;
        },
        onClick: function (node, event) {

            var key, title;
            MELIS.active_key = node.data.key;

            if (node.getEventTargetType(event) == 'title' || node.data.key == MELIS.plugins.tabs.home.key) {
                key = node.data.key;
                title = node.data.title;

                //MelisHelper.initNewItemMainTabs
                templateItemLevelAActive(key);
                if ($('#' + getIdLevelA(key)).length) {
                    $('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + getIdLevelA(key)).show();
                } else {
                    $template = templateItemLevelA(node.data, key, title);
                    if(node.data.melisdata){
                        for (var k in node.data.melisdata) {
                            if (node.data.melisdata.hasOwnProperty(k)) {
                                $template.attr('data-'+k, node.data.melisdata[k]);
                            }
                        }
                    }

                    $('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul').append($template);
                    MelisHelper.initNewItemMainTabs(key, '#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + getIdLevelA(key), node.data.options);
                    // Bind event close

                    $('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + getIdLevelA(key)).find('a.close').bind("click", function (event) {
                        $('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + getIdLevelA(key)).hide();
                        if ($('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + getIdLevelA(key)).hasClass('active')) {

                            templateItemLevelAActive(MELIS.plugins.tabs.home.key);
                            MelisHelper.initItemDynatree(MELIS.plugins.tabs.home.key);
                            //templateItemLevelAActive(MELIS.plugins.tabs.home.key);
                            //MelisHelper.setActiveCurrentView();

                            //$('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul li.active').removeClass('active');

                            //$('#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + getIdLevelA(MELIS.plugins.tabs.home.key)).addClass('active');

                           // console.log(MELIS.plugins.tabs.home.key);

                            //MelisHelper.initItemDynatree(MELIS.plugins.tabs.home.key);
                        }
                    });

                }
                MelisHelper.initShowOptions(node.data.options);
                return false; // Prevent default processing
            }
        },
        onLazyRead: function () {
            return false;
        },
        onExpand: function () {
            return false;
        }
    };
})(window);