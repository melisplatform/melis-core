var melisTinyMCE = (function() {
	var tinyMceConfigs = new Object();

	var getTinyMceConfig = () => {
		$.ajax({
			type: "GET",
			url: "/melis/MelisCore/MelisTinyMce/preloadTinyMceConfig",
			encode: true
		}).done(function(data) {
			$.each(data, ($type, $config) => {
				tinyMceConfigs[$type] = $config;
			});
		});
	};

	// This method will initialize an editor after requesting the TinyMCE configuration
	function createTinyMCE(type, selector, options) {
		if (!type) type = "";
		if (!selector) selector = "";
		if (!options) options = null;

		// setTimeout: Saving our life in initializing multiple tinymce
		setTimeout(() => {
			// DataString with the values need get the TinyMCE configuration
			var dataString = $.extend(
				{
					type: type,
					selector: selector,
					// options: options,
				},
				options
			);

				if (options.hasOwnProperty("mini_templates_url")) {
					options.mini_templates_url = options.mini_templates_url;
				}

			let tinyMceConfig = window.parent.melisTinyMCE.tinyMceConfigs[type];

			let config = $.extend(tinyMceConfig, dataString);

				if (typeof tinyMCE != "undefined") {
					if (selector.length) {
						try {
							// removing selector that has been initialized before
							// then we can re-init again
							tinyMCE.remove(selector);
							// tinymce.DOM.remove(selector);
						} catch (e) {}
					}
				}
				
				if ( config["setup"] ) {
					var setupCb = config["setup"];
						config["setup"] = eval(config["setup"]);
				}

				if (config["init_instance_callback"]) {
					var initInstanceCb = config["init_instance_callback"];
						config["init_instance_callback"] = eval(config["init_instance_callback"]);
				}

				if ( config["file_picker_callback"] ) {
					var filePickerCb = config["file_picker_callback"];
						config["file_picker_callback"] = eval( config["file_picker_callback"] );
				}
			
				// Initializing TinyMCE with the request Configurations
				tinyMCE.init(config);

				// defaulting function callbacks to string except for .file_picker_callback needs to be a function
				var afterConfigs = window.parent.melisTinyMCE.tinyMceConfigs[type];
					
					if ( typeof setupCb === 'string' ) {
						afterConfigs.setup = 'melisTinyMCE.tinyMceActionEvent';
					}

					if ( typeof initInstanceCb === 'string' ) {
						afterConfigs.init_instance_callback = initInstanceCb;
					}

					if ( typeof filePickerCb === 'function' ) {
						afterConfigs.file_picker_callback = filePickerCb.name;
						afterConfigs.file_picker_callback = eval(afterConfigs.file_picker_callback);
					}
		}, 1000);
	}

	filePickerCallback = function(cb, value, meta) {
		var input = document.createElement("input");

			input.setAttribute("type", "file");
			input.setAttribute("accept", "image/*");
			/*
				Note: In modern browsers input[type="file"] is functional without
				even adding it to the DOM, but that might not be the case in some older
				or quirky browsers like IE, so you might want to add it to the DOM
				just in case, and visually hide it. And do not forget do remove it
				once you do not need it anymore.
			*/
			input.onchange = function() {
				var file = this.files[0],
					reader = new FileReader();

					reader.onload = function() {
						/*
							Note: Now we need to register the blob in TinyMCEs image blob
							registry. In the next release this part hopefully won't be
							necessary, as we are looking to handle it internally.
						*/
						var id = "blobid" + new Date().getTime(),
							blobCache = tinymce.activeEditor.editorUpload.blobCache,
							base64 = reader.result.split(",")[1],
							blobInfo = blobCache.create(id, file, base64);

						blobCache.add(blobInfo);

						/* call the callback and populate the Title field with the file name */
						cb(blobInfo.blobUri(), { title: file.name });
					};

					reader.readAsDataURL(file);
			};

			input.click();
	};

	// TinyMCE action event
	function tinyMceActionEvent(editor) {
		//console.log(`tinyMceActionEvent() editor: `, editor);
		editor.on("change", function() {
			// Any changes will sync to the selector (Ex. textarea)
			// tinymce.triggerSave();
			editor.save();
		});

		editor.on("init", function(e) {
			//tinyMceOpenDialog(editor);

			// for Insert/Edit Link and other e.command
			editor.on("ExecCommand", function(e) {
				var $body = $("body");
					//console.log("editor.on ExecCommand e.command: ", e.command);
					if ( e.command === "mceLink" ) {
						// wait for DOM to update
						setTimeout(function() {
							let $dialogTitle 	= document.querySelector(".tox-dialog__title"),
								$dialogBody 	= document.querySelector(".tox-dialog__body-content"),
								$browseUrl  	= $dialogBody.querySelector(".tox-form__controls-h-stack .tox-browse-url");						  

							// creates new custom button and set attributes
							let $customButton = document.createElement("button");

								$customButton.innerHTML = '<i class="icon icon-sitemap fa fa-sitemap" style="font-family: FontAwesome; position: relative; font-size: 16px; display: block; text-align: center;"></i>';
								//$customButton.classList.add("mce-btn", "mce-open");

								setMultipleAttributes($customButton, { 
									"title" : "Site tree view",
									"id"	: "mce-link-tree",
									"style" : "width: 34px; height: 34px;",
									"class" : "mce-btn mce-open"
								});

								// insert the new button after browse URL button
								$browseUrl.parentNode.insertBefore( $customButton, $browseUrl.nextElementSibling );

								// event handler of new button
								$customButton.onclick = function() {
									// show modal for #id_meliscms_find_page_tree
									melisLinkTree.createTreeModal();
								};
								
								// scroll to view dialog box
								var $dialog = $body.find(".tox-dialog");
									if ( $dialog.length ) {
										modalPopUp();
									}
						}, 100);
					} 
					else if ( e.command === "mceInsertFile" ) {
						// scroll to view moxman container
						setTimeout(function() {	
							// .moxman-floatpanel
							var $moxContainer = $body.find(".moxman-container");
								if ( $moxContainer.length ) {
									modalPopUp();
								}
						}, 1000);
					}
					else {
						// scroll to view dialog box
						setTimeout(function() {
							var $dialog = $body.find(".tox-dialog");
								if ( $dialog.length ) {
									modalPopUp();
								}
						}, 100);
					}
			});
		});
	}

	// opening of tinymce dialog
	function tinyMceOpenDialog(editor) {
		var $body = $("body");
			editor.windowManager.oldOpen = editor.windowManager.open; // save for later
			editor.windowManager.open = function(t, r) {
				// replace with our own function
				var modal = this.oldOpen.apply(this, [t, r]); // call original
				var editLinkTitle = translations.tr_meliscore_tinymce_insert_edit_link_dialog_title;
				var insertMiniTemplateTitle = translations.tr_meliscore_tinymce_mini_template_add_button_tooltip;

					// adding of add tree view button from dialog initialization
					if (t.title === editLinkTitle && typeof melisLinkTree != "undefined") {
						$(".tox-form__controls-h-stack").append(
							'<button title="Site tree view" id="mce-link-tree" class="mce-btn mce-open" style="width: 34px; height: 34px;"><i class="icon icon-sitemap fa fa-sitemap" style="font-family: FontAwesome; position: relative; font-size: 16px; display: block; text-align: center;"></i></button>'
						);

						$body.on("click", "#mce-link-tree", function() {
							melisLinkTree.createTreeModal();
						});
					}

					// resize dialog to full width on mini templates
					if (t.title === insertMiniTemplateTitle) {
						$(".tox-dialog").css("max-width", "100%");
					}

				var $dialog = $(".tox-dialog__header").closest(".tox-dialog");

					if ( $dialog.length ) {
						modalPopUp();
					}

					return modal; // Template plugin is dependent on this return value
			};
	}

	// Stating zone to loading
	function loadingZone(targetElem) {
		if (targetElem.length) {
			var tempLoader =
				'<div id="loadingZone" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';
			targetElem.attr("style", "position: relative");
			targetElem.append(tempLoader);
		}
	}

	// Removing loading state on zone
	function removeLoadingZone(targetElem) {
		if (targetElem.length) {
			targetElem.find("#loadingZone").remove();
		}
	}

	/**
     * set multiple attributes on element
     */
    function setMultipleAttributes(elem, elemAttributes) {
        for ( let i in elemAttributes ) {
            elem.setAttribute(i, elemAttributes[i]);
        }
    }

	// modal pop up tinymce melis-core
	function modalPopUp() {
		// OPENING THE POPUP
		var $body           = $("body"),
			$mcePopUp       = $body.find(".tox-tinymce-aux"), // #mce-modal-block [.tox-tinymce-aux]
			$dialog         = $body.find(".tox-dialog"),
			$moxContainer   = $body.find(".moxman-container"), // moxiemanager, Media Library
			$iframe         = window.parent.$(".melis-iframe"),
			dialogHeight;

			if ( $mcePopUp.length ) {
				$body.addClass("modal-open");
				if ( $iframe.length ) {
					// iframe height
					var iframeHeight 	= $(window).height(),
						// iframe offset
						$iframeOffset 	= $iframe.position().top;
						
						// dialog box height .mce-window [.dialog]
						if ( $dialog.length ) {
							dialogHeight = $dialog.outerHeight() - $iframeOffset * 10;
						}
						else {
							dialogHeight = $moxContainer.outerHeight() - $iframeOffset * 10;
						}
						parent.scrollToViewTinyMCE(dialogHeight, iframeHeight);
				} else {
					var bodyHeight = window.parent.$("body").height();
					
						if ( $dialog.length ) {
							dialogHeight = $dialog.outerHeight();
						}
						else {
							dialogHeight = $moxContainer.outerHeight() - $iframeOffset * 10;
						}
						parent.scrollToViewTinyMCE(dialogHeight, bodyHeight);
				}

				// CLOSING THE POPUP
				var timeOut = setInterval(function() {
					// || !$moxContainer.is(":visible"), for moxiemanager, Media Library
					if ( !$dialog.is(":visible") ) {
						window.parent
							.$("body")
							.animate({ scrollTop: parent.scrollOffsetTinyMCE() }, 200);

						$body.removeClass("modal-open");

						clearTimeout(timeOut);
					}
				}, 300);
			}
	}

	function addMelisCss() {
		var el = document.createElement("link");

			el.href 	= "/MelisCore/css/melis_tinymce.css";
			el.rel 		= "stylesheet";
			el.media 	= "screen";
			el.type 	= "text/css";

			document.head.appendChild(el);
	}

	// Function that accessible using melisTinyMCE
	return {
		tinyMceConfigs: tinyMceConfigs,
		getTinyMceConfig: getTinyMceConfig,
		createTinyMCE: createTinyMCE,
		tinyMceActionEvent: tinyMceActionEvent,
		modalPopUp: modalPopUp,
		addMelisCss: addMelisCss,
		setMultipleAttributes: setMultipleAttributes
	};
})();

