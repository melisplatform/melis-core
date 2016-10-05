<?php

namespace MelisCore\Service;

interface MelisCoreTranslationServiceInterface
{
    public function getTranslationMessages($locale, $textDomain = 'default');
}