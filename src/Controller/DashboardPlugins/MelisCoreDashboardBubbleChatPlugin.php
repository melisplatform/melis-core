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

class MelisCoreDashboardBubbleChatPlugin extends MelisCoreDashboardTemplatingPlugin
{
    public function __construct()
    {
        $this->pluginModule = 'meliscore';
        parent::__construct();
    }

    /**
     * Renders the news melis bubble plugin
     * @return \Laminas\View\Model\ViewModel
     */
    public function chat()
    {
        $view = new ViewModel();
        $view->setTemplate('melis-core/dashboard-plugin/bubble-chat');
        return $view;
    }

    public function getMessages()
    {
        $convoCounter = 0;
        $tempUsers = [];
        $messages = [];

        if ($this->getServiceManager()->has('MelisMessengerService')) {

            // get messages
            $msgService = $this->getServiceManager()->get('MelisMessengerService');
            $messages = $msgService->getNewMessage($this->getCurrentUserId());

            foreach ($messages as $key => $val) {
                // get conversation counter by unique users
                if (!in_array($val['msgr_msg_cont_sender_id'], $tempUsers)) {
                    $convoCounter++;
                    $tempUsers[] = $val['msgr_msg_cont_sender_id'];
                }

                $messages[$key]['usr_image'] = $this->getUserImage($messages[$key]['usr_image']);
                $messages[$key]['msgr_msg_cont_date'] = date('d M', strtotime($messages[$key]['msgr_msg_cont_date']));
            }

            $tempUsers = [];
            $tempMessages = $messages;
            $messages = [];

            // only get the latest message foreach unique user
            foreach ($tempMessages as $message) {
                if (!in_array($message['msgr_msg_cont_sender_id'], $tempUsers)) {
                    $messages[] = $message;
                    $tempUsers[] = $message['msgr_msg_cont_sender_id'];
                }
            }
        }

        return new JsonModel([
            'data' => $messages,
            'count' => $convoCounter
        ]);
    }

    private function getCurrentUserId()
    {
        $userId = null;
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');

        if ($melisCoreAuth->hasIdentity()) {
            $userAuthDatas =  $melisCoreAuth->getStorage()->read();
            $userId = (int) $userAuthDatas->usr_id;
        }

        return $userId;
    }

    private function getUserImage($img)
    {
        if (! empty($img)) {
            return "data:image/jpeg;base64,".base64_encode($img);
        } else {
            return "/MelisCore/images/profile/default_picture.jpg";
        }
    }
}