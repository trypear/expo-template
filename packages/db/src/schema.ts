import { uniqueIndex, index, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createTable, fk, lower } from "./utils";

export const user = createTable(
  "user",
  {
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp({ mode: "date", withTimezone: true }),
    image: varchar({ length: 255 }),
    username: varchar({ length: 50 }).unique(),
    karma: integer().default(0),
  },
  (t) => [
    uniqueIndex("user_email_idx").on(lower(t.email))
  ]
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const account = createTable(
  "account",
  {
    userId: fk("userId", () => user, { onDelete: "cascade" }),
    type: varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: varchar({ length: 255 }),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  (t) => [
    index("account_user_id_idx").on(t.userId)
  ],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const session = createTable("session", {
  sessionToken: varchar({ length: 255 }).notNull(),
  userId: fk("userId", () => user, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
},
  (t) => [
    index("session_token_idx").on(t.sessionToken)
  ]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

// Reddit clone tables

export const community = createTable(
  "community",
  {
    name: varchar({ length: 50 }).notNull().unique(),
    description: text(),
    creatorId: fk("creatorId", () => user, { onDelete: "set null" }),
    isPrivate: boolean().default(false),
    memberCount: integer().default(0),
    bannerImage: varchar({ length: 255 }),
    avatarImage: varchar({ length: 255 }),
  },
  (t) => [
    index("community_name_idx").on(t.name)
  ]
);

export type Community = typeof community.$inferSelect;
export type NewCommunity = typeof community.$inferInsert;

export const communityMember = createTable(
  "community_member",
  {
    communityId: fk("communityId", () => community, { onDelete: "cascade" }),
    userId: fk("userId", () => user, { onDelete: "cascade" }),
    isModerator: boolean().default(false),
  },
  (t) => [
    uniqueIndex("community_member_unique_idx").on(t.communityId, t.userId)
  ]
);

export type CommunityMember = typeof communityMember.$inferSelect;
export type NewCommunityMember = typeof communityMember.$inferInsert;

export const post = createTable(
  "post",
  {
    title: varchar({ length: 300 }).notNull(),
    content: text(),
    authorId: fk("authorId", () => user, { onDelete: "cascade" }),
    communityId: fk("communityId", () => community, { onDelete: "cascade" }),
    upvotes: integer().default(0),
    downvotes: integer().default(0),
    commentCount: integer().default(0),
    imageUrl: varchar({ length: 255 }),
    linkUrl: varchar({ length: 255 }),
    isLocked: boolean().default(false),
    isPinned: boolean().default(false),
  },
  (t) => [
    index("post_author_idx").on(t.authorId),
    index("post_community_idx").on(t.communityId)
  ]
);

export type Post = typeof post.$inferSelect;
export type NewPost = typeof post.$inferInsert;

// Declare comment table first without the self-reference
export const comment = createTable(
  "comment",
  {
    content: text().notNull(),
    authorId: fk("authorId", () => user, { onDelete: "cascade" }),
    postId: fk("postId", () => post, { onDelete: "cascade" }),
    parentId: varchar({ length: 255 }),
    upvotes: integer().default(0),
    downvotes: integer().default(0),
    isDeleted: boolean().default(false),
  },
  (t) => [
    index("comment_author_idx").on(t.authorId),
    index("comment_post_idx").on(t.postId),
    index("comment_parent_idx").on(t.parentId)
  ]
);

export type Comment = typeof comment.$inferSelect;
export type NewComment = typeof comment.$inferInsert;

export const vote = createTable(
  "vote",
  {
    userId: fk("userId", () => user, { onDelete: "cascade" }),
    postId: fk("postId", () => post, { onDelete: "cascade" }),
    commentId: fk("commentId", () => comment, { onDelete: "cascade" }),
    value: integer().notNull().$type<-1 | 1>(), // -1 for downvote, 1 for upvote
  },
  (t) => [
    uniqueIndex("vote_user_post_idx").on(t.userId, t.postId),
    uniqueIndex("vote_user_comment_idx").on(t.userId, t.commentId)
  ]
);

export type Vote = typeof vote.$inferSelect;
export type NewVote = typeof vote.$inferInsert;
