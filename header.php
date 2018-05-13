<?php
	// Use a custom page title if available
	$checked = get_field('custom_page_title');
	$page_title = "";

	if($checked && (!empty($checked)))
		$page_title = $checked;
	else
		$page_title = wp_title('•', false, 'right');

	// Setup the customised menu system
	$_settings = array(
		'theme_location' 	=> 'navbar-top',
		'container'			=> 'nav',
		'menu_id'			=> 'fd-mobile-menu-inner',
		'depth' 			=> 2,
		'fallback_cb' 		=> 'wp_bootstrap_navwalker::fallback',
		'walker'			=> new wp_bootstrap_navwalker()
	);
?>
<!DOCTYPE html>
<html class="no-js" lang="en-GB">
	<head>
		<title><?php echo $page_title; ?></title>
		<!-- Required Meta Data -->
		<meta charset="utf-8">
		<meta http-equiv="x-ua-compatible" content="ie=edge">
    	<meta name="viewport" content="width=device-width, initial-scale=1">
    	<meta name="author" content="http://fixrdigital.co.uk">
		<meta name="google-site-verification" content="OlmNiZKi-N0wSpOVALisO9yKWjXLDOdPXyBQX5NHMxM" />
		<?php wp_head(); ?>
        <!-- Tracking Code -->
		<!--
        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-59408468-1', 'auto');
            ga('send', 'pageview');
        </script>
		-->
	</head>
	<?php
		$home_url = esc_url(home_url('/'));
		$logo_url = ""; // replace this with customizer mod;
	?>
	<body <?php body_class(); ?>>
		<section id="fd-header">
			<header class="container-fluid">
				<div class="row">
					<div id="fd-navbar" class="col-xs-12 col-md-3">
						<a id="fd-identity" href="<?php echo esc_url(home_url('/')); ?>"></a>
						<div id="fd-header-nav-button">
							<div id="fd-nav-icon">
								<span></span>
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
						<div id="fd-mobile-menu" class="col-xs-12 col-md-9"><?php wp_nav_menu($_settings); ?></div>
					</div>
				</div>
			</header>
		</section>
		<div id="fd-page">