import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SquadMember = {
  name: string;
  grade: string;
  email: string;
  phone: string;
};

export const squads = mysqlTable("squads", {
  id: int("id").autoincrement().primaryKey(),
  participationType: mysqlEnum("participationType", ["individual", "group"]).notNull(),
  teamName: varchar("teamName", { length: 120 }).notNull(),
  leaderName: varchar("leaderName", { length: 120 }).notNull(),
  leaderClass: varchar("leaderClass", { length: 80 }).notNull(),
  schoolName: varchar("schoolName", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  projectCategory: varchar("projectCategory", { length: 120 }).notNull(),
  projectTitle: varchar("projectTitle", { length: 180 }).notNull(),
  projectDescription: text("projectDescription").notNull(),
  members: json("members").$type<SquadMember[]>().notNull(),
  sheetSyncStatus: mysqlEnum("sheetSyncStatus", ["not_configured", "pending", "synced", "failed"])
    .default("not_configured")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const organizerSettings = mysqlTable("organizerSettings", {
  id: int("id").primaryKey(),
  googleSheetsWebhookUrl: text("googleSheetsWebhookUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Squad = typeof squads.$inferSelect;
export type InsertSquad = typeof squads.$inferInsert;
