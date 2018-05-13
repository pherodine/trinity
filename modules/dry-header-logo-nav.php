<header class="shell__header shell__header--max">
    <div class="shell__header__info">
        
        <?php if(!empty($address)): ?>
        <div class="info-address <?php echo $info_address_class; ?>"><?php echo bloginfo('name') . ", " . $address; ?></div>
        <?php endif; ?>
        <?php
            
            $info_contacts_class = NULL;
            if(!empty($number) || !empty($email)): $info_contacts_class = "col-xs-12 col-md-6"; endif;
        ?>
        <div class="info-contacts <?php echo $info_contacts_class; ?>">
            <?php if(!empty($email)): ?><span class="info-email">Email: <a href="mailto:<?php echo $email; ?>"><?php echo $email; ?></a>, or </span><?php endif; ?>
            <?php if(!empty($number)): ?><span class="info-number">Call: <a href="tel:<?php echo str_replace(' ', '', $number); ?>"><?php echo $number; ?></a></span><?php endif; ?>
        </div>
    </div>
    <div class="header-shell__grid header-shell__grid--opaque">    
        <div class="brand">
            <a class="brand__link" href="<?php echo esc_url(home_url('/')); ?>">
                <?php $logo = get_theme_mod('fdd_desktop_logo'); ?>
                <img src="<?php echo $logo; ?>" alt="The Minster Partnership, Financial advice in the heart of Wimbourne" />
            </a>
        </div>
        <div class="hamburger hamburger--vortex">
            <div class="hamburger-box">
                <div class="hamburger-inner"></div>
            </div>
        </div>
        <nav class="main-nav main-nav--right" role="navigation">
            
            <?php fixr_menu('navbar-top', 'main-nav-list', array('main-nav-list--hx')); ?>
        </nav>
    </div>
</header>

