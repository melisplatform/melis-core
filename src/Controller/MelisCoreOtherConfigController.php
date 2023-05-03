<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Laminas\View\Model\ViewModel;
use Laminas\Session\Container;
use Laminas\Config\Factory;
use Laminas\View\Model\JsonModel;
use MelisCore\Service\MelisCoreRightsService;

/**
 * This class renders Melis CMS Dashboard
*/
class MelisCoreOtherConfigController extends MelisAbstractActionController
{
	public function renderOtherConfigContainerAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	public function renderOtherConfigHeaderAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	public function renderOtherConfigContentAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	public function renderOtherConfigContentTabsCoreContainerAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}
	
	public function renderOtherConfigHeaderLeftAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	public function renderOtherConfigHeaderTitleAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	public function renderOtherConfigHeaderRightAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	public function renderOtherConfigHeaderRightSaveAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	public function saveOtherConfigAction()
	{
		$data = $this->getRequest()->getPost()->toArray();

		$response = $this->getEventManager()->trigger('meliscore_save_other_config', $this, $data);

		return new JsonModel($response[0]);
	}
}
