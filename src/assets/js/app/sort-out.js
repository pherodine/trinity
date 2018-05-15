/* Application Code */
(function ($) {	
	$(document).ready(function () {        
        //scroller('.gallery-scroll', '#section-scroll-to', _offset, 'slow');
        if(isMobile()) {
            $("#scroll-to").on("click", function() {
                var b = $("#fdc-hero-image").outerHeight();
                $("html,body").animate({scrollTop: b}, 400);
            });
        } else {
            $("#scroll-to").on("click", function() {
                var b = $("#fdc-hero-image").outerHeight();
                $("html,body").animate({scrollTop: b}, 400);
            });
        } 
    });
})(jQuery);