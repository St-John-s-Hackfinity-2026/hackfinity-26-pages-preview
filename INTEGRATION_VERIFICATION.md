# Integration Verification Record

## Google Sheets registration delivery

The organizer connected the live registration webhook to the **Hackfinity Registeration** spreadsheet at:

https://docs.google.com/spreadsheets/d/1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0/edit

The Apps Script created a `Registrations` tab with one separate column for every leader and Member 2–5 detail. A controlled test record named `TEST — DELETE AFTER CHECK` was synchronized successfully. The following mapping was visually checked in the sheet:

| Field group | Verified result |
|---|---|
| Leader and project columns | Date/time, registration ID, participation type, team, leader, class, school, email, phone, track, title, and description are present and populated. |
| Member 2 columns | Name, class, email, and phone are present and populated. |
| Members 3–5 columns | Dedicated columns are present and intentionally blank for the one-member controlled test squad. |

The website database recorded the website-created controlled test registration as `sheetSyncStatus = synced`.

### Exhaustive controlled-row audit

The controlled row was examined from the leader-side timestamp field through the final Member 5 phone field. The following data groups were confirmed in the `Registrations` tab:

| Columns | Content observed in the controlled row |
|---|---|
| A–L: leader and project | Timestamp, registration ID, Group / Individual, team, leader, class, school, leader email, leader phone, battle track, project title, and project description were populated. |
| M–P: Member 2 | Name, class, email, and phone were populated. |
| Q–T: Member 3 | Name, class, email, and phone were intentionally blank. |
| U–X: Member 4 | Name, class, email, and phone were intentionally blank. |
| Y–AB: Member 5 | Name, class, email, and phone were intentionally blank. |

This behavior is correct for a two-person group: the team leader occupies the leader columns and the one additional participant occupies Member 2. The controlled test record can be deleted from both the database and the `Registrations` tab when the organizer no longer needs it.

### Direct A2–AB2 audit result

The following values were directly read from the synchronized row through the Google Sheets cell navigator:

| Cell range | Direct result |
|---|---|
| A2–L2 | `8/13/2026 5:30:00`, `99999`, `Group`, `TEST — DELETE AFTER CHECK`, `Test Student`, `Class 10`, `Test School`, `test.student@example.com`, `9999999999`, `Awareness Challenge`, `Test Sheets Mapping`, and the controlled-test description. |
| M2–P2 | `Test Member Two`, `Class 9`, `test.member2@example.com`, `8888888888`. |
| Q2–T2 | All four cells were blank. |
| U2–X2 | All four cells were blank. |
| Y2–AB2 | All four cells were blank. |

## GitHub organization migration

The project is now linked to the organization-managed source repository:

https://github.com/St-John-s-Hackfinity-2026/hackfinity-26-website-source

The migrated GitHub Pages public website was opened and verified at:

https://st-john-s-hackfinity-2026.github.io/hackfinity-26-pages-preview/

GitHub Pages serves the public website interface. Real registrations and Google Sheets delivery are securely processed by the connected live event service.
