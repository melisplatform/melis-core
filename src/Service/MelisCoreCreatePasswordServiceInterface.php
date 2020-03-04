<?php
	
namespace MelisCore\Service;

interface MelisCoreCreatePasswordServiceInterface
{

    public function generateCreatePassRequest($login, $email);

    public function processUpdatePassword($hash, $password);

    public function hashExists($hash);
    
    public function isDataExists($login);
    
    public function getPassRequestDataByLogin($login);
    
    public function getPasswordRequestData($hash);
    
    
}