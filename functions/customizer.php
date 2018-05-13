<?php
    function fd_customize_register($wp_customize) {

        // Master Panel
        $wp_customize->add_panel('fd_pan_global', array(
            'title' => __('Global Theme Settings', 'fixrdigital'),
            'description' => __('Update the important business details such as, addresses, numbers, email, registrations, etc.', 'fixrdigital'),
            'priority' => 10,
        ));
     
        // Branding Customisations
        $wp_customize->add_section('fd_sec_branding', array(
            'title' => __('Company & Brand Identity', 'fixrdigital'),	
            'priority' => 10, 
            'panel' => 'fd_pan_global',
        ));
        
        $wp_customize->add_setting('fd_set_branding_identity', array('default' => '', 'transport' => 'refresh'));
        $wp_customize->add_control(
            new WP_Customize_Image_Control($wp_customize, 'fd_con_branding_identity', array(
                'label' => __('Select / Upload Brand Identity', 'fixrdigital'),
                'section' => 'fd_sec_branding',
                'settings' => 'fd_set_branding_identity',
            ))
        );

        $wp_customize->add_setting('fd_set_branding_tagline', array('default' => '', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_branding_tagline', array(
            'label' => __('Brand Tagline', 'fixrdigital'),
            'description' => __('Enter your brands strapline / tagline if you have one', 'fixrdigital'),
            'type' => 'text',
            'section' => 'fd_sec_branding',
            'settings' => 'fd_set_branding_tagline'
        ));

        $wp_customize->add_setting('fd_set_company_address', array('default' => '', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_company_address', array(
            'label' => __('Registered Address', 'fixrdigital'),
            'description' => __('Enter your registered or office address (include custom html such as <br> if required).', 'fixrdigital'),
            'type' => 'textarea',
            'section' => 'fd_sec_branding',
            'settings' => 'fd_set_company_address'
        ));

        $wp_customize->add_setting('fd_set_company_email', array('default' => '', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_company_email', array(
            'label' => __('General Email Address', 'fixrdigital'),
            'description' => __('Enter an email address for general enquiries.', 'fixrdigital'),
            'type' => 'text',
            'section' => 'fd_sec_branding',
            'settings' => 'fd_set_company_email'
        ));

        $wp_customize->add_setting('fd_set_company_number', array('default' => '', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_company_number', array(
            'label' => __('General Phone Number', 'fixrdigital'),
            'description' => __('Enter an phone number for general enquiries.', 'fixrdigital'),
            'type' => 'text',
            'section' => 'fd_sec_footer',
            'settings' => 'fd_set_company_number'
        ));

        // Social Media Settings
        $wp_customize->add_section('fd_sec_social', array(
            'title' => __('Social Media', 'fixrdigital'),	
            'priority' => 11, 
            'panel' => 'fd_pan_global'
        ));

        $wp_customize->add_setting('fd_set_social_facebook', array('default' => '#', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_social_facebook', array(
			'label'	=> __('Facebook Profile URL', 'fixrdigital'),
			'Description' => __('Enter the url to your Facebook profile or page', 'fixrdigital'),
			'section' => 'fd_sec_social',
			'type' => 'url',
			'settings' => 'fd_set_social_facebook'
        ));
        
        $wp_customize->add_setting('fd_set_social_twitter', array('default' => '#', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_social_twitter', array(
			'label'	=> __('Twitter Profile URL', 'fixrdigital'),
			'Description' => __('Enter the url to your Twitter profile or page', 'fixrdigital'),
			'section' => 'fd_sec_social',
			'type' => 'url',
			'settings' => 'fd_set_social_twitter'
        ));
        
        $wp_customize->add_setting('fd_set_social_instagram', array('default' => '#', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_social_instagram', array(
			'label'	=> __('Instagram Profile URL', 'fixrdigital'),
			'Description' => __('Enter the url to your Instagram profile or page', 'fixrdigital'),
			'section' => 'fd_sec_social',
			'type' => 'url',
			'settings' => 'fd_set_social_instagram'
        ));
        
        $wp_customize->add_setting('fd_set_social_linkedin', array('default' => '#', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_social_linkedin', array(
			'label'	=> __('LinkedIn Profile URL', 'fixrdigital'),
			'Description' => __('Enter the url to your LinkedIn profile or page', 'fixrdigital'),
			'section' => 'fd_sec_social',
			'type' => 'url',
			'settings' => 'fd_set_social_linkedin'
		));

        // Footer Settings
        $wp_customize->add_section('fd_sec_footer', array(
            'title' => __('Footer Settings', 'fixrdigital'),	
            'priority' => 12, 
            'panel' => 'fd_pan_global'
        ));

        $wp_customize->add_setting('fd_set_footer_cta', array('default' => '', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_footer_cta', array(
            'label' => __('Call to Action', 'fixrdigital'),
            'description' => __('Enter your call to action message (include custom html such as <br> if required).', 'fixrdigital'),
            'type' => 'textarea',
            'section' => 'fd_sec_footer',
            'settings' => 'fd_set_footer_cta'
        ));

        $wp_customize->add_setting('fd_set_footer_cta_email', array('default' => '', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_footer_cta_email', array(
            'label' => __('Call to Action Email Address', 'fixrdigital'),
            'description' => __('Enter an email address for prospective customers to contact directly.', 'fixrdigital'),
            'type' => 'text',
            'section' => 'fd_sec_footer',
            'settings' => 'fd_set_footer_cta_email'
        ));

        

        $wp_customize->add_setting('fd_set_footer_copyright', array('default' => '', 'transport' => 'refresh'));
        $wp_customize->add_control('fd_con_footer_copyright', array(
            'label' => __('Override Default Copyright Statement', 'fixrdigital'),
            'description' => __('Enter your copyright statement.', 'fixrdigital'),
            'type' => 'textarea',
            'section' => 'fd_sec_footer',
            'settings' => 'fd_set_footer_copyright'
        ));
    }

    add_action('customize_register', 'fd_customize_register');
?>