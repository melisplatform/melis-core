/* Remove Envato Frame */
if (window.location != window.parent.location)
  top.location.href = document.location.href;


// define module
var MelisHelper;
MelisHelper = (function (window) {

  var version = "2.0.0";

  return {

    $selector: {
      $dynatree: $('#id-menu-dynatree'),
      $navBarTabs: $('#melis-id-nav-bar-tabs'),
      $bodyContentLoad: $('#melis-id-body-content-load')
    },

    node: {},

    utils: {

      version: function () {
        console.info(version);
      },

      initNicescrollRails: function () {
    	
    	// custom added code to fix the scrollbars - hans
    	$('.hasNiceScroll').niceScroll({cursorcolor:"#CB4040", cursorborder: "#CB4040"});

    	// =================== ORIGINAL CODE - COMMENTED CODE BELOW =====================
        // $('.hasNiceScroll').getNiceScroll().resize();
      },
      addData: function ($elem, node) {
        if (node.data.melisData) {
          for (var k in node.data.melisData) {
            if (node.data.melisData.hasOwnProperty(k)) {
              $elem.attr('data-' + k, node.data.melisData[k]);
            }
          }
        }
      },
      iframe: {
        getWidth: function () {
          var width = MelisHelper.$selector.$bodyContentLoad.width() - 20;
          return width + 'px';
        },
        getHeight: function () {
          return '450px';
        }
      }
    },

    content: {
      initLoad: function (node) {

        switch (node.data.typeContainer) {
          case 'single':

            MelisHelper.content.load(
              node.data.tabs[node.data.defaultTabs].melisID,
              node.data.tabs[node.data.defaultTabs].typeLoad,
              node.data.tabs[node.data.defaultTabs].urlLoad,
              node.data.tabs[node.data.defaultTabs].melisData,
              function (id, data, response) {

                $single = MelisHelper.content.getSingleContainer(node);
                MelisHelper.content.setSingleContainer($single, response);

                if (node.data.tabs[node.data.defaultTabs].callback)
                  eval(node.data.tabs[node.data.defaultTabs].callback);
              }
            );

            break;

          case 'tabs':

            $tabs = MelisHelper.content.getTabsContainer(node);
            MelisHelper.content.setTabsContainer($tabs);

            if (node.data.tabs) {
              for (var k in node.data.tabs) {
                if (!node.data.tabs.hasOwnProperty(k)) {
                  console.error('getTabsContainer error data.tabs');
                } else {
                  if (node.data.tabs[k].active) {

                    MelisHelper.content.load(
                      node.data.tabs[k].melisID,
                      node.data.tabs[k].typeLoad,
                      node.data.tabs[k].urlLoad,
                      node.data.tabs[k].melisData,
                      function (id, data, response) {
                        $('#id-container-level-tab-' + id).append(response);

                        if (data.callback)
                          eval(data.callback);
                      }
                    );

                  }

                }
              }
            }

            break;

          default:
            return false;
        }


      },
      load: function (id, typeload, url, data, callback) {
        switch (typeload) {
          case 'xhr':

            var request = $.ajax({
              method: "POST",
              url: url,
              data: data,
              context: this
            });

            request.done(function (response) {
              callback.call(this, id, data, response);
              //callback(id, data, response);
            });

            request.fail(function (jqXHR, textStatus) {
              console.error("MelisHelper error content load : " + textStatus);
            });

            break;

          case 'iframe':
            var $iframe = '<iframe name="iframe-level-tab" id="id-iframe-level-tab-' + id + '" class="iframe-level-tab iframe-content" src="' + url + '" width="' + MelisHelper.utils.iframe.getWidth() + '" height="' + MelisHelper.utils.iframe.getHeight() + '"></iframe>';
            callback(id, data, $iframe);
            break;
        }
      },
      getSingleContainer: function (node) {
        var $div = jQuery('<div/>', {
          id: "id-container-level-a-" + node.data.melisID,
          class: 'container-level-a',
          'data-key': node.data.key,
          html: function () {
            // Default template
            var tpl = '';
            return tpl;
          }
        });
        return $div;
      },
      getTabsContainer: function (node) {

        var $label = $tabs = classActive = '';
        if (node.data.tabs) {
          for (var k in node.data.tabs) {
            if (!node.data.tabs.hasOwnProperty(k)) {
              console.error('getTabsContainer error data.tabs');
            } else {
              if (node.data.tabs[k].active) {
                classActive = (node.data.tabs[k].default) ? ' active ' : '';
                $label += '<li class="' + classActive + '"><a class=" ' + node.data.tabs[k].iconTab + '" href="#id-container-level-tab-' + node.data.tabs[k].melisID + '" data-bs-toggle="tab"><i></i><span>' + node.data.tabs[k].title + '</span></a> </li>';
                $tabs += '<div id="id-container-level-tab-' + node.data.tabs[k].melisID + '" class="tab-pane widget-body-regular' + classActive + '"></div>';
              }

            }
          }
        }


        var $div = jQuery('<div/>', {
          id: "id-container-level-a-" + node.data.melisID,
          class: 'container-level-a',
          'data-key': node.data.key,
          html: function () {
            // Default template
            var tpl =
              '<div class="widget widget-tabs widget-tabs-double-2 widget-tabs-responsive">' +
              '<div class="widget-head"> <ul class="tabs-label"> ' + $label + ' </ul> </div>' +
              '<div class="widget-body"> <div class="tab-content"> ' + $tabs + ' </div> </div>' +
              '</div>';
            return tpl;
          }
        });
        return $div;
      },
      setSingleContainer: function ($div, responseXHR) {
        MelisHelper.$selector.$bodyContentLoad.append($div);
        MelisHelper.$selector.$bodyContentLoad.find($div).append(responseXHR);
      },
      setTabsContainer: function ($div) {
        MelisHelper.$selector.$bodyContentLoad.append($div);
        //MelisHelper.$selector.$bodyContentLoad.find($div).append("ok");
      }
    },

    tabs: {

      close: function (melisID) {
        MelisHelper.$selector.$navBarTabs.find("li[data-melisID='" + melisID + "']").hide();
      },

      show: function (melisID) {
        MelisHelper.$selector.$navBarTabs.find('li.active').removeClass('active');
        MelisHelper.$selector.$navBarTabs.find("li[data-melisID='" + melisID + "']").show().addClass('active');
        $("#content .container-level-a").hide();
        $("#id-container-level-a-" + melisID).show();
      },

      add: function (node) {


        if (MelisHelper.$selector.$navBarTabs.find("li[data-melisID='" + node.data.melisID + "']").length === 0) {
          var $tabs = jQuery('<li/>', {
            id: "id-nav-bar-tabs-" + node.data.key,
            class: '',
            'data-key': node.data.key,
            'melisID': node.data.melisID,
            html: function () {
              // Default template
              var tpl = '<a class="dropdown-toggle menu-icon" data-key="' + node.data.key + '" data-bs-toggle="tab" onclick="MelisHelper.tabs.open(\'' + node.data.melisID + '\')">' +
                '<i class="' + node.data.iconTab + ' fa-2x"></i>' + node.data.title +
                '</a>';
              // Add button close
              if (!node.data.noClosable) {
                tpl += '<a class="close fa fa-close" data-melisID="' + node.data.melisID + '" data-key="' + node.data.key + '" onclick="MelisHelper.tabs.close(\'' + node.data.melisID + '\')">Close</a>';
              }
              return tpl;
            }
          });

          MelisHelper.utils.addData($tabs, node);
          MelisHelper.utils.addData($tabs.find('.btn-tabs-link'), node);

          MelisHelper.$selector.$navBarTabs.append($tabs);

          MelisHelper.content.initLoad(node);
          MelisHelper.tabs.show(node.data.melisID);

        }
        else {
          MelisHelper.tabs.show(node.data.melisID);
        }


        return true;

      },

      open: function (melisID) {
        MelisHelper.$selector.$dynatree.find("li[data-melisID='" + melisID + "'] .dynatree-title").trigger('click');
      }

    },

    directive: {
      load: function (id) {

        $element = $('[data-directive-id="' + id + '"]');

        var params = $element.data();

        $.getJSON(params.directiveTemplate, params, function (response) {
          $element.html(response.content);
          eval(response.callback);

        });


      }
    },

    tree: {}


  };


})(window);


  //custom added scripts for Melic Core
  // Temporary solution

  var tabContainer = $("#melis-id-nav-bar-tabs");
  //append a dummy tab for the dashboard
  tabContainer.append('<li id="id-nav-bar-tabs-_2" class="active" data-key="_2" melisid="55da1e00be9b7215f5ab3b-a1" data-melisid="55da1e00be9b7215f5ab3b-a1" data-melis_id="55da1e00be9b7215f5ab3b-a1-b1" data-melis_param_index="0" data-melis_param_guid="24e53e1b-97ad-49c8-9b7d-b19192a2f29b"><a class="dropdown-toggle menu-icon" data-key="_2" data-bs-toggle="tab" onclick="MelisHelper.tabs.open(55da1e00be9b7215f5ab3b-a1)"><i class="fa fa-tachometer fa-2x"></i>Dashboard</a></li>');
 

  $("#id-menu-dynatree li a").on('click', function(){

    // run all the <li> to remove the 'active class'
    tabContainer.children("li").each(function(){
      $(this).removeClass('active');
    });
     
    $("#melis-id-nav-bar-tabs").append('<li id="id-nav-bar-tabs-_2" class="active" ><a class="dropdown-toggle menu-icon"><i class="fa fa-tachometer fa-2x"></i>Dashboard</a><a class="close close-dummy-nav fa fa-close">Close</a></li>');
   
  });
