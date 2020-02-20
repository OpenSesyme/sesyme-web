<?php

require 'phpmailer/PHPMailerAutoload.php';

$to = $_POST['email']; 
$report = $_POST['report'];
$report_description = $_POST['report_description'];

print($to." ".$report." ".$report_description);
$from = 'info@kunokhar.com'; 
$mail = new PHPMailer;
//$mail->isSMTP();
$mail->Host = gethostname();
$mail->SMTPAuth = true;
$mail->SMTPSecure = 'tls';

$mail->Username = $from;
$mail->Password = '1@Security';

$mail->setFrom($from, 'Sesyme');
$mail->addAddress($to);
$mail->addReplyTo($from);

$mail->isHTML(true);
$mail->Subject = $report;
$msg = '<h5>'+$report_description+'
        </h5>
        ';
$mail->Body = $msg;

if($mail->send())
{
    return true;
}

