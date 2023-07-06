<?php
return array(
    'plugins' => array(
        'microservice' => array(
            'Systemmaintenance' => [
                'SystemmaintenanceService' => [
                    'getItemById' => [
                        'attributes' => [
                            'name'	=> 'microservice_form',
                            'id'	=> 'microservice_form',
                            'method'=> 'POST',
                            'action'=> $_SERVER['REQUEST_URI'],
                        ],
                        'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                        'elements' => [
                            array(
                                'spec' => array(
                                    'name' => 'Id',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'Id',
                                    ),
                                    'attributes' => array(
                                        'id' => 'Id',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => '0',
                                        'data-type' => 'int'
                                    ),
                                ),
                            ),
                        ]
                    ],
                    'getList' => [
                        'attributes' => [
                            'name'	=> 'microservice_form',
                            'id'	=> 'microservice_form',
                            'method'=> 'POST',
                            'action'=> $_SERVER['REQUEST_URI'],
                        ],
                        'hydrator' => 'Laminas\Hydrator\ArraySerializable',
                        'elements' => [
                            array(
                                'spec' => array(
                                    'name' => 'start',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'start',
                                    ),
                                    'attributes' => array(
                                        'id' => 'start',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => '0',
                                        'data-type' => 'int'
                                    ),
                                ),
                            ),
                            array(
                                'spec' => array(
                                    'name' => 'limit',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'limit',
                                    ),
                                    'attributes' => array(
                                        'id' => 'limit',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => '0',
                                        'data-type' => 'int'
                                    ),
                                ),
                            ),
                            array(
                                'spec' => array(
                                    'name' => 'searchKeys[]',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'search keys',
                                    ),
                                    'attributes' => array(
                                        'id' => 'searchKeys',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => 'separate by comma',
                                        'data-type' => 'array',
                                    ),
                                ),
                            ),
                            array(
                                'spec' => array(
                                    'name' => 'searchValue',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'search value',
                                    ),
                                    'attributes' => array(
                                        'id' => 'searchValue',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => 'search1',
                                        'data-type' => 'string',
                                    ),
                                ),
                            ),
                            array(
                                'spec' => array(
                                    'name' => 'orderKey',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'order key',
                                    ),
                                    'attributes' => array(
                                        'id' => 'orderKey',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => 'col2',
                                        'data-type' => 'string',
                                    ),
                                ),
                            ),
                            array(
                                'spec' => array(
                                    'name' => 'order',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'order',
                                    ),
                                    'attributes' => array(
                                        'id' => 'order',
                                        'value' => '',
                                        'placeholder' => 'ASC',
                                        'data-type' => 'string',
                                    ),
                                ),
                            ),
                            array(
                                'spec' => array(
                                    'name' => 'langId',
                                    'type' => 'Text',
                                    'options' => array(
                                        'label' => 'lang id',
                                    ),
                                    'attributes' => array(
                                        'id' => 'langId',
                                        'value' => '',
                                        'class' => '',
                                        'placeholder' => '0',
                                        'data-type' => 'int'
                                    ),
                                ),
                            ),
                        ]
                    ]
                ]
            ]
            // 'MelisCore' => array(
            //     // MelisCoreLogService.php
            //     'MelisCoreLogService' => array(
            //         /**
            //          * @method getLog($logId)
            //          */
            //         'getLog' => array(
            //             'attributes' => array(
            //                 'name'   => 'microservice_form',
            //                 'id'     => 'microservice_form',
            //                 'method' => 'POST',
            //                 'action' => $_SERVER['REQUEST_URI'],
            //             ),
            //             'hydrator' => 'Laminas\Hydrator\ArraySerializable',
            //             'elements' => array(
            //                 array(
            //                     'spec' => array(
            //                         'name' => 'logId',
            //                         'type' => 'Text',
            //                         'options' => array(
            //                             'label' => 'logId',
            //                         ),
            //                         'attributes' => array(
            //                             'id' => 'logId',
            //                             'value' => '',
            //                             'class' => '',
            //                             'placeholder' => 'logId',
            //                         ),
            //                     ),
            //                 ),
            //             ),
            //             'input_filter' => array(

            //             )
            //         ),
            //         /**
            //          * @method getLogTypeTranslations($logTypeId, $langId = null)
            //          */
            //         'getLogTypeTranslations' => array(
            //             'attributes' => array(
            //                 'name'   => 'microservice_form',
            //                 'id'     => 'microservice_form',
            //                 'method' => 'POST',
            //                 'action' => $_SERVER['REQUEST_URI'],
            //             ),
            //             'hydrator' => 'Laminas\Hydrator\ArraySerializable',
            //             'elements' => array(
            //                 array(
            //                     'spec' => array(
            //                         'name' => 'logTypeId',
            //                         'type' => 'Text',
            //                         'options' => array(
            //                             'label' => 'logTypeId',
            //                         ),
            //                         'attributes' => array(
            //                             'id' => 'logTypeId',
            //                             'value' => '',
            //                             'class' => '',
            //                             'placeholder' => 'logTypeId',
            //                         ),
            //                     ),
            //                 ),
            //                 array(
            //                     'spec' => array(
            //                         'name' => 'langId',
            //                         'type' => 'Text',
            //                         'options' => array(
            //                             'label' => 'langId',
            //                         ),
            //                         'attributes' => array(
            //                             'id' => 'langId',
            //                             'value' => '',
            //                             'class' => '',
            //                             'placeholder' => 'langId',
            //                         ),
            //                     ),
            //                 ),
            //             ),
            //             'input_filter' => array(

            //             )
            //         ),
            //     ),

            //     // MelisCoreMicroServiceTestService.php
            //     'MelisCoreMicroServiceTestService' => array(
            //         /**
            //          * @method oneParam($fillMeIn)
            //          */
            //         'oneParam' => array(
            //             'attributes' => array(
            //                 'name'   => 'microservice_form',
            //                 'id'     => 'microservice_form',
            //                 'method' => 'POST',
            //                 'action' => $_SERVER['REQUEST_URI'],
            //             ),
            //             'hydrator' => 'Laminas\Hydrator\ArraySerializable',
            //             'elements' => array(
            //                 array(
            //                     'spec' => array(
            //                         'name' => 'fillMeIn',
            //                         'type' => 'Text',
            //                         'options' => array(
            //                             'label' => 'fillMeIn',
            //                         ),
            //                         'attributes' => array(
            //                             'id' => 'fillMeIn',
            //                             'value' => '',
            //                             'class' => '',
            //                             'placeholder' => 'fillMeIn',
            //                         ),
            //                     ),
            //                 ),
            //             ),
            //             'input_filter' => array(
            //                 'fillMeIn' => array(
            //                     'name'     => 'fillMeIn',
            //                     'required' => true,
            //                     'validators' => array(
            //                         array(
            //                             'name' => 'NotEmpty',
            //                             'options' => array(
            //                                 'messages' => array(
            //                                     \Laminas\Validator\NotEmpty::IS_EMPTY => 'Please enter the value of fillMeIn argument',
            //                                 ),
            //                             ),
            //                         ),
            //                     ),
            //                     'filters'  => array(
            //                         array('name' => 'StripTags'),
            //                         array('name' => 'StringTrim'),
            //                     ),
            //                 ),
            //             )
            //         ),

            //         *
            //          * @method twoParams($fillMe, $andMe)
                     
            //         'twoParams' => array(
            //             'attributes' => array(
            //                 'name'   => 'microservice_form',
            //                 'id'     => 'microservice_form',
            //                 'method' => 'POST',
            //                 'action' => $_SERVER['REQUEST_URI'],
            //             ),
            //             'hydrator' => 'Laminas\Hydrator\ArraySerializable',
            //             'elements' => array(
            //                 array(
            //                     'spec' => array(
            //                         'name' => 'fillMe',
            //                         'type' => 'Text',
            //                         'options' => array(
            //                             'label' => 'fillMe',
            //                         ),
            //                         'attributes' => array(
            //                             'id' => 'fillMe',
            //                             'value' => '',
            //                             'class' => '',
            //                             'placeholder' => 'fillMe',
            //                         ),
            //                     ),
            //                 ),
            //                 array(
            //                     'spec' => array(
            //                         'name' => 'andMe',
            //                         'type' => 'Text',
            //                         'options' => array(
            //                             'label' => 'andMe',
            //                         ),
            //                         'attributes' => array(
            //                             'id' => 'andMe',
            //                             'value' => '',
            //                             'class' => '',
            //                             'placeholder' => 'andMe',
            //                         ),
            //                     ),
            //                 ),
            //             ),
            //             'input_filter' => array(
            //                 'fillMe' => array(
            //                     'name'     => 'fillMe',
            //                     'required' => true,
            //                     'validators' => array(
            //                         array(
            //                             'name' => 'NotEmpty',
            //                             'options' => array(
            //                                 'messages' => array(
            //                                     \Laminas\Validator\NotEmpty::IS_EMPTY => 'Please enter the value of fillMe argument',
            //                                 ),
            //                             ),
            //                         ),
            //                     ),
            //                     'filters'  => array(
            //                         array('name' => 'StripTags'),
            //                         array('name' => 'StringTrim'),
            //                     ),
            //                 ),
            //                 'andMe' => array(
            //                     'name'     => 'andMe',
            //                     'required' => true,
            //                     'validators' => array(
            //                         array(
            //                             'name' => 'NotEmpty',
            //                             'options' => array(
            //                                 'messages' => array(
            //                                     \Laminas\Validator\NotEmpty::IS_EMPTY => 'Please enter the value of andMe argument',
            //                                 ),
            //                             ),
            //                         ),
            //                     ),
            //                     'filters'  => array(
            //                         array('name' => 'StripTags'),
            //                         array('name' => 'StringTrim'),
            //                     ),
            //                 ),
            //             )
            //         ),

            //         /**
            //          * @method acceptArrayParam(array $arrayParam, $normalArg)
            //          */
            //         'acceptArrayParam' => array(
            //             'attributes' => array(
            //                 'name'   => 'microservice_form',
            //                 'id'     => 'microservice_form',
            //                 'method' => 'POST',
            //                 'action' => $_SERVER['REQUEST_URI'],
            //             ),
            //             'hydrator' => 'Laminas\Hydrator\ArraySerializable',
            //             'elements' => array(
            //                 array(
            //                     'spec' => array(
            //                         'name' => 'arrayParam',
            //                         'type' => 'Text',
            //                         'options' => array(
            //                             'label' => 'arrayParam',
            //                         ),
            //                         'attributes' => array(
            //                             'id' => 'arrayParam',
            //                             'value' => '',
            //                             'class' => '',
            //                             'placeholder' => 'arrayParam',
            //                         ),
            //                     ),
            //                 ),
            //                 array(
            //                     'spec' => array(
            //                         'name' => 'normalArg',
            //                         'type' => 'Text',
            //                         'options' => array(
            //                             'label' => 'normalArg',
            //                         ),
            //                         'attributes' => array(
            //                             'id' => 'normalArg',
            //                             'value' => '',
            //                             'class' => '',
            //                             'placeholder' => 'normalArg',
            //                         ),
            //                     ),
            //                 ),
            //             ),
            //             'input_filter' => array(

            //             )
            //         )
            //     ),
            // ),
        )
    ),
);