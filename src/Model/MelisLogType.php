<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model;

class MelisLogType
{
    public function getArrayCopy()
    {
        return get_object_vars($this);
    }
}