<?php get_template_part('modules/header'); ?>

<?php
    // Setup the customised menu system
	$_settings = array(
        'theme_location' => 'navbar-foot',
        'walker' => new FixrNavWalker(),
        'container' => 'nav',
        'container_class' => 'fd-footer-nav',
        'items_wrap' => '<ul id="fd-header-nav-menu">%3$s</ul>'
    );
?>

<section class="shell__body">
    <p>Unfortunately you have used a URL that does not exists. Maybe one of the following pages will be of some use to you</p>
    <?php wp_nav_menu($_settings); ?>
</section>

<?php get_template_part('modules/footer'); ?>

