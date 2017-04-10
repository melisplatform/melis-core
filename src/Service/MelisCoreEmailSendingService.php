<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Mail\Message;
use Zend\Mail\Transport\Sendmail;
use Zend\Mime\Message as MimeMessage;
use Zend\Mime\Part as MimePart;

class MelisCoreEmailSendingService  implements  ServiceLocatorAwareInterface{
	protected $serviceLocator;
	
	public function setServiceLocator(ServiceLocatorInterface $sl){
		$this->serviceLocator = $sl;
		return $this;
	}
	
	public function getServiceLocator(){
		return $this->serviceLocator;
	}
	
	/**
	 * Sending Email
	 * @param String $emailFrom - Email Address of the recipient
	 * @param String $fromName - Name of the recipient
	 * @param String $emailTo  - Email Address of the Email Reciever
	 * @param String $toName - Name of the Email Reciever
	 * @param String $replyTo - Email Address where Reciever can reply
	 * @param String $subject - Subject of the Email
	 * @param String $message_html - Html Content of the Email
	 * @param String $message_text - Text Conetent of the Email
	 */
	public function sendEmail($emailFrom, $fromName, $emailTo, $toName = '', $replyTo = null, $subject, $message_html, $message_text = null ) {
	    
	    $html = new MimePart($message_html);
	    $html->type = 'text/html';
	    
	    $body = new MimeMessage();
	    
	    if ($message_text!=null){
	        
	        // Add Alternative Email Text Content
    	    $text = new MimePart($message_text);
    	    $text->type = 'text/plain';
    	    
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
	    $transport->send($message);
	}
	
	public function send($email, $name, $subject, $content)
	{
	    $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
	    $emailCfg = $melisConfig->getItem('meliscore/datas/default/emails/details/default');
	    
	    $from = $emailCfg['sender_mail'];
	    $fromName = $emailCfg['sender_name'];
	    
	    $this->sendEmail($from, $fromName, $email, $name, $subject, $content);
	}
}