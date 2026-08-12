import { count, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertSquad, organizerSettings, squads, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

function requireDatabase<T>(database: T | null): T {
  if (!database) throw new Error("The registration database is currently unavailable.");
  return database;
}

export async function createSquad(values: InsertSquad) {
  const db = requireDatabase(await getDb());
  const result = await db.insert(squads).values(values);
  const id = Number(result[0].insertId);
  const [squad] = await db.select().from(squads).where(eq(squads.id, id)).limit(1);
  if (!squad) throw new Error("Registration could not be retrieved after saving.");
  return squad;
}

export async function getSquadCount() {
  const db = requireDatabase(await getDb());
  const [result] = await db.select({ total: count() }).from(squads);
  return Number(result?.total ?? 0);
}

export async function listSquads(search?: string) {
  const db = requireDatabase(await getDb());
  const query = search?.trim();
  const filter = query
    ? or(
        like(squads.teamName, `%${query}%`),
        like(squads.leaderName, `%${query}%`),
        like(squads.schoolName, `%${query}%`),
        like(squads.email, `%${query}%`),
        like(squads.projectTitle, `%${query}%`),
      )
    : undefined;

  return filter
    ? db.select().from(squads).where(filter).orderBy(desc(squads.createdAt))
    : db.select().from(squads).orderBy(desc(squads.createdAt));
}

export async function getGoogleSheetsWebhookUrl() {
  const db = requireDatabase(await getDb());
  const [settings] = await db
    .select({ googleSheetsWebhookUrl: organizerSettings.googleSheetsWebhookUrl })
    .from(organizerSettings)
    .where(eq(organizerSettings.id, 1))
    .limit(1);
  return settings?.googleSheetsWebhookUrl ?? null;
}

export async function setGoogleSheetsWebhookUrl(googleSheetsWebhookUrl: string | null) {
  const db = requireDatabase(await getDb());
  await db
    .insert(organizerSettings)
    .values({ id: 1, googleSheetsWebhookUrl })
    .onDuplicateKeyUpdate({
      set: { googleSheetsWebhookUrl, updatedAt: new Date() },
    });
}

export async function updateSheetSyncStatus(
  id: number,
  status: "not_configured" | "pending" | "synced" | "failed",
) {
  const db = requireDatabase(await getDb());
  await db.update(squads).set({ sheetSyncStatus: status }).where(eq(squads.id, id));
}

export async function syncSquadToGoogleSheets(squad: Awaited<ReturnType<typeof createSquad>>) {
  const webhookUrl = await getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return { status: "not_configured" as const };

  await updateSheetSyncStatus(squad.id, "pending");
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "squad.registered",
        registration: {
          id: squad.id,
          participationType: squad.participationType,
          teamName: squad.teamName,
          leaderName: squad.leaderName,
          leaderClass: squad.leaderClass,
          schoolName: squad.schoolName,
          email: squad.email,
          phone: squad.phone,
          projectCategory: squad.projectCategory,
          projectTitle: squad.projectTitle,
          projectDescription: squad.projectDescription,
          members: squad.members,
          createdAt: squad.createdAt.toISOString(),
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) throw new Error(`Webhook responded with HTTP ${response.status}.`);
    await updateSheetSyncStatus(squad.id, "synced");
    return { status: "synced" as const };
  } catch (error) {
    console.error("[Google Sheets] Registration sync failed:", error);
    await updateSheetSyncStatus(squad.id, "failed");
    return { status: "failed" as const };
  }
}
