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
        // Rate limit: one reset email per account per configured delay. Without it every POST
        // sends a mail, which makes the public form a mail-bombing primitive.
        if($this->isRequestThrottled($login))
            return false;

        $table = $this->getServiceManager()->get('MelisLostPasswordTable');

        // Kept to restore the row if the email cannot be sent
        $previous = null;
        $data = $this->getPassRequestDataByLogin($login);
        if($data)
        {
            foreach($data as $val)
            {
                $previous = $val;
            }
        }

        $hash = $this->generateHash();

        if(!$previous) {
            $table->save(array(
                'rh_id' => null,
                'rh_login' => $login,
                'rh_email' => $email,
                'rh_hash' => $hash,
                'rh_date' => date('Y-m-d H:i:s')
            ));
        }
        else {
            // resend email: the token is regenerated so any link already sent is revoked
            $table->update(array(
                'rh_hash' => $hash,
                'rh_date' => date('Y-m-d H:i:s')
            ), 'rh_login', $login);
        }

        // A transport failure must not surface: it would answer 500 on a real account and 200
        // on an unknown one, which is the enumeration leak again, through the error page.
        try {
            $success = $this->sendPasswordLostEmail($login, $email);
        } catch (\Exception $e) {
            $success = false;
        }

        // A fresh rh_date left behind by a failed send would throttle the user on an email
        // that never left. Undo the write: a brand new row goes away, an existing one gets
        // its previous token and date back (so a link already received stays valid).
        if(!$success)
        {
            if(!$previous)
            {
                $this->deletePasswordRequestData($hash);
            }
            else
            {
                $table->update(array(
                    'rh_hash' => $previous->rh_hash,
                    'rh_date' => $previous->rh_date
                ), 'rh_login', $login);
            }
        }

        return $success;
    }

    /**
     * Issues a reset token for $login and mails the REACT reset link to $email.
     *
     * Same row/rollback/throttle contract as addLostPassRequest(), but the link points at the
     * React page (/melis-react/reset-password/<hash>) instead of the legacy one. Two callers,
     * same link, different BO email template ($emailCode) because the two situations do not
     * say the same thing to the user:
     *  - LOSTPASSWORD: MelisReactApiAuthController::forgotPasswordAction(), the user asked,
     *  - PASSWORDEXPIRED: MelisAuthController::authenticateAction() when the password is correct
     *    but expired — the user asked for nothing, the platform tells them it is no longer valid.
     *
     * @param  string   $login
     * @param  string   $email
     * @param  int|null $langId    language of the email template (user language)
     * @param  string   $emailCode BO email code (see config/app.emails.php)
     * @return bool     true when the mail left, false on throttle or transport failure
     */
    public function sendReactResetLink($login, $email, $langId = null, $emailCode = 'LOSTPASSWORD')
    {
        if($this->isRequestThrottled($login))
            return false;

        $table = $this->getServiceManager()->get('MelisLostPasswordTable');

        // Kept to restore the row if the email cannot be sent
        $previous = $table->getEntryByField('rh_login', $login)->current();

        $hash = $this->generateHash();

        if($previous) {
            // resend: the token is regenerated so any link already sent is revoked
            $table->update(array(
                'rh_hash' => $hash,
                'rh_date' => date('Y-m-d H:i:s')
            ), 'rh_login', $login);
        }
        else {
            $table->save(array(
                'rh_id' => null,
                'rh_login' => $login,
                'rh_email' => $email,
                'rh_hash' => $hash,
                'rh_date' => date('Y-m-d H:i:s')
            ));
        }

        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $cfg = $melisConfig->getItem('meliscore/datas/'.getenv('MELIS_PLATFORM'));
        if (empty($cfg))
            $cfg = $melisConfig->getItem('meliscore/datas/default');

        $scheme = $cfg['platform_scheme'] ?? 'https';
        $host   = $cfg['host'] ?? ($_SERVER['HTTP_HOST'] ?? 'localhost');
        $url    = $scheme.'://'.$host.'/melis-react/reset-password/'.$hash;

        // A transport failure must not surface: it would answer 500 on a real account and 200
        // on an unknown one, which is the enumeration leak again, through the error page.
        try {
            $success = (bool) $this->getServiceManager()->get('MelisCoreBOEmailService')
                ->sendBoEmailByCode($emailCode, array('USER_Login' => $login, 'URL' => $url), $email, $login, $langId);
        } catch (\Throwable $e) {
            $success = false;
        }

        // A fresh rh_date left behind by a failed send would throttle the user on an email
        // that never left. Undo the write: a brand new row goes away, an existing one gets
        // its previous token and date back (so a link already received stays valid).
        if(!$success)
        {
            if($previous)
            {
                $table->update(array(
                    'rh_hash' => $previous->rh_hash,
                    'rh_date' => $previous->rh_date
                ), 'rh_login', $login);
            }
            else
            {
                $table->deleteByField('rh_login', $login);
            }
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
        // Re-check the token here too: this method is the one that actually changes the
        // password, it must never trust that the caller validated the hash beforehand.
        if(!$this->hashExists($hash))
            return false;

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
            
            // Every pending token of that account is revoked, not only the one just used.
            if($success)
                $this->deleteRequestsByLogin($login);
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
        $date = null;
        foreach($data as $val) 
        {
            $h = $val->rh_login;
            $date = $val->rh_date;
        }
        
        if(empty($h)) {
            return false;
        }

        // Time-based expiration: a reset token is a bearer credential, it must not stay
        // valid forever. Expired tokens are purged on the spot so the row cannot be reused.
        if($this->isRequestExpired($date)) {
            $this->deletePasswordRequestData($hash);
            return false;
        }

        return true;
    }

    /**
     * Tells whether a request date is older than the configured expiry delay
     * @param String|null $date 'Y-m-d H:i:s' date of the request
     * @return boolean
     */
    protected function isRequestExpired($date)
    {
        if (empty($date)) {
            return true;
        }

        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $cfg = $melisConfig->getItem('meliscore/datas/'.getenv('MELIS_PLATFORM'));

        if (empty($cfg['pwd_request_expiry']))
            $cfg = $melisConfig->getItem('meliscore/datas/default');

        $expiry = !empty($cfg['pwd_request_expiry']) ? (int) $cfg['pwd_request_expiry'] : 1440;

        return strtotime($date) < strtotime('-'.$expiry.' minutes');
    }

    /**
     * Tells whether the last reset request of a login is too recent to send another email.
     * The stored rh_date is rewritten on every request, so it is the request counter itself.
     * @param String $login
     * @return boolean
     */
    public function isRequestThrottled($login)
    {
        $lastDate = null;
        $data = $this->getPassRequestDataByLogin($login);
        if($data)
        {
            foreach($data as $val)
            {
                $lastDate = $val->rh_date;
            }
        }

        if(empty($lastDate))
            return false;

        $delay = (int) $this->getPlatformConfig('pwd_request_min_delay', 5);

        return strtotime($lastDate) > strtotime('-'.$delay.' minutes');
    }

    /**
     * Reads a meliscore/datas value, platform first then default
     * @param String $key
     * @param mixed $default
     * @return mixed
     */
    protected function getPlatformConfig($key, $default)
    {
        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $cfg = $melisConfig->getItem('meliscore/datas/'.getenv('MELIS_PLATFORM'));

        if (empty($cfg[$key]))
            $cfg = $melisConfig->getItem('meliscore/datas/default');

        return !empty($cfg[$key]) ? $cfg[$key] : $default;
    }

    /**
     * Deletes every pending lost password request of a login (called when an account is deleted)
     * @param String $login
     * @return void
     */
    public function deleteRequestsByLogin($login)
    {
        if (empty($login))
            return;

        $table = $this->getServiceManager()->get('MelisLostPasswordTable');
        $table->deleteByField('rh_login', $login);
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

        // The pending request row is not a proof that the account still exists: an account
        // deleted after the email was sent would leave the update matching nothing, and the
        // reset page would still answer "success". Check the user table itself.
        if($this->isDataExists($login) && $this->userExists($login))
        {
            $hash = $melisCoreAuth->encryptPassword($newPass);
            $userTable->update(array(
                'usr_password' => $hash,
                'usr_last_pass_update_date' => date('Y-m-d H:i:s')
            ),'usr_login', $login);

            // Password history (audit item 16.0): every path that sets a password records it.
            $user = $userTable->getEntryByField('usr_login', $login)->current();
            if ($user) {
                $this->getServiceManager()->get('MelisPasswordPolicyService')->recordHistory((int) $user->usr_id, $hash);
            }
            
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
            
        $url = $cfg['platform_scheme'].'://'.$cfg['host'].'/melis/reset-password/'.$hash;
        
        // if($isActive){ // redundant checker, MelisCoreBOEmailService->sendBoEmailByCode already has a complete checker
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
        // }else{
        //     return false;
        // }
    }
    
    /**
     * Generates a random 16-bit hash
     * @return string
     */
    private function generateHash()
    {
        // CSPRNG: the reset token is the sole bearer credential to reset an account's password,
        // so it must be unpredictable. uniqid() is derived from the server time (guessable) — use
        // random_bytes for a 256-bit unguessable token.
        return bin2hex(random_bytes(32));
    }
    
}