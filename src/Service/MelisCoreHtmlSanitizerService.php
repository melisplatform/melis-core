<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

/**
 * SECURITY: assainisseur de HTML riche saisi dans le back-office (annonces,
 * messages… tout contenu TinyMCE réaffiché chez un AUTRE utilisateur).
 *
 * Doctrine ALLOWLIST, jamais blacklist : le HTML est reconstruit via DOM —
 * seuls les éléments et attributs listés survivent, tout le reste (balises
 * script/iframe…, attributs on*, URL javascript:) disparaît silencieusement.
 * À utiliser aux deux bouts : à la sauvegarde (données neuves propres) ET au
 * rendu (données historiques déjà stockées).
 *
 * Volontairement sans état ni dépendance : `(new ...)->sanitize($html)` ou via
 * le service manager (`MelisCoreHtmlSanitizer`).
 */
class MelisCoreHtmlSanitizerService
{
    /** Éléments conservés (vocabulaire TinyMCE courant). Tout autre élément est déballé (ses enfants survivent). */
    private const ALLOWED_TAGS = [
        'p', 'br', 'hr', 'div', 'span',
        'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup', 'small', 'mark',
        'a', 'img',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'pre', 'code',
        'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
        'figure', 'figcaption',
    ];

    /** Éléments supprimés AVEC leur contenu (déballer un <script> en texte serait pire). */
    private const DROPPED_TAGS = [
        'script', 'style', 'noscript', 'template', 'iframe', 'frame', 'frameset',
        'object', 'embed', 'applet', 'form', 'input', 'select', 'option', 'textarea',
        'button', 'link', 'meta', 'base', 'head', 'title', 'svg', 'math', 'slot',
    ];

    /** Attributs conservés, par élément ('*' = tous les éléments autorisés). */
    private const ALLOWED_ATTRIBUTES = [
        '*'   => ['class', 'style', 'title', 'dir', 'lang'],
        'a'   => ['href', 'target', 'rel', 'name'],
        'img' => ['src', 'alt', 'width', 'height', 'loading'],
        'td'  => ['colspan', 'rowspan'],
        'th'  => ['colspan', 'rowspan', 'scope'],
        'ol'  => ['start', 'type'],
    ];

    /**
     * @param string $html HTML non fiable
     * @return string HTML reconstruit, sûr à injecter tel quel dans une page du BO
     */
    public function sanitize($html)
    {
        $html = (string) $html;
        if (trim($html) === '') {
            return '';
        }

        $previousLibxmlErrors = libxml_use_internal_errors(true);
        $doc = new \DOMDocument('1.0', 'UTF-8');
        // Prologue XML : force l'UTF-8 sans injecter de <meta> dans le fragment.
        // LIBXML_NONET : jamais de résolution réseau pendant le parse.
        $doc->loadHTML(
            '<?xml encoding="utf-8"?><body>' . $html . '</body>',
            LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previousLibxmlErrors);

        $body = $doc->getElementsByTagName('body')->item(0);
        if ($body === null) {
            return '';
        }

        $this->sanitizeChildren($body);

        $out = '';
        foreach ($body->childNodes as $child) {
            $out .= $doc->saveHTML($child);
        }

        return $out;
    }

    private function sanitizeChildren(\DOMNode $node)
    {
        // Itération sur une copie : la liste live de childNodes se réindexe à chaque remove/unwrap.
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof \DOMComment || $child instanceof \DOMCdataSection
                || $child instanceof \DOMProcessingInstruction || $child instanceof \DOMDocumentType) {
                $node->removeChild($child);
                continue;
            }

            if (!$child instanceof \DOMElement) {
                continue; // texte : inerte une fois re-sérialisé par saveHTML
            }

            $tag = strtolower($child->nodeName);

            if (in_array($tag, self::DROPPED_TAGS, true)) {
                $node->removeChild($child);
                continue;
            }

            if (!in_array($tag, self::ALLOWED_TAGS, true)) {
                // Élément inconnu : déballé — ses enfants (déjà assainis ensuite) remontent à sa place.
                $this->sanitizeChildren($child);
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);
                continue;
            }

            $this->sanitizeAttributes($child, $tag);
            $this->sanitizeChildren($child);
        }
    }

    private function sanitizeAttributes(\DOMElement $element, $tag)
    {
        $allowed = array_merge(self::ALLOWED_ATTRIBUTES['*'], self::ALLOWED_ATTRIBUTES[$tag] ?? []);

        foreach (iterator_to_array($element->attributes) as $attribute) {
            $name = strtolower($attribute->name);
            $value = $attribute->value;

            if (!in_array($name, $allowed, true)) {
                $element->removeAttribute($attribute->name);
                continue;
            }

            if (($name === 'href' || $name === 'src') && !$this->isSafeUrl($value, $tag)) {
                $element->removeAttribute($attribute->name);
                continue;
            }

            if ($name === 'style' && !$this->isSafeStyle($value)) {
                $element->removeAttribute($attribute->name);
            }
        }

        // Une cible _blank sans rel laisse la page ouvrante pilotable (reverse tabnabbing).
        if ($tag === 'a' && strtolower($element->getAttribute('target')) === '_blank') {
            $element->setAttribute('rel', 'noopener noreferrer');
        }
    }

    private function isSafeUrl($url, $tag)
    {
        $url = trim($url);
        if ($url === '') {
            return false;
        }

        // Neutralise les contrôles/espaces que les navigateurs ignorent dans le scheme (java\tscript:).
        $probe = strtolower(preg_replace('/[\x00-\x20]+/', '', $url));

        if (preg_match('/^([a-z][a-z0-9+.-]*):/', $probe, $m)) {
            $scheme = $m[1];
            if (in_array($scheme, ['http', 'https', 'mailto', 'tel'], true)) {
                return true;
            }
            // Images collées par TinyMCE : data: toléré pour les seuls formats image, sur <img> uniquement.
            if ($scheme === 'data' && $tag === 'img') {
                return (bool) preg_match('#^data:image/(png|jpe?g|gif|webp|bmp);base64,#', $probe);
            }
            return false;
        }

        return true; // relatif, ancre, protocole-relatif //host
    }

    private function isSafeStyle($style)
    {
        // Pas d'appel sortant ni d'import depuis un style inline ; expression() = IE legacy.
        return !preg_match('/url\s*\(|expression\s*\(|@import|image-set\s*\(/i', $style);
    }
}
