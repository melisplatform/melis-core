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

            editor.on("click", function() {
                var $ttox       = $t(".tox-tinymce"),
                    $aux        = $t(".tox-tinymce-aux"),
                    $editLink   = $t(".tox-toolbar .tox-toolbar__group").last().prev().find("button:first-child").addClass("insert-edit-link");

                    $editLink.on("click", function() {
                        if ( $aux.length ) {
                            setTimeout(function() {
                                melisLinkTree.checkBtn();
                            }, 50);
                        }
                    });

                    console.log("editor clicked");

                    $(window).on("keydown", function() {
                        console.log("editor keydown");
                    });
            });

            editor.on("contextmenu", function() {
                var $aux = $t(".tox-tinymce-aux");

                    if ( $aux.length ) {
                        setTimeout(function() {
                            var $menuItem = $aux.find(".tox-collection__item--active");
                                $menuItem.on("click", function() {
                                    setTimeout(function() {
                                        melisLinkTree.checkBtn();
                                    }, 50);
                                });
                        }, 50);
                    }
            });

            /*editor.on("focus", function(e) {
                console.log("editor focused");
                var code = e.keyCode || e.which;
                var $this = $(this);

                

                console.log("e: " , e);

                if ( e.keyCode === 75 && e.ctrlKey ) {

                    console.log("ctrl + key");

                    melisLinkTree.checkBtn();
                }
            });*/
	}

    /*$(window).keypress(function(e) {
        console.log("keypress ctr + k");
        var code = e.keyCode || e.which;
            if ( code == 75 ) {
                melisLinkTree.checkBtn();
            }
    });*/

	/*function tinyMceInsertMelisTreeBtn(editor) {
		//editor.on("init", melisLinkTree.checkBtn);
		editor.on("click", function() {
            var $tmce 		= tinymce.dom.DomQuery,
            	$editLink 	= $tmce(".tox-toolbar .tox-toolbar__group").last().prev().find("button:first-child").addClass("insert-edit-link");

				$editLink.on("click", function() {
					setTimeout( melisLinkTree.checkBtn, 500 );
				});
		});
	}*/

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
