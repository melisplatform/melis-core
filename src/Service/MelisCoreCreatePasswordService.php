<?php

namespace MelisCore\Service;

use MelisCore\Model\Tables\MelisCreatePasswordTable;

class MelisCoreCreatePasswordService extends MelisGeneralService implements MelisCoreCreatePasswordServiceInterface
{
    /**
     * Adds new record for create password request
     * @param String $login
     * @param String $email
     * @return bool
     * @internal param String $url
     */
    public function generateCreatePassRequest($login, $email)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_generate_create_pass_request_start', $arrayParameters);

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceManager()->get('MelisCreatePasswordTable');
        $success = false;
        if(!$this->isDataExists($arrayParameters['login'])) {
            $table->save(array(
                'mcp_id' => null,
                'mcp_login' => $arrayParameters['login'],
                'mcp_email' => $arrayParameters['email'],
                'mcp_hash' => $this->generateHash(),
                'mcp_date' => date('Y-m-d H:i:s')
            ));
            $success = $this->sendPasswordCreateEmail($arrayParameters['login'], $arrayParameters['email']);

        }
        else {
            $table->update(array(
                'mcp_hash' => $this->generateHash(),
                'mcp_date' => date('Y-m-d H:i:s')
            ), 'mcp_login', $arrayParameters['login']);
            $success = $this->sendPasswordCreateEmail($arrayParameters['login'], $arrayParameters['email']);
        }

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $success;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_generate_create_pass_request_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Adds new record for create password request without sending email to user
     * @param String $login
     * @param String $email
     * @return String $url
     * @internal param String $url
     */
    public function createExpiredPasswordRequest($login, $email)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_generate_create_pass_request_start', $arrayParameters);

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceManager()->get('MelisCreatePasswordTable');
        $success = false;
        $hash = $this->generateHash();

        if(!$this->isDataExists($arrayParameters['login'])) {
            $table->save(array(
                'mcp_id' => null,
                'mcp_login' => $arrayParameters['login'],
                'mcp_email' => $arrayParameters['email'],
                'mcp_hash' => $hash,
                'mcp_date' => date('Y-m-d H:i:s')
            ));
        }
        else {
            $table->update(array(
                'mcp_hash' => $hash,
                'mcp_date' => date('Y-m-d H:i:s')
            ), 'mcp_login', $arrayParameters['login']);
        }

        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');

        $cfg = $melisConfig->getItem('meliscore/datas/'.getenv('MELIS_PLATFORM'));

        if (empty($cfg))
            $cfg = $melisConfig->getItem('meliscore/datas/default');

        $protocol = stripos($_SERVER['SERVER_PROTOCOL'],'https') === 0 ? 'https://' : 'http://';
        $url = $protocol.$cfg['host'].'/melis/renew-password/'.$hash;

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $url;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_generate_create_pass_request_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Adds new record for create password request
     * @param String $login
     * @return bool
     */
    public function isRequestExpired($login)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_is_request_expired_start', $arrayParameters);

        $date = null;
        foreach($this->getPassRequestDataByLogin($arrayParameters['login']) as $data) {
            $date = $data->mcp_date;
        }

        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $cfg = $melisConfig->getItem('meliscore/datas/default');
        $expiry = $cfg['pwd_request_expiry'];
        $isExpired = $date < date('Y-m-d H:i:s',strtotime('-'.$expiry.' minutes')) ? false : true;

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $isExpired;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_is_request_expired_end', $arrayParameters);

