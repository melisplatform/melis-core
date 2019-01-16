<?php
namespace MelisCore\Controller;

interface MelisSetupInterface
{
    /**
     * This action returns the form view of the setup
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function setupFormAction();

    /**
     * This action returns the status of the form validation
     *
     * @return \Zend\View\Model\JsonModel
     */
    public function setupValidateDataAction();

    /**
     * This action executes the submitted data, depending on what execution is being done
     * inside this action, it's either storing the data in the database table or
     * creating a configuration file, or etc.
     *
     * @return \Zend\View\Model\JsonModel
     */
    public function setupResultAction();
}
