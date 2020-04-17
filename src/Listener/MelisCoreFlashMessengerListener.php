<?php 

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2015 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Listener;

use Laminas\EventManager\EventInterface;
use Laminas\EventManager\EventManagerInterface;
use Laminas\EventManager\ListenerAggregateInterface;

class MelisCoreFlashMessengerListener extends MelisGeneralListener implements ListenerAggregateInterface
{
	
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        /**
         * Attach a listener to an event emitted by components with specific identifiers.
         *
         * @param  string $identifier Identifier for event emitting component
         * @param  string $eventName
         * @param  callable $listener Listener that will handle the event.
         * @param  int $priority Priority at which listener should execute
         *
         * $sharedEvents->attach($identifier, $eventName, callable $listener, $priority);
         */
        $identifier = 'MelisCore';

        $eventsName = [
            'meliscore_tooluser_savenew_end',
            'meliscore_tooluser_save_end',
            'meliscore_tooluser_delete_end',
            'meliscore_module_management_save_end',
            'meliscore_platform_save_end',
            'meliscore_platform_delete_end',
            'meliscore_language_new_end',
            'meliscore_language_update_end',
            'meliscore_language_delete_end',
            'meliscore_tool_bo_emails_end',
            'meliscore_save_log_type_trans',
            'meliscore_profile_save_end',
            'melis_core_platform_scheme_save_end',
            'melis_core_platform_scheme_reset_end',
            'melis_core_platform_scheme_reset_end',
            'meliscore_tooluser_resend_password_create_email_end'
        ];

        $priority = -1000;

        /**
         * Attaching Events listiners
         */
        $this->attachEventListener($events, $identifier, $eventsName, [$this, 'logMessages'], $priority);
    }
}