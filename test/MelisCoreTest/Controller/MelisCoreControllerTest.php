<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCoreTest\Controller;

use MelisCore\ServiceManagerGrabber;
use Laminas\Test\PHPUnit\Controller\AbstractHttpControllerTestCase;
class MelisCoreControllerTest extends AbstractHttpControllerTestCase
{
    protected $traceError = false;
    protected $sm;
    protected $method = 'save';

    public function setUp()
    {
        $this->sm  = new ServiceManagerGrabber();
    }

    public function getPayload($method)
    {
        return $this->sm->getPhpUnitTool()->getPayload('MelisCore', $method);
    }

    /**
     * START ADDING YOUR TESTS HERE
     */
    public function testSendEmail()
    {
        $email = $this->sm->getServiceManager()->get('MelisCoreEmailSendingService');
        $payloads = $this->getPayload(__METHOD__);
        $test = $email->sendEmail($payloads['from_email'], $payloads['from_name'], $payloads['recipient'], $payloads['recipient_name'], null, $payloads['subject'], $payloads['message'], '');
        $this->assertNotEmpty($payloads);
    }



}

