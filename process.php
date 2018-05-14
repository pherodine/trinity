<?php
	require_once('./assets/scripts/mg-send.php');

    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    $submitted = false;

    $errors         = array();      // array to hold validation errors
    $data           = array();      // array to pass back data
    $trace          = array();

    $fullname = $email = $number = $county = $type = $how = $details = $human = "";

    $debug_mode = false;
    $admin_to = "admin@fixrdigital.co.uk";
	$sub_domain = "mg";
    $sitename = "North Star Wealth Management";
    $enquiry_account = "info";
	$url = "northstarwealth.co.uk";

    // validate the variables ======================================================
    // if any of these variables don't exist, add an error to our $errors array
        
        // Test fullname
        if(empty($_POST['contact_fullname'])) {
            $errors["err_fullname"] = "Your fullname is required.";
        } else {
            if(!preg_match("/^[a-zA-Z ]*$/", $_POST['contact_fullname'])) {
                $errors['err_fullname'] = "Your full name is invalid. Only Letters and Spaces are allowed.";
            }
            else {
                $fullname = $_POST['contact_fullname'];
            }
        }
        
        // Test email address
        if(empty($_POST['contact_email'])) {
            $errors["err_email"] = "Your email address is required.";
        } else {
            if(!filter_var($_POST['contact_email'], FILTER_VALIDATE_EMAIL)) {
                $errors["err_email"] = "Your email address is invalid.";
            } else {
                $email = $_POST['contact_email'];
            }
        }
        
        // Test Phone Number
        if(empty($_POST['contact_number'])) {
            $errors["err_number"] = "Your best contact number is required.";
        } else {
            if(strlen($_POST['contact_number']) < 10 || !preg_match("/^[0-9]*$/", $_POST['contact_number'])) {
                $errors["err_number"] = "Your phone number is invalid. Please include the area code.";
            }
            else {
                $number = $_POST['contact_number'];
            }
        }
        
        // Test county supplied
        if(empty($_POST['contact_county'])) {
            $errors["err_county"] = "The project county location is required";
        } else {
            $county = $_POST['contact_county'];
        }
        
        // Test Enquiry
        if(empty($_POST['contact_type'])) {
            $errors["err_type"] = "Your primary enquiry interest is required.";
        } else {
            $type = $_POST['contact_type'];
        }
        
        // Test Mesage
        if(empty($_POST['contact_message'])) {
            $errors["err_message"] = "Project details are required in the message box.";
        } else {
            $details = $_POST['contact_message'];
        }

        if ( ! empty($errors)) {

            // if there are items in our errors array, return those errors
            $data['success'] = false;
            $data['errors']  = $errors;
        } else {
            function hyphenate($str) {
                return implode("-", str_split($str, 4));
            }
            // if there are no errors process our form, then return a message
            // Email Harris Brothers
            $to = $enquiry_account . "@" . $url;
            $subject = $sitename . " Web Enquiry";
            $uid = strtoupper(hyphenate(md5(time() . $fullname . $email)));
			
			$message  = "<html><body>";
            $message .= "<p>You have received a message from the Contact Form of the " . $sitename . " Website:</p>";
            $message .= "<table rules=\"all\" style=\"border-color: #fff;\" cellpadding=\"10\">";
            $message .= "<tr><td style=\"background-color: #231f20; color: #fff\">Name:</td><td style=\"background-color: #bcbec0;\">" . strip_tags($fullname) . "</td></tr>";
            $message .= "<tr><td style=\"background-color: #231f20; color: #fff\">Email Address:</td><td style=\"background-color: #bcbec0;\">" . strip_tags($email) . "</td></tr>";
            $message .= "<tr><td style=\"background-color: #231f20; color: #fff\">Phone Number:</td><td style=\"background-color: #bcbec0;\">" . strip_tags($number) . "</td></tr>";
            $message .= "<tr><td style=\"background-color: #231f20; color: #fff\">County:</td><td style=\"background-color: #bcbec0;\">" . strip_tags($county) . "</td></tr>";
            $message .= "<tr><td style=\"background-color: #231f20; color: #fff\">Enquiry Type:</td><td style=\"background-color: #bcbec0;\">" . strip_tags($type) . "</td></tr>";
            $message .= "<tr><td style=\"background-color: #231f20; color: #fff\">Message:</td><td style=\"background-color: #bcbec0;\">" . strip_tags($details) . "</td></tr>";
            $message .= "</table>";
            $message .= "<p>Message ID: " . strip_tags($uid) . "</p>"; 
            $message .= "</body></html>";
            
            // Send the email to client
            $send = send_mailgun($to, $subject, $message);
                        
            // Send Email to customer
            
            
            // show a message of success and provide a true success variable        
            $data['success'] = true;
            $data['message'] = 'Your message [' . $uid . '] has been sent successfully';
        }

        // return all our data to an AJAX call
    
        echo json_encode($data);
?>