# OperaOS reusable administration platform — v5.0

One application, two portals and one account/session system:

- `/owner`: platform owner, provisioned only through private backend environment on first boot.
- `/organisation`: organisation administrators, managers, approvers, employees and students; public registration creates a new isolated workspace. `/admin` and `/user` redirect here for compatibility.

Login automatically selects the account's portal. Changing a URL or request body cannot grant a role or another organisation's records. The backend checks the current account, organisation, enabled module and operational permissions. Passwords use salted scrypt hashes; sessions use hashed random tokens in private SQLite, HttpOnly/SameSite cookies, eight-hour expiry and logout revocation. Authentication attempts are rate limited. No frontend role selector or credential storage exists.

## Setup

Node.js 24+ and npm. Locked spreadsheet dependencies are listed in package.json/package-lock.json.

```
npm ci
cp .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Set `OPERAOS_ENCRYPTION_KEY` in `.env` to your generated base64 32-byte key. Set `OPERAOS_OWNER_EMAIL` to your own email and `OPERAOS_OWNER_PASSWORD` to a private 12–128 character password. No owner credential is shipped. The first boot creates the sole owner account. Subsequent starts do not reset that password or replace the owner identity. Keep `.env` private (`chmod 600 .env` on macOS/Linux).

```
npm start
```

Open http://localhost:8787/login. Use your owner credentials. The server binds to loopback. For external environment injection instead of a `.env`, run `node server/server.mjs`.

## Owner

The owner dashboard lists organisations, status, enabled modules, registered user counts, actual local/connected record counts, connection health and recent automation executions. Manage workspace state and enable/disable modules in the platform catalogue. Select Configure on an organisation to manage its configuration and invite administrators. Owner access cannot be created by registration, invitations or an organisation administrator.

QAHE and MTG retain their equipment/attendance module configurations and integration adapters, with fictional default equipment and no client records. Invite your own test organisation administrators from the owner portal; no shared administrator login is provided.

## Organisation registration and onboarding

Open `/register`, enter your organisation, administrator name/email/password and equipment/attendance starting configuration. The backend creates a separate draft workspace and administrator account. Registration ignores any submitted owner role or foreign organisation ID.

Onboarding has eight saved stages: details → modules → connect/import → map fields → rules → invite users → test → activate. Saved configuration is resumable. Equipment setup requires exactly one registered active approver per campus. Connection testing is separate from configuration activation: an organisation can activate local workflows while external connections stay Not connected. Disabled modules retain records but reject operational requests.

## Individual accounts and invitations

Administrators manage only their own workspace's accounts and permissions. Invite an employee, student, approver or administrator. Invitations are one-use links, expire after 24 hours and require the exact invited email when accepted. Delivery is explicitly simulated: copy the link to the intended TEST recipient; no email is sent. Accepted accounts choose their own password. Approvers are assigned a campus. Deactivating a user rejects that user's existing session on its next request.

Self-registration and invitation acceptance do not verify mailbox ownership; add real email delivery/verification before an internet-facing operational rollout. No password recovery endpoint is shipped.

## Operational functionality

- QAHE: student request → assigned campus approval/rejection → administrator issue → confirmed return restores stock. Only the assigned approver can decide. Administrators add/adjust inventory and run due return reminders while the app is open. Reminders are simulated notifications, not a background scheduler.
- MTG: employees upload required photo evidence when enabled, check in/out and receive calculated working hours. Saved break/daily-hour rules stay with each shift. Administrators can correct missing checkouts; missing end-photo evidence remains explicitly missing.
- Reports, personal history and notifications are scoped on the backend. CSV exports neutralise formula prefixes. Inventory CSV imports and labelled historical JSON rows are available; accounts are provisioned through invitations. Historic imports are excluded from connected runtime counts and personal rows are filtered per account.
- Operational records/photos/accounts now persist in private backend SQLite; the legacy browser-local implementation is retained in `legacy/` as source only. Old browser storage is not silently uploaded or trusted as an authenticated account database. Import authorised historical data explicitly after reviewing it.

## Runtime integrations and credentials

`MTG_ENDPOINT_URL`, `MTG_TOKEN`, `QAHE_ENDPOINT_URL`, optional `QAHE_STATUS_ENDPOINT_URL` and `QAHE_TOKEN` are backend-only environment variables. New workspaces use `OPERAOS_CONNECTIONS_JSON`, keyed by the actual workspace UUID shown in the owner's organisation/configuration API, e.g. `{ "WORKSPACE_ID": { "endpoint": "HTTPS_TEST_ENDPOINT", "token": "PRIVATE_TOKEN" } }`. Do not place actual secrets in source.

Connection labels/mappings persist per organisation, encrypted with AES-256-GCM. Secrets and signed URLs are taken from environment rather than browser forms or responses. Runtime data and sessions are in `.runtime/` (or `OPERAOS_STATE_DIR`), which is ignored. Preserve the encryption key to reopen encrypted configuration.

Deploy `integrations/GoogleAppsScript.gs` only against a separate Google test sheet with the documented column mapping. See `integrations/POWER-AUTOMATE.md` for the separate HTTP-triggered approval test flow and response schema. Existing test-resource scripts default to MTG; set `OPERAOS_ORGANISATION` in Apps Script Properties when deploying for a newly registered workspace ID. The endpoint must return that same organisation in every response.

Runtime attendance writes use the authenticated employee ID/name and backend-owned operational rules; employee-supplied account IDs are ignored. Writes are read back before success is recorded. QAHE returns actual pending/approved/rejected status from the configured workflow. Connected dashboards count endpoint snapshots; imported and demonstration data remain separate. A failed endpoint is never displayed as a successful connection.

No real endpoint is bundled and no live Google/Power Automate transaction is claimed verified. The supplied legacy MTG deployment previously lacked doPost and the QAHE HTTP endpoint had not been supplied. Complete live verification only after deploying a dedicated test endpoint and matching one record ID from OperaOS through remote storage/workflow and back.

## Testing

```
npm run check
npm test
```

Tests run an isolated server on port 8788 with temporary state, fictional accounts and a test-only transport fixture. They cover registration/onboarding, owner restrictions, invitations, login/logout/deactivation, backend role checks, organisation isolation, module enforcement, local equipment lifecycle, attendance rules and authenticated fixture write/read-back. Fixture results are not live endpoint evidence. No test account/password is created by `npm start`.

Manual verification: register two organisations, activate them, invite accounts, attempt cross-workspace API/URL access, complete a local workflow, logout and confirm old sessions fail. For a real connected test, configure your own separate endpoint, submit a fictional transaction, inspect the remote record, retrieve it in OperaOS and compare ID/status/hours. Keep screenshots outside Git.

## Deployment

Deploy on a private Node 24+ host with environment injection and persistent private SQLite storage. For a private VM, install dependencies, run tests, inject secrets, then run the server under your process manager. Access through:

```
ssh -N -L 8787:127.0.0.1:8787 YOUR_USER@YOUR_PRIVATE_HOST
```

Use http://localhost:8787 locally. Static hosting alone cannot run the backend. Before public multi-user hosting, configure TLS/public-origin handling (the current server deliberately accepts only local origins), add email verification/password recovery, operational monitoring/backups and load/concurrency checks. SQLite and loopback routing here target a private demonstration deployment, not an already-verified hosted service.

## GitHub

Complete source is included. `.gitignore` excludes `.env`, runtime databases, keys, private imports, exports and screenshots. Only fictional source defaults and test fixtures belong in the repository. Review staged files before committing; never paste a token into a remote URL.

```
git init -b main
git add .
git status --short
git commit -m "Add authenticated OperaOS portals and backend permissions"
git remote add origin https://github.com/areej123-wq/OperraOs.git
git push -u origin main
```

For an existing checkout, skip init/remote-add; preserve existing history. Never force-push to solve divergent history.

## Project layout

`frontend/`: portal UI and branding. `server/`: backend authentication, organisation logic, integration adapter and tests. `integrations/`: Apps Script and Power Automate contracts. `sample-data/`: fictional imports. `legacy/`: prior local demo source, not served as authenticated UI. `DEVELOPMENT.md`: actual dated history. `VALIDATION.md`: checks and material limitations.

# v5.0: two portals and reusable operations

This section supersedes the earlier v4 portal structure. There are now exactly **two portal destinations**:

- `/owner`, with `/owner-login`: OperaOS Owner Portal. Owner-only organisation/account/module/plan settings, aggregate usage and execution monitoring.
- `/organisation`, with `/login` and `/register`: Organisation / User Portal. Organisation Admin, Manager, Approver and Employee/User (including student accounts) are roles inside this single portal. `/admin` and `/user` are backward-compatible URLs that navigate to `/organisation`; they are not additional portals.

The existing backend account/session system and QAHE/MTG configurations remain. Managers have organisation-scoped operational visibility and task/document management; administrators alone manage users, module selection, connection configuration and automation definitions. Approvers decide only assigned local requests; ordinary users see their own records. No role selector grants access.

Organisation admins may explicitly grant platform-owner access to organisation records in Operational rules. The owner cannot self-grant. Owner configuration/record access is logged. Aggregate owner metrics remain available without a record-access grant. Plans are configurable labels; billing is unavailable.

## Module catalogue

| Module group | Supported functionality |
|---|---|
| Workforce Operations | Attendance, calculated hours, saved rules, account/staff records; full shift planning unavailable |
| Request & Workflow Management | Campus routing, assigned approvals, status history, optional Power Automate test adapter |
| Asset & Inventory Control | Equipment, stock, controlled issue and confirmed return |
| Task & Schedule Automation | Tasks, deadlines, completion, recurring tasks, overdue escalation and scheduled local reports |
| Document & Records Management | Categories, ownership, expiry, PDF/text/image uploads and authorised download |
| Communications Automation | Scoped simulated notifications, renewal/stock/overdue/approval reminders |
| Reporting & Operational Analytics | Actual-record cards/charts, searched record tables, CSV/XLSX exports and scheduled summaries |

Modules are selectable per workspace; the owner controls availability in the catalogue. Configuration and disabled-module operational permissions are enforced on the backend.

## Saved onboarding

Organisation details → Select modules → Connect/import data → Map fields → Configure rules → Invite users → Test → Activate. Registration offers equipment, workforce, document-renewal and general-operations starting templates. Saved mappings and configuration can be resumed. Existing local work can activate independently of a cloud connection; cloud status remains truthful. Eight setup stages replace v4's six stages.

## Data Integration Centre

- Excel `.xlsx` and CSV are file imports, not continuing sync. Choose a worksheet/tab, preview the first ten rows and validate headers/mappings. Limits: 3 MB input, 2,000 rows, 52 columns; expanded XLSX archive limit 30 MB. Formulas are never executed by import. Map task/document fields and validate dates before atomic commit. Title/date/type duplicate keys prevent repeated imports creating repeated records. Preview expires after ten minutes; mapping persists in the workspace.
- Existing inventory CSV import is retained. Accounts still require individual invitations; importing a name is not an authentication grant.
- Export combined operational/task/document records as CSV or XLSX. CSV formula prefixes are neutralised. Photos are not included in generated Drive reports.
- Create separate ongoing source configurations per module. Google Sheets, Google Drive and connected Excel store resource IDs, tab/table, requested read/write access, status, last successful sync and errors. Credentials come from backend environment only.
- Google Sheets REST supports metadata/tab listing, bounded read preview and appending bounded row arrays (RAW mode). The existing attendance Apps Script adapter calculates and writes attendance with independent read-back verification. Generic append responses alone are not end-to-end workflow evidence.
- Google Drive lists files inside the configured folder, verifies a selected file belongs there and saves the selection. Generated JSON reports can be uploaded and their file ID/parent folder independently read back.
- Connected Excel uses Microsoft Graph for workbook table listing, bounded reads and adding rows. This requires a supported OneDrive for Business/SharePoint workbook and the user's correct delegated OAuth permissions. It is distinct from uploading an Excel file.

Configure `MTG_GOOGLE_ACCESS_TOKEN`/`QAHE_GOOGLE_ACCESS_TOKEN` and corresponding `_GRAPH_ACCESS_TOKEN` variables, or `googleAccessToken`/`graphAccessToken` under a new workspace's `OPERAOS_CONNECTIONS_JSON` entry. Consent, token acquisition and token refresh are external setup; automatic refresh is **unavailable**. Do not use production data or paste tokens into source/chat. Provider scopes determine actual grants; the UI's read/write checkbox is configured permission, not proof the provider granted it. Unconfigured providers are displayed as unavailable, never connected.

## Shared automation

Choose a template and conditions in Automation templates. The scheduler checks active organisations every 30 seconds while the backend runs:

- Document expiry window → renewal task and simulated reminder.
- Stock below threshold → replenishment request and simulated notice.
- Overdue task → owner notice and administrator escalation.
- Approved request → saved notification marker and requester notice.
- Attendance checkout → existing backend calculation and configured Apps Script write/read-back.
- Recurring interval → new task for the current schedule slot.
- Scheduled report → local summary based on actual records.

Action keys are persisted in SQLite and local side effects commit transactionally. Identical trigger/source/action keys do not replay on a repeated scan or process restart. Schedules require a running backend and do not backfill every missed interval. No browser-only scheduler is claimed. Recurring intervals are in minutes; there is no arbitrary visual rule-language builder. Real email sending is unavailable; notifications are clearly simulated. Replenishment requests are persisted shared-automation records; a full procurement/PO workflow is unavailable.

## Third-organisation demonstration

The automated tests and browser QA created **Demo Services — third organisation** through the ordinary registration/configuration process. It selected Documents/Tasks, imported its own test CSV, mapped Title/Expires/Category and ran the document-expiry template. The backend created one renewal task and one simulated reminder; a repeat scan made no duplicate. This uses the same application and configuration engine as QAHE/MTG. Test runtime records are not committed to Git.

## Capability and verification limits

Available locally: auth/roles/isolation, module selection, templates/onboarding, file imports/mapping, duplicate prevention, task/document ownership, uploads/downloads, scheduled local automations, execution logs, CSV/XLSX reports and provider adapter code.

Unavailable/unverified: full shift roster planning, automatic OAuth refresh, arbitrary visual rule designer, billing/payment enforcement, real email delivery, full procurement workflow, automatic delivery of generic local automation results to cloud sources (use explicit source/report writes), public production deployment and a live Google/Power Automate connected transaction without external endpoints/tokens. Provider adapters are implemented but not connected by default. The existing isolated attendance fixture test is explicitly not live Google evidence.

Run `npm ci`, `npm run check`, `npm test`, and `npm audit`. ExcelJS is the spreadsheet dependency; a UUID override addresses its transitive advisory. Setup still requires the owner credentials and encryption key from the earlier section. Keep `.env`, databases, uploaded files, report exports and credentials outside Git.

Provider references: https://developers.google.com/workspace/drive/api/guides/manage-uploads and https://learn.microsoft.com/en-us/graph/api/tablerowcollection-add

### MTG historical attendance and QAHE demonstration (13 October 2026)

The owner overview and organisation dashboard show separate imported attendance
and fictional request sections. QAHE's 390 fictional requests illustrate the
user-reported baseline; the actual official form submissions are not imported.
All campus/status allocations are fictional. These illustrative requests are
read-only; the existing Requests & issue module remains the operational workflow.

Import local MTG attendance (never reads roster PINs or copies photo links):

```sh
node server/import-attendance.mjs '/path/to/Pakistan Employee Attendance System.xlsx' '/path/to/Drivers Attendance.xlsx' .runtime/mtg-history.json
```

Restart the backend after import. The importer reads the Attendance and Driver
Attendance tabs. It stores original dates and records corrections when consistent
full-date check-in evidence identifies day/month export reversal. Invalid dates
are skipped. Hours use recorded nonnegative numeric Total Hours values. Completed
shifts mean positive recorded hours. These are historical file snapshots, not live
connections. Set `OPERAOS_MTG_HISTORY_FILE` to override the private import location.
Private imports and runtime databases are excluded from the source ZIP and Git.
Owner sees aggregate historical statistics; row access still requires the
organisation's owner-record-access grant. Administrators see their own records.

## Expense Approval v1.0.0 — 14 October 2026

This additive module preserves the owner and organisation/user portals, existing
records, QAHE/MTG configurations and adapters. Select **Expense Approval v1.0**
during registration, or enable Expenses in an existing workspace's module wizard.
Only implemented templates are offered. Owner display name can be updated in
**Plans & platform settings**. Owner operational access still needs the admin's
grant; owner is not an expense approver.

### Setup and use

1. Register an organisation, select Expense Approval, and save onboarding progress.
2. Invite an employee and a Manager/Approver. Invitation links are simulated
   delivery; share the one-use links with intended users through your own channel.
3. Under Expense Approval save categories, currency, default manager, high-value
   threshold and optional high-value/category routes. Category routes take
   precedence. Managers must be active accounts in the same organisation.
4. Optionally choose an Excel workbook/table and map every request/decision field
   to a unique existing column. Browse Microsoft workbook destinations lists the
   first 200 root items. Nested/shared workbooks can use their Drive/item IDs.
   Configure each manager's Teams chat ID. These are metadata, not credentials.
5. Keep Microsoft tokens in `OPERAOS_CONNECTIONS_JSON`, keyed by the workspace UUID
   with `graphAccessToken`. Do not paste tokens into frontend fields or Git.
6. Test rules and activate the workspace. Disconnected external services do not
   block the internal approval process. Connection tests validate resource access;
   delivery is only Succeeded after the real operation confirms success.
7. Employee submits amount/category/description and a PDF/PNG/JPEG receipt ≤1 MB.
   The assigned manager approves/rejects with a mandatory comment. History records
   the authenticated actor, timestamp and decision. The secure request link opens
   a permitted record after login and never changes the decision on GET.
8. Review summaries, queue/history and execution logs. Retry external steps from
   an admin or assigned-manager account. Internal records remain saved on failure.

### Microsoft integration

The backend uses Microsoft Graph, independent of Power Automate. Supply a delegated
work/school token for the authorised Microsoft account. Excel requires workbook
write permission, and chat delivery requires permission to send chat messages;
chat testing additionally requires permission to read configured chats. Tenant
consent and exact resource permissions must be configured by your Microsoft admin.
App-only Excel/ordinary Teams chat posting is not supported by this implementation.
See Microsoft's official documentation:
- https://learn.microsoft.com/graph/api/tablerow-update?view=graph-rest-1.0
- https://learn.microsoft.com/graph/api/chatmessage-post?view=graph-rest-1.0

Excel requests are upserted by requestId. Reads page up to 20,000 table rows, reject
existing duplicate IDs, update matching rows and verify all mapped fields by
read-back. Use a dedicated test workbook before production. In-process concurrent
sync of the same expense is rejected. Successful jobs are not repeated. Submission
idempotency is scoped to employee plus organisation; decisions are immutable once
recorded. On an ambiguous Teams timeout/crash, the job becomes Unknown and is not
resent, preventing blind duplicate notifications. Reconcile the chat manually;
there is no automatic reconciliation/resend UI for Unknown Teams jobs. This avoids
claiming exactly-once remote delivery, which these provider APIs do not guarantee.
Excel ambiguous writes are safe to retry by matching request ID before adding.
Automatic OAuth acquisition/refresh, Graph credential setup, external workbook
creation and arbitrary multilevel approvals are not implemented. Uploaded files
are snapshots, not a live connection. Each expense retains its currency and mode
when rules change; the headline approved amount counts the currently configured
currency only.

### Demo organisation

With the server running, run `npm run demo:expenses` (set PORT to the running port,
for example `PORT=8792 npm run demo:expenses`). It registers a fictional organisation
and dummy admin/manager/employee accounts, saves rules/onboarding and completes one
approved and one rejected expense through authenticated APIs. It writes a separate
local `.runtime/Expense-Demo-Test.xlsx` table export, not a connected cloud workbook.
Dummy credentials are generated in `.runtime/expense-demo-credentials.json`, excluded
from Git. Repeat runs do not duplicate the demonstrated requests. Live Teams and
Excel remain Not connected until separately configured. Demo-only admin grants
owner record access so the owner can inspect this fictional demonstration.

### API and verification

`GET /api/:org/expenses` returns permitted history, template metadata and summaries.
Authenticated POST endpoints: `/settings`, `/test`, `/activate`, `/submit`,
`/decision`, `/receipt`, `/retry`, `/destinations`, `/connection-test`. JSON submission
requires idempotencyKey and receipt `{name,mime,content}` (base64). Decisions require
`{id,decision,comment}`. A future mobile client can use the same session login and
cookie, supplying the configured Origin for mutations. No role selector overrides
authenticated permissions. Native OAuth/mobile bearer authentication is not added.

Run `npm run check` and `npm test`. The expense suite verifies permission/isolation,
threshold/category routing, receipt validation, restart persistence, duplicates,
module disabling and a fixture-only Teams/Excel read-back transaction. Fixtures
are never loaded by `npm start`. See `EXPENSE_VERIFICATION.md` for evidence gaps.

For deployment, keep the server private behind an HTTPS reverse proxy and set
`OPERAOS_PUBLIC_ORIGIN=https://your-domain.example`. The proxy must serve this
backend and static assets under that origin; configure TLS, persistent private
state, backups and secret injection. Secure cookies then use HTTPS. Public hosting
and Microsoft tenant connectivity have not been deployed or verified here.

