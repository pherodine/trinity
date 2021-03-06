<?php
define('CSS', '/assets/css/');
define('JS', '/assets/js/');
define('VENDOR', '/assets/js/vendor/');

function theme_uri($_string) {
	return (get_template_directory_uri() . $_string);
}

function page_contains($_string) {
	$contains = strpos($_SERVER['REQUEST_URI'], $_string);

	return ($contains) ? true : false;
}

function debug($_string = "Insert Debug String") {
	echo '<script language="javascript">';
	echo 'alert("' . $_string . '")';
	echo '</script>';
}

function get_critical($_uri) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $_uri);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$output = curl_exec($ch);
	curl_close($ch);

	return $output;
}

/* Load site dependencies correctly */
function fixr_enqueue() {
    // Reload jQuery into the footer of the site
    wp_deregister_script('jquery');
    wp_register_script('jquery', "http" . ($_SERVER['SERVER_PORT'] == 443 ? "s" : "") . "://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js", false, null);
	wp_enqueue_script('jquery');
	
	// Register Conditional Scripts
	wp_register_script('html5shiv', theme_uri(JS . 'html5shiv.js'), NULL, __NAMESPACE__, false);
    wp_register_script('respond', theme_uri(JS . 'respond.js'), NULL, __NAMESPACE__, false);
	wp_enqueue_script('html5shiv');
	wp_enqueue_script('respond');
	wp_script_add_data('html5shiv', 'conditional', 'lt IE 9');
	wp_script_add_data('respond', 'conditional', 'lt IE 9');
		
	// Register theme dependencies

	/* if(is_page('Welcome')):
        $critical = get_critical("https://minster.fixrdigital.co.uk/wp-content/themes/fixr-tmpllp/assets/critical/critical-home.css");
	elseif(is_page('Company')): 
		$critical = get_critical("https://minster.fixrdigital.co.uk/wp-content/themes/fixr-tmpllp/assets/critical/critical-company.css");
	endif;

	wp_register_style('critical', false);
	wp_enqueue_style('critical');
	wp_add_inline_style('critical', $critical); */

	wp_register_style('mobile-first', theme_uri(CSS . 'app.min.css'), null, null, "screen");
	wp_enqueue_style('mobile-first');
	
	wp_register_script('app', theme_uri(JS . 'bundle.min.js'), NULL, null, true);
	wp_enqueue_script('app');
}
add_action('wp_enqueue_scripts', 'fixr_enqueue', 100);
?>