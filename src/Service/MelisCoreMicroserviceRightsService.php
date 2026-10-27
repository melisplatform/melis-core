<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

/**
 * Droits d'accès par microservice (section « API / microservices » de l'éditeur de droits React).
 *
 * SECURITY (audit C4) : historiquement, une clé API active ouvrait TOUTE la surface microservice
 * de la plateforme, sans aucun lien avec les droits de l'utilisateur porteur. Cette classe ajoute
 * un droit d'accès par service, stocké dans `usr_rights` :
 *
 *   <meliscore_microservice>
 *       <id>MelisCms/MelisCmsSiteService</id>
 *   </meliscore_microservice>
 *
 * - ALLOW-LIST, default-DENY : seuls les services explicitement activés sont accessibles ;
 *   section absente = aucun accès (sauf usr_admin=1, bypass géré par l'appelant). Même
 *   sémantique que la allow-list d'outils `meliscore_leftmenu`.
 * - Clé de droit = `Module/Service` — le périmètre que déclarent les modules dans leur
 *   `app.microservice.php`. Les modules n'ont RIEN d'autre à déclarer : le catalogue est énuméré
 *   depuis la config fusionnée, c'est le core qui gère tout (pas de capabilities, un seul droit).
 * - Édition côté BO React uniquement ; le legacy transporte la section sans la lire
 *   (préservée au save legacy par MelisReactApiCapabilityPreserveUserListener).
 *
 * Classe utilitaire statique, comme MelisReactApi\Service\Capabilities (le modèle imité).
 */
class MelisCoreMicroserviceRightsService
{
    /** Tag de la section dans le XML usr_rights / urole_rights. */
    public const SECTION = 'meliscore_microservice';

    /**
     * Catalogue des microservices déclarés, groupés par module — énuméré depuis la config
     * fusionnée (`plugins/microservice`), dans l'ordre de merge des modules.
     *
     * @param array $config la config applicative fusionnée (service 'config')
     * @return array [['module' => 'MelisCore', 'services' => [
     *                   ['key' => 'MelisCore/MelisCoreAnnouncementService',
     *                    'name' => 'MelisCoreAnnouncementService',
     *                    'description' => 'tr_meliscore_ws_desc_announcement',
     *                    'methods' => ['getLists', …]], …]], …]
     */
    public static function listCatalog(array $config): array
    {
        $declared = $config['plugins']['microservice'] ?? [];
        $out = [];

        foreach ($declared as $module => $services) {
            if (!is_array($services) || $module === 'conf') {
                continue;
            }
            $items = [];
            foreach ($services as $serviceName => $serviceDef) {
                if (!is_array($serviceDef)) {
                    continue;
                }
                $methods = [];
                foreach ($serviceDef as $methodName => $methodDef) {
                    // Les clés préfixées '_' sont des métadonnées (_description), pas des méthodes.
                    if (is_string($methodName) && $methodName !== '' && $methodName[0] !== '_') {
                        $methods[] = $methodName;
                    }
                }
                $items[] = [
                    'key'         => $module . '/' . $serviceName,
                    'name'        => (string) $serviceName,
                    'description' => (string) ($serviceDef['_description'] ?? ''),
                    'methods'     => $methods,
                ];
            }
            if ($items) {
                $out[] = ['module' => (string) $module, 'services' => $items];
            }
        }

        return $out;
    }

    /** Clés `Module/Service` explicitement activées dans un XML de droits. */
    public static function allowedFor(?string $rightsXml): array
    {
        if (empty($rightsXml)) {
            return [];
        }
        $obj = @simplexml_load_string(trim($rightsXml));
        if ($obj === false || !isset($obj->{self::SECTION})) {
            return [];
        }
        $allowed = [];
        foreach ($obj->{self::SECTION}->id as $id) {
            $key = trim((string) $id);
            if ($key !== '') {
                $allowed[] = $key;
            }
        }
        return $allowed;
    }

    /**
     * Le porteur de ces droits peut-il appeler ce microservice ?
     * Default-DENY : seuls les services explicitement listés sont permis
     * (section absente ou XML vide = aucun accès).
     */
    public static function isAllowed(?string $rightsXml, string $module, string $service): bool
    {
        return in_array($module . '/' . $service, self::allowedFor($rightsXml), true);
    }

    /**
     * Extrait le bloc `<meliscore_microservice>…</meliscore_microservice>` d'un XML de droits
     * (chaîne brute), pour le préserver à la sauvegarde legacy. '' si absent/vide.
     * Même extraction textuelle que Capabilities::extractSection — le legacy transporte la
     * section telle quelle, octet pour octet.
     */
    public static function extractSection(string $rightsXml): string
    {
        if ($rightsXml === '') {
            return '';
        }
        $start = strpos($rightsXml, '<' . self::SECTION);
        if ($start === false) {
            return '';
        }
        $closeTag = '</' . self::SECTION . '>';
        $end = strpos($rightsXml, $closeTag, $start);
        if ($end === false) {
            return ''; // section vide/auto-fermante : rien d'utile à préserver
        }
        return substr($rightsXml, $start, $end - $start + strlen($closeTag));
    }
}
