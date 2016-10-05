<?php
	
namespace MelisCore\Service;

interface MelisCoreFlashMessengerServiceInterface 
{
    public function addToFlashMessenger($title, $text, $img = 'glyphicon glyphicon-info-sign');
    
    public function getFlashMessengerMessages();
    
    public function clearFlashMessage();
    
}