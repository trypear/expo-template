import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { comment, post, eqi, sql } from "@acme/db";

export const commentRouter = {
	// Get comments for a post
	getPostComments: publicProcedure
		.input(z.object({
			postId: z.string(),
			limit: z.number().min(1).max(100).default(50),
		}))
		.query(async ({ ctx, input }) => {
			// Get top-level comments (no parent)
			const topLevelComments = await ctx.db.query.comment.findMany({
				where: (comment, { and }) => and(
					eqi(comment.postId, input.postId),
					sql`${comment.parentId} IS NULL`
				),
				limit: input.limit,
				orderBy: (comment, { desc }) => [desc(comment.createdAt)],
				with: {
					author: true,
				},
			});

			// Format comments and add author name
			const formattedComments = await Promise.all(
				topLevelComments.map(async (c) => {
					// Get replies for this comment
					const replies = await ctx.db.query.comment.findMany({
						where: eqi(comment.parentId, c.id),
						orderBy: (comment, { desc }) => [desc(comment.createdAt)],
						with: {
							author: true,
						},
					});

					// Format replies
					const formattedReplies = replies.map(r => ({
						...r,
						authorName: r.author.username ?? r.author.name ?? "Anonymous",
						replies: [], // No nested replies for simplicity
					}));

					return {
						...c,
						authorName: c.author.username ?? c.author.name ?? "Anonymous",
						replies: formattedReplies,
					};
				})
			);

			return {
				comments: formattedComments,
			};
		}),

	// Create a new comment
	createComment: protectedProcedure
		.input(
			z.object({
				content: z.string().min(1),
				postId: z.string(),
				parentId: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Verify post exists
			const postExists = await ctx.db.query.post.findFirst({
				where: eqi(post.id, input.postId),
				columns: {
					id: true,
				},
			});

			if (!postExists) {
				throw new Error("Post not found");
			}

			// If parentId is provided, verify parent comment exists
			if (input.parentId) {
				const parentExists = await ctx.db.query.comment.findFirst({
					where: eqi(comment.id, input.parentId),
					columns: {
						id: true,
					},
				});

				if (!parentExists) {
					throw new Error("Parent comment not found");
				}
			}

			// Create the comment
			const [createdComment] = await ctx.db.insert(comment).values({
				content: input.content,
				authorId: ctx.session.user.id,
				postId: input.postId,
				parentId: input.parentId,
				upvotes: 1, // Auto-upvote
				downvotes: 0,
			}).returning();

			if (!createdComment) {
				throw new Error("Failed to create comment");
			}

			// Increment comment count on post
			await ctx.db.update(post)
				.set({ commentCount: sql`${post.commentCount} + 1` })
				.where(eqi(post.id, input.postId));

			return {
				...createdComment,
				authorName: ctx.session.user.name ?? "Anonymous",
			};
		}),

	// Upvote a comment - simplified version
	upvoteComment: protectedProcedure
		.input(z.object({ commentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Just increment the upvotes count directly
			await ctx.db.update(comment)
				.set({ upvotes: sql`${comment.upvotes} + 1` })
				.where(eqi(comment.id, input.commentId));

			return {
				success: true,
				commentId: input.commentId,
				action: "upvote"
			};
		}),

	// Downvote a comment - simplified version
	downvoteComment: protectedProcedure
		.input(z.object({ commentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Just increment the downvotes count directly
			await ctx.db.update(comment)
				.set({ downvotes: sql`${comment.downvotes} + 1` })
				.where(eqi(comment.id, input.commentId));

			return {
				success: true,
				commentId: input.commentId,
				action: "downvote"
			};
		}),
} satisfies TRPCRouterRecord;