---
title: MelisCore module
package: melisplatform/melis-core
doc_type: module-documentation
audience: [users, developers, ai]
language: en
module_version: unversioned
last_reviewed: 2026-06-08
maintainer: Melis Technology
keywords: [core, back-office, login, users, roles, rights, dashboard, tools, datatable, menu, config, events, gdpr, email, translations, foundation, melis]
screenshots_dir: ./images
---

# MelisCore — Functional & Technical Documentation (for AI)

> **What this is.** MelisCore is the **back-office foundation** of the Melis platform — the part
> you log into, the menus and tools framework, the dashboard, and the **users / roles / rights**
> system. For developers it is also the **framework every other module is built on**: the base
> service + event system, the tool/DataTable convention, the menu/interface tree, the config,
> auth, email and GDPR services. **Every Melis module depends on MelisCore.**
>
> **How this document is organised — two clearly separated parts:**
> - **[Part A — Functional Guide](#part-a--functional-guide)** — for **users** and the chat
>   assistant: logging in, finding your way, managing users & rights, the system tools.
> - **[Part B — Technical Reference](#part-b--technical-reference)** — for **developers and AI**:
>   the framework (auth/rights, the tool & menu conventions, the event system, config, GDPR,
>   micro-services) with **code examples**.
>
> **Audience**: consumed by the **MelisAI** MCP (answers user questions, may be used by an AI to
> build things). Reviewed 2026-06-08.

---

## 0. The MelisCore platform foundation (this family of modules)

> These modules are the **foundation of the Melis platform** — collectively referred to as
> **"MelisCore"**. *MelisCore* proper (this module) is the back-office heart everything depends
> on; the other four are the infrastructure that installs, deploys, serves and migrates the
> platform. When working on or asking about one, the others are often relevant — follow the
> cross-links.

- **MelisCore** *(this module)* — the **back-office foundation**: login & sessions,
  users/roles/rights, the menu & tool (DataTable) framework, the dashboard, translations, config,
  email, GDPR, and the base service + event system every module extends. **Every module depends on it.**
- **MelisAssetManager** — serves each module's public assets (CSS/JS/images) & bundles them;
  module discovery. → [doc](../../../melis-asset-manager/etc/MelisAI/doc/MelisAssetManager.md)
- **MelisDbDeploy** — applies database migrations (each module's `install/dbdeploy/*.sql`).
  → [doc](../../../melis-dbdeploy/etc/MelisAI/doc/MelisDbDeploy.md)
- **MelisComposerDeploy** — runs Composer from inside the platform to install/update/remove
  modules. → [doc](../../../melis-composerdeploy/etc/MelisAI/doc/MelisComposerDeploy.md)
- **MelisInstaller** — the first-run installer wizard.
  → [doc](../../../melis-installer/etc/MelisAI/doc/MelisInstaller.md)

**Note:** beyond this foundation, MelisCore is the dependency at the bottom of every other module
(the CMS trio, all the tool modules). It defines the conventions (`MelisGeneralService` events,
`app.tools.php`, `app.interface.php`) those modules use.

---
---

# PART A — Functional Guide

## A1. What you do in MelisCore

MelisCore is the **back-office itself** — the application you log into to administer the platform.
From it you (and other modules' tools) work; MelisCore specifically gives you:

- **Logging in** and your session.
- The **navigation shell** — the left menu, the tools tree, the header, your profile.
- The **Dashboard** — your landing page with at-a-glance widgets.
- **Users, roles & rights** — create back-office users and control exactly what each can access.
- **System configuration** — platforms/environments, languages, transactional emails, logs,
  password/security policy, GDPR tools, and the Modules/marketplace.

Everything else you see in the back-office (the CMS, News, etc.) plugs **into** this shell.

## A2. Logging in

**Where:** `/melis/login`. Enter your **username** and **password**; optionally tick **Remember
me** (keeps you signed in for a day). There's a **Lost password** link, and a language selector.
After login you land on the **Dashboard**. The platform can lock an account after too many failed
attempts and can auto-log-out after inactivity (both are configurable — see Other config, §A6).

## A3. Finding your way — the back-office shell

- **Header** (top bar) — its right-side icons hold **notifications**, the **language switch**,
  your **user profile**, a "close all tabs" button, and **logout**.

  ![Header right icons](./images/meliscore-header-righticons.png)
  *The header's right-side icons — notifications, language, profile, logout.*

- **Left menu** — the **Dashboard** link and the **Tools tree**: every administration tool you're
  allowed to use, grouped into sections (e.g. *System Configuration*). Other modules add their
  tools here too.
- **Center** — the work area where the Dashboard and the tools open (as tabs).
- **Footer** — shows the platform/MelisCore **version**, handy when reporting an issue.

  ![Footer version](./images/meliscore-footer-version-meliscore.png)

What you see in the menu depends on your **rights** — you only see tools you're allowed to use.

## A4. The Dashboard

Your landing page after login. It shows **widgets** (dashboard plugins): recent activity, platform
news/announcements, notifications, and any widgets added by other modules (e.g. pages indicators,
prospect statistics).

![The dashboard](./images/meliscore-dashboard-empty.png)
*The Dashboard — a fresh one, ready to receive widgets.*

You add widgets from the dashboard's **plugin menu**, and arrange them by **drag-and-drop**; which
ones are available depends on your rights.

![Dashboard plugin menu](./images/meliscore-dashboardplugins-menu.png)
*The dashboard plugin menu — pick the widgets to place.*

## A5. Users, roles & rights — controlling access

**Where:** Tools tree → *System Configuration* → **Users**.

This is where you manage who can use the back-office and what they can do.

![Users list](./images/meliscore-tool-users-list.png)
*The Users tool — every back-office account, with their status and last login.*

Opening a user gives you tabs:

- **Information** — login, name, email, password, language, administrator flag.

  ![User — Information tab](./images/meliscore-tool-users-edit-tab-information.png)

- **Rights** — the **access tree**: tick which tools/sections this user may use. Anything not
  granted is **hidden from their menus** — this is how you give an editor the CMS but not user
  administration.

  ![User — Rights tab](./images/meliscore-tool-users-edit-tab-rights.png)
  *The rights tree — grant access tool by tool.*

  There's also an **exclusions** view, to hide specific interface items even within a granted area.

  ![User — Rights exclusions](./images/meliscore-tool-users-edit-tab-rights-exclusions.png)

- **Connections** — the user's **login history**.

  ![User — Connections tab](./images/meliscore-tool-users-edit-tab-connections.png)

- **Micro-services** — generate **API keys** so the user can call the platform's micro-service
  endpoints.

  ![User — generate an API key](./images/meliscore-tool-users-edit-tab-microservices-generate.png)
  ![User — API key generated](./images/meliscore-tool-users-edit-tab-microservices-generated.png)

**Roles** let you define a set of rights once and assign it to many users (instead of setting
rights person by person).

> Rights are powerful and exact: if someone "can't see a tool", it's almost always because their
> rights tree doesn't grant it (Users → edit the user/role → **Rights**).

## A6. System configuration tools

Under the Tools tree → *System Configuration*. These are the platform-wide settings — the least
obvious tools, so here's what each is for.

### Platforms — your environments

Manage the **environments** the platform runs in (dev / staging / production). Some configuration
differs per platform, and this is where you declare them.

![Platforms — list](./images/meliscore-tool-platforms-list.png)
![Platforms — edit](./images/meliscore-tool-platforms-edit.png)

You can also pick the back-office **colour scheme/theme** per platform — a quick visual cue for
"which environment am I on".

![Platform colour scheme](./images/meliscore-tool-platformscheme-1.png)
![Platform colour scheme (alt)](./images/meliscore-tool-platformscheme-2.png)

### Languages — the back-office languages

The **languages** (locale + name) available to back-office users and to the interface.

![Languages — list](./images/meliscore-tool-bolanguages-list.png)

### Emails management — transactional emails

Create and edit the platform's **transactional emails** (account creation, lost password…): the
email's properties (code, sender, reply-to) and its **HTML/text body per language**, with
replaceable tags like `[USER_NAME]`.

![Emails — list](./images/meliscore-tool-emailsmanagement-list.png)
![Emails — properties](./images/meliscore-tool-emailsmanagement-edit-properties.png)
![Emails — per-language body](./images/meliscore-tool-emailsmanagement-edit-language.png)

### Logs — the action log

A searchable **log of actions** (page publishes, user add/delete…), filterable by type, user and
date — useful for auditing and troubleshooting.

![Logs — list](./images/meliscore-tool-logs-list.png)

### Other config — security policy

Password and login security: **password expiry**, **account lock** after failed logins, password
history, and related settings.

![Other config](./images/meliscore-tool-other-config.png)

### GDPR — personal-data tooling

Search a person by name/email and, across all modules: **see the data** held on them, **anonymise**
it, and configure the **SMTP** used for GDPR notifications.

![GDPR — data](./images/meliscore-tool-gdpr-tab-data.png)
![GDPR — anonymisation](./images/meliscore-tool-gdpr-tab-anonymization.png)
![GDPR — SMTP](./images/meliscore-tool-gdpr-tab-smtp.png)

### Modules / Marketplace — features on/off

Install, update or remove **modules** (features) without a terminal, and manage the production
**asset bundle**.

![Modules — list](./images/meliscore-tool-modules-list.png)
![Modules — bundle](./images/meliscore-tool-modules-bundle.png)

### Announcements — dashboard messages

Create platform **announcements** shown to users on the dashboard.

![Announcements — list](./images/meliscore-tool-announcement-list.png)
![Announcements — edit](./images/meliscore-tool-announcement-edit.png)

## A7. Your profile

From the header, open your **profile** to edit your own details, change your **password**, and set
your **interface language**.

![Your profile](./images/meliscore-tool-profile-tab-profile.png)

## A8. Common tasks — "How do I…?"

- **Log in** → `/melis/login`.
- **Add a back-office user** → Tools → System Configuration → **Users** → add → fill details →
  assign rights.
- **Give someone access to a tool (or hide one)** → Users → edit the user (or their **role**) →
  the **Rights** tree → tick/untick the tool.
- **Change the password policy / lock settings** → System Configuration → **Other config**.
- **Edit the "account created" email** → System Configuration → **Emails management**.
- **Add a language** → System Configuration → **Languages**.
- **Install/remove a feature** → System Configuration → **Modules / Marketplace**.
- **Handle a GDPR request** → System Configuration → **GDPR** → search the person → see / anonymise.
- **Give a colleague API access** → Users → edit the user → **Micro-services** → generate a key.
- **Tell which environment I'm on** → the header **colour scheme** (set in Platforms) and the
  **footer version**.
- **Change my own password** → header → **profile**.

---
---

# PART B — Technical Reference

*MelisCore is the framework every other module builds on. The conventions below — services, the
tool & menu config, the event system — are used everywhere. Sections B0a–B0g are a hands-on
newcomer's guide; B1+ is the reference catalogue.*

## B0a. How a Melis module is organised

Every Melis module is a Laminas MVC module with a fixed skeleton. Copy this layout:

```
melis-mymodule/
├── composer.json            // name "melisplatform/melis-mymodule", "extra":{ "module-name":"MelisMyModule",
│                            //   "melis-module-category":"cms", "dbdeploy":true }, autoload PSR-4 "MelisMyModule\\":"src/"
├── config/
│   ├── module.config.php    // routes, service_manager aliases, controllers, form_elements, view_helpers, view_manager
│   ├── app.interface.php    // back-office menu entries / tool tabs (the "interface tree")  → B0d
│   ├── app.tools.php        // DataTable tools: columns, filters, action buttons, modals, forms  → B0e
│   └── app.microservice.php // (optional) expose service methods as JSON endpoints  → B9
├── src/
│   ├── Module.php           // getConfig() merges the config/*.php; onBootstrap() wires listeners
│   ├── Controller/          // back-office controllers (render actions + AJAX data/save actions)
│   ├── Service/             // business logic; services extend MelisGeneralService  → B0c
│   ├── Model/Tables/        // table gateways (if the module owns DB tables)
│   ├── Listener/            // event listeners (hook the platform / your own events)
│   └── Form/Factory/        // custom form elements (selects, pickers…)
├── view/melis-mymodule/...  // .phtml templates
├── public/{css,js,images}/  // assets, served by MelisAssetManager at /MelisMyModule/css/…
├── language/                // en_EN.interface.php, fr_FR.interface.php (tr_* keys)
├── install/                 // setup_structure.sql + dbdeploy/*.sql migrations (if dbdeploy:true)
└── etc/MarketPlace/...       // marketplace metadata
```

`src/Module.php` is the entry point — it merges the config files and wires bootstrap listeners:

```php
namespace MelisMyModule;
use Laminas\Mvc\MvcEvent;
use Laminas\Stdlib\ArrayUtils;

class Module
{
    public function getConfig()
    {
        $config = [];
        foreach ([
            include __DIR__ . '/../config/module.config.php',
            include __DIR__ . '/../config/app.interface.php',
            include __DIR__ . '/../config/app.tools.php',
        ] as $file) {
            $config = ArrayUtils::merge($config, $file);
        }
        return $config;
    }

    public function onBootstrap(MvcEvent $e)
    {
        $events = $e->getApplication()->getEventManager();
        // attach only on the back-office route:
        // (new \MelisMyModule\Listener\MyListener())->attach($events);
    }

    public function getAutoloaderConfig() { return []; }
}
```

Then register the module in the platform's `config/modules.config.php` (the Modules tool does this
for you when you install via the marketplace — see [MelisComposerDeploy](../../../melis-composerdeploy/etc/MelisAI/doc/MelisComposerDeploy.md)).

## B0b. Controllers

Back-office controllers extend `MelisCore\Controller\MelisAbstractActionController`, which gives you
`$this->getServiceManager()`, `$this->getEventManager()`, `$this->getRequest()`, etc. A controller
typically has **render actions** (return a `ViewModel` for a zone) and **AJAX actions** (return a
`JsonModel`). Register them in `module.config.php`:

```php
'controllers' => ['invokables' => [
    'MelisMyModule\Controller\Tool' => \MelisMyModule\Controller\ToolController::class,
]],
```

## B0c. Create a service (with events)

Business logic lives in services that extend `MelisGeneralService`, so each method automatically
fires `*_start` / `*_end` events other modules can hook.

```php
namespace MelisMyModule\Service;
use MelisCore\Service\MelisGeneralService;

class MyThingService extends MelisGeneralService
{
    public function getThing($id)
    {
        $params  = $this->makeArrayFromParameters(__METHOD__, func_get_args());
        $params  = $this->sendEvent('melismymodule_get_thing_start', $params);   // before

        $table   = $this->getServiceManager()->get('MelisMyModuleTable');
        $results = $table->getEntryById($params['id'])->current();

        $params['results'] = $results;
        $params = $this->sendEvent('melismymodule_get_thing_end', $params);      // after
        return $params['results'];
    }
}
```

Register and use it:

```php
// module.config.php
'service_manager' => ['aliases' => [
    'MelisMyModuleService' => \MelisMyModule\Service\MyThingService::class,
]],

// anywhere with the service manager:
$thing = $sm->get('MelisMyModuleService')->getThing(42);
```

Hook another module's event (shared event manager, keyed by the firing module's identifier):

```php
$sm->get('SharedEventManager')->attach('MelisMyModule', 'melismymodule_get_thing_end',
    function ($e) { $p = $e->getParams(); /* alter $p['results'] */ }, 50);
```

## B0d. Add a menu entry / a tab (the interface tree)

`config/app.interface.php` merges your entry into the platform menu. To add a left-menu tool under
the CMS tools section, with a `forward` to the action that renders it:

```php
return ['plugins' => ['meliscore' => ['interface' => ['meliscore_leftmenu' => ['interface' => [
    'meliscms_toolstree_section' => ['interface' => [
        'melismymodule_tool' => [
            'conf' => [
                'id'       => 'id_melismymodule_tool',
                'melisKey' => 'melismymodule_tool',     // the key used for rights (B0f) and zoneReload
                'name'     => 'tr_melismymodule_tool',   // translation key
                'icon'     => 'fa-star',
            ],
            'forward' => [
                'module'     => 'MelisMyModule',
                'controller' => 'Tool',
                'action'     => 'render-tool',            // ToolController::renderToolAction()
                'jscallback' => 'myModule.init();',
            ],
        ],
    ]],
]]]]]];
```

Page-editor tabs are added the same way under `meliscms_page` → `meliscms_tabs` (this is how the
*Historic* and *Scripts* tabs attach — see those modules' docs).

## B0e. Create a back-office tool (a DataTable) — end to end

This is the single most common thing you build. Four pieces:

**1) Declare the table in `config/app.tools.php`:**

```php
return ['plugins' => ['melismymodule' => ['tools' => [
    'melismymodule_tool' => [
        'conf'  => ['title' => 'tr_melismymodule_tool', 'id' => 'id_melismymodule_tool'],
        'table' => [
            'target'  => '#myThingTable',                       // the <table> id in the view
            'ajaxUrl' => '/melis/MelisMyModule/Tool/getData',   // the JSON data endpoint
            'dataFunction' => '',
            'filters' => [
                'left'   => [/* limit, site filter… render actions */],
                'center' => [/* search */],
                'right'  => [/* refresh, export… */],
            ],
            'columns' => [
                'thing_id'   => ['text' => 'tr_..._id',   'sortable' => true],
                'thing_name' => ['text' => 'tr_..._name', 'sortable' => true],
            ],
            'searchables'   => ['thing_id', 'thing_name'],
            'actionButtons' => [
                'edit'   => ['module'=>'MelisMyModule','controller'=>'Tool','action'=>'render-action-edit'],
                'delete' => ['module'=>'MelisMyModule','controller'=>'Tool','action'=>'render-action-delete'],
            ],
        ],
        'modals' => [/* see B0g */],
        'forms'  => [/* Laminas form configs used by the modals */],
    ],
]]]];
```

**2) The container action (renders the view, passing the DataTable JS config):**

```php
use Laminas\View\Model\ViewModel;

private function getTool()
{
    $tool = $this->getServiceManager()->get('MelisCoreTool');
    $tool->setMelisToolKey('melismymodule', 'melismymodule_tool');   // <plugin>, <tool key>
    return $tool;
}

public function renderToolAction()
{
    $view = new ViewModel();
    $view->setTemplate('melis-mymodule/tool/render-tool');
    $view->tableColumns = $this->getTool()->getColumns();
    // builds the DataTables init JS for the table id, sortable, with default order:
    $view->getToolDataTableConfig =
        $this->getTool()->getDataTableConfiguration('#myThingTable', true, false, ['order' => '[[0,"desc"]]']);
    return $view;
}
```

**3) The data action (returns the DataTables JSON):** reads the DataTables POST params
(`draw`, `start`, `length`, `order`, `search`), pulls a page of rows, returns the JSON shape
DataTables expects.