// Prevent Bootstrap dialog from blocking focusin
document.addEventListener('focusin', (e) => {
	if (e.target.closest(".tox-tinymce, .tox-tinymce-aux, .moxman-window") !== null) {
		e.stopImmediatePropagation();
	}
});

// This whole file is not the one inside the page edition iframe
(function($) {
	var $body = $("body");
		// adding Melis TinyMCE CSS
		melisTinyMCE.addMelisCss();
		// custom modal TinyMCE
		//melisTinyMCE.modalPopUp();
		if (window.self === window.top) {
			// This only calls when in top/parent window
			melisTinyMCE.getTinyMceConfig();
		}

		// scroll to view tinymce dialog box, melis-cms find page tree, site tree view modal
		$body.on("click", "#id_meliscms_find_page_tree .footer-modal button", function() {
			setTimeout(function() {
				var $iframe 	= $(".melis-iframe"),
					$mcePopUp 	= $iframe.contents().find(".tox-tinymce-aux"),
					$dialog 	= $iframe.contents().find(".tox-dialog");
					
					if ( $mcePopUp.length ) {
						if ( $iframe.length ) {
							//var iframeHeight = $(window).height(),
							var iframeHeight = $iframe.height(),
								// iframe offset
								$iframeOffset = $iframe.position().top,
								// dialog box height .mce-window [.dialog]
								dialogHeight = $dialog.outerHeight() - $iframeOffset * 10;

								//scrollToViewTinyMCE
								parent.scrollToViewTinyMCE(dialogHeight, iframeHeight);							
						} else {
							var bodyHeight 		= $body.height(),
								dialogHeight 	= $dialog.outerHeight();

								//scrollToViewTinyMCE
								parent.scrollToViewTinyMCE(dialogHeight, bodyHeight);
						}
					}
			}, 100);
		});
})(jQuery);

function tinyMceCleaner(editor) {
	editor.serializer.addNodeFilter("script,style", function(nodes, name) {
		var i = nodes.length,
			node,
			value,
			type;

		function trim(value) {
			return value
				.replace(/(<!--\[CDATA\[|\]\]-->)/g, "\n")
				.replace(/^[\r\n]*|[\r\n]*$/g, "")
				.replace(
					/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi,
					""
				)
				.replace(
					/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g,
					""
				);
		}
		while (i--) {
			node = nodes[i];
			value = node.firstChild ? node.firstChild.value : "";

			if (value.length > 0) {
				node.firstChild.value = trim(value);
			}
		}
	});
}