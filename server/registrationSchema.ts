import { z } from "zod";

const textField = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `${label} is required.`).max(max, `${label} is too long.`);

export const squadRegistrationSchema = z
  .object({
    participationType: z.enum(["individual", "group"]),
    teamName: textField(2, 120, "Squad name"),
    leaderName: textField(2, 120, "Leader name"),
    leaderClass: textField(1, 80, "Leader grade"),
    schoolName: textField(2, 180, "School name"),
    email: z.string().trim().email("Provide a valid email address.").max(320),
    phone: textField(7, 32, "Phone number"),
    projectCategory: textField(2, 120, "Battle track"),
    projectTitle: textField(2, 180, "Project title"),
    projectDescription: textField(20, 8000, "Project description"),
    members: z
      .array(
        z.object({
          name: textField(2, 120, "Member name"),
          grade: textField(1, 80, "Member grade"),
        }),
      )
      .max(4, "A squad may have at most five people including its leader."),
  })
  .superRefine((value, context) => {
    if (value.participationType === "group" && value.members.length < 1) {
      context.addIssue({
        code: "custom",
        path: ["members"],
        message: "Add at least one squad member for a group registration.",
      });
    }
    if (value.participationType === "individual" && value.members.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["members"],
        message: "Individual registrations cannot include additional members.",
      });
    }
  });

export function isValidAppsScriptWebhookUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "script.google.com";
  } catch {
    return false;
  }
}

export const googleSheetsWebhookSchema = z
  .string()
  .trim()
  .max(2048, "The webhook URL is too long.")
  .refine(
    value => value.length === 0 || isValidAppsScriptWebhookUrl(value),
    "Provide a deployed Google Apps Script URL from script.google.com, or leave the field empty to disable sync.",
  );
