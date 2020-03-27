<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Form\Factory;

use Laminas\ServiceManager\ServiceManager;
use MelisCore\Form\Factory\MelisSelectFactory;

/**
 * This class creates a select box for melis languages
 */
class LanguageSelectFactory extends MelisSelectFactory
{
	protected function loadValueOptions(ServiceManager $serviceManager)
	{
		$tableLang = $serviceManager->get('MelisCoreTableLang');
		$languages = $tableLang->fetchAll();
		
		$valueoptions = [];
		foreach ($languages As $lang)
            $valueoptions[$lang->lang_id] = $lang->lang_name;
		
		return $valueoptions;
	}
}