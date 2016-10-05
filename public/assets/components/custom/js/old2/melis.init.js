  var o = {
    global: {
      classBootModalAjax: '.boot-modal-ajax'
    }
  };

  MELIS.active_key = "home";
  /**********************************
  Config jquery.dynatree
  */
  _canLog = MELIS.plugins.tree.debug;
  /* Remove Envato Frame */
  if (window.location != window.parent.location) top.location.href = document.location.href;
  (function($, window) {
    window.onunload = function() {};
    //alert($('.tab-pane.active.full-width').height());
    //$('.iframe-content').attr({"width":$('.tab-pane.active.full-width').width()+'px',"height":$('.tab-pane.active.full-width').height()+'px'});
    window.initTinymce = function() {
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
    };
    initTinymce();
    window.resizeIframe = function() {
      setTimeout(function() {
        $('.iframe-content').attr({
          "width": $('#'+MELIS.idBodyContentLoader).width() + 'px',
          "height": $('#'+MELIS.idBodyContentLoader).height() + 'px'
        });
      }, 100);
    };
    $(window).resize(function() {
      resizeIframe();
    });
    //$().alert('close');
    window.initConextMenu = function() {
      $('.context').contextmenu({
        target: '#context-menu',
        before: function(e, context) {
          // execute code before context menu if shown
        },
        onItem: function(context, e) {
          // execute on menu item selection
        }
      });
    };
    initConextMenu();
    $('#myModal').on('show.bs.modal', function(event) {
      var button = $(event.relatedTarget); // Button that triggered the modal
      var href = button.data('model-href'); // Extract info from data-* attributes
      var title = button.data('model-title');
      // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
      // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
      var modal = $(this);
      modal.find('.modal-body').text('New message to ' + href);
      $.ajax({
        url: href,
        success: function(msg) {
          //alert(srctarget);
          modal.find('.modal-title').text(title);
          modal.find('.modal-body').html(msg);
        }
      });
    });
    // --- Initialize first Dynatree -------------------------------------------
    $('#' + MELIS.plugins.tabs.levelB.idLevelB + ' li > a').bind('click', function() {
      //console.log($(this).data('option'));
      $('#' + MELIS.plugins.tabs.levelA.idLevelA + ' li').attr('data-currentOption', $(this).data('option'))
    });
    MelisHelper.initShowOptions();
    MelisHelper.initOptions();
    //initShowOptions
    $("#" + MELIS.plugins.tree.id).dynatree({
      fx: {
        height: "toggle",
        duration: 200
      },
      autoCollapse: false,
      classNames: {
        liClass: " dynatree-parent-item "
      },
      initAjax: {
        url: MELIS.plugins.tree.pathXhr
      },
      onRender: function(node, event) {
        DynatreeEvents.onRender(node, event);
      },
      onClick: function(node, event) {
        DynatreeEvents.onClick(node, event);
      },
      onLazyRead: function(node) {
        //console.log($(this).attr('class'));
        // Mockup a slow reqeuest ...
        node.appendAjax({
          url: "sample-data2.json",
          debugLazyDelay: 750, // don't do this in production code
          success: function(node) {
            DynatreeEvents.initNicescrollRails();
            initConextMenu();
          }
        });
      },
      onExpand: function(node) {
        DynatreeEvents.initNicescrollRails();
        return true;
      },
      dnd: {
        onDragStart: function(node) {
          /** This function MUST be defined to enable dragging for the tree.
           *  Return false to cancel dragging of node.
           */
          logMsg("tree.onDragStart(%o)", node);
          return true;
        },
        onDragStop: function(node) {
          // This function is optional.
          logMsg("tree.onDragStop(%o)", node);
        },
        autoExpandMS: 1000,
        preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
        onDragEnter: function(node, sourceNode) {
          /** sourceNode may be null for non-dynatree droppables.
           *  Return false to disallow dropping on node. In this case
           *  onDragOver and onDragLeave are not called.
           *  Return 'over', 'before, or 'after' to force a hitMode.
           *  Return ['before', 'after'] to restrict available hitModes.
           *  Any other return value will calc the hitMode from the cursor position.
           */
          logMsg("tree.onDragEnter(%o, %o)", node, sourceNode);
          return true;
        },
        onDragOver: function(node, sourceNode, hitMode) {
          /** Return false to disallow dropping this node.
           *
           */
          logMsg("tree.onDragOver(%o, %o, %o)", node, sourceNode, hitMode);
          // Prevent dropping a parent below it's own child
          if (node.isDescendantOf(sourceNode)) {
            return false;
          }
          // Prohibit creating childs in non-folders (only sorting allowed)
          if (!node.data.isFolder && hitMode === "over") {
            return "after";
          }
        },
        onDrop: function(node, sourceNode, hitMode, ui, draggable) {
          /** This function MUST be defined to enable dropping of items on
           * the tree.
           */
          logMsg("tree.onDrop(%o, %o, %s)", node, sourceNode, hitMode);
          sourceNode.move(node, hitMode);
          // expand the drop target
          //        sourceNode.expand(true);
        },
        onDragLeave: function(node, sourceNode) {
          /** Always called if onDragEnter was called.
           */
          logMsg("tree.onDragLeave(%o, %o)", node, sourceNode);
        }
      }
    });
    //$.notify("Melis init success !", "success");
    $.gritter.add({
      // (string | mandatory) the heading of the notification
      title: 'Melis CMMS is ready',
      // (string | mandatory) the text inside the notification
      //text: 'This will fade out after a certain amount of time. Vivamus eget tincidunt velit. Cum sociis natoque penatibus et <a href="#">magnis dis parturient</a> montes, nascetur ridiculus mus.',
      // (string | optional) the image to display on the left
      //image: 'https://si0.twimg.com/profile_images/2873657673/f56ad0e8a62b588ad92b19969084b2ab_bigger.png',
      // (bool | optional) if you want it to fade out on its own or just sit there
      sticky: false,
      // (int | optional) the time you want it to be alive for before fading out
      time: '2000'
      // (string | optional) the class name you want to apply to that specific message
      //class_name: 'gritter-primary'
    });
    //$mls_nt.notification('warning', 'Notification Test 3');
    //$mls_nt.notification('info', 'Notification Test 4');

      // init Click Home Level A
      MelisHelper.initNewItemMainTabs('home', '#' + MELIS.plugins.tabs.levelA.idLevelA + ' ul #' + MELIS.plugins.tabs.levelA.idItem + 'home', null);
  })(jQuery, window);