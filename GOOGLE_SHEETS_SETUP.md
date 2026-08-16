# Google Sheets Registration Sync

## Purpose

The public Hackfinity website is hosted on GitHub Pages. Students complete registration on that same page, and the page posts the completed form directly to the Apps Script web app. The script appends the structured registration to the connected Google Sheet. A read-only Apps Script count response supplies the public live squad counter.

## Official Hackfinity Links

The project is managed by the **St-John-s-Hackfinity-2026** GitHub organization. GitHub Pages provides the public Hackfinity website, while the school-managed Google Sheet is the organizer record and Apps Script is the form-processing service.

| Resource | Link |
|---|---|
| Organization-managed source repository | https://github.com/St-John-s-Hackfinity-2026/hackfinity-26-website-source |
| GitHub Pages public website | https://st-john-s-hackfinity-2026.github.io/hackfinity-26-pages-preview/ |
| Organizer record | https://docs.google.com/spreadsheets/d/1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0/edit |

> Use the production **`/exec`** URL in the dashboard. Google documents that the `/dev` URL is a testing deployment and is available only to script editors; it is not appropriate for public registrations. [1]

| Requirement | What to prepare |
|---|---|
| Google Sheet | A spreadsheet owned by the organizer account. |
| Sheet ID | Copy the text between `/d/` and `/edit` in the spreadsheet URL. |
| Apps Script | A standalone script project associated with the organizer’s Google account. |
| Dashboard access | Sign in at `/organizer` with an account whose role is **admin**. |

## 1. Create the Google Apps Script

