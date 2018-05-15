(function($){
    $(document).ready(function() {
        // Waypoints Implementation
        var $reveals = $('.gl-introduction').find('.rev-me');
        var $offset = '95%';

        $reveals.each(function(index, el) {
            var $t = $(el);

            $t.waypoint(function() {
                switch(index) {
                    case 0: 
                        $class = 'rev--d25'; 
                        break;
                    case 1: 
                        $class = 'rev--d38'; 
                        break;
                    case 2: 
                        $class = 'rev--d50'; 
                        break;
                    default: 
                        $class = 'rev--d25';
                }

                $($t).addClass('rev').addClass('rev--btt').addClass($class);
                $($t).find('.prep-me').addClass('prep-rev').removeClass('prep-me');
            }, {offset: $offset});
        });
        
        $reveals = $('.f-grid').find('.rev-me');
        $reveals.each(function(index, el){
            var $t = $(el);

            $t.waypoint(function() {
                $class = (index % 2) ? 'rev--d50' : 'rev--d25';
                $($t).addClass('rev').addClass('rev--ltr').addClass($class);
                $($t).find('.prep-me').addClass('prep-rev').removeClass('prep-me');
            }, {offset: $offset });
        });

        $reveals = $('#fdc-hero-image.rev-me');
        $reveals.each(function(index, el) {
            var $t = $(el);
            $t.waypoint(function() {
                $($t).addClass('rev').addClass('rev--ttb');
                $($t).find('.prep-me').addClass('prep-rev--hero').removeClass('prep-me');
            }, { offset: $offset });
        });
    });
})(jQuery);