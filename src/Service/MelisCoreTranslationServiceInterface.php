<?php

namespace MelisCore\Service;

interface MelisCoreTranslationServiceInterface
{
    public function getTranslationMessages($locale, $textDomain = 'default');

    /**
     * Session-independent translation catalogue of one locale, built from the modules' language
     * files alone (see the implementation for the rules). Used by the public /melis/get-translations
     * route so its output never depends on the caller's session (DEKRA audit action #19).
     */
    public function getTranslationMessagesForLocale(string $locale, string $fallbackLocale = 'en_EN'): array;
}