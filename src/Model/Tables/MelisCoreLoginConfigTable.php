<?php

namespace MelisCore\Model\Tables;

/**
 * Login / password policy saved by the "Other config" tool (key/value, one row per setting).
 * Replaces the former config/app.login.php file, which was lost whenever a server pod was
 * recreated. Read through MelisPasswordSettingsService::getLoginSettings().
 * Wired by MelisAbstractFactory (alias in melis-core/config/module.config.php → service_manager).
 */
class MelisCoreLoginConfigTable extends MelisGenericTable
{
    const TABLE = 'melis_core_login_config';
    const PRIMARY_KEY = 'lcfg_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
}
