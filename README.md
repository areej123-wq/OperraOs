# OperaOS authenticated portals — v4.0

One application, three separate routes and one account/session system:

- `/owner`: platform owner, provisioned only through private backend environment on first boot.
- `/admin`: organisation administrators; public registration creates a new, isolated workspace.
- `/user`: individual employees, students and assigned campus approvers.

Login automatically selects the account's portal. Changing a URL or request body cannot grant a role or another organisation's records. The backend checks the current account, organisation, enabled module and operational permissions. Passwords use salted scrypt hashes; sessions use hashed random tokens in private SQLite, HttpOnly/SameSite cookies, eight-hour expiry and logout revocation. Authentication attempts are rate limited. No frontend role selector or credential storage exists.

## Setup

Node.js 24+ and npm. No external package dependencies.

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

Onboarding has six steps: organisation details → module selection → data connections → operational rules → invite users → test and activate. Saved configuration is resumable. Equipment setup requires exactly one registered active approver per campus. Connection testing is separate from configuration activation: an organisation can activate local workflows while external connections stay Not connected. Disabled modules retain records but reject operational requests.

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
