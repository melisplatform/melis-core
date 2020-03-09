<?php
namespace MelisCore\Service\Factory;

use MelisCore\Service\MelisCoreGdprAutoDeleteService;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisCoreGdprAutoDeleteServiceFactory implements FactoryInterface{

    /**
     * @param ServiceLocatorInterface $sl
     * @return MelisCoreGdprAutoDeleteService
     */
    public function createService(ServiceLocatorInterface $sl)
    {
        $melisCoreGdprService = new MelisCoreGdprAutoDeleteService(
            // inject auto delete tool service
            $sl->get('MelisCoreGdprAutoDeleteToolService'),
            // inject gdpr delete emails sent
            $sl->get('MelisGdprDeleteEmailsSent')
        );
        // set service locator
        $melisCoreGdprService->setServiceLocator($sl);

        return $melisCoreGdprService;
    }
}