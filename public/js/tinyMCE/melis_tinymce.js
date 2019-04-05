var melisTinyMCE = (function() {
	// This method will initialize an editor after requesting the TinyMCE configuration
	function createTinyMCE(type, selector, options) {
        if(!type) type = '';
        if(!selector) selector = '';
        if(!options) options = null;
		// DataString with the values need get the TinyMCE configuration
		var dataString = {
			type 		: type,
			selector 	: selector,
			options 	: options
		};

		$.ajax({
			type        : 'POST',
    	    url         : '/melis/MelisCore/MelisTinyMce/getTinyMceConfig',
    	    data        : dataString,
    	    encode		: true
    	}).success(function(data) {
    		if( data.success ) {
    			if( typeof(tinyMCE) != 'undefined' ) {
    				if( selector.length ) {
    					try {
    						tinymce.remove(selector);
    					} catch (e) {}
    				}
     			}
    			// Initializing TinyMCE with the request Configurations
    			tinymce.init(data.config);
    		}
    	}).error(function(xhr, textStatus, errorThrown){
    		alert("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
    	});
	}

	// TinyMCE  action event
	function tinyMceActionEvent(editor) {
        var $t = tinymce.dom.DomQuery;

            editor.on("change", function () {
            	// Any changes will sync to the selector (Ex. textarea)
    			// tinymce.triggerSave();
                editor.save();
            });

            editor.on("init", function() {
                console.log("editor init");

                tinyMceInsertMelisTreeBtn();
            });

            editor.on("click", function() {
                console.log("editor click");

                tinyMceInsertMelisTreeBtn();
            });

            /*editor.on("focus", function() {
                console.log("editor focus");

                tinyMceInsertMelisTreeBtn();
            });*/

            editor.on("contextmenu", function() {
                var $body   = window.parent.$("body"),
                    $iaux   = $t(".tox-tinymce-aux"),
                    $baux   = $body.find(".tox-tinymce-aux");

                    setTimeout(function() {
                        var $imenuItem = $iaux.find(".tox-selected-menu .tox-collection__group .tox-menu-nav__js"),
                            $bmenuItem = $baux.find(".tox-selected-menu .tox-collection__group .tox-menu-nav__js");

                            if ( $imenuItem.length > 0 ) {
                                $imenuItem.on("click", function() {
                                    console.log("$imenuItem");
                                    setTimeout(function() {
                                        melisLinkTree.checkBtn();
                                    }, 100);
                                });
                            }

                            if ( $bmenuItem.length > 0 ) {
                                $bmenuItem.on("click", function() {
                                    console.log("$bmenuItem");
                                    setTimeout(function() {
                                        melisLinkTree.checkBtn();
                                    }, 100);
                                });
                            }
                    }, 50);
            });

            editor.on("keydown", function(e) {
                var code = e.keyCode || e.which;

                    if ( code === 75 && e.ctrlKey ) {
                        setTimeout(function() {
                            melisLinkTree.checkBtn();
                        }, 50);
                    }
            });
	}

    function tinyMceInsertMelisTreeBtn() {
        var //$body           = $("body"),
            $body           = window.parent.$("body"),
            $t              = tinymce.dom.DomQuery,

            $itiny          = $t(".tox-tinymce");
            $btiny          = $body.find(".tox-tinymce"),

            $iaux           = $t(".tox-tinymce-aux"),
            $baux           = $body.find(".tox-tinymce-aux"),

            $itoxToolGroup  = $itiny.find(".tox-toolbar .tox-toolbar__group"),
            $btoxToolGroup  = $btiny.find(".tox-toolbar .tox-toolbar__group");

            //bBtn            = $btoxToolGroup.last().prev().find("button").first();

            //$bBtn           = $btoxToolGroup.find("button");

        var transTitle      = translations.tr_meliscore_tinymce_insert_edit_link_dialog_title;

            $btoxToolGroup.each(function(i) {
                //console.log("each $btoxToolGroup");

                var $bBtn = $(this).find("button");
                    $bBtn.each(function(i) {
                        var $attrTitle  = $(this)[i].attributes[1].value;

                            //console.log("$bBtn: ", $(this));

                            if ( transTitle !== "" && $attrTitle === transTitle ) {
                                //console.log("transTitle === $attrTitle");

                                $(this).addClass("insert-edit-link");

                                $(this).on("click", function() {                                  
                                    if ( $baux.length ) {
                                        setTimeout(function() {
                                            melisLinkTree.checkBtn();
                                        }, 50);
                                    }
                                    console.log("comments insert-edit-link clicked");
                                    
                                    return false;
                                });

                                return false;
                            }

                            return false;
                    });
            });

            /*console.log("transTitle: ", transTitle);
            console.log("$bBtn title: ", $bBtn.attr("title") );

            if ( transTitle !== "" && $bBtn.attr("title") === transTitle ) {
                $bBtn.addClass("insert-edit-link");

                console.log("if $bBtn: ", $bBtn.attr("title") );
            }*/

            /*if ( translations.tr_meliscore_tinymce_insert_edit_link_dialog_title !== "" ) {
                $editLink1.on("click", function() {
                    console.log("$editLink1");
                    if ( $iaux.length ) {
                        setTimeout(function() {
                            melisLinkTree.checkBtn();
                        }, 50);
                    }
                });

                $editLink2.on("click", function() {
                    console.log("$editLink2");
                    if ( $baux.length ) {
                        setTimeout(function() {
                            melisLinkTree.checkBtn();
                        }, 50);
                    }
                });
            }*/
    }

	// Stating zone to loading
    function loadingZone(targetElem){
    	if(targetElem.length){
    		var tempLoader = '<div id="loadingZone" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';
    		targetElem.attr("style", "position: relative");
    		targetElem.append(tempLoader);
    	}
    }

    // Removing loading state on zone
    function removeLoadingZone(targetElem){
    	if(targetElem.length){
    		targetElem.find("#loadingZone").remove();
    	}
    }

    function modalPopUp() {
        // OPENING THE POPUP
        $("body").on("click", ".mce-btn", function() {
            var mcePopUp = $("#mce-modal-block").length;
            if ( mcePopUp ) {
                // iframe height
                var iframeHeight = $(window).height();

                // dialog box height
                var dialogHeight = $(".mce-window").outerHeight();

                parent.scrollToViewTinyMCE(dialogHeight, iframeHeight);

                // CLOSING THE POPUP
                var timeOut = setInterval(function(){

                    // console.log( "return =" + parent.scrollOffsetTinyMCE() );
                    if( !$(".mce-window").is(":visible") ){
                    // window.parent.scrollTo( 0,parent.scrollOffsetTinyMCE())
                        window.parent.$("body").animate({scrollTop: parent.scrollOffsetTinyMCE() }, 200);

                        clearTimeout(timeOut);
                    }
                }, 300);

            }
            else {
                /* console.log("no popup"); */
            }
        });
    }

    function addMelisCss() {
        var el = document.createElement('link');
        el.href = '/MelisCore/css/melis_tinymce.css';
        el.rel  = "stylesheet";
        el.media  = "screen";
        el.type = "text/css";
        document.head.appendChild(el);
    }

	// Function that accessible using melisTinyMCE
	return {
		createTinyMCE					:	createTinyMCE,
		tinyMceActionEvent				:	tinyMceActionEvent,
        //tinyMceInsertMelisTreeBtn 		: 	tinyMceInsertMelisTreeBtn,
        modalPopUp          			:   modalPopUp,
        addMelisCss         			:   addMelisCss
	};

})();

(function() {
	// adding Melis TinyMCE CSS
    melisTinyMCE.addMelisCss();
	// custom modal TinyMCE
    melisTinyMCE.modalPopUp();
})();
