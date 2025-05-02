import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";

import { helpRequest, user } from "@acme/db";

import { adminProcedure, protectedProcedure } from "../trpc";

const ITEMS_PER_PAGE = 10;

const statusEnum = z.enum(["open", "in_progress", "resolved", "closed"]);

export const helpRequestRouter = {
	create: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(255),
				description: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [newRequest] = await ctx.db
				.insert(helpRequest)
				.values({
					...input,
					createdById: ctx.session.user.id,
					requestStatus: "open",
				})
				.returning({ id: helpRequest.id });

			if (!newRequest) {
				throw new Error("Failed to create help request");
			}

			return { success: true, id: newRequest.id };
		}),

	updateStatus: adminProcedure
		.input(
			z.object({
				id: z.string(),
				status: statusEnum,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, status } = input;

			await ctx.db
				.update(helpRequest)
				.set({ requestStatus: status })
				.where(eq(helpRequest.id, id));

			return { success: true };
		}),

	list: protectedProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(ITEMS_PER_PAGE),
				status: statusEnum.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { page, limit, status } = input;
			const offset = (page - 1) * limit;

			// Get the user's role
			const [userData] = await ctx.db
				.select({
					userRole: user.userRole,
				})
				.from(user)
				.where(eq(user.id, ctx.session.user.id))
				.limit(1);

			if (!userData) {
				throw new Error("User not found");
			}

			// Build the base query
			const baseQuery = ctx.db
				.select({
					helpRequest,
					createdBy: {
						id: user.id,
						name: user.name,
					},
				})
				.from(helpRequest)
				.innerJoin(user, eq(helpRequest.createdById, user.id));

			// Build conditions array
			const conditions = [];

			// Filter by status if provided
			if (status) {
				conditions.push(eq(helpRequest.requestStatus, status));
			}

			// If not admin, only show user's own requests
			if (userData.userRole !== "admin") {
				conditions.push(eq(helpRequest.createdById, ctx.session.user.id));
			}

			// Apply conditions and pagination
			const requests = await (conditions.length > 0
				? baseQuery.where(and(...conditions))
				: baseQuery
			)
				.orderBy(desc(helpRequest.id))
				.limit(limit)
				.offset(offset);

			// Count total matching requests
			const countQuery = ctx.db
				.select({ count: helpRequest.id })
				.from(helpRequest);

			const [totalResult] = await (conditions.length > 0
				? countQuery.where(and(...conditions))
				: countQuery);

			const totalCount = Number(totalResult?.count ?? 0);

			return {
				items: requests,
				metadata: {
					totalPages: Math.ceil(totalCount / limit),
					currentPage: page,
					totalItems: totalCount,
				},
			};
		}),
	getById: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			// Get the user's role
			const [userData] = await ctx.db
				.select({
					userRole: user.userRole,
				})
				.from(user)
				.where(eq(user.id, ctx.session.user.id))
				.limit(1);

			if (!userData) {
				throw new Error("User not found");
			}

			// Build the query conditions
			const conditions = [eq(helpRequest.id, input.id)];

			// If not admin, only allow viewing own requests
			if (userData.userRole !== "admin") {
				conditions.push(eq(helpRequest.createdById, ctx.session.user.id));
			}

			const [request] = await ctx.db
				.select({
					helpRequest: {
						id: helpRequest.id,
						title: helpRequest.title,
						description: helpRequest.description,
						requestStatus: helpRequest.requestStatus,
						createdAt: helpRequest.createdAt,
					},
					createdBy: {
						id: user.id,
						name: user.name,
					},
				})
				.from(helpRequest)
				.innerJoin(user, eq(helpRequest.createdById, user.id))
				.where(and(...conditions))
				.limit(1);

			if (!request) {
				throw new Error("Help request not found");
			}

			return request;
		}),
} satisfies TRPCRouterRecord;