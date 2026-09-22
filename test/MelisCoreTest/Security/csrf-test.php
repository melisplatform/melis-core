<?php

/**
 * CSRF protection tests (audit item 10.0) - MelisCoreCsrfService + MelisCoreCsrfListener.
 *
 * Plain PHP, no PHPUnit (this repository ships none), so it runs anywhere:
 *
 *     php vendor/melisplatform/melis-core/test/MelisCoreTest/Security/csrf-test.php
 *
 * Exit code 0 = all green, 1 = at least one failure.
 */

use Laminas\Http\Request as HttpRequest;
use MelisCore\Listener\MelisCoreCsrfListener;
use MelisCore\Service\MelisCoreCsrfService;

$root = dirname(__DIR__, 6); // …/vendor/melisplatform/melis-core/test/MelisCoreTest/Security
require $root . '/vendor/autoload.php';
require $root . '/vendor/melisplatform/melis-core/src/Service/MelisCoreCsrfService.php';
require $root . '/vendor/melisplatform/melis-core/src/Listener/MelisCoreCsrfListener.php';

$failures = 0;
$ran      = 0;

function check($label, $actual, $expected)
{
    global $failures, $ran;
    $ran++;
    $ok = $actual === $expected;
    if (!$ok) {
        $failures++;
    }
    printf(
        "%s %s%s\n",
        $ok ? '  ok  ' : '  FAIL',
        $label,
        $ok ? '' : sprintf(' (expected %s, got %s)', var_export($expected, true), var_export($actual, true))
    );
}

/** A back-office request, as the browser would send it. */
function request($method, $path, array $headers = [], array $post = [])
{
    $request = new HttpRequest();
    $request->setMethod($method);
    $request->setUri('http://dev6.local' . $path);
    $request->getHeaders()->addHeaders(array_merge(['Host' => 'dev6.local'], $headers));
    $request->getPost()->fromArray($post);

    return $request;
}

/** The listener's verdict on a request: null = legitimate, otherwise the failure reason. */
function verdict(HttpRequest $request)
{
    $method = new ReflectionMethod(MelisCoreCsrfListener::class, 'check');
    $method->setAccessible(true);

    return $method->invoke(new MelisCoreCsrfListener(), $request);
}

session_start();

// Buffered: the mirror cookie is sent with setcookie(), which is a no-op once anything has been
// printed (headers_sent()). Everything this script echoes stays in the buffer until the end.
ob_start();

echo "\n--- MelisCoreCsrfService ---\n";

$token = MelisCoreCsrfService::ensureToken();
check('a token is minted', strlen($token), 64);
check('it is stable within the session', MelisCoreCsrfService::ensureToken(), $token);
check('getToken() returns it', MelisCoreCsrfService::getToken(), $token);
check('the mirror cookie carries the same value', $_COOKIE[MelisCoreCsrfService::COOKIE_NAME], $token);

check('the right token is accepted', MelisCoreCsrfService::isValid($token), true);
check('a wrong token is refused', MelisCoreCsrfService::isValid(str_repeat('a', 64)), false);
check('an empty token is refused', MelisCoreCsrfService::isValid(''), false);
check('a null token is refused', MelisCoreCsrfService::isValid(null), false);
check('a truncated token is refused', MelisCoreCsrfService::isValid(substr($token, 0, 32)), false);

$rotated = MelisCoreCsrfService::regenerate();
check('login rotates the token', $rotated !== $token, true);
check('the old token no longer validates', MelisCoreCsrfService::isValid($token), false);
check('the new token validates', MelisCoreCsrfService::isValid($rotated), true);
$token = $rotated;

// HTTPS seen through the ingress, where TLS ends at the proxy.
$_SERVER['HTTPS'] = 'off';
unset($_SERVER['HTTP_X_FORWARDED_PROTO']);
check('plain HTTP is not HTTPS', MelisCoreCsrfService::isHttps(), false);
$_SERVER['HTTP_X_FORWARDED_PROTO'] = 'https';
check('X-Forwarded-Proto: https is HTTPS', MelisCoreCsrfService::isHttps(), true);
$_SERVER['HTTP_X_FORWARDED_PROTO'] = 'https, http';
check('a proxy chain keeps the first hop', MelisCoreCsrfService::isHttps(), true);
$_SERVER['HTTP_X_FORWARDED_PROTO'] = 'http';
check('X-Forwarded-Proto: http is not HTTPS', MelisCoreCsrfService::isHttps(), false);
$_SERVER['HTTPS'] = 'on';
check('$_SERVER[HTTPS]=on wins', MelisCoreCsrfService::isHttps(), true);

