# HTTP-triggered test approval flow

Use an existing Forms approval/issue flow only as a business reference. Create a separate test version with a fixed test approver, a new Excel workbook in OneDrive for Business/SharePoint and an Excel Table called OperaOSTestRequests.

Columns: id,organisation,campus,approver,equipment,quantity,requester,created,status,approvalId,recordJson,issuedAt.

Create a flow with **When an HTTP request is received**. Use QAHE-http-trigger-schema.json. Validate protocol=operaos-v1, organisation=qahe and record.demo=true. Choose tenant-approved trigger authentication. Store the signed trigger URL and optional bearer token only in backend environment variables. Do not trust the caller's approver identity; assign the fixed TEST approver.

Switch on `triggerBody()?['operation']`:

- test: verify a read of the test table, then return 200 JSON with ok=true, organisation=qahe, testResource=true, protocol=operaos-v1.
- list: list saved test rows and return records as objects, preserving boolean demo=true and current status. recordJson stores the full record. Use pagination where needed.
- request: reject duplicate IDs or return the existing saved record without creating another approval. Save pending row. Create an approval, save Approval ID. Add parallel branches: one returns the stored pending record promptly; the other waits for that Approval ID and updates the SAME row to approved/rejected after the test approver's actual response. Keep the original ID throughout. Do not wait for human approval before the HTTP response (backend timeout is 25 seconds). Use a JSON 200 response, not an empty asynchronous 202.
- status: get the row by incoming id and return its saved record. Unknown ID returns 404/ok=false.

Common successful response envelope:

```json
{"ok":true,"organisation":"qahe","testResource":true,"record":{"id":"SAME-INCOMING-ID","organisation":"qahe","demo":true,"status":"pending","campus":"London","approver":"Fictional test approver","equipment":"Demonstration laptop","quantity":1}}
```

`list` uses records:[...] instead of record. Example JSON is a contract example, not live execution evidence.

Save the flow to generate its HTTP endpoint. Set QAHE_ENDPOINT_URL (and QAHE_TOKEN if required) in the backend environment. A single Switch endpoint handles all operations; QAHE_STATUS_ENDPOINT_URL is optional. Restart, then QAHE → Data Connections → Save and Test connection.

Verify one request in OperaOS, the matching pending spreadsheet row, a test approver's actual approval and a subsequent Fetch approval status for the SAME ID. Review Runtime Activity and refresh connected dashboard counts. Approval does not mean issued. Record test issue separately in issuedAt; this adapter's approval status remains approved. Never change real inventory or notify production approvers.

Excel is not a transactional unique-key database; submit one request at a time for this small demonstration. For concurrent production workloads use a suitable database and authenticated backend permissions.

References: https://learn.microsoft.com/en-us/power-automate/oauth-authentication and https://learn.microsoft.com/en-us/troubleshoot/power-platform/power-automate/approvals/differences-between-flow-approval-actions
