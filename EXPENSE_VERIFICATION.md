# Expense Approval verification — 14 October 2026

| Requirement | Implementation and evidence | Result / blocker |
|---|---|---|
| Two portals, named owner | Existing routes preserved; owner profile display name added | Syntax + existing auth tests passed; profile editing available |
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
| Demo Organisation | Explicit `npm run demo:expenses`, dummy accounts, approved/rejected API transactions | Passed on running local portal: 1 approved, 1 rejected, 3 dummy accounts; not a real client |
| Separate test workbook | Local Expenses table export with matching IDs | Passed matching IDs in named Expenses table; local export only |
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

## Additional local evidence

On 14 October 2026 the running portal was restarted and the demo setup rerun.
Two requests remained, confirming local persistence and duplicate prevention.
Admin, manager and employee screen templates rendered successfully with actual
authenticated API responses in a DOM stub. This checks rendering logic only, not
browser visual layout. Screenshots remain outstanding.

## 17 October 2026 reporting extension

- Added filtered admin report UI and authenticated CSV/XLSX export.
- Verified Test/Production report separation and employee/cross-org/owner-without-grant export denial.
- Verified actual local MTG employee submission, assigned-manager approval and matching report row.
- Left a separate Test request pending for a live user-driven decision.
- Verified working MTG/QAHE admin accounts and organisation isolation.
- Test receipt PDF rendered and visually reviewed.
- Browser screenshots and real Microsoft delivery remain outstanding.

## 17 October 2026 founder finance extension

Separate owner-only company ledger added. Tests verify client admin/employee denial,
invalid dates/amounts, idempotent submission, per-currency CSV reports and retained
void history. Actual local founder overview was checked against the private stored
entry. Organisation expense totals remain separate; no bank integration is claimed.
