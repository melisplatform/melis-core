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

---

Thank you to the researchers who help keep Melis Platform users safe.
