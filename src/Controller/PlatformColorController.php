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
use Zend\View\Model\JsonModel;
use Zend\Session\Container;
use MelisCore\Service\MelisCoreRightsService;
/**
 * Platform Color Tool
 */
class PlatformColorController extends AbstractActionController
{

    /**
     * Tool display container
     * @return ViewModel
     */
    public function toolContainerAction()
    {
        $view = new ViewModel();

        $view->melisKey  = $this->getMelisKey();
        $view->hasAccess = $this->hasAccess();

        return $view;
    }

    /**
     * Returns the melisKey of this tool
     * @return mixed
     */
    private function getMelisKey()
    {
        $melisKey = $this->params()->fromRoute('melisKey', null);

        return $melisKey;
    }

    /**
     * Generates a dynamic CSS virtual file that will be rendered
     * in the platform
     * @return ViewModel
     */
    public function getStyleColorCssAction()
    {
        $primaryColor   = null;
        $secondaryColor = null;

        $response = $this->getResponse();
        $response->getHeaders()
            ->addHeaderLine('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0')
            ->addHeaderLine('Pragma', 'no-cache')
            ->addHeaderLine('Content-Type', 'text/css;charset=UTF-8');

        /**
         * @todo: this should be coming from the database
         */
        $platformColorTable = $this->getServiceLocator()->get('MelisCorePlatformColorTable');
        $platformColorData  = $platformColorTable->getEntryByField('pcolor_is_active', 1)->current();
        if($platformColorData) {
            $colors = json_decode($platformColorData->pcolor_settings);
            if($colors) {
                $primaryColor = $colors->primaryColor;
                $secondaryColor = $colors->secondaryColor;
            }
        }



        $view = new ViewModel();

        $view->setTerminal(true);

        $view->primaryColor   = $primaryColor;
        $view->secondaryColor = $secondaryColor;

        return $view;
    }

    /**
     * Checks whether the user has access to this tools or not
     * @return boolean
     */
    private function hasAccess()
    {
        $key             = 'meliscore_tool_platform_color_tool_content';
        $melisCoreAuth   = $this->getServiceLocator()->get('MelisCoreAuth');
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        $xmlRights       = $melisCoreAuth->getAuthRights();

        $isAccessible    = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_TOOLS, $key);

        return $isAccessible;
    }

    public function saveColorAction()
    {

        $platformColorTable = $this->getServiceLocator()->get('MelisCorePlatformColorTable');

        $colors = array(
            'primaryColor'   => '#e31d28',
            'secondaryColor' => '',
        );

        $platformColorTable->save([
            'pcolor_id'=> 1,
            'pcolor_settings' => json_encode($colors),
            'pcolor_is_active' => 1
        ], 1);

        $platformColorData = $platformColorTable->fetchAll()->toArray();

        return new JsonModel($platformColorData);
    }
}