### Operational Google Sheet statistics (13 October 2026)

Administrators can add separate Google Sheets sources in Data Integration Centre.
Leave **Allow writes** unchecked for operational client sheets. Select the exact
module and tab, header row, and column header mappings (record ID, employee ID,
recorded hours, stock quantity, or approval status). Save, test, then choose
**Preview records** or **Refresh sheet statistics** on the organisation dashboard.
Each source has separate counts and a last successful read timestamp. A connection
test checks identity; only reading records creates a statistics snapshot. Reads
are manual and dashboard polling only refreshes the saved snapshot. Errors retain
last known statistics with a connection error and original timestamp.

Sheets reads cover the tab in 2,000-row pages, up to 20,000 grid rows and columns
A–AZ; larger sources must expose a dedicated reporting tab. Counts omit empty
rows and, when mapped, rows without a record ID. Hours use the source's recorded
numeric hours, not recalculated photo/time fields; completed shifts are rows with
positive recorded hours. Quantity is summed only from the mapped quantity column.
Only aggregate statistics are persisted, not the raw personal source rows.

Configure organisation-specific `<ORG_ID>_GOOGLE_ACCESS_TOKEN` on the backend
(or `googleAccessToken` in `OPERAOS_CONNECTIONS_JSON`). The token must belong to
an identity with access to that sheet. ChatGPT's connected Drive authorisation
is separate from OperaOS. Tokens expire; automatic refresh is not implemented.
Never commit credentials, client spreadsheet IDs, snapshots or operational data.
Until real credentials pass a read, the source stays unverified; fixture tests
are not evidence of a live connection.

QAHE files in Microsoft OneDrive/SharePoint use the **connectedExcel** adapter,
not Google Drive. They require organisation-specific Graph credentials, workbook
Drive/item IDs and an actual named Excel table. The existing Excel adapter reads
a bounded 100-row preview; it does not yet populate these Google Sheet dashboard
aggregates. A OneDrive link alone does not establish authentication or verify a
live Microsoft connection.
