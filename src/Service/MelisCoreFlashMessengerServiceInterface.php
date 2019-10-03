<?php
	
namespace MelisCore\Service;

interface MelisCoreFlashMessengerServiceInterface 
{
    public function addToFlashMessenger($title, $text, $img = 'fa fa-info-circle');
    
    public function getFlashMessengerMessages();
    
    public function clearFlashMessage();
    
}