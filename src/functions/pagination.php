<?php
if ( !function_exists('fixr_paginate')) :
    function fixr_paginate($custom_query, $show_count = false, $mid_size = 4) {
        if ( !$current_page = get_query_var( 'paged' ) ) $current_page = 1;
        $permalinks = get_option( 'permalink_structure' );
        if( is_front_page() ) {
            $format = empty( $permalinks ) ? '?paged=%#%' : 'page/%#%/';
        } else {
            $format = empty( $permalinks ) || is_search() ? '&paged=%#%' : 'page/%#%/';
        }
        $big = 999999999; // need an unlikely integer
        $pagination = paginate_links(array(
            'base' => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
            'format' => $format,
            'current' => $current_page,
            'total' => $custom_query->max_num_pages,
            'mid_size' => !is_string($mid_size) ? (string) $mid_size : $mid_size,
            'type' => 'list',
            'next_text' => __( 'Next →' ),
            'prev_text' => __( '← Prev' )
        ));
?>
<section class="pagination">
    <?php if($show_count): ?>
    <p class="counter"><?php printf( __( 'Page %1$s of %2$s' ), $current_page, $custom_query->max_num_pages ); ?></p>
    <?php endif; ?>
    <?php if($pagination): echo $pagination; endif; ?>
</section>

<?php }
endif;
?>