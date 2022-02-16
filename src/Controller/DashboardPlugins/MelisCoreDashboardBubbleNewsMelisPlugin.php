<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use Laminas\Session\Container;
use Laminas\View\Model\JsonModel;
use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Laminas\View\Model\ViewModel;

class MelisCoreDashboardBubbleNewsMelisPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public const DASHBOARD_CONFIG = '/meliscore/interface/melis_dashboardplugin/interface/melisdashboardplugin_section';
    public const NUM_OF_NEWS = 6;

    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }

    /**
     * Renders the news melis bubble plugin
     * @return \Laminas\View\Model\ViewModel
     */
    public function newsmelis()
    {
        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/bubble-news-melis');
        return $view;
    }

    public function getNews() {
        $data = [];
        $countOfNews = 0;
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];
        $dateFormat = 'm-d-Y';

        if ($locale === 'fr_FR')
            $dateFormat = 'd-m-Y';

        // get url for api in config
        $config = $this->getServiceManager()->get('MelisCoreConfig');
        $dashboardPlugins = $config->getItem(self::DASHBOARD_CONFIG);
        $newsMelisConfig = $dashboardPlugins['interface']['MelisCoreDashboardBubbleNewsMelisPlugin'];
        $url = $newsMelisConfig['datas']['url'];

        // get news list
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $newsMelisConfig['datas']['filter']);
        curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $response = json_decode(curl_exec($curl), true);
        curl_close($curl);

        if (! empty($response)) {
            $response = $response['response'];
            $countOfNews = count($response);
            $count = count($response);
            // we will only display a number of news and not all
            $data = array_splice($response, 0, self::NUM_OF_NEWS);

            // add formated date to data
            foreach ($data as &$news) {
                $news['newsDateFormated'] = date(
                    $dateFormat,
                    strtotime(
                        ($news['cnews_publish_date']) ? $news['cnews_publish_date'] : $news['cnews_creation_date']
                    )
                );
            }
        }

        return new JsonModel([
            'data' => $data,
            'count' => $countOfNews
        ]);
    }
}