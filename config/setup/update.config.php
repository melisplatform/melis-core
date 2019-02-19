<?php

namespace MelisCore;

use MelisMarketPlace\Support\MelisMarketPlace as MarketPlace;
use MelisMarketPlace\Support\MelisMarketPlaceCmsTables as Melis;
use MelisMarketPlace\Support\MelisMarketPlaceSiteInstall as Site;

return [
    'plugins' => [
        __NAMESPACE__ => [
            MarketPlace::UPDATE => [

            ]
        ]
    ],
];
