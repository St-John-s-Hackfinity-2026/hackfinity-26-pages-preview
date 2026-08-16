import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const organizer = readFileSync(new URL("../client/src/pages/OrganizerDashboard.tsx", import.meta.url), "utf8");
const setupGuide = readFileSync(new URL("../GOOGLE_SHEETS_SETUP.md", import.meta.url), "utf8");

describe("mobile organizer reliability and test cleanup", () => {
  it("keeps the last confirmed count and roster available while mobile Apps Script requests reconnect", () => {
    expect(organizer).toContain('const STATIC_COUNT_CACHE_KEY = "hackfinity-organizer-squad-count"');
    expect(organizer).toContain('const STATIC_ROSTER_CACHE_KEY = "hackfinity-organizer-public-roster"');
    expect(organizer).toContain("window.localStorage.setItem(STATIC_ROSTER_CACHE_KEY");
    expect(organizer).toContain("Showing the last saved roster while the live service reconnects.");
    expect(organizer).toContain("Retry live roster");
  });

  it("limits deletion assistance to marked test rows and preserves destructive authority in the protected Sheet", () => {
    expect(organizer).toContain("TEST_REGISTRATION_MARKERS");
    expect(organizer).toContain("public organizer page never receives permission to delete student data");
    expect(organizer).toContain('createMenu("Hackfinity cleanup")');
    expect(organizer).toContain("deleteSelectedTestRows");
    expect(setupGuide).toContain("Nothing deleted. Select only rows explicitly marked test");
    expect(setupGuide).toContain("Hackfinity cleanup → Delete selected test rows");
  });
});
