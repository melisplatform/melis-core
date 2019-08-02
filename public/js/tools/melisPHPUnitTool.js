$(function() {
    var body = $("body");
    var runIcon     = '<i class="fa fa-play"></i> Run';
    var spinnerIcon = '<i class="fa fa-spinner fa-pulse fa-fw"></i> Testing...';
    var hide        = '<i class="fa fa-minus"></i> Hide';
    var state       = 0;
    var module = null;
    var runAllMode = false;
    var totalExec = 0;
    var totalAvailableTest = 0;
    var execPerMod = 4;
    var execChecker = null;
    var hideVal = translations.tr_melis_module_diagnostics_tool_header_hide_all;


    $("body").on("click", "#btnDiagPhpunitRunAll", function() {
        totalExec = 0;
        totalAvailableTest = parseInt($(".btn-run-pu-module-test").size()) * execPerMod
        runAllMode = true;


        if($("#btnDiagPhpunitRunAll").html() == hideVal) {

            changeContent("#btnDiagPhpunitRunAll", translations.tr_melis_module_diagnostics_tool_header_run_al);
            resetStartButton("");
        }

        if(runAllMode && $("#btnDiagPhpunitRunAll").html() != hideVal) {
            $(".btn-run-pu-module-test").trigger("click");
            changeContent("#btnDiagPhpunitRunAll", translations.tr_melis_module_diagnostics_tool_header_run_al);
            runAllMode = false;

        }

    });

    function changeContent(target, content) {
        setTimeout(function() {

            $(target).html(content);

        }, 500);
    }
    function resetStartButton(m) {
        var btn = ".btn-run-pu-module-test";
        if(m != "") {
            btn = ".btn-run-pu-module-test[data-modules='"+m+"']";
        }
        changeContent(btn, translations.tr_melis_module_diagnostics_collapse);
        $(btn).removeClass("btn-danger");
        $(btn).addClass("btn-info");
        setTimeout(function() {
            $(".btn-run-pu-module-test").removeAttr("disabled");
        }, 1000);

    }

    $(document).on("click", ".btn-run-pu-module-test", function() {
        var module = $(this).data().modules;
        var dom = 'button[data-modules="'+module+'"]';
        var content = $(dom + " span#icon"+module).html();
        switch(content) {
            case runIcon:
                buttonStatus(dom, "danger");
                buttonIconStateEvent(dom + " span#icon"+module, "collapse");
                melisCoreTool.pending(dom);
                $(this).attr("data-state", "1");
                state  = $(this).data().state;
                startTest(module, dom);
            break;
            case hide:
                $("#collapsePU"+ module).collapse('hide');
                buttonStatus(dom, "hideandrun");
                buttonIconStateEvent(dom + " span#icon"+module, "def");
                $(this).attr("data-state", "0");
                state  = $(this).data().state;
            break;
        }
    });

    // @private
    function startTest(module, dom) {
        $("div#wellPU"+module).html("");
        $.ajax({
            url: '/melis/MelisCore/MelisPhpUnitTool/runTest?v=' + new Date().getTime(),
            dataType: 'json',
            data: {module : module},
            type: 'POST',
            cache: false,
            success: function(data) {
                $("div#wellPU"+module).html(data.response);
                buttonStatus(dom, "hide");
                buttonIconStateEvent(dom + " span#icon"+module, "hide");
                $("#collapsePU"+ module).collapse('toggle');
                setTimeout(function() {
                    melisCoreTool.done(dom);
                }, 1000);
            },
            error: function() {
                alert(translations.tr_meliscore_error_message);
            }
        });
    }

    // @private
    function buttonStatus(dom, status) {
        var from = "success";
        var to   = "danger";
        if(status == "success") {
            from = "danger";
            to   = "success";
            melisCoreTool.pending(dom);
        }
        else if(status == "hide") {
            from = "danger";
            to   = "info";
            melisCoreTool.done(dom);
        }
        else if(status == "hideandrun") {
            from = "info";
            to   = "success";
        }
        else {
            melisCoreTool.done(dom);
        }
        $(dom).removeClass("btn-"+from).addClass("btn-"+to);
    }

    // @private
    function buttonIconStateEvent(dom, status) {
        switch(status) {
            case "collapse":
                $(dom).html(spinnerIcon);
            break;
            case "def":
                $(dom).html(runIcon);
            break;
            case "hide":
                $(dom).html(hide);
            break;
        }
    }
});

