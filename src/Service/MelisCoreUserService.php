<?php

namespace MelisCore\Service;

class MelisCoreUserService extends MelisServiceManager implements MelisCoreUserServiceInterface
{
    public function getUserXmlRights($userId = null)
    {
        $rightsXML = '';

        if (!empty($userId)) {
            $tableUser = $this->getServiceManager()->get('MelisCoreTableUser');
            $user = $tableUser->getEntryById($userId);
            if ($user) {
                $user = $user->current();
                if (!empty($user)) {
                    if ($user->usr_role_id != self::ROLE_ID_CUSTOM) {
                        // Get rights from Role table
                        $tableUserRole = $this->getServiceManager()->get('MelisCoreTableUserRole');
                        $datasRole = $tableUserRole->getEntryById($user->usr_role_id);
                        if ($datasRole) {
                            $datasRole = $datasRole->current();
                            if (!empty($datasRole)) {
                                $rightsXML = $datasRole->urole_rights;
                            }
                        }
                    } else {
                        $rightsXML = $user->usr_rights;
                    }
                }
            }
        }


        return $rightsXML;
    }

    public function isItemRightChecked($xmlRights, $sectionId, $itemId)
    {
        /** @var \MelisCore\Service\MelisCoreRightsService $rightService */
        $rightService = $this->getServiceManager()->get('MelisCoreRights');
        $rightsObj = simplexml_load_string(trim($xmlRights));

        if (empty($rightsObj)) {
            return false;
        }

        if (!empty($rightsObj->$sectionId)) {
            if ($rightService::MELIS_PLATFORM_TOOLS_PREFIX === $sectionId) {
                // for general business app
                if (isset($rightsObj->$sectionId->id)) {
                    foreach ($rightsObj->$sectionId->id as $item) {

                        if ($item == $itemId) {
                            return true;
                        }
                    }
                }

                foreach ($rightService->getMelisKeyPaths() as $toolSection) {
                    if (isset($rightsObj->$sectionId->$toolSection)) {
                        foreach ($rightsObj->$sectionId->$toolSection->id as $item) {
                            $itemId = in_array($itemId, $rightService->getMelisKeyPaths()) ? $itemId . '_root' : $itemId;
                            if (trim($item) == $itemId) {
                                return true;
                            }
                        }
                    }


                    // for those tools that doesn't have a proper parent tool section
                    if (isset($rightsObj->$sectionId->$toolSection->noparent)) {
                        foreach ($rightsObj->$sectionId->$toolSection->noparent as $item) {
                            if ($item == $itemId) {
                                return true;
                            }
                        }
                    }

                }
            } else {
                foreach ($rightsObj->$sectionId->id as $itemIdXml) {
                    if ($itemIdXml == $itemId) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public function getUserSessionTime($userId, $lastLoginDate, $displayMinimal = true, $hasAgoWord = false)
    {
        $table = $this->getServiceManager()->get('MelisUserConnectionDate');
        $data = $table->getUserConnectionData((int) $userId, $lastLoginDate)->current();
        $translator = $this->getServiceManager()->get('translator');

        if (!empty($data)) {
            $lastLoginDate = new \DateTime($data->usrcd_last_login_date);
            $connectionTime = new \DateTime($data->usrcd_last_connection_time);

            $diff = (array)$lastLoginDate->diff($connectionTime);

            $diff['w'] = floor($diff['d'] / 7);
            $diff['d'] -= $diff['w'] * 7;

            $ago = $translator->translate('tr_meliscore_date_ago');
            $now = $translator->translate('tr_meliscore_date_just_now');

            $output = [
                'y' => $translator->translate('tr_meliscore_date_year'),
                'm' => $translator->translate('tr_meliscore_date_month'),
                'w' => $translator->translate('tr_meliscore_date_week'),
                'd' => $translator->translate('tr_meliscore_date_day'),


                'h' => $translator->translate('tr_meliscore_date_hour'),
                'i' => $translator->translate('tr_meliscore_date_minute'),
                's' => $translator->translate('tr_meliscore_date_second'),
            ];

            foreach ($output as $k => &$v) {
                if ($diff[$k]) {
                    $v = $diff[$k] . $v . ($diff[$k] > 1 ? '' : '');
                } else {
                    unset($output[$k]);
                }
            }

            if ($displayMinimal) {
                $output = array_slice($output, 0, 1);
            }

            if (!$hasAgoWord) {
                $ago = null;
            }

            return $output ? implode(' ', $output) . ' ' . $ago : $now;
        }

        return null;
    }

    public function getUserConnectionData($userId, $lastLoginDate = null, $search = '', $searchableColumns = [], $orderBy = '', $orderDirection = 'ASC', $start = 0, $limit = null)
    {
        $table = $this->getServiceManager()->get('MelisUserConnectionDate');
        $data = $table->getUserConnectionData($userId, $lastLoginDate, $search, $searchableColumns, $orderBy, $orderDirection, $start, $limit);

        return $data;
    }

    public function getUserLastLoggedInDate($userId)
    {
        $table = $this->getServiceManager()->get('MelisCoreTableUser');
        $data = $table->getLastLoggedInDate($userId)->toArray();

        return $data[0]['usr_last_login_date'];
    }
}
