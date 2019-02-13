<?php

namespace MelisCore;

use MelisMarketPlace\Support\MelisMarketPlace as MarketPlace;

return [
    'plugins' => [
        __NAMESPACE__ => [
            'setup' => [
                Site::CONFIG => [
                    'id' => 'id_' . __NAMESPACE__
                ],
                MarketPlace::FORM => [
                ]
            ]
        ]
    ],

];
