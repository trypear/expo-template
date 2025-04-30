import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import {
	and,
	createProjectSchema,
	desc,
	eqi,
	gte,
	lte,
	sum,
} from "@acme/db";
import { project, transaction, transactionType, user } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";
import { getFirstEl } from "@acme/utils";

const transactionSchema = z.object({
	projectId: z.string(),
	type: transactionType,
	amount: z.number().positive(),
	description: z.string().optional(),
	date: z.date(),
});

export const budgetRouter = {
	getProjectSummary: protectedProcedure
		.input(z.object({ projectId: z.string() }).optional())
		.query(async ({ ctx, input }) => {
			return ctx.db
				.select({
					projectId: project.id,
					projectName: project.name,
					projectBudget: project.budget,
					totalSpend: sum(transaction.amount),
				})
				.from(user)
				.where(
					and(
						eqi(user.id, ctx.session.user.id),
						input?.projectId ? eqi(project.id, input.projectId) : undefined,
					),
				)
				.innerJoin(project, eqi(project.userId, user.id))
				.leftJoin(transaction, eqi(project.id, transaction.projectId))
				.groupBy(project.id, project.name);
		}),

	createProject: protectedProcedure
		.input(createProjectSchema)
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
				.limit(1)
				.then(getFirstEl);
		}),

	updateProject: protectedProcedure
		.input(z.object({ id: z.string(), data: createProjectSchema }))
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

	getProjectBudget: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db
				.select()
				.from(project)
				.where(
					and(
						eqi(project.id, input.projectId),
						eqi(project.userId, ctx.session.user.id),
					),
				)
				.then(getFirstEl);
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
				...(input.startDate ? [gte(transaction.date, input.startDate)] : []),
				...(input.endDate ? [lte(transaction.date, input.endDate)] : []),
			];

			return ctx.db
				.select({
					transaction,
				})
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
