<?php

namespace MelisCore\Validator;

/**
 * @deprecated Kept for backward compatibility only. It used to enforce a hard-coded
 * "8 characters + 1 lower case + 1 digit" rule that ignored the configured policy.
 * It now behaves exactly like MelisPasswordValidatorWithConfig; pass a 'serviceManager'
 * option to get the configured policy, translations and password history.
 */
class MelisPasswordValidator extends MelisPasswordValidatorWithConfig
{
    public function __construct($options = array())
    {
        // Legacy signature: new MelisPasswordValidator($min)
        if (!is_array($options)) {
            $options = func_get_args();
            $temp['min'] = array_shift($options);
            $options = $temp;
        }

        parent::__construct($options);
    }

    public function getMin()
    {
        return $this->options['min'];
    }

    public function setMin($min)
    {
        $this->options['min'] = max(0, (int) $min);
        return $this;
    }
}
