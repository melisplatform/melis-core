/**
 * Use
 */

// Add config Theme
//MelisTinymce.addTheme(
//    {
//        toto: {
//            inline: true,
//            plugins: [
//                "link code"
//            ],
//            menu: {
//                edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'}
//            },
//            menubar: "edit tools",
//            toolbar: "undo redo link unlink code",
//            statusbar: true,
//            forced_root_block: "",
//            force_p_newlines: false
//        }
//    }
//);
//
// Init bforeSend function
//
//MelisTinymce.blur.beforeSend(function(e, editor){
//    console.log(e);
//    e.target.bodyElement.dataset['test'] = 'test test 2';
//});
//
// Init Success function
//
//MelisTinymce.blur.success(function(e, editor, response){
//    console.log(e);
//    console.log(response);
//    console.log('test ok');
//});
//
// Init MelisTinymce
//
//MelisTinymce.init({
//    save: 'http://melis2.melistechnology.fr/back/api2.php',
//    templates: 'http://melis2.melistechnology.fr/back/xhr/tinymceTemplates.php'
//});



var MelisTinymce = (function (window) {

    var config = {

        temp: '',


        blur: {
            beforeSend: function () {
                return true;
            },
            success: function () {
                return true;
            }
        },

        xhr: {
            save: 'http://melis2.melistechnology.fr/html/back/api.php',
            templates: 'http://melis2.melistechnology.fr/html/back/xhr/tinymceTemplates.php'
        },

        theme: {
            textarea: {
                inline: true,
                plugins: [
                    "link code"
                ],
                menu: {
                    edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'}
                },
                menubar: "edit tools",
                toolbar: "undo redo link unlink code",
                statusbar: true,
                forced_root_block: "",
                force_p_newlines: false
            },
            html: {
                inline: true,
                plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table contextmenu paste"
                ],
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
                menu: {
                    edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
                    insert: {title: 'Insert', items: 'link media | template hr'},
                    view: {title: 'View', items: 'visualaid'},
                    format: {
                        title: 'Format',
                        items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'
                    },
                    table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
                    tools: {title: 'Tools', items: 'code'}
                },
                menubar: "edit insert view format table tools",
                statusbar: true,
                forced_root_block: "",
                force_p_newlines: false
            },
            media: {
                inline: true,
                plugins: [
                    "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
                    "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime nonbreaking",
                    "save table contextmenu directionality emoticons template paste textcolor code moxiemanager paste"
                ],
                menu: {
                    edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
                    insert: {title: 'Insert', items: 'link media'},
                    view: {title: 'View', items: 'visualaid'}
                },
                menubar: "edit insert view",
                toolbar: "insertfile undo redo link image media | code",
                statusbar: true,
                forced_root_block: "",
                force_p_newlines: false
            }
        }
    };

    var buildEditor = function (xhrTemplates) {

        $.each(MelisTinymce.config.theme, function (index, value) {

            var editor_config = value;

            editor_config['templates'] = xhrTemplates;

            editor_config['selector'] = ".editable[data-melis_tag='" + index + "']";

            editor_config['setup'] = function (editor) {

                editor.on('focus', function (e) {
                    MelisTinymce.config.temp = editor.getContent();
                });

                editor.on('blur', function (e) {

                    if (editor.getContent() != MelisTinymce.config.temp) {

                        MelisTinymce.config.blur.beforeSend(e, editor);

                        if (e.target.id) e.target.bodyElement.dataset['id'] = e.target.id;
                        e.target.bodyElement.dataset['content'] = editor.getContent();

                        var request = $.ajax({
                            method: "POST",
                            url: MelisTinymce.config.xhr.save,
                            data: e.target.bodyElement.dataset
                        });

                        request.done(function (response) {
                            MelisTinymce.config.blur.success(e, editor, response);
                            console.log("MelisTinymce onBlur : Ok");
                            //console.log(response);
                        });

                        request.fail(function (jqXHR, textStatus) {
                            console.log("MelisTinymce error after onBlur : " + textStatus);
                        });

                    }

                });

            };

            tinymce.init(editor_config);

        });

    };

    return {
        config: config,
        init: function (options) {

            $.extend(config.xhr, options);


            var request = $.ajax({
                method: "POST",
                url: config.xhr.templates
            });

            request.done(function (xhrTemplates) {
                buildEditor(xhrTemplates);
            });

            request.fail(function (jqXHR, textStatus) {
                console.error("MelisTinymce error in load templates : " + textStatus);
            });


        },
        addTheme: function (themes) {
            $.each(themes, function (index, value) {
                MelisTinymce.config.theme[index] = value;
            })
        },

        blur:{
            beforeSend: function (callback) {
                config.blur.beforeSend = callback;
            },

            success: function (callback) {
                config.blur.success = callback;
            }
        },

        save: function () {
            return true;
        }
    }

})(window);
