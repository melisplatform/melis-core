# Security Policy

## Reporting a Vulnerability

We take the security of Melis Core and the wider Melis Platform seriously.
**Please do not open a public GitHub issue for security problems.**

Report vulnerabilities privately through GitHub — use *Security → Report a
vulnerability* (private vulnerability reporting) on this repository.

Please include, when possible:

- the affected file(s) and version/commit,
- a description of the impact,
- the steps or a source-only proof of concept needed to reproduce.

## What to expect

- Acknowledgement of your report within **5 business days**.
- An initial assessment (severity, affected versions) within **10 business days**.
- Coordinated disclosure: we will agree a timeline with you before any public
  advisory or CVE request, and we publish a fix before disclosing details.

## Supported versions

Security fixes are provided for the latest release line. Older lines are
handled case by case.

## Credit

We credit reporters in the release notes / advisory unless you ask us not to.
If you would like a CVE, tell us and we will request one on your behalf.

## Acknowledgements

We thank the following researchers for privately and responsibly disclosing
security issues in this module:

- **Arpit Jain** ([@arpitjain099](https://github.com/arpitjain099)) — missing
  tool-access check on several `ToolUserController` actions (`addNewUserInfo`,
  `generateCreatePassRequest`, `getUserById`), allowing a low-privilege
  authenticated back-office account to create an administrator and read other
  users' records (CWE-862; residual of the CVE-2025-10352 fix).

## Hardening notes

### Tool keys on back-office controllers (audit item 7.0, 2026-09-24)

**Why.** `MelisCoreAuthorizationListener` checks the caller's rights before
dispatch, but only for controllers that declare their tool key. The
controllers below declared none, so any logged-in account could call them
whatever its rights (e.g. the legacy GDPR export).

**How.** Each controller now declares `const MELIS_KEY` = the tool you tick
in Users → Rights. Actions that other tools also call use `TOOL_KEY_MAP`:
a list of keys (any one is enough) or `'@login'` (logged in is enough), so
those tools keep working. The listener was extended to read both forms.

Controllers:

- **melis-core**: `Log`, `Modules`, `MelisCoreMicroService`, `PlatformScheme`,
  `MelisCoreGdpr`, `MelisCoreGdprAutoDelete`, `MelisCoreGdprAutoDeleteTabs`,
  `MelisCoreGdprAutoDeleteSmtp`, `MelisCoreOtherConfig`. `Language`:
  `getDataTableTranslations` set to `'@login'`, because every DataTable loads it
  and the gate was refusing it to accounts without the Languages tool.
- **melis-cms**: `GdprBanner`, `MiniTemplateManager`, `MiniTemplateMenuManager`.
- **melis-commerce**: `MelisComCategoryList`, `MelisComProductList`,
  `MelisComClientList`, `MelisComOrderList`, `MelisComCouponList`,
  `MelisComCurrency`, `MelisComAttributeList`, `MelisComLanguage`,
  `MelisComCountry`, `MelisComOrderStatus`, `MelisComSettings`,
  `MelisComClientsGroup`, `MelisComContact`.
- **melis-cms-tags**: `TagsList`, `Tag`.
- **melis-cms-mcq**: `MelisCmsMcq`, `McqQuestions`.
- **melis-cms-link-check**: `MelisCmsLinkCheckList`.
- **melis-cms-page-analytics**: `MelisCmsPageAnalyticsTool`.
- **melis-cms-user-account**: `MelisCmsUserAccountTool`.

Keyed earlier in the same rollout (2026-09-22/23), same mechanism:

- **melis-core**: the listener itself, `ToolUser` (`exportToCsv` rights check,
  `getUserConnectionData` no longer trusts the posted `usr_id`),
  `MelisCoreGdprAutoDelete::runGdprAutoDeleteCron` (CLI, cron token or GDPR right).
- **melis-react-override**: `PluginView` (`toolPage` refuses a tool key the caller
  cannot access).
- **melis-ai**: `Admin`, `Agent`, `AgentProperties`, `Instance`, `McpInspector`, `Tool`.
- **melis-ai-tool-creator**: `Index`.
- **melis-cache-internal**: `MelisCacheInternal`, `ClearingLogs`,
  `MelisCachePageExclusion`, `PartialCaching`, `UrlParameters`.
- **melis-calendar**: `Calendar`, `ToolCalendar`.
- **melis-cms-news**: `MelisCmsNewsWorkflowComments`.
- **melis-cms-mcq**: the four `MelisReactApiMcq*` controllers.
- **melis-cms-page-analytics**: `MelisReactApiPageAnalyticsTab`.
- **melis-cron**: `Cron`, `History`, `List`, `Properties`.
- **melis-dashboard-plugin-creator**: `DashboardPluginCreator`.
- **melis-document-upload**: `DocumentUpload`.
- **melis-marketplace**: `MelisMarketPlace`.
- **melis-newsletter**: `MelisNewsletterTool`, `MelisNewsletterConfigTool`,
  `MelisNewsletterGroupsTool`, `MelisNewsletterGroupsSubTab`,
  `MelisNewsletterGroupsSubTabSubscribers`, `MelisNewsletterHistoryTool`,
  `MelisNewsletterSendTool`.
- **melis-phpinfo**: `List`.
- **melis-small-business**: `MediaLibrary` (also gates MoxieManager: an account
  without the Media library right can no longer open the file browser).
- **melis-sql**: `List`.
- **melis-templating-plugin-creator**: `TemplatingPluginCreator`.
- **melis-tool-creator**: `ToolCreator`.

Related fix: `DocumentUploadReactApi` (melis-document-upload),
`MelisReactApiMcpInspector` (melis-ai), `MelisSqlReactApi` (melis-sql) and the
MCQ `McqReactApiTrait` redeclared `MELIS_KEY` as `private` while the parent class
(or the classes using the trait) declared it public. PHP refuses that, so these
React APIs answered 500. The private copy was removed; the inherited key is used.

Tested on a local stack with restricted accounts: an account without the tool
gets a 403, an account with it (or admin) works as before.

---

Thank you to the researchers who help keep Melis Platform users safe.
