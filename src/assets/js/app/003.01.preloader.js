(function($) {
    $(window).load(function() {
        
		var width = 100,
			perfData = window.performance.timing,
			estimatedTime = -(perfData.loadEventEnd - perfData.navigationStart),
			time = parseInt((estimatedTime / 1000) % 60) * 100,
            start = 0,
            progress = 0,
            interval = setInterval(function() {
                progress += 100;
                n = (progress / time) * 100;
                $('.load-percentage').text(Math.round(n) + "%");
                
                if(n >= 100) {
                    clearInterval(interval);
                }
            }, 100);
		
		$('#fd-load-bar').animate({
			width: width + "%"
		}, time, function() {
            $('#fd-page-loader').fadeOut(382, function(){
				$('#fd-page').fadeIn(618);
            });
        });
       
	});
})(jQuery);