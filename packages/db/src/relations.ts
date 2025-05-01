import { relations } from "drizzle-orm";
import {
	account,
	session,
	user,
	community,
	communityMember,
	post,
	comment,
	vote
} from "./schema";

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	posts: many(post, { relationName: "author" }),
	comments: many(comment, { relationName: "author" }),
	votes: many(vote),
	communities: many(community, { relationName: "creator" }),
	communityMemberships: many(communityMember)
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const communityRelations = relations(community, ({ one, many }) => ({
	creator: one(user, { fields: [community.creatorId], references: [user.id] }),
	members: many(communityMember),
	posts: many(post)
}));

export const communityMemberRelations = relations(communityMember, ({ one }) => ({
	community: one(community, { fields: [communityMember.communityId], references: [community.id] }),
	user: one(user, { fields: [communityMember.userId], references: [user.id] })
}));

export const postRelations = relations(post, ({ one, many }) => ({
	author: one(user, { fields: [post.authorId], references: [user.id] }),
	community: one(community, { fields: [post.communityId], references: [community.id] }),
	comments: many(comment),
	votes: many(vote)
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
	author: one(user, { fields: [comment.authorId], references: [user.id] }),
	post: one(post, { fields: [comment.postId], references: [post.id] }),
	votes: many(vote),
	// Handle parent-child relationship for nested comments
	// This is a self-relation
	parent: one(comment, {
		fields: [comment.parentId],
		references: [comment.id],
		relationName: "childComments"
	}),
	children: many(comment, { relationName: "childComments" })
}));

export const voteRelations = relations(vote, ({ one }) => ({
	user: one(user, { fields: [vote.userId], references: [user.id] }),
	post: one(post, {
		fields: [vote.postId],
		references: [post.id],
		relationName: "postVotes"
	}),
	comment: one(comment, {
		fields: [vote.commentId],
		references: [comment.id],
		relationName: "commentVotes"
	})
}));