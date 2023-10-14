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
    const ICON_SUCCESS = "&#x2705;";
    const ICON_FAIL = "&#10060;";
    
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
        'min' => 8,       // Default/Minimum length
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
        $data = [];

        if (!empty($this->config('password_complexity_use_lower_case'))) {
            if (!preg_match('/[a-z]/', $password)) {
                $isValid = false;
                $icon = SELF::ICON_FAIL;
            } else {
                $icon = SELF::ICON_SUCCESS;
            }

            $data[] = [
                'sentence' => 'tr_meliscore_other_config_password_no_lower',
                'reference' => self::NO_LOWER,
                'icon' => $icon,
            ];
        }
        
        if (!empty($this->config('password_complexity_use_upper_case'))) {
            if (!preg_match('/[A-Z]/', $password)) {
                $isValid = false;
                $icon = SELF::ICON_FAIL;
            } else {
                $icon = SELF::ICON_SUCCESS;
            }

            $data[] = [
                'sentence' => 'tr_meliscore_other_config_password_no_upper',
                'reference' => self::NO_UPPER,
                'icon' => $icon,
            ];
        }

        if (!empty($this->config('password_complexity_number_of_characters'))) {
            $minimumNumberOfCharacters = $this->config('password_complexity_number_of_characters');
            $this->options['min'] = $minimumNumberOfCharacters;

            if (strlen($password) < $minimumNumberOfCharacters) {
                $isValid = false;
                $icon = SELF::ICON_FAIL;
            } else {
                $icon = SELF::ICON_SUCCESS;
            }

            $data[] = [
                'sentence' => 'tr_meliscore_other_config_password_too_short',
                'reference' => self::TOO_SHORT,
                'icon' => $icon,
            ];
        }

        if (!empty($this->config('password_complexity_use_digit'))) {
            if (!preg_match('/\d/', $password)) {
                $isValid = false;
                $icon = SELF::ICON_FAIL;
            } else {
                $icon = SELF::ICON_SUCCESS;
            }

            $data[] = [
                'sentence' => 'tr_meliscore_other_config_password_no_digit',
                'reference' => self::NO_DIGIT,
                'icon' => $icon,
            ];
        }

        if (!empty($this->config('password_complexity_use_special_characters'))) {
            if (!preg_match('/[\p{P}\p{S}]/u', $password)) {
                $isValid = false;
                $icon = SELF::ICON_FAIL;
            } else {
                $icon = SELF::ICON_SUCCESS;
            }

            $data[] = [
                'sentence' => 'tr_meliscore_other_config_password_no_special_character',
                'reference' => self::NO_SPECIAL_CHARACTER,
                'icon' => $icon,
            ];
        }

        $this->displayAllPasswordComplexityErrorMessages($data);

        return $isValid;
    }

    private function displayAllPasswordComplexityErrorMessages(array $messages): void
    {
        foreach ($messages as $key => $message) {
            $this->setMessage($this->translator()->translate($message['sentence']) . ' ' . $message['icon'], $message['reference']);
            $this->error($message['reference']);
        }
    }
}
