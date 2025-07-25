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

    // platform theme options
    protected $topLogo;
    protected $userProfile;
    protected $menu;
    protected $footer;
    protected $header;
    protected $bubblePlugin;
    protected $dashboardPlugin;
    protected $dashboardPluginMenu;
    protected $modal;
    protected $dialog;
    protected $formElement;
    protected $tab;
    protected $datepicker;
    protected $dragdrop;

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

    public function setTopLogo($topLogo)
    {
        $this->topLogo = $topLogo;
    }

    public function getTopLogo()
    {
        return $this->topLogo;
    }

    public function setUserProfile($userProfile)
    {
        $this->userProfile = $userProfile;
    }

    public function getUserProfile()
    {
        return $this->userProfile;
    }

    public function setMenu($menu)
    {
        $this->menu = $menu;
    }

    public function getMenu()
    {
        return $this->menu;
    }

    public function setFooter($footer)
    {
        $this->footer = $footer;
    }

    public function getFooter()
    {
        return $this->footer;
    }

    public function setHeader($header)
    {
        $this->header = $header;
    }

    public function getHeader()
    {
        return $this->header;
    }

    public function setBubblePlugin($bubblePlugin)
    {
        $this->bubblePlugin = $bubblePlugin;
    }

    public function getBubblePlugin()
    {
        return $this->bubblePlugin;
    }

    public function setDashboardPlugin($dashboardPlugin)
    {
        $this->dashboardPlugin = $dashboardPlugin;
    }

    public function getDashboardPlugin()
    {
        return $this->dashboardPlugin;
    }

    public function setDashboardPluginMenu($dashboardPluginMenu)
    {
        $this->dashboardPluginMenu = $dashboardPluginMenu;
    }

    public function getDashboardPluginMenu()
    {
        return $this->dashboardPluginMenu;
    }

    public function setModal($modal)
    {
        $this->modal = $modal;
    }

    public function getModal()
    {
        return $this->modal;
    }

    public function setDialog($dialog)
    {
        $this->dialog = $dialog;
    }

    public function getDialog()
    {
        return $this->dialog;
    }

    public function setFormElement($formElement)
    {
        $this->formElement = $formElement;
    }

    public function getFormElement()
    {
        return $this->formElement;
    }

    public function setTab($tab)
    {
        $this->tab = $tab;
    }

    public function getTab()
    {
        return $this->tab;
    }

    public function setDatepicker($datepicker)
    {
        $this->datepicker = $datepicker;
    }

    public function getDatepicker()
    {
        return $this->datepicker;
    }

    public function setDragdrop($dragdrop)
    {
        $this->dragdrop = $dragdrop;
    }

    public function getDragdrop()
    {
        return $this->dragdrop;
    }
}