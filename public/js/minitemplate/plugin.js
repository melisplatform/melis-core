(function() {
  var minitemplate = (function() {
    'use strict';
    
    tinymce.PluginManager.requireLangPack("minitemplate");
    tinymce.PluginManager.add("minitemplate", function(editor, url) {
      
      tinymce.DOM.loadCSS("/MelisCore/css/mini-template.css");
      // Used to store a reference to the dialog when we have opened it
      var dialogApi = false;

      var _urlDialogConfig = {
        title: 'Mini Template',
        url: url + '/minitemplate.html',
        width: 1600,
        height: 600
      };

      // Define the toolbar button
      editor.ui.registry.addButton('minitemplate', {
        icon: 'template',
        tooltip: 'Mini Template',
        title: 'Mini Template',
        onAction: () => {
          dialogApi = editor.windowManager.openUrl(_urlDialogConfig);

          dialogApi.block('Loading...');

          setTimeout(function() {
            dialogApi.unblock();
          }, 2000);
        }
      });

      // Add a button into the menu bar
      editor.ui.registry.addMenuItem('minitemplate', {
        icon: 'template',
        text: 'Mini Template',
        tooltip: 'Mini Template',
        title: 'Mini Template',
        onAction: () => {
          dialogApi = editor.windowManager.openUrl(_urlDialogConfig);

          dialogApi.block('Loading...');
          
          setTimeout(function() {
            dialogApi.unblock();
          }, 2000);
        }
      });

      // Register the additional tinymce custom option
      editor.options.register('mini_templates_url', {
        processor: 'string',
        default: '/melis/MelisCore/MelisTinyMce/getTinyTemplates'
      });

      // Return details to be displayed in TinyMCE's "Help" plugin, optional
      return {
        getMetadata: function() {
          return {
            name: 'Mini Template Plugin',
            url: '/'
          };
        }
      }
    });
    
  }());
})();