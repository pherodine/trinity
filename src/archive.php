<?php get_template_part('modules/header'); ?>

            <section class="archive">
                <?php if(have_posts()): ?>
                    <header>
                        <?php
                        the_archive_title('<h1 class="archive__heading">', '</h1>');
                        the_archive_description('<div class="archive__desc">', '</div>');
                        ?>
                    </header>

                    <?php 
                    // Start the loop
                    while(have_posts()): the_post();
                        get_tepmlate_part('views/content', get_post_format());
                    endwhile;

                    the_posts_navigation();
                    ?>

                <?php else: get_template_part('views/content', 'none'); endif; ?>
            </section>

<?php get_template_part('mocules/footer'); ?>