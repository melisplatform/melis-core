<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Model;

class MelisUser
{
    protected $userInfo;

    public function setUser($userInfo)
    {
        $this->userInfo = $userInfo;
    }
    
    public function getUser() 
    {
        return $this->userInfo;
    }
    
    public function getArrayCopy()
    {
        return get_object_vars($this);
    }
}