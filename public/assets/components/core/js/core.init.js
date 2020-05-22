/* Remove Envato Frame */
if (window.location != window.parent.location)
    top.location.href = document.location.href;

(function($, window)
{


    window.onunload = function(){};

    $.expr[':'].scrollable = function( elem ) 
    {
      var scrollable = false,
          props = [ '', '-x', '-y' ],
          re = /^(?:auto|scroll)$/i,
          elem = $(elem);
      
      $.each( props, function(i,v){
        return !( scrollable = scrollable || re.test( elem.css( 'overflow' + v ) ) );
      });
     
       return scrollable;
    };

    if (!Modernizr.touch && $('[href="#template-options"][data-auto-open]').length)
        $('#template-options').collapse('show');

    window.beautify = function (source)
    {
        var output,
            opts = {};

        opts.preserve_newlines = false;
        output = html_beautify(source, opts);
        return output;
    }

    // generate a random number within a range (PHP's mt_rand JavaScript implementation)
    window.mt_rand = function (min, max) 
    {
        var argc = arguments.length;
        if (argc === 0) {
            min = 0;
            max = 2147483647;
        }
        else if (argc === 1) {
            throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given');
        }
        else {
            min = parseInt(min, 10);
            max = parseInt(max, 10);
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // scroll to element animation
    function scrollTo(id)
    {
        if ($(id).length)
            $('html,body').animate({scrollTop: $(id).offset().top},'slow');
    }

    window.resizeNiceScroll = function()
    {
        setTimeout(function(){
            $('.hasNiceScroll, #menu_kis, #menu').getNiceScroll().show().resize();
        }, 100);
    }
    
    // $('#content .modal').appendTo('body');
    
    // tooltips
    $('body').tooltip({ 
        selector: '[data-toggle="tooltip"]',
        delay: {
            show: 500,
            hide: 0
        }
    });
    
    // popovers
    $('[data-toggle="popover"]').popover();
    
    // print
    $('[data-toggle="print"]').click(function(e)
    {
        e.preventDefault();
        window.print();
    });
    
    // carousels
    $('.carousel').carousel();
    
    // Google Code Prettify
    if ($('.prettyprint').length && typeof prettyPrint != 'undefined')
        prettyPrint();
    
    // show/hide toggle buttons
    $('[data-toggle="hide"]').click(function()
    {
        if ($(this).is('.bootboxTarget'))
            bootbox.alert($($(this).attr('data-target')).html());
        else {
            $($(this).attr('data-target')).toggleClass('hide');
            if ($(this).is('.scrollTarget') && !$($(this).attr('data-target')).is('.hide'))
                scrollTo($(this).attr('data-target'));
        }
    });

    /* added div.collapse below */
/*    $('body ul.collapse, body div.collapse')
   .on('show.bs.collapse', function(e)
   {
       e.stopPropagation();
       $(this).closest('li').addClass('active');
   })
   .on('hidden.bs.collapse', function(e)
   {
       e.stopPropagation();
       $(this).closest('li').removeClass('active');
   }); */
    

    $('[data-toggle="navbar-color"]').on('click', function(e){
        e.preventDefault();
        
        if ($(this).is('.active'))
            return;

        $('.navbar.main').toggleClass('navbar-inverse');

        $(this).parent().find('[data-toggle="navbar-color"].active').removeClass('active');
        $(this).addClass('active');
    });

    window.enableContentNiceScroll = function(hide)
    {
        if ($('html').is('.ie') || Modernizr.touch)
            return;

        if (typeof $.fn.niceScroll == 'undefined')
            return;

        if (typeof hide == 'undefined')
            var hide = true;

        $('#content .col-app, .col-separator')
        .filter(':scrollable')
        .not('.col-unscrollable')
        .filter(function(){
            return !$(this).find('> .col-table').length;
        })
        .addClass('hasNiceScroll')
        .each(function()
        {
            $(this).niceScroll({
                horizrailenabled: false,
                zindex: 2,
                cursorborder: "none",
                cursorborderradius: "0",
                cursorcolor: primaryColor
            });

            if (hide == true)
                $(this).getNiceScroll().hide();
            else
                $(this).getNiceScroll().resize().show();
        });
    }

    window.disableContentNiceScroll = function()
    {
        $('#content .hasNiceScroll').getNiceScroll().remove();
    }

    enableContentNiceScroll();

    if ($('html').is('.ie'))
        $('html').removeClass('app');

/*    if ($('.sidebar > .sidebarMenuWrapper').length && typeof $.fn.niceScroll !== 'undefined')
   {
       $('.sidebar > .sidebarMenuWrapper')
       .addClass('hasNiceScroll')
       .niceScroll({
           horizrailenabled: false, 
           zindex: 2,
           cursorborder: "none",
           cursorborderradius: "0",
           cursorcolor: primaryColor
       }).hide();
   }
    
    
   $('body')
   .on('mouseenter', '[data-toggle="dropdown"].dropdown-hover', function()
   { 
       if (!$(this).parent('.dropdown').is('.open'))
           $(this).click();
   });

   $('.navbar.main')
   .add('#menu-top')
   .on('mouseleave', function(){
       $(this).find('.dropdown.open').find('> [data-toggle="dropdown"]').click();
   }); */

    $('[data-height]').each(function(){
        $(this).height($(this).data('height'));
    });

    $('.app [data-toggle="tab"]')
    .on('shown.bs.tab', function(e)
    {
        $('.hasNiceScroll').getNiceScroll().resize();
    });

    window.enableNavbarMenusHover = function(){
        $('.navbar.main [data-toggle="dropdown"]')
        .add('#menu-top [data-toggle="dropdown"]')
        .addClass('dropdown-hover');
    }

    window.disableNavbarMenusHover = function(){
        $('.navbar.main [data-toggle="dropdown"]')
        .add('#menu-top [data-toggle="dropdown"]')
        .removeClass('dropdown-hover');
    }

    window.enableResponsiveNavbarSubmenus = function(){
        $('.navbar .dropdown-submenu > a').on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            $(this).parent().toggleClass('open');
        });
    }

    window.disableResponsiveNavbarSubmenus = function(){
        $('.navbar .dropdown-submenu > a')
        .off('click')
        .parent()
        .removeClass('open');
    }

    if (typeof $.fn.setBreakpoints !== 'undefined')
    {
        $(window).setBreakpoints({
            distinct: false,
            breakpoints: [
                768,
                992
            ]
        });

        $(window).bind('exitBreakpoint768',function() {     
            $('.container-fluid').addClass('menu-hidden');
            disableNavbarMenusHover();
            enableResponsiveNavbarSubmenus();
        });

        $(window).bind('enterBreakpoint768',function() {
            $('.container-fluid').removeClass('menu-hidden');
            enableNavbarMenusHover();
            disableResponsiveNavbarSubmenus();
        });

        $(window).bind('exitBreakpoint992',function() {     
            disableContentNiceScroll();
        });

        $(window).bind('enterBreakpoint992',function() {
            enableContentNiceScroll(false);
        });
    }
    
    $(window).on('load', function()
    {
        if ($(window).width() < 992) 
            $('.hasNiceScroll').getNiceScroll().stop();

        if ($(window).width() < 768)
            enableResponsiveNavbarSubmenus();
        else
            enableNavbarMenusHover();

        if (typeof animations == 'undefined' && typeof $.fn.niceScroll !== 'undefined')
            $('.hasNiceScroll, #menu_kis, #menu').getNiceScroll().show().resize();

        if (typeof Holder != 'undefined')
        {
            Holder.add_theme("dark", {background:"#424242", foreground:"#aaa", size:9}).run();
            Holder.add_theme("white", {background:"#fff", foreground:"#c9c9c9", size:9}).run();
        }
    });
    
    
    
    //  --------------------------=[ CUSTOMIZED SCRIPTS FOR MELIS ]=--------------------------------------------------
    
    // for the sidebar open/close menu
    $('body').on('click', 'ul.sideMenu li a[data-toggle="collapse"]', function(){
        $(this).parent("li").toggleClass('active-menu');
    });
    
   // initialize nicescroll plugin in sidebar after zoneReload
   /* window.enableSidebarScroll = function(){
   	$("body .sidebar > .sidebarMenuWrapper.hasNiceScroll").niceScroll({
   		horizrailenabled: true, 
   		zindex: 2,
   		cursorborder: "none",
   		cursorborderradius: "0",
   		cursorcolor: primaryColor
   	});
   }
   enableSidebarScroll(); */
})(jQuery, window);