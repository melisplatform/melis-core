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

var $mls_tabs;

/* Remove Envato Frame */
if (window.location != window.parent.location) top.location.href = document.location.href;
(function($, window) {

$.widget( "mls.tabs", {
    options: {
        type: 'success', // success / info / warning / danger
        msg: '',
        alertTimeout: 600,
        alertTimer: 2000
      },

      _create: function() {
        this._init();
      },
      _init: function(){
        this.element.find('.item-tree').each(function() {
          $thisItemTree = $(this);
          $thisItemTree.bind("click", function(){
            alert($thisItemTree.attr("href"));
          })
        });
      },
      init:function(){
        alert('init tab');
        return this._init();
      }

 });


$mls_tabs = $('.mod-tree').tabs();


})(jQuery, window);