echo "\n--- MelisCoreCsrfListener: legitimate requests ---\n";

check(
    'React: header + Origin',
    verdict(request('POST', '/melis/react-api/users/save', [
        'Origin'                     => 'http://dev6.local',
        MelisCoreCsrfService::HEADER_NAME => $token,
    ])),
    null
);

check(
    'legacy AJAX: header + Referer only',
    verdict(request('POST', '/melis/tooluser/saveUser', [
        'Referer'                    => 'http://dev6.local/melis',
        MelisCoreCsrfService::HEADER_NAME => $token,
    ])),
    null
);

check(
    'legacy form post: hidden field',
    verdict(request('POST', '/melis/tooluser/saveUser', ['Origin' => 'http://dev6.local'], [
        MelisCoreCsrfService::FIELD_NAME => $token,
    ])),
    null
);

check(
    'DELETE with the header',
    verdict(request('DELETE', '/melis/react-api/users/delete/2', [
        'Origin'                     => 'http://dev6.local',
        MelisCoreCsrfService::HEADER_NAME => $token,
    ])),
    null
);

check(
    'the host port is tolerated on one side only',
    verdict(request('POST', '/melis/react-api/users/save', [
        'Origin'                     => 'http://dev6.local:80',
        MelisCoreCsrfService::HEADER_NAME => $token,
    ])),
    null
);

echo "\n--- MelisCoreCsrfListener: forged requests ---\n";

check(
    'THE ATTACK: cross-site POST, cookies sent, no token readable',
    verdict(request('POST', '/melis/tooluser/saveUser', ['Origin' => 'http://evil.example'])),
    'origin'
);

check(
    'cross-site POST even with a stolen-looking token',
    verdict(request('POST', '/melis/tooluser/saveUser', [
        'Origin'                     => 'http://evil.example',
        MelisCoreCsrfService::HEADER_NAME => $token,
    ])),
    'origin'
);

check(
    'a look-alike host is not our host',
    verdict(request('POST', '/melis/tooluser/saveUser', [
        'Origin'                     => 'http://dev6.local.evil.example',
        MelisCoreCsrfService::HEADER_NAME => $token,
    ])),
    'origin'
);

check(
    'no Origin and no Referer at all',
    verdict(request('POST', '/melis/tooluser/saveUser', [MelisCoreCsrfService::HEADER_NAME => $token])),
    'origin'
);

check(
    'Origin: null (sandboxed iframe, redirected form)',
    verdict(request('POST', '/melis/tooluser/saveUser', [
        'Origin'                     => 'null',
        MelisCoreCsrfService::HEADER_NAME => $token,
    ])),
    'origin'
);

check(
    'right origin but no token',
    verdict(request('POST', '/melis/tooluser/saveUser', ['Origin' => 'http://dev6.local'])),
    'token-missing'
);

check(
    'right origin but a guessed token',
    verdict(request('POST', '/melis/tooluser/saveUser', [
        'Origin'                     => 'http://dev6.local',
        MelisCoreCsrfService::HEADER_NAME => str_repeat('b', 64),
    ])),
    'token-mismatch'
);

check(
    'the token of a previous session (rotated at login)',
    verdict(request('POST', '/melis/tooluser/saveUser', [
        'Origin'                     => 'http://dev6.local',
        MelisCoreCsrfService::HEADER_NAME => str_repeat('a', 64),
    ])),
    'token-mismatch'
);

check(
    'a header duplicated into "token, token" is refused',
    verdict(request('POST', '/melis/tooluser/saveUser', [
        'Origin'                     => 'http://dev6.local',
        MelisCoreCsrfService::HEADER_NAME => $token . ', ' . $token,
    ])),
    'token-mismatch'
);

printf("\n%d checks, %d failure(s)\n", $ran, $failures);

ob_end_flush();

exit($failures === 0 ? 0 : 1);
