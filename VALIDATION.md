# Validation — 12 October 2026

- Frontend/backend JavaScript syntax checks passed.
- npm ci --ignore-scripts --offline passed against package-lock.json (no external dependencies).
- Isolated Node adapter tests passed: attendance write/read-back, saved break deduction, QAHE status retrieval, organisation isolation, session requirement, invalid configuration and endpoint failure logging.
- Environment-only credential handling checked; connection state does not disclose tokens or endpoint URLs. SQLite metadata encryption verified. Test fixtures are intentionally fictional and are not live endpoint evidence.
- Scanned repository text for known client contacts, spreadsheet/deployment IDs and historical totals; none remain. Email literals use example.invalid only.
- Runtime databases, private keys, .env files, client spreadsheets, historical data, photos and screenshots are excluded from delivery.
- Real Google/Power Automate transaction verification is not claimed. Configure your own dedicated test endpoints to perform live tests.

## 13 October 2026 — authenticated portals
Automated checks passed: self-registration cannot create owner; draft activation requires test; invite tokens are single-use; assigned approval and stock issue/return; password hashes, login/logout and deactivated-session rejection; cross-organisation and role escalation denial; disabled-module write/read denial; authenticated connected fixture write/read-back with account impersonation rejection. Browser verified owner login/logout, organisation registration/onboarding, invitation acceptance, employee dashboard and automatic correction of /owner to /user. Connected fixture is not live endpoint proof.

## 13 October 2026 — reusable platform checks
Third organisation enabled Documents/Tasks, imported its own CSV via preview/mapping and generated exactly one renewal task/reminder. Repeat execution produced no duplicate. XLSX export/re-import and invalid-tab rejection passed. Owner record access was denied until the organisation administrator granted it; owner self-grants were rejected. Browser verified the same third-organisation import and automation using the shared UI. Base authentication/isolation/assigned-approval/inventory/attendance adapter tests remain passing. Notifications are simulated. Provider OAuth adapters require real configuration; a live connected workflow is not claimed verified.
