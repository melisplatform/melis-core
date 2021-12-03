<?php

namespace MelisCore\Service;

use Laminas\Mail\Message;
use Laminas\Mail\Transport\Sendmail;
use Laminas\Mime\Message as MimeMessage;
use Laminas\Mime\Part as MimePart;
class MelisCoreLostPasswordService extends MelisServiceManager implements MelisCoreLostPasswordServiceInterface
{
    /**
     * Adds new record for lost password request 
     * @param String $url
     * @param String $login
     * @param String $email
     */
    public function addLostPassRequest($login, $email)
    {
        $table = $this->getServiceManager()->get('MelisLostPasswordTable');
        $data = $this->getPassRequestDataByLogin($email);
        $success = false;
        if(!$this->isDataExists($login)) {
            $table->save(array(
                'rh_id' => null,
                'rh_login' => $login,
                'rh_email' => $email,
                'rh_hash' => $this->generateHash(),
                'rh_date' => date('Y-m-d H:i:s')
            ));
            // first email
            $success = $this->sendPasswordLostEmail($login, $email);
            
        }
        else {
            // resend email
            $table->update(array(
                'rh_date' => date('Y-m-d H:i:s')
            ), 'rh_login', $login);
            $success = $this->sendPasswordLostEmail($login, $email);
        }
        
        return $success;
    }
    
    /**
     * Processes the password reset and deletes the existing record in the lost password table
     * @param String $hash
     * @param String $password
     * @return boolean
     */
    public function processUpdatePassword($hash, $password) 
    {
        $data = $this->getPasswordRequestData($hash);
        $login = '';
        $success = false;
        foreach($data as $val)
        {
            $login = $val->rh_login;
        }
        
        if($this->isDataExists($login)) 
        {
            $success = $this->updatePassword($login, $password);
            
            if($success)
                $this->deletePasswordRequestData($hash);
        }
        
        return $success;
    }
    
    /**
     * Checks if the user exists
     * @param String $login
     * @return boolean
     */
    public function userExists($login) 
    {
        $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
        $data = $userTable->getEntryByField('usr_login', $login);
        $user = '';
        foreach($data as $val) 
        {
            $user = $val->usr_login;
        }
        
        if(!empty($user))
        {
            return true;
        }
        else 
        {
            return false;
        }
    }
    
    /**
     * Check if the provided hash exists
     * @param String $hash
     * @return boolean
     */
    public function hashExists($hash) 
    {
        $data = $this->getPasswordRequestData($hash);
        $h = '';
        foreach($data as $val) 
        {
            $h = $val->rh_login;
            //echo $h;
        }
        
        if(!empty($h)) {
            return true;
        }

        return false;   
    }

    /**
     * Check if the provided hash exists
     * @param String $hash
     * @return boolean
     */
    public function getUserByHash($hash)
    {
        $data = $this->getPasswordRequestData($hash);
        $login = '';
        foreach($data as $val)
        {
            $login = $val->rh_login;
            //echo $login;
        }

        $usertbl = $this->getServiceManager()->get('MelisCoreTableUser');
        $user = $usertbl->getEntryByField("usr_login",$login)->current();

        return $user;
    }
    
    /**
     * Checks if the username exists in the lost password table
     * @param String $login
     * @return boolean
     */
    public function isDataExists($login) 
    {
        $data = $this->getPassRequestDataByLogin($login);
        $login = '';
        foreach($data as $val)
        {
            $login = $val->rh_login;
        }
        
        if(!empty($login)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Returns the data of the provided username
     * @param String $login
     * @return boolean
     */
    public function getPassRequestDataByLogin($login) 
    {
        $table = $this->getServiceManager()->get('MelisLostPasswordTable');
        $data = $table->getEntryByField('rh_login', $login);
        
        if($data)
            return $data;
    }
    
    /**
     * Returns the data of the provided hash
     * @param String $login
     * @return boolean
     */
    public function getPasswordRequestData($hash) 
    {
        $table = $this->getServiceManager()->get('MelisLostPasswordTable');
        $data = $table->getEntryByField('rh_hash', $hash);
        
        if($data) 
            return $data;
    }
    
    /**
     * Updates the user's password
     * @param String $login
     * @param String $newPass
     */
    protected function updatePassword($login, $newPass)
    {
        $success       = false;
        $userTable     = $this->getServiceManager()->get('MelisCoreTableUser');
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');

        if($this->isDataExists($login)) 
        {
            $userTable->update(array(
                'usr_password' => $melisCoreAuth->encryptPassword($newPass)
            ),'usr_login', $login);
            
            $success = true;
        }
        
        return $success;
    }
    
    /**
     * Deletes a specific record in the lost password table
     * @param unknown $hash
     */
    protected function deletePasswordRequestData($hash) 
    {
        $table = $this->getServiceManager()->get('MelisLostPasswordTable');
        $data = $this->getPasswordRequestData($hash);
        
        if($data)
            $table->deleteByField('rh_hash', $hash);
    }
    

    /**
     * Sends an email together with the link to the user 
     * @param String $url
     * @param String $login
     * @param String $email
     */
    protected function sendPasswordLostEmail($login, $email) 
    {
        $datas = array();
        foreach($this->getPassRequestDataByLogin($login) as $data) {
            $datas['rh_login'] = $data->rh_login;
            $datas['rh_hash'] = $data->rh_hash;
        }
        
        $login = $datas['rh_login'];
        $hash  = $datas['rh_hash'];
        
        $configPath = 'meliscore/datas';
        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        
        $cfg = $melisConfig->getItem('meliscore/datas/'.getenv('MELIS_PLATFORM'));
        
        if (empty($cfg))
            $cfg = $melisConfig->getItem('meliscore/datas/default');
        
        $isActive = false;
        if (!empty($cfg['emails']))
            if (!empty($cfg['emails']['active']))
                $isActive = true;

        //retrieve platform scheme and prepend to the reset password link
        $scheme = !empty($cfg['platform_scheme'])?$cfg['platform_scheme']:$cfg['scheme'];
        $url = $cfg['host'].'/melis/reset-password/'.$hash;
        $url = !empty($scheme)?(trim($scheme).'://'.$url):$url;
                    
        if($isActive){
            // Tags to be replace at email content with the corresponding value
            $tags = array(
                'USER_Login' => $login,
                'URL' => $url
            );
            
            $name_to = $login;
            $email_to = $email;
            
            // Fetching user language Id
            $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
            $userData = $userTable->getDataByLoginAndEmail($login, $email);
            $userData = $userData->current();
            $langId = $userData->usr_lang_id;
            
            $melisEmailBO = $this->getServiceManager()->get('MelisCoreBOEmailService');
            $emailResult = $melisEmailBO->sendBoEmailByCode('LOSTPASSWORD',  $tags, $email_to, $name_to, $langId);
            
            if ($emailResult){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    
    /**
     * Generates a random 16-bit hash
     * @return string
     */
    private function generateHash()
    {
        return bin2hex(uniqid());
    }
    
}