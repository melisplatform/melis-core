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

                insertMelisDemoCmsMiniTemplateCss();
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
          var nearestTemplateIndex = 0;
          for ( var i = 0; i < templates.length; i++ ) {
            var url = templates[i].value.url;
                if ( url != undefined && url.endsWith(".phtml") ) {
                  nearestTemplateIndex = i;

                  break;
                }
          }

          var selectBoxItems = createSelectBoxItems(templates);
          var dialogSpec = function (bodyItems, initialData) {
            return {
              title: translations.tr_meliscore_tinymce_mini_template_add_button_tooltip,
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
                    //trimTemplateTitle1   = templateTitle.replaceAll('-', ' ').split('.')[0],
                    trimTemplateTitle   = templateTitle.replaceAll('-', ' '),
                    type                = templateIndex.type,
                    parent              = templateIndex.parent,
                    id                  = templateIndex.id,
                    module              = templateIndex.module,
                    siteName            = templateIndex.site_name,
                    $button             = $('button[title="'+trimTemplateTitle+'"]'), // for individuality
                    $image              = ( imgSrc !== '' ) ? "<img src=" + imgSrc + " width='195px' style='display: block; width: 195px; height: auto; margin: 0 auto 0.5rem;' />" : "";

                    if ( imgSrc != '' ) {
                      $button.append( $image );
                    }

                    $button.attr({
                      "title"           : templateTitle.toLowerCase(),
                      "data-id"         : id,
                      "data-module"     : module,
                      "data-parent"     : parent,
                      "data-type"       : type,
                      "data-site-name"  : siteName
                    });
              }
              // for loop templateList.length

              var $dialogBody            = $(".tox-dialog__body-content"),
                  $dialogForm            = $dialogBody.find(".tox-form .tox-form__group:not(.tox-form__group--stretched)"),
                  meliskey               = window.parent.$("body").find("#melis-id-body-content-load > .tab-pane.active").data("meliskey"),
                  $toxButton             = $dialogBody.find(".tox-button");

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

                  /**
                   * Appending of site category
                   * Creating site category based on unique values from button's data-site-name
                   */
                  var uniqueSiteNames   = getUniqueSiteNames( $toxButton );
                      // cycle through the unique site names for .site-category
                      for ( var index = 0; index < uniqueSiteNames.length; index++ ) {
                        var $accordWrapper  = $("#mini-template-buttons"),
                            siteName        = uniqueSiteNames[index],
                            otherCategory   = translations.tr_meliscore_tinymce_mini_template_other_category,
                            siteHtml        = '',
                            otherCatHtml    = '';

                            // site category
                            if ( siteName != 'undefined' ) {
                              siteHtml = siteNameHtml( siteName, index );
                              $accordWrapper.prepend( siteHtml );
                            }
                            
                            // other category
                            if ( siteName != 'undefined' ) { // otherCategoryBool
                              otherCatHtml = otherCategoryHtml( otherCategory, siteName, index );
                              $accordWrapper.append( otherCatHtml );
                            }
                      }

                      // $toxButton
                      $.each( $toxButton, function(i, v) {
                        var $accordWrapper  = $("#mini-template-buttons"),
                            $otherCategory  = $(".other-category"),
                            $elem           = $(v),
                            title           = $elem.text(),
                            id              = $elem.data("id"), // reference to data-parent
                            parent          = $elem.data("parent"),
                            type            = $elem.data("type"),
                            siteName        = $elem.data("site-name"), // site category
                            catHtml         = '';

                            // check for category
                            if ( type == 'category' ) {
                              // index $toxButton
                              catHtml = categoryHtml( title, id, siteName, i );

                              // hide button generated with type category
                              $elem.addClass("hidden");

                              // prepend the resulting html
                              $accordWrapper.prepend( catHtml );
                            }

                            /**
                             * Check if buttons should be inside a main category. 
                             * If parent == '#' means it is under .other-category
                             */
                            if ( type == 'mini-template' || type == 'category' ) {
                              // for .other category
                              if ( parent == '#' ) {
                                $.each( $otherCategory, function( i, v ) {
                                  var $otherCategoryElem    = $(v),
                                      buttonSiteName        = $elem.data("site-name"),
                                      otherCategorySiteName = $otherCategoryElem.data("site-name");
                                      
                                      if ( buttonSiteName === otherCategorySiteName ) {
                                        $otherCategoryElem.append( $elem );
                                      }
                                });
                              }
                              // for .main-category
                              else {
                                setTimeout(function() {
                                  var $mainCategory = $(".main-category");
                                      $.each( $mainCategory, function( i, v ) {
                                        var $mainCategoryElem = $(v),
                                            mainCategoryId    = $mainCategoryElem.data("cat-id"), // data value
                                            $mainCategoryId   = $(".main-category[data-cat-id='"+mainCategoryId+"']"); // jquery selector

                                            if ( mainCategoryId === parent ) {
                                              $mainCategoryId.append( $elem );
                                            }
                                      });
                                }, 500);
                              }
                            }
                      });

                      /**
                       * Appending categories to respective $siteCategory based on data-site-name
                       */
                  var $commonCategory = $(".common-category");

                      $.each( $commonCategory, function(i, v) {
                        var $siteCategory           = $(".site-category"),
                            $commonCategoryElement  = $(v),
                            commonCategorySiteName  = $commonCategoryElement.data("site-name"),
                            commonCategoryById      = $commonCategoryElement.attr("id"),
                            $commonCategoryById     = $("#"+commonCategoryById),
                            $btnTemplate            = $commonCategoryById.find(".tox-button"),
                            noMiniTemplateFoundMsg  = '<label class="no-mini-template-found">'+translations.tr_meliscore_tinymce_mini_template_no_template_found+'</label>';

                            /**
                             * Check if .common-category element is empty 
                             * to add noMiniTemplateFoundMsg
                             * */ 
                            setTimeout(function() {
                              if ( $commonCategoryElement.is(":empty") ) {
                                $commonCategoryElement.append( noMiniTemplateFoundMsg );
                              }
                              else {
                                if ( $btnTemplate.hasClass('hidden') && $btnTemplate.data("type") != 'mini-template' ) {
                                  $commonCategoryElement.append( noMiniTemplateFoundMsg );
                                }
                              }
                            }, 1000);
                            
                            /**
                             * Check on $siteCategory to where particular
                             * category to be appended
                             * */ 
                            $.each( $siteCategory, function( i, v ) {
                              var $siteCategoryElement  = $(v),
                                  siteCategoryId        = $siteCategoryElement.attr("id"),
                                  siteCategorySiteName  = $siteCategoryElement.data("site-name");

                                  if ( commonCategorySiteName === siteCategorySiteName ) {
                                    $siteCategoryElement.append( $commonCategoryElement.prev("h3") );
                                    $siteCategoryElement.append( $commonCategoryElement );
                                  }
                            });
                      });

              dialogApi.focus('minitemplate');
              
              /**
               * Returns a unique site names from an array.
               * @param {*} $elemArray 
               * @returns uniqueArray
               */
              function getUniqueSiteNames( $elemArray ) {
                var listArray = [], uniqueArray = [], counting = 0, found = false;
                    $.each($elemArray, function(i, v) {
                      var siteName = $(v).data("site-name");
                        if ( $.inArray( siteName, listArray ) == -1 ) {
                          listArray.push( siteName );
                        }
                    });

                    for ( var x = 0; x < listArray.length; x++ ) {
                      for ( var y = 0; y < uniqueArray.length; y++ ) {
                        if ( listArray[x] == uniqueArray[y] ) {
                          found = true;
                        }
                      }
                      counting++;
                      if ( counting == 1 && found == false ) {
                        uniqueArray.push( listArray[x] );
                      }
                      found = false;
                      counting = 0;
                    }
                    
                    return uniqueArray;
              }

              function siteNameDashLowerCase( siteName ) {
                return siteName.replace(/\s+/g, '-').toLowerCase();
              }
              
              function siteNameHtml( siteName, index ) {
                var sName = siteName; //siteNameDashLowerCase( siteName );

                    return '<h3>'+ siteName +'</h3>' +
                          '<div id="site-category-'+index+'" class="site-category accordion" data-site-name="'+ sName +'"></div>';
              }

              function categoryHtml( categoryTitle, catId, siteName, index ) {
                var sName = siteName; //siteNameDashLowerCase( siteName );

                    return '<h3>'+ categoryTitle +'</h3>' +
                          '<div id="main-category-'+index+'" class="main-category common-category" data-site-name="'+ sName +'" data-cat-id="'+ catId +'"></div>';
              }

              function otherCategoryHtml( categoryTitle, siteName, index ) {
                var sName = siteName; //siteNameDashLowerCase( siteName );

                    return '<h3>'+ categoryTitle +'</h3>' +
                          '<div id="other-category-'+index+'" class="other-category common-category" data-site-name="'+ sName +'"></div>';
              }

              /**
               * Turns lists of sites and categories into accordion
               */
              var icons = {
                header: 'fa fa-arrow-circle-right',
                activeHeader: 'fa fa-arrow-circle-down'
              };

              $(".accordion").accordion({
                animate: 400,
                autoHeight: true,
                collapsible: true,
                icons: icons
              });

              /**
               * Highlight button when clicked
               */
              var $buttons = $('#mini-template-buttons .tox-button');
                  $.each( $buttons, function(i, v) {
                    var $elem             = $(v),
                        classesToRemoved  = ['ui-accordion-header', 'ui-corner-top', 'ui-state-default', 'ui-accordion-icons', 'ui-accordion-header-collapsed', 'ui-corner-all'], // j
                        classesToAdd      = ['ui-accordion-content', 'ui-corner-bottom', 'ui-helper-reset', 'ui-widget-content'], // k
                        classList         = $elem.attr('class').split(/\s+/); // i

                        /**
                         * Loop through the class lists and compare with classes to be removed
                         */
                       /*  for ( var i = 0; i < classList.length; i++ ) {
                          for ( var j = 0; j < classesToRemoved.length; j++ ) {
                            if ( classList[i] == classesToRemoved[j] ) {
                              $elem.removeClass( classList[i] ); */
                              /**
                               * Replace with classes to add
                               */
                              /* for ( var k = 0; k < classesToAdd.length; k++ ) {
                                $elem.addClass( classesToAdd[k] );
                              } */
                            /* }
                          }
                        } */

                        /**
                         * Remove this not needed element added by jquery ui accordion.
                         * <span class="ui-accordion-header-icon ui-icon fa fa-arrow-circle-right"></span>
                         */
                        $elem.find(".fa-arrow-circle-right").remove();

                        /**
                         * Highlight the clicked button to determine from in active.
                         */
                        $elem.on("click", function(e) {
                          var $this = $(this);

                              $this.toggleClass("active").siblings().removeClass("active");

                              /**
                               * For the issue on displaying all available mini templates.
                               * Some button when clicked it closes the accordion
                               */
                              if ( $this.hasClass( 'ui-accordion-header' ) ) {
                                $this.closest(".site-category").prev(".ui-accordion-header").trigger("click");
                              }
                        });
                  });
          });

          insertMelisDemoCmsMiniTemplateCss();
        };
        // openDialog

        var optTemplates = createTemplates();
            optTemplates.each(openDialog);

        /**
         * Insert link element for the css of mini templates
         * so that it would display same as in the front end.
         */
        function insertMelisDemoCmsMiniTemplateCss() {
          setTimeout(function() {
            var $previewIframeHead = $("#custom-body-mini-template .tox-form__group--stretched .tox-navobj iframe").contents().find("head");
            var cssUrl = [
              '/MelisDemoCms/css/bootstrap.min.css',
              '/MelisDemoCms/vendors/themify-icon/themify-icons.css',
              '/MelisDemoCms/vendors/elagent/style.css',
              '/MelisDemoCms/css/style.css'
            ];

                $.each( cssUrl, function(i) {
                  var el        = document.createElement('link');
                      el.href   = cssUrl[i];
                      el.rel    = "stylesheet";
                      el.media  = "screen";
                      el.type   = "text/css";

                      $previewIframeHead.append( el );
                });
          }, 1000);
        }
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
          tooltip: translations.tr_meliscore_tinymce_mini_template_add_button_tooltip,
          onAction: Templates.createTemplateList(editor.settings, showDialog(editor))
        });
        editor.ui.registry.addMenuItem('minitemplate', {
          icon: 'template',
          text: translations.tr_meliscore_tinymce_mini_template_add_menuitem_text,
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
