<?php
    class FixrNavWalker extends Walker_Nav_Menu {
        
        public function start_lvl( &$output, $depth = 0, $args = array() ) {
		  $indent = str_repeat("\t", $depth);

		  // add the dropdown CSS class
		  $output .= "\n$indent<ul>\n";
	   }

        public function end_lvl( &$output, $depth = 0, $args = array() ) {
            $output .= '</ul>';
        }
		
		public function display_element( $element, &$children_elements, $max_depth, $depth = 0, $args, &$output ) {
      	  // add 'not-click' class to the list item
		  //$element->classes[] = 'not-click';

		  // Filter out classes and id's from WP defaults
		  
			
		  // if element is current or is an ancestor of the current element, add 'active' class to the list item
		  $element->classes[] = ( $element->current || $element->current_item_ancestor ) ? 'active' : '';
			

		  // if it is a root element and the menu is not flat, add 'has-dropdown' class 
		  // from https://core.trac.wordpress.org/browser/trunk/src/wp-includes/class-wp-walker.php#L140
		  //$element->has_children = ! empty( $children_elements[ $element->ID ] );
		  //$element->classes[] = ( $element->has_children && 1 !== $max_depth ) ? 'has-dropdown' : '';

		  // call parent method
		  parent::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
	   	}
		
		
        public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
            $class_names = $value = '';
			
			$unfiltered = empty($item->classes) ? array() : (array) $item->classes;
			$classes = array_filter($unfiltered, array($this, 'filter_classes'));
			
			$active_class = '';
            
            if( in_array('current-menu-item', $classes) ) {
                $active_class = ' class="active"';
            } else if( in_array('current-menu-parent', $classes) ) {
                $active_class = ' class="active-parent"';
            } else if( in_array('current-menu-ancestor', $classes) ) {
                $active_class = ' class="active-ancestor"';
            }
			
			$class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args ));
			$class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';
			$id = apply_filters( 'nav_menu_item_id', 'menu-item-'. $item->ID, $item, $args );
			$id = $id ? ' id="' . esc_attr( $id ) . '"' : '';
			$output .= $indent . '<li' . $value . $class_names .'>';
			
			$url = '';
            
            if( !empty( $item->url ) ) {
                $url = $item->url;
            }
             
            $output .= '<a href="' . $url . '">' . $item->title . '</a>';
        }

		/*
        public function end_el( &$output, $item, $depth = 0, $args = array() ) {
            //$output .= '</li>';
        }
		*/
		
		private function filter_classes($var) {
			return (FALSE === strpos($var, 'item')) ? $var : '';
		}
		
    }
?>