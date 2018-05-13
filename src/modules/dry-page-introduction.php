		<?php $enabled = get_field('enable_page_introduction'); ?>
		<?php $theme = get_field('introduction_theme'); ?>
		<?php 
		if($theme == 'light') {
			$theme_class = " gl-introduction--light";
		} else if($theme == 'mid') {
			$theme_class = " gl-introduction--mid";
		} else {
			$theme_class = " gl-introduction--dark";
		}
		?>
		<?php if($enabled): ?>
		<section class="gl-introduction<?php echo ($theme_class) ? $theme_class : ""; ?>">
			<div class="gl-introduction__inner">
				<h4 class="gl-introduction__heading rev-me"><span class="prep-me"><?php /*the_field('page_introduction_title');*/ the_title(); ?></span></h4>
				<h1 class="gl-introduction__title rev-me"><span class="prep-me"><?php the_field('page_introduction_heading'); ?></span></h1>
				<p class="gl-introduction__copy rev-me"><span class="prep-me"><?php the_field('page_introduction_copy'); ?></span></p>
			</div>
		</section>
		<?php endif; ?>