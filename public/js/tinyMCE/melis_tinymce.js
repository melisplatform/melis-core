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
		editor.on("change", function() {
			// Any changes will sync to the selector (Ex. textarea)
			// tinymce.triggerSave();
			editor.save();
		});
	
		editor.on("init", function(e) {
			// store button handlers to prevent duplicates
			const buttonHandlers = new Map();
			let execCommandHandler = null;
			
			// set up ExecCommand listener once
			execCommandHandler = editor.on("ExecCommand", function(e) {
				// get selection rect - validate it first
				let rect = null;
				let editorContainer = null;
				
				try {
					const selection = editor.selection.getRng();
					if (selection && !selection.collapsed) {
						rect = selection.getBoundingClientRect();
					}
				} catch (err) {
					console.warn('Could not get selection rect:', err);
				}
				
				try {
					editorContainer = editor.getContainer().getBoundingClientRect();
				} catch (err) {
					console.warn('Could not get editor container rect:', err);
				}
				
				const moxieLabel = `[aria-label="Media Library"]`;
				
				if (e.command === "mceLink") {
					setTimeout(function() {
						let $dialogTitle = document.querySelector(".tox-dialog__title"),
							$dialogBody = document.querySelector(".tox-dialog__body-content"),
							$browseUrl = $dialogBody?.querySelector(".tox-form__controls-h-stack .tox-browse-url");
						
						if (!$browseUrl) return;
						
						// check if button already exists
						let $customButton = document.getElementById("mce-link-tree");
						if (!$customButton) {
							$customButton = document.createElement("button");
							$customButton.innerHTML = '<i class="icon icon-sitemap fa fa-sitemap" style="font-family: FontAwesome; position: relative; font-size: 16px; display: block; text-align: center;"></i>';
							
							setMultipleAttributes($customButton, { 
								"title": "Site tree view",
								"id": "mce-link-tree",
								"style": "width: 34px; height: 34px;",
								"class": "mce-btn mce-open"
							});
							
							$browseUrl.parentNode.insertBefore($customButton, $browseUrl.nextElementSibling);
							
							$customButton.onclick = function() {
								if (typeof melisLinkTree !== 'undefined') {
									melisLinkTree.createTreeModal();
								}
							};
						}
						
						setTimeout(() => openDialogNearCursor('.tox-dialog', rect, editorContainer), 100);
						toxBrowseUrl(rect, editorContainer, moxieLabel);
					}, 10);
				} 
				else if (e.command === "mceInsertFile") {
					moveMoxieDialogNear(rect, editorContainer, moxieLabel);
					moxieCreateNewFolder(rect, editorContainer);
					moxieCreateButton(rect, editorContainer);
				}
				else if (e.command === "mceMedia" || e.command === "mceCodeEditor" || e.command === "mceAnchor" || e.command === "mceShowCharmap" || e.command === "mceEmoticons") {
					setTimeout(() => openDialogNearCursor('.tox-dialog', rect, editorContainer), 100);
					toxBrowseUrl(rect, editorContainer, moxieLabel);
				}
			});
			
			// set up button listeners once, not on every ExecCommand
			const buttons = [
				{
					selector: '.tox-tbtn[aria-label="' + tinymce.util.I18n.translate("Insert/edit image") + '"]',
				},
				{
					selector: '.tox-tbtn[aria-label="Mini Template"]',
				}
			];
			
			// use a flag or check to ensure listeners are only added once
			const setupButtonListeners = () => {
				buttons.forEach(({ selector }) => {
					// Skip if handler already exists for this selector
					if (buttonHandlers.has(selector)) return;
					
					const button = editor.editorContainer?.querySelector(selector) ?? document.querySelector(selector);
					if (button) {
						const handler = () => {
							// Get fresh rect and editorContainer when button is clicked
							let rect = null;
							let editorContainer = null;
							
							try {
								const selection = editor.selection.getRng();
								if (selection && !selection.collapsed) {
									rect = selection.getBoundingClientRect();
								}
							} catch (err) {
								// Ignore
							}
							
							try {
								editorContainer = editor.getContainer().getBoundingClientRect();
							} catch (err) {
								// Ignore
							}
							
							setTimeout(() => openDialogNearCursor('.tox-dialog', rect, editorContainer), 100);
							toxBrowseUrl(rect, editorContainer, `[aria-label="Media Library"]`);
						};
						
						button.addEventListener("click", handler);
						buttonHandlers.set(selector, { button, handler });
					}
				});
			};
			
			// set up button listeners after a short delay to ensure buttons exist
			setTimeout(setupButtonListeners, 500);
			
			// also try to set up when toolbar is ready
			editor.on("NodeChange", function() {
				if (buttonHandlers.size < buttons.length) {
					setupButtonListeners();
				}
			});
			
			// cleanup on editor removal
			editor.on("remove", function() {
				if (execCommandHandler) {
					execCommandHandler.off();
				}
				buttonHandlers.forEach(({ button, handler }) => {
					button.removeEventListener("click", handler);
				});
				buttonHandlers.clear();
			});
		});

		// don't show .melis-plugin-tools-box on focus
		editor.on("focus", function() {
			const $this 		= $(this),
				$thisFocus 		= $this[0],
				targetElmFocus	= $thisFocus.targetElm,
				//$toolbarFocus 	= $(editor.getContainer()).find(".tox-editor-header"),
				$toolsBoxFocus	= $(targetElmFocus).closest(".melis-ui-outlined").find(".melis-plugin-tools-box");
				
				// raise current toolbar after a short delay to ensure its visible
				setTimeout(() => {				
					$toolsBoxFocus.css("opacity", 0);
					$toolsBoxFocus.css("visibility", "hidden");
				}, 100);
		});

		// don't show .melis-plugin-tools-box on blur
		editor.on("blur", function() {
			const $thisBlur 	= $(this)[0],
				targetElmBlur 	= $thisBlur.targetElm,
				//$toolbarBlur 	= $(editor.getContainer()).find(".tox-editor-header"),
				$toolBoxBlur 	= $(targetElmBlur).closest(".melis-ui-outlined").find(".melis-plugin-tools-box");
				//$dndWrapBlur 	= $(targetElmBlur).closest(".dnd-layout-wrapper")

				// reset .melis-plugin-tools-box inline css
				setTimeout(() => {
					$toolBoxBlur.removeAttr("style");
				}, 100);
		});
	}

	// top, window.parent.$("body")
	// .melis-iframe, window.$("body")

	// check on dialog if .tox-browse-url
	function toxBrowseUrl(rect, editorContainer, moxieLabel) {
		const browseUrlInterval = setInterval(() => {
			const moxie = window.moxman,
				toxBrowserUrl = document.querySelector(".tox-browse-url");
				if (toxBrowserUrl) {
					toxBrowserUrl.addEventListener("click", () => {
						const moxieInterval = setInterval(() => {
							const moxmanContainer = document.querySelector(".moxman-container"+moxieLabel);
								if (moxmanContainer) {
									// scroll to view moxman container
									moveMoxieDialogNear(rect, editorContainer, moxieLabel);

									clearInterval(moxieInterval);
								}
						}, 100);
					});

					clearInterval(browseUrlInterval);
				}
		}, 100);

		// create new folder dialog
		moxieCreateNewFolder(rect, editorContainer);

		// create new folder dialog button
		moxieCreateButton(rect, editorContainer);
	}

	function moxieCreateNewFolder(rect, editorContainer) {
		const moxmanFolderInterval = setInterval(() => {
			const moxmanFolder = document.querySelector(".moxman-menu-item");
				if(moxmanFolder) {
					moxmanFolder.addEventListener("click", () => {
						const moxmanContainerNewFolder = `[aria-label="Create new folder"]`;
							// scroll to view moxman container
							moveMoxieDialogNear(rect, editorContainer, moxmanContainerNewFolder);
					});

					clearInterval(moxmanFolderInterval);
				}
		}, 100);
	}

	function moxieCreateButton(rect, editorContainer) {
		const moxmanCreateButtonInterval = setInterval(() => {
			const moxmanCreateButton = document.querySelector(`.moxman-container[aria-label="Create new folder"] .moxman-primary button`),
				moxmanCreateNewFolderTextBox = document.querySelector(`.moxman-container[aria-label="Create new folder"] .moxman-textbox`);
				if(moxmanCreateButton) {
					moxmanCreateButton.addEventListener("click", () => {
						const moxmanCreateButtonAlertDialog = `[aria-label="Error"]`,
							isEmtpy = moxmanCreateNewFolderTextBox.value.trim() === "";
							if(isEmtpy) {
								moveMoxieDialogNear(rect, editorContainer, moxmanCreateButtonAlertDialog);
							}
					});

					clearInterval(moxmanCreateButtonInterval);
				}
		}, 100);
	}

	function moveMoxieDialogNear(rect, editorContainer, label) {
		const dialogInterval = setInterval(() => {
			const dialog = document.querySelector('.moxman-container'+label);
				if (dialog) {
					const style = window.getComputedStyle(dialog);
					const isVisible = style.display !== 'none' && 
									style.visibility !== 'hidden' && 
									style.opacity !== '0';
					if (isVisible) {
						// ensure dialog is displayed					
						if (dialog.style.display === 'none') {
							dialog.style.display = 'block';
						}

						if (dialog.style.visibility === 'hidden') {
							dialog.style.visibility = 'visible';
						}

						// dialog repositioning
						handleDialogReposition(dialog, rect, editorContainer);
						
						clearInterval(dialogInterval);
					}
				}
		}, 300);

		// safety timeout to prevent infinite interval
		setTimeout(() => {
			clearInterval(dialogInterval);
		}, 5000); // 5 second timeout
	}

	// add styles to position near the cursor or selection
	function openDialogNearCursor(selector, rect = null, editorContainer = null) {
		const dialogEl = document.querySelector(selector);
			// dialogEl && editorContainer
			if (dialogEl) {
				// within .melis-iframe
				if (window.self !== window.top) {
					// inside an .melis-iframe, dialog repositioning
					handleDialogReposition(dialogEl, rect, editorContainer);
				}
				else {
					// outside an iframe
					modalPopUp();
				}
			}
	}

	function handleDialogReposition(dialog, rect, editorContainer) {
		console.log(`handleDialogReposition()...`);
		console.log({rect, editorContainer});
		
		const dialogWidth = dialog.offsetWidth || 600;
		const dialogHeight = dialog.offsetHeight || 400;
		
		// Get viewport dimensions
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;
		const padding = 20;
		
		// Validate rect - check if it has meaningful values
		const isRectValid = rect && 
						typeof rect.top === 'number' && 
						typeof rect.left === 'number' &&
						!isNaN(rect.top) && 
						!isNaN(rect.left) &&
						// Check if rect has non-zero dimensions or valid position
						(rect.width > 0 || rect.height > 0 || (rect.top !== 0 || rect.left !== 0));
		
		// Validate editorContainer
		const isEditorContainerValid = editorContainer && 
									typeof editorContainer.top === 'number' &&
									typeof editorContainer.width === 'number' &&
									!isNaN(editorContainer.top) &&
									!isNaN(editorContainer.width) &&
									editorContainer.width > 0 &&
									editorContainer.height > 0;
		
		let top, left;
		
		if (isRectValid) {
			// Use rect position (cursor/selection position)
			// For position: fixed, use viewport-relative coordinates (no scroll)
			top = rect.top - (dialogHeight / 2);
			left = rect.left - (dialogWidth / 2) + ((rect.width || 0) / 2);
		} else if (isEditorContainerValid) {
			// Fallback to editor center (viewport-relative, no scroll)
			top = editorContainer.top + (editorContainer.height / 2) - (dialogHeight / 2);
			left = editorContainer.left + (editorContainer.width / 2) - (dialogWidth / 2);
		} else {
			// Final fallback: center in viewport
			top = (viewportHeight / 2) - (dialogHeight / 2);
			left = (viewportWidth / 2) - (dialogWidth / 2);
		}
		
		// Ensure dialog stays within viewport bounds
		top = Math.max(padding, Math.min(top, viewportHeight - dialogHeight - padding));
		left = Math.max(padding, Math.min(left, viewportWidth - dialogWidth - padding));
		
		// If dialog would be cut off at bottom, position it higher
		if (top + dialogHeight > viewportHeight - padding) {
			top = viewportHeight - dialogHeight - padding;
		}
		
		// If dialog would be cut off at top, position it lower
		if (top < padding) {
			top = padding;
		}

		const isInIframe = window.self !== window.top;
		dialog.style.position = 'fixed';
		
		// Handle parent window case (when dialog is in parent, not iframe)
		if (isInIframe) {
			try {
				const label = '[aria-label="Media Library"]';
				const parentDialog = window.parent.document.querySelector('.moxman-container' + label);
				if (parentDialog && parentDialog === dialog) {
					// Dialog is in parent window, recalculate for parent viewport
					const iframe = window.frameElement;
					if (iframe) {
						const iframeRect = iframe.getBoundingClientRect();
						const parentViewportHeight = window.parent.innerHeight;
						const parentViewportWidth = window.parent.innerWidth;
						
						// Recalculate position relative to parent window
						if (isRectValid) {
							top = iframeRect.top + rect.top - (dialogHeight / 2);
							left = iframeRect.left + rect.left - (dialogWidth / 2) + ((rect.width || 0) / 2);
						} else if (isEditorContainerValid) {
							top = iframeRect.top + editorContainer.top + (editorContainer.height / 2) - (dialogHeight / 2);
							left = iframeRect.left + editorContainer.left + (editorContainer.width / 2) - (dialogWidth / 2);
						} else {
							// Center in parent viewport
							top = (parentViewportHeight / 2) - (dialogHeight / 2);
							left = (parentViewportWidth / 2) - (dialogWidth / 2);
						}
						
						// Clamp to parent viewport
						top = Math.max(padding, Math.min(top, parentViewportHeight - dialogHeight - padding));
						left = Math.max(padding, Math.min(left, parentViewportWidth - dialogWidth - padding));
					}
				}
			} catch (e) {
				// Cross-origin iframe, can't access parent
				console.warn('Cannot access parent window:', e);
			}
		}
		
		dialog.style.top = `${top}px`;
		dialog.style.left = `${left}px`;
		dialog.style.maxHeight = `${viewportHeight - (padding * 2)}px`;
		dialog.style.overflowY = 'auto';
		// dialog.style.zIndex = '10000';

		dialog.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

		// Only call scrollIntoView if dialog is in current window context
		/* if (dialog.offsetParent !== null && (!isInIframe || dialog.ownerDocument === document)) {
			try {
				dialog.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
			} catch (e) {
				console.warn('scrollIntoView failed:', e);
			}
		} */
	}

	function observeAndLockMoxieDialogPosition(rect, editorContainer) {
		const dialog = document.querySelector(`.moxman-container`);
			if (!dialog) return;
		
			const observer = new MutationObserver(() => {
				handleDialogReposition(dialog, rect, editorContainer); // re-apply your position
			});
		
			observer.observe(dialog, {
				attributes: true,
				attributeFilter: ['style', 'class']
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
		setMultipleAttributes: setMultipleAttributes,
		openDialogNearCursor: openDialogNearCursor
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
			// on top, outside an iframe
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
								// parent.scrollToViewTinyMCE(dialogHeight, iframeHeight);
								$dialog[0].scrollIntoView({ behavior: "smooth", block: "center" });
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