import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import {
  budgetGoal,
  budgetProgressFilterSchema,
  category,
  insertBudgetGoalSchema,
  insertCategorySchema,
  insertTransactionSchema,
  insertUserPreferencesSchema,
  monthlyBudget,
  transaction,
  TRANSACTION_TYPES,
  transactionFilterSchema,
  transactionStatsFilterSchema,
  userPreferences,
} from "@acme/db";
import { assert, parseFirstEl } from "@acme/utils";

import { protectedProcedure } from "../trpc";

export const budgetRouter = {
  // Category endpoints
  createCategory: protectedProcedure
    .input(insertCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(category)
        .values({
          ...input,
        })
        .returning();

      return parseFirstEl(result);
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: insertCategorySchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the category exists
      const existingCategory = await ctx.db.query.category.findFirst({
        where: eq(category.id, input.id),
      });

      assert(!!existingCategory, "Category not found");

      const result = await ctx.db
        .update(category)
        .set({
          ...input.data,
        })
        .where(eq(category.id, input.id))
        .returning();

      return parseFirstEl(result);
    }),

  deleteCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the category exists
      const existingCategory = await ctx.db.query.category.findFirst({
        where: eq(category.id, input.id),
      });

      assert(!!existingCategory, "Category not found");

      // Check if there are any transactions using this category
      const transactionCount = await ctx.db
        .select({
          count: count(),
        })
        .from(transaction)
        .where(eq(transaction.categoryId, input.id))
        .then(parseFirstEl);

      assert(
        transactionCount.count === 0,
        "Cannot delete category with associated transactions",
      );

      await ctx.db.delete(category).where(eq(category.id, input.id));

      return { success: true };
    }),

  getCategories: protectedProcedure
    .input(
      z
        .object({
          type: z.enum(TRANSACTION_TYPES).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (input?.type) {
        return ctx.db.query.category.findMany({
          where: eq(category.type, input.type),
          orderBy: category.name,
        });
      }

      return ctx.db.query.category.findMany({
        orderBy: category.name,
      });
    }),

  // Transaction endpoints
  createTransaction: protectedProcedure
    .input(insertTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(transaction)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning();

      return parseFirstEl(result);
    }),

  updateTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: insertTransactionSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the transaction exists and belongs to the user
      const existingTransaction = await ctx.db.query.transaction.findFirst({
        where: and(
          eq(transaction.id, input.id),
          eq(transaction.userId, ctx.session.user.id),
        ),
      });

      assert(!!existingTransaction, "Transaction not found or access denied");

      const result = await ctx.db
        .update(transaction)
        .set({
          ...input.data,
        })
        .where(
          and(
            eq(transaction.id, input.id),
            eq(transaction.userId, ctx.session.user.id),
          ),
        )
        .returning();

      return parseFirstEl(result);
    }),

  deleteTransaction: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the transaction exists and belongs to the user
      const existingTransaction = await ctx.db.query.transaction.findFirst({
        where: and(
          eq(transaction.id, input.id),
          eq(transaction.userId, ctx.session.user.id),
        ),
      });

      assert(!!existingTransaction, "Transaction not found or access denied");

      await ctx.db
        .delete(transaction)
        .where(
          and(
            eq(transaction.id, input.id),
            eq(transaction.userId, ctx.session.user.id),
          ),
        );

      return { success: true };
    }),

  getTransactions: protectedProcedure
    .input(transactionFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const conditions = [eq(transaction.userId, ctx.session.user.id)];

      if (input?.startDate) {
        conditions.push(gte(transaction.date, input.startDate));
      }

      if (input?.endDate) {
        conditions.push(lte(transaction.date, input.endDate));
      }

      if (input?.categoryId) {
        conditions.push(eq(transaction.categoryId, input.categoryId));
      }

      if (input?.type) {
        // First get all transactions with their categories
        const transactions = await ctx.db
          .select({
            transaction: transaction,
            category: category,
          })
          .from(transaction)
          .innerJoin(category, eq(transaction.categoryId, category.id))
          .where(and(...conditions))
          .orderBy(desc(transaction.date));

        // Then filter by category type
        return transactions
          .filter((t) => t.category.type === input.type)
          .map((t) => ({
            ...t.transaction,
            category: t.category,
          }));
      }

      // Use direct select with join instead of query builder
      const results = await ctx.db
        .select({
          transaction: transaction,
          category: category,
        })
        .from(transaction)
        .innerJoin(category, eq(transaction.categoryId, category.id))
        .where(and(...conditions))
        .orderBy(desc(transaction.date));

      // Transform results to match expected format
      return results.map((r) => ({
        ...r.transaction,
        category: r.category,
      }));
    }),

  getTransactionStats: protectedProcedure
    .input(transactionStatsFilterSchema)
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, groupBy } = input;

      if (groupBy === "category") {
        // For category grouping, we'll continue using Drizzle's query builder
        // as it works correctly for this case
        const stats = await ctx.db
          .select({
            categoryId: transaction.categoryId,
            categoryName: category.name,
            categoryType: category.type,
            total: sql<number>`sum(${transaction.amount})`,
            count: count(),
          })
          .from(transaction)
          .innerJoin(category, eq(transaction.categoryId, category.id))
          .where(and(
            eq(transaction.userId, ctx.session.user.id),
            startDate ? gte(transaction.date, startDate) : undefined,
            endDate ? lte(transaction.date, endDate) : undefined,
          ))
          .groupBy(transaction.categoryId, category.name, category.type);

        return stats;
      } else {
        // For time-based grouping, use raw SQL to avoid PostgreSQL errors

        // Determine date format based on grouping
        let dateFormat: string;
        switch (groupBy) {
          case "day":
            dateFormat = "YYYY-MM-DD";
            break;
          case "week":
            dateFormat = "YYYY-WW";
            break;
          case "month":
          default:
            dateFormat = "YYYY-MM";
            break;
        }

        // Extract UUID from user ID if it has a prefix
        const userId = ctx.session.user.id.startsWith("user_")
          ? ctx.session.user.id.replace(/^user_id_/, "")
          : ctx.session.user.id;

        // Build the raw SQL query with proper parameterization
        const result = await ctx.db.execute(sql`
          SELECT
            to_char(t.date, ${dateFormat}) as period,
            SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as income,
            SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as expense,
            SUM(CASE WHEN c.type = 'savings' THEN t.amount ELSE 0 END) as savings
          FROM "transaction" t
          JOIN "category" c ON t.category_id = c.id
          WHERE
            t.user_id = ${userId}
            ${startDate ? sql` AND t.date >= ${startDate}` : sql``}
            ${endDate ? sql` AND t.date <= ${endDate}` : sql``}
          GROUP BY period
          ORDER BY period
        `);

        // Transform the raw results to match the expected format
        return result.rows.map(row => ({
          period: row.period,
          income: Number(row.income) || 0,
          expense: Number(row.expense) || 0,
          savings: Number(row.savings) || 0
        }));
      }
    }),

  // Budget endpoints
  createBudget: protectedProcedure
    .input(insertBudgetGoalSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(budgetGoal)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning();

      return parseFirstEl(result);
    }),

  updateBudget: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: insertBudgetGoalSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the budget exists and belongs to the user
      const existingBudget = await ctx.db.query.budgetGoal.findFirst({
        where: and(
          eq(budgetGoal.id, input.id),
          eq(budgetGoal.userId, ctx.session.user.id),
        ),
      });

      assert(!!existingBudget, "Budget not found or access denied");

      const result = await ctx.db
        .update(budgetGoal)
        .set({
          ...input.data,
        })
        .where(
          and(
            eq(budgetGoal.id, input.id),
            eq(budgetGoal.userId, ctx.session.user.id),
          ),
        )
        .returning();

      return parseFirstEl(result);
    }),

  deleteBudget: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the budget exists and belongs to the user
      const existingBudget = await ctx.db.query.budgetGoal.findFirst({
        where: and(
          eq(budgetGoal.id, input.id),
          eq(budgetGoal.userId, ctx.session.user.id),
        ),
      });

      assert(!!existingBudget, "Budget not found or access denied");

      await ctx.db
        .delete(budgetGoal)
        .where(
          and(
            eq(budgetGoal.id, input.id),
            eq(budgetGoal.userId, ctx.session.user.id),
          ),
        );

      return { success: true };
    }),

  getBudgets: protectedProcedure
    .input(
      z
        .object({
          period: z.enum(["monthly", "yearly"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(budgetGoal.userId, ctx.session.user.id)];

      if (input?.period) {
        conditions.push(eq(budgetGoal.period, input.period));
      }

      return ctx.db.query.budgetGoal.findMany({
        where: and(...conditions),
        with: {
          category: true,
        },
      });
    }),

  getBudgetProgress: protectedProcedure
    .input(budgetProgressFilterSchema)
    .query(async ({ ctx, input }) => {
      const { month, year, categoryId } = input;
      const now = new Date();
      const currentMonth = month ?? now.getMonth() + 1;
      const currentYear = year ?? now.getFullYear();

      // Get the start and end date for the month
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);

      // Build conditions for transactions
      const transactionConditions = [
        eq(transaction.userId, ctx.session.user.id),
        gte(transaction.date, startDate),
        lte(transaction.date, endDate),
      ];

      if (categoryId) {
        transactionConditions.push(eq(transaction.categoryId, categoryId));
      }

      // Get monthly budgets for the specified month/year
      const budgetConditions = [
        eq(monthlyBudget.userId, ctx.session.user.id),
        eq(monthlyBudget.month, currentMonth),
        eq(monthlyBudget.year, currentYear),
      ];

      if (categoryId) {
        budgetConditions.push(eq(monthlyBudget.categoryId, categoryId));
      }

      // Get the budgets with their categories using direct select instead of query builder
      const budgetsResult = await ctx.db
        .select({
          budget: monthlyBudget,
          category: category,
        })
        .from(monthlyBudget)
        .innerJoin(category, eq(monthlyBudget.categoryId, category.id))
        .where(and(...budgetConditions));

      // Transform to expected format
      const budgets = budgetsResult.map((r) => ({
        ...r.budget,
        category: r.category,
      }));

      // Get the actual spending for each category
      const spending = await ctx.db
        .select({
          categoryId: transaction.categoryId,
          total: sql<number>`sum(${transaction.amount})`,
        })
        .from(transaction)
        .innerJoin(category, eq(transaction.categoryId, category.id))
        .where(and(...transactionConditions, eq(category.type, "expense")))
        .groupBy(transaction.categoryId);

      // Calculate progress for each budget
      const progress = budgets.map((budget) => {
        const spent =
          spending.find((s) => s.categoryId === budget.categoryId)?.total ?? 0;
        const budgetAmount = Number(budget.amount);
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        return {
          budget,
          spent,
          remaining: budgetAmount - spent,
          percentage: Math.min(percentage, 100), // Cap at 100%
        };
      });

      return progress;
    }),

  // User Preferences endpoints
  getUserPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await ctx.db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, ctx.session.user.id),
    });

    if (preferences) {
      return preferences;
    }

    // If no preferences exist, create default ones
    const result = await ctx.db
      .insert(userPreferences)
      .values({
        userId: ctx.session.user.id,
        defaultCurrency: "USD",
        monthStartDay: 1,
      })
      .returning();

    return parseFirstEl(result);
  }),

  updateUserPreferences: protectedProcedure
    .input(insertUserPreferencesSchema.partial())
    .mutation(async ({ ctx, input }) => {
      // Check if preferences already exist
      const existingPrefs = await ctx.db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, ctx.session.user.id),
      });

      if (existingPrefs) {
        // Update existing preferences
        const result = await ctx.db
          .update(userPreferences)
          .set(input)
          .where(eq(userPreferences.userId, ctx.session.user.id))
          .returning();

        return parseFirstEl(result);
      } else {
        // Create new preferences
        const result = await ctx.db
          .insert(userPreferences)
          .values({
            userId: ctx.session.user.id,
            ...input,
          })
          .returning();

        return parseFirstEl(result);
      }
    }),
} satisfies TRPCRouterRecord;
