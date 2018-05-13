<?php
// Register and assign menus to the CMS
register_nav_menu('navbar-top', __('Main menu', 'Fixr'));
register_nav_menu('navbar-foot', __('Footer menu', 'Fixr'));
register_nav_menu('navbar-legal', __('Legal menu', 'Fixr'));

/**
 * bem_menu returns an instance of the walker_texas_ranger class with the following arguments
 * @param  string $location This must be the same as what is set in wp-admin/settings/menus for menu location.
 * @param  string $css_class_prefix This string will prefix all of the menu's classes, BEM syntax friendly
 * @param  arr/string $css_class_modifiers Provide either a string or array of values to apply extra classes to the <ul> but not the <li's>
 * @return [type]
 */

function fixr_menu($location = "main_menu", $css_class_prefix = 'main-menu', $css_class_modifiers = null, $user_classes = null){  
    
    // Check to see if any css modifiers were supplied
    if($css_class_modifiers){

        if(is_array($css_class_modifiers)){
            $modifiers = implode(" ", $css_class_modifiers);
        } elseif (is_string($css_class_modifiers)) {
            $modifiers = $css_class_modifiers;
        }

    } else {
        $modifiers = '';
    }

    $args = array(
        'theme_location'    => $location,
        'container'         => false,
        'items_wrap'        => '<ul class="' . $css_class_prefix . ' ' . $modifiers . '">%3$s</ul>',
        'walker'            => new fixr_bem_menu($css_class_prefix, true)
    );
    
    if (has_nav_menu($location)){
        return wp_nav_menu($args);
    }else{
        echo "<p>You need to first define a menu in WP-admin<p>";
    }
}
?>