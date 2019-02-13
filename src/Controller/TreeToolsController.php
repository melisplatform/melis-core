<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;
use MelisCore\Service\MelisCoreRightsService;
use MelisCore\Service\MelisCoreConfigService;
use Zend\Stdlib\ArrayUtils;

/**
 * This class renders Melis CMS
 */
class TreeToolsController extends AbstractActionController
{
    const CORE = 'meliscore';
    const CMS = 'meliscms';
    const MARKETING = 'melismarketing';
    const COMMERCE = 'meliscommerce';
    const OTHERS = 'melisothers';
    const CUSTOM = 'meliscustom';
    const MARKETPLACE = 'melismarketplace';
    const DASHBOARDPLUGIN = 'melisdashboardplugin';

    /**
     * Renders the leftmenu accordion/tree of tools
     * @return ViewModel
     */
    public function renderTreeToolsAction(): ViewModel
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');

        /** @var \MelisCore\Service\MelisCoreConfigService $melisAppConfig */
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');
        $melisKeys = $melisAppConfig->getMelisKeys();

        // Get the order list for ordering tools
        $appconfigpath = $melisKeys[$melisKey] ?? null;

        if ($appconfigpath) {
            $appsConfig = $melisAppConfig->getItem($appconfigpath);
            $orderInterface = $melisAppConfig->getOrderInterfaceConfig($melisKey);
            $tools = [];

            /** @var \MelisCore\Service\MelisCoreAuthService $melisCoreAuth */
            $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');

            /** @var \MelisCore\Service\MelisCoreRightsService $melisCoreRights */
            $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
            $xmlRights = $melisCoreAuth->getAuthRights();

            // Merge config if melisKey is "Others"
            if ($melisKey == 'melisothers_toolstree_section') {
                $appsConfig['interface'] = ArrayUtils::merge($appsConfig['interface'], $this->moveToolsToOthersCategory());
            }
        }

