## Release Notes

_Curated from the commit history between release tags (GitHub releases carry no notes). Each entry is grouped by change type._

## [6.0.15] - 2026-10-07
### Fixed
* **react-dashboard:** grabbing a tall widget no longer auto-scrolls the page

## [6.0.14] - 2026-10-06
### Added
* **react-dashboard:** structure panel is a scaled copy of the dashboard (Mantis #0011020, follow-up)
* **react-dashboard:** add-widget catalogue, two cards per row with a roomier card (0011018, 3rd pass)
* **react-dashboard:** lighter add-widget catalogue cards (0011018, 2nd pass: "too crowded")
* **react-dashboard:** marketplace-style cards in the add-widget catalogue (0011018)
* **react-dashboard:** mirror tile size and position in the structure panel, drop anywhere
* **react-dashboard:** restore GridStack drag/resize, sync width/height fields to native grid units
* **react-dashboard:** add a widget structure panel, sync with GridStack canvas
### Fixed
* **dashboard:** allow removing the last widget
* **rights:** a new user/role starts with no dashboard plugin ticked (0011066)
* **dashboard:** keep the structure panel, the grid and the saved layout in sync
* **melis-core/dashboard:** collapse structure-panel action buttons into a menu on narrow cards
* **react-dashboard:** no upward auto-scroll while resizing a tile (Mantis #0011019)
* **react-dashboard:** keep staggered layouts in place; no phantom empty space in the right panel (Mantis #0011020)
### Dependencies & build
* Rebuilt the back-office bundle (bundle.js / bundle.css)

## [6.0.13] - 2026-10-06
### Changed
* Hide melis-design from the React setup module selection

## [6.0.12] - 2026-09-25
### Security
* **security:** bundle.js carries the CSRF emitter again (audit 10.0)
* Rebuild to reflect csrf.js
* **melis-core:** a tool the user cannot open shows "Access denied", not an empty page
* **security:** list the controllers keyed for the authorization gate (audit item 7.0)
* **security:** declare the tool key on the remaining core controllers (audit item 7.0)
* **security:** CSRF emitter never doubles the header, back-office targets only
* **security:** strip melis_csrf field from POST after CSRF check
### Fixed
* **subtabs:** remount native forms per record so a sub-tab never shows the previous record's name (0011048)
* **rights:** a new user/role starts with no dashboard plugin ticked (0011066)
* **login:** Connect stays disabled until login.js has wired the AJAX login
* **emails:** each language tab of the Emails tool shows its own language (PASSWORDEXPIRED)
### Dependencies & build
* Rebuilt the back-office bundle (bundle.js / bundle.css)

## [6.0.10] - 2026-09-23
### Security
* Revert(security): remove the audit 17.0 rate limiting (login / reset / coupons)
* **security:** turn the authorization gate on by default (audit item 7.0)
* **security:** never bundle the CSRF emitter into the login bundle (audit 10.0)
* **security:** ignore a login bundle older than the CSRF emitter (audit 10.0)
* **security:** cache-stamp the standalone CSRF emitter (audit 10.0)
* **security:** re-stamp the CSRF field on a form submitted more than once (audit 10.0)
* **security:** report the CSRF refusal reason in a response header (audit 10.0)
* **security:** CSRF emitter on the login page whatever the bundle mode (audit 10.0)
* **install:** dbdeploy scripts for the security audit trail and rate limiting
* **security:** user form no longer logs SENSITIVE_READ for tabs never opened (audit item 21.0)
* **security:** guard session ini_set() so it no longer warns into responses (audit 10.0 follow-up)
* **security:** authorization gate resolves the grantable key (audit item 7.0)
* **security:** audit items 7.0, 10.0, 13.0, 16.0, 17.0, 18.0 (sync from the skeleton fix/vulnerabilities branch)
* **security:** parameterised SQL for the date filter, ORDER BY and hand-quoted values (audit item 11.0)
* **ui-react:** rebuild after the security audit changes
* **security:** audit trail for logins, exports, sensitive reads and the media library
### Added
* **emails:** reopen the created email in its edit sub-tab after creation (0011048)
### Fixed
* **gdpr:** alert-email language tabs side by side, not squashed (0011052)
* **login:** mail the reset link when the password has expired
* **subtabs:** purge persisted `<section>/undefined` sub-tabs on load (0011048)
* **emails:** new-email sub-tab left open and renamed after creation (0011048)
* Drop the previous user's open tabs at logout and login
* Expired password at login says so and React follows the renewal redirect
* **security:** make get-translations session-independent, validated and escaped (DEKRA #19)
* **security:** expire, rotate and purge password reset tokens
### Dependencies & build
* Rebuilt the back-office bundle (bundle.js / bundle.css)

## [6.0.9] - 2026-08-20
### Security
* **melis-core:** correct over-restrictive tool-access keys (CWE-862 follow-up)
* **melis-core:** gate mutating actions across legacy tool controllers (CWE-862)
* **tool-user:** add missing access check to 3 ToolUserController actions (CWE-862)
* **tool-user:** add missing access check to 3 ToolUserController actions
### Added
* **react:** use a code icon for the New side of the view toggle
* **react:** reserve a bottom runway for module overlay buttons
* **auth:** native React 2FA (verify page + login integration)
### Fixed
* **react-bo:** open a plugin form's wrench tool as a real React tab
* **emails:** remove EMAIL2FA -- moved to melis-login-2fa-email (Mantis #0010919)
* **react:** keep pending module changes across a remount
* **react:** only reserve the overlay runway on a zone that really scrolls
* **modules:** activate a module's dependencies whatever their name casing
* **rights:** tolerate literal \n/\t in usr_rights so the CMS page tree never empties
* Guard hideModal/showModal against a missing modal element
* **i18n:** follow BO session language for menu/tab labels
* **ui-react:** dedup concurrent brick bundle loads (one fetch per bundle)
* **ui-react:** reserve a low runway under module overlays
* Keep composer.json line endings as on origin
* **react-dashboard:** never POST an empty layout without an explicit clear
* **auth:** let forgot/reset-password work even when already authenticated
* **auth:** gate the rest of the anonymous password-recovery zones
### Dependencies & build
* **ui-react:** rebuild after react-router 7.18.2 bump
* **react:** load every brick from one concatenated bundle
* **ui-react:** rebuild after the empty-layout guard
### Docs
* **melisai:** React back-office AI documentation for MelisCore (foundational)

## [6.0.5] - 2026-08-12
### Added
* **setup-react:** adopt MELIS_MODULE before the site is created, show its real name
* **auth:** config-driven public_zones allowlist for anonymous PluginView zones

## [6.0.4] - 2026-08-12
### Added
* **setup-react:** installation, module configuration and finish steps
### Fixed
* **setup-react:** land on /melis-react after the install, drop the applied-module line
* **setup-react:** stepper progress, error messages and MELIS_MODULE adoption

## [6.0.3] - 2026-08-10
### Dependencies & build
* **composer:** update docs/homepage links, swap zf2 keyword for laminas, bump php constraint to ^8.3|^8.5

## [6.0.2] - 2026-08-10
### Dependencies & build
* **deps:** require melisplatform/melis-react-{api,override} ^6.0
* **deps:** bump react-router and react-router-dom in /ui-react
* **deps-dev:** bump brace-expansion from 5.0.6 to 5.0.9 in /ui-react
* **deps:** bump nanoid from 3.3.12 to 3.3.18 in /ui-react
* **deps:** bump postcss from 8.5.15 to 8.5.26 in /ui-react

## [6.0.1] - 2026-08-10
### Security
* **security:** harden SQL building, RNG, file perms, path traversal & shell exec
* **security:** add SECURITY.md (private vulnerability reporting policy)
* Fix audit findings
* **core-react:** self-delete guard, permanent Dashboard tab, tile resize, legacy rights parity
* **rights:** rights-less user no longer sees MelisCore dashboard plugins (ticket 0010740)
* Update so that legacy rights will be consistent with react version
* **rights:** label the open / rename capabilities in the rights modal
* **rights:** make the legacy menu and rights modal agree with React
* Updated for user rights
* **shell:** persistent brick mounting + active prop; feat(rights): caps.order action label
* **build:** align core ui-react build with main (merged cron/rights features)
* **rights:** super-admin full access + null-guard resolved rights
* Updated for user rights for melis ai and marketplace
* Central capabilities rights checking + fix isParentOf stale-state leak
### Added
* **react:** add ColumnManager to EmailListPage; fix(mobile): touch-compatible drag-and-drop hook, dashboard widget-prune fixes
* **account:** remove profile photo in Mon compte + rebuild ui-react
* **marketplace:** add React back-office screenshots (etc/MarketPlace/images/react)
* **tinymce-mobile:** propagate the responsive patch into same-origin iframes
* **react-subtabs:** nested sub-tabs (3rd level) in the native sub-tab bar
* **webservices:** surface MelisCmsComments under the CMS section in the WS list
* **webservices:** BO-style section sidebar + full i18n for the token WS listing/try-it pages; module->section mapping
* **dashboard:** mobile-responsive dashboard + fix full-wipe of the shared plugin record
* **core-react:** header responsive mobile (breakpoint 1024) + sync sur le parent
* **react-core:** rendre Emails, Logs, Config, Theme, GDPR et Annonces responsive (mobile)
* **react-core:** rendre l outil Langues responsive (mobile)
* **react-core:** rendre l outil Platforms responsive (mobile)
* **react-core:** rendre la liste/formulaire Users responsive (mobile)
* **core-react:** listes infinies keyset + tri server-side (Users, Logs, Platform, Language, Annonces, Emails)
* **ui-react:** add a brick Overlay slot, move the AI assistant to MelisAI
* **react-users:** microservice tab — regenerate confirmation, safe copy, API URL
* **platform-scheme:** add "Restore to Default" button to React theme tool
* **react:** enforce password complexity + fix Other Config app.login.php save
* **ai-assistant:** logo MelisAi + 3 boutons de session (reduire/nouvelle/fermer)
* **users:** interdire la suppression de son propre compte (barrière serveur + bouton désactivé)
* **dashboard:** dashboard widgets, plugin dialogs & workflow comments + rebuild
* **react:** sections « hôtes de sidebar » (sidebarModule) — arbre pages CMS visible avec droits Pages seuls
* **dashboard:** palette de widgets façon legacy + finitions
* **dashboard:** modale de config des widgets en React + ajustement des tuiles
* **cms-react:** droits/capabilities éditeur de page CMS + polish
* Add __melisOpenTool bridge so legacy iframe tools can open another tool as a real top-level tab
* **core-react:** GDPR (auto-delete, SMTP), i18n, column manager, language switcher
* **react:** add a "Reset filters" button to the tool list page(s)
* Added another label
* **react-bo:** URLs d'outils propres + fix reflexion /:id en edition
* **account:** outil « Mon compte » full-React + onglet Messenger modulaire
* **core-tools:** Emails edit as sub-tab, Announcements TinyMCE editor + localized date, remove redundant back button (emails/announcements/languages/platforms)
* Added pointer to menu
* **core:** verification periodique de session (equiv legacy /melis/islogin) + hard redirect login sur expiration
* **core:** style entree menu Marketplace + nettoyage globals hote + rebuild ui-react
* **ui-react:** AI assistant form-editing actions (setField/submitForm/describeForm)
* Global AI assistant that drives the React back-office
* Add checking if module is enabled
* **react:** pattern de sous-onglets natif pour les briques (subTabs opt-in)
* **react:** i18n PHP-backed translations (login/forgot/reset) + forgot/reset password pages + beta notice
* **react:** thème BO React dédié (logo/login/i18n) + login multilingue
* **react:** outils BO Other Config + Platform Scheme, maj Modules
* **react:** migration full-React Emails + systeme de capacites + pages GDPR/Modules
* **react:** ExportModal reutilisable + filtre statut segmente (Annonces) + global MelisXLSX pour les briques
* **react:** pages BO Announcements/Languages/Platforms/Logs + ColumnManager + build
* **react-bo:** toggle vue par outil, gating role SmallBusiness, refresh modules a la navigation, fix collapse menu mono-outil (configChildCount), panneaux droits dashboard/pages + indices; rebuild assets ui-react
* **react-bo:** theme toggle always visible + __melisOpenAccount + rebuild
* **react-bo:** brick Header slot (topbar widgets) + rebuild
* **react-host:** collapse MelisCalendar's redundant nested menu entry
* **react-host:** expose __melisCloseTab + rebuild SPA assets
* **react-bo:** tree-driven URLs /[section]/[tool]/[id]…
* **react-bo:** profile avatar + real notification bell with i18n
* **react:** intègre l'app ui-react (source + build) dans MelisCore
* **meliscore:** add a hands-on developer guide to the technical reference
* **melis-core:** add MelisAI two-part documentation (functional guide + technical reference)
* Add explicit nullable param types (PHP 8.4 deprecation)
### Fixed
* **dashboard:** stop a plugin tile from resizing itself on every interaction
* **dashboard:** tab strip of a generated plugin sits flush under the tile header
* **columns:** Hidden columns gone everywhere, mobile "+" folds the rest of Visible
* **dashboard-plugins:** silence AJAX failures (no alert/console) + prospects stats perf (0010871)
* **dashboard:** fix race between height-heal and orphan-prune effects
* **dashboard:** let confirmed-orphaned widget tiles actually prune from the shared record
* **core-react:** mobile Columns/Export drag, KPI grid, ColumnManager position
* **security:** harden legacy file/dir creation & output escaping
* **tinymce-mobile:** keep every desktop button on narrow screens (reorder, never remove)
* **dashboard/zone/toggle:** drop ineffective iframe sandbox on first-party same-origin iframes (clears Chrome sandbox console warning)
* **react-mobile:** tapping a tab's close button no longer closes a second tab
* **react-topbar:** keep the mobile actions row mounted when collapsed
* **react-auth:** redirect logged-in users away from public auth pages
* **users:** MicroserviceTab content clipped with no way to scroll
* **webservices:** invoke 0-parameter service methods (typo setgetServiceManager + missing invocation) so no-arg microservices work
* **dashboard:** only an explicit removal may shrink the shared plugin record
* Fix(webservices) + redesign microservice API pages (ticket 0010821)
* **react:** auto-recover the Dashboard from a stale lazy chunk after deploy
* **dashboard:** let a tile shrink back to its content on mobile
* **react-mobile:** show subtabs of every open tool in the mobile tabs panel
* **core-emails:** remove plaintext password from Password Modification email
* **react-dashboard:** don't consume the pre-login prefetch (empty dashboard until F5)
* **react-core:** reorder tactile des Modules (Pointer Events)
* **react-sidebar:** en-tetes de sous-section en title-case (plus de tout-majuscule) + rebuild
* **react-shell:** onglet d'outil correct et traduit pour les briques a sous-onglets
* **core:** afficher les outils legacy a enfants boutons-daction (Comptes/Contacts)
* **react-users:** re-read the password policy on every form mount
* **core-react:** persister l etat deplie/replie du menu de gauche au reload
* **react-shell:** les sous-onglets d'edition survivent au reload (persistance sessionStorage, comme les onglets du shell) - s'applique a tous les outils/modules
* **ui-react:** make @melis-ai-engine an optional dependency
* **react-shell:** hide the global AI assistant when MelisAI is disabled
* **react-bo:** refresh email list after delete so config default reappears
* **react-dashboard:** don't wipe shared record on failed plugin fetch
* **react-bo:** mobile left menu unusable — sidebar becomes off-canvas drawer
* **shell:** Dashboard is a permanent home tab (no close button)
* **rights:** no phantom dash on "All plugins" when nothing is checked
* **rights:** tri-state dash on the Pages tree (ticket 0010741)
* Fixed tabbing problem
* **dashboard:** ajustement automatique des tuiles en hauteur (rétrécissement sûr)
* **react:** masquer les melisKey techniques dans l'arbre des droits utilisateur
* **core-rights:** cases à cocher (select all) cliquables sous Firefox
* **core-users:** bouton Enregistrer non bloqué après save (autre utilisateur)
* **core-users:** droits édités non sauvés ne persistent plus à la réouverture
* **core-rights:** i18n de l éditeur de droits + retrait des noms techniques
* **core:** éditeur de droits — actions déclarées {key,label}
* **users:** fire the legacy save events from the React user save
* Fixed melis helper and rebundle
* **core-react:** icône du sélecteur de langue toujours rendue
* **cms-react:** Shell ne démonte plus la brique CMS à la fermeture d'un onglet quand d'autres onglets de la route restent ouverts + rebuild app
* Fix tickets and fix dashboard slowing the rendering of other tools
* **core:** zoneReload preserve les attributs du wrapper de vue (save News cassé)
* **react:** let the legacy "Old" view keep its own editing (host tab bar drives it)
* **react-bo:** switch de langue fiable + apparition plus rapide de la bulle Messenger
* **react-bo:** pas de ToolTabBar hôte pour les outils à sous-onglets propres
* **core:** outil legacy blanc (zoneReload) + cache-bust du bundle
* **rights:** RightsTreeView collapses a tool wrapping its own single same-forward tool zone (no duplicate row, e.g. Calendar); mirrors useNavMenu
* Resolve stray stash conflict marker in UserListPage (keep icon header) + rebuild after merge
* **tabs:** closing a commerce/brick tool's tab left the URL stuck
* **rights:** bypass super-admin dans canAccess au lieu de getAuthRights=''
* Notif reset droits en double + selecteur langue theme (pilule) + rebuild ui-react
* **shell:** ne monter une brique que lorsqu elle est active
* **react:** outil Languages en page blanche — collision de route /languages + ErrorBoundary
* **react:** toggles on/off en vert (ON) / rouge (OFF) sur les outils full-React
* Fix insecure remember-me cookies in MelisAuthController
* Handle if meliskey is changed
* **users:** rechargement auto de la liste après ajout/suppression + compteur Admins corrige
* **react-bo:** toolSlug strips trailing -config (cleaner tree routes)
* **react-bo:** load brick bundles in parallel (no late-brick reload race)
* Fix minitemplate issue to show modal preview same as to the melis-cms page edition
### Changed
* **webservices:** soften the brand red on the microservice pages
* **core-auth:** remove legacy MD5/mcrypt password transition
* **dashboard:** load data in parallel with the menu at boot + rebuild
* **dashboard:** palette dajout de widgets alignée sur le menu de gauche
* **core:** traductions mémoïsées + save user sans double rebuild du cache droits
* I18n(core): internationalise tous les textes en dur (switch FR/EN)
* Remove logging
* Lang menu fix
* Gdpr fix
* Gdpr tool fix and lazyload to fix error when build is updated
* Gdpr update
* Tab behavior
* Tool layout
* **react-bo:** scrollbars fines/arrondies thème-aware (dark + light)
* Logs tool fix and export
* Updated for phpinfo menu
* Updated for menu and tabs
* Removed conflict marker
* **droits:** cache de droits par utilisateur (usr_rights_cache) - menu/canAccess/caps en O(1)
* **react-api:** outil(s) React-API du module dans leur module (modularité)
* Updated to show error per field
* Drop deprecated ReflectionProperty::setAccessible() calls (PHP 8.5)
* Allow laminas-serializer ^3 for PHP 8.4
* Unpin laminas-servicemanager to allow PHP 8.4 (3.24.x)
* Show all minitemplates by updating when to cleanup the generated accordion classes
### Dependencies & build
* **deps:** require melisplatform/melis-{asset-manager,composerdeploy,dbdeploy} ^6.0
* Local WIP snapshot before reconcile (20260806-114605)
* Rebuilt the back-office bundle (bundle.js / bundle.css)
* **ui-react:** rebuild (iframe sandbox removal on dashboard/zone/toggle)
* **react-ui:** charger les briques « widget-only » avant les bundles de pages
* **react-core:** rebuild ui-react (pre-login dashboard prefetch fix)
* **react:** rebuild ui-react assets
* **core-react:** rebuild ui-react (fix bulles chat melis-ai-engine)
* **ai-chat:** rebuild shell — render doc-MCP image markdown as <img>
* Updated bundle
* **core:** sync dashboard-fix depuis le parent + rebuild (alignement état déployé)
* **cms-react:** rebuild app après merge (ToolTabBar)
* **core-react:** rebuild assets après merge (dictionaries + RightsTreeView)
* **core-react:** rebuild ui-react (RightsTreeView, melis-api) + assets hashés
* **sync:** align melis-core with reconciled persistent-brick (BrickHost) impl from the platform; keep RightsTreeView single-tool collapse (noCollapse-aware)
* **build:** rebuild after merge
* **sync:** melis-core content from main (merged team changes)
* **core:** integre les changements melis-core commites au parent par d autres devs + rebuild
* **react:** rebuild BO React + update form pages (Announcement, Language, Platform, User)
* **react-bo:** sync melis-core with local6-2 (lazy bricks + dashboard work + theme toggle)
### Docs
* **dashboard:** flot charts DO re-theme (plugin redraws on __melisRetheme)
* **meliscore:** expand email sending, GDPR framework, and add passwords/crypting
* **meliscore:** deep-dive on app.interface.php (the interface tree) + the platform config folder
* **meliscore:** wire in 29 back-office screenshots + expand the functional guide

## [5.3.33] - 2026-05-13
### Added
* Added fix to disable alpn when getting file contents, used in bundles

## [5.3.32] - 2026-05-13
### Added
* Added function get all ai modules
* Added sql for adding column plf_2fa_active
### Fixed
* Fix collapsing of accordion when only the minitemplate buttons are clicked
* Fixed issue with password attempt counter not resetting after user has logged in
* Fixed js not rendering special characters for login error
* Fixed login authentication process
* Fix rect is 0 on first instance
* Fix issue on rect 0 on first instance
* Fix 9440 on news tool
* Fix 9440 in melis_tinymce.js
* Fix tinymce dialog overlaps behind the toolbar
* Fix tinymce dialogs & moxiemanager modal container partially hidden
* Fix issue on tinymce dialog partially hidden on the right most dnd
* Fix issue on tinymce toolbar overlap
### Changed
* Remove comment
* Allowed tinymce in the resource path and should not be excluded
* Refactor MelisLogTable and MelisCoreLogService for improved query efficiency and code clarity
* Update on tool mode
* Update
* Script stripping for editor related js
* Update mini-template.js for tool.php mode
* Update siteModule value
* Code clean up
* Commented unused code
* Will get site layout given the site module
* Remove logs
* First: site domain by siteId, second: current host + site module, third: current host root
* Update added data parameter in ajax under renderTemplateWithSiteShell function and also getMiniTemplatePreviewShellAction() function to resolve for a multi site fallback to current host
* Update on mini-template.js
* Update fix 10046
* Update 10046
* Related to 10046
* Issue on tinymce toolbar issue
* Included in gitignore config/app.login.php
* Code fix for authentication still logging in user even if wrong credentials
* Renamed 2FA to 2fa
* Changed name of email template to Email 2FA
* Created 2fa email template
* Updated logic for getting lass password updated date
* Updated authentication code
* Unified password requirement
* Code update
* Rect value is 0 at first issue
* Updated code for 2FA
* Code for making the login modular
* Updated code for saveOtherConfig to make it modular
* Updated tinymce configs - removed listed plugins or toolbar
* Updated plugins and toolbar entries
* Platform footer details updated
### Dependencies & build
* Update the function getChildDependencies to make it case insensitive
* Update composer dependencies to address CVEs
* Update composer dependency for composer/composer to version ^2.9.6
* Update composer dependency for composer/composer to version ^2.7

## [5.3.20] - 2025-10-23
### Fixed
* Fix/4891
### Changed
* Update
* Updated
* Updated and commented call to bubble plugins .init function
* Update checking 4891
* Checking fix 4891

## [5.3.18] - 2025-10-01
### Added
* Added local params in getTranslation function
* Add processing option on DataTable

## [5.3.17] - 2025-07-15
### Added
* Added css on icon-col-bg
### Changed
* Check issue on schemes.css

## [5.3.16] - 2025-07-09
### Added
* Added disabled button color
* Added dynamic dnd on platform scheme style color css
* Added pre data on announcement
### Fixed
* Fix issue 8509
* Fixed problem restoring platform scheme
* Fix issue 8466
### Changed
* Check flickering issue
* Updated
* Check fix on 8509
* Edit fix on 8509
* Update fix 8509
* Tinymce issue
* Edit
* Edit platform scheme
* Edit restore default
* Debug cache on restore default platform scheme
* Check fix 8467
* Check issue 8466
* Edit css
* Changes

## [5.3.15] - 2025-04-23
### Added
* Added setTimeout delay for moxiemanager dialog
* Added event listener to possible edit user info
### Fixed
* Fix on addtional issue 8125
* Fix firefox behavior issue
* Fix issue 8125
* Fix 8125
### Changed
* Tinymce modal shows near the selection area
* Check issue 8125
* Edit
* Edit fix dialog is found on localhost while on dev3 is null
* Edit fix
* SetTimeout 2000
* Check delay moxiemanager dialog with console log
* Edit on delay moxiemanager dialog
* Check if marketpalce is loaded on bubble update plugin
* Edit on 8125

## [5.3.14] - 2025-04-09
### Fixed
* Fix bug

## [5.3.13] - 2025-03-10
### Added
* Additional fix on modal css
### Fixed
* Fix on kulker mantis issue 7885
* Fixed problem on locating some icons/image
* Fix mantis issue 8000
* Fixed problem copying file from user custom modules

## [5.3.12] - 2025-02-12
### Fixed
* Duplicate code
* Fix related aidee issue 7930
* Fix 7872 dashboard plugins menu opened when the dashboard is empty
* Fixed uri checking
* Fixed problem on manual visiting of login page if the user is already logged in
### Changed
* Edits
* Edits on login page melis-box image
* Edit css
* Edit on login page css
* Update dashboard plugins menu and page edition plugin menu
* Edit on update svg icons
* Update back office default logo to svg
* Hotfix
* Modal-dialog width fit-content
* Update on style.css on modal user management dialog width
* Edit
* Updated implementation of other config tool
### Dependencies & build
* Rebundle css

## [5.3.10] - 2025-01-09
### Fixed
* Fix issue on enjoyhint still adding overflow hidden on body tag

## [5.3.9] - 2025-01-09
### Changed
* Modal tabs and melisHelper column sortable option

## [5.3.8] - 2025-01-08
### Security
* Update on evolution user management rights
* Fix user management rights evolution
* Evo user mngt rights
### Added
* Added css for modal tabs default state
* Additional edits for jquery migration
### Fixed
* Fix for aidee issue 7821
* Fixed problem on redirect when bundling
* Fix issue 7698
* Fix issue 6243
* Fix issues 6242 and 6243
* Fix issue 7646
* Fixed problem merging module assets files
* Fixed problem merging module js files
### Changed
* Remove redundant checker in email sending
* Checking issue on gridstack
* Edit user build assets true
* Edit css
* Edit on issue 6242 and 6243
* Put third party images/fonts to public folder when bundling
* Update on tinymce mini templates
* Update on datatable option sClass to className and tinymce mini templates

## [5.3.7] - 2024-11-11
### Added
* Added bubble plugins to interface exclusions
* Added css definition on platform scheme
### Fixed
* Fix on email management full width form
* Fix issue on tab navs
* Fix issue 7388 and edits on jquery migration with bootstrap 5.3 utility classand modal hiding
* Fix for 7334
* Fix issues on mini templates
### Changed
* Issue on nav tabs
* Edits on css and js
* Checking tabs issues
* Tabs issue css related
* Tabs related css issues
* Edit on css for .nav-tabs
* Edit on css
* Edit on minitemplate css
* Jquery migration related update

## [5.3.6] - 2024-10-21
### Added
* Added bundles in the excluded url

## [5.3.5] - 2024-10-21
### Added
* Create separate login bundle loader url to prevent problem on caching
* Updated allowable rout4es
* Add header cache for getting translations
### Changed
* Set 1 day for translations cache
### Dependencies & build
* Changed bundle folder name
* Update bundle scripts header
* Update bundle rendering

## [5.3.3] - 2024-10-07
### Fixed
* Fix issue on tool.php that it doesnt finds the tinymce files
* Fix issue on clubthermal mini templates & plugins

## [5.3.2] - 2024-09-26
### Fixed
* Fix for issue on datatable all white background on headings

## [5.3.1] - 2024-09-25
### Changed
* Issue on isMarketplaceAccessible fixed

## [5.3.0] - 2024-09-25
### Added
* Added utf8 charset value
* Added bootstrap-icons and changes on language
* Added back zoneReload callback
* Added build images jquery.minicolors.png
### Fixed
* Fix issue on gridstack
* Fix datetimepicker issue
* Restore announcement phtml file
* Fix issue related datetimepicker
* Fix issue 7029
* Fix conflict
* Fix issue 6977
* Fix issue on 6987 and 6985
* Fix calendar issue
* Fix for announcement calendar
* Fix issues 7029 and 6997
* Fix issue 7002
* Fix for 7017
* Fix issue 7017
* Fix issue 6999
* Fix issue on sprite.png
* Fix local font css file links to external google fonts
* Fix issue related to calendar icons
* Fix issue 6908
* Fix issue 6844
* Fix platform crash when market place is down
* Fix issue 6604
* Fix 6461
* Restore hideModal function that works on page workflow button but has issue on dashboard refuse and validate
* Fix issue 6587
* Fix issue 6667
* Fix issue 6692
* Fix issue 6595
* Fix issue 6632
* Fix issue 6638
* Fix issue 6639
* Fix issue 6658
* Fix issue 6598 regression
* Fix issue on melis-commerce status
* Fix issue 6590
* Fix issue 6598
* Fix issue 6561
* Fix related issue 6466
* Fix issue 6454
* Fix issue 6445
* Fix issue 6408
* Fix issue 6387
* Fix issue 6378
* Fix issue 6376
* Fix issue 6360
* Fix related issue 6359
* Fix issue 6348
* Fix issue 6336
* Fix issue 6322
* Fix issue 6411
* Fix issue 6324
* Fix issue 6380
* Fix issue on 6426
* Fix issue 6375
* Fix fancytree issue
* Fix issue 6320
* Fix issue 6356
* Fix issue 6356 in site tools then sites
* Fix issue 6317
* Fix dataTable table header background
* Fix issue on 6305 and 6307
### Changed
* User connection date
* Related fix issue 7017
* User connection list
* Revert datetimepicker
* Datepicker is okay, issue on datetimepicker only display the time widget
* Related to datetimepicker issue
* Check fix issue 7030
* Checking issue 7003
* 302 issue updating zones in user update
* User update 302 issues
* Update on issue 6977
* Edit
* Related on melis-calendar
* Edit on MelisCoreModulesService add if folders only
* Related to melis-design issue
* GetViewContent added condition replacement single quote
* Edit on fancytree js
* Update related to jquery migration
* Jquery migration related
* Edit related to melis-cms-comments
* Edit related to private modules
* Edit related for private modules
* Related edits on melis-cms-comments and melis-cms-blog
* Replace icons.gif
* Checking issue 6763
* Checking on worflow issue
* Edit worflow hideModal
* Edit hide modal function
* Edit workflow
* Workflow issue
* Checking 6461
* Check issue 6461
* Checking on workflow issue
* Checking worflow issue
* Checking issue 6525 6561
* Checking issue 6461
* Update on fix 6587
* Update
* Reload table timeout
* Debuging
* Debugging
* Update current user
* Translation
* Interface roles translations
* Update on bubble plugin html
* MelisInitDataTable action column
* Users select factory
* Checking mobile responsive
* Check issue on dev3 and dev5
* Update on dev3 and dev5
* Before merge of develop branch
* Related to issue 6455
* Notice and issue while fixing issue 6383
* Issue related to product association tab glyphicons
* In connection with issue 6444
* Update related to melis-design issue jQuery migration
* Jquery migration concat plugins
* Issue on bootstrapSwitch
* Checking bootstrapSwitch issue
* Checking issue on bootstrapSwitch
* Bs5 tab
* Checkin gissue on bubble plugin issue on dev3
* Edit on css for platform scheme
* Update jQuery 3.7.1 migration
* JQuery 3.7.1 migration
* Update on jQuery migration
### Dependencies & build
* Rebundle js
* Rebuilt the back-office bundle (bundle.js / bundle.css)
* Rebundle css and js
* Uncomment bundles generated code line
* Disable bundles-generated on src/Module.php
* Rebundle css
* Edit and rebundle
* Update and rebundle users.tools.js
* Rebundle js related zoneReload
* Rebundle js after merge
* Rebundle for melis-commerce status issue
* Rebundle
* Check issue on bundle-all.js
* Rebundle assets
* Rebundle js and css

## [5.2.8] - 2024-08-01
### Added
* Added laminas paginator to composer

## [5.2.7] - 2024-07-31
### Changed
* Update announcement tool translations

## [5.2.6] - 2024-07-31
### Added
* Added announcement plugin as default
* Added announcement tool as default user plugin

## [5.2.5] - 2024-07-31
### Added
* Added user in announcment toolk
* Added all plugins in mce
* Added announcment tool - create plugins
* Add announcement tool
### Fixed
* Fixed time design problem
### Changed
* Reduce character length
* Make announcment sortable
* Get user info
* Change announcement date format
* Make fields required

## [5.2.4] - 2024-07-25
### Added
* Added disabling bundle per platform
* Added option in the interface to disable loading bundle-all
* Added function to copy folders on making bundles
### Changed
* Remove cache when updating role

## [5.2.3] - 2024-07-11
### Added
* Add translation url in login
### Fixed
* Fix issue
* Fixed problem getting translations on js
### Dependencies & build
* Exclude get translations from bundle

## [5.2.2] - 2024-07-02
### Added
* Added function to copy necessary files to generated bundle folder
* Added loader on cms plugin menus
### Fixed
* Fix issue on melis cms plugin menu loader
### Changed
* Reload after rebundling all assets
* Remove cache when changing language
### Dependencies & build
* Rebundle js

## [5.2.1] - 2024-06-10
### Added
* Adde curl option to get file content
### Fixed
* Fixed problem pointing plugins on tinymce
### Changed
* Transfer minifier instance

## [5.2.0] - 2024-06-06
### Added
* Added serliazer and minifier dependency
* Added auto generation of bundle file
* Added scheme css file time
* Add saving of bundle time
* Add functionality to rebundle all assets
* Added option to activate/deactivate cache in platform tool and included filesystem on core loaded module
* Added cache system on platform
### Fixed
* Fixed problem rebundling assets
* Fixed problem on loading dash menu plugins
* Fixed problem loading fonts from custom module
* Fixed problem getting module config
* Fixed problem combining js files
* Fix dashboard menu plugins not showing
* Fixed core bubble plugin problem when marketplace is deactivated
* Fixed problem on deleting cache
* Fixed problem on empty session
* Fixed cache renderer clonflict cms twig
### Changed
* Remove dashboard plugin menu from showing on first load even if dash is emppty since its already incache
* Update scheme css file time
* Load dashboard plugins menu only once
* Temporary disable market place request
* Update dashboard plugins menu
* Run ajax on bubble plugins when cached
* Update dashboard cache
* Apply cache on dashboard plugins
### Dependencies & build
* Set melis platform dependency version to 5.2
* Rebundle
* Delete generated bundle when updating module lists
* Rebundle login assets
* Rebundle assets

## [5.1.3] - 2024-05-08
### Fixed
* Fix issue 6287
* Fix 6287 issue

## [5.1.2] - 2024-05-06
### Fixed
* Fix dashboard issue on mobile responsive
* Fix dashboard issue on bubble plugin
* Fix dashboard issue
* Fix dashboard issue on zoomed and scaling
* Fix dashboard issue on zoom and scaling
### Changed
* Checking dashboard for scaling on laptop

## [5.1.1] - 2024-04-08
### Added
* Added the available tinymce plugins in build folder
* Added the fullscreen plugin
### Fixed
* Fix scroll to tinymce dialog box
* Fix site tree view modal scroll to view on tinymce dialog box
* Fix issue on site tree view modal
* Fix issue on tinymce configs
* Fix issue 6104 on additional found on insert edit links
* Fix issue 4906
* Fix issue 6122
* Fixes issues 3568 and 3682
* Fix issue 6104
* Fix issue 6108
* Fix issue 6102
* Fixed problem loading dashboard plugin
* Fixed problem loadding js callbacks on dashboard plugins
### Changed
* Edit fix on scroll tinymce dialog box
* Tinymce update
* Tinymce updates
* Tinymce type tool with full toolbar buttons
* Checking on dev3
* Checking issues on dev3
* Checking issues 6104 and 6103
* Remove console log
* Checking scroll to view function
* Edit on renamed tinymce toolbar item
* Update on melis_tinymce.js
* Updated melis_tinymce.js
* Update on tinymce
* Update on tinymce, minitemplate and moxiemanager
* Update on tinymce, mini templates and moxiemanager
* Update on tinymce, mini template and moxiemanager
* Update on tinymce and mini template
* Revert tool.php
* Update on options and plugins for tinymce 6.7.0
* Changes
* Update on mini template
* Changes on tinymce update
* Update testing on minitemplate
* Update testing minitemplate
* Update on minitemplates
* Update on minitemplate
* Update on mini templates
* Update tinymce 6 and mini template
* Clean interface
* Update on tinymce 6.7.0
* Update on tinymce 6
* Update also the tinymce under public/assets/components/helpers to 6.7.0 aside from the tinymce under public/js/library
### Dependencies & build
* Rebundle js

## [5.1.0] - 2024-02-13
### Security
* Deprecated error on reset user rights
### Added
* Added Rizas fixed and rebundle assets
* Added symfony var dumper
* Added symfony finder in composer.json
* Create function to format date
* Create function to replace utf_encode
### Fixed
* Fix wrong display of DateField
* Fixed session problem
* Fixed problem passing null value
* Fixed problem on strpos warning
* Fixed problem on passing null on strreplace
* Fixed problem on preg_replace passing null
* Fix deprecated strftime
* Fixed str_replace error on null data
* Fixed problem exporting user datas
* Fixed depreciation problem on passing null value
* Fixed problem on dynamic properties depreciation
* Fixed deprecated problem on php 8.2 and 8.3
* Fixed preg_replace problem on empty string
* Fixed problem on listner deprecated warning
### Changed
* Set melisplatform versions to 5.1
* Sudo chmod
* Deprecated null on strtolower search on logs
* Deprecated null on explode
* Update date formatter
* Deprecated explode on setup
* Use psr container
* Updated functions to add optional modulearr param and update helper js to set the ajaxcallback and sortable option
### Dependencies & build
* Update laminas-db version
* Remove symfony/finder on main root and change composer/composer version
* Update symfony service contracts version
* Update psr container version
* Update php version to 8.3 and its dependencies
* Updated js bundle

## [5.0.9] - 2023-10-09
### Added
* Added option in the interface to choose where to display certain interface
* Added some french translations
* Added feature to lock accounts
* Added optional key if want to display in left menu or not
* Added option to change language on datetimepicker
### Fixed
* Fix done
### Changed
* Refactored some code
* Refactored some codes
### Dependencies & build
* Commented disable_bundle

## [5.0.8] - 2023-09-28
### Changed
* Header action interface roles exclusion

## [5.0.7] - 2023-06-15
### Fixed
* Fixed some bugs for production

## [5.0.6] - 2023-06-15
### Security
* Added file permission
### Added
* Added default values for password duplicate and number of characters fields
* Added tooltips for password settings in other config page
* Added comments
* Added some fix
* Added french translations
* Added password complexity feature
* Added opcache_reset() upon saving of password settings
* Added config
* Added condition to check if password_validity_lifetime is set inside config file
### Fixed
* Fixed form validation regarding textbox allowing non-numeric values
### Changed
* Refactored code inside saveOtherConfigAction method
* Refactored code
* Refactored codes
* Refactored and improvements to code
* Refactored some codes
* Password expiry message now displays x days to change
* Changed some codes
* Reapplied opcache_reset()
* Changed some js codes
* Refactored some codes for password validity lifetime and also added password duplicate feature
* Refactored logic
* Created a default empty array for app.login file
* Created other config
* Created controller
### Dependencies & build
* Bundled js
* Bundled js and css files

## [5.0.5] - 2023-05-24
### Dependencies & build
* Rebundle js

## [5.0.4] - 2023-05-24
### Added
* Added script to update tables to utf8mb4
* Added callback when saving dashboard plugins data
### Changed
* Removed setting of charset so that it will inherit the db charset and collation
* Quick fix commented the matches variable on loader.js
* Update saving filters for mult select fields
### Dependencies & build
* Updated bundle
* Rebundle on fix

## [5.0.3] - 2023-03-02
### Fixed
* Fixed translation issue and css issue of there is no melis-cms module

## [5.0.2] - 2023-03-02
### Fixed
* Fixed properties button UI issue when there is no melis-design module

## [5.0.1] - 2023-03-01
### Added
* Added usr tags
### Changed
* Would now be able to render a modal and configure a form to save data to dashboard plugins just like in what we have for site plugins

## [5.0.0] - 2022-06-22
### Added
* Added feature to login using email
* Added psr container package
* Added handling
* Added php8 in the required packages
### Fixed
* Fix for 3024 datepicker active today
* Resolve deprecation
### Changed
* Updated build
* Make user email unique
* Updated error messages with translation variables
* Replace tab with space as per psr2
* Removed default value in send email func
* Updated usort
* Updated
* Used ObjectPropertyHydrator instead of deprecated ObjectProperty
* Updated for laminas package compatibility
* Changed ArraySerializable to ArraySerializableHydrator
### Dependencies & build
* Update melis package version to 5.0
* Updated functions that were affected with latest version of laminas packages
* Updated package versions
* Updated laminas mvc version
* Updated service mgr version
* Updated package version
* Updated versions of affected packages
* Updated symfony/service-contracts version
* Updated laminas service manager and mvc version
* Updated laminas hydrator and input filter version
* Updated laminas form version

## [3.1.0] - 2019-01-08
* Updated GDPR Tool
* Bugs fixes on Core Tools
* Updated webpack bundles (bundle.css and bundle.js)
