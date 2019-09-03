/* Javasript for User Management Tool */

$(":file").filestyle({buttonBefore: true});

// re-initialize the rights treeview with current selected userID
function getRightsTree(userId) {

    var tree = $("#rights-fancytree").fancytree("getTree");
    tree.reload({
        url: source = '/melis/MelisCore/ToolUser/getRightsTreeView?userId=' + userId,
        lazyLoad: function (event, data) {
            alert("expanded");
        },
    });

    var checker = setInterval(function () {
        if (tree.count() > 1) {
            $("#btnEdit").removeClass("disabled").css("pointer-events", "auto");
            $("#btnEditRights").removeClass("disabled").css("pointer-events", "auto");
            clearInterval(checker);
        }
    }, 500);
}

var _tmpUserId = null;
window.setUserDateConnection = function (d) {
    d.usr_id = _tmpUserId;
};

// action buttons
$(document).ready(function () {
    var $body = $("body");

        //image preveiew
        $body.on('change','#id_n_usr_image', function() {
            var input = this;
                if ( input.files && input.files[0] ) {
                    var reader = new FileReader(),
                        $newProfileImg = $('#new-profile-image');

                        reader.onload = function (e) {
                            $newProfileImg.attr('src', e.target.result);
                        }
                        reader.readAsDataURL(input.files[0]);
                }
        });

        $body.on('change','#id_usr_image',function() {
            var $userImgRemove = $("#usr_image_remove");
                $userImgRemove.val("no");
        });

        //image remove
        $body.on('click','#btnDelImg',function() {
            var $userNImg       = $("#id_n_usr_image"),
                $newProfileImg  = $('#new-profile-image'),
                $nBadge         = $("label[for=id_n_usr_image] .badge"),
                $userImg        = $("#id_usr_image"),
                $userImgRemove  = $("input#usr_image_remove"),
                $profileImg     = $("#profile-image"),
                $badge          = $("label[for=id_usr_image] .badge");

                if( $userNImg.length > 0 ) {
                    $userNImg.val('');
                    $newProfileImg.attr('src', "/MelisCore/images/profile/default_picture.jpg");
                    $nBadge.remove();
                }

                if( $userImg.length > 0 ) {
                    $userImgRemove.val("yes");
                    $profileImg.attr('src', "/MelisCore/images/profile/default_picture.jpg");
                    $badge.remove();
                }
        });

        $body.on("switch-change", "#switch-user-api-status", function (e) {
            var $this   = $(this),
                id      = $this.attr("data-userid"),
                status  = 0;

                if ( $this.find("div").hasClass("switch-on") ) {
                    status = 1;
                }

                $.ajax({
                    type: 'POST',
                    url: '/melis/MelisCore/MelisCoreMicroService/updateStatus',
                    data: {id: id, status: status},
                    dataType: 'json',
                    encode: true
                });
        });

        $body.on('click', '.melis-opentooltreeview', function () {
            var $this       = $(this),
                toolName    = $this.data('tool-name'),
                toolId      = $this.data('tool-id'),
                melisKey    = $this.data('tool-meliskey'),
                userId      = $this.data('userid');
                melisHelper.tabOpen(toolName, 'fa-user', toolId, melisKey, {}, null, function () {
                    var checker = setInterval(function () {
                        var button = $('body').find('tr[id=' + userId + '] td .btnUserEdit');
                            if (button.length === 1) {
                                button.trigger('click');
                                clearInterval(checker);
                            }
                    }, 500);
                });
        })

        $body.on("click", '.btnUserEdit', function () {
            var id      = $(this).parents("tr").attr("id"),
                $suas   = $("#switch-user-api-status"),
                $tuvdc  = $("#tableUserViewDateConnection");

                melisCoreTool.hideAlert("#editformalert");
                melisCoreTool.hideTabs('#modal-user-management', '#id_meliscore_tool_user_new_modal,#id_meliscore_tool_user_new_rights_modal', '#id_meliscore_tool_user_edit_modal');
                melisCoreTool.resetLabels("#idusermanagement");
                toolUserManagement.retrieveUser(id);
                // Micro service status
                $suas.attr("data-userid", id);

                _tmpUserId = id;
                $tuvdc.DataTable().destroy();
                fntableUserViewDateConnectioninit();

                $.ajax({
                    type: 'POST',
                    url: '/melis/MelisCore/MelisCoreMicroService/getUserAuthData',
                    data: {id: id},
                    dataType: 'json',
                    encode: true
                }).done(function (data) {
                    var $apikey     = $("#melis-core-user-auth-api-key"),
                        $apiok      = $("#melis-core-user-auth-api-ok"),
                        $apiurl     = $("#melis-core-microservices-url"),
                        $suas_sa    = $("#switch-user-api-status .switch-animate");

                        $apikey.html("");
                        $apiok.addClass("hidden");
                        if (data.success) {
                            $apikey.html(data.response.api_key);
                            $apiurl.html('<a href="' + data.response.url + '" target="_blank">' + data.response.url + '</a>');
                            $apiok.removeClass("hidden");

                            if (data.response.status == 1) {
                                $suas_sa.removeClass("switch-off");
                                $suas_sa.addClass("switch-on");
                            } else {
                                $suas_sa.removeClass("switch-on");
                                $suas_sa.addClass("switch-off");
                            }
                        }
                        else {
                            $apiko.removeClass("hidden");
                        }
                }).fail(function() {
                    alert(translations.tr_meliscore_error_message);
                });
        });

        $body.on("click", "#btn-melis-core-user-gen-api", function () {
            var id = _tmpUserId;
                $.ajax({
                    type: 'POST',
                    url: 'melis/MelisCore/MelisCoreMicroService/generateApiKey',
                    data: {id: id},
                    dataType: 'json',
                    encode: true,
                }).done(function (data) {
                    var $apikey = $("#melis-core-user-auth-api-key"),
                        $apiok  = $("#melis-core-user-auth-api-ok"),
                        $apiko  = $("#melis-core-user-auth-api-ko"),
                        $apiurl = $("#melis-core-microservices-url"),
                        $suas   = $("#switch-user-api-status");

                        $apikey.html("");
                        $apiok.addClass("hidden");
                        $apiko.addClass("hidden");
                        if ( data.success ) {
                            $apikey.html(data.response.api_key);
                            $apiurl.html('<a href="' + data.response.url + '" target="_blank">' + data.response.url + '</a>');
                            $apiok.removeClass("hidden");

                            if (!$suas.find("div").hasClass("switch-on")) {
                                $suas.find("div").removeClass("switch-off");
                                $suas.find("div").addClass("switch-on");
                            }
                        }
                        else {
                            $apiko.removeClass("hidden");
                        }
                }).fail(function() {
                    alert(translations.tr_meliscore_error_message);
                });
        });

        $body.on("click", "#id_meliscore_tool_user_action_new_user", function () {
            melisNewUserRights();
            melisCoreTool.hideTabs('#modal-user-management', '#id_meliscore_tool_user_edit_modal,#id_meliscore_tool_user_rights_modal,#id_meliscore_tool_user_view_date_connection_modal,#id_meliscore_tool_user_microservice_modal', '#id_meliscore_tool_user_new_modal');
        });

        //open up user profile when user icon click in identity menu
        $body.on("click", "#btnUserInfoEdit", function () {
            var userName = $("#user-name-link").html().trim();
                melisHelper.tabOpen(userName, 'fa-user', 'id_meliscore_user_profile', 'meliscore_user_profile');
        });

        $body.on("click", '.btnUserDelete', function () {
            var id = $(this).parents("tr").attr("id");
                toolUserManagement.deleteUser(id);
        });

        $body.on("click", "#id_meliscore_tool_user_action_new_user", function () {
            var $numup = $("form#idnewusermanagement #id_n_usr_password");
                melisCoreTool.hideAlert("#newformalert");
                melisCoreTool.resetLabels("#idnewusermanagement");
                $numup.val("");
        });

        $body.on("click", ".btnMelisCoreUserExport", function () {
            var searched = $("input[type='search'][aria-controls='tableToolUserManagement']").val();
                if ( ! melisCoreTool.isTableEmpty( "tableToolUserManagement") ) {
                    melisCoreTool.exportData( '/melis/MelisCore/ToolUser/exportToCsv?filter=' + searched );
                }
        });
});