        // Show sections first
        if (isset($appsConfig['interface'])) {
            foreach ($appsConfig['interface'] as $key => $toolSectionName) {
                $isNavChild = false;

                if ($melisCoreRights->canAccess($key)) {

                    $tools[$key] = [
                        'toolsection_id' => $toolSectionName['conf']['id'] ?? $key,
                        'toolsection_name' => $toolSectionName['conf']['name'] ?? $key,
                        'toolsection_meliskey' => $toolSectionName['conf']['melisKey'] ?? $key,
                        'toolsection_icon' => $toolSectionName['conf']['icon'] ?? 'fa-cube',
                        'toolsection_forward' => $toolSectionName['forward'] ?? [],
                        'toolsection_children' => [],
                        'toolsection_parent_tool' => false,
                        'toolsection_is_tool' => isset($toolSectionName['forward']) && !empty($toolSectionName['forward']) ? true : false,
                    ];

                    // Second level, tools
                    if (isset($toolSectionName['interface'])) {
                        foreach ($toolSectionName['interface'] as $keyTool => $toolName) {
                            $isToolNavChild = false;

                            $icon = (!empty($toolName['conf']['icon'])) ? $toolName['conf']['icon'] : 'fa-cube';

                            if ($icon) {
                                $isNavChild = true;
                            }

                            if ($melisCoreRights->canAccess($keyTool)) {
                                $tools[$key]['toolsection_children'][$keyTool] = [
                                    'tool_id' => $toolName['conf']['id'] ?? $keyTool,
                                    'tool_name' => $toolName['conf']['name'] ?? "<strike>$keyTool</strike>",
                                    'tool_icon' => $icon,
                                    'tool_forward' => isset($toolName['forward']) ? $toolName['forward'] : [],
                                    'tool_melisKey' => $toolName['conf']['melisKey'] ?? $keyTool,
                                    'toolsection_is_tool' => isset($toolName['forward']) && !empty($toolName['forward']) ? true : false
                                ];
                            }

                            // add third level for tool others
                            if ($melisKey == 'melisothers_toolstree_section') {
                                if (isset($toolName['interface'])) {

                                    // third level, child tools
                                    foreach ($toolName['interface'] as $childKeyTool => $childToolname) {
                                        $icon = (!empty($childToolname['conf']['icon'])) ? $childToolname['conf']['icon'] : 'fa-cube';

                                        if ($icon) {
                                            $isToolNavChild = true;
                                        }

                                        if ($melisCoreRights->canAccess($childKeyTool)) {
                                            $tools[$key]['toolsection_children'][$keyTool]['toolsection_children'][$childKeyTool] = [
                                                'tool_id' => $childToolname['conf']['id'] ?? $keyTool,
                                                'tool_name' => $childToolname['conf']['name'] ?? "<strike>$childKeyTool</strike>",
                                                'tool_icon' => $icon,
                                                'tool_forward' => isset($childToolname['forward']) ? $childToolname['forward'] : [],
                                                'tool_melisKey' => $childToolname['conf']['melisKey'] ?? $keyTool,
                                                'toolsection_is_tool' => isset($childToolname['forward']) && !empty($childToolname['forward']) ? true : false
                                            ];
                                        }

                                    }

                                }

                            }
                            $tools[$key]['toolsection_children'][$keyTool]['toolsection_has_nav_child'] = $isToolNavChild;
                        }
                    }
                }

                $tools[$key]['toolsection_has_nav_child'] = $isNavChild;
            }
        } else {
            if ($appsConfig) {
                $key = $appsConfig['conf']['melisKey'];
                if ($melisCoreRights->canAccess($key)) {
                    $tools[$key] = [
                        'toolsection_id' => $appsConfig['conf']['id'] ?? $key,
                        'toolsection_name' => $appsConfig['conf']['name'] ?? $key,
                        'toolsection_meliskey' => $appsConfig['conf']['melisKey'] ?? $key,
                        'toolsection_icon' => $appsConfig['conf']['icon'] ?? 'fa-cube',
                        'toolsection_forward' => $appsConfig['forward'] ?? [],
                        'toolsection_parent_tool' => true,
                        'toolsection_is_tool' => true,
                    ];
                }
            }
        }

        $sections = $tools;

        // Reordering sections
        $toolsOrdered = [];
        foreach ($orderInterface as $orderKeySection => $sectionTools) {
            if (!empty($sections[$orderKeySection])) {
                if (empty($toolsOrdered[$orderKeySection])) {
                    $toolsOrdered[$orderKeySection] = [];
                }
                $toolsOrdered[$orderKeySection] = $tools[$orderKeySection];
                unset($toolsOrdered[$orderKeySection]['toolsection_children']);
                unset($sections[$orderKeySection]);
            }
        }
        foreach ($sections as $keyInterfaceSection => $childinterface) {
            if (empty($toolsOrdered[$keyInterfaceSection])) {
                $toolsOrdered[$keyInterfaceSection] = [];
            }
            $toolsOrdered[$keyInterfaceSection] = $tools[$keyInterfaceSection];
            unset($toolsOrdered[$keyInterfaceSection]['toolsection_children']);
        }

        // Reordering tools inside sections
        foreach ($toolsOrdered as $keySection => $toolsSection) {
            $sectionOrderInterface = [];
            if (!empty($orderInterface[$keySection])) {
                $sectionOrderInterface = $orderInterface[$keySection];
            }
            $toolsSectionOrdered = [];

            foreach ($sectionOrderInterface as $orderKey) {
                if (!empty($tools[$keySection]['toolsection_children'][$orderKey])) {
                    $toolsOrdered[$keySection]['toolsection_children'][$orderKey] = $tools[$keySection]['toolsection_children'][$orderKey];
                    unset($tools[$keySection]['toolsection_children'][$orderKey]);
                }
            }

            if (isset($tools[$keySection]['toolsection_children'])) {
                foreach ($tools[$keySection]['toolsection_children'] as $keyInterface => $childinterface) {
                    $toolsOrdered[$keySection]['toolsection_children'][$keyInterface] = $childinterface;
                }
            }
        }

