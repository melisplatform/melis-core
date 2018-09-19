<?php

namespace MelisCore\Validator;

use Zend\Validator;
use Zend\Validator\AbstractValidator;
use Zend\Validator\File\Extension;
use Zend\Validator\Exception;

class MelisImageValidator extends AbstractValidator
{

    /**
     * @var array
     */
    const ALLOWED_IMAGES = [
        'jpg', 'jpeg', 'png', 'gif', 'ico'
    ];

    /**
     * @var string
     */
    const INVALID_IMAGE = 'invalid_image';

    /**
     * @var array
     */
    protected $messageTemplates = array(
        self::INVALID_IMAGE => "Invalid image has been uploaded",
    );

    /**
     * @var array
     */
    protected $messageVariables = array(
        'allowed' => array('options' => 'allowed'),
    );

    /**
     * @var array
     */
    protected $options = array(
        'allowed'  => self::ALLOWED_IMAGES,
    );

    /**
     * MelisImageValidator constructor.
     *
     * @param array $options
     */
    public function __construct($options = array())
    {
        parent::__construct($options);
    }

    /**
     * @return mixed
     */
    public function getAllowed()
    {
        return $this->options['allowed'];
    }

    /**
     * @param $allowed
     *
     * @return $this
     */
    public function setAllowed($allowed)
    {
        $this->options['allowed'] = is_array($allowed) ? $allowed : self::ALLOWED_IMAGES;
        return $this;
    }

    /**
     * @param mixed $value
     *
     * @return bool
     */
    public function isValid($value)
    {
        $this->setValue($value);

        $isValid = true;

        $ext = strtolower(pathinfo($value, PATHINFO_EXTENSION));

        if (! in_array($ext, self::ALLOWED_IMAGES)) {
            $this->error(self::INVALID_IMAGE);
            $isValid = false;
        }

        return $isValid;
    }
}