// call the empty rights data and put it inside the new user treeview
function melisNewUserRights() {
    var tree = $("#new-rights-fancytree").fancytree("getTree");
        tree.reload({
            url: '/melis/MelisCore/ToolUser/getRightsTreeView'
        });
}

// get the index then make it right
window.initRetrieveUser = function () {
    var btnDelete = $('#tableToolUserManagement tr.clsCurrent td').find(".btnUserDelete");
        btnDelete.remove();

    // pagination of dataTables
    melisCore.paginateDataTables();
};

var toolUserManagement = {

    table: function () {
        return "#tableToolUserManagement";
    },

    initTools: function () {
        melisHelper.zoneReload("id_meliscore_tool_user", "meliscore_tool_user");
    },

    refreshTable: function () {
        // reload the whole content of the tool
        melisHelper.zoneReload("id_meliscore_tool_user", "meliscore_tool_user");
    },

    initTool: function () {
        melisCoreTool.initTable("#tableToolUserManagement");
    },

    deleteUser: function (id) {

        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_meliscore_tool_user_delete,
            translations.tr_meliscore_tool_user_delete_msg,
            function () {
                $.ajax({
                    type: 'POST',
                    url: '/melis/MelisCore/ToolUser/deleteUser',
                    data: {id: id},
                    dataType: 'json',
                    encode: true
                }).done(function(data) {
                    melisCoreTool.pending(".btn-danger");
                    if (data.success) {
                        melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                        toolUserManagement.refreshTable();
                        melisCore.flashMessenger();
                    }
                    melisCoreTool.done(".btn-danger");
                }).fail(function() {
                    alert(translations.tr_meliscore_error_message);
                });
            });
    },

    retrieveUser: function (id) {
        var $be     = $("#btnEdit"),
            $ber    = $("#btnEditRights");

            $be.addClass("disabled").css("pointer-events", "none");
            $ber.addClass("disabled").css("pointer-events", "none");

            $.ajax({
                type: 'POST',
                url: '/melis/MelisCore/ToolUser/getUserById',
                data: {id: id},
                dataType: 'json',
                encode: true
            }).done(function(data) {
                if (data.success) {
                    var $lld = $("#lastlogindate"),
                        $ul  = $("#userlogin"),
                        $ump = $("#idusermanagement #id_usr_password"),
                        $umcp = $("#idusermanagement #id_usr_confirm_password");

                    $lld.html(data.user.usr_last_login_date);
                    $ul.html(data.user.usr_login);
                    toolUserManagement.setImage("#profile-image", data.user.usr_image);

                    $("form#idusermanagement input[type='text'], form#idusermanagement input[type='hidden'], form#idusermanagement select").each(function (index) {
                        var $this   = $(this),
                            name    = $this.attr('name'),
                            $tum    = $("#tool_user_management_id_tmp"),
                            $eui    = $("#edituserid");

                            $("#" + $this.attr('id')).val(data.user[name]);
                            $tum.val(data.user['usr_id']);
                            $eui.html(data.user['usr_id']);
                    });

                    // Switching the Admin switch plugin
                    var userEditSwitchForm = $("form#idusermanagement .user-admin-switch");
                        if (data.user.usr_admin == 1) {
                            userEditSwitchForm.bootstrapSwitch('setState', true);
                        } else {
                            userEditSwitchForm.bootstrapSwitch('setState', false);
                        }

                        // make sure that password fields are empty when retrieving
                        $ump.val("");
                        $umcp.val("");

                        // re-initialize the tree with current selected userID
                        getRightsTree(id);
                }
            }).fail(function() {
                alert(translations.tr_meliscore_error_message);
            });
    },

    addNewUser: function (form) {
        var formData    = new FormData(form),
            ctr         = 0;

            $.each(userRightsData, function (i, e) {
                $.each(e, function (a, b) {
                    formData.append(a, JSON.stringify(userRightsData[ctr]));
                });
                ctr++;
            });

            melisCoreTool.pending("#btnAdd");
            melisCoreTool.processing();

            $.ajax({
                type: 'POST',
                url: '/melis/MelisCore/ToolUser/addNewUser',
                data: formData,
                processData: false,
                cache: false,
                contentType: false,
                dataType: 'json'
            }).done(function (data) {
                var $mum = $("#modal-user-management");
                    if ( data.success ) {
                        melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                        $mum.modal('hide');
                        toolUserManagement.refreshTable();
                    }
                    else {
                        melisCoreTool.alertDanger("#newformalert", translations.tr_meliscore_common_error + "! ", data.textMessage);
                        melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                        melisCoreTool.highlightErrors(data.success, data.errors, "idnewusermanagement");
                    }
                    melisCoreTool.done("#btnAdd");
                    melisCore.flashMessenger();
                    melisCoreTool.processDone();
            }).fail(function() {
                alert(translations.tr_meliscore_error_message);
            });
    },

    updateUser: function (form) {
        var formData    = new FormData(form),
            ctr         = 0,
            $bue        = $(".btnUserEdit");

        formData.append("usr_id", $("#edituserid").html());

        $.each(userRightsData, function (i, e) {
            $.each(e, function (a, b) {
                formData.append(a, JSON.stringify(userRightsData[ctr]));
            });
            ctr++;
        });

        melisCoreTool.pending("#btnEdit");
        melisCoreTool.processing();

        $bue.removeAttr("data-toggle");

        $.ajax({
            type: 'POST',
            url: '/melis/MelisCore/ToolUser/updateUser',
            data: formData,
            processData: false,
            cache: false,
            contentType: false,
            dataType: 'json'
        }).done(function (data) {
            if ( data.success ) {
                var $mum = $("#modal-user-management"),
                    $unl = $("#user-name-link");

                    melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                    $mum.modal('hide');

                    if ( data.datas.isMyInfo == 1 ) {
                        var $mlmpp = $("#meliscore_left_menu_profile_pic");
                            $mlmpp.attr("src", "");

                            $.when(melisHelper.zoneReload("id_meliscore_leftmenu", "meliscore_leftmenu")).then(function () {
                                var isFirefox = navigator.userAgent.indexOf("Firefox") > 0 ? true : false;
                                    if (isFirefox) {
                                        $mlmpp.fadeOut();
                                        setTimeout(function () {
                                            $mlmpp.attr("src", data.datas.loadProfile);
                                            $mlmpp.fadeIn();
                                        }, 3000);
                                    }
                            });
                    }
                    toolUserManagement.refreshTable();

                    //check if data that has been updated is equal to the current user info to replicate the user profile data
                    if ( _tmpUserId == $unl.attr("data-user-id") ) {
                        melisHelper.zoneReload("id_meliscore_user_profile_form", "meliscore_user_profile_form");
                        melisHelper.zoneReload("id_meliscore_user_profile_left", "meliscore_user_profile_left");

                        //reload the dashboard plugins menu to update the plugin rights
                        melisHelper.zoneReload('id_meliscore_center_dashboard_menu','meliscore_center_dashboard_menu', {}, function(){
                            melisDashBoardDragnDrop.dragWidget();
                        });
                    }
            }
            else {
                melisCoreTool.alertDanger("#editformalert", translations.tr_meliscore_common_error + "! ", data.textMessage);
                melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                melisCoreTool.highlightErrors(data.success, data.errors, "idusermanagement");
            }
            melisCoreTool.done("#btnEdit");
            melisCore.flashMessenger();
            melisCoreTool.processDone();
        }).fail(function () {
            alert(translations.tr_meliscore_error_message);
        });
    },

    imagePreview: function (id, imgFileInput) {
        if (imgFileInput.files && imgFileInput.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $(id).attr('src', e.target.result);
            }
            reader.readAsDataURL(imgFileInput.files[0]);
        }
    },

    setImage: function (id, src) {
        $(id).attr('src', src);
    },

    makeSwitch: function (selector) {
        melisHelper.initSwitch(selector);
    }
};
