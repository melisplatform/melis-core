<?php
	
namespace MelisCore\Service;

interface MelisCoreGdprAutoDeleteInterface
{
    /**
     * Return the list of tags available for a module to insert in emails
     *
     * @return mixed
     */
    public function getListOfTags();
    /**
     * Return the list of users that are concerned with the auto-delete at this moment
     * @return mixed
     */
    public function getWarningListOfUsers();
    /**
     * Return the list of users that are concerned with the auto-delete at this moment
     *
     * @return mixed
     */
    public function getSecondWarningListOfUsers();

    /**
     * Return a user (its TAGS) if found in a module
     *
     * @param $validationKey
     * @return mixed
     */
    public function getUserPerValidationKey($validationKey);

    /**
     * Update the GDPR status of user
     *
     * @param $validationKey
     * @return mixed
     */
    public function updateGdprUserStatus($validationKey);

    /**
     * @return mixed
     */
    public function getDeleteListOfUsers();

    /**
     * Removal of users who have missed the deadline, returns the list of users deleted with their tags
     *
     * @param $autoDeleteConfig
     * @return mixed
     */
    public function removeOldUnvalidatedUsers($autoDeleteConfig);

}