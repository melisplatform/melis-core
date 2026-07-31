<?php
return array(
    'plugins' => array(
        'microservice' => array(
            'MelisCore' => array(

                // MelisCoreAnnouncementService.php
                'MelisCoreAnnouncementService' => array(
                    '_description' => 'tr_meliscore_ws_desc_announcement',

                    /**
                     * @method getLists($status = null, $searchValue = '')
                     * Lists back-office dashboard announcements. Both parameters are optional:
                     * leave them empty to return every announcement. Only the two leading scalar
                     * parameters are exposed (the method's 3rd argument is an array and is left to
                     * its default). READ — no side effect.
                     */
                    'getLists' => array(
                        'attributes' => array(
                            'name'   => 'microservice_form',
                            'id'     => 'microservice_form',
                            'method' => 'POST',
                            'action' => $_SERVER['REQUEST_URI'],
                        ),
                        'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                        'elements' => array(
                            array(
                                'spec' => array(
                                    'name' => 'status',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'status',
                                    ),
                                    'attributes' => array(
                                        'id' => 'status',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => 'status (0/1, optional)',
                                        'data-type' => 'int',
                                    ),
                                ),
                            ),
                            array(
                                'spec' => array(
                                    'name' => 'searchValue',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'searchValue',
                                    ),
                                    'attributes' => array(
                                        'id' => 'searchValue',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => 'searchValue (optional)',
                                        'data-type' => 'string',
                                    ),
                                ),
                            ),
                        ),
                        'input_filter' => array(
                            'status' => array(
                                'name'     => 'status',
                                'required' => false,
                                'filters'  => array(
                                    array('name' => 'StripTags'),
                                    array('name' => 'StringTrim'),
                                ),
                            ),
                            'searchValue' => array(
                                'name'     => 'searchValue',
                                'required' => false,
                                'filters'  => array(
                                    array('name' => 'StripTags'),
                                    array('name' => 'StringTrim'),
                                ),
                            ),
                        ),
                    ),

                ),
            ),
        )
    ),
);
