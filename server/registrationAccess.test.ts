import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createRegularUserContext(): TrpcContext {
  return {
    user: {
      id: 9,
      openId: "regular-hunter",
      name: "Regular Hunter",
      email: "hunter@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("registrations.list access", () => {
  it("rejects a signed-in non-organizer before exposing registration records", async () => {
    const caller = appRouter.createCaller(createRegularUserContext());
    await expect(caller.registrations.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
