import { describe, expect, it } from "vitest";
import { isValidAppsScriptWebhookUrl, squadRegistrationSchema } from "./registrationSchema";

const baseRegistration = {
  participationType: "group" as const,
  teamName: "Neon Sentinels",
  leaderName: "Arun Kumar",
  leaderClass: "Class 11",
  schoolName: "St. John's School",
  email: "arun@example.com",
  phone: "+91 98765 43210",
  projectCategory: "AI & Detection",
  projectTitle: "Signal Flare",
  projectDescription: "A student-led prototype that helps schools identify and respond to early warning signals safely.",
  members: [{ name: "Maya Singh", grade: "Class 11", email: "maya@example.com", phone: "+91 98765 43211" }],
};

describe("squad registration validation", () => {
  it("accepts a valid group registration", () => {
    expect(squadRegistrationSchema.safeParse(baseRegistration).success).toBe(true);
  });

  it("accepts the Class 1 through Class 12 selector value format", () => {
    expect(squadRegistrationSchema.safeParse({ ...baseRegistration, leaderClass: "Class 12" }).success).toBe(true);
  });

  it("requires an additional member for group registrations", () => {
    expect(squadRegistrationSchema.safeParse({ ...baseRegistration, members: [] }).success).toBe(false);
  });

  it("rejects extra members for individual registrations", () => {
    expect(
      squadRegistrationSchema.safeParse({ ...baseRegistration, participationType: "individual", members: baseRegistration.members }).success,
    ).toBe(false);
  });

  it("requires a valid email and contact number for every additional member", () => {
    expect(
      squadRegistrationSchema.safeParse({
        ...baseRegistration,
        members: [{ name: "Maya Singh", grade: "Grade 11", email: "invalid", phone: "" }],
      }).success,
    ).toBe(false);
  });
});

describe("Google Apps Script webhook validation", () => {
  it("accepts a deployed Apps Script HTTPS URL", () => {
    expect(isValidAppsScriptWebhookUrl("https://script.google.com/macros/s/example/exec")).toBe(true);
  });

  it("rejects a non-Apps Script endpoint", () => {
    expect(isValidAppsScriptWebhookUrl("https://example.com/hook")).toBe(false);
  });
});
