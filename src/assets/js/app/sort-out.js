/* Application Code */
function randomSpeed(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
var media_size = {
    _desktop: "(min-width: 1200px)",
    _laptop: "(min-width:992px) and (max-width: 1199px)",
    _tablet: "(min-width:768px) and (max-width: 991px)",
    _mobile: "(max-width:767px)"
}

function isMobile() {
    if (window.matchMedia(media_size._mobile).matches)
        return true;
    return false;
}

function isTablet() {
    if (window.matchMedia(media_size._tablet).matches)
        return true;
    return false;
}

function isLaptop() {
    if (window.matchMedia(media_size._laptop).matches)
        return true;
    return false;
}

function isDesktop() {
    if (window.matchMedia(media_size._desktop).matches)
        return true;
    return false;
}

function testMediaSize() {
    if (isMobile())
        console.log("Mobile View");
    else if (isTablet())
        console.log("Tablet View");
    else if (isLaptop())
        console.log("Laptop View");
    else if (isDesktop())
        console.log("Desktop View");
}

(function ($) {
	
    var _offset = 65;
    var _speedMin = 1670;
    var _speedMax = 4000;
    var _iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
	
	$(document).ready(function () {        
        /* Scroller function to auto scroll from gallery to content */
        function scroller(parent, target, offset, speed) {
            $(parent).click(function () {
                $('html, body').animate({
                    scrollTop: $(target).offset().top - offset
                }, speed);
            });
        }
        
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
	
    $(window).load(function () {
        if (_iOS) {
            function iOSVHFix() {
                $("#fd-carousel .item").height(($(window).height()));
                $("#section-page-map #map-canvas").height(($(window).height()));
            }
            iOSVHFix();
            $(window).bind('resize', iOSVHFix);
        }
        $("#fd-carousel #fd-gallery-load").fadeOut('fast', function () {
            $("#fd-carousel .item .container").delay(510).fadeIn(990);
        });
    });
})(jQuery);