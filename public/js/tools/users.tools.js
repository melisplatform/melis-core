/* Javasript for User Management Tool */

$(":file").filestyle({buttonBefore: true});
// re-initialize the rights treeview with current selected userID
function getRightsTree(userId){
	
	var tree = $("#rights-fancytree").fancytree("getTree");
	tree.reload({
		url: source = '/melis/MelisCore/ToolUser/getRightsTreeView?userId='+userId,
		  lazyLoad: function(event, data){
			  alert("expanded");
		  },
	});
	
	var checker = setInterval(function() {
		if(tree.count() > 1) {
			$("#btnEdit").removeClass("disabled").css("pointer-events", "auto");
			$("#btnEditRights").removeClass("disabled").css("pointer-events", "auto");
			clearInterval(checker);
		}
	}, 500);
}
var _tmpUserId = null;
window.setUserDateConnection = function(d) {
	d.usr_id = _tmpUserId;
}

// action buttons
$(document).ready(function() {

    $("body").on("click", "#switch-user-api-status", function() {
        var id 	   = $(this).data().userid;
        var status = 0;

        if($(this).find("div").hasClass("switch-on")) {
        	status = 1;
		}


        $.ajax({
            type        : 'POST',
            url         : '/melis/MelisCore/MelisCoreMicroService/updateStatus',
            data		: {id : id, status : status},
            dataType    : 'json',
            encode		: true,
        }).done(function(data){
			if(data.success) {

			}
        });

    });



	$("body").on("click", '.btnUserEdit', function() {
		var id = $(this).parents("tr").attr("id");
		melisCoreTool.hideAlert("#editformalert");
		melisCoreTool.hideTabs('#modal-user-management','#id_meliscore_tool_user_new_modal,#id_meliscore_tool_user_new_rights_modal','#id_meliscore_tool_user_edit_modal');
		melisCoreTool.resetLabels("#idusermanagement");
		toolUserManagement.retrieveUser(id);
		_tmpUserId = id;
        $("#tableUserViewDateConnection").DataTable().destroy();
        fntableUserViewDateConnectioninit();

        $.ajax({
            type        : 'POST',
            url         : '/melis/MelisCore/MelisCoreMicroService/getUserAuthData',
			data		: {id : id},
            dataType    : 'json',
            encode		: true,
        }).done(function(data){
            $("#melis-core-user-auth-api-key").html("");
            $("#melis-core-user-auth-api-ok").addClass("hidden");
            $("#melis-core-user-auth-api-ko").addClass("hidden");
			if(data.success) {
				$("#melis-core-user-auth-api-key").html(data.response.api_key);
				$("#melis-core-user-auth-api-ok").removeClass("hidden");
                var status = data.response.status == '1' ? true : false;
                $("#switch-user-api-status").bootstrapSwitch("setState", status);
                $("#switch-user-api-status").attr("data-userid", data.response.user_id);
			}
			else {
                $("#melis-core-user-auth-api-ko").removeClass("hidden");
			}
        });

	});

	$("body").on("click", "#btn-melis-core-user-gen-api", function() {
		var id = _tmpUserId;
        $.ajax({
            type        : 'POST',
            url         : 'melis/MelisCore/MelisCoreMicroService/generateApiKey',
            data		: {id : id},
            dataType    : 'json',
            encode		: true,
        }).done(function(data){
            $("#melis-core-user-auth-api-key").html("");
            $("#melis-core-user-auth-api-ok").addClass("hidden");
            $("#melis-core-user-auth-api-ko").addClass("hidden");
            if(data.success) {
                $("#melis-core-user-auth-api-key").html(data.response.api_key);
                $("#melis-core-user-auth-api-ok").removeClass("hidden");

            }
            else {
                $("#melis-core-user-auth-api-ko").removeClass("hidden");
            }
        });
	});

	$("body").on("click", "#id_meliscore_tool_user_action_new_user", function() {
        melisNewUserRights();
        melisCoreTool.hideTabs('#modal-user-management', '#id_meliscore_tool_user_edit_modal,#id_meliscore_tool_user_rights_modal,#id_meliscore_tool_user_view_date_connection_modal,#id_meliscore_tool_user_microservice_modal', '#id_meliscore_tool_user_new_modal');
	});
	
	//this is for user icon in identity menu
	$("body").on("click", "#btnUserInfoEdit", function() {
		var interval = 100;
		if(!$("a[data-id='id_meliscore_tool_user']").is(':visible')) {
			interval = 3000;
		}
		$("#id_meliscore_menu_toolstree li[data-tool-id='id_meliscore_tool_user']").trigger("click");//loads user management tool
		setTimeout(function()
        {
			$.ajax({
    	        type        : 'GET', 
    	        url         : '/melis/MelisCore/MelisAuth/getCurrentLoggedInId',
    	        dataType    : 'json',
    	        encode		: true,		
    	    }).success(function(data){ 
    	    	if(data){
    				toolUserManagement.retrieveUser(data.user.usr_id);//ajax call function 
	 	    		getRightsTree(data.user.usr_id);
	 				melisCoreTool.hideTabs('#modal-user-management','#id_meliscore_tool_user_new_modal,#id_meliscore_tool_user_new_rights_modal','#id_meliscore_tool_user_edit_modal');
	 				$("#modal-user-management").modal("show");
    	    	}			
    	    }).error(function(){
    	    	alert( translations.tr_meliscore_error_message );
    	    });		

        }, interval);
	});
	
	$("body").on("click", '.btnUserDelete', function() {
		var id = $(this).parents("tr").attr("id");
		toolUserManagement.deleteUser(id);
	});
	
	$("body").on("click", "#id_meliscore_tool_user_action_new_user", function() {
		melisCoreTool.hideAlert("#newformalert");
		melisCoreTool.resetLabels("#idnewusermanagement");
		$("form#idnewusermanagement #id_n_usr_password").val("");
	});
	
	$("body").on("click", ".btnMelisCoreUserExport", function() {
		var searched = $("input[type='search'][aria-controls='tableToolUserManagement']").val();
		if(!melisCoreTool.isTableEmpty("tableToolUserManagement")) {
			melisCoreTool.exportData('/melis/MelisCore/ToolUser/exportToCsv?filter='+searched);
		}
		
	});
});

