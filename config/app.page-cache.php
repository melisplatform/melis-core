<?php

/**
 * Melis Technology (http://www.melistechnology.com]
 *
 * @copyright Copyright (c] 2015 Melis Technology (http://www.melistechnology.com]
 *
 */

return [
    'maintenance-mode' => [
        /**
         * This config used to remove/clear page cache from Zend Server 
         * the zend API used to remove/clear is page_cache_remove_cached_contents_by_rule
         * this executed upon activating maintenance mode of the site
         * https://help.zend.com/zend/current/content/zendserverapi/zend_page_cache-php_api.htm
         */
        'zend-server' => [
            'page-cache-rules' => [
                // List of Rules Name
                // Note: Specify here the exact name of the Rule
            ]
        ]
    ]
];