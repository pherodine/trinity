(function($) {
    $(document).ready(function() {
        $('.team-photo').slick({
            autoplay: true,
            autoplaySpeed: 5500,
            slidesToShow: 1, 
            slidesToScroll: 1, 
            arrows: false, 
            asNavFor: '.team-data', 
            pauseOnHover: true,
            speed: 382
        });

        $('.team-data').slick({
            slidesToShow: 1, 
            slidesToScroll: 1, 
            asNavFor: '.team-photo',
            dots: false,
            arrows: false, 
            pauseOnHover: true,
            speed: 618
        });
    });        
})(jQuery);