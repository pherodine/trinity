<?php $enabled_hero = get_field('enable_hero_image'); ?>
<?php if($enabled_hero): ?>
<?php $img_url = get_field('hero_image'); ?>
<?php $img_size = get_field('hero_image_size'); ?>
<?php $class = ($img_size == 'full') ? 'ratio-auto' : 'ratio ratio-3-1'; ?>
<section id="fdc-hero-image" class="container-fluid no-pad rev-me">
    <div class="<?php echo $class; ?>">
        <div id="fdc-hero-image-bg" class="ratio--child cover prep-me" style="background-image: url('<?php echo $img_url['url']; ?>');">
            <div id="fdc-hero-image-inner" class="container">
				<div>
					<?php $enabled_cta = get_field('enable_hero_cta'); ?>
					<?php if($img_size == 'full' && $enabled_cta): ?>
					<div class="row">
						<?php the_field('hero_statement'); ?>
					</div>
					<?php $enabled_button = get_field('enable_cta_button'); ?>
					<?php if($img_size == 'full' && $enabled_cta && $enabled_button): ?>
					<div class="row">
						<a href="<?php the_field('hero_cta_location'); ?>" class="button"><?php the_field('hero_cta_button_label'); ?></a>
					</div>
					<?php endif; ?>
					<?php endif; ?>
				</div>
            </div>
        </div>
    </div>
	<?php if($img_size == 'full'): ?>
	<div id="scroll-to">↓ Scroll to Continue ↓</div>
	<?php endif; ?>
</section>
<?php else: ?>
<section class="spacer"></section>
<?php endif; ?>