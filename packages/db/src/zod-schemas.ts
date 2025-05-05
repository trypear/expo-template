import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import {
  budgetGoal,
  category,
  monthlyBudget,
  transaction,
  TRANSACTION_TYPES,
  userPreferences,
} from "./schema";

const commonOmitFields = {
  id: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Category schemas
export const insertCategorySchema = createInsertSchema(category, {
  type: z.enum(TRANSACTION_TYPES),
}).omit(commonOmitFields);

export const selectCategorySchema = createSelectSchema(category);

// Transaction schemas
export const insertTransactionSchema =
  createInsertSchema(transaction).omit(commonOmitFields);

export const selectTransactionSchema = createSelectSchema(transaction);

export const transactionFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  categoryId: z.string().optional(),
  type: z.enum(TRANSACTION_TYPES).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

// Budget Goal schemas
export const insertBudgetGoalSchema =
  createInsertSchema(budgetGoal).omit(commonOmitFields);

export const selectBudgetGoalSchema = createSelectSchema(budgetGoal);

// Monthly Budget schemas
export const insertMonthlyBudgetSchema =
  createInsertSchema(monthlyBudget).omit(commonOmitFields);

export const selectMonthlyBudgetSchema = createSelectSchema(monthlyBudget);

// User Preferences schemas
export const insertUserPreferencesSchema =
  createInsertSchema(userPreferences).omit(commonOmitFields);

export const selectUserPreferencesSchema = createSelectSchema(userPreferences);

// Transaction stats schema
export const transactionStatsFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  groupBy: z.enum(["day", "week", "month", "category"]).default("month"),
});

// Budget progress schema
export const budgetProgressFilterSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().optional(),
  categoryId: z.string().optional(),
});
