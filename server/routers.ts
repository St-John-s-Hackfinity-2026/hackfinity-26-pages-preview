import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createSquad,
  deleteSquad,
  getGoogleSheetsWebhookUrl,
  getSquadCount,
  listSquads,
  setGoogleSheetsWebhookUrl,
  syncSquadToGoogleSheets,
} from "./db";
import { googleSheetsWebhookSchema, squadRegistrationSchema } from "./registrationSchema";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  registrations: router({
    count: publicProcedure.query(() => getSquadCount()),
    create: publicProcedure.input(squadRegistrationSchema).mutation(async ({ input }) => {
      const squad = await createSquad({ ...input, sheetSyncStatus: "not_configured" });
      const sync = await syncSquadToGoogleSheets(squad);
      return { id: squad.id, syncStatus: sync.status };
    }),
    list: adminProcedure
      .input(z.object({ search: z.string().trim().max(120).optional() }).optional())
      .query(({ input }) => listSquads(input?.search)),
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => ({ deleted: await deleteSquad(input.id) })),
  }),
  organizer: router({
    getSettings: adminProcedure.query(async () => ({
      googleSheetsWebhookUrl: await getGoogleSheetsWebhookUrl(),
    })),
    setGoogleSheetsWebhook: adminProcedure
      .input(z.object({ googleSheetsWebhookUrl: googleSheetsWebhookSchema }))
      .mutation(async ({ input }) => {
        await setGoogleSheetsWebhookUrl(input.googleSheetsWebhookUrl || null);
        return { googleSheetsWebhookUrl: input.googleSheetsWebhookUrl || null };
      }),
  }),
});

export type AppRouter = typeof appRouter;
