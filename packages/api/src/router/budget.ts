import { z } from "zod";
import type { TRPCRouterRecord } from "@trpc/server";
import { and, desc, eqi, gte, lte } from "@acme/db";

import { budget, project, transaction, transactionType } from "@acme/db/schema";
import { protectedProcedure } from "../trpc";

// Input validation schemas
const projectSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().optional(),
});

const budgetSchema = z.object({
	projectId: z.string(),
	amount: z.number().positive(),
	startDate: z.date(),
	endDate: z.date().optional(),
	name: z.string().min(1).max(255),
	description: z.string().optional(),
});

const transactionSchema = z.object({
	projectId: z.string(),
	type: transactionType,
	amount: z.number().positive(),
	description: z.string().optional(),
	date: z.date(),
});

export const budgetRouter = {
	// Project endpoints
	createProject: protectedProcedure
		.input(projectSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.insert(project).values({
				...input,
				userId: ctx.session.user.id,
			});
		}),

	getProjects: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db
			.select()
			.from(project)
			.where(eqi(project.userId, ctx.session.user.id))
			.orderBy(desc(project.createdAt));
	}),

	getProject: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db
				.select()
				.from(project)
				.where(
					and(
						eqi(project.id, input.id),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.limit(1);
		}),

	updateProject: protectedProcedure
		.input(z.object({ id: z.string(), data: projectSchema }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db
				.update(project)
				.set(input.data)
				.where(
					and(
						eqi(project.id, input.id),
						eqi(project.userId, ctx.session.user.id),
					),
				);
		}),

	deleteProject: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db
				.delete(project)
				.where(
					and(
						eqi(project.id, input.id),
						eqi(project.userId, ctx.session.user.id),
					),
				);
		}),

	// Budget endpoints
	createBudget: protectedProcedure
		.input(budgetSchema)
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership before creating budget
			const projectRecord = await ctx.db
				.select()
				.from(project)
				.where(
					and(
						eqi(project.id, input.projectId),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!projectRecord.length) {
				throw new Error("Project not found or access denied");
			}

			return ctx.db.insert(budget).values({
				...input,
				amount: input.amount.toString(), // Convert number to string for numeric column
			});
		}),

	getProjectBudgets: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db
				.select()
				.from(budget)
				.innerJoin(project, eqi(budget.projectId, project.id))
				.where(
					and(
						eqi(project.id, input.projectId),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.orderBy(desc(budget.startDate));
		}),

	updateBudget: protectedProcedure
		.input(z.object({ id: z.string(), data: budgetSchema }))
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership before updating budget
			const projectRecord = await ctx.db
				.select()
				.from(project)
				.where(
					and(
						eqi(project.id, input.data.projectId),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!projectRecord.length) {
				throw new Error("Project not found or access denied");
			}

			return ctx.db
				.update(budget)
				.set({
					...input.data,
					amount: input.data.amount.toString(), // Convert number to string for numeric column
				})
				.where(eqi(budget.id, input.id));
		}),

	deleteBudget: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership before deleting budget
			const budgetRecord = await ctx.db
				.select()
				.from(budget)
				.innerJoin(project, eqi(budget.projectId, project.id))
				.where(
					and(
						eqi(budget.id, input.id),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!budgetRecord.length) {
				throw new Error("Budget not found or access denied");
			}

			return ctx.db.delete(budget).where(eqi(budget.id, input.id));
		}),

	// Transaction endpoints
	createTransaction: protectedProcedure
		.input(transactionSchema)
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership before creating transaction
			const projectRecord = await ctx.db
				.select()
				.from(project)
				.where(
					and(
						eqi(project.id, input.projectId),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!projectRecord.length) {
				throw new Error("Project not found or access denied");
			}

			return ctx.db.insert(transaction).values({
				...input,
				amount: input.amount.toString(), // Convert number to string for numeric column
			});
		}),

	getProjectTransactions: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
				type: transactionType.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eqi(project.id, input.projectId),
				eqi(project.userId, ctx.session.user.id),
			];

			if (input.startDate) {
				conditions.push(gte(transaction.date, input.startDate));
			}

			if (input.endDate) {
				conditions.push(lte(transaction.date, input.endDate));
			}

			if (input.type) {
				conditions.push(eqi(transaction.type, input.type));
			}

			return ctx.db
				.select()
				.from(transaction)
				.innerJoin(project, eqi(transaction.projectId, project.id))
				.where(and(...conditions))
				.orderBy(desc(transaction.date));
		}),

	updateTransaction: protectedProcedure
		.input(z.object({ id: z.string(), data: transactionSchema }))
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership before updating transaction
			const projectRecord = await ctx.db
				.select()
				.from(project)
				.where(
					and(
						eqi(project.id, input.data.projectId),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!projectRecord.length) {
				throw new Error("Project not found or access denied");
			}

			return ctx.db
				.update(transaction)
				.set({
					...input.data,
					amount: input.data.amount.toString(), // Convert number to string for numeric column
				})
				.where(eqi(transaction.id, input.id));
		}),

	deleteTransaction: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership before deleting transaction
			const transactionRecord = await ctx.db
				.select()
				.from(transaction)
				.innerJoin(project, eqi(transaction.projectId, project.id))
				.where(
					and(
						eqi(transaction.id, input.id),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!transactionRecord.length) {
				throw new Error("Transaction not found or access denied");
			}

			return ctx.db.delete(transaction).where(eqi(transaction.id, input.id));
		}),
} satisfies TRPCRouterRecord;