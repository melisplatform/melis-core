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
	/**
	 * Renders the Melis CMS Dashboard container for other configuration.
	 *
	 * @return ViewModel The view model for rendering the container.
	 */
	public function renderOtherConfigContainerAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	/**
	 * Renders the header for the other configuration section.
	 *
	 * @return ViewModel The view model for rendering the header.
	 */
	public function renderOtherConfigHeaderAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	/**
	 * Renders the content for the other configuration section.
	 *
	 * @return ViewModel The view model for rendering the content.
	 */
	public function renderOtherConfigContentAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	/**
	 * Renders the container for the core tab in the other configuration content section.
	 *
	 * @return ViewModel The view model for rendering the container.
	 */
	public function renderOtherConfigContentTabsCoreContainerAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}
	
	/**
	 * Renders the left section of the header in the other configuration section.
	 *
	 * @return ViewModel The view model for rendering the left section of the header.
	 */
	public function renderOtherConfigHeaderLeftAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	/**
	 * Renders the title section of the header in the other configuration section.
	 *
	 * @return ViewModel The view model for rendering the title section of the header.
	 */
	public function renderOtherConfigHeaderTitleAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	/**
	 * Renders the right section of the header in the other configuration section.
	 *
	 * @return ViewModel The view model for rendering the right section of the header.
	 */
	public function renderOtherConfigHeaderRightAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	/**
	 * Renders the save button in the right section of the header in the other configuration section.
	 *
	 * @return ViewModel The view model for rendering the save button.
	 */
	public function renderOtherConfigHeaderRightSaveAction()
	{
		$melisKey = $this->params()->fromRoute('melisKey', '');
		
		$view = new ViewModel();
		$view->melisKey = $melisKey;
		
		return $view;
	}

	/**
	 * Saves the other configuration data.
	 *
	 * @return JsonModel The JSON response containing the success status and messages.
	 */
	public function saveOtherConfigAction()
	{
		$translator = $this->getServiceManager()->get('translator');
		$data = $this->getRequest()->getPost()->toArray();
		$response = [];
		$response['success'] = 1;
		$response['errors'] = [];
		$response['textTitle'] = $translator->translate('tr_meliscore_tool_other_config');
		$response['textMessage'] = $translator->translate('tr_meliscore_tool_other_config_create_success');
		$result = $this->getEventManager()->trigger('meliscore_save_other_config', $this, $data);

		foreach ($result as $res) {
			if ($res && !empty($res['errors'])) {
				$response['success'] = 0;
				$response['textMessage'] = $translator->translate('tr_meliscore_tool_other_config_unable_to_save');
				$response['errors'] = array_merge($response['errors'], $res['errors']);
			}
		}
		return new JsonModel($response);
	}
}
