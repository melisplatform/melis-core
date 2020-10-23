<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Controller\DashboardPlugins;

use Laminas\View\Model\JsonModel;
use MelisCore\Controller\DashboardPlugins\MelisCoreDashboardTemplatingPlugin;
use Laminas\View\Model\ViewModel;

class MelisCoreDashboardBubbleNewsMelisPlugin extends MelisCoreDashboardTemplatingPlugin
{
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

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, 'https://www.melistechnology.com/melis/api/hVrGO7mB9fhkTGfC/MelisCmsNews/service/MelisCmsNewsService/getNewsList');
        curl_setopt($curl, CURLOPT_POSTFIELDS, [
            'start' => 0
        ]);
        curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        $response = json_decode(curl_exec($curl), true)['response'];
        curl_close($curl);

        if (! empty($response)) {
            $countOfNews = count($response);
            $response = array_reverse($response);

            $count = count($response);
            $data = array_splice($response, 0, self::NUM_OF_NEWS);

            foreach ($data as &$news) {
                $news['newsDateFormated'] = date('d M Y', strtotime(($news['cnews_publish_date']) ? $news['cnews_publish_date'] : $news['cnews_creation_date']));
            }
        }

        return new JsonModel([
            'data' => $data,
            'count' => $countOfNews
        ]);
    }
}