        $view = new ViewModel();

        $view->tools = $toolsOrdered;
        $view->melisKey = $melisKey;

        return $view;
    }

    /**
     * Retrieves all configuration under left menu configuration
     * with an exception to those allowable left menu configurations
     *
     * @return array
     */
    private function moveToolsToOthersCategory(): array
    {
        $leftMenu = $this->getConfig()->getItem('meliscore/interface/meliscore_leftmenu/interface');
        $mergeToOthers = [];

        foreach ($leftMenu as $melisKey => $item) {
            if (!in_array($melisKey, $this->getAllowedLeftMenuConfig())) {
                $mergeToOthers[$melisKey] = $item;
            }
        }

        return $mergeToOthers;
    }

    /**
     * @return MelisCoreConfigService
     */
    private function getConfig(): MelisCoreConfigService
    {
        return $this->getServiceLocator()->get('MelisCoreConfig');
    }

    /**
     * Returns the melisKeys of the allowed left menu configuration
     * @return array
     */
    private function getAllowedLeftMenuConfig(): array
    {
        return [
            'meliscore_leftmenu_identity',
            'meliscore_leftmenu_dashboard',
            'meliscore_toolstree_section',
            'meliscms_sitetree',
            'meliscms_toolstree_section',
            'melismarketing_toolstree_section',
            'meliscommerce_toolstree_section',
            'melisothers_toolstree_section',
            'meliscustom_toolstree_section',
            'melismarketplace_toolstree_section',
            'melisdashboardplugin_section',
            'meliscore_footer',
        ];
    }

    /**
     * @return ViewModel
     */
    public function renderFirstTreeToolsAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        /** @var \MelisCore\Service\MelisCoreConfigService $melisAppConfig */
        $melisAppConfig = $this->getServiceLocator()->get('MelisCoreConfig');

        $melisKeys = $melisAppConfig->getMelisKeys();

        // Get the order list for ordering tools
        $appconfigpath = $melisKeys['meliscore_toolstree'];
        $appsConfig = $melisAppConfig->getItem($appconfigpath);
        $orderInterface = $melisAppConfig->getOrderInterfaceConfig('meliscore_toolstree');
        $tools = [];

        $sections = $tools;

        // Reordering tools inside sections
        foreach ($toolsOrdered as $keySection => $toolsSection) {
            $sectionOrderInterface = [];
            if (!empty($orderInterface[$keySection])) {
                $sectionOrderInterface = $orderInterface[$keySection];
            }
            $toolsSectionOrdered = [];


            foreach ($tools[$keySection]['toolsection_children'] as $keyInterface => $childinterface) {
                $toolsOrdered[$keySection]['toolsection_children'][$keyInterface] = $childinterface;
            }
        }

        $view = new ViewModel();
        $view->tools = $toolsOrdered;
        $view->melisKey = $melisKey;

        return $view;
    }

    /**
     * @inheritdoc
     */
    public function hasRightsAction()
    {
        // melis/MelisCore/TreeTools/hasRights
        /** @var \MelisCore\Service\MelisCoreConfigService $config */
        $config = $this->getServiceLocator()->get('MelisCoreConfig');
        /** @var \MelisCore\Service\MelisCoreRightsService $rights */
        $rights = $this->getServiceLocator()->get('MelisCoreRights');
        /** @var \MelisCore\Service\MelisCoreAuthService $user */
        $user = $this->getServiceLocator()->get('MelisCoreAuth');

//        d($rights->getToolSectionMap());
        d('can access: MelisCoreDashboardRecentUserActivityPlugin', $rights->canAccess('MelisCoreDashboardRecentUserActivityPlugin'));
        d($rights->getSectionParent('meliscore_leftmenu_root'));
//        d($config->getMelisKeyData('meliscmsblog_left_menu'));
//        d($config->getMelisKeyData('meliscms_blog_tool_section'));

        die;
    }




}
