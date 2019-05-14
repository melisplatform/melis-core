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
            if(data.success) {
                //console.log("createTinyMCE tinyMCE: ", tinyMCE);

                if(typeof(tinyMCE) != 'undefined') {
                    if(selector.length) {
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
        });
    }

    // adding of add tree view button from dialog initialization
    function tinyMceDialogInitAddTreeViewBtn(editor) {
        //console.log("tinyMceDialogInitAddTreeViewBtn tinyMCE: ", tinyMCE);

        var $body       = $("body"),
            //transTitle  = translations.tr_meliscore_tinymce_insert_edit_link_dialog_title,
            $dialog     = $body.find(".tox-dialog");

            editor.windowManager.oldOpen = editor.windowManager.open;  // save for later
            editor.windowManager.open = function (t, r) {    // replace with our own function
                var modal = this.oldOpen.apply(this, [t, r]);  // call original

                    if ( t.title === 'Insert/Edit Link' ) {
                        $(".tox-form__controls-h-stack").append(
                            '<button title="Site tree view" id="mce-link-tree" class="mce-btn mce-open" style="width: 34px; height: 34px;"><i class="icon icon-sitemap fa fa-sitemap" style="font-family: FontAwesome; position: relative; font-size: 16px; display: block; text-align: center;"></i></button>'
                        );

                        $body.on("click", "#mce-link-tree", function() {                           
                            melisLinkTree.createTreeModal();
                        });
                    }

                var $dialog = $(".tox-dialog__header").closest(".tox-dialog");

                    if ( $dialog.length ) {

                        // modal pop up
                        // window.parent.melisCms.modalPopUp(); // in melisCms.js but not used

                        modalPopUp();
                    }


                    return modal; // Template plugin is dependent on this return value
            };
    }

    
    
    // Stating zone to loading
    function loadingZone(targetElem) {
        if(targetElem.length){
            var tempLoader = '<div id="loadingZone" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>';
            targetElem.attr("style", "position: relative");
            targetElem.append(tempLoader);
        }
    }
    
    // Removing loading state on zone
    function removeLoadingZone(targetElem) {
        if(targetElem.length){
            targetElem.find("#loadingZone").remove();
        }
    }

    // modal pop up tinymce melis-core
    function modalPopUp() {
        // OPENING THE POPUP
        var $body           = $("body"),
            $mcePopUp       = $body.find(".tox-tinymce-aux"), // #mce-modal-block [.tox-tinymce-aux]
            $dialog         = $body.find(".tox-dialog"),
            $iframe         = window.parent.$(".melis-iframe");

            if ( $mcePopUp.length ) {

                if ( $iframe.length ) {
                    // iframe height
                    var iframeHeight    = $(window).height(),
                        // iframe offset
                        $iframeOffset   = $iframe.position().top,
                        // dialog box height .mce-window [.dialog]
                        dialogHeight    = $dialog.outerHeight() - ( $iframeOffset * 10 );

                        parent.scrollToViewTinyMCE(dialogHeight, iframeHeight);
                }
                else {
                    var bodyHeight      = window.parent.$("body").height(),
                        dialogHeight    = $dialog.outerHeight();

                        parent.scrollToViewTinyMCE(dialogHeight, bodyHeight);
                }
                
                // CLOSING THE POPUP
                var timeOut = setInterval(function() { 
                    if( ! $dialog.is(":visible") ) {
                        window.parent.$("body").animate({scrollTop: parent.scrollOffsetTinyMCE() }, 200);
                        clearTimeout(timeOut);
                    }
                }, 300);
            }
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
    //melisTinyMCE.modalPopUp();
})();
