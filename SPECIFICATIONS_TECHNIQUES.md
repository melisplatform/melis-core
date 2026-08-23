# Spécifications Techniques Détaillées - MelisCore v3.1.0

**Date de rédaction :** 30 janvier 2026  
**Version du projet :** 3.1.0  
**Auteur :** IA Assistant  
**Classification :** Document technique interne

---

## 📋 Table des matières

1. [Vue d'ensemble technique](#1-vue-densemble-technique)
2. [Architecture système](#2-architecture-système)
3. [Spécifications des composants](#3-spécifications-des-composants)
4. [Modèle de données](#4-modèle-de-données)
5. [API et interfaces](#5-api-et-interfaces)
6. [Sécurité](#6-sécurité)
7. [Performance et scalabilité](#7-performance-et-scalabilité)
8. [Déploiement et infrastructure](#8-déploiement-et-infrastructure)
9. [Intégrations](#9-intégrations)
10. [Maintenance et évolution](#10-maintenance-et-évolution)

---

## 1. Vue d'ensemble technique

### 1.1 Identité du projet

| Propriété | Valeur |
|-----------|--------|
| **Nom** | MelisCore |
| **Version** | 3.1.0 |
| **Type** | Module Core CMS Back-Office |
| **Licence** | OSL-3.0 (Open Software License) |
| **Organisation** | Melis Technology |
| **Repository** | https://github.com/melisplatform/melis-core |

### 1.2 Stack technique

#### Backend
```
Langage          : PHP ^8.1 | ^8.3
Framework        : Laminas MVC ^3.7 (ex-Zend Framework)
Base de données  : MySQL 5.7+
Serveur web      : Apache 2.4+ / Nginx 1.18+
Gestionnaire deps: Composer 2.5.8
```

#### Frontend
```
JavaScript       : ES5/ES6 (637,026 lignes)
CSS              : CSS3 + préprocesseurs
Éditeur WYSIWYG  : TinyMCE
Bibliothèque UI  : jQuery + plugins
Bundler          : Webpack
```

### 1.3 Métriques du projet

```
Lignes de code PHP         : 63,874
Lignes de code JavaScript  : 637,026
Nombre de fichiers assets  : 2,004
Nombre de contrôleurs      : ~15
Nombre de services         : ~30
Nombre de tables DB        : ~25
Migrations SQL             : ~30
```

### 1.4 Prérequis système

#### Serveur
```
OS              : Linux (Ubuntu 20.04+, Debian 10+, CentOS 8+)
PHP             : 8.1.0+ ou 8.3.0+
Extensions PHP  : intl, json, openssl, pdo_mysql, mbstring, curl, gd
MySQL           : 5.7+ ou MariaDB 10.3+
Mémoire RAM     : 2GB minimum, 4GB recommandé
Espace disque   : 5GB minimum pour l'application
Apache/Nginx    : Avec mod_rewrite activé
```

#### Développement
```
Composer        : 2.5.8+
Node.js         : 16+ (pour Webpack)
npm             : 8+
Git             : 2.30+
PHPUnit         : 9+ (tests)
```

---

## 2. Architecture système

### 2.1 Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Navigateur │  │   TinyMCE    │  │  JavaScript/     │   │
│  │  Web        │  │   Editor     │  │  jQuery Plugins  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      WEB SERVER LAYER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Apache / Nginx                          │   │
│  │  - URL Rewriting                                     │   │
│  │  - Static Asset Serving                              │   │
│  │  - HTTPS/SSL Termination                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER (PHP)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Laminas MVC Framework                   │   │
│  │                                                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │Controllers │  │  Services  │  │  Listeners   │  │   │
│  │  │  (MVC)     │  │  (Business)│  │  (Events)    │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │   Models   │  │   Forms    │  │  Validators  │  │   │
│  │  │(TableGW)   │  │ (Laminas)  │  │              │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │   │
│  │  │   Views    │  │   Helpers  │  │Configuration │  │   │
│  │  │  (.phtml)  │  │            │  │   (Arrays)   │  │   │
│  │  └────────────┘  └────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER (MySQL)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   MySQL Database                      │   │
│  │                                                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │  Users   │ │  Roles   │ │  Logs    │ │ Emails │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  │                                                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │Dashboard │ │Languages │ │Platforms │ │  GDPR  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Pattern architectural MVC détaillé

#### Model (Modèle de données)

**Responsabilités :**
- Accès et manipulation des données
- Logique métier de base
- Validation des données

**Composants :**
```
src/Model/
├── Tables/                    # Table Gateway Pattern
│   ├── MelisGenericTable.php # Classe de base abstraite
│   ├── MelisUserTable.php    # Gestion utilisateurs
│   ├── MelisLangTable.php    # Gestion langues
│   └── ...
├── Hydrator/                  # Transformation objet <-> array
│   ├── MelisUser.php
│   └── MelisResultSet.php
└── Entity/                    # Entités métier (optionnel)
```

**Exemple d'implémentation :**
```php
namespace MelisCore\Model\Tables;

class MelisUserTable extends MelisGenericTable
{
    const TABLE = 'melis_core_user';
    const PRIMARY_KEY = 'usr_id';
    
    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
    
    public function getUserOrderByName()
    {
        $select = $this->tableGateway->getSql()->select();
        $select->order(['usr_firstname' => 'asc', 'usr_lastname' => 'asc']);
        return $this->tableGateway->selectWith($select);
    }
    
    public function getLastLoggedInUsers($max = 5)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->where->isNotNull('usr_last_login_date');
        $select->order('usr_last_login_date DESC');
        $select->limit($max);
        return $this->tableGateway->selectWith($select);
    }
}
```

#### View (Vues)

**Responsabilités :**
- Affichage des données
- Génération HTML
- Interaction utilisateur

**Structure :**
```
view/
├── layout/                    # Layouts globaux
│   ├── layout.phtml          # Layout principal
│   └── login.phtml           # Layout login
├── melis-core/               # Vues du module
│   ├── index/                # Vues du controller Index
│   │   ├── login.phtml
│   │   ├── header.phtml
│   │   └── footer.phtml
│   ├── tool-user/            # Vues gestion utilisateurs
│   └── dashboard/            # Vues dashboard
├── error/                    # Pages d'erreur
│   ├── 404.phtml
│   └── error.phtml
└── warning/                  # Pages d'avertissement
```

**Exemple de vue :**
```php
<!-- view/melis-core/tool-user/user-list.phtml -->
<div class="user-list">
    <h2><?= $this->translate('tr_meliscore_user_list') ?></h2>
    
    <table class="table">
        <thead>
            <tr>
                <th><?= $this->translate('tr_meliscore_user_id') ?></th>
                <th><?= $this->translate('tr_meliscore_user_firstname') ?></th>
                <th><?= $this->translate('tr_meliscore_user_lastname') ?></th>
                <th><?= $this->translate('tr_meliscore_user_email') ?></th>
                <th><?= $this->translate('tr_meliscore_actions') ?></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($this->users as $user): ?>
            <tr>
                <td><?= $this->escapeHtml($user->usr_id) ?></td>
                <td><?= $this->escapeHtml($user->usr_firstname) ?></td>
                <td><?= $this->escapeHtml($user->usr_lastname) ?></td>
                <td><?= $this->escapeHtml($user->usr_email) ?></td>
                <td>
                    <button class="btn-edit" data-id="<?= $user->usr_id ?>">
                        <?= $this->translate('tr_meliscore_edit') ?>
                    </button>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
```

#### Controller (Contrôleurs)

**Responsabilités :**
- Réception des requêtes HTTP
- Orchestration du flux applicatif
- Appel des services
- Retour des réponses (HTML/JSON)

**Structure :**
```
src/Controller/
├── MelisAbstractActionController.php  # Contrôleur de base
├── IndexController.php                # Page d'accueil, header, footer
├── MelisAuthController.php            # Authentification (81,524 lignes!)
├── ToolUserController.php             # Gestion utilisateurs
├── DashboardController.php            # Dashboard principal
├── DashboardPluginsController.php     # Plugins dashboard
├── EmailsManagementController.php     # Emails BO
├── LanguageController.php             # Gestion langues
├── LogController.php                  # Logs système
├── MelisCoreGdprAutoDeleteController.php  # GDPR
└── ...
```

**Exemple de contrôleur :**
```php
namespace MelisCore\Controller;

use Laminas\View\Model\JsonModel;
use Laminas\View\Model\ViewModel;

class ToolUserController extends MelisAbstractActionController
{
    /**
     * Liste des utilisateurs (retourne HTML)
     */
    public function listAction()
    {
        $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
        $users = $userTable->getUserOrderByName();
        
        $view = new ViewModel();
        $view->setVariable('users', $users);
        
        return $view;
    }
    
    /**
     * Sauvegarde d'un utilisateur (AJAX - retourne JSON)
     */
    public function saveAction()
    {
        $request = $this->getRequest();
        $translator = $this->getServiceManager()->get('translator');
        
        if (!$request->isPost()) {
            return new JsonModel([
                'success' => false,
                'error' => 'Invalid request method',
            ]);
        }
        
        $postValues = $request->getPost()->toArray();
        
        // Validation du formulaire
        $form = $this->getServiceManager()->get('FormElementManager')
            ->get('MelisCoreUserForm');
        $form->setData($postValues);
        
        if (!$form->isValid()) {
            return new JsonModel([
                'success' => false,
                'errors' => $form->getMessages(),
            ]);
        }
        
        // Sauvegarde
        try {
            $userTable = $this->getServiceManager()->get('MelisCoreTableUser');
            $userId = $userTable->save($postValues, $postValues['usr_id'] ?? null);
            
            // Déclenchement d'un événement
            $this->getEventManager()->trigger('meliscore_tooluser_save_end', $this, [
                'userId' => $userId,
            ]);
            
            return new JsonModel([
                'success' => true,
                'message' => $translator->translate('tr_meliscore_user_saved'),
                'userId' => $userId,
            ]);
        } catch (\Exception $e) {
            return new JsonModel([
                'success' => false,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
```

### 2.3 Service Layer (Couche service)

**Rôle :** Logique métier réutilisable, indépendante des contrôleurs.

**Services principaux :**

```php
// src/Service/MelisCoreAuthService.php
class MelisCoreAuthService extends AuthenticationService
{
    public function encryptPassword($password): string;
    public function isPasswordCorrect($provided, $stored): bool;
    public function getAuthRights(): string;
}

// src/Service/MelisCoreConfigService.php
class MelisCoreConfigService
{
    public function getItem($path): array;
    public function getFormMergedAndOrdered($path, $formKey): array;
    public function getItemPerPlatform($path): array;
}

// src/Service/MelisCoreRightsService.php
class MelisCoreRightsService
{
    const MELISCORE_PREFIX_INTERFACE = 'interface';
    const MELISCORE_PREFIX_RESSOURCE = 'ressource';
    
    public function isAccessible($rights, $prefix, $path): bool;
}

// src/Service/MelisCoreBOEmailService.php
class MelisCoreBOEmailService
{
    public function sendBoEmailByCode($code, $tags, $to, $name, $langId): bool;
    public function getEmailTemplate($code, $langId): array;
}
```

**Injection de dépendances :**

```php
// config/module.config.php
return [
    'service_manager' => [
        'factories' => [
            'MelisCoreAuth' => Factory\MelisCoreAuthServiceFactory::class,
            'MelisCoreConfig' => Factory\MelisCoreConfigServiceFactory::class,
            'MelisCoreRights' => Factory\MelisCoreRightsServiceFactory::class,
            'MelisCoreBOEmail' => Factory\MelisCoreBOEmailServiceFactory::class,
        ],
    ],
];
```

### 2.4 Event-Driven Architecture

**Mécanisme d'événements :**

```php
// Déclenchement d'un événement
$this->getEventManager()->trigger('meliscore_tooluser_save_end', $this, [
    'userId' => $userId,
    'data' => $userData,
]);

// Écoute d'un événement
// Dans Module.php
public function onBootstrap($e)
{
    $eventManager = $e->getApplication()->getEventManager();
    $sharedManager = $eventManager->getSharedManager();
    
    $sharedManager->attach(
        'MelisCore',
        'meliscore_tooluser_save_end',
        [$this, 'onUserSaved'],
        100 // Priorité
    );
}

public function onUserSaved($e)
{
    $userId = $e->getParam('userId');
    $data = $e->getParam('data');
    
    // Logique personnalisée
}
```

**Événements système :**

| Événement | Description | Paramètres |
|-----------|-------------|------------|
| `meliscore_tooluser_save_end` | Après sauvegarde utilisateur | userId, data |
| `melis_core_check_user_rights` | Vérification des droits | user |
| `melis_core_gdpr_user_info_event` | Recherche données GDPR | search |
| `melis_core_gdpr_user_extract_event` | Extraction données GDPR | selected |
| `melis_core_gdpr_user_delete_event` | Suppression données GDPR | selected |

---

## 3. Spécifications des composants

### 3.1 Module d'authentification

#### 3.1.1 Flux d'authentification

```
┌────────────┐
│ Utilisateur│
│ saisit     │
│ login/pwd  │
└─────┬──────┘
      │
      ▼
┌────────────────────────────────────────┐
│ 1. MelisAuthController::authenticateAction() │
│    - Récupération POST                 │
│    - Validation formulaire             │
└─────┬──────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────┐
│ 2. MelisCoreAuthService::authenticate()│
│    - Recherche utilisateur en DB       │
│    - Vérification password_verify()    │
└─────┬──────────────────────────────────┘
      │
      ├─ Succès ──────────────────────────┐
      │                                    ▼
      │                    ┌───────────────────────────┐
      │                    │ 3a. Création session      │
      │                    │     - Stockage identité   │
      │                    │     - Chargement droits   │
      │                    │     - Cookie remember me  │
      │                    └───────────────────────────┘
      │                                    │
      │                                    ▼
      │                    ┌───────────────────────────┐
      │                    │ 4a. Update last_login_date│
      │                    │     - usr_last_login_date │
      │                    │     - usr_is_online = 1   │
      │                    └───────────────────────────┘
      │                                    │
      │                                    ▼
      │                    ┌───────────────────────────┐
      │                    │ 5a. Redirection Dashboard │
      │                    └───────────────────────────┘
      │
      └─ Échec ───────────────────────────┐
                                           ▼
                          ┌────────────────────────────┐
                          │ 3b. Log tentative échec    │
                          │     - Incrément compteur   │
                          │     - Vérif rate limiting  │
                          └────────────────────────────┘
                                           │
                                           ▼
                          ┌────────────────────────────┐
                          │ 4b. Retour message erreur  │
                          │     - "Invalid credentials"│
                          └────────────────────────────┘
```

#### 3.1.2 Gestion des sessions

**Configuration session :**
```php
// config/session.config.php
return [
    'session_config' => [
        'name' => 'MELISSESSID',
        'cookie_lifetime' => 86400,  // 24 heures
        'cookie_path' => '/',
        'cookie_domain' => '',
        'cookie_secure' => true,      // HTTPS uniquement
        'cookie_httponly' => true,    // Protection XSS
        'cookie_samesite' => 'Strict',// Protection CSRF
        'gc_maxlifetime' => 86400,
        'remember_me_seconds' => 86400,
    ],
    'session_storage' => [
        'type' => 'Laminas\Session\Storage\SessionArrayStorage',
    ],
];
```

**Stockage session :**
```php
// Laminas Session Container
$container = new Container('Melis_Auth');
$container->userId = $user->usr_id;
$container->userName = $user->usr_firstname . ' ' . $user->usr_lastname;
$container->userRights = $user->usr_rights;
$container->userLang = $user->usr_lang_id;
```

#### 3.1.3 Remember Me (Cookie persistant)

```php
// Création cookie remember me
if ($rememberMe) {
    $cookieValue = base64_encode($username); // ⚠️ À sécuriser!
    
    setcookie(
        'remember',
        $cookieValue,
        time() + 86400, // 24h
        '/',
        '',
        true,  // Secure
        true   // HttpOnly
    );
}

// Lecture cookie au chargement login
if (isset($_COOKIE['remember'])) {
    $username = base64_decode($_COOKIE['remember']);
    $loginForm->get('usr_login')->setValue($username);
}
```

#### 3.1.4 Auto-logout

```php
// config/app.interface.php
'auto_logout' => [
    'after' => 86400, // secondes
],

// Mécanisme (à implémenter via JavaScript)
// public/js/core/auth.js
setInterval(function() {
    checkLastActivity();
    if (inactivityTime > autoLogoutThreshold) {
        window.location.href = '/logout';
    }
}, 60000); // Vérification chaque minute
```

### 3.2 Module de gestion des utilisateurs

#### 3.2.1 Schéma de données utilisateur

```sql
CREATE TABLE IF NOT EXISTS `melis_core_user` (
  `usr_id` INT(11) NOT NULL AUTO_INCREMENT,
  `usr_status` INT(11) NOT NULL DEFAULT '1',         -- 0=inactif, 1=actif
  `usr_login` VARCHAR(255) NOT NULL,                 -- Login unique
  `usr_email` VARCHAR(255) NOT NULL,                 -- Email unique
  `usr_password` VARCHAR(255) NOT NULL,              -- Hash bcrypt
  `usr_firstname` VARCHAR(255) NOT NULL,
  `usr_lastname` VARCHAR(255) NOT NULL,
  `usr_lang_id` INT(11) NOT NULL DEFAULT 1,          -- FK melis_core_lang
  `usr_role_id` INT(11) NOT NULL DEFAULT 1,          -- FK melis_core_user_role
  `usr_admin` INT NOT NULL DEFAULT 0,                -- 0=non, 1=oui (super admin)
  `usr_rights` TEXT NULL DEFAULT NULL,               -- Droits XML
  `usr_image` MEDIUMBLOB NULL DEFAULT NULL,          -- Avatar
  `usr_creation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usr_last_login_date` DATETIME NULL DEFAULT NULL,  -- Dernière connexion
  `usr_is_online` TINYINT(1) NULL DEFAULT 0,         -- En ligne actuellement
  PRIMARY KEY (`usr_id`),
  UNIQUE KEY `uk_usr_login` (`usr_login`),
  UNIQUE KEY `uk_usr_email` (`usr_email`),
  KEY `idx_usr_status` (`usr_status`),
  KEY `idx_usr_role_id` (`usr_role_id`),
  KEY `fk_usr_lang_id` (`usr_lang_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.2.2 API ToolUserController

**Endpoints :**

| Action | Méthode | URL | Description |
|--------|---------|-----|-------------|
| `listAction()` | GET | `/admin/user/list` | Liste paginée des utilisateurs |
| `getAction()` | GET | `/admin/user/get/{id}` | Détails d'un utilisateur |
| `saveAction()` | POST | `/admin/user/save` | Créer/modifier utilisateur |
| `deleteAction()` | POST | `/admin/user/delete/{id}` | Supprimer utilisateur |
| `activateAction()` | POST | `/admin/user/activate/{id}` | Activer un utilisateur |
| `deactivateAction()` | POST | `/admin/user/deactivate/{id}` | Désactiver un utilisateur |

**Exemple de requête saveAction() :**

```http
POST /admin/user/save HTTP/1.1
Content-Type: application/x-www-form-urlencoded

usr_id=&
usr_login=jdoe&
usr_email=john.doe@example.com&
usr_password=MySecureP@ss123&
usr_firstname=John&
usr_lastname=Doe&
usr_lang_id=1&
usr_role_id=2&
usr_admin=0&
usr_status=1
```

**Réponse succès :**
```json
{
    "success": true,
    "message": "User saved successfully",
    "userId": 42,
    "textTitle": "Success",
    "textMessage": "The user John Doe has been created."
}
```

**Réponse échec :**
```json
{
    "success": false,
    "errors": {
        "usr_email": {
            "emailAddressInvalidFormat": "Email format is invalid"
        },
        "usr_password": {
            "passwordTooShort": "Password must be at least 8 characters"
        }
    },
    "textTitle": "Validation Error",
    "textMessage": "Please correct the errors below."
}
```

#### 3.2.3 Validation des formulaires utilisateur

```php
// config/app.forms.php - meliscore_user_form
'elements' => [
    [
        'spec' => [
            'name' => 'usr_login',
            'type' => 'Text',
            'options' => [
                'label' => 'tr_meliscore_user_login',
            ],
            'attributes' => [
                'id' => 'usr_login',
                'required' => 'required',
            ],
        ],
    ],
    [
        'spec' => [
            'name' => 'usr_email',
            'type' => 'Email',
            'options' => [
                'label' => 'tr_meliscore_user_email',
            ],
            'attributes' => [
                'id' => 'usr_email',
                'required' => 'required',
            ],
        ],
    ],
    [
        'spec' => [
            'name' => 'usr_password',
            'type' => 'Password',
            'options' => [
                'label' => 'tr_meliscore_user_password',
            ],
            'attributes' => [
                'id' => 'usr_password',
            ],
        ],
    ],
],
'input_filter' => [
    'usr_login' => [
        'name' => 'usr_login',
        'required' => true,
        'validators' => [
            [
                'name' => 'StringLength',
                'options' => [
                    'encoding' => 'UTF-8',
                    'min' => 3,
                    'max' => 50,
                ],
            ],
            [
                'name' => 'Regex',
                'options' => [
                    'pattern' => '/^[a-zA-Z0-9._-]+$/',
                    'messages' => [
                        'regexNotMatch' => 'Login can only contain letters, numbers, dots, underscores and hyphens',
                    ],
                ],
            ],
        ],
        'filters' => [
            ['name' => 'StringTrim'],
            ['name' => 'StripTags'],
        ],
    ],
    'usr_email' => [
        'name' => 'usr_email',
        'required' => true,
        'validators' => [
            ['name' => 'EmailAddress'],
        ],
        'filters' => [
            ['name' => 'StringTrim'],
            ['name' => 'StripTags'],
        ],
    ],
    'usr_password' => [
        'name' => 'usr_password',
        'required' => false, // Seulement pour création
        'validators' => [
            [
                'name' => 'MelisCore\Validator\MelisPasswordValidator',
                'options' => [
                    'min_length' => 8,
                    'require_uppercase' => true,
                    'require_lowercase' => true,
                    'require_digit' => true,
                    'require_special' => false,
                ],
            ],
        ],
    ],
],
```

### 3.3 Module Dashboard

#### 3.3.1 Architecture du dashboard

```
┌──────────────────────────────────────────────────────────────┐
│                      DASHBOARD CONTAINER                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  Dashboard Header                       │  │
│  │  - Title, User Info, Quick Actions                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────┬────────────────────────────────┐ │
│  │   Plugin Zone Left     │   Plugin Zone Right            │ │
│  │                        │                                │ │
│  │  ┌──────────────────┐  │  ┌──────────────────────────┐ │ │
│  │  │ Announcement     │  │  │  Recent Activity         │ │ │
│  │  │ Plugin           │  │  │  Plugin                  │ │ │
│  │  └──────────────────┘  │  └──────────────────────────┘ │ │
│  │                        │                                │ │
│  │  ┌──────────────────┐  │  ┌──────────────────────────┐ │ │
│  │  │ Bubble Chat      │  │  │  Bubble Notifications    │ │ │
│  │  │ Plugin           │  │  │  Plugin                  │ │ │
│  │  └──────────────────┘  │  └──────────────────────────┘ │ │
│  │                        │                                │ │
│  └────────────────────────┴────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               Drag & Drop Zone Plugin                   │  │
│  │  - Permet d'ajouter dynamiquement des widgets          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Plugins dashboard disponibles

| Plugin | Description | Configuration |
|--------|-------------|---------------|
| **MelisCoreDashboardAnnouncementPlugin** | Affichage d'annonces importantes | Texte, couleur, icône |
| **MelisCoreDashboardRecentUserActivityPlugin** | Activité récente des utilisateurs | Nombre d'entrées (5-20) |
| **MelisCoreDashboardBubbleChatPlugin** | Chat bulle pour support | URL WebSocket |
| **MelisCoreDashboardBubbleNotificationsPlugin** | Notifications en temps réel | Polling interval |
| **MelisCoreDashboardBubbleNewsMelisPlugin** | News de Melis Platform | RSS feed URL |
| **MelisCoreDashboardBubbleUpdatesPlugin** | Updates disponibles | Marketplace API |
| **MelisCoreDashboardDragDropZonePlugin** | Zone drag & drop pour widgets | Grid layout config |

#### 3.3.3 Configuration d'un plugin

```php
// config/dashboard-plugins/MelisCoreDashboardAnnouncementPlugin.config.php
return [
    'plugins' => [
        'meliscore' => [
            'dashboard_plugins' => [
                'MelisCoreDashboardAnnouncementPlugin' => [
                    'name' => 'tr_meliscore_dashboard_announcement_plugin_name',
                    'description' => 'tr_meliscore_dashboard_announcement_plugin_description',
                    'thumbnail' => '/MelisCore/images/dashboard-plugins/announcement.png',
                    'jscallback' => 'announcementPlugin.init',
                    'max_lines' => 10,
                    'height' => 300,
                    'width' => 600,
                    'x' => 0,
                    'y' => 0,
                    'section' => 'left', // left, right, center
                ],
            ],
        ],
    ],
];
```

#### 3.3.4 Cycle de vie d'un plugin

```
1. Chargement configuration
   ↓
2. Vérification des droits utilisateur
   ↓
3. Génération HTML via Controller/Action
   ↓
4. Injection dans la zone dashboard
   ↓
5. Exécution du callback JavaScript
   ↓
6. Initialisation du plugin (événements, AJAX, etc.)
```

### 3.4 Module d'emails back-office

#### 3.4.1 Architecture des emails

```
┌─────────────────────────────────────────────────────────────┐
│              MelisCoreBOEmailService                         │
│                                                               │
│  sendBoEmailByCode($code, $tags, $to, $name, $langId)       │
│         │                                                     │
│         ├─► 1. Récupération template depuis DB               │
│         │      - melis_core_bo_emails (général)              │
│         │      - melis_core_bo_emails_details (multilingue)  │
│         │                                                     │
│         ├─► 2. Remplacement des tags                         │
│         │      - {USER_NAME} → John Doe                      │
│         │      - {RESET_LINK} → https://...                  │
│         │                                                     │
│         ├─► 3. Application du layout                         │
│         │      - Header (logo)                               │
│         │      - Body (contenu)                              │
│         │      - Footer (infos)                              │
│         │                                                     │
│         ├─► 4. Envoi via Laminas Mail                        │
│         │      - SMTP ou sendmail                            │
│         │                                                     │
│         └─► 5. Logging (optionnel)                           │
│                - Historique des emails envoyés               │
└─────────────────────────────────────────────────────────────┘
```

#### 3.4.2 Templates d'emails prédéfinis

| Code | Description | Tags disponibles |
|------|-------------|------------------|
| `ACCOUNTCREATION` | Création de compte | `{USER_NAME}`, `{LOGIN}`, `{CREATE_PASSWORD_LINK}`, `{EXPIRY_DATE}` |
| `LOSTPASSWORD` | Mot de passe oublié | `{USER_NAME}`, `{RESET_LINK}`, `{EXPIRY_DATE}` |
| `PASSWORDCHANGED` | Confirmation changement MDP | `{USER_NAME}`, `{CHANGE_DATE}` |
| `GDPR_DELETE_REMINDER` | Rappel suppression GDPR | `{USER_EMAIL}`, `{DELETE_DATE}`, `{DAYS_REMAINING}` |

#### 3.4.3 Structure d'un email en DB

**Table melis_core_bo_emails :**
```sql
INSERT INTO melis_core_bo_emails VALUES (
    1,                                    -- boe_id
    'Account Creation',                   -- boe_name
    'ACCOUNTCREATION',                    -- boe_code_name
    'Melis Platform',                     -- boe_from_name
    'noreply@melisplatform.com',         -- boe_from_email
    'support@melisplatform.com',         -- boe_reply_to
    '{USER_NAME},{LOGIN},{CREATE_PASSWORD_LINK},{EXPIRY_DATE}', -- boe_tag_accepted_list
    'default_layout',                     -- boe_content_layout
    'Welcome to Melis Platform',          -- boe_content_layout_title
    '/MelisCore/images/logo.png',        -- boe_content_layout_logo
    '<p>© 2024 Melis Technology</p>',    -- boe_content_layout_ftr_info
    '2024-01-30 10:00:00',               -- boe_last_edit_date
    1                                     -- boe_last_user_id
);
```

**Table melis_core_bo_emails_details :**
```sql
INSERT INTO melis_core_bo_emails_details VALUES (
    1,                                    -- boed_id
    1,                                    -- boed_email_id (FK)
    1,                                    -- boed_lang_id (1 = English)
    'Your Melis Platform Account',       -- boed_subject
    '<h1>Welcome {USER_NAME}</h1>
     <p>Your account has been created.</p>
     <p>Login: {LOGIN}</p>
     <p><a href="{CREATE_PASSWORD_LINK}">Create your password</a></p>
     <p>This link expires on {EXPIRY_DATE}</p>', -- boed_html
    'Welcome {USER_NAME}. Your account has been created. Login: {LOGIN}. Create password: {CREATE_PASSWORD_LINK}. Expires: {EXPIRY_DATE}' -- boed_text
);
```

#### 3.4.4 Exemple d'envoi d'email

```php
// Dans un contrôleur ou service
$melisEmailBO = $this->getServiceManager()->get('MelisCoreBOEmailService');

$tags = [
    'USER_NAME' => 'John Doe',
    'LOGIN' => 'jdoe',
    'CREATE_PASSWORD_LINK' => 'https://example.com/create-password?token=abc123',
    'EXPIRY_DATE' => '2024-02-01 23:59:59',
];

$result = $melisEmailBO->sendBoEmailByCode(
    'ACCOUNTCREATION',           // Code du template
    $tags,                       // Tags à remplacer
    'john.doe@example.com',      // Destinataire
    'John Doe',                  // Nom destinataire
    1                            // ID de la langue
);

if ($result) {
    // Email envoyé avec succès
} else {
    // Erreur d'envoi
}
```

### 3.5 Module GDPR

#### 3.5.1 Flux de recherche GDPR

```
┌──────────────────────────────────────────────────────────────┐
│  1. Formulaire de recherche GDPR                              │
│     - Nom, Email, Site ID, etc.                              │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  2. MelisCoreGdprController::searchAction()                   │
│     - Validation des données de recherche                    │
│     - Déclenchement événement: melis_core_gdpr_user_info_event│
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Modules écoutent l'événement et retournent leurs données │
│                                                               │
│     MelisCmsProspects Module:                                │
│     {                                                         │
│       "results": {                                            │
│         "MelisCmsProspects": {                               │
│           "icon": "fa-users",                                │
│           "moduleName": "Prospects",                         │
│           "values": {                                        │
│             "columns": {...},                                │
│             "datas": {                                       │
│               "13": {"name": "John", "email": "john@..."},  │
│               "15": {"name": "Jane", "email": "jane@..."}   │
│             }                                                 │
│           }                                                   │
│         }                                                     │
│       }                                                       │
│     }                                                         │
│                                                               │
│     MelisCmsNewsletter Module:                               │
│     { ... }                                                   │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Agrégation et affichage des résultats                    │
│     - Tableau par module avec colonnes dynamiques            │
│     - Checkbox pour sélection                                │
│     - Boutons "Extract Selected" et "Delete Selected"        │
└──────────────────────────────────────────────────────────────┘
```

#### 3.5.2 Flux d'extraction GDPR

```
┌──────────────────────────────────────────────────────────────┐
│  1. Utilisateur sélectionne les entrées à extraire           │
│     - Coche les checkboxes                                   │
│     - Clique "Extract Selected"                              │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  2. MelisCoreGdprController::extractAction()                 │
│     - Récupération sélections:                               │
│       {                                                       │
│         "MelisCmsProspects": [13, 15],                       │
│         "MelisCmsNewsletter": [2]                            │
│       }                                                       │
│     - Déclenchement: melis_core_gdpr_user_extract_event      │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Modules formatent et retournent les données              │
│                                                               │
│     MelisCmsProspects:                                       │
│     '<xml>                                                    │
│       <MelisCmsProspects>                                    │
│         <prospect id="13">                                   │
│           <name>John Doe</name>                              │
│           <email>john@example.com</email>                    │
│           <created_at>2024-01-15</created_at>                │
│         </prospect>                                           │
│       </MelisCmsProspects>                                   │
│     </xml>'                                                   │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Génération du fichier d'export                           │
│     - Fusion de tous les XML                                 │
│     - Création fichier ZIP                                   │
│     - Téléchargement automatique                             │
│       Nom: gdpr_export_johndoe_20240130.zip                  │
└──────────────────────────────────────────────────────────────┘
```

#### 3.5.3 Flux de suppression GDPR

```
┌──────────────────────────────────────────────────────────────┐
│  1. Utilisateur sélectionne les entrées à supprimer          │
│     - Coche les checkboxes                                   │
│     - Clique "Delete Selected"                               │
│     - Confirmation popup                                     │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  2. MelisCoreGdprController::deleteAction()                  │
│     - Déclenchement: melis_core_gdpr_user_delete_event       │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Modules suppriment leurs données                         │
│     - MelisCmsProspects: DELETE FROM ... WHERE id IN (13,15)│
│     - MelisCmsNewsletter: DELETE FROM ... WHERE id = 2       │
│     - Retour: {"success": true}                              │
└─────────────┬────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Logging et confirmation                                   │
│     - Log dans melis_core_log                                │
│     - Type: GDPR_DATA_DELETED                                │
│     - Notification succès à l'utilisateur                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Modèle de données

### 4.1 Schéma complet de la base de données

```sql
-- ========================================================
-- SCHEMA COMPLET MELISCORE DATABASE
-- ========================================================

-- Table: melis_core_lang
-- Description: Langues disponibles dans la plateforme
CREATE TABLE IF NOT EXISTS `melis_core_lang` (
  `lang_id` INT(11) NOT NULL AUTO_INCREMENT,
  `lang_locale` VARCHAR(10) NOT NULL DEFAULT 'en_EN',
  `lang_name` VARCHAR(45) NULL,
  PRIMARY KEY (`lang_id`),
  UNIQUE KEY `uk_lang_locale` (`lang_locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_core_platform
-- Description: Environnements/plateformes (dev, preprod, prod)
CREATE TABLE IF NOT EXISTS `melis_core_platform` (
  `plf_id` INT(11) NOT NULL AUTO_INCREMENT,
  `plf_name` VARCHAR(100) NOT NULL,
  `plf_update_marketplace` VARCHAR(1) NOT NULL DEFAULT '1',
  `plf_scheme_file_time` VARCHAR(50) NULL,
  PRIMARY KEY (`plf_id`),
  UNIQUE KEY `uk_plf_name` (`plf_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_core_user_role
-- Description: Rôles utilisateurs avec leurs droits
CREATE TABLE IF NOT EXISTS `melis_core_user_role` (
  `urole_id` INT(11) NOT NULL AUTO_INCREMENT,
  `urole_name` VARCHAR(255) NOT NULL,
  `urole_rights` TEXT NULL DEFAULT NULL,               -- XML
  `urole_creation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`urole_id`),
  KEY `idx_urole_name` (`urole_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_core_user
-- Description: Utilisateurs de la plateforme
CREATE TABLE IF NOT EXISTS `melis_core_user` (
  `usr_id` INT(11) NOT NULL AUTO_INCREMENT,
  `usr_status` INT(11) NOT NULL DEFAULT '1',           -- 0=inactif, 1=actif
  `usr_login` VARCHAR(255) NOT NULL,
  `usr_email` VARCHAR(255) NOT NULL,
  `usr_password` VARCHAR(255) NOT NULL,                -- Hash bcrypt
  `usr_firstname` VARCHAR(255) NOT NULL,
  `usr_lastname` VARCHAR(255) NOT NULL,
  `usr_lang_id` INT(11) NOT NULL DEFAULT 1,
  `usr_role_id` INT(11) NOT NULL DEFAULT 1,
  `usr_admin` INT NOT NULL DEFAULT 0,                  -- Super admin
  `usr_rights` TEXT NULL DEFAULT NULL,                 -- Droits XML spécifiques
  `usr_image` MEDIUMBLOB NULL DEFAULT NULL,            -- Avatar
  `usr_creation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usr_last_login_date` DATETIME NULL DEFAULT NULL,
  `usr_is_online` TINYINT(1) NULL DEFAULT 0,
  PRIMARY KEY (`usr_id`),
  UNIQUE KEY `uk_usr_login` (`usr_login`),
  UNIQUE KEY `uk_usr_email` (`usr_email`),
  KEY `idx_usr_status` (`usr_status`),
  KEY `idx_usr_last_login` (`usr_last_login_date`),
  KEY `fk_usr_lang_id` (`usr_lang_id`),
  KEY `fk_usr_role_id` (`usr_role_id`),
  CONSTRAINT `fk_user_lang` FOREIGN KEY (`usr_lang_id`) REFERENCES `melis_core_lang` (`lang_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`usr_role_id`) REFERENCES `melis_core_user_role` (`urole_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_core_bo_emails
-- Description: Templates d'emails back-office
CREATE TABLE IF NOT EXISTS `melis_core_bo_emails` (
  `boe_id` INT(11) NOT NULL AUTO_INCREMENT,
  `boe_name` VARCHAR(255) NOT NULL,
  `boe_code_name` VARCHAR(255) NOT NULL,               -- Ex: ACCOUNTCREATION
  `boe_from_name` VARCHAR(255) NOT NULL,
  `boe_from_email` VARCHAR(255) NOT NULL,
  `boe_reply_to` VARCHAR(255) NULL,
  `boe_tag_accepted_list` TEXT NULL,                   -- Tags disponibles
  `boe_content_layout` VARCHAR(255) NULL,              -- Layout à utiliser
  `boe_content_layout_title` VARCHAR(255) NULL,
  `boe_content_layout_logo` TEXT NULL,
  `boe_content_layout_ftr_info` TEXT NULL,             -- Footer HTML
  `boe_last_edit_date` DATETIME NOT NULL,
  `boe_last_user_id` INT(11) NOT NULL,
  PRIMARY KEY (`boe_id`),
  UNIQUE KEY `uk_boe_code_name` (`boe_code_name`),
  KEY `fk_boe_last_user` (`boe_last_user_id`),
  CONSTRAINT `fk_bo_email_user` FOREIGN KEY (`boe_last_user_id`) REFERENCES `melis_core_user` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_core_bo_emails_details
-- Description: Contenu multilingue des emails
CREATE TABLE IF NOT EXISTS `melis_core_bo_emails_details` (
  `boed_id` INT(11) NOT NULL AUTO_INCREMENT,
  `boed_email_id` INT(11) NOT NULL,
  `boed_lang_id` INT(11) NOT NULL,
  `boed_subject` VARCHAR(255) NOT NULL,
  `boed_html` LONGTEXT NOT NULL,                       -- Contenu HTML
  `boed_text` TEXT NOT NULL,                           -- Contenu texte brut
  PRIMARY KEY (`boed_id`),
  UNIQUE KEY `uk_boed_email_lang` (`boed_email_id`, `boed_lang_id`),
  KEY `fk_boed_email` (`boed_email_id`),
  KEY `fk_boed_lang` (`boed_lang_id`),
  CONSTRAINT `fk_bo_email_details_email` FOREIGN KEY (`boed_email_id`) REFERENCES `melis_core_bo_emails` (`boe_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bo_email_details_lang` FOREIGN KEY (`boed_lang_id`) REFERENCES `melis_core_lang` (`lang_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_core_log_type
-- Description: Types de logs (ex: PAGE_PUBLISH, ADD_USER)
CREATE TABLE IF NOT EXISTS `melis_core_log_type` (
  `logt_id` INT NOT NULL AUTO_INCREMENT,
  `logt_code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`logt_id`),
  UNIQUE KEY `uk_logt_code` (`logt_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_core_log
-- Description: Logs système et utilisateurs
CREATE TABLE IF NOT EXISTS `melis_core_log` (
  `log_id` INT(11) NOT NULL AUTO_INCREMENT,
  `log_title` VARCHAR(255) NOT NULL,
  `log_message` VARCHAR(255) NOT NULL,
  `log_action_status` INT NOT NULL DEFAULT 0,          -- 0=échec, 1=succès
  `log_type_id` INT(11) NOT NULL,
  `log_item_id` INT(11) NULL,                          -- ID de l'objet concerné
  `log_user_id` INT(11) NOT NULL,
  `log_date_added` DATETIME NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_log_user` (`log_user_id`),
  KEY `idx_log_type` (`log_type_id`),
  KEY `idx_log_date` (`log_date_added`),
  KEY `idx_log_status` (`log_action_status`),
  CONSTRAINT `fk_log_type` FOREIGN KEY (`log_type_id`) REFERENCES `melis_core_log_type` (`logt_id`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`log_user_id`) REFERENCES `melis_core_user` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_core_log_type_trans
-- Description: Traductions des types de logs
CREATE TABLE IF NOT EXISTS `melis_core_log_type_trans` (
  `logtt_id` INT NOT NULL AUTO_INCREMENT,
  `logtt_type_id` INT NOT NULL,
  `logtt_lang_id` INT NOT NULL,
  `logtt_text` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`logtt_id`),
  UNIQUE KEY `uk_logtt_type_lang` (`logtt_type_id`, `logtt_lang_id`),
  KEY `fk_logtt_type` (`logtt_type_id`),
  KEY `fk_logtt_lang` (`logtt_lang_id`),
  CONSTRAINT `fk_log_type_trans_type` FOREIGN KEY (`logtt_type_id`) REFERENCES `melis_core_log_type` (`logt_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_log_type_trans_lang` FOREIGN KEY (`logtt_lang_id`) REFERENCES `melis_core_lang` (`lang_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_dashboard
-- Description: Configuration des dashboards personnalisés
CREATE TABLE IF NOT EXISTS `melis_dashboard` (
  `mdb_id` INT NOT NULL AUTO_INCREMENT,
  `mdb_user_id` INT NOT NULL,
  `mdb_key` VARCHAR(255) NOT NULL,
  `mdb_value` TEXT NULL,
  PRIMARY KEY (`mdb_id`),
  KEY `fk_mdb_user` (`mdb_user_id`),
  CONSTRAINT `fk_dashboard_user` FOREIGN KEY (`mdb_user_id`) REFERENCES `melis_core_user` (`usr_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tables GDPR
CREATE TABLE IF NOT EXISTS `melis_gdpr_delete_config` (
  `mgdc_id` INT NOT NULL AUTO_INCREMENT,
  `mgdc_delete_days` INT NOT NULL DEFAULT 30,
  `mgdc_email_days_before` INT NOT NULL DEFAULT 7,
  `mgdc_active` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`mgdc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `melis_gdpr_delete_emails` (
  `mgde_id` INT NOT NULL AUTO_INCREMENT,
  `mgde_code` VARCHAR(50) NOT NULL,
  `mgde_subject` VARCHAR(255) NOT NULL,
  `mgde_body` TEXT NOT NULL,
  PRIMARY KEY (`mgde_id`),
  UNIQUE KEY `uk_mgde_code` (`mgde_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `melis_gdpr_delete_emails_logs` (
  `mgdel_id` INT NOT NULL AUTO_INCREMENT,
  `mgdel_email` VARCHAR(255) NOT NULL,
  `mgdel_status` VARCHAR(50) NOT NULL,
  `mgdel_date_sent` DATETIME NOT NULL,
  PRIMARY KEY (`mgdel_id`),
  KEY `idx_mgdel_email` (`mgdel_email`),
  KEY `idx_mgdel_date` (`mgdel_date_sent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_lost_password
-- Description: Tokens de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS `melis_lost_password` (
  `mlp_id` INT NOT NULL AUTO_INCREMENT,
  `mlp_user_id` INT NOT NULL,
  `mlp_token` VARCHAR(255) NOT NULL,
  `mlp_expiry_date` DATETIME NOT NULL,
  `mlp_used` TINYINT(1) NOT NULL DEFAULT 0,
  `mlp_creation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mlp_id`),
  UNIQUE KEY `uk_mlp_token` (`mlp_token`),
  KEY `fk_mlp_user` (`mlp_user_id`),
  KEY `idx_mlp_expiry` (`mlp_expiry_date`),
  CONSTRAINT `fk_lost_password_user` FOREIGN KEY (`mlp_user_id`) REFERENCES `melis_core_user` (`usr_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_create_password
-- Description: Tokens de création de mot de passe (nouveaux comptes)
CREATE TABLE IF NOT EXISTS `melis_create_password` (
  `mcp_id` INT NOT NULL AUTO_INCREMENT,
  `mcp_user_id` INT NOT NULL,
  `mcp_token` VARCHAR(255) NOT NULL,
  `mcp_expiry_date` DATETIME NOT NULL,
  `mcp_used` TINYINT(1) NOT NULL DEFAULT 0,
  `mcp_creation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mcp_id`),
  UNIQUE KEY `uk_mcp_token` (`mcp_token`),
  KEY `fk_mcp_user` (`mcp_user_id`),
  KEY `idx_mcp_expiry` (`mcp_expiry_date`),
  CONSTRAINT `fk_create_password_user` FOREIGN KEY (`mcp_user_id`) REFERENCES `melis_core_user` (`usr_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: melis_announcement
-- Description: Annonces système
CREATE TABLE IF NOT EXISTS `melis_announcement` (
  `mann_id` INT NOT NULL AUTO_INCREMENT,
  `mann_title` VARCHAR(255) NOT NULL,
  `mann_content` TEXT NOT NULL,
  `mann_type` VARCHAR(50) NOT NULL DEFAULT 'info',    -- info, warning, error, success
  `mann_active` TINYINT(1) NOT NULL DEFAULT 1,
  `mann_start_date` DATETIME NULL,
  `mann_end_date` DATETIME NULL,
  `mann_creation_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mann_id`),
  KEY `idx_mann_active` (`mann_active`),
  KEY `idx_mann_dates` (`mann_start_date`, `mann_end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 Diagramme ER (Entity-Relationship)

```
┌──────────────────┐
│ melis_core_lang  │
│                  │
│ * lang_id (PK)   │───────┐
│   lang_locale    │       │
│   lang_name      │       │
└──────────────────┘       │
                           │
                           │ FK usr_lang_id
                           │
                           │
┌───────────────────────┐  │     ┌─────────────────────────┐
│melis_core_user_role   │  │     │   melis_core_user       │
│                       │  │     │                         │
│ * urole_id (PK)       │──┼────>│ * usr_id (PK)           │
│   urole_name          │  │ FK  │   usr_status            │
│   urole_rights (XML)  │  │     │   usr_login (UNIQUE)    │
│   urole_creation_date │  └────>│   usr_email (UNIQUE)    │
└───────────────────────┘        │   usr_password          │
       FK usr_role_id            │   usr_firstname         │
                                  │   usr_lastname          │
                                  │   usr_lang_id (FK)      │
                                  │   usr_role_id (FK)      │
                                  │   usr_admin             │
                                  │   usr_rights (XML)      │
                                  │   usr_image (BLOB)      │
                                  │   usr_creation_date     │
                                  │   usr_last_login_date   │
                                  │   usr_is_online         │
                                  └────┬────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    │FK boe_last_user_id│FK log_user_id  │FK mdb_user_id
                    │                  │                  │
        ┌───────────▼──────────┐  ┌───▼──────────────┐  ┌▼─────────────┐
        │ melis_core_bo_emails │  │ melis_core_log   │  │melis_dashboard│
        │                      │  │                  │  │              │
        │ * boe_id (PK)        │  │ * log_id (PK)    │  │* mdb_id (PK) │
        │   boe_name           │  │   log_title      │  │  mdb_user_id │
        │   boe_code_name(UQ)  │  │   log_message    │  │  mdb_key     │
        │   boe_from_name      │  │   log_status     │  │  mdb_value   │
        │   boe_from_email     │  │   log_type_id(FK)│  └──────────────┘
        │   ...                │  │   log_item_id    │
        └───┬──────────────────┘  │   log_user_id(FK)│
            │                     │   log_date_added │
            │ FK boed_email_id    └───┬──────────────┘
            │                         │
            │                         │ FK logtt_type_id
            │                         │
    ┌───────▼───────────────────┐  ┌─▼────────────────────┐
    │melis_core_bo_emails_details│  │melis_core_log_type   │
    │                            │  │                      │
    │ * boed_id (PK)             │  │ * logt_id (PK)       │
    │   boed_email_id (FK)       │  │   logt_code (UNIQUE) │
    │   boed_lang_id (FK)        │  └──────────────────────┘
    │   boed_subject             │
    │   boed_html (LONGTEXT)     │
    │   boed_text (TEXT)         │
    └────────────────────────────┘
```

---

## 5. API et interfaces

### 5.1 Routes principales

```php
// config/module.config.php - Router configuration
return [
    'router' => [
        'routes' => [
            // Page de login
            'melis-backoffice' => [
                'type' => 'Literal',
                'options' => [
                    'route' => '/melis',
                    'defaults' => [
                        'controller' => 'MelisCore\Controller\MelisAuth',
                        'action' => 'loginpage',
                    ],
                ],
                'may_terminate' => true,
                'child_routes' => [
                    // Authentification
                    'login' => [
                        'type' => 'Literal',
                        'options' => [
                            'route' => '/login',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'authenticate',
                            ],
                        ],
                    ],
                    'logout' => [
                        'type' => 'Literal',
                        'options' => [
                            'route' => '/logout',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\MelisAuth',
                                'action' => 'logout',
                            ],
                        ],
                    ],
                    
                    // Dashboard
                    'dashboard' => [
                        'type' => 'Literal',
                        'options' => [
                            'route' => '/dashboard',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\Dashboard',
                                'action' => 'index',
                            ],
                        ],
                    ],
                    
                    // Gestion utilisateurs
                    'user' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => '/user[/:action][/:id]',
                            'constraints' => [
                                'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                'id' => '[0-9]+',
                            ],
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\ToolUser',
                                'action' => 'list',
                            ],
                        ],
                    ],
                    
                    // Emails BO
                    'emails' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => '/emails[/:action][/:id]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\EmailsManagement',
                                'action' => 'list',
                            ],
                        ],
                    ],
                    
                    // Logs
                    'logs' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => '/logs[/:action][/:id]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\Log',
                                'action' => 'list',
                            ],
                        ],
                    ],
                    
                    // GDPR
                    'gdpr' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => '/gdpr[/:action]',
                            'defaults' => [
                                'controller' => 'MelisCore\Controller\MelisCoreGdprAutoDelete',
                                'action' => 'index',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
```

### 5.2 API JSON pour interactions AJAX

**Format standard de réponse JSON :**

```json
{
    "success": true|false,
    "message": "User-friendly message",
    "textTitle": "Notification title",
    "textMessage": "Detailed notification message",
    "data": {
        // Données retournées (optionnel)
    },
    "errors": {
        // Erreurs de validation (optionnel)
        "field_name": {
            "validatorName": "Error message"
        }
    }
}
```

**Exemples d'endpoints AJAX :**

| Endpoint | Méthode | Description | Réponse |
|----------|---------|-------------|---------|
| `/melis/user/list` | GET | Liste utilisateurs | HTML table |
| `/melis/user/get/42` | GET | Détails utilisateur ID 42 | JSON |
| `/melis/user/save` | POST | Créer/modifier utilisateur | JSON |
| `/melis/user/delete/42` | POST | Supprimer utilisateur ID 42 | JSON |
| `/melis/dashboard/get-plugins` | GET | Liste plugins dashboard | JSON |
| `/melis/emails/send-test` | POST | Tester envoi email | JSON |
| `/melis/logs/get-data` | POST | Récupérer logs paginés | JSON |
| `/melis/gdpr/search` | POST | Recherche données GDPR | JSON |

---

## 6. Sécurité

### 6.1 Authentification

**Algorithme de hachage :**
- `PASSWORD_DEFAULT` (bcrypt, cost=10)
- Salt automatique et unique par mot de passe
- Fonction : `password_hash()` et `password_verify()`

**Validation mot de passe :**
```php
// Règles minimales
- Longueur minimale : 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Caractères spéciaux : optionnel
```

**Durée de vie session :**
- Session : 86400 secondes (24h) par défaut
- Cookie remember me : 86400 secondes (24h)

### 6.2 Autorisation

**Système de rôles :**
- Super Admin (`usr_admin = 1`) : Tous les droits
- Rôles personnalisés (`melis_core_user_role`)
- Droits au format XML ou JSON
- Vérification via `MelisCoreRightsService::isAccessible()`

**Format des droits :**
```xml
<rights>
    <interface>
        <meliscore_dashboard>
            <access>1</access>
        </meliscore_dashboard>
        <meliscore_users>
            <access>1</access>
            <actions>
                <create>1</create>
                <edit>1</edit>
                <delete>0</delete>
            </actions>
        </meliscore_users>
    </interface>
</rights>
```

### 6.3 Protection CSRF

**⚠️ ACTUELLEMENT ABSENTE - À IMPLÉMENTER :**

```php
// À ajouter dans tous les formulaires
'elements' => [
    [
        'spec' => [
            'type' => 'Laminas\Form\Element\Csrf',
            'name' => 'csrf',
            'options' => [
                'csrf_options' => [
                    'timeout' => 3600,
                ],
            ],
        ],
    ],
],

// Validation dans le contrôleur
if (!$form->isValid()) {
    $errors = $form->getMessages();
    if (isset($errors['csrf'])) {
        return new JsonModel([
            'success' => false,
            'error' => 'CSRF token validation failed',
        ]);
    }
}
```

### 6.4 Protection XSS

**Échappement dans les vues :**
```php
// Toujours utiliser escapeHtml()
<?= $this->escapeHtml($user->usr_firstname) ?>

// Pour les URLs
<?= $this->escapeUrl($url) ?>

// Pour les attributs HTML
<?= $this->escapeHtmlAttr($value) ?>
```

**HTML Purifier pour contenu riche :**
```php
// Pour TinyMCE et autres éditeurs WYSIWYG
$config = HTMLPurifier_Config::createDefault();
$purifier = new HTMLPurifier($config);
$clean_html = $purifier->purify($dirty_html);
```

### 6.5 Protection injection SQL

**Utilisation exclusive de prepared statements via Laminas\Db :**
```php
// TableGateway utilise automatiquement des prepared statements
$select = $this->tableGateway->getSql()->select();
$select->where(['usr_id' => $userId]); // Safe
$select->like('usr_email', '%' . $search . '%'); // Safe
```

### 6.6 Headers HTTP de sécurité

**À configurer dans Apache/Nginx ou via PHP :**
```apache
Header set X-XSS-Protection "1; mode=block"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set Content-Security-Policy "default-src 'self'"
Header set Strict-Transport-Security "max-age=31536000"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

---

## 7. Performance et scalabilité

### 7.1 Système de cache

**Cache Laminas :**
```php
// config/cache.config.php
return [
    'cache' => [
        'adapter' => [
            'name' => 'filesystem',
            'options' => [
                'ttl' => 3600,
                'cache_dir' => './data/cache',
            ],
        ],
    ],
];

// Utilisation
$cache = $serviceManager->get('cache');
$key = 'leftmenu_user_' . $userId;

if (!$cache->hasItem($key)) {
    $data = $this->buildLeftMenu($userId);
    $cache->setItem($key, $data);
}

$leftMenu = $cache->getItem($key);
```

**Éléments mis en cache :**
- Menu de gauche (leftmenu)
- Configuration dashboard
- Plugins dashboard
- Traductions
- Configuration d'interface

### 7.2 Bundling des assets

**Webpack configuration :**
```javascript
// webpack.config.js
module.exports = {
    entry: {
        bundle: './public/js/src/index.js',
    },
    output: {
        path: __dirname + '/public/build',
        filename: '[name].js',
    },
    optimization: {
        minimize: true,
    },
};
```

**Résultat :**
- `public/build/bundle.js` (1 fichier au lieu de 2000+)
- `public/build/bundle.css` (1 fichier)
- Réduction drastique du nombre de requêtes HTTP

### 7.3 Optimisation base de données

**Index recommandés :**
```sql
-- melis_core_user
CREATE INDEX idx_usr_status ON melis_core_user (usr_status);
CREATE INDEX idx_usr_last_login ON melis_core_user (usr_last_login_date);
CREATE INDEX idx_usr_is_online ON melis_core_user (usr_is_online);

-- melis_core_log
CREATE INDEX idx_log_date ON melis_core_log (log_date_added);
CREATE INDEX idx_log_user_date ON melis_core_log (log_user_id, log_date_added);
CREATE INDEX idx_log_type_date ON melis_core_log (log_type_id, log_date_added);

-- melis_core_bo_emails
CREATE INDEX idx_boe_code ON melis_core_bo_emails (boe_code_name);
```

**Requêtes optimisées :**
```php
// Pagination pour éviter de charger toutes les données
$select->limit($limit);
$select->offset($offset);

// Sélection de colonnes spécifiques au lieu de *
$select->columns(['usr_id', 'usr_firstname', 'usr_lastname', 'usr_email']);

// Utilisation de EXPLAIN pour analyser les requêtes lentes
```

### 7.4 Scalabilité horizontale

**Recommandations :**
1. **Serveur web** : Load balancer (Nginx, HAProxy)
2. **Base de données** : Master-slave replication
3. **Sessions** : Redis ou Memcached (au lieu de fichiers)
4. **Cache** : Redis ou Memcached centralisé
5. **Assets statiques** : CDN (CloudFlare, AWS CloudFront)
6. **Uploads** : S3 ou équivalent (au lieu de BLOB)

---

## 8. Déploiement et infrastructure

### 8.1 Environnements

**Configuration multi-environnements :**
```php
// config/app.interface.php
'development' => [
    'build_bundle' => false,
    'errors' => [
        'display_errors' => 1,
        'error_reporting' => E_ALL,
    ],
    'cache' => [
        'enabled' => false,
    ],
],
'preprod' => [
    'build_bundle' => true,
    'errors' => [
        'display_errors' => 0,
        'error_reporting' => E_ALL & ~E_DEPRECATED,
    ],
    'cache' => [
        'enabled' => true,
    ],
],
'production' => [
    'build_bundle' => true,
    'errors' => [
        'display_errors' => 0,
        'error_reporting' => 0,
        'log_errors' => 1,
    ],
    'cache' => [
        'enabled' => true,
    ],
],
```

**Variable d'environnement :**
```bash
# Apache .htaccess ou VirtualHost
SetEnv MELIS_PLATFORM "production"

# Nginx
fastcgi_param MELIS_PLATFORM "production";

# CLI
export MELIS_PLATFORM=development
```

### 8.2 Installation

**Via Composer :**
```bash
# Installation du module seul
composer require melisplatform/melis-core

# Installation complète (skeleton)
composer create-project melisplatform/melis-cms-skeleton my-project
cd my-project

# Installation des dépendances
composer install

# Migration de la base de données
php vendor/bin/melis-dbdeploy install

# Configuration
cp config/autoload/local.php.dist config/autoload/local.php
# Éditer local.php avec les paramètres DB
```

**Configuration Apache :**
```apache
<VirtualHost *:80>
    ServerName melis-local.dev
    DocumentRoot /var/www/melis/public
    
    SetEnv MELIS_PLATFORM "development"
    
    <Directory /var/www/melis/public>
        DirectoryIndex index.php
        AllowOverride All
        Require all granted
    </Directory>
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/melis_error.log
    CustomLog ${APACHE_LOG_DIR}/melis_access.log combined
</VirtualHost>
```

**Configuration Nginx :**
```nginx
server {
    listen 80;
    server_name melis-local.dev;
    root /var/www/melis/public;
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param MELIS_PLATFORM "development";
        include fastcgi_params;
    }
    
    # Logs
    error_log /var/log/nginx/melis_error.log;
    access_log /var/log/nginx/melis_access.log;
}
```

### 8.3 Migrations de base de données

**Structure :**
```
install/dbdeploy/
├── 1101818_core_install.sql           # Installation initiale
├── 112718_core_update.sql             # Update
├── 112818_core_update.sql
├── 20022601_core_update.sql
└── ...
```

**Exécution :**
```bash
# Automatique via Composer hooks
composer install

# Manuel
php vendor/bin/melis-dbdeploy migrate

# Rollback
php vendor/bin/melis-dbdeploy rollback
```

---

## 9. Intégrations

### 9.1 Modules Melis

**Modules dépendants :**
- `melis-asset-manager` : Gestion des assets
- `melis-composerdeploy` : Déploiement via Composer
- `melis-dbdeploy` : Migrations DB

**Modules compatibles :**
- `melis-cms` : CMS front-office
- `melis-front` : Templates front-end
- `melis-cms-prospects` : Gestion des prospects
- `melis-cms-newsletter` : Newsletter
- `melis-commerce` : E-commerce

### 9.2 APIs externes

**Marketplace Melis :**
```php
// Récupération des modules disponibles
$marketplaceUrl = 'https://marketplace.melistechnology.com/api/modules';
$response = file_get_contents($marketplaceUrl);
$modules = json_decode($response, true);
```

**SMTP externe :**
```php
// config/autoload/local.php
return [
    'mail' => [
        'transport' => [
            'type' => 'smtp',
            'options' => [
                'name' => 'smtp.example.com',
                'host' => 'smtp.example.com',
                'port' => 587,
                'connection_class' => 'login',
                'connection_config' => [
                    'username' => 'your-username',
                    'password' => 'your-password',
                    'ssl' => 'tls',
                ],
            ],
        ],
    ],
];
```

---

## 10. Maintenance et évolution

### 10.1 Logs et monitoring

**Fichiers de logs :**
```
/var/log/melis/
├── php-errors.log              # Erreurs PHP
├── application.log             # Logs applicatifs
├── sql-queries.log             # Requêtes SQL lentes
└── security.log                # Événements de sécurité
```

**Monitoring recommandé :**
- **APM** : New Relic, Datadog
- **Logs** : ELK Stack (Elasticsearch, Logstash, Kibana)
- **Uptime** : UptimeRobot, Pingdom
- **Performance** : Blackfire.io pour profiling PHP

### 10.2 Maintenance préventive

**Tâches quotidiennes :**
```bash
# Nettoyage du cache
php bin/console cache:clear --env=production

# Nettoyage des sessions expirées
find /var/lib/php/sessions/ -type f -mtime +1 -delete

# Vérification des logs
tail -n 100 /var/log/melis/php-errors.log
```

**Tâches hebdomadaires :**
```bash
# Analyse des logs lents
pt-query-digest /var/log/mysql/slow-query.log

# Backup de la base de données
mysqldump -u root -p meliscore > backup_$(date +%Y%m%d).sql

# Mise à jour des dépendances (après tests)
composer update
```

**Tâches mensuelles :**
```bash
# Audit de sécurité
composer audit
npm audit

# Nettoyage de la base de données
DELETE FROM melis_core_log WHERE log_date_added < DATE_SUB(NOW(), INTERVAL 6 MONTH);

# Optimisation des tables
mysqlcheck -o meliscore --all-databases
```

### 10.3 Procédure de mise à jour

**Étapes de mise à jour :**
```bash
# 1. Backup complet
mysqldump -u root -p meliscore > backup_before_update.sql
tar -czf files_backup.tar.gz /var/www/melis

# 2. Mode maintenance
touch /var/www/melis/maintenance.flag

# 3. Mise à jour du code
cd /var/www/melis
git pull origin main
composer install --no-dev --optimize-autoloader

# 4. Migration DB
php vendor/bin/melis-dbdeploy migrate

# 5. Clear cache
php bin/console cache:clear --env=production

# 6. Re-bundle assets (si nécessaire)
npm run build

# 7. Tests
php vendor/bin/phpunit

# 8. Sortie du mode maintenance
rm /var/www/melis/maintenance.flag

# 9. Vérification
curl -I https://melis-site.com/melis
```

---

## 11. Annexes

### 11.1 Glossaire

| Terme | Définition |
|-------|------------|
| **BO** | Back-Office |
| **TableGateway** | Pattern d'accès aux données de Laminas |
| **ServiceManager** | Conteneur d'injection de dépendances |
| **EventManager** | Gestionnaire d'événements de Laminas |
| **melisKey** | Clé unique identifiant un élément d'interface |
| **Bundle** | Fichier regroupant plusieurs assets JS/CSS |

### 11.2 Conventions de code

**Nommage :**
```php
// Classes : PascalCase
class MelisCoreAuthService

// Méthodes : camelCase
public function getUserById($id)

// Variables : camelCase
$userId = 42;

// Constantes : SNAKE_CASE
const TABLE_NAME = 'melis_core_user';

// Tables DB : snake_case avec préfixe
melis_core_user
melis_core_log

// Clés de config : snake_case
'usr_login', 'boe_email_id'
```

**Structure des fichiers :**
```php
<?php

namespace MelisCore\Service;

use Laminas\ServiceManager\ServiceManager;
use Laminas\Db\TableGateway\TableGateway;

/**
 * Class documentation (PHPDoc)
 */
class MyService
{
    protected $serviceManager;
    
    /**
     * Constructor
     */
    public function __construct(ServiceManager $sm)
    {
        $this->serviceManager = $sm;
    }
    
    /**
     * Method documentation
     *
     * @param int $id
     * @return array
     */
    public function getData($id)
    {
        // Implementation
    }
}
```

### 11.3 Ressources

**Documentation officielle :**
- Melis Platform : https://www.melistechnology.com/documentation
- Laminas MVC : https://docs.laminas.dev/laminas-mvc/
- PHP : https://www.php.net/manual/fr/

**Support :**
- Email : contact@melistechnology.com
- GitHub Issues : https://github.com/melisplatform/melis-core/issues

---

**FIN DES SPÉCIFICATIONS TECHNIQUES**

**Document généré le :** 30 janvier 2026  
**Version du projet analysé :** MelisCore v3.1.0  
**Statut :** Complet et prêt pour implémentation
