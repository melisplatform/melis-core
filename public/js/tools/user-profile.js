$(function() {
	
	var body = $("body");
	
	//check if whether to open the user profile tab on page finish load
	$(window).on('load', function(){
		 checkUserProfileTabOnReload();
    });
	
	/**
	 * Open up user profile
	 */
	body.on("click", "#img-user-link, #user-name-link", function(event) {
    	openUserProfileTab();
        destroyFileStyle();
        event.preventDefault();
    });
    
    /**
     * Update user profile on save button click
     */
	body.on('click', '.btnUpdateUser', function(e){
    	updateUserInfo($(this));
    	e.preventDefault();
    })
    /**
     * Open up File Input window to select an image
     */
    body.on('click', '.profile-photo-edit, .profile-photo', function(e){
    	$('#id_usr_profile_image').trigger('click');
    	e.preventDefault();
    });
    /**
     * Preview selected image on file input change
     */
	body.on('change', '#id_usr_profile_image', function(){
    	previewImage(this);
    });
    
	body.on('click',"a[data-id='id_meliscore_user_profile'], a[data-id='id_meliscore_tool_user']", function(e){
    	destroyFileStyle();
    	e.preventDefault();
    });
    
    /**
     * Preview selected image
     * @param input
     */
    function previewImage(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#user-profile-pic').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    /**
     * Function to save user profile
     * @returns
     */
    function updateUserInfo(_this){
    	//prepare the data
    	var form = $('#iduserprofilemanagement').get(0);
    	var formData = new FormData(form);
		formData.append('usr_image', $('#iduserprofilemanagement #id_usr_profile_image')[0].files[0]);
		//send ajax request
    	$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/UserProfile/updateUserInformation',
	        data		: formData,
	        processData : false,
	        cache		: false,
	        contentType	: false,
 	       	dataType    : 'json',
 	       	beforeSend	: function(){
 	       		//make the button as loader before sending
 	       		_this.html("<i class='fa fa-cog fa-spin'></i> "+ translations.tr_meliscore_tool_user_update);
 	       	},
		}).done(function(data) {
			//process the returned data
			if(data.success){//success
				$("#meliscore_left_menu_profile_pic, #user-profile-pic").attr("src", data.data.profilePic);
				$('#u-email-list').text(data.data.email);
				melisHelper.melisOkNotification(translations.tr_meliscore_common_success, data.textMessage);
				//remove highlighted label
				melisCoreTool.highlightErrors(1, null, "iduserprofilemanagement");
				//reload the page only if the user change the language
				if(data.reLoad){
					melisChangeLanguage(data.data.usrLang);
				}else{
					//reload notficiations
					melisCore.flashMessenger();
					$('#iduserprofilemanagement #id_usr_password, #iduserprofilemanagement #id_usr_confirm_password').val('');
				}
			}else{//failed
				//show errors
				melisHelper.melisKoNotification(data.textTitle, translations.tr_meliscore_user_profile_failed_info, data.errors);
				//highlight errors
				melisCoreTool.highlightErrors(0, data.errors, "iduserprofilemanagement");
				//refresh notifications
				melisCore.flashMessenger();
			}
			_this.html("<i class='fa fa-save'></i> "+ translations.tr_meliscore_tool_user_update);
		}).fail(function(){//some error happened
			_this.html("<i class='fa fa-save'></i> "+ translations.tr_meliscore_tool_user_update);
			alert( translations.tr_meliscore_error_message );
		});
    }
    
    /**
     * Function to check whether to load the user profile tab
     * @returns
     */
    function checkUserProfileTabOnReload(){
    	$.get('/melis/MelisCore/UserProfile/checkUserSessionIfExist', function(data){
    		if(data.showUserProfile){
    			openUserProfileTab();
    		}
    	});
    }
    
    /**
     * Function to open user profile tab
     * @returns
     */
    function openUserProfileTab(){
    	var userName = $("#user-name-link").html().trim();
        melisHelper.tabOpen(userName, 'fa-user', 'id_meliscore_user_profile', 'meliscore_user_profile');
    }
    
    /**
     * Destroy the file style plugin on file
     */
    function destroyFileStyle(){
    	$('#iduserprofilemanagement').find(':file').filestyle('destroy');
    	$('#iduserprofilemanagement').find(':file').hide();
    }
    
});