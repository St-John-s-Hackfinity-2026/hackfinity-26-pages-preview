import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalStyles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");
const timelineStyles = readFileSync(new URL("../client/src/pages/MissionTimeline.css", import.meta.url), "utf8");

describe("St. John's timeline activation treatment", () => {
  it("uses the school palette for every coarse-pointer active timeline rule", () => {
    expect(globalStyles).toContain("rgba(201, 29, 53, .5)");
    expect(globalStyles).toContain("#ffcf2e");
    expect(globalStyles).not.toContain("rgba(9, 224, 237, .38)");
    expect(globalStyles).not.toContain("#42f5fb");
  });

  it("keeps the activation layer behind all content and makes large stage numerals render safely", () => {
    expect(timelineStyles).toContain(".timeline-command-entry::before { position: absolute; z-index: 0;");
    expect(timelineStyles).toContain(".timeline-command-entry > b { position: relative; z-index: 1;");
    expect(timelineStyles).toContain("font-variant-numeric: tabular-nums");
    expect(timelineStyles).toContain("white-space: nowrap");
    expect(timelineStyles).toContain("overflow: visible");
    expect(timelineStyles).toContain(".timeline-command-entry > b { position: absolute; top: 27px; right: 0;");
  });

  it("gives both desktop hover and mobile in-view cards a complete yellow outline numeral", () => {
    expect(timelineStyles).toContain(".timeline-command-entry:hover > b, .timeline-command-entry:focus-within > b");
    expect(timelineStyles).toContain(".timeline-command-entry.is-mobile-active > b");
    expect(timelineStyles).toContain("rgba(255, 207, 46, .8)");
  });
});
