        </div><!-- #fd-page -->
        <footer class="shell__foot">
            <div class="shell__foot__brand">
                <a class="shell__foot__logo" href="<?php echo esc_url(home_url('/')); ?>">
                    <img class="img-resp" src="<?php echo esc_url(get_theme_mod('fd_set_branding_identity')); ?>" />
                </a>
                <p class="shell__foot__tagline fixr-string"><?php echo get_theme_mod('fd_set_branding_tagline'); ?></p>
            </div>

            <div class="shell__foot__copy">
                <p class="shell__foot__copy__cta"><?php echo get_theme_mod('fd_set_footer_cta'); ?></p>
                <p><a href="mailto:<?php echo get_theme_mod('fd_set_footer_cta_email'); ?>" class="shell__foot__link fixr-string"><?php echo get_theme_mod('fd_set_footer_cta_email'); ?></a></p>
            </div>

            <div class="shell__foot__contact">
                <div class="shell__foot__contact__office">
                    <p class="fixr-string">Office</p>
                    <p><a href="#" target="_blank" class="shell__foot__link"><?php echo get_theme_mod('fd_set_company_address'); ?></a></p>
                </div>
                <div class="shell__foot__contact__conversation">
                    <p class="fixr-string">Start a Conversation</p>
                    <p><a href="mailto:<?php echo get_theme_mod('fd_set_company_email'); ?>" class="shell__foot__link fixr-string"><?php echo get_theme_mod('fd_set_company_email'); ?></a></p>
                    <p><a href="tel:<?php echo get_theme_mod('fd_set_company_number'); ?>" class="shell__foot__link fixr-string"><?php echo get_theme_mod('fd_set_company_number'); ?></a></p>
                </div>
                <div class="shell__foot__contact__recent">
                    <p class="fixr-string">Featured Work</p>
                    <p><a href="#" class="shell__foot__link fixr-string">Prentice Butchers</a></p>
                    <p><a href="#" class="shell__foot__link fixr-string">The Minster Partnership</a></p>
                    <p><a href="#" class="shell__foot__link fixr-string">North Star Wealth</a></p>
                </div>
                <div class="shell__foot__contact__social">
                    <p class="fixr-string">Social</p>
                    <?php $url = get_theme_mod('fd_set_social_facebook'); ?>

                    <?php if(!empty($url) && $url != '#'): ?>
                    <p><a href="<?php echo get_theme_mod('fd_set_social_facebook'); ?>" target="_blank" class="shell__foot__link fixr-string">Facebook</a></p>
                    <?php else: ?>
                    <p class="shell__foot__link fixr-string fixr-string--disabled">Facebook</p>
                    <?php endif; ?>

                    <?php $url = get_theme_mod('fd_set_social_twitter'); ?>
                    <?php if(!empty($url) && $url != '#'): ?>
                    <p><a href="<?php echo get_theme_mod('fd_set_social_twitter'); ?>" target="_blank" class="shell__foot__link fixr-string">Twitter</a></p>
                    <?php else: ?>
                    <p class="shell__foot__link fixr-string fixr-string--disabled">Twitter</p>
                    <?php endif; ?>

                    <?php $url = get_theme_mod('fd_set_social_instagram'); ?>
                    <?php if(!empty($url) && $url != '#'): ?>
                    <p><a href="<?php echo get_theme_mod('fd_set_social_instagram'); ?>" target="_blank" class="shell__foot__link fixr-string">Instagram</a></p>
                    <?php else: ?>
                    <p class="shell__foot__link fixr-string fixr-string--disabled">Instagram</p>
                    <?php endif; ?>

                    <?php $url = get_theme_mod('fd_set_social_linkedin'); ?>
                    <?php if(!empty($url) && $url != '#'): ?>
                    <p><a href="<?php echo get_theme_mod('fd_set_social_linkedin'); ?>" target="_blank" class="shell__foot__link fixr-string">LinkedIn</a></p>
                    <?php else: ?>
                    <p class="shell__foot__link fixr-string fixr-string--disabled">LinkedIn</p>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="shell__foot__copyright">
                <div class="shell__foot__legal">
                    <?php $str = (!empty(get_theme_mod('fd_set_footer_copyright'))) ? get_theme_mod('fd_set_footer_copyright') : "© " . date('Y') . " " . get_bloginfo('name') . " - All Rights Reserved"; ?>
                    <p class="shell__foot__legal__com fixr-string"><?php echo $str; ?></p>
                </div>
                <div class="shell__foot__comply">
                    <div class="shell__foot__comply__terms">
                        <a href="#" class="shell__foot__link shell__foot__link--bold fixr-string">Terms of Use</a>
                    </div>
                    <div class="shell__foot__comply__privacy">
                        <a href="#" class="shell__foot__link shell__foot__link--bold fixr-string">Privacy Policy</a>
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