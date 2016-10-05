if ($('#nav-tabs-li-' + node.data.tab_id).length) {
                    $('.content-nav-tabs .widget-head > ul > li.active').removeClass('active');
                    $('.content-iframe .tab-content.full-width > .tab-pane.full-width.active').removeClass('active');
                    $('#nav-tabs-li-' + node.data.tab_id).attr('style', '').addClass('active');
                    $('#tabContent-div-' + node.data.tab_id).attr('style', '').addClass('active');

                } else {

                    // Desactive 
                    $('.content-nav-tabs .widget-head > ul > li.active').removeClass('active');
                    // Creat New item Tab
                    $newTabItem = jQuery('<li/>', {
                        id: 'nav-tabs-li-' + node.data.tab_id,
                        class: 'active',
                        'data-id': node.data.tab_id,
                        html: '<a class="glyphicons file" href="#tabContent-' + node.data.tab_id + '" data-toggle="tab"><i></i>' + node.data.tab_name + '</a><a class="close" data-idtab="' + node.data.tab_id + '">Close</a>'
                    });
                    // Append New item Tab
                    $('.content-nav-tabs .widget-head ul').append($newTabItem);

                    // Desactive 
                    $('.content-iframe .tab-content.full-width > .tab-pane.full-width.active').removeClass('active');

                    // Add Iframe or Ajax
                    if (node.data.load == "iframe") {
                        // Iframe
                        // Creat New Content
                        $newTabContent = jQuery('<div/>', {
                            id: 'tabContent-div-' + node.data.tab_id,
                            class: 'tab-pane full-width active',
                            html: '<iframe name="myiframe" id="myiframe-' + node.data.tab_id + '" class="myiframe iframe-content" src="' + node.data.href + '" width="100%" height="100%"></iframe>'
                        });
                        $('.content-iframe .tab-content.full-width').append($newTabContent);
                        $.notify("New Tab '" + node.data.tab_name + "' has add", "success");

                    } else {
                        // Ajax
                        // Creat New Content
                        $.ajax({
                            url: node.data.href,
                            success: function(msg) {
                                $newTabContent = jQuery('<div/>', {
                                    id: 'tabContent-div-' + node.data.tab_id,
                                    class: 'tab-pane full-width active',
                                    html: msg
                                });
                                $('.content-iframe .tab-content.full-width').append($newTabContent);
                                $.notify('New Tab "' + node.data.tab_name + '" has add', "success");
                            }
                        });
                    }
                }
                $('.content-nav-tabs .widget-head ul .close').click(function() {
                    $('#nav-tabs-li-' + $(this).data('idtab')).hide().removeClass('active');
                    $('#tabContent-div-' + $(this).data('idtab')).hide().removeClass('active');
                    $.notify('Tab has close', "warn");
                });

                initNavTabs();