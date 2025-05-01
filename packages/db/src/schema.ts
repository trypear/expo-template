import { uniqueIndex, index, varchar, text, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
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

export const fact = createTable(
  "fact",
  {
    content: text().notNull(),
    category: varchar({ length: 100 }),
    createdBy: fk("createdBy", () => user),
    isActive: boolean().notNull().default(true),
  },
  (t) => [
    index("fact_category_idx").on(t.category),
    index("fact_created_by_idx").on(t.createdBy)
  ]
);

export type Fact = typeof fact.$inferSelect;
export type NewFact = typeof fact.$inferInsert;

export const factQueue = createTable(
  "factQueue",
  {
    factId: fk("factId", () => fact),
    scheduledDate: date().notNull(),
    isShown: boolean().notNull().default(false),
  },
  (t) => [
    index("fact_queue_scheduled_date_idx").on(t.scheduledDate),
    index("fact_queue_fact_id_idx").on(t.factId)
  ]
);

export type FactQueue = typeof factQueue.$inferSelect;
export type NewFactQueue = typeof factQueue.$inferInsert;
