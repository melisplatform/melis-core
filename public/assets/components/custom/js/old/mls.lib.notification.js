/*!
 * Notification v0.0.1 (http://melistechnology.com)
 * Copyright 2014 MelisTechnology, Inc.
 * Licensed OSL-3.0 (http://www.melistechnology.com/resources/license/id/23)
 */

 if (typeof jQuery === 'undefined') {
  throw new Error('Notification JavaScript requires jQuery')
}

+function ($) {
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1)) {
    throw new Error('Notification JavaScript requires jQuery version 1.9.1 or higher')
  }
}(jQuery);

var $mls_nt;

/* Remove Envato Frame */
if (window.location != window.parent.location) top.location.href = document.location.href;
(function($, window) {
  var mls_nt_i = 0;
  $.widget( "mls.notification", {
    options: {
      idNotification: 'id-mls-notification',
        type: 'success', // success / info / warning / danger
        msg: '',
        alertTimeout: 600,
        alertTimer: 2000
      },

      _create: function() {
        if(!$('#'+this.options.idNotification).length)
          this.element.append('<div class="mls-notification top" id="id-mls-notification">\
            <div class="mls-notification-header"></div>\
            <div class="mls-notification-body">\
            </div>\
            <div class="mls-notification-footer"></div>\
            </div>');
        //this._add(this.options.type, this.options.msg);
      },
      _tpl: function(type, msg){

        return jQuery('<div/>', {
            id: 'nt-'+$.now()+'-'+(mls_nt_i++),
            role: 'alert',            
            class: 'alert '+this._tpl_class(type)+' alert-dismissible ',
            html: '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'+ msg
        });

/*        return '<div class="alert '+this._tpl_class(type)+' alert-dismissible" role="alert">\
        <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\
        '+ msg +'\
        </div>';*/
      },
      _tpl_class: function(type){
        var type_class = "info";
        switch(type.toLowerCase()) {
          case 'success':
          type_class = "alert-success"
          break;
          case 'info':
          type_class = "alert-info"
          break;
          case 'warning':
          type_class = "alert-warning"
          break;
          case 'danger':
          type_class = "alert-danger"
          break;
          default:
          type_class = "alert-info" 
        }
        return type_class;
      },

      _add: function(type, msg){
        //console.log(msg);
        $msg = this._tpl(type, msg);
        $('#'+this.options.idNotification).find('.mls-notification-body').append($msg);
        $msg.delay(this.options.alertTimer).slideUp(this.options.alertTimeout);
      },
      type: function(type){
        this.options.type = type;
        //alert('xxx');
        return true;
      },
      success: function(msg){
        this._add('success', msg);
        return true;
      },
      info: function(msg){
        this._add('info', msg);
        return true;
      },
      warning: function(msg){
        this._add('warning', msg);
        return true;
      },
      danger: function(msg){
        this._add('danger', msg);
        return true;
      }
    });


$mls_nt = $('body').notification();


})(jQuery, window);