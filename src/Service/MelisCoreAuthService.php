<?php

namespace MelisCore\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Authentication\AuthenticationService;
use Zend\Crypt\BlockCipher;
use Zend\Crypt\Symmetric\Mcrypt;
class MelisCoreAuthService 
	extends AuthenticationService 
	implements MelisCoreAuthServiceInterface, ServiceLocatorAwareInterface
{
	public $serviceLocator;
	
	
	public function setServiceLocator(ServiceLocatorInterface $sl)
	{
		$this->serviceLocator = $sl;
		return $this;
	}
	
	public function getServiceLocator()
	{
		return $this->serviceLocator;
	}
	
	public function getAuthRights()
	{
    	$melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
		$user = $this->getIdentity();
		
		$rightsXML = '';
		if (!empty($user))
			$rightsXML = $user->usr_rights;
		
		return $rightsXML;
	}

	public function decryptedPassword()
    {

        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');
        if($melisCoreAuth->hasIdentity()) {
            $user = $this->getIdentity();

            return $this->getEncryption()->decrypt($user->usr_password);
        }

        return null;
    }

    public function encryptPassword($password)
    {
        return $this->getEncryption()->encrypt($password);
    }

    public function decryptPassword($password)
    {
        return $this->getEncryption()->decrypt($password);
    }

    private function getEncryption()
    {
        $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $data        = $melisConfig->getItemPerPlatform('meliscore/datas');

        $hashMethod = $data['accounts']['hash_method'];
        $salt       = $data['accounts']['salt'];

        $enc = new BlockCipher(new Mcrypt(array(
            'algo' => 'aes',
            'mode' => 'cfb',
            'hash' => $hashMethod
        )));
        $enc->setKey($salt);

        return $enc;
    }


	
}