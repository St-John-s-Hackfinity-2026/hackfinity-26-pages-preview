import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homePage = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const timelineStyles = readFileSync(new URL("../client/src/pages/MissionTimeline.css", import.meta.url), "utf8");
const prizeStyles = readFileSync(new URL("../client/src/pages/ReferenceSections.css", import.meta.url), "utf8");

describe("reversible public-page motion", () => {
  it("uses scroll-linked countdown opacity rather than a permanent hidden state", () => {
    expect(homePage).toContain("const countdownOpacity = useTransform(scrollY, [0, 210, 560], [1, 0.68, 0])");
    expect(homePage).toContain("className=\"countdown-scroll-fade\"");
  });

  it("does not persist an active timeline-card state after the card leaves view", () => {
    expect(homePage).not.toContain("litTimelineSteps");
    expect(homePage).not.toContain("onViewportEnter={() => setLitTimelineSteps");
    expect(timelineStyles).toContain(".timeline-command-entry:hover::before");
    expect(timelineStyles).not.toContain(".timeline-command-entry.active");
  });

  it("keeps prize-card movement hover-only and disables sticky touch hover treatment", () => {
    expect(prizeStyles).not.toContain(".scroll-down .reference-prize-card.champion");
    expect(prizeStyles).not.toContain(".scroll-up .reference-prize-card.champion");
    expect(prizeStyles).toContain("@media (hover: none), (pointer: coarse)");
  });
});