```php
use Laminas\View\Model\JsonModel;

public function getDataAction()
{
    $tool = $this->getTool();
    $colId   = array_keys($tool->getColumns());
    $draw    = (int) $this->params()->fromPost('draw');
    $start   = (int) $this->params()->fromPost('start');
    $length  = (int) $this->params()->fromPost('length');
    $order   = $this->params()->fromPost('order');                  // [['column'=>0,'dir'=>'asc']]
    $search  = $this->params()->fromPost('search')['value'] ?? '';
    $selCol  = $colId[$order[0]['column']];
    $dir     = $order[0]['dir'];

    $table = $this->getServiceManager()->get('MelisMyModuleTable');
    $rows  = $table->getPagedData([
        'search'  => ['value' => $search, 'columns' => $tool->getSearchableColumns()],
        'order'   => ['key' => $selCol, 'dir' => $dir],
        'start'   => $start, 'limit' => $length,
    ])->toArray();

    return new JsonModel([
        'draw'            => $draw,
        'recordsTotal'    => $table->getTotalData(),
        'recordsFiltered' => $table->getTotalData($search),
        'data'            => $rows,           // each row keyed by column name
    ]);
}
```

**4) The view (`view/melis-mymodule/tool/render-tool.phtml`):** drop the table and echo the config
the controller built — that one line boots the DataTable:

