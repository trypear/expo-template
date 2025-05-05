import { relations } from "drizzle-orm";

import {
  account,
  budgetGoal,
  category,
  monthlyBudget,
  session,
  transaction,
  user,
  userPreferences,
} from "./schema";

export const userRelations = relations(user, ({ many, one }) => ({
  accounts: many(account),
  sessions: many(session),
  transactions: many(transaction),
  budgetGoals: many(budgetGoal),
  monthlyBudgets: many(monthlyBudget),
  preferences: one(userPreferences, {
    fields: [user.id],
    references: [userPreferences.userId],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  transactions: many(transaction),
  budgetGoals: many(budgetGoal),
  monthlyBudgets: many(monthlyBudget),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, { fields: [transaction.userId], references: [user.id] }),
  category: one(category, {
    fields: [transaction.categoryId],
    references: [category.id],
  }),
}));

export const budgetGoalRelations = relations(budgetGoal, ({ one }) => ({
  user: one(user, { fields: [budgetGoal.userId], references: [user.id] }),
  category: one(category, {
    fields: [budgetGoal.categoryId],
    references: [category.id],
  }),
}));

export const monthlyBudgetRelations = relations(monthlyBudget, ({ one }) => ({
  user: one(user, { fields: [monthlyBudget.userId], references: [user.id] }),
  category: one(category, {
    fields: [monthlyBudget.categoryId],
    references: [category.id],
  }),
}));

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
  }),
);
