<?php
/****************************************************************
Minimal Fixr Digital Framework Setup
****************************************************************/
function fixr_setup() {
    add_editor_style('assets/css/editor-style.css');
    add_theme_support('post_thumbnails');
    update_option('thumbnail_size_w', 240);
    update_option('medium_size_w', 480);
    update_option('large_size_w', 960);
}
add_action('init', 'fixr_setup');

/****************************************************************
Detect Clients Browser
****************************************************************/
function fixr_browser_body_class( $classes ) {
	global $is_lynx, $is_gecko, $is_IE, $is_opera, $is_NS4, $is_safari, $is_chrome, $is_iphone;
	
	if($is_lynx) $classes[] = 'lynx';
	elseif($is_gecko) $classes[] = 'gecko';
	elseif($is_opera) $classes[] = 'opera';
	elseif($is_NS4) $classes[] = 'ns4';
	elseif($is_safari) $classes[] = 'safari';
	elseif($is_chrome) $classes[] = 'chrome';
	elseif($is_IE) {
		$browser = $_SERVER['HTTP_USER_AGENT'];
		$browser = substr( "$browser", 25, 8);
		if ($browser == "MSIE 7.0"  ) {
			$classes[] = 'ie7';
			$classes[] = 'ie';
		} elseif ($browser == "MSIE 6.0" ) {
			$classes[] = 'ie6';
			$classes[] = 'ie';
		} elseif ($browser == "MSIE 8.0" ) {
			$classes[] = 'ie8';
			$classes[] = 'ie';
		} elseif ($browser == "MSIE 9.0" ) {
			$classes[] = 'ie9';
			$classes[] = 'ie';
		} else {
	            $classes[] = 'ie';
	        }
	}
	else $classes[] = 'unknown';
 
	if( $is_iphone ) $classes[] = 'iphone';
 
	return $classes;
}
add_filter('body_class', 'fixr_browser_body_class');

/****************************************************************
Add Custom Pagination Support
****************************************************************/

if ( ! function_exists( 'fixr_pagination' ) ) {
	function fixr_pagination() {
		global $wp_query;
		$big = 999999999; // This needs to be an unlikely integer
		// For more options and info view the docs for paginate_links()
		// http://codex.wordpress.org/Function_Reference/paginate_links
		$paginate_links = paginate_links( array(
			'base' => str_replace( $big, '%#%', get_pagenum_link($big) ),
			'current' => max( 1, get_query_var('paged') ),
			'total' => $wp_query->max_num_pages,
			'mid_size' => 5,
			'prev_next' => True,
			'prev_text' => __('<i class="glyphicon glyphicon-chevron-left"></i> Newer'),
			'next_text' => __('Older <i class="glyphicon glyphicon-chevron-right"></i>'),
			'type' => 'list'
		) );
		$paginate_links = str_replace( "<ul class='page-numbers'>", "<ul class='pagination'>", $paginate_links );
		$paginate_links = str_replace( "<li><span class='page-numbers current'>", "<li class='active'><a href='#'>", $paginate_links );
		$paginate_links = str_replace( "</span>", "</a>", $paginate_links );
		$paginate_links = preg_replace( "/\s*page-numbers/", "", $paginate_links );
		// Display the pagination if more than one page is found
		if ( $paginate_links ) {
			echo $paginate_links;
		}
	}
}

add_filter( 'acf/fields/wysiwyg/toolbars' , 'my_toolbars'  );
function my_toolbars( $toolbars ) {
    array_unshift( $toolbars['Basic'][1], 'forecolor' );
    return $toolbars;
}

function list_child_pages() {
    global $post;
    if(is_page() && $post->post_parent) {
        $childpages = wp_list_pages('sort_column=menu_order&title_li&child_of=' . $post->post_parent . '&echo=1');
    } else {
        $childpages = wp_list_pages('sort_column=menu_order&title_li&child_of=' . $post->ID . '&echo=1');
    }
    
    if($childpages) {
        $string = '<ul>' . $childpages . '</ul>';   
    }
    
    return $string;
}


add_theme_support( 'post-thumbnails' );

function remove_editor() {
  remove_post_type_support('page', 'editor');
  remove_post_type_support('post', 'editor');
}
add_action('admin_head', 'remove_editor');

/*
function so_screen_layout_columns( $columns ) {
    $columns['post'] = 1;
    return $columns;
}
add_filter( 'screen_layout_columns', 'so_screen_layout_columns' );

function so_screen_layout_post() {
    return 1;
}
add_filter( 'get_user_option_screen_layout_post', 'so_screen_layout_post' );
*/

// Hide the admin bar on the live view when logged in
show_admin_bar( false );


// Hide Elements of the Admin Panel
function remove_menus(){
  
  //remove_menu_page( 'index.php' );                  //Dashboard
  //remove_menu_page( 'jetpack' );                    //Jetpack* 
  //remove_menu_page( 'edit.php' );                   //Posts
  //remove_menu_page( 'upload.php' );                 //Media
  //remove_menu_page( 'edit.php?post_type=page' );    //Pages
  remove_menu_page( 'edit-comments.php' );          //Comments
  //remove_menu_page( 'themes.php' );                 //Appearance
  //remove_menu_page( 'plugins.php' );                //Plugins
  //remove_menu_page( 'users.php' );                  //Users
  remove_menu_page( 'tools.php' );                  //Tools
  //remove_menu_page( 'options-general.php' );        //Settings
  
}
add_action( 'admin_menu', 'remove_menus' );


// Session managements for wishlist
add_action('init', 'startSession', 1);
add_action('wp_logout', 'endSession');
add_action('wp_login', 'endSession');

function startSession() {
    if(!session_id()) {
        session_start();
    }
}

function endSession() {
    session_destroy();
}

/*
// Add an options pages
if( function_exists('acf_add_options_page') ) {
	
	acf_add_options_page();
	
}
*/

// get the the role object
$editor = get_role('editor');
// add $cap capability to this role object
$editor->add_cap('edit_theme_options');
$editor->remove_cap('delete_pages');
$editor->remove_cap('delete_others_pages');
$editor->remove_cap('delete_published_pages');
$editor->remove_cap('publish_pages');


// add site analytics
//add_action('wp_head', add_ga);
function add_ga() {
?>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-98413958-1', 'auto');
  ga('send', 'pageview');

</script>
<?php
}
?>