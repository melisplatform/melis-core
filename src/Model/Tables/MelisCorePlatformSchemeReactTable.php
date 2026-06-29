<?php

namespace MelisCore\Model\Tables;

/**
 * Table du thème du back-office REACT (clé/valeur), séparée du legacy
 * `melis_core_platform_scheme`. Auto-câblée par MelisAbstractFactory
 * (alias dans melis-core/config/module.config.php → service_manager).
 */
class MelisCorePlatformSchemeReactTable extends MelisGenericTable
{
    const TABLE = 'melis_core_platform_scheme_react';
    const PRIMARY_KEY = 'psreact_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
}
