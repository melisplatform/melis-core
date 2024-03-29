<?php

namespace MelisCore\Validator;

use Laminas\Validator;
use Laminas\Validator\AbstractValidator;

class MelisPasswordValidatorWithConfig extends AbstractValidator
{
    const TOO_SHORT = 'length';
    const NO_LOWER  = 'lower';
    const NO_DIGIT  = 'digit';
    const NO_UPPER  = 'upper';
    const NO_SPECIAL_CHARACTER = 'special_character';
    
    protected $serviceManager;

    protected $messageTemplates = array(
        self::TOO_SHORT => "Password needs to be at least %min% characters long",
        self::NO_LOWER  => "Password needs to contain at least one (1) lower case",
        self::NO_DIGIT  => "Password must contain at least one digit character",
        self::NO_UPPER  => "Password needs to contain at least one (1) UPPER CASE",
        self::NO_SPECIAL_CHARACTER  => "Password needs to contain 1 special character, ex: @#$%",
    );
    
    /**
     * @var array
     */
    protected $messageVariables = array(
        'min' => array('options' => 'min'),
    );
    
    protected $options = array(
        'min'      => 8,       // Default/Minimum length
    );

    public function __construct($options = array())
    {
        if ($options && is_array($options) && array_key_exists('serviceManager', $options))
        {
            //get render mode from request
            $this->serviceManager = $options['serviceManager'];
            unset($options['serviceManager']);
        }

        parent::__construct($options);
    }
    
    public function getServiceManager()
    {
        return $this->serviceManager;
    }
    
    public function config($name)
    {
        return $this->getServiceManager()->get('MelisCoreConfig')->getItem('meliscore/datas/login')[$name] ?? null;
    }

    public function auth()
    {
        return $this->getServiceManager()->get('MelisCoreAuth');
    }

    public function translator()
    {
        return $this->getServiceManager()->get('translator');
    }
    
    public function isValid($password)
    {
        $this->setValue($password);
        $isValid = true;

        if (!empty($this->config('password_complexity_number_of_characters'))) {
            $minimumNumberOfCharacters = $this->config('password_complexity_number_of_characters');

            if (strlen($password) < $minimumNumberOfCharacters) {
                $this->options['min'] = $minimumNumberOfCharacters;
                $this->setMessage($this->translator()->translate('tr_meliscore_other_config_password_too_short'), self::TOO_SHORT);
                $this->error(self::TOO_SHORT);
                $isValid = false;
            }
        }
        
        if (!empty($this->config('password_complexity_use_lower_case'))) {
            if (!preg_match('/[a-z]/', $password)) {
                $this->setMessage($this->translator()->translate('tr_meliscore_other_config_password_no_lower'), self::NO_LOWER);
                $this->error(self::NO_LOWER);
                $isValid = false;
            }
        }
        
        if (!empty($this->config('password_complexity_use_digit'))) {
            if (!preg_match('/\d/', $password)) {
                $this->setMessage($this->translator()->translate('tr_meliscore_other_config_password_no_digit'), self::NO_DIGIT);
                $this->error(self::NO_DIGIT);
                $isValid = false;
            }
        }

        if (!empty($this->config('password_complexity_use_upper_case'))) {
            if (!preg_match('/[A-Z]/', $password)) {
                $this->setMessage($this->translator()->translate('tr_meliscore_other_config_password_no_upper'), self::NO_UPPER);
                $this->error(self::NO_UPPER);
                $isValid = false;
            }
        }

        if (!empty($this->config('password_complexity_use_special_characters'))) {
            if (!preg_match('/[\p{P}\p{S}]/u', $password)) {
                $this->setMessage($this->translator()->translate('tr_meliscore_other_config_password_no_special_character'), self::NO_SPECIAL_CHARACTER);
                $this->error(self::NO_SPECIAL_CHARACTER);
                $isValid = false;
            }
        }

        return $isValid;
    }
}
