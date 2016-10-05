<?php
	
namespace MelisCore\Service;

interface MelisCoreLostPasswordServiceInterface 
{
    public function addLostPassRequest($login, $email);
    
    public function processUpdatePassword($hash, $password);
    
    public function userExists($login);
    
    public function hashExists($hash);
    
    public function isDataExists($login);
    
    public function getPassRequestDataByLogin($login);
    
    public function getPasswordRequestData($hash);
    
    
}