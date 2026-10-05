#!/usr/bin/env bash
# CSRF protection, end-to-end against a running Melis stack (audit item 10.0).
#
#   BASE_URL=http://dev6.local ./csrf-e2e.sh
#
# Checks, on the real server: the session cookie is no longer downgraded to SameSite=None, the
# melis_csrf cookie is issued and readable by JavaScript, and a state-changing POST is accepted
# with the token / refused without it.
#
# The token gate returns 403 in the default mode ('enforce'); on a stack switched to 'report' it
# blocks nothing, so the script says so instead of failing.
set -u

BASE_URL="${BASE_URL:-http://dev6.local}"
JAR="$(mktemp)"
fails=0

pass() { echo "  ok   $1"; }
fail() { echo "  FAIL $1"; fails=$((fails + 1)); }
check() { [ "$2" = "$3" ] && pass "$1" || fail "$1 (expected '$3', got '$2')"; }

echo "--- cookies issued by $BASE_URL/melis/login ---"
headers="$(curl -s -c "$JAR" -D - "$BASE_URL/melis/login" -o /dev/null)"

echo "$headers" | grep -qi 'Set-Cookie: PHPSESSID=.*SameSite=Strict' \
  && pass "PHPSESSID keeps SameSite=Strict" \
  || fail "PHPSESSID lost SameSite=Strict (is .htaccess rewriting Set-Cookie again?)"

echo "$headers" | grep -i 'Set-Cookie: PHPSESSID=' | grep -qi 'SameSite=None' \
  && fail "PHPSESSID is still downgraded to SameSite=None" \
  || pass "PHPSESSID is not downgraded to SameSite=None"

echo "$headers" | grep -qi 'Set-Cookie: melis_csrf=.*SameSite=Lax' \
  && pass "melis_csrf is issued with SameSite=Lax" \
  || fail "melis_csrf is not issued"

echo "$headers" | grep -i 'Set-Cookie: melis_csrf=' | grep -qi 'HttpOnly' \
  && fail "melis_csrf is HttpOnly - the back-office JS cannot read it" \
  || pass "melis_csrf is readable by JavaScript (needed, by design)"

TOKEN="$(awk '$6 == "melis_csrf" { print $7 }' "$JAR")"
check "the token is 64 hex characters" "$(printf '%s' "$TOKEN" | wc -c)" "64"

echo
echo "--- a state-changing POST ---"
# Target: an existing, idempotent back-office route. It MUST exist - on an unknown route the
# router answers 404 during the same event and the gate never runs, which would make this test
# pass for the wrong reason. /melis/islogin only answers {"login":false} when not logged in.
post() { # curl args
  curl -s -o /dev/null -w '%{http_code}' -b "$JAR" -X POST \
    -H "X-Requested-With: XMLHttpRequest" "$@" "$BASE_URL/melis/islogin"
}

with="$(post -H "Origin: $BASE_URL" -H "X-Melis-Csrf: $TOKEN")"
check "a request with the token is let through" "$with" "200"

without="$(post -H "Origin: $BASE_URL")"
cross="$(post -H "Origin: http://evil.example" -H "X-Melis-Csrf: $TOKEN")"

if [ "$without" = "403" ] && [ "$cross" = "403" ]; then
  pass "a request without a token is refused (403)"
  pass "a cross-site Origin is refused (403)"
else
  echo "  note nothing was blocked (no token -> HTTP $without, evil Origin -> HTTP $cross):"
  echo "       this stack runs csrf_mode=report. Read the inventory with"
  echo "         docker logs <container> 2>&1 | grep MELIS_CSRF"
  echo "       then put MELIS_CSRF_MODE back to enforce."
fi

echo
echo "--- a browser that has not received the token yet ---"
# The SPA shell (/melis-react) is streamed by MelisAssetManager before MelisCore's initSession, so
# it carries no cookie: the first POST of such a browser is handed the token in the very response
# that checks it. It must be let through once (logged ALLOW reason=token-just-minted), otherwise
# the React login form would only work on the second click.
FRESH="$(mktemp)"
curl -s -c "$FRESH" -b "$FRESH" "$BASE_URL/melis-react" -o /dev/null
first="$(curl -s -o /dev/null -w '%{http_code}' -c "$FRESH" -b "$FRESH" -X POST \
  -H "Origin: $BASE_URL" -H "X-Requested-With: XMLHttpRequest" "$BASE_URL/melis/islogin")"
check "the very first POST of a fresh browser is not refused" "$first" "200"

second="$(curl -s -o /dev/null -w '%{http_code}' -b "$FRESH" -X POST \
  -H "Origin: $BASE_URL" -H "X-Requested-With: XMLHttpRequest" "$BASE_URL/melis/islogin")"
check "the next one, now that it has the token, is refused without it" "$second" "403"
rm -f "$FRESH"

rm -f "$JAR"
echo
[ "$fails" -eq 0 ] && echo "e2e: all green" || echo "e2e: $fails failure(s)"
exit $((fails == 0 ? 0 : 1))
