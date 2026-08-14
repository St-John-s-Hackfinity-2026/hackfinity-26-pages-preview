import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Google Apps Script templates", () => {
  it("stores leader and member phone values as explicit plain text", () => {
    const dashboardTemplate = readFileSync(new URL("../client/src/pages/OrganizerDashboard.tsx", import.meta.url), "utf8");
    const setupGuide = readFileSync(new URL("../GOOGLE_SHEETS_SETUP.md", import.meta.url), "utf8");

    for (const source of [dashboardTemplate, setupGuide]) {
      expect(source).toContain("function asPlainText(value)");
      expect(source).toContain("asPlainText(r.phone)");
      expect(source).toContain("asPlainText(member.phone)");
    }
  });

  it("keeps the public organizer roster free of contact and school fields", () => {
    const dashboardTemplate = readFileSync(new URL("../client/src/pages/OrganizerDashboard.tsx", import.meta.url), "utf8");
    const setupGuide = readFileSync(new URL("../GOOGLE_SHEETS_SETUP.md", import.meta.url), "utf8");

    for (const source of [dashboardTemplate, setupGuide]) {
      expect(source).toContain("function getPublicRegistrations(sheet)");
      expect(source).toContain("action === \"registrations\"");
      expect(source).not.toContain("leaderName: String(row[4])");
      expect(source).not.toContain("email: String(row[7])");
      expect(source).not.toContain("phone: String(row[8])");
    }
  });
});
