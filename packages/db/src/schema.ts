import { sql, } from "drizzle-orm";
import { numeric, uniqueIndex, index, timestamp, varchar, text, integer, } from "drizzle-orm/pg-core";
import { createTable, fk, lower } from "./utils";

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
    userId: fk("userId", user),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
  },
  (t) => [
    index("project_user_id_created_at_idx").on(t.userId, t.createdAt)
  ]
);


export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;

export const budget = createTable(
  "budget",
  {
    projectId: fk("projectId", project, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    startDate: timestamp().notNull(),
    endDate: timestamp(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
  },
  (t) => [
    index("budget_project_id_start_date_idx").on(t.projectId, t.startDate)
  ]
);

export type Budget = typeof budget.$inferSelect;
export type NewBudget = typeof budget.$inferInsert;

export const transaction = createTable(
  "transaction",
  {
    projectId: fk("projectId", project),
    type: varchar({ length: 20 }).$type<"INCOMING" | "OUTGOING">().notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    description: text(),
    date: timestamp().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
  },
  (t) => [
    index("transaction_project_id_date_idx").on(t.projectId, t.date),
    index("transaction_project_id_type_idx").on(t.projectId, t.type)
  ]
);

export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;

export const account = createTable(
  "account",
  {
    userId: fk("userId", user, { onDelete: "cascade" }),
    type: varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar({ length: 255 }).notNull(),
    provideraccountId: varchar({ length: 255 }).notNull(),
    refresh_token: varchar({ length: 255 }),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  (t) => [
    uniqueIndex("account_user_id_idx").on(t.userId)
  ],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const session = createTable("session", {
  sessionToken: varchar({ length: 255 }).notNull().primaryKey(),
  userId: fk("userId", user, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
},
  (t) => [
    uniqueIndex("session_user_id_idx").on(t.userId, t.sessionToken)
  ]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;


