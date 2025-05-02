import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { announcement, comment, user } from "@acme/db";

import { adminProcedure, protectedProcedure, publicProcedure } from "../trpc";

const ITEMS_PER_PAGE = 10;

export const announcementRouter = {
	// Public endpoints
	getAll: publicProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(ITEMS_PER_PAGE),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { page, limit } = input;
			const offset = (page - 1) * limit;

			const announcements = await ctx.db
				.select({
					announcement,
					createdBy: {
						id: user.id,
						name: user.name,
					},
				})
				.from(announcement)
				.innerJoin(user, eq(announcement.createdById, user.id))
				.orderBy(desc(announcement.id))
				.limit(limit)
				.offset(offset);

			const total = await ctx.db
				.select({ count: announcement.id })
				.from(announcement)
				.then((res) => res.length);

			return {
				items: announcements,
				metadata: {
					totalPages: Math.ceil(total / limit),
					currentPage: page,
					totalItems: total,
				},
			};
		}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const announcementData = await ctx.db
				.select({
					announcement,
					createdBy: {
						id: user.id,
						name: user.name,
					},
				})
				.from(announcement)
				.innerJoin(user, eq(announcement.id, input.id))
				.limit(1);

			if (!announcementData[0]) {
				throw new Error("Announcement not found");
			}
			return announcementData[0];
		}),

	// Admin-only endpoints
	create: adminProcedure
		.input(
			z.object({
				title: z.string().min(1).max(255),
				content: z.string().min(1),
				isPinned: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [newAnnouncement] = await ctx.db
				.insert(announcement)
				.values({
					...input,
					createdById: ctx.session.user.id,
				})
				.returning({ id: announcement.id });

			if (!newAnnouncement) {
				throw new Error("Failed to create announcement");
			}
			return { success: true, id: newAnnouncement.id };
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).max(255),
				content: z.string().min(1),
				isPinned: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			await ctx.db
				.update(announcement)
				.set(updateData)
				.where(eq(announcement.id, id));

			return { success: true };
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(announcement).where(eq(announcement.id, input.id));
			return { success: true };
		}),

	togglePin: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [currentAnnouncement] = await ctx.db
				.select({ isPinned: announcement.isPinned })
				.from(announcement)
				.where(eq(announcement.id, input.id))
				.limit(1);

			if (!currentAnnouncement) {
				throw new Error("Announcement not found");
			}

			await ctx.db
				.update(announcement)
				.set({ isPinned: !currentAnnouncement.isPinned })
				.where(eq(announcement.id, input.id));

			return { success: true };
		}),

	// Comment endpoints
	createComment: protectedProcedure
		.input(
			z.object({
				announcementId: z.string(),
				content: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [newComment] = await ctx.db
				.insert(comment)
				.values({
					...input,
					userId: ctx.session.user.id,
				})
				.returning({ id: comment.id });

			if (!newComment) {
				throw new Error("Failed to create comment");
			}
			return { success: true, id: newComment.id };
		}),

	deleteComment: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [commentToDelete] = await ctx.db
				.select({ userId: comment.userId })
				.from(comment)
				.where(eq(comment.id, input.id))
				.limit(1);

			if (!commentToDelete) {
				throw new Error("Comment not found");
			}

			// Get the full user data to check role
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

			// Allow deletion if user is admin or comment owner
			if (userData.userRole !== "admin" && commentToDelete.userId !== ctx.session.user.id) {
				throw new Error("Unauthorized to delete this comment");
			}

			await ctx.db.delete(comment).where(eq(comment.id, input.id));
			return { success: true };
		}),

	getComments: publicProcedure
		.input(
			z.object({
				announcementId: z.string(),
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(ITEMS_PER_PAGE),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { announcementId, page, limit } = input;
			const offset = (page - 1) * limit;

			const comments = await ctx.db
				.select({
					comment,
					author: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(comment)
				.innerJoin(user, eq(comment.userId, user.id))
				.where(eq(comment.announcementId, announcementId))
				.orderBy(desc(comment.id))
				.limit(limit)
				.offset(offset);

			const total = await ctx.db
				.select({ count: comment.id })
				.from(comment)
				.where(eq(comment.announcementId, announcementId))
				.then((res) => res.length);

			return {
				items: comments,
				metadata: {
					totalPages: Math.ceil(total / limit),
					currentPage: page,
					totalItems: total,
				},
			};
		}),
} satisfies TRPCRouterRecord;