```php
<table id="myThingTable" class="table table-striped"></table>
<?php echo $this->getToolDataTableConfig; ?>
```

Each **action button** (edit/delete) points to a small render action that returns the button HTML
for that row; its click handler opens a modal (next) or calls an AJAX action.

## B0f. Check a user's rights in custom code

Use `MelisCoreRights`. The simplest check — "may the current user reach this tool/menu key?":

```php
$rights = $sm->get('MelisCoreRights');
if (! $rights->canAccess('melismymodule_tool')) {
    // not allowed — hide the tool / refuse the action
}
```

`canAccess($melisKey)` internally fetches the current user's rights XML via `MelisCoreAuth` and
checks both the **tools tree** and the **interface** (exclusions). For a lower-level check against a
specific section/item, or for a user other than the logged-in one:

```php
$auth = $sm->get('MelisCoreAuth');
$xml  = $auth->getAuthRights();                                  // logged-in user's rights XML
$ok   = $rights->isAccessible($xml, 'meliscore_leftmenu', 'melismymodule_tool');

$user = $auth->getIdentity();                                    // melis_core_user row (id, login…)
```

Rights are an XML tree (granted tools under `meliscore_leftmenu`/`*_toolstree_section`, plus an
exclusion list under `meliscore_interface`); helpers: `getRightsValues($id, $isRole)`,
`createXmlRightsValues(...)`, `getToolSectionMap()`.

