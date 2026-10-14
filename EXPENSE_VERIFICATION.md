# Expense Approval verification — 14 October 2026

| Requirement | Implementation and evidence | Result / blocker |
|---|---|---|
| Two portals, named owner | Existing routes preserved; owner profile display name added | Syntax + existing auth tests passed |
| Backend permissions and isolation | Employee-owned / assigned-manager / admin record scope | Expense suite passed |
| Saved resumable onboarding | Existing 8 stages extended with expense configuration/test gate | Registration, rules, activation tests passed |
| Shared template/version | Expense Approval 1.0.0, organisation-scoped SQLite settings | Saved settings and restart checks passed |
| Categories/currency/routing | Category override then threshold/default authorised manager | Routing tests passed |
| Form and receipts | Amount validation, required description, ≤1 MB PDF/PNG/JPEG signatures | Invalid amount/receipt tests passed |
| History/queue/decisions | Authenticated actor, comment, timestamps; pending decisions only | Approve/reject + duplicate decision tests passed |
| Persistent requests and duplicate prevention | SQLite + scoped submission idempotency key + job keys | Retry/restart tests passed |
| Microsoft destinations/mapping | Graph workbook selection, exact unique field mapping, read-back | Fixture tests passed; real token/destination not supplied |
| Teams link/delivery | Authenticated read-only request URL; manager chat IDs; durable delivery status | Fixture passed; live Teams blocked by missing token/chat |
| Failure handling | Not connected/Failed/Unknown persist without losing request; no blind Teams resends | Disconnected and failure-path tests; Unknown requires manual reconciliation |
| Actual statistics and logs | Scoped saved expense counts/amounts and activity rows | API suite passed; Demo/Production modes explicit |
| Demo Organisation | Explicit `npm run demo:expenses`, dummy accounts, approved/rejected API transactions | See private runtime evidence after setup; not a real client |
| Separate test workbook | Local Expenses table export with matching IDs | Local export only; does not establish live Excel delivery |
| Existing functionality | Attendance, equipment/inventory, history, organisation/auth tests retained | Existing suite passed |
| Screenshots | Required captions listed below | Browser URL policy prevented browser screenshot capture; no screenshots fabricated |
| Complete source / credentials excluded | Code, integration guide, env example, ignore rules, tests and archive | Package excludes .env/runtime/client data |

## Required screen captures still outstanding

1. Owner dashboard: owner name/role and QAHE, MTG, Demo Organisation.
2. Demo Organisation Expense Approval: saved manager, categories and threshold.
3. Expense history: approved/rejected request IDs, decision actor/time/comment.
4. Runtime Activity: the matching expense ID; real Excel row only after live sync.
5. Teams message only after confirmed real delivery.

Captions must include the actual capture date, organisation's Demo/Production mode
and precise connection state. A fixture or local XLSX export is not a live record.
No real Teams/connected-Excel screenshot exists at this delivery stage.
