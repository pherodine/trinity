<?php get_template_part('modules/dry-header'); ?>
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
        <section id="section-404">
            <div class="container">
                <div class="row">
                    <div class="introduction block"></div>
                    <div class="recent col-xs-12">
                        <div class="ratio-16-9">
                            <div class="ratio--child cover" style="background-image: url('<?php bloginfo('template_url')?>/assets/images/404.jpg')"></div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="section-title">
                        <h2 class="block">Page Not Found</h2>
                    </div>
                    <p>Unfortunately you have used a URL that does not exists. Maybe one of the following pages will be of some use to you</p>
                </div>
                <div class="row">
                    <?php wp_nav_menu($_settings); ?>
                </div>
            </div>
        </section>
<?php get_template_part('modules/dry-fixr-footer'); ?>