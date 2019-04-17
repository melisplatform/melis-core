var melisTinyMCE = (function(){
    // This method will initialize an editor after requesting the TinyMCE configuration
    function createTinyMCE(type, selector, options){
        if(!type) type='';
        if(!selector) selector='';
        if(!options) options=null;
        // DataString with the values need get the TinyMCE configuration
        var dataString = {
            type        : type,
            selector    : selector,
            options     : options
        }
        
        $.ajax({
            type        : 'POST', 
            url         : '/melis/MelisCore/MelisTinyMce/getTinyMceConfig',
            data        : dataString,
            encode      : true
        }).success(function(data){
            if(data.success){
                
                if(typeof(tinyMCE) != 'undefined') {
                    if(selector.length){
                        try{
                            tinymce.remove(selector);
                        }catch (e) {}
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
        /**
        var targetId = editor.id;
        */
        editor.on("change", function () {
            // Any changes will sync to the selector (Ex. textarea)
            // tinymce.triggerSave();
            editor.save();
        });
        
        editor.on("init",function() {
            // adding of add tree view button from dialog initialization
            tinyMceDialogInitAddTreeViewBtn(editor);

            // tinymce outside iframe container
            //tinyMceOnEditorInitToolbarBtn();
        });
    }

    // adding of specific class on tinymce outside iframe
    function tinyMceOnEditorInitToolbarBtn() {
        var $body           = window.parent.$("body"),
            $btiny          = $body.find(".tox-tinymce"),
            $baux           = $body.find(".tox-tinymce-aux"),
            $btoxToolGroup  = $btiny.find(".tox-toolbar .tox-toolbar__group");

        var transTitle      = translations.tr_meliscore_tinymce_insert_edit_link_dialog_title;

            $btoxToolGroup.each(function(i) {
                var $bBtn = $(this).find("button");
                    $bBtn.each(function(i) {
                        var $attrTitle  = $(this)[i].attributes[1].value;
                            if ( transTitle !== "" && $attrTitle === transTitle ) {
                                $(this).addClass("insert-edit-link");

                                $(this).on("click", function() {
                                    tinyMceAddTreeViewBtn();
                                });
                            }
                            return false;
                    });
            });
    }

    // adding of add tree view button from dialog initialization
    function tinyMceDialogInitAddTreeViewBtn(editor) {
        var $body       = $("body"),
            transTitle  = translations.tr_meliscore_tinymce_insert_edit_link_dialog_title;

            editor.windowManager.oldOpen = editor.windowManager.open;  // save for later
            editor.windowManager.open = function (t, r) {    // replace with our own function
                var modal = this.oldOpen.apply(this, [t, r]);  // call original

                    if ( t.title === transTitle ) {
                        $(".tox-form__controls-h-stack").append(
                            '<button title="Site tree view" id="mce-link-tree" class="mce-btn mce-open" style="width: 34px; height: 34px;"><i class="icon icon-sitemap fa fa-sitemap" style="font-family: FontAwesome; position: relative; font-size: 16px; display: block; text-align: center;"></i></button>'
                        );

                        $body.on("click", "#mce-link-tree", function() {                           
                            melisLinkTree.createTreeModal();
                        });
                    }

                    return modal; // Template plugin is dependent on this return value
            };
    }

    // adding of tree view button from outside iframe
    function tinyMceAddTreeViewBtn() {
        setTimeout(function() {
            var $body           = window.parent.$("body"),
                $baux           = $body.find(".tox-tinymce-aux"),
                $bdialog        = $baux.find(".tox-dialog"),
                $bconHStacks    = $bdialog.find(".tox-form__controls-h-stack"),
                $burlBtn        = $bconHStacks.find("#mce-link-tree");

            var melisTreeBtn    = '<button title="Site tree view" id="mce-link-tree" class="mce-btn mce-open" style="width: 34px; height: 34px;"><i class="icon icon-sitemap fa fa-sitemap" style="font-family: FontAwesome; position: relative; font-size: 16px; display: block; text-align: center;"></i></button>';
                
                if ( $baux.length ) {
                    if ( $burlBtn.length === 0 && $bconHStacks.length > 0 ) {
                        $bconHStacks.append( melisTreeBtn );    
                    }
                }
        }, 50);
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
        setTimeout(function() {
            var $body   = window.parent.$("body"),
                $btn    = $body.find(".tox-tbtn");
                // OPENING THE POPUP
                /*$body.on("click", ".mce-btn", function(){
                    var mcePopUp = $("#mce-modal-block").length;
                    if(mcePopUp){

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
                        console.log("no popup");
                    }
                });*/

                console.log("$btn length: ", $btn.length);

                /*
                 * [.mce-btn] @ .tox-tbtn
                 * [#mce-modal-block] @ .tox-tinymce-aux
                 */
                $body.on("click", ".tox-tbtn", function() {
                    console.log(".tox-tbtn");
                });
        }, 500);
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
        createTinyMCE       :   createTinyMCE,
        tinyMceActionEvent  :   tinyMceActionEvent,
        modalPopUp          :   modalPopUp,
        addMelisCss         :   addMelisCss,
    };
    
})();

(function() {
    // adding Melis TinyMCE CSS
    melisTinyMCE.addMelisCss();
    // custom modal TinyMCE
    melisTinyMCE.modalPopUp();
})();
