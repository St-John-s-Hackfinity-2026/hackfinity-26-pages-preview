import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAppsScriptCountUrl, submitAppsScriptRegistration } from "../client/src/lib/googleAppsScript";

describe("Google Apps Script static helper", () => {
  it("adds the read-only count action and callback to the deployed web-app URL", () => {
    const url = new URL(buildAppsScriptCountUrl("https://script.google.com/macros/s/example/exec", "hackfinityCountTest"));
    expect(url.searchParams.get("action")).toBe("count");
    expect(url.searchParams.get("callback")).toBe("hackfinityCountTest");
  });

  afterEach(() => vi.unstubAllGlobals());

  it("continues the same-page confirmation after the short Apps Script response window", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    await expect(submitAppsScriptRegistration({
      id: "GH-control-test",
      createdAt: "2026-08-14T00:00:00.000Z",
      participationType: "individual",
      teamName: "Controlled test",
      leaderName: "Test organizer",
      leaderClass: "Class 12",
      schoolName: "St. John's School",
      email: "test@example.invalid",
      phone: "0000000000",
      projectCategory: "Awareness Challenge",
      projectTitle: "Test project",
      projectDescription: "Controlled public registration test.",
      members: [],
    }, "https://script.google.com/macros/s/example/exec", 1));
  });
});
