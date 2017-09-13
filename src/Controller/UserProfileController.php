<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\Session\Container;

use MelisCore\Service\MelisCoreRightsService;

/**
 * This class renders Melis CMS Dashboard
 */
class UserProfileController extends AbstractActionController
{
    public function renderUserProfileAction()
    {
        $melisKey = $this->getMelisKey();

        $view = new ViewModel();
        $view->melisKey = $melisKey;

        return $view;
    }

    private function getMelisKey()
    {
        $melisKey = $this->params()->fromRoute('melisKey', $this->params()->fromQuery('melisKey'), null);

        return $melisKey;
    }
}