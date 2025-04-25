import { sql, } from "drizzle-orm";
import { pgTable, numeric, uniqueIndex, index, } from "drizzle-orm/pg-core";
import { lower } from "./utils";

export const user = pgTable(
  "user",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    name: t.varchar({ length: 255 }),
    email: t.varchar({ length: 255 }).notNull(),
    emailVerified: t.timestamp({ mode: "date", withTimezone: true }),
    image: t.varchar({ length: 255 }),
  }),
  (t) => [
    uniqueIndex("user_email_idx").on(lower(t.email))
  ]
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const project = pgTable(
  "project",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    userId: t.uuid().notNull().references(() => user.id, { onDelete: "cascade" }),
    name: t.varchar({ length: 255 }).notNull(),
    description: t.text(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
  }),
  (t) => [
    index("project_user_id_created_at_idx").on(t.userId, t.createdAt)
  ]
);

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;

export const budget = pgTable(
  "budget",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    projectId: t.uuid().notNull().references(() => project.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    startDate: t.timestamp().notNull(),
    endDate: t.timestamp(),
    name: t.varchar({ length: 255 }).notNull(),
    description: t.text(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
  }),
  (t) => [
    index("budget_project_id_start_date_idx").on(t.projectId, t.startDate)
  ]
);

export type Budget = typeof budget.$inferSelect;
export type NewBudget = typeof budget.$inferInsert;

export const transaction = pgTable(
  "transaction",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    projectId: t.uuid().notNull().references(() => project.id, { onDelete: "cascade" }),
    type: t.varchar({ length: 20 }).$type<"INCOMING" | "OUTGOING">().notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    description: t.text(),
    date: t.timestamp().notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
  }),
  (t) => [
    index("transaction_project_id_date_idx").on(t.projectId, t.date),
    index("transaction_project_id_type_idx").on(t.projectId, t.type)
  ]
);

export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;

export const account = pgTable(
  "account",
  (t) => ({
    userId: t
      .uuid()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .primaryKey(),
    type: t
      .varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: t.varchar({ length: 255 }).notNull(),
    provideraccountId: t.varchar({ length: 255 }).notNull(),
    refresh_token: t.varchar({ length: 255 }),
    access_token: t.text(),
    expires_at: t.integer(),
    token_type: t.varchar({ length: 255 }),
    scope: t.varchar({ length: 255 }),
    id_token: t.text(),
    session_state: t.varchar({ length: 255 }),
  }),
  (t) => [
    uniqueIndex("account_user_id_idx").on(t.userId)
  ],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const session = pgTable("session", (t) => ({
  sessionToken: t.varchar({ length: 255 }).notNull().primaryKey(),
  userId: t
    .uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
}),
  (t) => [
    uniqueIndex("session_user_id_idx").on(t.userId, t.sessionToken)
  ]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;