<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

use MelisCore\Service\MelisCoreGeneralService;
use MelisCore\Entity\MelisCorePlatformScheme;
/**
 *
 * This service provides data in getting the platform colors and images.
 *
 */
class MelisCorePlatformSchemeService extends MelisCoreGeneralService
{
    /**
     * Returns the Melis Core Platform Scheme table
     * @return array|object
     */
    private function schemeTable()
    {
        return $this->getServiceManager()->get('MelisCorePlatformSchemeTable');
    }

    /**
     * Returns the currently active scheme, if there's none active
     * it returns the Melis default scheme
     * @param bool $colorsOnly : true|false - if true it returns only the colors that will be used in the platform
     * @return MelisCorePlatformScheme|null
     */
    public function getCurrentScheme($colorsOnly = false)
    {

        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $results         = null;

        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_package_scheme_get_current_scheme_start', $arrayParameters);

        $table = $this->schemeTable();

        $schemeData = $table->getActiveScheme($colorsOnly)->current();

        if(!$schemeData) {
            $schemeData = $table->getDefaultScheme($colorsOnly)->current();
        }

        // check if scheme has data
        if($schemeData) {

            $entScheme = new MelisCorePlatformScheme();

            $entScheme->setId($schemeData->pscheme_id);
            $entScheme->setName($schemeData->pscheme_name);
            $entScheme->setColors($schemeData->pscheme_colors);

            if(!$colorsOnly) {
                $entScheme->setSidebarHeaderLogo($schemeData->pscheme_sidebar_header_logo);
                $entScheme->setSidebarHeaderText($schemeData->pscheme_sidebar_header_text);
                $entScheme->setLoginLogo($schemeData->pscheme_login_logo);
                $entScheme->setLoginBackground($schemeData->pscheme_login_background);
                $entScheme->setFavicon($schemeData->pscheme_favicon);
            }

            $entScheme->setIsActive($schemeData->pscheme_is_active);

            $results = $entScheme;
        }

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $results;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_package_scheme_get_current_scheme_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Handles the saving of the platform scheme
     * @param $data
     * @param $id
     * @param bool $setAsActive
     * @return mixed
     */
    public function saveScheme($data, $id, $setAsActive = false)
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $results = false;

        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_package_scheme_save_start', $arrayParameters);

        $data        = $arrayParameters['data'];
        $id          = (int)  $arrayParameters['id'];
        $setAsActive = (bool) $arrayParameters['setAsActive'];

        $success     = $this->schemeTable()->save(array_merge($data, array('pscheme_is_active' => $setAsActive)), $id);

        if($success) {
            $results = true;
        }

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $results;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_package_scheme_save_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Handles the event for resetting the whole scheme of the selected template
     * @param $id
     * @return mixed
     */
    public function resetScheme($id)
    {
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $results = false;

        // Sending service start event
        $arrayParameters = $this->sendEvent('melis_core_package_scheme_reset_start', $arrayParameters);
        $defaultSchemeData = $this->schemeTable()->getDefaultScheme()->current();

        if($defaultSchemeData) {
            $data = array(
                'pscheme_colors' =>  $defaultSchemeData->pscheme_colors,
                'pscheme_sidebar_header_logo' =>  $defaultSchemeData->pscheme_sidebar_header_logo,
                'pscheme_sidebar_header_text' =>  $defaultSchemeData->pscheme_sidebar_header_text,
                'pscheme_login_logo' =>  $defaultSchemeData->pscheme_login_logo,
                'pscheme_login_background' =>  $defaultSchemeData->pscheme_login_background,
                'pscheme_favicon' =>  $defaultSchemeData->pscheme_favicon,
                'pscheme_is_active' =>  1,

            );

            $success = $this->schemeTable()->save($data, $id);
            if($success) {
                $results = true;
            }
        }

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $results;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melis_core_package_scheme_reset_end', $arrayParameters);

        return $arrayParameters['results'];
    }

}