import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages public and organizer experience", () => {
  const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
  const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
  const organizer = readFileSync(new URL("../client/src/pages/OrganizerDashboard.tsx", import.meta.url), "utf8");

  it("keeps the static organizer route available without exposing it in the public footer", () => {
    expect(app).toContain('get("view") === "organizer"');
    expect(home).not.toContain('href="?view=organizer"');
    expect(app).toContain("IS_STATIC_ORGANIZER_VIEW");
  });

  it("provides a full on-page success state after registration", () => {
    expect(home).toContain("RegistrationSuccessPanel");
    expect(home).toContain("Transmission confirmed");
    expect(home).toContain("You&apos;re on the map.");
    expect(home).toContain("Register another squad");
  });

  it("keeps the static organizer surface free of private registration rows", () => {
    expect(organizer).toContain("Protected registration records");
    expect(organizer).toContain("Open registrations");
    expect(organizer).toContain("loadAppsScriptSquadCount");
  });
});