Open [Google Apps Script](https://script.google.com/), create a **New project**, and replace the default source file with the following code. The shared **Hackfinity Registration** sheet ID is already included. The script creates a **Registrations** sheet automatically, freezes the header row, applies a St. John’s yellow header style, and enables filtering.

```javascript
const SHEET_ID = "1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0";
const SHEET_NAME = "Registrations";

const HEADERS = [
  "Submitted Date & Time", "Registration ID", "Group / Individual", "Team Name", "Leader Name", "Leader Class / Grade", "School Name", "Leader Email", "Leader Phone Number", "Theme / Battle Track", "Project Title", "Project Description",
  "Member 2 Name", "Member 2 Class / Grade", "Member 2 Email", "Member 2 Phone Number",
  "Member 3 Name", "Member 3 Class / Grade", "Member 3 Email", "Member 3 Phone Number",
  "Member 4 Name", "Member 4 Class / Grade", "Member 4 Email", "Member 4 Phone Number",
  "Member 5 Name", "Member 5 Class / Grade", "Member 5 Email", "Member 5 Phone Number"
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Hackfinity cleanup")
    .addItem("Delete selected test rows", "deleteSelectedTestRows")
    .addToUi();
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const r = payload.registration;
  const sheet = getRegistrationsSheet();
  if (!r || !r.id || !r.createdAt) throw new Error("Invalid registration payload.");
  if (hasRegistrationId(sheet, r.id)) {
    return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: true })).setMimeType(ContentService.MimeType.JSON);
  }
  const members = Array.isArray(r.members) ? r.members : [];
  const memberCells = [];
  for (let index = 0; index < 4; index += 1) {
    const member = members[index] || {};
    memberCells.push(member.name || "", member.grade || "", member.email || "", asPlainText(member.phone));
  }

  sheet.appendRow([
    new Date(r.createdAt), r.id, r.participationType === "group" ? "Group" : "Individual", r.teamName, r.leaderName, r.leaderClass, r.schoolName, r.email, asPlainText(r.phone), r.projectCategory, r.projectTitle, r.projectDescription,
    ...memberCells
  ]);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const sheet = getRegistrationsSheet();
  const action = String(e.parameter.action || "");
  let result;
  if (action === "count") {
    result = { ok: true, count: Math.max(0, sheet.getLastRow() - 1) };
  } else if (action === "registrations") {
    result = { ok: true, registrations: getPublicRegistrations(sheet) };
  } else {
    result = { ok: false, error: "Unsupported request." };
  }
  const callback = String(e.parameter.callback || "");
  if (/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function getPublicRegistrations(sheet) {
  const rows = sheet.getDataRange().getDisplayValues().slice(1).filter(row => row[1]);
  return rows.slice(-50).reverse().map(row => {
    const participationType = String(row[2]).toLowerCase() === "individual" ? "individual" : "group";
    const memberNames = [row[4], row[12], row[16], row[20], row[24]].filter(Boolean);
    return {
      id: String(row[1]),
      participationType,
      teamName: participationType === "individual" ? "Individual registration" : String(row[3] || "Unnamed squad"),
      projectCategory: String(row[9] || "Unassigned track"),
      projectTitle: String(row[10] || "Untitled project"),
      memberCount: Math.max(1, memberNames.length),
      submittedAt: String(row[0] || "")
    };
  });
}

function hasRegistrationId(sheet, registrationId) {
  const rowCount = sheet.getLastRow();
  if (rowCount < 2) return false;
  return sheet.getRange(2, 2, rowCount - 1, 1).getValues().flat().some(id => String(id) === String(registrationId));
}

function deleteSelectedTestRows() {
  const sheet = getRegistrationsSheet();
  const range = sheet.getActiveRange();
  if (!range || range.getRow() < 2) {
    SpreadsheetApp.getUi().alert("Select one or more registration rows below the header first.");
    return;
  }
  const startRow = Math.max(2, range.getRow());
  const rowCount = Math.min(range.getNumRows(), sheet.getLastRow() - startRow + 1);
  const rows = sheet.getRange(startRow, 1, rowCount, HEADERS.length).getDisplayValues();
  const nonTestRows = rows.filter(row => !isTestRegistrationRow(row));
  if (nonTestRows.length > 0) {
    SpreadsheetApp.getUi().alert("Nothing deleted. Select only rows explicitly marked test, verification, integration, or delete after check.");
    return;
  }
  for (let row = startRow + rowCount - 1; row >= startRow; row -= 1) sheet.deleteRow(row);
  SpreadsheetApp.getUi().alert(rowCount + " test registration row(s) deleted.");
}

function isTestRegistrationRow(row) {
  return /test|verification|integration|delete after check/i.test([row[1], row[3], row[10]].join(" "));
}

function asPlainText(value) {
  const text = String(value || "");
  return text ? "'" + text : "";
}

function getRegistrationsSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#ffcd2e").setFontColor("#200b0d").setWrap(true);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).createFilter();
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}
```

The script uses `doPost(e)` because Apps Script routes HTTP POST requests to that function, with the request body supplied via the event object. The `doGet(e)` method provides the live row count and a deliberately limited organizer roster that excludes names, email addresses, phone numbers, school names, and project descriptions. A deployable web app must return an `HtmlOutput` or `TextOutput`; this implementation returns JSON or the privacy-safe response via `ContentService`. [1] [2]

## 2. Deploy the Web App

From the Apps Script editor, open **Deploy → New deployment**, select **Web app**, and complete the deployment form. Set **Execute as** to **Me** so the script can write to the organizer-owned spreadsheet. Set **Who has access** to **Anyone** so the public registration website can send each completed form to the sheet without asking participants to sign in. Then authorize the requested Google permissions and select **Deploy**. Google’s official deployment workflow is **Deploy → New deployment → Web app → Deploy**. [1]

Copy the resulting deployment URL. It ends with **`/exec`**. For a production integration, use a versioned deployment rather than a head deployment; Google describes head deployments as test-only and advises versioned deployments for public use. [2]

## Structured Sheet Columns

Each new registration is a single row. The first columns contain the timestamp, registration ID, **Group / Individual**, team name, leader details, school, battle track, project title, and project description. The remaining columns are grouped as four separate fields for **Member 2**, **Member 3**, **Member 4**, and **Member 5**: name, class/grade, email, and phone number. Empty member slots remain blank, so the organizer can filter, sort, and read every contact cleanly without parsing combined text. The `asPlainText` helper stores all phone values as text so values beginning with a `+` country code cannot be interpreted as spreadsheet formulas.

## 3. Connect GitHub Pages to the Script

The deployed URL is stored in `client/src/lib/googleAppsScript.ts` as `GOOGLE_APPS_SCRIPT_URL`. If Google issues a new `/exec` URL, replace that constant, rebuild the Pages website, and publish the change to the organization GitHub Pages repository. The public page submits directly to the endpoint and displays an in-page success message; it does not redirect students away from Hackfinity.

## 4. Verify the Connection

Submit one controlled registration from the GitHub Pages public site. Confirm the in-page success message appears, then refresh the spreadsheet and confirm a new row appears. The squad counter should refresh to the Sheet row count. If the count does not update, verify that the deployed script includes `doGet(e)` and that the deployment URL ends in `/exec`. Do not add registration names, email addresses, phone numbers, or other private data to the public count response.

When the Apps Script code changes, create a new version and update the existing deployment through **Deploy → Manage deployments**; Google notes that this updates the published code while maintaining the deployment URL. [2]

## 5. Mobile Roster and Safe Test-Row Cleanup Update

Use the latest code above before deploying a new Apps Script version. The public organizer panel uses the `registrations` read-only response and now retains its last confirmed roster while a phone reconnects. After the script update, opening the organizer panel on a mobile device will continue to show the saved public roster while the current roster refreshes.

For deletion, the public organizer panel only helps you identify **explicitly marked test records** and copy their registration IDs. It intentionally cannot delete data: a public GitHub Pages page has no secure identity check for a destructive Google Sheets action. Instead, the new `onOpen()` function creates a **Hackfinity cleanup** menu inside the protected Google Sheet. Select only old test rows, then choose **Hackfinity cleanup → Delete selected test rows**. The script checks the selected rows for `test`, `verification`, `integration`, or `delete after check` in the registration ID, team name, or project title; it refuses to delete any row without one of those markers.

| Step | Link or action |
|---|---|
| Open the current setup guide | https://github.com/St-John-s-Hackfinity-2026/hackfinity-26-website-source/blob/main/GOOGLE_SHEETS_SETUP.md |
| Open Apps Script | https://script.google.com/ |
| Open the protected Hackfinity Registration Sheet | https://docs.google.com/spreadsheets/d/1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0/edit |
| Deploy the updated code | **Deploy → Manage deployments → Edit → New version → Deploy**. Keep **Execute as: Me** and **Who has access: Anyone**. |
| Test the roster | Open `https://st-john-s-hackfinity-2026.github.io/hackfinity-26-pages-preview/?view=organizer` on a phone, wait for the first refresh, then reload once to confirm the saved roster appears immediately. |

## References

[1] [Google Apps Script — Web Apps](https://developers.google.com/apps-script/guides/web)

[2] [Google Apps Script — Content Service](https://developers.google.com/apps-script/guides/content)
