import { z } from "zod";
import { and, eq, like, or } from "drizzle-orm";

import { announcement, attachment, author, category, userBookmark } from "@acme/db/schema";
import { assert } from "@acme/utils";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const announcementRouter = createTRPCRouter({
	// Queries
	getAnnouncements: publicProcedure
		.input(z.object({
			categoryId: z.string().uuid().optional(),
			onlyBookmarked: z.boolean().optional(),
			searchQuery: z.string().optional(),
		}))
		.query(async ({ ctx, input }) => {
			const { db } = ctx;

			const results = await db.select().from(announcement)
				.leftJoin(category, eq(announcement.categoryId, category.id))
				.leftJoin(author, eq(announcement.authorId, author.id))
				.leftJoin(
					userBookmark,
					and(
						eq(userBookmark.announcementId, announcement.id),
						// if the session does not exist, let's just not include this
						...(ctx.session ? [eq(userBookmark.userId, ctx.session.user.id)] : [])
					)
				)
				.where(
					and(
						...(input.categoryId ? [eq(announcement.categoryId, input.categoryId)] : []),
						...(input.searchQuery ? [or(
							like(announcement.title, `%${input.searchQuery}%`),
							like(announcement.content, `%${input.searchQuery}%`)
						)] : []),
						// if the session does not exist, let's just not include this
						...(ctx.session ? [eq(userBookmark.userId, ctx.session.user.id)] : [])
					)
				);

			// Get attachments for each announcement
			const announcementsWithAttachments = await Promise.all(
				results.map(async (result) => {
					const attachments = await db
						.select()
						.from(attachment)
						.where(eq(attachment.announcementId, result.announcement.id));

					return {
						...result.announcement,
						category: result.category,
						author: result.author,
						attachments: attachments,
					};
				})
			);

			return announcementsWithAttachments;
		}),

	getAnnouncementById: publicProcedure
		.input(z.object({
			id: z.string().uuid(),
		}))
		.query(async ({ ctx, input }) => {
			const { db } = ctx;

			const result = await db.select()
				.from(announcement)
				.where(eq(announcement.id, input.id))
				.leftJoin(category, eq(announcement.categoryId, category.id))
				.leftJoin(author, eq(announcement.authorId, author.id));

			if (!result[0]) {
				throw new Error("Announcement not found");
			}

			const attachments = await db
				.select()
				.from(attachment)
				.where(eq(attachment.announcementId, input.id));

			return {
				...result[0].announcement,
				category: result[0].category,
				author: result[0].author,
				attachments,
			};
		}),

	getCategories: publicProcedure
		.query(async ({ ctx }) => {
			const { db } = ctx;
			return db.select().from(category);
		}),

	getAuthors: publicProcedure
		.query(async ({ ctx }) => {
			const { db } = ctx;
			return db.select().from(author);
		}),

	getUserBookmarks: protectedProcedure
		.query(async ({ ctx }) => {
			const { db, session } = ctx;
			assert(!!session.user, "User must be logged in");

			const bookmarks = await db
				.select()
				.from(userBookmark)
				.where(eq(userBookmark.userId, session.user.id));

			return bookmarks.map(bookmark => bookmark.announcementId);
		}),

	// Mutations
	createAnnouncement: protectedProcedure
		.input(z.object({
			title: z.string().min(1).max(255),
			content: z.string().min(1),
			categoryId: z.string().uuid(),
			authorId: z.string().uuid(),
			isImportant: z.boolean().default(false),
			attachments: z.array(z.object({
				name: z.string().min(1).max(255),
				url: z.string().min(1).max(255),
				type: z.enum(["pdf", "doc", "image", "other"]),
			})).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { db, session } = ctx;
			assert(!!session.user, "User must be logged in");
			assert(session.user.userRole === "admin", "Only admins can create announcements");

			// Create announcement
			const [newAnnouncement] = await db
				.insert(announcement)
				.values({
					title: input.title,
					content: input.content,
					categoryId: input.categoryId,
					authorId: input.authorId,
					isImportant: input.isImportant,
					date: new Date(),
				})
				.returning();

			// Create attachments if provided
			if (input.attachments && input.attachments.length > 0 && newAnnouncement) {
				await db.insert(attachment).values(
					input.attachments.map(att => ({
						announcementId: newAnnouncement.id,
						name: att.name,
						url: att.url,
						type: att.type,
					}))
				);
			}

			return newAnnouncement;
		}),

	updateAnnouncement: protectedProcedure
		.input(z.object({
			id: z.string().uuid(),
			title: z.string().min(1).max(255).optional(),
			content: z.string().min(1).optional(),
			categoryId: z.string().uuid().optional(),
			authorId: z.string().uuid().optional(),
			isImportant: z.boolean().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { db, session } = ctx;
			assert(!!session.user, "User must be logged in");
			assert(session.user.userRole === "admin", "Only admins can update announcements");

			const [updatedAnnouncement] = await db
				.update(announcement)
				.set({
					...(input.title && { title: input.title }),
					...(input.content && { content: input.content }),
					...(input.categoryId && { categoryId: input.categoryId }),
					...(input.authorId && { authorId: input.authorId }),
					...(input.isImportant !== undefined && { isImportant: input.isImportant }),
				})
				.where(eq(announcement.id, input.id))
				.returning();

			return updatedAnnouncement;
		}),

	deleteAnnouncement: protectedProcedure
		.input(z.object({
			id: z.string().uuid(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { db, session } = ctx;
			assert(!!session.user, "User must be logged in");
			assert(session.user.userRole === "admin", "Only admins can delete announcements");

			await db.delete(announcement).where(eq(announcement.id, input.id));

			return { success: true };
		}),

	toggleBookmark: protectedProcedure
		.input(z.object({
			announcementId: z.string().uuid(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { db, session } = ctx;
			assert(!!session.user, "User must be logged in");

			// Check if bookmark already exists
			const existingBookmark = await db
				.select()
				.from(userBookmark)
				.where(
					and(
						eq(userBookmark.userId, session.user.id),
						eq(userBookmark.announcementId, input.announcementId)
					)
				);

			if (existingBookmark.length > 0) {
				// Remove bookmark
				await db
					.delete(userBookmark)
					.where(
						and(
							eq(userBookmark.userId, session.user.id),
							eq(userBookmark.announcementId, input.announcementId)
						)
					);
				return { bookmarked: false };
			} else {
				// Add bookmark
				await db.insert(userBookmark).values({
					userId: session.user.id,
					announcementId: input.announcementId,
				});
				return { bookmarked: true };
			}
		}),

	addAttachment: protectedProcedure
		.input(z.object({
			announcementId: z.string().uuid(),
			name: z.string().min(1).max(255),
			url: z.string().min(1).max(255),
			type: z.enum(["pdf", "doc", "image", "other"]),
		}))
		.mutation(async ({ ctx, input }) => {
			const { db, session } = ctx;
			assert(!!session.user, "User must be logged in");
			assert(session.user.userRole === "admin", "Only admins can add attachments");

			const [newAttachment] = await db
				.insert(attachment)
				.values({
					announcementId: input.announcementId,
					name: input.name,
					url: input.url,
					type: input.type,
				})
				.returning();

			return newAttachment;
		}),

	removeAttachment: protectedProcedure
		.input(z.object({
			id: z.string().uuid(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { db, session } = ctx;
			assert(!!session.user, "User must be logged in");
			assert(session.user.userRole === "admin", "Only admins can remove attachments");

			await db.delete(attachment).where(eq(attachment.id, input.id));

			return { success: true };
		}),
});