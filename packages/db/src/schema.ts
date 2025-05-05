import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable, fk, lower } from "./utils";

// Edit the type to add user roles for RBAC
export const USER_ROLES = ["user", "admin"] as const;

// *****_____*****_____*****_____*****_____*****_____*****_____
// DO NOT REMOVE OR RENAME, ONLY ADD TO THESE TABLES IF REQUIRED
// NEXT AUTH IS DEPENDENT ON THESE HAVING THESE GIVEN COLUMNS
// MAKE ALL EXTRA FIELDS OPTIONAL - OR HAVE DEFAULTS
// *****_____*****_____*****_____*****_____*****_____*****_____

export const user = createTable(
  "user",
  {
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp({ mode: "date", withTimezone: true }),
    image: varchar({ length: 255 }),
    userRole: varchar({ enum: USER_ROLES }).default("user"),
  },
  (t) => [uniqueIndex("user_email_idx").on(lower(t.email))],
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const account = createTable(
  "account",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
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
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const session = createTable(
  "session",
  {
    sessionToken: varchar({ length: 255 }).notNull(),
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
  },
  (t) => [index("session_token_idx").on(t.sessionToken)],
);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
// *****_____*****_____*****_____*****_____*****_____*****_____

// Budget App Schema

export const TRANSACTION_TYPES = ["income", "expense", "savings"] as const;

export const category = createTable(
  "category",
  {
    name: varchar({ length: 100 }).notNull(),
    type: varchar({ enum: TRANSACTION_TYPES }).notNull(),
    icon: varchar({ length: 50 }).notNull(),
    color: varchar({ length: 7 }).notNull(), // Hex color code
  },
  (t) => [index("category_type_idx").on(t.type)],
);

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

export const transaction = createTable(
  "transaction",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    categoryId: fk("category_id", () => category, {
      onDelete: "restrict",
    }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    description: text(),
    date: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("transaction_user_id_idx").on(t.userId),
    index("transaction_category_id_idx").on(t.categoryId),
    index("transaction_date_idx").on(t.date),
  ],
);

export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;

export const budgetGoal = createTable(
  "budget_goal",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    categoryId: fk("category_id", () => category, {
      onDelete: "cascade",
    }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    period: varchar({ enum: ["monthly", "yearly"] }).notNull(),
  },
  (t) => [
    index("budget_goal_user_id_idx").on(t.userId),
    index("budget_goal_category_id_idx").on(t.categoryId),
    uniqueIndex("budget_goal_user_category_period_idx").on(
      t.userId,
      t.categoryId,
      t.period,
    ),
  ],
);

export type BudgetGoal = typeof budgetGoal.$inferSelect;
export type NewBudgetGoal = typeof budgetGoal.$inferInsert;

export const monthlyBudget = createTable(
  "monthly_budget",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    categoryId: fk("category_id", () => category, {
      onDelete: "cascade",
    }).notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    month: integer().notNull(),
    year: integer().notNull(),
  },
  (t) => [
    index("monthly_budget_user_id_idx").on(t.userId),
    index("monthly_budget_category_id_idx").on(t.categoryId),
    uniqueIndex("monthly_budget_user_category_month_year_idx").on(
      t.userId,
      t.categoryId,
      t.month,
      t.year,
    ),
  ],
);

export type MonthlyBudget = typeof monthlyBudget.$inferSelect;
export type NewMonthlyBudget = typeof monthlyBudget.$inferInsert;

export const userPreferences = createTable(
  "user_preferences",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    defaultCurrency: varchar({ length: 3 }).notNull().default("USD"),
    monthStartDay: integer().notNull().default(1),
  },
  (t) => [uniqueIndex("user_preferences_user_id_idx").on(t.userId)],
);

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
