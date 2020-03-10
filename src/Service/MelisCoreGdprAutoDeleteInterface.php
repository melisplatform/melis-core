<?php
	
namespace MelisCore\Service;

interface MelisCoreGdprAutoDeleteInterface
{
    /**
     * Return the list of tags available for a module to insert in emails
     * @return mixed
     */
    public function getListOfTags();
    /**
     * Return the list of users that are concerned with the auto-delete at this moment
     * @param array $params - pass parameters because some other modules have different logic in getting warning list of users
     * @return mixed
     */
    public function getWarningListOfUsers(array $params);
    /**
     * Return the list of users that are concerned with the auto-delete at this moment
     * @param array $params - pass parameters because some other modules have different logic in getting  second warning list of users
     * @return mixed
     */
    public function getSecondWarningListOfUsers(array $params);

    /**
     * Return a user (its TAGS) if found in a module
     * @param $validationKey
     * @return mixed
     */
    public function getUserPerValidationKey($validationKey);

    /**
     * Update the GDPR status of user
     * @param $validationKey
     * @return mixed
     */
    public function updateGdprUserStatus($validationKey);

    /**
     * Removal of users who have missed the deadline, returns the list of users deleted with their tags
     * @return mixed
     */
    public function removeOldUnvalidatedUsers();
}