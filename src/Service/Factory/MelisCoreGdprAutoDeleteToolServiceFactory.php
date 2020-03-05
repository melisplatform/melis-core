<?php

namespace MelisCore\Service\Factory;

use MelisCore\Model\Tables\MelisGdprDeleteConfigTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsLogsTable;
use MelisCore\Model\Tables\MelisGdprDeleteEmailsTable;
use MelisCore\Service\MelisCoreGdprAutoDeleteToolService;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisCoreGdprAutoDeleteToolServiceFactory implements FactoryInterface{

    /**
     * @param ServiceLocatorInterface $sl
     * @return MelisCoreGdprAutoDeleteToolService
     */
    public function createService(ServiceLocatorInterface $sl)
    {
        /** @var MelisGdprDeleteConfigTable $gdprDeleteConfigTbl */
        $gdprDeleteConfigTbl = $sl->get('MelisGdprDeleteConfigTable');
        /** @var MelisGdprDeleteEmailsTable $gdprDeleteEmailsTbl */
        $gdprDeleteEmailsTbl = $sl->get('MelisGdprDeleteEmailsTable');
        /** @var MelisGdprDeleteEmailsLogsTable $gdprDeleteEmailsLogTbl */
        $gdprDeleteEmailsLogTbl = $sl->get('MelisGdprDeleteEmailsLogsTable');

        /*
        * inject melis gdpr delete config table
        * inject melis gdpr delete emails logs table
        */
        $melisCoreGdprService = new MelisCoreGdprAutoDeleteToolService($gdprDeleteConfigTbl, $gdprDeleteEmailsLogTbl, $gdprDeleteEmailsTbl);
        // set service locator
        $melisCoreGdprService->setServiceLocator($sl);

        return $melisCoreGdprService;
    }
}