<?php

namespace MelisCore\Controller;

use Laminas\Validator\EmailAddress;

/**
 * Email rule of a back-office user, shared by the React user and profile endpoints.
 *
 * Same validator and options as the legacy forms (app.tools.php, usr_email of the user tool and of
 * meliscore_user_profile_form): the domain must be a valid hostname with a known TLD, so reserved
 * names (.test, .example, .invalid, .localhost, .local) are refused. Otherwise a user saved from React
 * could not be saved any more from the legacy back-office (Mantis #0011113).
 */
trait MelisReactUserEmailTrait
{
    private function isValidUserEmail(string $email): bool
    {
        $validator = new EmailAddress(['domain' => true, 'hostname' => true, 'mx' => true, 'deep' => true]);
        return $validator->isValid($email);
    }
}