        return $arrayParameters['results'];
    }
     
    /**
     * Processes the password reset and deletes the existing record in the create password table
     * @param String $hash
     * @param String $password
     * @return boolean
     */
    public function processUpdatePassword($hash, $password) 
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_process_update_password_start', $arrayParameters);

        $data = $this->getPasswordRequestData($arrayParameters['hash']);
        $login = '';
        $success = false;
        foreach($data as $val)
        {
            $login = $val->mcp_login;
        }
        
        if($this->isDataExists($login)) 
        {
            $success = $this->updatePassword($login, $arrayParameters['password']);
            
            if($success)
                $this->deletePasswordRequestData($arrayParameters['hash']);
        }

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $success;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_process_update_password_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Check if the provided hash exists
     * @param String $hash
     * @return boolean
     */
    public function hashExists($hash) 
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_hash_exists_start', $arrayParameters);

        $data = $this->getPasswordRequestData($arrayParameters['hash']);
        $h = '';
        foreach($data as $val) 
        {
            $h = $val->mcp_login;
        }
        
        if(!empty($h)) {
            $return = true;
        }else{
            $return = false;
        }

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $return;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_hash_exists_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * get user data by hash
     * @param String $hash
     * @return boolean
     */
    public function getUserByHash($hash)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_hash_exists_start', $arrayParameters);

        $data = $this->getPasswordRequestData($arrayParameters['hash']);
        $usr_login = '';
        foreach($data as $val)
        {
            $usr_login = $val->mcp_login;
        }

        $usertbl = $this->getServiceManager()->get('MelisCoreTableUser');
        $user = $usertbl->getEntryByField("usr_login",$usr_login)->current();

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $user;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_hash_exists_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * get user data by hash
     * @param String $hash
     * @return boolean
     */
    public function getUserByUsername($username)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_hash_exists_start', $arrayParameters);

        $usertbl = $this->getServiceManager()->get('MelisCoreTableUser');
        $user = $usertbl->getEntryByField("usr_login",$username)->current();

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $user;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_hash_exists_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Checks if the username exists in the create password table
     * @param String $login
     * @return boolean
     */
    public function isDataExists($login) 
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_is_data_exists_start', $arrayParameters);

        $data = $this->getPassRequestDataByLogin($arrayParameters['login']);
        $login = '';
        foreach($data as $val)
        {
            $login = $val->mcp_login;
        }
        
        if(!empty($login)) {
            $return = true;
        }else
            $return = false;

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $return;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_is_data_exists_end', $arrayParameters);

        return $arrayParameters['results'];
    }
    
    /**
     * Returns the data of the provided username
     * @param String $login
     * @return array
     */
    public function getPassRequestDataByLogin($login) 
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_pass_request_data_by_login_start', $arrayParameters);

        $result = [];

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceManager()->get('MelisCreatePasswordTable');
        $data = $table->getEntryByField('mcp_login', $arrayParameters['login']);
        
        if($data)
            $result = $data;

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_pass_request_data_by_login_end', $arrayParameters);

        return $arrayParameters['results'];
    }
    /**
     * Returns if user exists
     * @param String $login
     * @return bool
     */
    public function isUserExist($login)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_pass_request_data_by_login_start', $arrayParameters);

        $result = [];

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceManager()->get('MelisCoreTableUser');
        $data = $table->getEntryByField('usr_login', $arrayParameters['login'])->current();

        if($data)
            $result = $data->usr_status == 0 ? false : true;
        else
            $result = false;

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_pass_request_data_by_login_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Returns the data of the provided hash
     * @param $hash
     * @return bool
     * @internal param String $login
     */
    public function getPasswordRequestData($hash) 
    {

        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_password_request_data_start', $arrayParameters);

        $result = [];

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceManager()->get('MelisCreatePasswordTable');
        $data = $table->getEntryByField('mcp_hash', $arrayParameters['hash']);
        
        if($data)
            $result = $data;

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_password_request_data_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Updates the user's password
     * @param String $login
     * @param String $newPass
     * @return bool
     */
    protected function updatePassword($login, $newPass)
    {
        $success       = false;
        $userTable     = $this->getServiceManager()->get('MelisCoreTableUser');
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');

        if($this->isDataExists($login))
        {
            $hash = $melisCoreAuth->encryptPassword($newPass);
            $userTable->update(array(
                'usr_status' => 1,
                'usr_last_pass_update_date' => date('Y-m-d H:i:s'),
                'usr_password' => $hash
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
     * Deletes every pending create password request of a login (called when an account is deleted)
     * @param String $login
     * @return void
     */
    public function deleteRequestsByLogin($login)
    {
        if (empty($login))
            return;

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceManager()->get('MelisCreatePasswordTable');
        $table->deleteByField('mcp_login', $login);
    }

    /**
     * Deletes a specific record in the create password table
     * @param unknown $hash
     */
    protected function deletePasswordRequestData($hash) 
    {
        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceManager()->get('MelisCreatePasswordTable');
        $data = $this->getPasswordRequestData($hash);
        
        if($data)
            $table->deleteByField('mcp_hash', $hash);
    }

    /**
     * Sends an email together with the link to the user
     * @param String $login
     * @param String $email
     * @return bool
     * @internal param String $url
     */
    protected function sendPasswordCreateEmail($login, $email)
    {
        $datas = array();
        foreach($this->getPassRequestDataByLogin($login) as $data) {
            $datas['mcp_login'] = $data->mcp_login;
            $datas['mcp_hash'] = $data->mcp_hash;
        }
        
        $login = $datas['mcp_login'];
        $hash  = $datas['mcp_hash'];
        
        $configPath = 'meliscore/datas';
        $melisConfig = $this->getServiceManager()->get('MelisCoreConfig');
        
        $cfg = $melisConfig->getItem('meliscore/datas/'.getenv('MELIS_PLATFORM'));
        
        if (empty($cfg))
            $cfg = $melisConfig->getItem('meliscore/datas/default');
        
        $isActive = false;
        if (!empty($cfg['emails']))
            if (!empty($cfg['emails']['active']))
                $isActive = true;

        $protocol = stripos($_SERVER['SERVER_PROTOCOL'],'https') === 0 ? 'https://' : 'http://';
        $url = $protocol.$cfg['host'].'/melis/generate-password/'.$hash;
        
            // Tags to be replace at email content with the corresponding value
            $name_to = $login;
            $email_to = $email;
            
            $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
            $userData = $userTable->getDataByLoginAndEmail($login, $email);
            $userData = $userData->current();
            $langId = $userData->usr_lang_id;

            // Tags to be replace at email content with the corresponding value
            $tags = array(
                'NAME'  => $userData->usr_firstname .' '.$userData->usr_lastname,
                'EMAIL' => $email_to,
                'LOGIN' => $name_to,
                'URL'   => $url
            );

            /** @var MelisCoreBOEmailService $melisEmailBO */
            $melisEmailBO = $this->getServiceManager()->get('MelisCoreBOEmailService');
            $emailResult = $melisEmailBO->sendBoEmailByCode('PASSWORDCREATION',  $tags, $email_to, $name_to, $langId);
            
            if ($emailResult){
                $userTable     = $this->getServiceManager()->get('MelisCoreTableUser');
                if($this->isDataExists($login))
                {
                    $userTable->update(array(
                        'usr_status' => 2,
                    ),'usr_login', $login);
                }
                return true;
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
        // CSPRNG: the create/reset-password token is a bearer credential — must be unpredictable.
        // uniqid() is server-time-derived (guessable); use random_bytes for a 256-bit token.
        return bin2hex(random_bytes(32));
    }

}