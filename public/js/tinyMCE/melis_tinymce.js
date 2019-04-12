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
        var $t = tinymce.dom.DomQuery;
        //var $iframe = $(".melis-iframe");

            editor.on("change", function () {
                // Any changes will sync to the selector (Ex. textarea)
                // tinymce.triggerSave();
                editor.save();
            });

            editor.on("init", function() {
                console.log("editor init");

                // tinymce outside iframe container
                tinyMceOnEditorInitToolbarBtn();
            });

            editor.on("click", function() {
                console.log("editor click");

                // tinymce on iframe container
                tinyMceOnEditorClickToolbarBtn();
            });

            editor.on("contextmenu", function() {
                console.log("editor contextmenu");

                var $body       = window.parent.$("body"),

                    $iaux       = $t(".tox-tinymce-aux");
                    //$iaux       = $iframe.contents().find(".tox-tinymce-aux"),
                    $baux       = $body.find(".tox-tinymce-aux");

                    setTimeout(function() {
                        var $imenuItem  = $iaux.find(".tox-selected-menu .tox-collection__group .tox-menu-nav__js"),
                            $bmenuItem  = $baux.find(".tox-selected-menu .tox-collection__group .tox-menu-nav__js"),
                            $cmenuItem  = $(".tox-collection__item--active", parent.document);

                            if ( $imenuItem.length ) {
                                $imenuItem.on("click", function() {
                                    console.log("click $imenuItem");
                                    //setTimeout(function() {
                                        //melisLinkTree.checkBtn();
                                        tinyMceAddTreeViewBtn();
                                    //}, 50);
                                });
                            } 
                            /*if ( $cmenuItem.length ) {
                                $cmenuItem.on("click", function() {
                                    console.log("click $cmenuItem");
                                    setTimeout(function() {
                                        console.log("$cmenuItem inside setTimeout");
                                        //melisLinkTree.checkBtn();
                                        tinyMceAddTreeViewBtn();
                                    }, 50);
                                });
                            }*/
                            else if ( $bmenuItem.length ) {
                                $bmenuItem.on("click", function() {
                                    console.log("click $bmenuItem");

                                    //setTimeout(function() {
                                        //melisLinkTree.checkBtn();
                                        tinyMceAddTreeViewBtn();
                                    //}, 50);
                                });
                            }
                    }, 50);
            });

            editor.on("keydown", function(e) {
                console.log("editor keydown");

                var code = e.keyCode || e.which;

                    if ( code === 75 && e.ctrlKey ) {
                        setTimeout(function() {
                            //melisLinkTree.checkBtn();
                            tinyMceAddTreeViewBtn();
                        }, 50);
                    }
            });
    }

    // on editor init check for the insert edit link btn for outside iframe
    function tinyMceOnEditorInitToolbarBtn() {
        console.log("tinyMceOnEditorInitToolbarBtn");
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
                                    //setTimeout(function() {
                                        console.log("tinyMceOnEditorInitToolbarBtn inside setTimeout insert-edit-link btn.");
                                        //if ( $baux.length ) {                                       
                                            //melisLinkTree.checkBtn();
                                            tinyMceAddTreeViewBtn();
                                        //}   
                                    //}, 50);                             
                                });
                                //return false;
                            }
                            return false;
                    });
            });
    }

    // on editor click check for the insert edit link btn for page edition inside iframe container
    function tinyMceOnEditorClickToolbarBtn() {
        console.log("tinyMceOnEditorClickToolbarBtn");
        var $t              = tinymce.dom.DomQuery,

            $itiny          = $t(".tox-tinymce"),

            $iaux           = $t(".tox-tinymce-aux"),

            $itoxToolGroup  = $itiny.find(".tox-toolbar .tox-toolbar__group");

        var transTitle      = translations.tr_meliscore_tinymce_insert_edit_link_dialog_title;

            $itoxToolGroup.each(function(i) {
                var $iBtn = $(this).find("button");
                    $iBtn.each(function(i) {
                        var $attrTitle  = $(this)[i].attributes[1].value;

                            if ( transTitle !== "" && $attrTitle === transTitle ) {
                                $(this).addClass("insert-edit-link");

                                $(this).on("click", function() {
                                    //setTimeout(function() {
                                        console.log("tinyMceOnEditorClickToolbarBtn inside setTimeout insert-edit-link btn.")
                                        //if ( $iaux.length ) {                                       
                                            //melisLinkTree.checkBtn();
                                            tinyMceAddTreeViewBtn();
                                        //}   
                                    //}, 50);                             
                                });
                                //return false;
                            }
                            return false;
                    });
            });
    }

    // adding of tree view button
    function tinyMceAddTreeViewBtn() {

        setTimeout(function() {
            console.log("tinyMceAddTreeViewBtn");
            var $t              = tinymce.dom.DomQuery,
                //$iframe         = $(".melis-iframe"),
                $body           = window.parent.$("body"),
                //$body           = $("body"),

                $iaux           = $t(".tox-tinymce-aux"),
                //$iaux           = $iframe.contents().find(".tox-tinymce-aux"),
                $baux           = $body.find(".tox-tinymce-aux"),

                $idialog        = $iaux.find(".tox-dialog"),
                $bdialog        = $baux.find(".tox-dialog"),

                $iconHStacks    = $idialog.find(".tox-form__controls-h-stack"),
                $bconHStacks    = $bdialog.find(".tox-form__controls-h-stack"),

                $iurlBtn        = $iconHStacks.find("#mce-link-tree"),
                $burlBtn        = $bconHStacks.find("#mce-link-tree");

            var melisTreeBtn    = '<button title="Site tree view" id="mce-link-tree" class="mce-btn mce-open" style="width: 34px; height: 34px;"><i class="icon icon-sitemap fa fa-sitemap" style="font-family: FontAwesome; position: relative; font-size: 16px; display: block; text-align: center;"></i></button>';

                console.log("$iaux length: ", $iaux.length);
                console.log("$baux length: ", $baux.length);

                console.log("$idialog length: ", $idialog.length);
                console.log("$bdialog length: ", $bdialog.length);

                if ( $iaux.length ) {
                    if ( $iurlBtn.length === 0 && $iconHStacks.length > 0 ) {
                        console.log("i series");
                        $iconHStacks.append( melisTreeBtn );    
                    }
                }
                else if ( $baux.length ) {
                    console.log("$baux found");
                    console.log("$burlBtn length: ", $burlBtn.length);
                    console.log("$bconHStacks length: ", $bconHStacks.length);

                    if ( $burlBtn.length === 0 && $bconHStacks.length > 0 ) {
                        console.log("b series");
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

    // tinymce modal pop up
    function modalPopUp() {
        $("body").on("click", ".mce-btn", function(){
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
            else{
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
