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
    /**
     * The following class attributes & methods were created to aid
     * in pagination
     */
    protected $unfilteredDataCount = 0;
    protected $filteredDataCount = 0;
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
    public function getUnfilteredDataCount()
    {
        return $this->unfilteredDataCount;
    }

    public function setUnfilteredDataCount(int $count = 0)
    {
        $this->unfilteredDataCount = $count;
    }

    public function getFilteredDataCount()
    {
        return $this->filteredDataCount;
    }

    public function setFilteredDataCount(int $count = 0)
    {
        $this->filteredDataCount = $count;
    }

}