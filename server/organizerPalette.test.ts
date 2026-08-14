import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const organizerStyles = readFileSync(new URL("../client/src/pages/OrganizerDashboard.css", import.meta.url), "utf8");

describe("St. John's organizer palette", () => {
  it("applies red, yellow, and white to both organizer panel variants", () => {
    expect(organizerStyles).toContain("Complete St. John's organizer-panel palette");
    expect(organizerStyles).toContain("#0d0909");
    expect(organizerStyles).toContain("#ffcd2e");
    expect(organizerStyles).toContain("#fff8ed");
    expect(organizerStyles).toContain(".static-roster-open:hover");
    expect(organizerStyles).toContain(".registration-detail-dialog");
  });
});
