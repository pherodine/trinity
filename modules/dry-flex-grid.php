<?php if(have_rows('flexible_content_repeater')): ?>

<?php while(have_rows('flexible_content_repeater')): the_row(); ?>

<?php $view = get_sub_field('content_type'); ?>

<?php if($view == 'text'): ?>
<section class="f-grid<?php echo " f-grid--" . strtolower(get_the_title()); ?>">

<?php while(have_rows('text_copy_repeater')): the_row(); ?>

<?php
    $size = get_sub_field('text_copy_size');
    $size_class = ($size == 'full') ? 'f-grid__cell--full' : 'f-grid__cell--half';
    
    $theme = get_sub_field('text_copy_theme');
    if($theme == 'light') {
        $theme_class = 'f-grid--light';
    } else if($theme == 'mid') {
        $theme_class = 'f-grid--mid';
    } else {
        $theme_class = 'f-grid--dark';
    }

    $enabled = get_sub_field('enable_border'); 
    if($enabled) {
        $borders = get_sub_field('borders');
        foreach($borders as $border) {
            $border_class .= 'f-grid__cell--b-' . $border . ' ';
        }
    }
?>

<div class="f-grid__cell <?php echo $theme_class . " " . $size_class . " " . $border_class; ?>">
    <div class="f-grid__cell__inner">
        <h1 class="f-grid__heading rev-me"><span class="prep-me"><?php the_sub_field('text_copy_title'); ?></span></h1>
        <p class="f-grid__copy rev-me"><span class="prep-me"><?php the_sub_field('text_copy_data'); ?></span></p>
        <?php if(get_sub_field('enable_text_copy_cta')): ?>
        <a class="f-grid__link button" href="<?php the_sub_field('text_copy_cta_link'); ?>"><?php the_sub_field('text_copy_cta_label'); ?></a>
        <?php endif; ?>
    </div>
</div>

<?php endwhile; // l.text_copy_repeater ?>

</section>

<?php else: ?>

<?php $image_pos = get_sub_field('image_position'); ?>
<?php $pos_class = ($image_pos == 'right') ? 'f-grid--flip' : ''; ?>

<section class="f-grid <?php echo $pos_class; ?>">

<?php while(have_rows('image_copy_repeater')): the_row(); ?>

<?php
    $theme = get_sub_field('text_image_theme');
    if($theme == 'light') {
        $theme_class = 'f-grid--light';
    } else if($theme == 'mid') {
        $theme_class = 'f-grid--mid';
    } else {
        $theme_class = 'f-grid--dark';
    }

    $enabled = get_sub_field('enable_image_border'); 
    if($enabled) {
        $borders = get_sub_field('text_image_borders');
        foreach($borders as $border) {
            
            switch($border) {
                case 0: $class = 'f-grid__cell--b-top'; break;
                case 1: $class = 'f-grid__cell--b-right'; break;
                case 2: $class = 'f-grid__cell--b-bottom'; break;
                case 3: $class = 'f-grid__cell--b-left'; break;
                case 4: $class = 'f-grid__cell--ib-top'; break;
                case 5: $class = 'f-grid__cell--ib-right'; break;
                case 6: $class = 'f-grid__cell--ib-bottom'; break;
                case 7: $class = 'f-grid__cell--ib-left'; break;
                default: break;
            }

            if(strpos($class, '--b-')) {
                $content_class .= $class . ' ';
            } else {
                $image_class .= $class . ' ';
            }
        }
    }
?>
<?php $img = get_sub_field('text_block_image'); ?>
<?php $size_class = 'f-grid__cell--half'; ?>
<div class="f-grid__cell <?php echo $size_class . " " . $image_class; ?>">
    <div class="f-grid__cell__inner no-pad rev-me">
        <img class="f-grid__cell__img img-responsive prep-me" src="<?php echo $img['url']; ?>" />
    </div>
    <!-- <div class="f-grid__cell__inner rev-me no-pad cover bg-img bg-img--center" style="background-image: url('<?php echo $img['url']; ?>');"></div> -->
</div>
<div class="f-grid__cell <?php echo $theme_class . " " . $size_class . " " . $content_class; ?>">
    <div class="f-grid__cell__inner">
        <h1 class="f-grid__heading rev-me"><span class="prep-me"><?php the_sub_field('text_image_title'); ?></span></h1>
        <p class="f-grid__copy rev-me"><span class="prep-me"><?php the_sub_field('text_image_data'); ?></span></p>
        <?php if(get_sub_field('enable_text_image_cta')): ?>
        <a class="f-grid__link button" href="<?php the_sub_field('text_image_cta_link'); ?>"><?php the_sub_field('text_image_cta_label'); ?></a>
        <?php endif; ?>
    </div>
</div>

<?php endwhile; // l.text_copy_repeater ?>

</section>

<?php endif; // c.content_type ?>

<?php endwhile; // l.flexible_content_repeater ?>

<?php endif; // c.flexible_content_repeater ?>