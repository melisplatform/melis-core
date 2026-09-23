/**
 * CSRF token, legacy back-office side (audit item 10.0).
 *
 * The server puts the session token in the JS-readable cookie `melis_csrf`
 * (MelisCore\Service\MelisCoreCsrfService). This file echoes it back on every state-changing
 * request, so MelisCoreCsrfListener can tell a real back-office action from one forged by
 * another site - which can make the browser send our cookies, but can never read them.
 *
 * Two emitters, no tool and no .phtml to modify:
 *   - XMLHttpRequest -> X-Melis-Csrf header. Patched at the prototype, so it covers jQuery AJAX
 *     (which uses XHR underneath) AND old module code that builds its own XHR. Patching here
 *     rather than in $.ajaxSend also avoids setting the header twice, which the browser would
 *     join into "token, token" and the server would reject.
 *   - classic form post -> hidden `melis_csrf` field, added at submit time. Bound twice: once
 *     natively, and once through jQuery when it is there, because jQuery's own .submit() trigger
 *     runs its handlers without dispatching an event a native listener would see.
 */
(function () {
    // Loaded twice (own <script> + inside a bundle): a second XHR patch would send the header
    // twice ("token, token") and fail the check. Install once.
    if (window.__melisCsrfInstalled) return;
    window.__melisCsrfInstalled = true;
    var HEADER = 'X-Melis-Csrf';
    var FIELD = 'melis_csrf';
    var SAFE = /^(GET|HEAD|OPTIONS)$/i;

    // Read at each call, never cached: the token is renewed at login.
    function token() {
        var match = document.cookie.match(/(?:^|;\s*)melis_csrf=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : '';
    }

    // Our own back-office only: an absolute URL to another host must never receive the token.
    function isOwnUrl(url) {
        if (!url) return true; // relative to the current page
        return !/^https?:\/\//i.test(url) || url.indexOf(window.location.origin + '/') === 0;
    }

    if (window.XMLHttpRequest && XMLHttpRequest.prototype.send) {
        var open = XMLHttpRequest.prototype.open;
        var send = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url) {
            this.__melisCsrf = !SAFE.test(method || 'GET') && isOwnUrl(url);
            return open.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function () {
            var value = this.__melisCsrf ? token() : '';
            if (value) {
                // setRequestHeader throws if the request is not OPENED; never break the call.
                try { this.setRequestHeader(HEADER, value); } catch (e) {}
            }
            return send.apply(this, arguments);
        };
    }

    // Delegated, so it also covers the forms a tool injects later - nothing to wire per form.
    function stampForm(form) {
        if (!form || form.tagName !== 'FORM') return;
        if ((form.getAttribute('method') || 'get').toUpperCase() === 'GET') return;

        var value = token();
        if (!value) return;

        // A form submitted more than once - a login the user retries after a typo, any tool form
        // reused without a page load - keeps the field stamped the first time. Re-stamping it
        // with the CURRENT cookie is what matters: the token is renewed whenever the session is
        // (login, a restarted server handing out a fresh session), and a field still carrying the
        // previous one is refused with reason=token-mismatch on every later attempt, for good.
        var input = form.querySelector('input[name="' + FIELD + '"]');
        if (input) {
            input.value = value;
            return;
        }

        input = document.createElement('input');
        input.type = 'hidden';
        input.name = FIELD;
        input.value = value;
        form.appendChild(input);
    }

    document.addEventListener('submit', function (event) { stampForm(event.target); }, true);

    // jQuery loads after this file, hence the wait. A form submitted through jQuery's .submit()
    // trigger runs jQuery's handlers only - the native listener above never sees it - so the
    // legacy back-office needs this second binding. stampForm() is idempotent, so a form that
    // reaches both is stamped once.
    document.addEventListener('DOMContentLoaded', function () {
        if (window.jQuery) {
            window.jQuery(document).on('submit', 'form', function () { stampForm(this); });
        }
    });
})();
