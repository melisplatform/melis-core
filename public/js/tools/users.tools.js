/* Javasript for User Management Tool */

$(":file").filestyle({ buttonBefore: true });

// re-initialize the rights treeview with current selected userID
function getRightsTree(userId) {
	let tree = $.ui.fancytree.getTree("#rights-fancytree");

	if (tree == null) {
		tree = initRightsTree(
			"body #rights-fancytree",
			"/melis/MelisCore/ToolUser/getRightsTreeView?userId=" + userId
		);
	} else {
		tree.reload({
			url: (source =
				"/melis/MelisCore/ToolUser/getRightsTreeView?userId=" + userId),
		});
	}

	var checker = setInterval(function () {
		let tree = $.ui.fancytree.getTree("#rights-fancytree");

		if (tree != null) {
			$("#btnEdit").removeClass("disabled").css("pointer-events", "auto");
			$("#btnEditRights").removeClass("disabled").css("pointer-events", "auto");
			$("#btnResetRights")
				.removeClass("disabled")
				.css("pointer-events", "auto");
			clearInterval(checker);
		}
	}, 500);
}

var _tmpUserId = null;
window.setUserDateConnection = function (d) {
	d.usr_id = _tmpUserId;
};

// action buttons
$(function () {
	var $body = $("body");

	//image preveiew
	$body.on("change", "#id_n_usr_image", function () {
		var input = this;
		if (input.files && input.files[0]) {
			var reader = new FileReader(),
				$newProfileImg = $("#new-profile-image");

			reader.onload = function (e) {
				$newProfileImg.attr("src", e.target.result);
			};
			reader.readAsDataURL(input.files[0]);
		}
	});

	$body.on("change", "#id_usr_image", function () {
		var $userImgRemove = $("#usr_image_remove");
		$userImgRemove.val("no");
	});

	//image remove
	$body.on("click", "#btnDelImg", function () {
		var $userNImg = $("#id_n_usr_image"),
			$newProfileImg = $("#new-profile-image"),
			$nBadge = $("label[for=id_n_usr_image] .badge"),
			$userImg = $("#id_usr_image"),
			$userImgRemove = $("input#usr_image_remove"),
			$profileImg = $("#profile-image"),
			$badge = $("label[for=id_usr_image] .badge");

		if ($userNImg.length > 0) {
			$userNImg.val("");
			$newProfileImg.attr(
				"src",
				"/MelisCore/images/profile/default_picture.jpg"
			);
			$nBadge.remove();
		}

		if ($userImg.length > 0) {
			$userImgRemove.val("yes");
			$profileImg.attr("src", "/MelisCore/images/profile/default_picture.jpg");
			$badge.remove();
		}
	});

	$body.on("switch-change", "#switch-user-api-status", function (e) {
		var $this = $(this),
			id = $this.attr("data-userid"),
			status = 0;

		if ($this.find("div").hasClass("switch-on")) {
			status = 1;
		}

		$.ajax({
			type: "POST",
			url: "/melis/MelisCore/MelisCoreMicroService/updateStatus",
			data: { id: id, status: status },
			dataType: "json",
			encode: true,
		});
	});

	$body.on("click", ".melis-opentooltreeview", function () {
		var $this = $(this),
			toolName = $this.data("tool-name"),
			toolId = $this.data("tool-id"),
			melisKey = $this.data("tool-meliskey"),
			userId = $this.data("userid");
		melisHelper.tabOpen(
			toolName,
			"fa-user",
			toolId,
			melisKey,
			{},
			null,
			function () {
				var checker = setInterval(function () {
					var button = $("body").find("tr[id=" + userId + "] td .btnUserEdit");
					if (button.length === 1) {
						button.trigger("click");
						clearInterval(checker);
					}
				}, 500);
			}
		);
	});

	$body.on("click", ".btnUserEdit", function () {
		var id = $(this).parents("tr").attr("id"),
			$switch_status = $("#switch-user-api-status"),
			$dateCon = $("#tableUserViewDateConnection");

		melisCoreTool.hideAlert("#editformalert");
		melisCoreTool.hideTabs(
			"#modal-user-management",
			"#id_meliscore_tool_user_new_modal,#id_meliscore_tool_user_new_rights_modal",
			"#id_meliscore_tool_user_edit_modal"
		);
		melisCoreTool.resetLabels("#idusermanagement");
		toolUserManagement.retrieveUser(id);
		// Micro service status
		$switch_status.attr("data-userid", id);

		_tmpUserId = id;
		$dateCon.DataTable().destroy();
		fntableUserViewDateConnectioninit();

		$.ajax({
			type: "POST",
			url: "/melis/MelisCore/MelisCoreMicroService/getUserAuthData",
			data: { id: id },
			dataType: "json",
			encode: true,
		})
			.done(function (data) {
				var $apikey = $("#melis-core-user-auth-api-key"),
					$apiok = $("#melis-core-user-auth-api-ok"),
					$apiko = $("#melis-core-user-auth-api-ko"),
					$apiurl = $("#melis-core-microservices-url"),
					$switch = $("#switch-user-api-status .switch-animate");

				$apikey.html("");
				$apiok.addClass("hidden");
				if (data.success) {
					$apikey.html(data.response.api_key);
					$apiurl.html(
						'<a href="' +
							data.response.url +
							'" target="_blank">' +
							data.response.url +
							"</a>"
					);
					$apiok.removeClass("hidden");

					if (data.response.status == 1) {
						$switch.removeClass("switch-off");
						$switch.addClass("switch-on");
					} else {
						$switch.removeClass("switch-on");
						$switch.addClass("switch-off");
					}
				} else {
					$apiko.removeClass("hidden");
				}
			})
			.fail(function () {
				alert(translations.tr_meliscore_error_message);
			});

		// insert necessary css class for mobile responsive
		toolUserManagement.insertCSSClassOnElement();

		// modal slider on tab headers
		var modalSliderTimeout = setTimeout(function () {
			if (melisModalNavTabsSlider != undefined) {
				melisModalNavTabsSlider.checkedNavTabsModalSlider();

				clearTimeout(modalSliderTimeout);
			}
		}, 500);
	});

	$body.on("click", "#btn-melis-core-user-gen-api", function () {
		var id = _tmpUserId;
		$.ajax({
			type: "POST",
			url: "melis/MelisCore/MelisCoreMicroService/generateApiKey",
			data: { id: id },
			dataType: "json",
			encode: true,
		})
			.done(function (data) {
				var $apikey = $("#melis-core-user-auth-api-key"),
					$apiok = $("#melis-core-user-auth-api-ok"),
					$apiko = $("#melis-core-user-auth-api-ko"),
					$apiurl = $("#melis-core-microservices-url"),
					$switch_api = $("#switch-user-api-status");

				$apikey.html("");
				$apiok.addClass("hidden");
				$apiko.addClass("hidden");
				if (data.success) {
					$apikey.html(data.response.api_key);
					$apiurl.html(
						'<a href="' +
							data.response.url +
							'" target="_blank">' +
							data.response.url +
							"</a>"
					);
					$apiok.removeClass("hidden");

					if (!$switch_api.find("div").hasClass("switch-on")) {
						$switch_api.find("div").removeClass("switch-off");
						$switch_api.find("div").addClass("switch-on");
					}
				} else {
					$apiko.removeClass("hidden");
				}
			})
			.fail(function () {
				alert(translations.tr_meliscore_error_message);
			});
	});

	$body.on("click", "#id_meliscore_tool_user_action_new_user", function () {
		melisNewUserRights();
		melisCoreTool.hideTabs(
			"#modal-user-management",
			"#id_meliscore_tool_user_edit_modal,#id_meliscore_tool_user_rights_modal,#id_meliscore_tool_user_view_date_connection_modal,#id_meliscore_tool_user_microservice_modal",
			"#id_meliscore_tool_user_new_modal"
		);

		// insert necessary css class for mobile responsive
		toolUserManagement.insertCSSClassOnElement();

		// modal slider on tab headers
		var modalSliderTimeout = setTimeout(function () {
			if (melisModalNavTabsSlider != undefined) {
				melisModalNavTabsSlider.checkedNavTabsModalSlider();

				clearTimeout(modalSliderTimeout);
			}
		}, 500);
	});

	//open up user profile when user icon click in identity menu
	$body.on("click", "#btnUserInfoEdit", function () {
		var userName = $("#user-name-link").html().trim();
		melisHelper.tabOpen(
			userName,
			"fa-user",
			"id_meliscore_user_profile",
			"meliscore_user_profile"
		);
	});

	$body.on("click", ".btnUserDelete", function () {
		var id = $(this).parents("tr").attr("id");
		toolUserManagement.deleteUser(id);
	});

	$body.on("click", ".btnUserRegenerateLink", function () {
		var id = $(this).parents("tr").attr("id");
		toolUserManagement.resendPasswordCreateEmail(id);
	});

	$body.on("click", "#id_meliscore_tool_user_action_new_user", function () {
		var $numup = $("form#idnewusermanagement #id_n_usr_password");
		melisCoreTool.hideAlert("#newformalert");
		melisCoreTool.resetLabels("#idnewusermanagement");
		$numup.val("");
	});

	$body.on("click", ".btnMelisCoreUserExport", function () {
		var searched = $(
			"input[type='search'][aria-controls='tableToolUserManagement']"
		).val();
		if (!melisCoreTool.isTableEmpty("tableToolUserManagement")) {
			melisCoreTool.exportData(
				"/melis/MelisCore/ToolUser/exportToCsv?filter=" + searched
			);
		}
	});

	$body.on(
		"change",
		"select[name=tableToolUserManagement_status]",
		function () {
			var tableId = $(this).parents().eq(6).find("table").attr("id");
			$("#" + tableId)
				.DataTable()
				.ajax.reload();
		}
	);
});

