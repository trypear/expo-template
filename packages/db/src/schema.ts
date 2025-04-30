import { sql, } from "drizzle-orm";
import { numeric, uniqueIndex, index, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createTable, fk, lower } from "./utils";
import { z } from "zod";

export const user = createTable(
  "user",
  {
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp({ mode: "date", withTimezone: true }),
    image: varchar({ length: 255 }),
  },
  (t) => [
    uniqueIndex("user_email_idx").on(lower(t.email))
  ]
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const project = createTable(
  "project",
  {
    userId: fk("userId", () => user, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    budget: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    startDate: timestamp().notNull().defaultNow(),
    endDate: timestamp(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
  },
  (t) => [
    index("project_user_id_created_at_idx").on(t.userId, t.createdAt)
  ]
);

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;

export const transactionType = z.enum(["INCOMING", "OUTGOING"]);

export const transaction = createTable(
  "transaction",
  {
    projectId: fk("projectId", () => project, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    description: text(),
    date: timestamp().notNull().defaultNow(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
  },
  (t) => [
    index("transaction_project_id_date_idx").on(t.projectId, t.date),
  ]
);

export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;

export const account = createTable(
  "account",
  {
    userId: fk("userId", () => user, { onDelete: "cascade" }),
    type: varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: varchar({ length: 255 }),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  (t) => [
    index("account_user_id_idx").on(t.userId)
  ],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const session = createTable("session", {
  sessionToken: varchar({ length: 255 }).notNull(),
  userId: fk("userId", () => user, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
},
  (t) => [
    index("session_token_idx").on(t.sessionToken)
  ]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
