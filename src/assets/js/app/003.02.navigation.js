(function($) {
  $(document).ready(function() {
    // Menu Proprties
    var menu = $('.main-nav-list');
    var topMenu = $('.main-nav-list__link');
    var parentLi = $('.main-nav-list__item--parent');
    var backBtn = $('.main-nav-list__sub-menu__link--back');

    /* Toggle Main Menu */
    $('.hamburger').on('click', function() {
        $(this).hasClass('is-active') ?
        ($(this).removeClass('is-active'), $('.main-nav').removeClass('main-nav--open')) :
        ($(this).addClass('is-active'), $('.main-nav').addClass('main-nav--open'));
    });

    // Prevent the parent item from loading the target page show sub menu instead
    $('.main-nav-list__item--parent').each(function() {
        var t = $(this);
        t.find('a').eq(0).attr('href', '#');
    });

    // Open Sub Menu
    topMenu.on("click", function(e) {
      var thisTopMenu = $(this).parent();
      if(thisTopMenu.hasClass('main-nav-list__item--parent')) {
        e.preventDefault();
        parentLi.removeClass('main-nav-list__item--open');
        thisTopMenu.addClass('main-nav-list__item--open');
      }
    });

    // Close Sub Menu
    backBtn.click(function(e){
      e.preventDefault();
      var thisBackBtn = $(this);
      parentLi.removeClass('main-nav-list__item--open');
    });
  });
})(jQuery);