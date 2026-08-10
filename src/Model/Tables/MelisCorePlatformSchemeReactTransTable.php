<?php

namespace MelisCore\Model\Tables;

/**
 * Traductions des textes du thème BO React (titre/sous-titre du login) par langue.
 * Auto-câblée par MelisAbstractFactory (alias dans melis-core/config/module.config.php).
 */
class MelisCorePlatformSchemeReactTransTable extends MelisGenericTable
{
    const TABLE = 'melis_core_platform_scheme_react_trans';
    const PRIMARY_KEY = 'psrtrans_id';

    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
}
