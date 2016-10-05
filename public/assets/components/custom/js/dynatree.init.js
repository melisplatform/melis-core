/* Remove Envato Frame */
if (window.location != window.parent.location)
    top.location.href = document.location.href;

(function ($, window) {
    // On Load
    $(window).on('load', function () {
        $('#id-mod-menu-dynatree').dynatree({
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
           onRender: function (node, event) {
                $(node.li).find('.dynatree-icon').addClass(node.data.iconTab).removeClass('dynatree-icon');
                MelisHelper.utils.addData($(node.li), node);

                MelisHelper.utils.initNicescrollRails();
               
               // Open default tabs
                
               // ORIGINAL CODE -  COMMENTED BELOW - by hans
               // ================================================================
               // if(node.data.defaultOpen){
               //    $(node.li).find('.dynatree-title').trigger('click');
               // }
               // ================================================================= 
                
                //DynatreeEvents.onRender(node, event);
            },
            
            onClick: function (node, event) {
                //console.log('trigger click : ' + node.data.title);
                if(node.getEventTargetType(event) === 'title'){
                    MelisHelper.tabs.add(node);
                   console.log("node = "+node);

                }

                //DynatreeEvents.onClick(node, event);
            },
            onLazyRead: function (node) {
                //console.log($(this).attr('class'));
                // Mockup a slow reqeuest ...
                node.appendAjax({
                    url: node.data.isLazyXhr,
                    debugLazyDelay: 750, // don't do this in production code
                    success: function (node) {
                        MelisHelper.utils.initNicescrollRails();
                      
                        //initConextMenu();
                    },
                    error: function (e) {
                        alert('Error from load Dynatree XHR LazyRead : ' + e);
                    }
                });
            },
            onExpand: function (node) {
                MelisHelper.utils.initNicescrollRails();
                return true;
            },
            dnd: {
                onDragStart: function (node) {
                    /** This function MUST be defined to enable dragging for the tree.
                     *  Return false to cancel dragging of node.
                     */
                    console.log("tree.onDragStart(%o)", node);
                    return true;
                },
                onDragStop: function (node) {
                    // This function is optional.
                    console.log("tree.onDragStop(%o)", node);
                },
                autoExpandMS: 1000,
                preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
                onDragEnter: function (node, sourceNode) {
                    /** sourceNode may be null for non-dynatree droppables.
                     *  Return false to disallow dropping on node. In this case
                     *  onDragOver and onDragLeave are not called.
                     *  Return 'over', 'before, or 'after' to force a hitMode.
                     *  Return ['before', 'after'] to restrict available hitModes.
                     *  Any other return value will calc the hitMode from the cursor position.
                     */
                    console.log("tree.onDragEnter(%o, %o)", node, sourceNode);
                    return true;
                },
                onDragOver: function (node, sourceNode, hitMode) {
                    /** Return false to disallow dropping this node.
                     *
                     */
                    console.log("tree.onDragOver(%o, %o, %o)", node, sourceNode, hitMode);
                    // Prevent dropping a parent below it's own child
                    if (node.isDescendantOf(sourceNode)) {
                        return false;
                    }
                    // Prohibit creating childs in non-folders (only sorting allowed)
                    if (!node.data.isFolder && hitMode === "over") {
                        return "after";
                    }
                },
                onDrop: function (node, sourceNode, hitMode, ui, draggable) {
                    /** This function MUST be defined to enable dropping of items on
                     * the tree.
                     */
                    console.log("tree.onDrop(%o, %o, %s)", node, sourceNode, hitMode);
                    sourceNode.move(node, hitMode);
                    // expand the drop target
                    //        sourceNode.expand(true);
                },
                onDragLeave: function (node, sourceNode) {
                    /** Always called if onDragEnter was called.
                     */
                    console.log("tree.onDragLeave(%o, %o)", node, sourceNode);
                }
            }
        });

    });
})(jQuery, window);