## B0g. Create a modal

A modal is declared in the tool's `modals` config and rendered by a controller action that returns
a form view; you open it from JS.

```php
// app.tools.php → tools.melismymodule_tool.modals
'modals' => [
    'melismymodule_edit_modal' => [
        'id'        => 'id_melismymodule_edit_modal',
        'tab-text'  => 'tr_melismymodule_edit',
        'content'   => ['module'=>'MelisMyModule','controller'=>'Tool','action'=>'render-edit-form'],
    ],
],
```

```php
// the render action returns the modal body (a form):
public function renderEditFormAction()
{
    $form = $this->getTool()->getForm('melismymodule_tool_form');   // Laminas form from app.tools.php
    $view = new ViewModel(['form' => $form]);
    $view->setTerminal(true);
    return $view;
}
```

```javascript
// open it from JS (MelisCore's helper, available as melisHelper):
melisHelper.createModal(
    zoneId,                 // the zone hosting the modal
    'melismymodule_edit_modal',
    false,
    { thingId: id },        // params passed to the render action
    modalUrl,
    function () { /* onClose */ }
);
```

## B0h. View & JS helpers you'll use

- **View helpers** (in `.phtml`): `MelisDataTable` (the table builder behind
  `getToolDataTableConfig`), plus the form/translation helpers. From other layers, the CMS/front
  helpers (`MelisTag`, `MelisLink`, `MelisMenu`…) live in MelisFront.
