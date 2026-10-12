<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

class MelisCoreAnnouncementService extends MelisGeneralService
{
    /**
     * Returns the Melis Core Announcement table
     * @return array|object
     */
    private function announcementTable()
    {
        return $this->getServiceManager()->get('MelisAnnouncementTable');
    }

    /**
     * @param null $status
     * @param string $searchValue
     * @param array $searchKeys
     * @param null $start
     * @param null $limit
     * @param string $orderColumn
     * @param string $order
     * @param bool $count
     * @return mixed
     */
    public function getLists($status = null, $searchValue = '', $searchKeys = [], $start = null, $limit = null, $orderColumn = 'mca_id', $order = 'DESC', $count = false)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('melis_core_announcement_get_lists_start', $arrayParameters);

        $results = $this->announcementTable()->getLists(
            $arrayParameters['status'],
            $arrayParameters['searchValue'],
            $arrayParameters['searchKeys'],
            $arrayParameters['start'],
            $arrayParameters['limit'],
            $arrayParameters['orderColumn'],
            $arrayParameters['order'],
            $arrayParameters['count']
        );

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $results;
        $arrayParameters = $this->sendEvent('melis_core_announcement_get_lists_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * @param $data
     * @param null $id
     * @return mixed
     */
    public function saveAnnouncement($data, $id = null)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        $arrayParameters = $this->sendEvent('melis_core_announcement_save_start', $arrayParameters);
        $results = $this->announcementTable()->save($arrayParameters['data'], $arrayParameters['id']);

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $results;
        $arrayParameters = $this->sendEvent('melis_core_announcement_save_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * @param $id
     * @return mixed
     */
    public function deleteAnnouncement($id)
    {
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $results = null;

        $arrayParameters = $this->sendEvent('melis_core_announcement_delete_start', $arrayParameters);

        $results = $this->announcementTable()->deleteById($arrayParameters['id']);

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $results;
        $arrayParameters = $this->sendEvent('melis_core_announcement_delete_end', $arrayParameters);

        return $arrayParameters['results'];
    }
}