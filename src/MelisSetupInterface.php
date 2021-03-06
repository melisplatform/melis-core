<?php
namespace MelisCore;

interface MelisSetupInterface
{
    /**
     * This action returns the form view of the setup
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function getFormAction();

    /**
     * This action returns the status of the form validation
     *
     * @return \Laminas\View\Model\JsonModel
     */
    public function validateFormAction();

    /**
     * This action executes the submitted data, depending on what execution is being done
     * inside this action, it's either storing the data in the database table or
     * creating a configuration file, or etc.
     *
     * @return \Laminas\View\Model\JsonModel
     */
    public function submitAction();
}