- **JS helpers** (`MelisCore/js/core/melisHelper.js`, global `melisHelper`):
  `zoneReload(melisKey, params)` (re-render a zone via AJAX), `createModal(...)`,
  `melisOkNotification(title, msg)` / `melisKoNotification(...)`, `tabOpen/tabClose/tabSwitch`,
  `loadingZone(sel)` / `removeLoadingZone(sel)`. WYSIWYG: `melisTinyMCE.createTinyMCE('tool', sel, {})`.

---

## B1. Metadata & dependencies

| Item | Value |
|---|---|
| Package | `melisplatform/melis-core` · category `core` · namespace `MelisCore\` |
| Requires | PHP `^8.1|^8.3` (+ ext intl/json/openssl/pdo_mysql), `composer/composer`, `laminas/laminas-*` (mvc, i18n, session, form, hydrator, …) |
| Owns DB tables | Yes — users, roles, langs, platform, logs, emails, dashboards, GDPR config… (§B11) |

## B2. The base service & event system (used by every module)

`MelisCore\Service\MelisGeneralService` (alias `MelisGeneralService`) is the **base class most
platform services extend**. It is event-aware: a service method fires a `*_start` event before and
a `*_end` event after, letting other modules intercept. This is the platform's main extension seam.

```php
// Inside a service method:
$arr = $this->makeArrayFromParameters(__METHOD__, func_get_args());
$arr = $this->sendEvent('mymodule_service_do_thing_start', $arr);   // before
// … do the work, set $arr['results'] …
$arr = $this->sendEvent('mymodule_service_do_thing_end', $arr);     // after
return $arr['results'];
```

```php
// Hooking another module's event (shared event manager, by module identifier):
$sharedEvents->attach('MelisCore', 'meliscore_tooluser_savenew_end', function ($e) {
    $p = $e->getParams();   // e.g. ['typeCode' => 'CORE_USER_ADD', 'itemId' => $userId, …]
    // react: provision defaults, send a welcome email…
}, 100);
```

Common core events: `meliscore_tooluser_savenew_start`/`_end`, `…delete_start`/`_end`,
`…save_start`/`_end`, `melis_core_check_user_rights`, the GDPR events (§B9),
`meliscore_install_create_new_user`, `melis_core_new_platform`.

## B3. Authentication & rights (with examples)

**`MelisCoreAuth`** (`MelisCoreAuthService`, extends Laminas auth) — login & session against
`melis_core_user`:

```php
$auth = $sm->get('MelisCoreAuth');
if ($auth->hasIdentity()) {
    $user   = $auth->getIdentity();      // the melis_core_user row
    $rights = $auth->getAuthRights();    // the user's rights XML
}
$hash = $auth->encryptPassword($plain);
$ok   = $auth->isPasswordCorrect($provided, $stored);
```

**`MelisCoreRights`** (`MelisCoreRightsService`) — does this user reach this tool/item?

```php
$rights = $sm->get('MelisCoreRights');
$xml = $auth->getAuthRights();
if ($rights->isAccessible($xml, $sectionId, $itemId)) { /* allowed */ }
$rights->canAccess('meliscore_tool_user');
```

Rights are stored as an **XML tree** in `melis_core_user.usr_rights` (and per role in
`melis_core_user_role.urole_rights`): an **exclusion list** under `meliscore_interface`, and an
**inclusion tree** under `meliscore_leftmenu` / `meliscore_toolstree_section` /
`meliscms_toolstree_section`. Anything not granted is hidden from the menu.

## B4. The tool / DataTable framework (`app.tools.php` — every list tool uses this)

A back-office "tool" with a searchable, filterable table is declared in a module's
`config/app.tools.php` and rendered through `MelisCoreTool` + the `MelisDataTable` view helper.
The shape (used by almost every module documented in this repo):

```php
'plugins' => ['mymodule' => ['tools' => ['mymodule_tool_x' => [
    'conf'  => ['title' => 'tr_…', 'id' => 'id_…'],
    'table' => [
        'target'  => '#myTable',
        'ajaxUrl' => '/melis/MyModule/MyController/getData',
        'filters' => ['left' => [...], 'center' => [...], 'right' => [...]],   // limit/site/search/refresh…
        'columns' => ['col_id' => ['text' => 'tr_…', 'sortable' => true], /* … */],
        'searchables'   => ['col_id', 'col_name'],
        'actionButtons' => ['edit' => ['module'=>'MyModule','controller'=>'…','action'=>'…'], 'delete' => [...]],
    ],
    'export' => ['csvFileName' => 'export.csv'],     // optional CSV export
    'modals' => [...], 'forms' => [...],
]]]],
```

```php
// In the controller, read the tool config:
$tool = $sm->get('MelisCoreTool');
$tool->setMelisToolKey('mymodule', 'mymodule_tool_x');
$columns = $tool->getColumns();
$form    = $tool->getForm('mymodule_tool_x_form_new');
```

## B5. The interface / menu tree (`app.interface.php`)

Modules add menu entries, tools and **page/editor tabs** by merging into the interface tree. Each
node has a `conf` (id, `melisKey`, `name` translation key, `icon`, `rightsDisplay`), a `forward`
(module/controller/action to render it + a `jscallback`), optional `cache`, and nested `interface`
children. Example — add a tool under the CMS tools section:

```php
'plugins' => ['meliscore' => ['interface' => ['meliscore_leftmenu' => ['interface' =>
    ['meliscms_toolstree_section' => ['interface' => ['my_tool' => [
        'conf'    => ['id'=>'id_my_tool','melisKey'=>'my_tool','name'=>'tr_my_tool','icon'=>'fa-star'],
        'forward' => ['module'=>'MyModule','controller'=>'…','action'=>'render-…'],
    ]]]]]
]]]]
```

## B6. Config, dispatch & translation services

- **`MelisCoreConfig`** (`MelisCoreConfigService`) — merges all modules' config, resolves
  `tr_*` keys, and serves config by path, **per platform**, and merged/ordered forms:
  ```php
  $config = $sm->get('MelisCoreConfig');
  $node = $config->getItem('/meliscore/interface/meliscore_header/');
  $plat = $config->getItemPerPlatform('/meliscore/datas/');
  $form = $config->getFormMergedAndOrdered('myModule/forms/x', 'x');
  $form = $config->setFormFieldRequired($form, 'field', true);
  ```
- **`MelisCoreDispatch`** (`MelisCoreDispatchService`) — chain controller dispatches and
  accumulate `[success, errors, datas]` (used by multi-step saves, e.g. the page save orchestration
  in MelisCms).
- **`MelisCoreTranslation`** — loads `tr_*` interface/forms translations per locale.

## B7. Email & notifications

`MelisCoreBOEmailService` sends a templated transactional email by code (templates managed in the
Emails tool, table `melis_core_bo_emails*`):

```php
$sm->get('MelisCoreBOEmailService')->sendBoEmailByCode(
    'ACCOUNTCREATION', ['USER_NAME' => 'John'], 'john@doe.com', 'John Doe', $langId
);
```

## B8. GDPR framework

`MelisCoreGdprService` + three platform events let every module declare/extract/delete the personal
data it holds:

- `melis_core_gdpr_user_info_event` — search: a module returns the data it has on a person.
- `melis_core_gdpr_user_extract_event` — export that data (XML).
- `melis_core_gdpr_user_delete_event` — delete it.

```php
$sharedEvents->attach('MyModule', 'melis_core_gdpr_user_info_event', function ($e) {
    $search = $e->getParam('search');   // ['user_name'=>…, 'user_email'=>…, 'site'=>…]
    // return ['results' => ['MyModule' => ['icon'=>…, 'values' => ['columns'=>…, 'datas'=>…]]]]
});
```

The MelisCmsProspects doc shows a full consumer implementation.

## B9. Micro-services bus

Service methods can be exposed as JSON endpoints via `config/app.microservice.php`. Route:
`/melis/api[/:api_key][/:module]/service[/:service_alias[/:service_method]]` (e.g.
`/melis/api/MelisCore/service/MelisCoreLogService/getLog`). Inputs are validated by an
auto-generated form; API keys live in `melis_core_microservice_auth`.

## B10. Form element factories (common BO inputs)

Core registers the reusable form elements other modules use: `MelisText`, `MelisSelect`,
`MelisToggleButton`, `MelisCoreLanguageSelect`, `MelisCoreSiteSelect`, `MelisUserRoleSelect`,
`MelisCoreUserSelect` (Select2), `DateField` / `DatePicker` / `DateTimePicker`, `MelisCoreTinyMCE`
(WYSIWYG), `MelisCoreMultiValInput`, `MelisCoreLogTypeSelect`, `MelisCoreGdprModuleSelect`.

## B11. Key database tables

`melis_core_user` (users: login, password, `usr_rights` XML, admin, lang, role),
`melis_core_user_role` (roles + `urole_rights` XML), `melis_core_lang` (languages),
`melis_core_platform` (environments), `melis_core_bo_emails` / `_details` (email templates),
`melis_core_log` / `_log_type` / `_log_type_trans` (action logs), `melis_core_lost_password`,
`melis_core_user_connection_date` (login history), `melis_core_microservice_auth` (API keys),
`melis_core_dashboards` / `_dashboard_schema` (dashboards), `melis_core_plugins`,
`melis_core_gdpr_delete_config` / `_delete_emails_logs`, `melis_user_password_history`,
`melis_announcement`. Table gateways: `MelisCoreTableUser`, `…TableUserRole`, `…TableLang`,
`…TablePlatform`, `…TableBOEmails`, `…TableLog`, etc.

## B12. Key controllers, listeners & JS helpers

- **Controllers**: `MelisAuthController` (login/auth/logout), `IndexController` (layout zones),
  `ToolUserController` (user CRUD), `DashboardController` / `DashboardPluginsController`,
  `UserProfileController`, `TreeToolsController` (the tools menu), `Language`/`Platforms`/
  `EmailsManagement`/`Log`/`Modules` controllers, `MelisCoreMicroServiceController`,
  `MelisCoreGdprController`, `PluginViewController` (renders interface zones via forward/AJAX).
- **Bootstrap listeners** (wired in `Module.php::onBootstrap`): auth success (log connection,
  online status), check-user-rights per request, rights-tree-view builders, flash messenger,
  password-history, platform URL scheme, TinyMCE config, micro-service route params, dashboard
  plugin init, table-column display, clear-cache, PHP warning catcher.
- **JS helpers** (`public/js/core/`): `zoneReload()`, `createModal()`,
  `melisOkNotification()`/`melisKoNotification()`, `tabOpen()`/`tabClose()`/`tabSwitch()`,
  `loadingZone()`; TinyMCE helper `melisTinyMCE.createTinyMCE(...)`.

## B13. Quick code map

```
melis-core/
├── composer.json                 → category core; laminas + composer deps
├── config/
│   ├── module.config.php         → routes (login, zoneview, api, dashboard-plugin…), services, form elements
│   ├── app.interface.php         → the back-office shell + System Configuration tools tree
│   ├── app.tools.php             → the DataTable tools (Users, Logs, Emails…)
│   ├── app.toolstree.php         → the tools-tree grouping
│   └── app.microservice.php      → micro-service endpoints
├── src/
│   ├── Module.php                → bootstrap; wires ~25 listeners; auth/rights setup
│   ├── Controller/               → 38 controllers (Auth, Index, ToolUser, Dashboard, Gdpr, MicroService…)
│   ├── Service/                  → 43 services (MelisGeneralService base, Auth, Rights, Config, Dispatch, Tool, BOEmail, Gdpr, Log, User…)
│   ├── Listener/                 → 25 bootstrap listeners
│   ├── Model/Tables/             → 25 table gateways (users, roles, langs, platform, logs, emails…)
│   ├── Form/ · Validator/ · Factory/ (MelisAbstractFactory) · View/Helper/ (MelisDataTable…) · Support/
├── public/ (BO JS/CSS, TinyMCE) · language/ · install/ (SQL)
└── etc/   MarketPlace + MelisAI/doc (this doc)
```

---

## Screenshot index

Filename → content lookup for the MelisAI MCP. All under `./images/`.

| Image file | Content |
|---|---|
| `meliscore-header-righticons.png` | Header right icons (notifications, language, profile, logout) |
| `meliscore-footer-version-meliscore.png` | Footer — MelisCore/platform version |
| `meliscore-dashboard-empty.png` | The Dashboard |
| `meliscore-dashboardplugins-menu.png` | Dashboard plugin menu (pick widgets) |
| `meliscore-tool-users-list.png` | Users tool — list of accounts |
| `meliscore-tool-users-edit-tab-information.png` | User edit — Information tab |
| `meliscore-tool-users-edit-tab-rights.png` | User edit — Rights tree |
| `meliscore-tool-users-edit-tab-rights-exclusions.png` | User edit — Rights exclusions |
| `meliscore-tool-users-edit-tab-connections.png` | User edit — Connections (login history) |
| `meliscore-tool-users-edit-tab-microservices-generate.png` | User edit — generate an API key |
| `meliscore-tool-users-edit-tab-microservices-generated.png` | User edit — API key generated |
| `meliscore-tool-platforms-list.png` | Platforms tool — list |
| `meliscore-tool-platforms-edit.png` | Platforms tool — edit |
| `meliscore-tool-platformscheme-1.png` | Platform colour scheme |
| `meliscore-tool-platformscheme-2.png` | Platform colour scheme (alt) |
| `meliscore-tool-bolanguages-list.png` | Languages tool — list |
| `meliscore-tool-emailsmanagement-list.png` | Emails management — list |
| `meliscore-tool-emailsmanagement-edit-properties.png` | Emails management — properties |
| `meliscore-tool-emailsmanagement-edit-language.png` | Emails management — per-language body |
| `meliscore-tool-logs-list.png` | Logs tool — list |
| `meliscore-tool-other-config.png` | Other config (security policy) |
| `meliscore-tool-gdpr-tab-data.png` | GDPR tool — data |
| `meliscore-tool-gdpr-tab-anonymization.png` | GDPR tool — anonymisation |
| `meliscore-tool-gdpr-tab-smtp.png` | GDPR tool — SMTP |
| `meliscore-tool-modules-list.png` | Modules tool — list |
| `meliscore-tool-modules-bundle.png` | Modules tool — asset bundle |
| `meliscore-tool-announcement-list.png` | Announcements — list |
| `meliscore-tool-announcement-edit.png` | Announcements — edit |
| `meliscore-tool-profile-tab-profile.png` | Your profile |

---

*Document for AI consumption (MelisAI MCP) — `melisplatform/melis-core`. Part A = functional guide
for users; Part B = technical reference with examples for developers/AI. Part of (and the heart of)
the MelisCore platform foundation. Last reviewed 2026-06-08.*
