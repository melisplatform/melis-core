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

    /**
     * Returns the min option
     *
     * @return int
     */
    public function getMin()
    {
        return $this->options['min'];
    }
    
    /**
     * Sets the min option
     *
     * @param  int $min
     * @throws Exception\InvalidArgumentException
     * @return StringLength Provides a fluent interface
     */
    public function setMin($min)
    {
        $this->options['min'] = max(0, (int) $min);
        return $this;
    }
    
    public function config($name)
    {
        return $this->getServiceManager()->get('config')[$name] ?? null;
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
                $this->error(self::TOO_SHORT);
                $isValid = false;
            }
        }
        
        if (!empty($this->config('password_complexity_use_lower_case'))) {
            if (!preg_match('/[a-z]/', $password)) {
                $this->error(self::NO_LOWER);
                $isValid = false;
            }
        }
        
        if (!empty($this->config('password_complexity_use_digit'))) {
            if (!preg_match('/\d/', $password)) {
                $this->error(self::NO_DIGIT, $password);
                $isValid = false;
            }
        }

        if (!empty($this->config('password_complexity_use_upper_case'))) {
            if (!preg_match('/[A-Z]/', $password)) {
                $this->error(self::NO_UPPER);
                $isValid = false;
            }
        }

        if (!empty($this->config('password_complexity_use_special_characters'))) {
            if (!preg_match('/[\p{P}\p{S}]/u', $password)) {
                $this->error(self::NO_SPECIAL_CHARACTER, $password);
                $isValid = false;
            }
        }

        return $isValid;
    }
}
