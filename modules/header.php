<?php
    /**
     * The main template file
     *
     * This is the template that displays all of the <head> section and everything up until <div id="content">
     *
     * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
     *
     * @package fixr
     */

    // check advanced custom fields is installed
	$has_acf = (class_exists('acf')) ? true : false;

    // Use custom page if it has been set
    $checked = ($has_acf) ? get_field('custom_page_title') : null;
	$page_title = "";
	
	if($checked && !empty($checked)) {
		$page_title = get_field('custom_page_title');
	} else {
		$page_title = wp_title('-', false, 'right');
	}    
?>
<?php define('WPLANG', 'en-GB'); ?>
<html <?php language_attributes(); ?>>
<head>
    <title><?php echo $page_title; ?></title>
    <meta charset="<?php bloginfo( 'charset' ); ?>" />
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="author" content="https://fixrdigital.co.uk">

    <link rel="profile" href="http://gmpg.org/xfn/11" />
    <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
    <?php wp_head(); ?>
</head>
    
<body <?php body_class(); ?>>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MC9X6BX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <div class="shell shell--max">
        <header class="shell__header">
            <a class="shell__header-brand" href="#">FIXR Digital</a>
            <a class="shell__header-toggle" href="#">Menu</a>
            <nav class="shell__header-nav shell__header-nav--hide">
                <ul class="shell__header-nav__list">
                    <li class="shell__header-nav__list-item">
                        <a class="shell__header-nav-list-item-link" href="#">Home</a>
                    </li>
                    <li class="shell__nav-item">
                        <a class="shell__nav-link" href="#">Welcome</a>
                    </li>
                    <li class="shell__nav-item">
                        <a class="shell__nav-link" href="#">Services</a>
                    </li>
                    <li class="shell__nav-item">
                        <a class="shell__nav-link" href="#">Contact</a>
                    </li>
                </ul>
            </nav>
        </header>

        <main class="shell__body">