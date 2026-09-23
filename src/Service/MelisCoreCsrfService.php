<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisCore\Service;

/**
 * CSRF token (audit item 10.0).
 *
 * ONE token per session, stored in two places:
 *   - the PHP session: the reference value, unreachable from another site;
 *   - the cookie `melis_csrf`: the same value, deliberately NOT HttpOnly so the back-office
 *     JavaScript can read it and echo it back in the `X-Melis-Csrf` header (or in a hidden
 *     `melis_csrf` field for a classic form post).
 *
 * Why that is enough: a page hosted by an attacker can MAKE the browser send our cookies, but the
 * same-origin policy forbids it to READ them. It can therefore never produce the header/field, and
 * MelisCoreCsrfListener rejects the request. The token being bound to the session (and not merely
 * compared cookie-to-field) also defeats an attacker who can write cookies from a sibling domain.
 *
 * Static on purpose: it is called from the bootstrap, from a listener and from controllers, before
 * or without a service manager, and it holds no state of its own beyond the session.
 */
class MelisCoreCsrfService
{
    /** Key in $_SESSION (plain key: the bootstrap runs before any Laminas session container). */
    const SESSION_KEY = 'melis_csrf_token';

    /** JS-readable mirror cookie. */
    const COOKIE_NAME = 'melis_csrf';

    /** Header used by AJAX/fetch calls. */
    const HEADER_NAME = 'X-Melis-Csrf';

    /** Field used by classic (non-AJAX) form posts. */
    const FIELD_NAME = 'melis_csrf';

    /**
     * True when the token was CREATED during the current request, i.e. the client is receiving it
     * in this very response and cannot have echoed it back. See wasJustMinted().
     */
    private static $justMinted = false;

    /**
     * Token of the current session, created on first call, and mirror cookie kept in sync.
     * Returns '' when there is no session (CLI, cron): nothing to protect.
     */
    public static function ensureToken()
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return '';
        }

        if (empty($_SESSION[self::SESSION_KEY]) || !is_string($_SESSION[self::SESSION_KEY])) {
            $_SESSION[self::SESSION_KEY] = bin2hex(random_bytes(32));
            self::$justMinted = true;
        }

        $token = $_SESSION[self::SESSION_KEY];

        if (!isset($_COOKIE[self::COOKIE_NAME]) || $_COOKIE[self::COOKIE_NAME] !== $token) {
            self::sendCookie($token);
        }

        return $token;
    }

    /**
     * New token. Called at login, right after session_regenerate_id(): the token of the anonymous
     * session must not survive into the authenticated one.
     */
    public static function regenerate()
    {
        unset($_SESSION[self::SESSION_KEY]);
        self::$justMinted = false; // a rotation at login is not a first handout; see wasJustMinted()

        $token = self::ensureToken();
        self::$justMinted = false;

        return $token;
    }

    /**
     * Was the token created during THIS request?
     *
     * The token is minted at bootstrap, so the request that receives it for the first time is
     * also checked by MelisCoreCsrfListener - and it cannot possibly carry a token it is only
     * now being handed. That happens for real: the React shell (/melis-react) is streamed by
     * MelisAssetManager before MelisCore's initSession ever runs, so a browser deep-linking
     * straight to it and posting the login form would be refused once, then work on the retry.
     *
     * The listener therefore lets such a request through. Nothing is weakened: an attacker cannot
     * empty a victim's session, so a session that has no token yet has nothing worth forging -
     * it is not authenticated. Every request after this one is checked normally.
     */
    public static function wasJustMinted()
    {
        return self::$justMinted;
    }

    /** Current token, without creating one. '' when there is none. */
    public static function getToken()
    {
        return isset($_SESSION[self::SESSION_KEY]) && is_string($_SESSION[self::SESSION_KEY])
            ? $_SESSION[self::SESSION_KEY]
            : '';
    }

    /** Does this submitted value match the session token? Empty never matches. */
    public static function isValid($submitted)
    {
        $token = self::getToken();

        if ($token === '' || !is_string($submitted) || $submitted === '') {
            return false;
        }

        return hash_equals($token, $submitted);
    }

    /**
     * HTTPS, seen from behind the ingress/reverse proxy too: TLS ends at the proxy, so
     * $_SERVER['HTTPS'] is empty inside the container and a `Secure` cookie would never be set.
     */
    public static function isHttps()
    {
        if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') {
            return true;
        }

        $forwarded = isset($_SERVER['HTTP_X_FORWARDED_PROTO']) ? $_SERVER['HTTP_X_FORWARDED_PROTO'] : '';

        // A proxy chain sends a list: "https, http" - the first hop is the browser's scheme.
        $first = strtolower(trim(explode(',', (string) $forwarded)[0]));

        return $first === 'https';
    }

    private static function sendCookie($token)
    {
        if (headers_sent()) {
            return;
        }

        setcookie(self::COOKIE_NAME, $token, [
            'expires'  => 0, // session cookie: dies with the browser, like PHPSESSID
            'path'     => '/',
            'secure'   => self::isHttps(),
            'httponly' => false, // ON PURPOSE: the back-office JS has to read it (see class doc)
            'samesite' => 'Lax',
        ]);

        // So a second call within the same request does not send the header twice.
        $_COOKIE[self::COOKIE_NAME] = $token;
    }
}
