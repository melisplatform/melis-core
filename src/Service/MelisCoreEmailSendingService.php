<?php

namespace MelisCore\Service;

use Laminas\Mail\Message;
use Laminas\Mail\Transport\Sendmail;
use Laminas\Mime\Message as MimeMessage;
use Laminas\Mime\Part as MimePart;
use Laminas\Mail\Transport\Smtp as SmtpTransport;
use Laminas\Mail\Transport\SmtpOptions;

class MelisCoreEmailSendingService extends MelisServiceManager
{
    /**
     * Sending Email
     * @param $emailFrom
     * @param $fromName
     * @param $emailTo
     * @param string $toName
     * @param null $replyTo
     * @param $subject
     * @param $message_html
     * @param null $message_text
     * @param null $transportConfig
     * @throws \Exception
     */
	public function sendEmail($emailFrom, $fromName, $emailTo, $toName, $replyTo, $subject, $message_html, $message_text = null, $transportConfig = null) {

	    $html = new MimePart($message_html);
	    $html->type = 'text/html';
        $html->charset = 'UTF-8';

	    $body = new MimeMessage();

	    if ($message_text!=null){
	        
	        // Add Alternative Email Text Content
    	    $text = new MimePart($message_text);
    	    $text->type = 'text/plain';
            $text->charset = 'UTF-8';
    	    
    	    $body->addPart($html,$text);
    	    
	    }else{
	        $body->addPart($html);
	    }

	    
	    $message = new Message();
	    $message->setFrom($emailFrom, $fromName);
	    $message->addTo($emailTo);
	    $message->setSubject($subject);
	    $message->setEncoding('UTF-8');
	    $message->setSender($emailTo, $toName);
	    $message->setBody($body);
	    if ($replyTo!=null){
	        $message->addReplyTo($replyTo);
	    }

        $transport = new Sendmail();

        if(is_array($transportConfig) && $transportConfig) {
            /**
             * Program executes these lines when user passes
             * custom Transport Configuration Options ($transportConfig)
             * to specify their own Mailing Service Provider
             */
            try{
                // Setup SMTP transport using LOGIN authentication
                $transport = new SmtpTransport();
                $options   = new SmtpOptions(array(
                    'name'              => $transportConfig['name'],
                    'host'              => $transportConfig['host'],
                    'connection_class'  => $transportConfig['connectionClass'],
                    'connection_config' => array(
                        'username' => $transportConfig['username'],
                        'password' => $transportConfig['password'],
                        'ssl' => $transportConfig['ssl'],
                    ),
                    'port' => $transportConfig['port'],
                ));

                $transport->setOptions($options);
            }
            catch (\Exception $exception){
                throw new \Exception($exception->getMessage());
            }
        }


        $transport->send($message);
	}
	
	public function send($email, $name, $subject, $content)
	{
	    $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
	    $emailCfg = $melisConfig->getItem('meliscore/datas/default/emails/details/default');
	    
	    $from = $emailCfg['sender_mail'];
	    $fromName = $emailCfg['sender_name'];
	    
	    $this->sendEmail($from, $fromName, $email, $name, $subject, $content);
	}
}