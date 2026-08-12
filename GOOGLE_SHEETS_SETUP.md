# Google Sheets Registration Sync

## Purpose

The site stores every squad registration in its database first. Once the organizer configures a Google Apps Script webhook, every **new** successful registration is also posted to that script and appended to the connected Google Sheet. The organizer config is only available in the role-protected dashboard at `/organizer`.

> Use the production **`/exec`** URL in the dashboard. Google documents that the `/dev` URL is a testing deployment and is available only to script editors; it is not appropriate for public registrations. [1]

| Requirement | What to prepare |
|---|---|
| Google Sheet | A spreadsheet owned by the organizer account. |
| Sheet ID | Copy the text between `/d/` and `/edit` in the spreadsheet URL. |
| Apps Script | A standalone script project associated with the organizer’s Google account. |
| Dashboard access | Sign in at `/organizer` with an account whose role is **admin**. |

## 1. Create the Google Apps Script

Open [Google Apps Script](https://script.google.com/), create a **New project**, replace the default source file with the following code, and replace `PASTE_YOUR_SHEET_ID_HERE` with the Sheet ID prepared above.

```javascript
const SHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";

function doPost(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  const payload = JSON.parse(e.postData.contents);
  const r = payload.registration;

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Registration ID",
      "Team",
      "Leader",
      "Grade",
      "School",
      "Email",
      "Phone",
      "Track",
      "Project",
      "Description",
      "Members",
      "Submitted at",
    ]);
  }

  sheet.appendRow([
    r.id,
    r.teamName,
    r.leaderName,
    r.leaderClass,
    r.schoolName,
    r.email,
    r.phone,
    r.projectCategory,
    r.projectTitle,
    r.projectDescription,
    r.members.map(m => `${m.name} (${m.grade})`).join(", "),
    r.createdAt,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

The script uses `doPost(e)` because Apps Script routes HTTP POST requests to that function, with the request body supplied via the event object. A deployable web app must return an `HtmlOutput` or `TextOutput`; this implementation returns JSON via `ContentService`. [1]

## 2. Deploy the Web App

From the Apps Script editor, open **Deploy → New deployment**, select **Web app**, and complete the deployment form. Set execution to the organizer account so the script can write to the organizer-owned spreadsheet. Configure access so the published registration site can invoke the endpoint under the organization’s preferred access policy, then authorize the requested Google permissions and deploy. Google’s official deployment workflow is **Deploy → New deployment → Web app → Deploy**. [1]

Copy the resulting deployment URL. It ends with **`/exec`**. For a production integration, use a versioned deployment rather than a head deployment; Google describes head deployments as test-only and advises versioned deployments for public use. [2]

## 3. Configure the Site

Open the organizer dashboard at `/organizer`. In **Google Sheets connection**, paste the copied Apps Script `/exec` URL into **Deployed Apps Script URL** and select **Save webhook**. The field only accepts `https://script.google.com/...` endpoints, helping prevent an accidental connection to an unrelated address.

| Result in the organizer dashboard | Meaning |
|---|---|
| `synced` | The registration was accepted by the Apps Script endpoint. |
| `not configured` | No webhook was saved when that registration was received. |
| `failed` | The registration remains safely stored in the site database, but the Apps Script endpoint did not accept the request. Check the deployment and URL. |

## 4. Verify the Connection

Submit one new squad registration from the public site. Refresh the spreadsheet and confirm a new row appears. The organizer dashboard shows the same registration and its sync status. If it is marked `failed`, confirm that the URL ends in `/exec`, the deployment is active, and the deployment account has edit access to the selected sheet.

When the Apps Script code changes, create a new version and update the existing deployment through **Deploy → Manage deployments**; Google notes that this updates the published code while maintaining the deployment URL. [2]

## References

[1] [Google Apps Script — Web Apps](https://developers.google.com/apps-script/guides/web)

[2] [Google Apps Script — Create and manage deployments](https://developers.google.com/apps-script/concepts/deployments)
