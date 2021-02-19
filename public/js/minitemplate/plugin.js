/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 *
 * Version: 5.0.1 (2019-02-21)
 */
(function () {
  var minitemplate = (function () {
      'use strict';

      var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

      var constant = function (value) {
        return function () {
          return value;
        };
      };
      function curry(fn) {
        var initialArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          initialArgs[_i - 1] = arguments[_i];
        }
        return function () {
          var restArgs = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            restArgs[_i] = arguments[_i];
          }
          var all = initialArgs.concat(restArgs);
          return fn.apply(null, all);
        };
      }
      var never = constant(false);
      var always = constant(true);

      var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools');

      var global$2 = tinymce.util.Tools.resolve('tinymce.util.XHR');

      var getCreationDateClasses = function (editor) {
        return editor.getParam('template_cdate_classes', 'cdate');
      };
      var getModificationDateClasses = function (editor) {
        return editor.getParam('template_mdate_classes', 'mdate');
      };
      var getSelectedContentClasses = function (editor) {
        return editor.getParam('template_selected_content_classes', 'selcontent');
      };
      var getPreviewReplaceValues = function (editor) {
        return editor.getParam('template_preview_replace_values');
      };
      var getTemplateReplaceValues = function (editor) {
        return editor.getParam('template_replace_values');
      };
      var getTemplates = function (editorSettings) {
        return editorSettings.templates;
      };
      var getCdateFormat = function (editor) {
        return editor.getParam('template_cdate_format', editor.translate('%Y-%m-%d'));
      };
      var getMdateFormat = function (editor) {
        return editor.getParam('template_mdate_format', editor.translate('%Y-%m-%d'));
      };
      var Settings = {
        getCreationDateClasses: getCreationDateClasses,
        getModificationDateClasses: getModificationDateClasses,
        getSelectedContentClasses: getSelectedContentClasses,
        getPreviewReplaceValues: getPreviewReplaceValues,
        getTemplateReplaceValues: getTemplateReplaceValues,
        getTemplates: getTemplates,
        getCdateFormat: getCdateFormat,
        getMdateFormat: getMdateFormat
      };

      var addZeros = function (value, len) {
        value = '' + value;
        if (value.length < len) {
          for (var i = 0; i < len - value.length; i++) {
            value = '0' + value;
          }
        }
        return value;
      };
      
      var getDateTime = function (editor, fmt, date) {
        var daysShort = 'Sun Mon Tue Wed Thu Fri Sat Sun'.split(' ');
        var daysLong = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(' ');
        var monthsShort = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
        var monthsLong = 'January February March April May June July August September October November December'.split(' ');
        date = date || new Date();
        fmt = fmt.replace('%D', '%m/%d/%Y');
        fmt = fmt.replace('%r', '%I:%M:%S %p');
        fmt = fmt.replace('%Y', '' + date.getFullYear());
        fmt = fmt.replace('%y', '' + date.getYear());
        fmt = fmt.replace('%m', addZeros(date.getMonth() + 1, 2));
        fmt = fmt.replace('%d', addZeros(date.getDate(), 2));
        fmt = fmt.replace('%H', '' + addZeros(date.getHours(), 2));
        fmt = fmt.replace('%M', '' + addZeros(date.getMinutes(), 2));
        fmt = fmt.replace('%S', '' + addZeros(date.getSeconds(), 2));
        fmt = fmt.replace('%I', '' + ((date.getHours() + 11) % 12 + 1));
        fmt = fmt.replace('%p', '' + (date.getHours() < 12 ? 'AM' : 'PM'));
        fmt = fmt.replace('%B', '' + editor.translate(monthsLong[date.getMonth()]));
        fmt = fmt.replace('%b', '' + editor.translate(monthsShort[date.getMonth()]));
        fmt = fmt.replace('%A', '' + editor.translate(daysLong[date.getDay()]));
        fmt = fmt.replace('%a', '' + editor.translate(daysShort[date.getDay()]));
        fmt = fmt.replace('%%', '%');
        return fmt;
      };

      var DateTimeHelper = { getDateTime: getDateTime };

      var createTemplateList = function (editorSettings, callback) {
        return function () {
          var templateList = Settings.getTemplates(editorSettings);
          if (typeof templateList === 'function') {
            templateList(callback);
            return;
          }
          if (typeof templateList === 'string') {
            global$2.send({
              url: templateList,
              success: function (text) {
                callback(JSON.parse(text));
              }
            });
          } else {
            callback(templateList);
          }
        };
      };

      var replaceTemplateValues = function (html, templateValues) {
        global$1.each(templateValues, function (v, k) {
          if (typeof v === 'function') {
            v = v(k);
          }
          html = html.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), v);
        });
        return html;
      };

      var replaceVals = function (editor, e) {
        var dom = editor.dom, vl = Settings.getTemplateReplaceValues(editor);
        global$1.each(dom.select('*', e), function (e) {
          global$1.each(vl, function (v, k) {
            if (dom.hasClass(e, k)) {
              if (typeof vl[k] === 'function') {
                vl[k](e);
              }
            }
          });
        });
      };

      var hasClass = function (n, c) {
        return new RegExp('\\b' + c + '\\b', 'g').test(n.className);
      };

      var insertTemplate = function (editor, ui, html) {
        var el;
        var n;
        var dom = editor.dom;
        var sel = editor.selection.getContent();
        html = replaceTemplateValues(html, Settings.getTemplateReplaceValues(editor));
        el = dom.create('div', null, html);
        n = dom.select('.mceTmpl', el);
        if (n && n.length > 0) {
          el = dom.create('div', null);
          el.appendChild(n[0].cloneNode(true));
        }
        global$1.each(dom.select('*', el), function (n) {
          if (hasClass(n, Settings.getCreationDateClasses(editor).replace(/\s+/g, '|'))) {
            n.innerHTML = DateTimeHelper.getDateTime(editor, Settings.getCdateFormat(editor));
          }
          if (hasClass(n, Settings.getModificationDateClasses(editor).replace(/\s+/g, '|'))) {
            n.innerHTML = DateTimeHelper.getDateTime(editor, Settings.getMdateFormat(editor));
          }
          if (hasClass(n, Settings.getSelectedContentClasses(editor).replace(/\s+/g, '|'))) {
            n.innerHTML = sel;
          }
        });
        replaceVals(editor, el);
        editor.execCommand('mceInsertContent', false, el.innerHTML);
        editor.addVisual();
      };

      var Templates = {
        createTemplateList: createTemplateList,
        replaceTemplateValues: replaceTemplateValues,
        replaceVals: replaceVals,
        insertTemplate: insertTemplate
      };

      var register = function (editor) {
        editor.addCommand('mceInsertTemplate', curry(Templates.insertTemplate, editor));
      };

      var Commands = { register: register };

      var setup = function (editor) {
        editor.on('PreProcess', function (o) {
          var dom = editor.dom, dateFormat = Settings.getMdateFormat(editor);
          global$1.each(dom.select('div', o.node), function (e) {
            if (dom.hasClass(e, 'mceTmpl')) {
              global$1.each(dom.select('*', e), function (e) {
                if (dom.hasClass(e, editor.getParam('template_mdate_classes', 'mdate').replace(/\s+/g, '|'))) {
                  e.innerHTML = DateTimeHelper.getDateTime(editor, dateFormat);
                }
              });
              Templates.replaceVals(editor, e);
            }
          });
        });
      };

      var FilterContent = { setup: setup };

      var never$1 = never;
      var always$1 = always;
      var none = function () {
        return NONE;
      };

      var NONE = function () {
        var eq = function (o) {
          return o.isNone();
        };
        var call = function (thunk) {
          return thunk();
        };
        var id = function (n) {
          return n;
        };
        var noop = function () {
        };
        var nul = function () {
          return null;
        };
        var undef = function () {
          return undefined;
        };
        var me = {
          fold: function (n, s) {
            return n();
          },
          is: never$1,
          isSome: never$1,
          isNone: always$1,
          getOr: id,
          getOrThunk: call,
          getOrDie: function (msg) {
            throw new Error(msg || 'error: getOrDie called on none.');
          },
          getOrNull: nul,
          getOrUndefined: undef,
          or: id,
          orThunk: call,
          map: none,
          ap: none,
          each: noop,
          bind: none,
          flatten: none,
          exists: never$1,
          forall: always$1,
          filter: none,
          equals: eq,
          equals_: eq,
          toArray: function () {
            return [];
          },
          toString: constant('none()')
        };
        if (Object.freeze)
          Object.freeze(me);
        return me;
      }();

      var some = function (a) {
        var constant_a = function () {
          return a;
        };
        var self = function () {
          return me;
        };
        var map = function (f) {
          return some(f(a));
        };
        var bind = function (f) {
          return f(a);
        };
        var me = {
          fold: function (n, s) {
            return s(a);
          },
          is: function (v) {
            return a === v;
          },
          isSome: always$1,
          isNone: never$1,
          getOr: constant_a,
          getOrThunk: constant_a,
          getOrDie: constant_a,
          getOrNull: constant_a,
          getOrUndefined: constant_a,
          or: self,
          orThunk: self,
          map: map,
          ap: function (optfab) {
            return optfab.fold(none, function (fab) {
              return some(fab(a));
            });
          },
          each: function (f) {
            f(a);
          },
          bind: bind,
          flatten: constant_a,
          exists: bind,
          forall: bind,
          filter: function (f) {
            return f(a) ? me : NONE;
          },
          equals: function (o) {
            return o.is(a);
          },
          equals_: function (o, elementEq) {
            return o.fold(never$1, function (b) {
              return elementEq(a, b);
            });
          },
          toArray: function () {
            return [a];
          },
          toString: function () {
            return 'some(' + a + ')';
          }
        };
        return me;
      };

      var from = function (value) {
        return value === null || value === undefined ? NONE : some(value);
      };

      var Option = {
        some: some,
        none: none,
        from: from
      };

      var typeOf = function (x) {
        if (x === null)
          return 'null';
        var t = typeof x;
        if (t === 'object' && Array.prototype.isPrototypeOf(x))
          return 'array';
        if (t === 'object' && String.prototype.isPrototypeOf(x))
          return 'string';
        return t;
      };

      var isType = function (type) {
        return function (value) {
          return typeOf(value) === type;
        };
      };

      var isFunction = isType('function');

      var map = function (xs, f) {
        var len = xs.length;
        var r = new Array(len);
        for (var i = 0; i < len; i++) {
          var x = xs[i];
          r[i] = f(x, i, xs);
        }
        return r;
      };

      var find = function (xs, pred) {
        for (var i = 0, len = xs.length; i < len; i++) {
          var x = xs[i];
          if (pred(x, i, xs)) {
            return Option.some(x);
          }
        }
        return Option.none();
      };

      var slice = Array.prototype.slice;

      var from$1 = isFunction(Array.from) ? Array.from : function (x) {
        return slice.call(x);
      };

      var global$3 = tinymce.util.Tools.resolve('tinymce.util.Promise');

      var getPreviewContent = function (editor, html) {
        if (html.indexOf('<html>') === -1) {
          var contentCssLinks_1 = '';
          global$1.each(editor.contentCSS, function (url) {
            contentCssLinks_1 += '<link type="text/css" rel="stylesheet" href="' + editor.documentBaseURI.toAbsolute(url) + '">';
          });
          var bodyClass = editor.settings.body_class || '';
          if (bodyClass.indexOf('=') !== -1) {
            bodyClass = editor.getParam('body_class', '', 'hash');
            bodyClass = bodyClass[editor.id] || '';
          }
          html = '<!DOCTYPE html>' + '<html>' + '<head>' + contentCssLinks_1 + '</head>' + '<body class="' + bodyClass + '">' + html + '</body>' + '</html>';
        }
        return Templates.replaceTemplateValues(html, Settings.getPreviewReplaceValues(editor));
      };

      // start of open
      var open = function (editor, templateList) {
        var clickedButtonTemplateTitle = '';
        var createTemplates = function () {
          if (!templateList || templateList.length === 0) {
            var message = editor.translate('No templates defined.');
            editor.notificationManager.open({
              text: message,
              type: 'info'
            });
            return Option.none();
          }

          return Option.from(global$1.map(templateList, function (template, index) {
            return {
              text: template.text,
              value: {
                url: template.url,
                content: template.content,
                description: template.description
              }
            };
          }));
        };

        var createSelectBoxItems = function (templates) {
          return map(templates, function (v) {
            return {
              text: v.text,
              value: v.text
            };
          });
        };

        var findTemplate = function (templates, templateTitle) {
          return find(templates, function (t) {
            return t.text === templateTitle;
          });
        };

        var getTemplateContent = function (t) {
          return new global$3(function (resolve, reject) {
            if (t.value.url) {
              global$2.send({
                url: t.value.url,
                success: function (html) {
                  resolve(html);
                },
                error: function (e) {
                  reject(e);
                }
              });
            } else {
              resolve(t.value.content);
            }
          });
        };

        // used on button click
        var onAction = function(templates) {
          // api, click as details
          return function (api, click) {
            clickedButtonTemplateTitle = click.name;
            
            findTemplate(templates, clickedButtonTemplateTitle).each(function (t) {
              api.block('Loading...');
              getTemplateContent(t).then(function (previewHtml) {
                var previewContent = getPreviewContent(editor, previewHtml);
                api.setData({ preview: previewContent });
                api.unblock();
              });
            });
          };
        };

        // not being used as it is not a dropdown anymore
        var onChange = function (templates) {
          return function (api, change) {
            if (change.name === 'template') {
              var newTemplateTitle = api.getData().template;
                findTemplate(templates, newTemplateTitle).each(function (t) {
                  api.block('Loading...');
                  getTemplateContent(t).then(function (previewHtml) {
                    var previewContent = getPreviewContent(editor, previewHtml);
                    api.setData({ preview: previewContent });
                    api.unblock();
                  });
                });
            }
          };
        };
        
        var onSubmit = function (templates) {
          return function (api) {
            // data.template undefined but defined when in onAction
            findTemplate(templates, clickedButtonTemplateTitle).each(function (t) {
              getTemplateContent(t).then(function (previewHtml) {
                Templates.insertTemplate(editor, false, previewHtml);
                api.close();
              });
            });
          };
        };

        var openDialog = function ( templates ) {
          var entries = Object.entries(templates),
              nearestTemplateIndex;

              for ( var [index, valueStr] of entries) {
                var url = valueStr.value.url;
                    if ( ! url ) {
                      //console.log('index of the next item url not undefined: ', parseInt( index ) + 1 );
                      // nearest index after a category type which can be distinguished as url: undefined
                      nearestTemplateIndex = parseInt( index ) + 1;
                    }
              }

          var selectBoxItems = createSelectBoxItems(templates);
          var dialogSpec = function (bodyItems, initialData) {
            return {
              title: 'Insert Mini Template',
              size: 'large',
              body: {
                type: 'panel',
                label: 'Mini Template',
                items: bodyItems
              },
              initialData: initialData,
              buttons: [
                {
                  type: 'cancel',
                  name: 'cancel',
                  text: 'Cancel'
                },
                {
                  type: 'submit',
                  name: 'save',
                  text: 'Save',
                  primary: true
                }
              ],
              onSubmit: onSubmit(templates),
              //onChange: onChange(templates),
              onAction: onAction(templates),
            };
          };

          var dialogApi = editor.windowManager.open(dialogSpec([], {
            template: '',
            preview: ''
          }));

          dialogApi.block('Loading...');

          getTemplateContent(templates[nearestTemplateIndex]).then(function (previewHtml) {
            var content = getPreviewContent(editor, previewHtml);
            var bodyItems = [];

              for ( var index = 0; index < templates.length; index++ ) {
                var templateIndex     = templates[index],
                    templateTitle     = templateIndex.text,
                    url               = templateIndex.value.url,
                    trimTemplateTitle = templateTitle.replaceAll('-', ' ').split('.')[0];
                    //capitalizeTitle   = trimTemplateTitle.charAt(0).toUpperCase() + trimTemplateTitle.slice(1);

                    bodyItems.unshift({
                      type: 'button',
                      name: templateTitle,
                      text: trimTemplateTitle
                    });
              }
              // end for loop templates.length

              bodyItems.sort(function(a, b) {
                return ( a.text > b.text ) ? 1 : -1;
              });

              bodyItems.push({
                label: 'Preview',
                type: 'iframe',
                name: 'preview',
                sandboxed: false
              });
              
              var initialData = {
                template: templates[nearestTemplateIndex].text,
                preview: content
              };
            
              dialogApi.unblock();
              dialogApi.redial(dialogSpec(bodyItems, initialData));

              // begin html customization and re-arrangements
              for ( var index = 0; index < templateList.length; index++ ) {
                var templateIndex       = templateList[index],
                    templateTitle       = templateIndex.text,
                    imgSrc              = templateIndex.imgSource,
                    trimTemplateTitle   = templateTitle.replaceAll('-', ' ').split('.')[0],
                    type                = templateIndex.type,
                    parent              = templateIndex.parent,
                    id                  = templateIndex.id,
                    module              = templateIndex.module,
                    siteName            = templateIndex.site_name,
                    $button             = $('button[title="' + trimTemplateTitle + '"]'), // for individuality
                    $image              = ( imgSrc !== '' ) ? "<img src=" + imgSrc + " width='195px' style='display: block; width: 195px; height: auto; margin: 0 auto 0.5rem;' />" : "";
                    
                    if ( imgSrc !== undefined ) {
                      $button.append( $image );
                    }

                    $button.attr({
                      "title"           : templateTitle+".phtml",
                      "data-id"         : id,
                      "data-module"     : module,
                      "data-parent"     : parent,
                      "data-type"       : type,
                      "data-site-name"  : siteName
                    });
              }
              // for loop templateList.length

              var $dialogBody             = $(".tox-dialog__body-content"),
                  $dialogForm             = $dialogBody.find(".tox-form .tox-form__group:not(.tox-form__group--stretched)"),
                  //$dialogForm             = $dialogBody.find(".tox-form"),
                  meliskey                = window.parent.$("body").find("#melis-id-body-content-load > .tab-pane.active").data("meliskey"),
                  $toxButton              = $dialogBody.find(".tox-button");

                  //$dialogBody.setAttribute("id", "custom-body-mini-template");
                  $dialogBody.attr("id", "custom-body-mini-template");

                  if ( meliskey == "meliscms_page" ) {
                    // meliscms_page still generates .tox-form
                    $dialogForm.attr("id", "custom-body-mini-template-form");

                    $dialogForm.wrapAll( '<div id="mini-template-buttons" class="accordion" />' );
                  }
                  else {
                    // here not generating .tox-form
                    $toxButton.wrapAll( '<div id="mini-template-buttons" class="accordion" />' );
                  }

                  // add custom html structure for category title and hide created button for category                
                  // appending buttons to respective categories
                  $.each( $toxButton, function(i, v) {
                    var $accordWrapper  = $("#mini-template-buttons"),
                        $siteCategory   = $(".site-category"),
                        $otherCategory  = $("#other-category"),
                        $elem           = $(v),
                        title           = $elem.text(),
                        id              = $elem.data("id"), // reference to data-parent
                        parent          = $elem.data("parent"),
                        type            = $elem.data("type"),
                        siteName        = $elem.data("site-name"),
                        siteHtml        = '',
                        catHtml         = '',
                        otherCatHtml    = '';

                        // check if .site-category selector is not yet added
                        if ( $siteCategory.length === 0 && siteName != '' && siteName != null ) {
                          siteHtml = siteNameHtml( siteName, i );
                          $accordWrapper.prepend( siteHtml );
                        }
                        
                        // check for category
                        if ( type == 'category' ) {
                          var catId = $elem.data("id");
                              catHtml = categoryHtml( title, catId, siteName, i );

                              // hide button generated with type category
                              $elem.addClass("hidden");

                              // prepend the resulting html
                              //if ( parent != '#' ) {
                                $accordWrapper.prepend( catHtml );
                              //}
                        }
                        
                        // check if buttons should be inside a main category
                        if ( type == 'mini-template' || type == 'category' && parent == '#' ) {
                          if ( $otherCategory.length === 0 ) {
                            otherCatHtml = otherCategoryHtml( 'Other Category', siteName );
                            $accordWrapper.append( otherCatHtml );
                          }

                          // append button to #other-category
                          //if ( meliskey == "meliscms_page" ) {
                            // for meliscms_page or page edition
                            //$accordWrapper.find("#other-category").append( $elem.prev(".tox-form__group") );  
                          //}
                          //else {
                            // for other tools not generating .tox-form__group div wrapper element
                            $accordWrapper.find("#other-category").append( $elem );
                          //}
                        }

                        // check for the buttons with data-parent attribute not equal to #
                        if ( parent != '#' ) {
                          var $parent = $("#mini-template-buttons .tox-button:not([data-parent='#'])");
                              // this button need to be appended to the right category based on data-parent value
                              $.each( $parent, function(i, v) {
                                var $mainCatButtons = $(".main-category-buttons"),
                                    $elem           = $(v),
                                    parent          = $elem.data("parent");

                                    $.each( $mainCatButtons, function(i, v) {
                                      var $el       = $(v),
                                          dataCatId = $el.data("catid"),
                                          $catId    = $(".main-category-buttons[data-catid='"+dataCatId+"']");

                                          if ( dataCatId === parent ) {
                                            //if ( meliskey == "meliscms_page" ) {
                                              // for meliscms_page or page edition
                                              //$catId.append( $elem.prev(".tox-form__group") );
                                            //}
                                            //else {
                                              // for other tools not generating .tox-form__group div wrapper element
                                              $catId.append( $elem );
                                            //}
                                          }
                                    });
                              });
                        }
                  });
                
                  // appending categories to respective $siteCategory based on data-site-name
                  $.each( $(".common-category"), function(i, v) {
                    var $siteCategory           = $(".site-category"),
                        $commonCategoryElement  = $(v),
                        commonCategorySiteName  = $commonCategoryElement.data("site-name");

                        $.each( $siteCategory, function( i, v ) {
                          var $siteCategoryElement  = $(v),
                              siteCategoryId        = $siteCategoryElement.attr("id"),
                              siteCategorySiteName  = $siteCategoryElement.data("site-name");

                              if ( commonCategorySiteName === siteCategorySiteName ) {
                                $("#"+siteCategoryId).append( $commonCategoryElement.prev("h3") );
                                $("#"+siteCategoryId).append( $commonCategoryElement );
                              }
                        });
                  });
                
              var icons = {
                header: 'fa fa-arrow-circle-right',
                activeHeader: 'fa fa-arrow-circle-down'
              };

              $(".accordion").accordion({
                icons: icons,
                autoHeight: true,
                collapsible: true,
                animate: 400
              });

              dialogApi.focus('minitemplate');

              function siteNameDashLowerCase( siteName ) {
                return siteName.replace(/\s+/g, '-').toLowerCase();
              }
              
              function siteNameHtml( siteName ) {
                var sName = siteNameDashLowerCase( siteName );

                    return '<h3>'+ siteName +'</h3>' +
                          '<div id="site-category-'+index+'" class="site-category accordion" data-site-name="'+ sName +'"></div>';
              }

              function categoryHtml( categoryTitle, catId, siteName, index ) {
                var sName = siteNameDashLowerCase( siteName );

                    return '<h3>'+ categoryTitle +'</h3>' +
                          '<div id="main-category-'+index+'" class="main-category-buttons common-category" data-site-name="'+ sName +'" data-catid="'+ catId +'"></div>';
              }

              function otherCategoryHtml( categoryTitle, siteName ) {
                var sName = siteNameDashLowerCase( siteName );

                    return '<h3>'+ categoryTitle +'</h3>' +
                          '<div id="other-category" class="other-category-buttons common-category" data-site-name="'+ sName +'"></div>';
              }
          });
        };

        var optTemplates = createTemplates();
            optTemplates.each(openDialog);
      };
      // end of open

      var Dialog = { open: open };

      var showDialog = function (editor) {
        return function (templates) {
          Dialog.open(editor, templates);
        };
      };

      var register$1 = function (editor) {
        editor.ui.registry.addButton('minitemplate', {
          icon: 'template',
          tooltip: 'Insert Mini Template',
          onAction: Templates.createTemplateList(editor.settings, showDialog(editor))
        });
        editor.ui.registry.addMenuItem('minitemplate', {
          icon: 'template',
          text: 'Insert Mini Template...',
          onAction: Templates.createTemplateList(editor.settings, showDialog(editor))
        });
      };

      var Buttons = { register: register$1 };

      global.add('minitemplate', function (editor) {
        tinymce.DOM.loadCSS("/MelisCore/css/mini-template.css");

        Buttons.register(editor);
        Commands.register(editor);
        FilterContent.setup(editor);
      });

      function Plugin () {
      }

      return Plugin;

  }());
})();
