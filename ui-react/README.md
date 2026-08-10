# Melis backoffice — prototype React (chantier 3)

Prototype de **nouveau backoffice Melis** en **React + TypeScript**, construit **en
parallèle de l'existant** (aucune dépendance au front legacy `.phtml`/jQuery). Voir le
brief : [`../chantiers/03-ui-react-2026.md`](../chantiers/03-ui-react-2026.md).

**État actuel : page de login** branchée sur le **vrai endpoint d'authentification Melis**.

## Stack

- **Vite 8** + **React 19** + **TypeScript** (le scaffold Vite livre React 19, retenu
  plutôt que React 18 — version courante et supérieure).
- **Tailwind CSS v4** (plugin `@tailwindcss/vite`, zéro `tailwind.config.js`).
- **Composants façon shadcn/ui** (Radix + CVA), copiés dans le repo sous
  [`src/components/ui/`](src/components/ui/) — donc 100 % éditables, pas une lib opaque.
- **React Router** pour la navigation + une route protégée.
- Icônes **lucide-react**.

## Démarrer

```bash
cd ui-react
npm install
npm run dev        # http://localhost:5173
```

- `npm run build` — typecheck (`tsc -b`) + build de prod dans `dist/`.
- `npm run preview` — sert le build de prod.

## Connexion au backend Melis

L'auth Melis est **server-rendered (Laminas)** et **basée session (cookie)**. Le SPA tape
les routes réelles, **proxifiées par Vite** pour rester *same-origin* (le cookie de session
repart tout seul, pas de CORS). Configuré dans [`vite.config.ts`](vite.config.ts) :

| Appel front | Route Melis proxifiée | Rôle |
| --- | --- | --- |
| `login()` | `POST /melis/authenticate` | body form-urlencoded `usr_login`, `usr_password`, `remember` → JSON `{success, errors, command}`. Pose le cookie de session. |
| `isLoggedIn()` | `GET /melis/islogin` | JSON `{login: bool}`. **Exige** l'en-tête `X-Requested-With: XMLHttpRequest`. |
| `logout()` | `GET /melis/logout` | clôt la session. |

Cible du proxy = `http://localhost` (stack Docker Melis local) par défaut, surchargeable :

```bash
MELIS_TARGET=http://localhost:8000 npm run dev
```

> ℹ️ Le formulaire de login Melis **n'a pas de jeton CSRF** (vérifié dans
> `melis-core/config/app.forms.php` : le form `meliscore_login` n'expose que
> `usr_login` / `usr_password` / `login_submit`). Rien à récupérer au préalable.

### Pré-requis pour tester l'auth réelle

Le backend Melis doit tourner (cf. mémoire projet `melis-local-docker-setup` :
`make build && make start` → http://localhost/melis). Sans backend, la page s'affiche mais
la connexion renvoie « Serveur Melis injoignable ». Identifiants locaux : **`admin` / `admin123`**.

### Mode démo (DEV uniquement)

Pour parcourir tout le backoffice **sans backend** (vitrine UX) : ouvrir
**`http://localhost:5173/?demo=1`**. Court-circuite l'auth (gardé par `import.meta.env.DEV`,
jamais en build de prod), persiste en `sessionStorage`. « Déconnexion » le réinitialise.

## Structure

```
src/
  assets/            logos Melis (wordmark rouge + variante blanche)
  auth/
    auth-context.ts  contexte + hook useAuth
    AuthProvider.tsx provider (vérifie la session au démarrage)
    ProtectedRoute.tsx  garde de route → redirige vers /login
  components/ui/     Button, Input, Label, Checkbox, Card (style shadcn/ui)
  lib/
    melis-api.ts     client d'auth Melis (login / isLoggedIn / logout)
    utils.ts         cn() (clsx + tailwind-merge)
  components/ThemeSwitcher.tsx  sélecteur de thème (segmenté)
  theme/
    themes.ts        registre des thèmes (id, label, swatch)
    theme-context.ts contexte + hook useTheme
    ThemeProvider.tsx  provider (data-theme + persistance localStorage)
  pages/
    LoginPage.tsx    page de login (split-screen, theme-aware)
    DashboardPage.tsx  placeholder post-login (preuve de session)
  index.css          tokens des thèmes → thème Tailwind v4
```

## Thèmes

Deux chartes au choix, basculables en direct via le sélecteur (coin haut-droit du
login) ; le choix est **mémorisé** (`localStorage`) et appliqué avant le premier rendu
(pas de flash). Mécanique : **un attribut `data-theme` sur `<html>`** active un jeu de
variables CSS ; toutes les couleurs/ombres/rayons suivent automatiquement.

| Thème | `data-theme` | Charte | Look |
| --- | --- | --- | --- |
| **Platform** | `platform` (défaut) | [melisplatform.com](https://www.melisplatform.com/) — `../designsystem/` | clair, rouge `#ff0000`, cartes blanches ombrées |
| **Studio AI** | `studio` | [melis-studio.ai](https://www.melis-studio.ai/) | sombre, bleu électrique `#2f6bff` + accents cyan, touches monospace |

- Polices : **Plus Jakarta Sans** (titres), **Rubik** (texte), **JetBrains Mono** (accents tech du thème Studio).
- **Deep-link / QA** : forcer un thème via l'URL → `…/login?theme=studio`.
- **Ajouter un thème** : une entrée dans [`src/theme/themes.ts`](src/theme/themes.ts) + un bloc
  `[data-theme='<id>']` dans [`src/index.css`](src/index.css). Rien d'autre à toucher.

## Reste à câbler (prochains jalons du chantier 3)

- **Shell** : top bar + menu latéral + i18n.
- **Dashboard** : cartes news / updates / notifications / messages.
- **Premier tool end-to-end** : liste Sites ou Pages (table moderne, filtres, édition).
- **Couche data** : TanStack Query sur des endpoints JSON Melis (contrôleur dédié) et/ou
  **MelisMCP**. Garder la logique métier côté Melis (React = présentation).
- **2FA / password expiré** : le endpoint `authenticate` peut renvoyer des `command` de
  redirection (mot de passe expiré, etc.) — aujourd'hui on ne lit que `success`. À gérer
  finement quand on couvrira ces parcours.
