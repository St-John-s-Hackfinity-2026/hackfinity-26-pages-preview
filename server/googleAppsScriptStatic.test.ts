import { describe, expect, it } from "vitest";
import { buildAppsScriptCountUrl } from "../client/src/lib/googleAppsScript";

describe("Google Apps Script static helper", () => {
  it("adds the read-only count action and callback to the deployed web-app URL", () => {
    const url = new URL(buildAppsScriptCountUrl("https://script.google.com/macros/s/example/exec", "hackfinityCountTest"));
    expect(url.searchParams.get("action")).toBe("count");
    expect(url.searchParams.get("callback")).toBe("hackfinityCountTest");
  });
});
