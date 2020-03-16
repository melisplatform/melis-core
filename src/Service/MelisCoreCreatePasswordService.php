<?php

namespace MelisCore\Service;

use MelisCore\Model\Tables\MelisCreatePasswordTable;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

class MelisCoreCreatePasswordService extends MelisCoreGeneralService implements ServiceLocatorAwareInterface, MelisCoreCreatePasswordServiceInterface
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

    /**
     * Adds new record for create password request
     * @param String $login
     * @param String $email
     * @return bool
     * @internal param String $url
     */
    public function generateCreatePassRequest($login, $email)
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_generate_create_pass_request_start', $arrayParameters);

        // Service implementation start

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceLocator()->get('MelisCreatePasswordTable');
        $success = false;
        if(!$this->isDataExists($arrayParameters['login'])) {
            $table->save(array(
                'mcp_id' => null,
                'mcp_login' => $arrayParameters['login'],
                'mcp_email' => $arrayParameters['email'],
                'mcp_hash' => $this->generateHash(),
                'mcp_date' => date('Y-m-d H:i:s')
            ));
            // first email
            $success = $this->sendPasswordCreateEmail($arrayParameters['login'], $arrayParameters['email']);

        }
        else {
            // resend email
            $table->update(array(
                'mcp_hash' => $this->generateHash(),
                'mcp_date' => date('Y-m-d H:i:s')
            ), 'mcp_login', $arrayParameters['login']);
            $success = $this->sendPasswordCreateEmail($arrayParameters['login'], $arrayParameters['email']);
        }

        // Service implementation end

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $success;
        // Sending service end event
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
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_is_request_expired_start', $arrayParameters);

        // Service implementation start

        $date = null;
        foreach($this->getPassRequestDataByLogin($arrayParameters['login']) as $data) {
            $date = $data->mcp_date;
        }

        $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $cfg = $melisConfig->getItem('meliscore/datas/default');
        $expiry = $cfg['pwd_request_expiry'];
        $isExpired = $date < date('Y-m-d H:i:s',strtotime('-'.$expiry.' minutes')) ? false : true;

        // Service implementation end

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $isExpired;
        // Sending service end event
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
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_process_update_password_start', $arrayParameters);

        // Service implementation start

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

        // Service implementation end

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $success;
        // Sending service end event
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
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_hash_exists_start', $arrayParameters);

// Service implementation start

        $data = $this->getPasswordRequestData($arrayParameters['hash']);
        $h = '';
        foreach($data as $val) 
        {
            $h = $val->mcp_login;
            //echo $h;
        }
        
        if(!empty($h)) {
            $return = true;
        }else{
            $return = false;
        }

        // Service implementation end

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $return;
        // Sending service end event
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
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_is_data_exists_start', $arrayParameters);

        // Service implementation start

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

        // Service implementation end

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $return;
        // Sending service end event
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
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_pass_request_data_by_login_start', $arrayParameters);

        // Service implementation start
        $result = [];

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceLocator()->get('MelisCreatePasswordTable');
        $data = $table->getEntryByField('mcp_login', $arrayParameters['login']);
        
        if($data)
            $result = $data;

        // Service implementation end

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
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
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_pass_request_data_by_login_start', $arrayParameters);

        // Service implementation start
        $result = [];

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceLocator()->get('MelisCoreTableUser');
        $data = $table->getEntryByField('usr_login', $arrayParameters['login'])->current();

        if($data)
            $result = $data->usr_status == 0 ? false : true;
        else
            $result = false;

        // Service implementation end

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
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

        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('meliscorecreatepassword_service_get_password_request_data_start', $arrayParameters);

        // Service implementation start
        $result = [];

        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceLocator()->get('MelisCreatePasswordTable');
        $data = $table->getEntryByField('mcp_hash', $arrayParameters['hash']);
        
        if($data)
            $result = $data;


        // Service implementation end

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
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
        $userTable     = $this->getServiceLocator()->get('MelisCoreTableUser');
        $melisCoreAuth = $this->serviceLocator->get('MelisCoreAuth');

        if($this->isDataExists($login))
        {
            $userTable->update(array(
                'usr_status' => 1,
                'usr_password' => $melisCoreAuth->encryptPassword($newPass)
            ),'usr_login', $login);
            
            $success = true;
        }

        return $success;
    }
    
    /**
     * Deletes a specific record in the create password table
     * @param unknown $hash
     */
    protected function deletePasswordRequestData($hash) 
    {
        /** @var MelisCreatePasswordTable $table */
        $table = $this->getServiceLocator()->get('MelisCreatePasswordTable');
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
        $melisConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        
        $cfg = $melisConfig->getItem('meliscore/datas/'.getenv('MELIS_PLATFORM'));
        
        if (empty($cfg))
            $cfg = $melisConfig->getItem('meliscore/datas/default');
        
        $isActive = false;
        if (!empty($cfg['emails']))
            if (!empty($cfg['emails']['active']))
                $isActive = true;

        $protocol = stripos($_SERVER['SERVER_PROTOCOL'],'https') === 0 ? 'https://' : 'http://';
        $url = $protocol.$cfg['host'].'/melis/generate-password/'.$hash;
        
        if($isActive){
            // Tags to be replace at email content with the corresponding value
            $name_to = $login;
            $email_to = $email;
            
            // Fetching user language Id
            $userTable = $this->getServiceLocator()->get('MelisCoreTableUser');
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
            $melisEmailBO = $this->getServiceLocator()->get('MelisCoreBOEmailService');
            $emailResult = $melisEmailBO->sendBoEmailByCode('PASSWORDCREATION',  $tags, $email_to, $name_to, $langId);
            
            if ($emailResult){
                $userTable     = $this->getServiceLocator()->get('MelisCoreTableUser');
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