<?php

namespace MelisCore\Validator;

use Laminas\Validator\AbstractValidator;
use MelisCore\Service\MelisPasswordPolicyService;

/**
 * Laminas validator wrapper around MelisPasswordPolicyService (the single password policy).
 *
 * Options:
 *   serviceManager  required to read the configured policy, translations and history
 *   userId          when set, the password history rule is applied too
 *   login / email   when set, a password containing them is rejected
 */
class MelisPasswordValidatorWithConfig extends AbstractValidator
{
    const TOO_SHORT = 'length';
    const NO_LOWER  = 'lower';
    const NO_DIGIT  = 'digit';
    const NO_UPPER  = 'upper';
    const NO_SPECIAL_CHARACTER = 'special_character';
    const TOO_COMMON = 'too_common';
    const CONTAINS_LOGIN = 'contains_login';
    const DUPLICATE = 'duplicate';
    const POLICY = 'policy';

    protected $serviceManager;
    protected $userId = null;
    protected $login = null;
    protected $email = null;

    protected $messageTemplates = array(
        self::TOO_SHORT => "Password needs to be at least %min% characters long",
        self::NO_LOWER  => "Password needs to contain at least one (1) lower case",
        self::NO_DIGIT  => "Password must contain at least one digit character",
        self::NO_UPPER  => "Password needs to contain at least one (1) UPPER CASE",
        self::NO_SPECIAL_CHARACTER  => "Password needs to contain 1 special character, ex: @#$%",
        self::TOO_COMMON => "This password is too common",
        self::CONTAINS_LOGIN => "The password must not contain your login or e-mail",
        self::DUPLICATE => "This password has been used recently",
        self::POLICY => "%reason%",
    );

    protected $messageVariables = array(
        'min'    => array('options' => 'min'),
        'reason' => 'reason',
    );

    protected $options = array(
        'min' => 12,
    );

    protected $reason = '';

    public function __construct($options = array())
    {
        if ($options && is_array($options)) {
            foreach (['serviceManager', 'userId', 'login', 'email'] as $key) {
                if (array_key_exists($key, $options)) {
                    $this->{$key} = $options[$key];
                    unset($options[$key]);
                }
            }
        }

        parent::__construct($options);
    }

    public function getServiceManager()
    {
        return $this->serviceManager;
    }

    public function setServiceManager($serviceManager)
    {
        $this->serviceManager = $serviceManager;
        return $this;
    }

    /** @return MelisPasswordPolicyService */
    public function policy()
    {
        if ($this->serviceManager) {
            return $this->serviceManager->get('MelisPasswordPolicyService');
        }
        // No service manager: hard defaults, untranslated messages (defensive fallback only).
        return new MelisPasswordPolicyService();
    }

    public function config($name)
    {
        return $this->policy()->getConfig()[$name] ?? null;
    }

    public function isValid($password)
    {
        $this->setValue($password);

        $errors = $this->policy()->check(
            (string) $password,
            $this->userId ? (int) $this->userId : null,
            $this->login !== null ? (string) $this->login : null,
            $this->email !== null ? (string) $this->email : null
        );

        if (!$errors) {
            return true;
        }

        // One Laminas error per policy message, so forms display each translated rule.
        foreach ($errors as $i => $message) {
            $this->reason = $message;
            $this->abstractOptions['messages'][self::POLICY . '_' . $i] = $message;
        }

        return false;
    }
}
