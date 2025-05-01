import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { community, communityMember, eqi } from "@acme/db";

export const communityRouter = {
	// Get a community by name
	getCommunity: publicProcedure
		.input(z.object({ name: z.string() }))
		.query(async ({ ctx, input }) => {
			const result = await ctx.db.query.community.findFirst({
				where: eqi(community.name, input.name),
				with: {
					creator: true,
				},
			});

			return result;
		}),

	// Get communities for the home feed
	getHomeFeed: publicProcedure.query(async ({ ctx }) => {
		const communities = await ctx.db.query.community.findMany({
			orderBy: (community, { desc }) => [desc(community.memberCount)],
			limit: 20,
			with: {
				creator: {
					columns: {
						id: true,
						name: true,
						username: true,
					},
				},
			},
		});

		return { communities };
	}),

	// Create a new community (protected route)
	createCommunity: protectedProcedure
		.input(
			z.object({
				name: z.string().min(3).max(21),
				description: z.string().max(500).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Create the community
			const newCommunity = await ctx.db.transaction(async (tx) => {
				// Create the community
				const [createdCommunity] = await tx.insert(community).values({
					name: input.name,
					description: input.description,
					creatorId: ctx.session.user.id,
					memberCount: 1,
				}).returning();

				if (!createdCommunity) {
					throw new Error("Failed to create community");
				}

				// Add the creator as a member and moderator
				await tx.insert(communityMember).values({
					communityId: createdCommunity.id,
					userId: ctx.session.user.id,
					isModerator: true,
				});

				return createdCommunity;
			});

			return newCommunity;
		}),

	// Join a community
	joinCommunity: protectedProcedure
		.input(z.object({ communityId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Check if already a member
			const existingMembership = await ctx.db.query.communityMember.findFirst({
				where: (member, { and }) => and(
					eqi(member.communityId, input.communityId),
					eqi(member.userId, ctx.session.user.id)
				),
			});

			if (existingMembership) {
				return { success: false, message: "Already a member of this community" };
			}

			// Add as member and increment member count
			await ctx.db.transaction(async (tx) => {
				// Add as member
				await tx.insert(communityMember).values({
					communityId: input.communityId,
					userId: ctx.session.user.id,
					isModerator: false,
				});

				// Get current community to get member count
				const currentCommunity = await tx.query.community.findFirst({
					where: eqi(community.id, input.communityId),
					columns: {
						memberCount: true
					}
				});

				if (!currentCommunity) {
					throw new Error("Community not found");
				}

				// Increment member count
				await tx.update(community)
					.set({ memberCount: (currentCommunity.memberCount ?? 0) + 1 })
					.where(eqi(community.id, input.communityId));
			});

			return { success: true };
		}),
} satisfies TRPCRouterRecord;