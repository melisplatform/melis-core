$(function() {
    $("body").on("click", "#img-user-link, #user-name-link", function(event) {
        var userName = $("#user-name-link").html().trim();
        melisHelper.tabOpen(userName, 'fa-user', 'id_meliscore_user_profile', 'meliscore_user_profile');
        event.preventDefault();
    });
    
    
    $(document).on('click', '.btnUpdateUser', function(e){
    	updateUserInfo();
    	e.preventDefault();
    })
    
    $(document).on('click', '.profile-photo-edit', function(e){
    	$('#id_usr_image').trigger('click');
    	e.preventDefault();
    });
    
    $(document).on('change', '#id_usr_image', function(){
        readURL(this);
    });
    
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#user-profile-pic').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    function updateUserInfo(){
    	var form = $('#iduserprofilemanagement').get(0);
    	var formData = new FormData(form);
		formData.append('usr_image', $('#iduserprofilemanagement #id_usr_image')[0].files[0]);
    	$.ajax({
	        type        : 'POST', 
	        url         : '/melis/MelisCore/UserProfile/updateUserInformation',
	        data		: formData,
	        processData : false,
	        cache		: false,
	        contentType	: false,
 	       	dataType    : 'json',
		}).done(function(data) {
			if(data.success){
				$("#meliscore_left_menu_profile_pic, #user-profile-pic").attr("src", data.data.profilePic);
				$('#u-email-list').text(data.data.email);
				melisHelper.melisOkNotification(translations.tr_meliscore_common_success, data.msg);
				melisCore.flashMessenger();
			}else{
				melisHelper.melisKoNotification(translations.tr_meliscore_common_error, data.msg);
				melisCore.flashMessenger();
			}
		}).fail(function(){
			alert( translations.tr_meliscore_error_message );
		});
    }
});