import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { community, post, eqi, sql, comment } from "@acme/db";

export const postRouter = {
	// Get a single post by ID
	getPostById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const result = await ctx.db.query.post.findFirst({
				where: eqi(post.id, input.id),
				with: {
					author: true,
					community: true,
				},
			});

			if (!result) {
				throw new Error("Post not found");
			}

			// Get comment count
			const commentCountResult = await ctx.db.select({
				count: sql<number>`count(*)`,
			})
				.from(comment)
				.where(eqi(comment.postId, input.id));

			const commentCount = commentCountResult[0]?.count ?? 0;

			return {
				...result,
				authorName: result.author.username ?? result.author.name ?? "Anonymous",
				communityName: result.community.name,
				commentCount,
			};
		}),

	// Get posts for a community
	getCommunityPosts: publicProcedure
		.input(z.object({
			communityId: z.string().optional(),
			limit: z.number().min(1).max(100).default(20),
		}))
		.query(async ({ ctx, input }) => {
			const whereClause = input.communityId
				? eqi(post.communityId, input.communityId)
				: undefined;

			const posts = await ctx.db.query.post.findMany({
				where: whereClause,
				limit: input.limit,
				orderBy: (posts, { desc }) => [desc(posts.createdAt)],
				with: {
					author: true,
					community: true,
				},
			});

			// Format posts for the client
			const formattedPosts = posts.map(p => ({
				...p,
				authorName: p.author.username ?? p.author.name ?? "Anonymous",
				communityName: p.community.name,
				commentCount: 0, // We'll add this later
			}));

			return {
				posts: formattedPosts,
			};
		}),

	// Create a new post
	createPost: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1).max(300),
				content: z.string().optional(),
				communityId: z.string(),
				imageUrl: z.string().url().optional(),
				linkUrl: z.string().url().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Get community to verify it exists
			const communityRecord = await ctx.db.query.community.findFirst({
				where: eqi(community.id, input.communityId),
				columns: {
					id: true,
					name: true,
				},
			});

			if (!communityRecord) {
				throw new Error("Community not found");
			}

			// Create the post
			const [createdPost] = await ctx.db.insert(post).values({
				title: input.title,
				content: input.content,
				authorId: ctx.session.user.id,
				communityId: input.communityId,
				imageUrl: input.imageUrl,
				linkUrl: input.linkUrl,
				upvotes: 1, // Auto-upvote
				downvotes: 0,
			}).returning();

			if (!createdPost) {
				throw new Error("Failed to create post");
			}

			// Auto-upvote your own post
			// Skip auto-upvote for now due to schema constraints
			// We'll handle this properly when we implement the comment router

			return {
				...createdPost,
				authorName: ctx.session.user.name ?? "Anonymous",
				communityName: communityRecord.name,
				commentCount: 0,
			};
		}),

	// Upvote a post - simplified version without vote table
	upvotePost: protectedProcedure
		.input(z.object({ postId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Just increment the upvotes count directly
			await ctx.db.update(post)
				.set({ upvotes: sql`${post.upvotes} + 1` })
				.where(eqi(post.id, input.postId));

			return { success: true, postId: input.postId, action: "upvote" };
		}),

	// Downvote a post - simplified version without vote table
	downvotePost: protectedProcedure
		.input(z.object({ postId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Just increment the downvotes count directly
			await ctx.db.update(post)
				.set({ downvotes: sql`${post.downvotes} + 1` })
				.where(eqi(post.id, input.postId));

			return { success: true, postId: input.postId, action: "downvote" };
		}),

	// Get all posts for the home feed
	getHomeFeed: publicProcedure
		.input(z.object({
			limit: z.number().min(1).max(100).default(20),
		}))
		.query(async ({ ctx, input }) => {
			const posts = await ctx.db.query.post.findMany({
				limit: input.limit,
				orderBy: (posts, { desc }) => [desc(posts.createdAt)],
				with: {
					author: true,
					community: true,
				},
			});

			// Format posts for the client
			const formattedPosts = posts.map(p => ({
				...p,
				authorName: p.author.username ?? p.author.name ?? "Anonymous",
				communityName: p.community.name,
				commentCount: 0, // We'll add this later
			}));

			return {
				posts: formattedPosts,
			};
		}),
} satisfies TRPCRouterRecord;