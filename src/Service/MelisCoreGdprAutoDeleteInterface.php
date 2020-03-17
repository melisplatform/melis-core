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
     * list of users that are for deletion
     *
     * @return mixed
     */
    public function getForDeleteListOfUsers();

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
     * Removal of users who have missed the deadline, returns the list of users deleted with their tags
     *
     * @return mixed
     */
    public function removeOldUnvalidatedUsers();
}