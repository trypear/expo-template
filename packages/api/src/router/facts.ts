import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { TRPCRouterRecord } from "@trpc/server";

import * as schema from "@acme/db/schema";
import { eq, and, desc, sql } from "@acme/db";
import { like } from "drizzle-orm";
import { assert } from "@acme/utils";

import { protectedProcedure, publicProcedure } from "../trpc";

// Aliases for easier reference
const fact = schema.fact;
const factQueue = schema.factQueue;

export const factsRouter = {
	// Public endpoints
	getFacts: publicProcedure
		.query(async ({ ctx }) => {
			const facts = await ctx.db
				.select()
				.from(fact)
				.where(eq(fact.isActive, true))
				.orderBy(desc(fact.createdAt));

			return facts;
		}),

	getRandomFact: publicProcedure
		.query(async ({ ctx }) => {
			// Get a random fact using SQL's random() function
			const facts = await ctx.db
				.select()
				.from(fact)
				.where(eq(fact.isActive, true))
				.orderBy(sql`RANDOM()`)
				.limit(1);

			if (facts.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No facts available",
				});
			}

			return facts[0];
		}),

	getFactOfTheDay: publicProcedure
		.query(async ({ ctx }) => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Format date as ISO string for database comparison
			const todayStr = today.toISOString().split('T')[0];

			// Get today's scheduled fact
			const queuedFacts = await ctx.db
				.select({
					factQueue: factQueue,
					fact: fact,
				})
				.from(factQueue)
				.innerJoin(fact, eq(factQueue.factId, fact.id))
				.where(
					and(
						sql`${factQueue.scheduledDate}::text = ${todayStr}`,
						eq(fact.isActive, true)
					)
				)
				.limit(1);

			// If there's a scheduled fact for today, return it and mark as shown
			if (queuedFacts.length > 0) {
				const queuedFact = queuedFacts[0];
				assert(!!queuedFact, "Queued fact should be defined");
				assert(!!queuedFact.factQueue, "Queued fact queue should be defined");

				// Mark as shown
				await ctx.db
					.update(factQueue)
					.set({ isShown: true })
					.where(eq(factQueue.id, queuedFact.factQueue.id));

				return queuedFact.fact;
			}

			// Otherwise, get a random fact
			const randomFacts = await ctx.db
				.select()
				.from(fact)
				.where(eq(fact.isActive, true))
				.orderBy(sql`RANDOM()`)
				.limit(1);

			if (randomFacts.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No facts available",
				});
			}

			return randomFacts[0];
		}),

	// Protected (admin) endpoints
	createFact: protectedProcedure
		.input(
			z.object({
				content: z.string().min(1),
				category: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const newFact = await ctx.db.insert(fact).values({
				content: input.content,
				category: input.category,
				createdBy: ctx.session.user.id,
				isActive: true,
			}).returning();

			return newFact[0];
		}),

	updateFact: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				content: z.string().min(1).optional(),
				category: z.string().optional(),
				isActive: z.boolean().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			const updatedFact = await ctx.db
				.update(fact)
				.set(updateData)
				.where(eq(fact.id, id))
				.returning();

			if (updatedFact.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Fact not found",
				});
			}

			return updatedFact[0];
		}),

	deleteFact: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// First delete any queue entries for this fact
			await ctx.db
				.delete(factQueue)
				.where(eq(factQueue.factId, input.id));

			// Then delete the fact
			const deletedFact = await ctx.db
				.delete(fact)
				.where(eq(fact.id, input.id))
				.returning();

			if (deletedFact.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Fact not found",
				});
			}

			return deletedFact[0];
		}),

	queueFact: protectedProcedure
		.input(
			z.object({
				factId: z.string(),
				scheduledDate: z.date().transform(date => date.toISOString().split('T')[0]),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Check if fact exists and is active
			const facts = await ctx.db
				.select()
				.from(fact)
				.where(
					and(
						eq(fact.id, input.factId),
						eq(fact.isActive, true)
					)
				);

			if (facts.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Fact not found or inactive",
				});
			}

			// The scheduledDate is already a string in ISO format from the transform
			assert(!!input.scheduledDate, "Scheduled date must be defined");

			// Check if there's already a fact scheduled for this date
			const existingQueue = await ctx.db
				.select()
				.from(factQueue)
				.where(eq(factQueue.scheduledDate, input.scheduledDate))
			// .where(sql`${factQueue.scheduledDate}::text = ${input.scheduledDate}`);

			if (existingQueue.length > 0) {
				const existingEntry = existingQueue[0];
				assert(!!existingEntry, "Existing queue entry should be defined");

				// Update existing queue entry
				const updatedQueue = await ctx.db
					.update(factQueue)
					.set({
						factId: input.factId,
						isShown: false,
					})
					.where(eq(factQueue.id, existingEntry.id))
					.returning();

				assert(updatedQueue.length > 0, "Updated queue should have at least one entry");
				return updatedQueue[0];
			}

			// Create new queue entry
			assert(!!input.scheduledDate, "Scheduled date should be defined");

			// Use SQL to handle the date conversion properly
			const result = await ctx.db.execute(
				sql`INSERT INTO "factQueue" ("factId", "scheduledDate", "isShown")
			      VALUES (${input.factId}, ${input.scheduledDate}::date, false)
			      RETURNING *`
			);

			// Make sure we have a result
			assert(result.rows.length > 0, "Insert should return at least one row");
			const row = result.rows[0];
			assert(!!row, "Result row should be defined");

			// Convert the raw result to a proper object
			const newQueue = {
				id: row.id,
				factId: row.factId,
				scheduledDate: row.scheduledDate,
				isShown: row.isShown,
				createdAt: row.created_at,
				updatedAt: row.updated_at
			};

			return newQueue;
		}),

	getFactQueue: protectedProcedure
		.input(
			z.object({
				startDate: z.date().optional(),
				endDate: z.date().optional(),
			}).optional()
		)
		.query(async ({ ctx, input }) => {
			// Base query without date filters
			if (!input) {
				const queuedFacts = await ctx.db
					.select({
						factQueue: factQueue,
						fact: fact,
					})
					.from(factQueue)
					.innerJoin(fact, eq(factQueue.factId, fact.id))
					.orderBy(factQueue.scheduledDate);

				return queuedFacts;
			}

			// Apply date filters if provided
			if (input.startDate && input.endDate) {
				const startDateStr = input.startDate.toISOString().split('T')[0];
				const endDateStr = input.endDate.toISOString().split('T')[0];

				const queuedFacts = await ctx.db
					.select({
						factQueue: factQueue,
						fact: fact,
					})
					.from(factQueue)
					.innerJoin(fact, eq(factQueue.factId, fact.id))
					.where(
						and(
							sql`${factQueue.scheduledDate}::text >= ${startDateStr}`,
							sql`${factQueue.scheduledDate}::text <= ${endDateStr}`
						)
					)
					.orderBy(factQueue.scheduledDate);

				return queuedFacts;
			} else if (input.startDate) {
				const startDateStr = input.startDate.toISOString().split('T')[0];

				const queuedFacts = await ctx.db
					.select({
						factQueue: factQueue,
						fact: fact,
					})
					.from(factQueue)
					.innerJoin(fact, eq(factQueue.factId, fact.id))
					.where(sql`${factQueue.scheduledDate}::text >= ${startDateStr}`)
					.orderBy(factQueue.scheduledDate);

				return queuedFacts;
			} else if (input.endDate) {
				const endDateStr = input.endDate.toISOString().split('T')[0];

				const queuedFacts = await ctx.db
					.select({
						factQueue: factQueue,
						fact: fact,
					})
					.from(factQueue)
					.innerJoin(fact, eq(factQueue.factId, fact.id))
					.where(sql`${factQueue.scheduledDate}::text <= ${endDateStr}`)
					.orderBy(factQueue.scheduledDate);

				return queuedFacts;
			}

			// Fallback to all facts if no valid date filters
			const queuedFacts = await ctx.db
				.select({
					factQueue: factQueue,
					fact: fact,
				})
				.from(factQueue)
				.innerJoin(fact, eq(factQueue.factId, fact.id))
				.orderBy(factQueue.scheduledDate);

			return queuedFacts;
		}),

	removeFromQueue: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const deletedQueue = await ctx.db
				.delete(factQueue)
				.where(eq(factQueue.id, input.id))
				.returning();

			if (deletedQueue.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Queue entry not found",
				});
			}

			return deletedQueue[0];
		}),

	searchFacts: protectedProcedure
		.input(
			z.object({
				query: z.string(),
				category: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			if (input.category) {
				const foundFacts = await ctx.db
					.select()
					.from(fact)
					.where(
						and(
							like(fact.content, `%${input.query}%`),
							eq(fact.category, input.category)
						)
					)
					.orderBy(desc(fact.createdAt));

				return foundFacts;
			} else {
				const foundFacts = await ctx.db
					.select()
					.from(fact)
					.where(like(fact.content, `%${input.query}%`))
					.orderBy(desc(fact.createdAt));

				return foundFacts;
			}
		}),

	getCategories: protectedProcedure
		.query(async ({ ctx }) => {
			const result = await ctx.db
				.select({ category: fact.category })
				.from(fact)
				.where(sql`${fact.category} IS NOT NULL`)
				.groupBy(fact.category);

			return result.map(r => r.category).filter(Boolean);
		}),
} satisfies TRPCRouterRecord;