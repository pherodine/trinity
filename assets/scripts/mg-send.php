<?php
    function send_mailgun($to, $subject, $content) {
        $config = array();
        $config['api_key'] = "key-ff28440b0728df8a977c89fa6ef7f1c4";
        $config['api_url'] = "https://api.mailgun.net/v3/mg.northstarwealth.co.uk/messages";

        $message = array();
        $message['from'] = "no-reply@mg.northstarwealth.co.uk";
        $message['to'] = $to;
        $message['subject'] = $subject;
        $message['html'] = $content;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $config['api_url']);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, "api:{$config['api_key']}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_POST, true); 
        curl_setopt($ch, CURLOPT_POSTFIELDS, $message);

        $result = curl_exec($ch);

        curl_close($ch);
        
        return $result;
    }

    function _isCurl() {
        return function_exists('curl_version');
    }
?>
