<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Entity;

class MelisCorePlatformScheme
{

    protected $id;
    protected $name;
    protected $colors;
    protected $sidebarHeaderLogo;
    protected $sidebarHeaderText;
    protected $loginLogo;
    protected $loginBackground;
    protected $favicon;
    protected $isActive;

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setColors($colors)
    {
        $this->colors = $colors;
    }

    public function getColors()
    {
        return $this->colors;
    }

    public function setSidebarHeaderLogo($sidebarHeaderLogo)
    {
        $this->sidebarHeaderLogo = $sidebarHeaderLogo;
    }

    public function getSidebarHeaderLogo()
    {
        return $this->sidebarHeaderLogo;
    }

    public function setSidebarHeaderText($sidebarHeaderText)
    {
        $this->sidebarHeaderText = $sidebarHeaderText;
    }

    public function getSidebarHeaderText()
    {
        return $this->sidebarHeaderText;
    }

    public function setLoginLogo($loginLogo)
    {
        $this->loginLogo = $loginLogo;
    }

    public function getLoginLogo()
    {
        return $this->loginLogo;
    }

    public function setLoginBackground($loginBackground)
    {
        $this->loginBackground = $loginBackground;
    }

    public function getLoginBackground()
    {
        return $this->loginBackground;
    }

    public function setFavicon($favicon)
    {
        $this->favicon = $favicon;
    }

    public function getFavicon()
    {
        return $this->favicon;
    }

    public function setIsActive($isActive)
    {
        $this->isActive = $isActive;
    }

    public function getIsActive()
    {
        return $this->isActive;
    }


    public function getArrayCopy()
    {
        return get_object_vars($this);
    }
}