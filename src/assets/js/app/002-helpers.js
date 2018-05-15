///////////////////////////////////////////////////////////////////////////////
// Responsive Functions
///////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////
// Automatic Scroll Functions
///////////////////////////////////////////////////////////////////////////////
function scrollToTarget(parent, target, offset, speed) {
    $(parent).click(function () {
        $('html, body').animate({
            scrollTop: $(target).offset().top - offset
        }, speed);
    });
}