// call the empty rights data and put it inside the new user treeview
function melisNewUserRights() {
	// var tree = $("#new-rights-fancytree").fancytree("getTree");

	let tree = $.ui.fancytree.getTree("#new-rights-fancytree");

	// use this so no console error regarding fancytree only init supported
	// var tree = $.ui.fancytree.getTree("#new-rights-fancytree");
	// tree.reload({
	// 	url: "/melis/MelisCore/ToolUser/getRightsTreeView",
	// });
	if (tree == null)
		initRightsTree(
			"#new-rights-fancytree",
			"/melis/MelisCore/ToolUser/getRightsTreeView"
		);
}

// get the index then make it right
window.initRetrieveUser = function (data, tblSettings) {
	if ($("#toolUserStatusSelect").length) {
		data.status = $("#toolUserStatusSelect").val();
	}

	var btnUserDeleteTimeout = setTimeout(function () {
		var btnDelete = $(
			"#tableToolUserManagement tr.clsCurrent td.dtActionCls div"
		).find(".btnUserDelete");
		if (btnDelete.length) {
			btnDelete.remove();

			clearTimeout(btnUserDeleteTimeout);
		}
	}, 500);
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
					type: "POST",
					url: "/melis/MelisCore/ToolUser/deleteUser",
					data: { id: id },
					dataType: "json",
					encode: true,
				})
					.done(function (data) {
						melisCoreTool.pending(".btn-danger");
						if (data.success) {
							melisHelper.melisOkNotification(data.textTitle, data.textMessage);
							toolUserManagement.refreshTable();
							melisCore.flashMessenger();
						}
						melisCoreTool.done(".btn-danger");
					})
					.fail(function () {
						alert(translations.tr_meliscore_error_message);
					});
			}
		);
	},

	resendPasswordCreateEmail: function (id) {
		melisCoreTool.confirm(
			translations.tr_meliscore_common_yes,
			translations.tr_meliscore_common_no,
			translations.tr_meliscore_tool_user_resend_password_email_title,
			translations.tr_meliscore_tool_user_resend_password_email_msg,
			function () {
				$.ajax({
					type: "POST",
					url: "/melis/MelisCore/ToolUser/generateCreatePassRequest",
					data: { id: id },
					dataType: "json",
					encode: true,
				})
					.done(function (data) {
						melisCoreTool.pending(".btnUserRegenerateLink");
						if (data.success) {
							melisHelper.melisOkNotification(data.textTitle, data.textMessage);
							melisCore.flashMessenger();
							var el = "tr#" + id;
							$(el)
								.find("span.text-success")
								.removeClass("text-success")
								.addClass("text-info");
						}
						melisCoreTool.done(".btnUserRegenerateLink");
					})
					.fail(function () {
						alert(translations.tr_meliscore_error_message);
					});
			}
		);
	},

	retrieveUser: function (id) {
		var $btnEdit = $("#btnEdit"),
			$btnEditRights = $("#btnEditRights");

		$btnEdit.addClass("disabled").css("pointer-events", "none");
		$btnEditRights.addClass("disabled").css("pointer-events", "none");
		$.ajax({
			type: "POST",
			url: "/melis/MelisCore/ToolUser/getUserById",
			data: { id: id },
			dataType: "json",
			encode: true,
		})
			.done(function (data) {
				if (data.success) {
					var $lastLoginDate = $("#lastlogindate"),
						$userLogin = $("#userlogin"),
						$userMgntPass = $("#idusermanagement #id_usr_password"),
						$userMgntConPass = $("#idusermanagement #id_usr_confirm_password");

					$lastLoginDate.html(data.user.usr_last_login_date);
					$userLogin.html(data.user.usr_login);
					toolUserManagement.setImage("#profile-image", data.user.usr_image);

					$(
						"form#idusermanagement input[type='text'], form#idusermanagement input[type='hidden'], form#idusermanagement select"
					).each(function (index) {
						var $this = $(this),
							name = $this.attr("name"),
							$toolUserMgntTmp = $("#tool_user_management_id_tmp"),
							$editUserId = $("#edituserid");

						$("#" + $this.attr("id")).val(data.user[name]);
						$toolUserMgntTmp.val(data.user["usr_id"]);
						$editUserId.html(data.user["usr_id"]);

						if ($this.attr("id") == "id_usr_tags") {
							$("#idusermanagement input[name=usr_tags]").tagsinput(
								"removeAll"
							);
							$("#idusermanagement input[name=usr_tags]").tagsinput(
								"add",
								data.user[name]
							);
						}
					});

					// Switching the Admin switch plugin
					var userEditSwitchForm = $(
						"form#idusermanagement .user-admin-switch"
					);
					if (data.user.usr_admin == 1) {
						userEditSwitchForm.bootstrapSwitch("setState", true);
					} else {
						userEditSwitchForm.bootstrapSwitch("setState", false);
					}

					// make sure that password fields are empty when retrieving
					$userMgntPass.val("");
					$userMgntConPass.val("");

					// re-initialize the tree with current selected userID
					getRightsTree(id);
				}
			})
			.fail(function () {
				alert(translations.tr_meliscore_error_message);
			});
	},

	addNewUser: function (form) {
		var formData = new FormData(form),
			ctr = 0;

		$.each(userRightsData, function (i, e) {
			$.each(e, function (a, b) {
				formData.append(a, JSON.stringify(userRightsData[ctr]));
			});
			ctr++;
		});

		melisCoreTool.pending("#btnAdd");
		melisCoreTool.processing();

		$.ajax({
			type: "POST",
			url: "/melis/MelisCore/ToolUser/addNewUser",
			data: formData,
			processData: false,
			cache: false,
			contentType: false,
			dataType: "json",
		})
			.done(function (data) {
				var $modalUserMgnt = $("#modal-user-management");
				if (data.success) {
					melisHelper.melisOkNotification(data.textTitle, data.textMessage);

					//$modalUserMgnt.modal('hide');
					melisCoreTool.hideModal("modal-user-management");
					toolUserManagement.refreshTable();
				} else {
					melisCoreTool.alertDanger(
						"#newformalert",
						translations.tr_meliscore_common_error + "! ",
						data.textMessage
					);
					melisHelper.melisKoNotification(
						data.textTitle,
						data.textMessage,
						data.errors
					);
					melisCoreTool.highlightErrors(
						data.success,
						data.errors,
						"idnewusermanagement"
					);
				}
				melisCoreTool.done("#btnAdd");
				melisCore.flashMessenger();
				melisCoreTool.processDone();
			})
			.fail(function () {
				alert(translations.tr_meliscore_error_message);
			});
	},

	updateUser: function (form) {
		var formData = new FormData(form),
			ctr = 0,
			$btnUserEdit = $(".btnUserEdit");

		formData.append("usr_id", $("#edituserid").html());

		$.each(userRightsData, function (i, e) {
			$.each(e, function (a, b) {
				formData.append(a, JSON.stringify(userRightsData[ctr]));
			});
			ctr++;
		});

		melisCoreTool.pending("#btnEdit");
		melisCoreTool.processing();

		$btnUserEdit.prop("data-bs-toggle", null);

		$.ajax({
			type: "POST",
			url: "/melis/MelisCore/ToolUser/updateUser",
			data: formData,
			processData: false,
			cache: false,
			contentType: false,
			dataType: "json",
		})
			.done(function (data) {
				if (data.success) {
					var $modalUserMgnt = $("#modal-user-management"),
						$userNameLink = $("#user-name-link");

					melisHelper.melisOkNotification(data.textTitle, data.textMessage);

					//$modalUserMgnt.modal("hide");
					melisCoreTool.hideModal("modal-user-management");

					if (data.datas.isMyInfo == 1) {
						var $profPic = $("#meliscore_left_menu_profile_pic");

						// $profPic.attr("src", "");

						$.when(
							melisHelper.zoneReload(
								"id_meliscore_leftmenu",
								"meliscore_leftmenu"
							)
						).then(function () {
							var isFirefox =
								navigator.userAgent.indexOf("Firefox") > 0 ? true : false;
							// console.log(`isFirefox: `, isFirefox);
							if (isFirefox) {
								$profPic.fadeOut();
								setTimeout(function () {
									$profPic.attr("src", data.datas.loadProfile);
									$profPic.fadeIn();
								}, 3000);
							}
						});
					}

					//check if data that has been updated is equal to the current user info to replicate the user profile data
					// console.log(`_tmpUserId == $userNameLink.attr("data-user-id"): `, _tmpUserId == $userNameLink.attr("data-user-id") );
					if (_tmpUserId == $userNameLink.attr("data-user-id")) {
						melisHelper.zoneReload(
							"id_meliscore_user_profile_form",
							"meliscore_user_profile_form"
						);
						melisHelper.zoneReload(
							"id_meliscore_user_profile_left",
							"meliscore_user_profile_left"
						);

						//reload the dashboard plugins menu to update the plugin rights
						melisHelper.zoneReload(
							"id_meliscore_center_dashboard_menu",
							"meliscore_center_dashboard_menu",
							{},
							function () {
								melisDashBoardDragnDrop.dragWidget();
								//remove dashboard plugin menu indicator if its loaded already
								$(".melis-core-dashboard-dnd-box").removeClass("hasCached");
							}
						);

						setTimeout(function () {
							// console.log(`setTimeout 4000 to avoid redirection refreshTable()`);
							// timeout request to avoid redirection
							toolUserManagement.refreshTable();
						}, 4000);
					} else {
						// console.log(`else no setTimeout refreshTable()`);
						toolUserManagement.refreshTable();
					}
				} else {
					melisCoreTool.alertDanger(
						"#editformalert",
						translations.tr_meliscore_common_error + "! ",
						data.textMessage
					);
					melisHelper.melisKoNotification(
						data.textTitle,
						data.textMessage,
						data.errors
					);
					melisCoreTool.highlightErrors(
						data.success,
						data.errors,
						"idusermanagement"
					);
				}
				melisCoreTool.done("#btnEdit");
				melisCore.flashMessenger();
				melisCoreTool.processDone();
			})
			.fail(function () {
				alert(translations.tr_meliscore_error_message);
			});
	},

	imagePreview: function (id, imgFileInput) {
		if (imgFileInput.files && imgFileInput.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				$(id).attr("src", e.target.result);
			};
			reader.readAsDataURL(imgFileInput.files[0]);
		}
	},

	setImage: function (id, src) {
		$(id).attr("src", src);
	},

	makeSwitch: function (selector) {
		melisHelper.initSwitch(selector);
	},

	// for #modal-user-management mobile responsive
	insertCSSClassOnElement: function () {
		var insertElementTimeout = setTimeout(function () {
			var $tabModal = $("#modal-user-management");

			if ($tabModal.length) {
				$tabModal
					.find(".tab-content .tab-pane .row .col-md-12")
					.addClass("clearfix");

				clearTimeout(insertElementTimeout);
			}
		}, 500);
	},
};
