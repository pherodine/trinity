	<?php
        function rgb( $colour ) {
            if ( $colour[0] == '#' ) {
                    $colour = substr( $colour, 1 );
            }
            if ( strlen( $colour ) == 6 ) {
                    list( $r, $g, $b ) = array( $colour[0] . $colour[1], $colour[2] . $colour[3], $colour[4] . $colour[5] );
            } elseif ( strlen( $colour ) == 3 ) {
                    list( $r, $g, $b ) = array( $colour[0] . $colour[0], $colour[1] . $colour[1], $colour[2] . $colour[2] );
            } else {
                    return false;
            }
            $r = hexdec( $r );
            $g = hexdec( $g );
            $b = hexdec( $b );
            return array($r, $g, $b);
        }

        $enabled = get_field('enable_call_to_action');
        if($enabled){
            $posts = get_field('cta_relationship');
            if($posts) {
                foreach($posts as $post) {
                    setup_postdata($post);
                    $image = get_field('cta_background');
                    $rgb = rgb(get_field('cta_overlay_color'));
    ?>
				<section id="section-cta" class="cover" style="background-image: url('<?php echo $image['url']; ?>'); background-position: center bottom;">
					<div class="block overlay" style="background-color: rgba(<?php echo $rgb[0]; ?>, <?php echo $rgb[1]; ?>, <?php echo $rgb[2]; ?>, 0.7);">
						<div class="data">
							<div class="container">
								<h3><?php the_field('cta_statement'); ?></h3>
								<a class="buttons" href="<?php the_field('cta_location'); ?>"><?php the_field('cta_button_label'); ?></a>
							</div>
						</div>
					</div>
				</section>
		<?php
						wp_reset_postdata();
					}
				}
			} 
		?>
		</div><!-- /#fd-page -->
		<footer class="container-fluid">
			<div id="fd-footer" class="container">
				<!-- TODO: call-to-action -->
				<div id="fd-footer-top" class="row">
					<div id="fd-key-info" class="col-md-8">
						<ul>
							<li><a href="tel:01803293238">T: 01803 293 238</a></li>
							<li><a href="mailto:info@prenticebutchers.co.uk">E: info@prenticebutchers.co.uk</a></li>
						</ul>
					</div>
					<div id="fd-connect" class="col-md-4">
						<ul>
							<li><a href="#">fb</a></li>
							<li><a href="#">Tw</a></li>
							<li><a href="#">Li</a></li>
							<li><a href="#">G+</a></li>
						</ul>
					</div>
				</div>
				<div id="fd-footer-bottom" class="row">
					<div id="fd-legal" class="col-md-6"><small>&copy; <?php echo date('Y') . ' ' . get_bloginfo('name'); ?></small></div>
					<div id="fd-important" class="col-md-6">
						<small>
						<ul>
							<li><a href="#">Terms &amp; Conditions</a></li>
							<li><a href="#">Privacy Policy</a></li>
							<li><a href="#">Returns</a></li>
							<li><a href="#">Vacancies</a></li>
						</ul>
						</small>
					</div>
				</div>
			</div>
		</footer>
		<?php wp_footer(); ?>
		<noscript id="deferred-styles">
			<link rel="stylesheet" type="text/css" href="#" media="screen" />
		</noscript>
		<script>
			var loadDeferredStyles = function() {
				var addStylesNode = document.getElementById("deferred-styles");
				var replacement = document.createElement("div");
		
				replacement.innerHTML = addStylesNode.textContent;
				document.body.appendChild(replacement)
				addStylesNode.parentElement.removeChild(addStylesNode);
			};
			var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
			if (raf) raf(function() { window.setTimeout(loadDeferredStyles, 0); });
			else window.addEventListener('load', loadDeferredStyles);
		</script>
		<!--
		<script type="text/javascript" src="http://www.googleadservices.com/pagead/conversion_async.js" charset="utf-8"></script>
		<noscript><div style="display:inline;"><img height="1" width="1" style="border-style:none;" alt="" src="//www.googleadservices.com/pagead/conversion/960583903/?label=ahZuCNuKrlkQ37GFygM&amp;guid=ON&amp;script=0"/></div></noscript>
		-->
	</body>
</html>