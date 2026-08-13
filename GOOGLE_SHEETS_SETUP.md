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

Open [Google Apps Script](https://script.google.com/), create a **New project**, and replace the default source file with the following code. The shared **Hackfinity Registration** sheet ID is already included. The script creates a **Registrations** sheet automatically, freezes the header row, applies a cyan header style, and enables filtering.

```javascript
const SHEET_ID = "1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0";
const SHEET_NAME = "Registrations";

const HEADERS = [
  "Submitted Date & Time", "Registration ID", "Group / Individual", "Team Name", "Name", "Grade", "Theme / Battle Track",
  "Team Members Names", "Email", "Team Member Emails", "Phone Number", "Team Member Phone Numbers", "Project Title", "Project Description", "School Name"
];

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const r = payload.registration;
  const sheet = getRegistrationsSheet();
  const members = Array.isArray(r.members) ? r.members : [];

  sheet.appendRow([
    new Date(r.createdAt), r.id, r.participationType === "group" ? "Group" : "Individual", r.teamName, r.leaderName, r.leaderClass, r.projectCategory,
    members.map(member => member.name || "").filter(Boolean).join(" | "), r.email, members.map(member => member.email || "").filter(Boolean).join(" | "),
    r.phone, members.map(member => member.phone || "").filter(Boolean).join(" | "), r.projectTitle, r.projectDescription, r.schoolName
  ]);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function getRegistrationsSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#00dbe8").setFontColor("#061115").setWrap(true);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).createFilter();
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}
```

The script uses `doPost(e)` because Apps Script routes HTTP POST requests to that function, with the request body supplied via the event object. A deployable web app must return an `HtmlOutput` or `TextOutput`; this implementation returns JSON via `ContentService`. [1]

## 2. Deploy the Web App

From the Apps Script editor, open **Deploy → New deployment**, select **Web app**, and complete the deployment form. Set **Execute as** to **Me** so the script can write to the organizer-owned spreadsheet. Set **Who has access** to **Anyone** so the public registration website can send each completed form to the sheet without asking participants to sign in. Then authorize the requested Google permissions and select **Deploy**. Google’s official deployment workflow is **Deploy → New deployment → Web app → Deploy**. [1]

Copy the resulting deployment URL. It ends with **`/exec`**. For a production integration, use a versioned deployment rather than a head deployment; Google describes head deployments as test-only and advises versioned deployments for public use. [2]

## Structured Sheet Columns

Each new registration is a single row with the requested information: date/time, registration ID, **Group / Individual**, team name, student name, grade, battle track, team-member names, leader and member emails, leader and member phone numbers, project title, project description, and school name. Multiple team-member values are kept together in their matching columns and separated by a vertical bar, making each submission easy to filter and scan.

## 3. Configure the Site

Open the organizer dashboard at `/organizer`. In **Google Sheets connection**, paste the copied Apps Script `/exec` URL into **Deployed Apps Script URL** and select **Save webhook**. This is the exact place to add the link; no code change is required after the script is deployed. The field only accepts `https://script.google.com/...` endpoints, helping prevent an accidental connection to an unrelated address. Open the supplied [Hackfinity Registration spreadsheet](https://docs.google.com/spreadsheets/d/1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0/edit) while signed into the owner account to monitor every submitted row.

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
