import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homePage = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("public live-counter resilience", () => {
  it("keeps a confirmed Apps Script count visible while a refresh is loading or briefly reconnecting", () => {
    expect(homePage).toContain('const LIVE_COUNT_CACHE_KEY = "hackfinity-public-squad-count"');
    expect(homePage).toContain("window.localStorage.getItem(LIVE_COUNT_CACHE_KEY)");
    expect(homePage).toContain("window.localStorage.setItem(LIVE_COUNT_CACHE_KEY, String(count))");
    expect(homePage).toContain("isLoading ? \"Refreshing live count\"");
    expect(homePage).toContain("isError && !hasCount");
  });
});
