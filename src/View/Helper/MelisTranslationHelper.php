<?php

namespace MelisCore\View\Helper;

use Zend\View\Helper\AbstractHelper;
use MelisCore\Library\MelisAppConfig;

class MelisTranslationHelper extends AbstractHelper
{
	public $serviceManager;

	public function __construct($sm)
	{
		$this->serviceManager = $sm;
	}
	
	public function __invoke($translationKey, $locale = "en_EN")
	{
	    // melis translation view helper
        $melisTrans = $this->serviceManager->get('MelisCoreTranslation');
        // get all melis translations
        $translations = $melisTrans->getTranslatedMessageByLocale($locale);

        // get the translation
        return $translations[$translationKey] ?? $translationKey;
	}
}