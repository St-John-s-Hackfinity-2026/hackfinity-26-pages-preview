# GitHub Pages and Google Sheets Registration Status

## 14 August 2026 deployment

The organization GitHub Pages workflow completed successfully for commit `ab2a343` (`Submit GitHub Pages registrations to Google Sheets`). The public site now keeps the registration form on the Hackfinity page and shows a **Submit registration** button instead of redirecting students to another website.

The public counter remains in its loading state until the Google Apps Script deployment is updated with the new `doGet(e)` count handler documented in `GOOGLE_SHEETS_SETUP.md`. The existing Apps Script URL is configured in `client/src/lib/googleAppsScript.ts`; the organizer must paste the updated script code into the associated Apps Script project and redeploy the existing Web app before the public live count can be verified.

The shared browser remains signed out at the Google Apps Script page, so the script editor cannot yet be inspected or changed from this session. The organizer must complete Google sign-in in the same browser session and open the project linked to the Hackfinity Registration spreadsheet before the script update can be applied.

## New endpoint check

On 14 August 2026, the organizer supplied a new `/exec` URL. A direct count request to that endpoint timed out with no response through the command-line check, and the browser navigation did not yield a usable JSON response. The GitHub Pages client should not be republished with this endpoint until the Apps Script web app returns the documented `doGet(e)` count response reliably.

The endpoint was subsequently verified using the same browser JSONP callback method as the public website. It returned the non-sensitive payload `{ "ok": true, "count": 2 }`. The organization Pages deployment for commit `12b47e0` was then published successfully with this school Apps Script endpoint.

The published GitHub Pages website was then checked with a cache-busting release URL and displayed **02 Squads registered** while retaining the on-page **Submit registration** form. A controlled registration should be submitted only after organizer confirmation, so the new public submission row can be reviewed in the Google Sheet without polluting the organizer records unexpectedly.

The first approved controlled submission exposed a delayed Apps Script response that left the page in its transmitting state and did not increase the public count. The public form was corrected to present its confirmation after a short response window while the duplicate-safe request remains in flight. The Pages deployment for commit `7db9cf7` completed successfully; immediately before the retry, the published count still displayed **02**, confirming the first attempt had not been recorded.

The approved retry completed successfully on the public GitHub Pages form. The page showed **Registration Successful**, reset the form controls, and updated the counter from **02** to **03**. Because the public counter is calculated from the registration Sheet, the observed change confirms that the controlled row was written to the connected organizer Sheet. The test row is labelled `SYSTEM TEST — DELETE AFTER REVIEW` and should be removed by the organizer after review.

The organizer’s direct Sheet review confirmed the controlled row and identified a `#ERROR!` in the phone-number cell because the test value began with `+91`. The maintained Apps Script templates now prefix phone values with an invisible Sheets text marker so future international numbers are stored as text rather than evaluated as formulas. The organizer must paste the updated script template and redeploy the web app before relying on this formatting safeguard.

The organization Pages workflow for commit `3a44ff8` (`Store Apps Script phone values as plain text`) completed successfully. This publication updates the maintained setup instructions and static organizer template; it does not change the active Google Apps Script deployment until the organizer manually pastes and redeploys the revised script.

The organizer deployed Apps Script Version 2 successfully on 14 August 2026. The public GitHub Pages website was then rechecked and continued to load the live count, displaying **05 squads registered**. A separate approved test registration with a `+91` phone value is still required to confirm the new plain-text safeguard in the Google Sheet.

The approved `+91` controlled test was submitted successfully through the same GitHub Pages form. The public form showed **Registration Successful** and the counter advanced from **05** to **06**. The new Sheet row is labelled `SYSTEM TEST — PHONE TEXT FIX`; direct organizer confirmation that the phone cell displays `+91 98765 43210` without `#ERROR!` is still required before the formatting fix can be closed.

The organizer confirmed that the `SYSTEM TEST — PHONE TEXT FIX` row stores `+91 98765 43210` as normal text with no `#ERROR!`. This directly verifies the structured Sheet row and the Version 2 phone-number safeguard. The two clearly labelled system-test rows may now be deleted by the organizer; the live counter will decrease accordingly after the next public count refresh.

The public GitHub Pages organizer command center is available through the static-compatible query URL `?view=organizer`. Direct `/organizer` navigation remains unsuitable for GitHub Pages because it returns a host-level 404 before the client application loads. The new command center matches the dark cyberpunk operational layout, loads the non-sensitive public count, and links authorized staff to the protected Google Sheet, Apps Script, and public website without exposing student records on the static site.
