<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use Laminas\Paginator\Adapter\ArrayAdapter;
use Laminas\Paginator\Paginator;
use Laminas\Session\Container;
use Laminas\View\Model\ViewModel;

class MelisCoreDashboardAnnouncementPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }

    /**
     * @return ViewModel
     */
    public function getAnnouncements()
    {
        $melisAppConfig = $this->getServiceManager()->get('MelisCoreConfig');

        $melisKeys = $melisAppConfig->getMelisKeys();
        $fullKeyToolUser = $melisKeys['meliscore_tool_user'];

        /** @var \MelisCore\Service\MelisCoreDashboardPluginsRightsService $dashboardPluginsService */
        $dashboardPluginsService = $this->getServiceManager()->get('MelisCoreDashboardPluginsService');
        //get the class name to make it as a key to the plugin
        $path = explode('\\', __CLASS__);
        $className = array_pop($path);

        $isAccessible = $dashboardPluginsService->canAccess($className);

        $toolName = '';
        $toolId = '';
        $toolMelisKey = '';
        $toolIcon = '';
        $hasData = false;

        $itemConfigToolUser = $melisAppConfig->getItem($fullKeyToolUser);
        if ($itemConfigToolUser) {
            $toolName = $itemConfigToolUser['conf']['name'];
            $toolId = $itemConfigToolUser['conf']['id'];
            $toolMelisKey = $itemConfigToolUser['conf']['melisKey'];
            $toolIcon = $itemConfigToolUser['conf']['icon'];
        } else
            $isAccessible = false; // Not possible in theory
            
        $announcementService = $this->getServiceManager()->get('MelisCoreAnnouncementService');
        $announcements = $announcementService->getLists(1, null, [], null, null, 'mca_date')->toArray();

        foreach($announcements as $key => $val){
            $announcements[$key]['date_str'] = $this->getDate($val['mca_date']);
        }
        //check if it has data
        if(!empty($announcements))
            $hasData = true;

        // Pagination config
        $request = $this->getServiceManager()->get('request');
        $pageCurrent = !empty($request->getPost('next'))   ? $request->getPost('next') : 1;

        // Pagination
        $paginator = new Paginator(new ArrayAdapter($announcements));
        $paginator->setCurrentPageNumber($pageCurrent)
            ->setItemCountPerPage(3);

        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/announcements');
        $view->toolIsAccessible = $isAccessible;
        $view->toolName = $toolName;
        $view->toolId = $toolId;
        $view->toolMelisKey = $toolMelisKey;
        $view->toolIcon = $toolIcon;
        $view->paginator = $paginator;
        $view->hasData = $hasData;
        $view->announcements = $announcements;
        return $view;
    }

    /**
     * @param $date
     * @return string
     */
    private function getDate($date)
    {
        $tool = $this->getServiceManager()->get('MelisCoreTool');
        $translator = $this->getServiceManager()->get('translator');

        $timestamp = date("Y-m-d", strtotime($date));

        if($timestamp == date("Y-m-d", strtotime("+1 day"))){
            return $translator->translate('tr_melis_core_announcement_plugin_tomorrow');
        }elseif($timestamp == date("Y-m-d", strtotime("today"))){
            return $translator->translate('tr_melis_core_announcement_plugin_today');
        }else{
            return $tool->formatDate(strtotime($date), null, -1);
        }
    }
}