// call the empty rights data and put it inside the new user treeview
function melisNewUserRights(){
	
	var tree = $("#new-rights-fancytree").fancytree("getTree");
	tree.reload({
		url: '/melis/MelisCore/ToolUser/getRightsTreeView'
	});
}
// get the index then make it right
window.initRetrieveUser = function() { 
	 var btnDelete = $('#tableToolUserManagement tr.clsCurrent td').find(".btnUserDelete");
	 btnDelete.remove();
}

var toolUserManagement = { 
		
		table: function() {
			return "#tableToolUserManagement";
		},
		
		initTools: function() {
			melisHelper.zoneReload("id_meliscore_tool_user", "meliscore_tool_user");
		},
		
		
		refreshTable: function() {
			// reload the whole content of the tool
			melisHelper.zoneReload("id_meliscore_tool_user", "meliscore_tool_user");
		},
		
		initTool: function() {
			melisCoreTool.initTable("#tableToolUserManagement");
		},
		
		deleteUser: function(id) {
			
			melisCoreTool.confirm(
				translations.tr_meliscore_common_yes, 
				translations.tr_meliscore_common_no, 
				translations.tr_meliscore_tool_user_delete, 
				translations.tr_meliscore_tool_user_delete_msg, 
				function() {
		    		$.ajax({
		    	        type        : 'POST', 
		    	        url         : '/melis/MelisCore/ToolUser/deleteUser',
		    	        data		: {id : id},
		    	        dataType    : 'json',
		    	        encode		: true,
		    	     }).success(function(data){
		    	    	 	melisCoreTool.pending(".btn-danger");
			    	    	if(data.success) {
			    	    		melisHelper.melisOkNotification(data.textTitle, data.textMessage);
			    	    		toolUserManagement.refreshTable();
			    	    		melisCore.flashMessenger();
			    	    	}
			    	    	melisCoreTool.done(".btn-danger");
		    	     }).error(function(){
		    	    	 alert( translations.tr_meliscore_error_message );
		    	     });
			});
		},
		
		retrieveUser : function(id) {
			$("#btnEdit").addClass("disabled").css("pointer-events", "none");
			$("#btnEditRights").addClass("disabled").css("pointer-events", "none");
    		$.ajax({
    	        type        : 'POST', 
    	        url         : '/melis/MelisCore/ToolUser/getUserById',
    	        data		: {id : id},
    	        dataType    : 'json',
    	        encode		: true,		
    	    }).success(function(data){
    	    	if(data.success) {
 	    			$("#lastlogindate").html(data.user.usr_last_login_date);
 	    			$("#userlogin").html(data.user.usr_login);
 	    			toolUserManagement.setImage("#profile-image",data.user.usr_image);
    	    		$("form#idusermanagement input[type='text'], form#idusermanagement input[type='hidden'], form#idusermanagement select").each(function(index) {
    	    			var name = $(this).attr('name');
    	    			$("#" + $(this).attr('id')).val(data.user[name]);
    	    			$("#tool_user_management_id_tmp").val(data.user['usr_id']);
    	    			$("#edituserid").html(data.user['usr_id']);
    	    		});
    	    		
    	    		// Switching the Admin switch plugin
    	    		var userEditSwitchForm = $("form#idusermanagement .user-admin-switch");
    	    		if(data.user.usr_admin == 1){
    	    			userEditSwitchForm.bootstrapSwitch('setState', true);
    	    		}else{
    	    			userEditSwitchForm.bootstrapSwitch('setState', false);
    	    		}
    	    		
    	    		// make sure that password fields are empty when retrieving
    	    		$("form#idusermanagement #id_usr_password").val("");
    	    		$("form#idusermanagement #id_usr_confirm_password").val("");
    	    		
    	    		// re-initialize the tree with current selected userID
    	    		getRightsTree(id);
    	    	}
    	    }).error(function(){
    	    	alert( translations.tr_meliscore_error_message );
    	    });
		},
		
		addNewUser: function(form) {
			var formData = new FormData(form);
			var ctr = 0;
			$.each(userRightsData, function(i, e) {
				$.each(e, function(a,b) {
					formData.append(a, JSON.stringify(userRightsData[ctr]));
				});
				ctr++;
			});
			melisCoreTool.pending("#btnAdd");
			melisCoreTool.processing();
			$.ajax({
		        type        : 'POST', 
		        url         : '/melis/MelisCore/ToolUser/addNewUser',
		        data		: formData,
		        processData : false,
		        cache		: false,
		        contentType	: false,
	 	       	dataType    : 'json',
			}).done(function(data) {
				if(data.success) {
					melisHelper.melisOkNotification(data.textTitle, data.textMessage);
					$('#modal-user-management').modal('hide');
					toolUserManagement.refreshTable();
				}
				else {
					melisCoreTool.alertDanger("#newformalert", translations.tr_meliscore_common_error+"! ", data.textMessage);
					melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
					melisCoreTool.highlightErrors(data.success, data.errors, "idnewusermanagement");
				}
				melisCoreTool.done("#btnAdd");
	    		melisCore.flashMessenger();
	    		melisCoreTool.processDone();
			}).fail(function(){
				alert( translations.tr_meliscore_error_message );
			});
		},
		
		updateUser : function(form) {
			var formData = new FormData(form);
			var ctr = 0;
			formData.append("usr_id", $("#edituserid").html());
			$.each(userRightsData, function(i, e) {
				$.each(e, function(a,b) {
					formData.append(a, JSON.stringify(userRightsData[ctr]));
				});
				ctr++;
			});
			melisCoreTool.pending("#btnEdit");
			melisCoreTool.processing();
			$(".btnUserEdit").removeAttr("data-toggle");
			$.ajax({
    	        type        : 'POST', 
    	        url         : '/melis/MelisCore/ToolUser/updateUser',
    	        data		: formData,
    	        processData : false,
    	        cache		: false,
    	        contentType	: false,
     	       	dataType    : 'json',
			}).done(function(data) {
				if(data.success) {
					melisHelper.melisOkNotification(data.textTitle, data.textMessage);
					$('#modal-user-management').modal('hide');
					if(data.datas.isMyInfo == 1) {
						$("#meliscore_left_menu_profile_pic").attr("src", "");
						$.when(melisHelper.zoneReload("id_meliscore_leftmenu", "meliscore_leftmenu")).then(function() {
							var isFirefox = navigator.userAgent.indexOf("Firefox") > 0 ? true : false;
							if(isFirefox) {
								$("#meliscore_left_menu_profile_pic").fadeOut();
								setTimeout(function() {
									
									$("#meliscore_left_menu_profile_pic").attr("src", data.datas.loadProfile);
									$("#meliscore_left_menu_profile_pic").fadeIn();
								}, 3000);
							}
						});
					}
					toolUserManagement.refreshTable();	
				}
				else {
					melisCoreTool.alertDanger("#editformalert", translations.tr_meliscore_common_error+"! ", data.textMessage);
					melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
					melisCoreTool.highlightErrors(data.success, data.errors, "idusermanagement");
				}
				melisCoreTool.done("#btnEdit");
	    		melisCore.flashMessenger();
	    		melisCoreTool.processDone();
			}).fail(function(){
				alert( translations.tr_meliscore_error_message );
			});
		},
		  
		imagePreview : function(id, imgFileInput) {
			if(imgFileInput.files && imgFileInput.files[0]) {
				var reader = new FileReader();
				reader.onload = function(e) {
					$(id).attr('src', e.target.result);
				}
				reader.readAsDataURL(imgFileInput.files[0]);
			}
		},
		
		setImage : function(id, src) {
			$(id).attr('src', src);
		},
		
		makeSwitch : function(selector) {
			melisHelper.initSwitch(selector);
		}
};