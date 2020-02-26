<?php
	
namespace MelisCore\Service;

interface MelisCoreGdprAutoDeleteInterface
{
    // Return the list of tags available for a module to insert in emails
    public function getListOfTags();

    // Return the list of users that are concerned with the auto-delete at this moment
    public function getWarningListOfUsers();

    // Return the list of users that are concerned with the auto-delete at this moment
    public function getWarning2ListOfUsers();

    // Return a user (its TAGS) if found in a module
    public function getUserPerValidationKey($validationKey);

    // Update the GDPR status of user
    public function updateGdprUserStatus($validationKey);

    // Removal of users who have missed the deadline, returns the list of users deleted with their tags
    public function removeOldUnvalidatedUsers();
}