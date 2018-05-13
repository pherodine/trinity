<?php 
add_action( 'init', 'fixr_cpts' );
function fixr_cpts() {
	// Team Members Post Type
	$labels = array(
		"name" => __( 'Team Members', 'fixr' ),
		"singular_name" => __( 'Team Member', 'fixr'),
	);

	$args = array(
		"label" => __( 'Team Members', 'fixr'),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => false,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => true,
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => array( "slug" => "team_members", "with_front" => true ),
		"query_var" => true,
		"menu_icon" => "dashicons-businessman",
		"supports" => array( "title", "thumbnail" ),					
	);

	register_post_type( "team_members", $args );

	// Call to Action Post Type
	$labels = array(
		"name" => __( 'Call To Actions', 'fixr' ),
		"singular_name" => __( 'Call to Action', 'fixr' ),
		"menu_name" => __( 'Calls to Action', 'fixr' ),
		"all_items" => __( 'All Calls to Action', 'fixr' ),
		"add_new" => __( 'Add Call to Action', 'fixr' ),
		"add_new_item" => __( 'Add New Call to Action', 'fixr' ),
		"edit" => __( 'Edit', 'fixr' ),
		"edit_item" => __( 'Edit Call to Action', 'fixr' ),
		"new_item" => __( 'New Call to Action', 'fixr' ),
		"view" => __( 'View', 'fixr' ),
		"view_item" => __( 'View Call to Action', 'fixr' ),
		"search_items" => __( 'Search Calls To Action', 'fixr' ),
		"not_found" => __( 'No Calls to Action found', 'fixr' ),
		"not_found_in_trash" => __( 'No Calls to Action found in Trash', 'fixr' ),
		"parent_item_colon" => __( 'Parent Call to Action', 'fixr' ),
	);

	$args = array(
		"label" => __( 'Call To Actions', 'fixr' ),
		"labels" => $labels,
		"description" => "Call to Actions to link into pages",
		"public" => true,
		"publicly_queryable" => false,
		"show_ui" => true,
		"show_in_rest" => false,
		"rest_base" => "",
		"has_archive" => false,
		"show_in_menu" => true,
				"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => array( "slug" => "call-to-action", "with_front" => true ),
		"query_var" => true,
		"menu_position" => 25,"menu_icon" => "dashicons-megaphone",
		"supports" => array( "title")					
	);
	register_post_type( "call-to-action", $args );
}
?>
