import { relations } from "drizzle-orm";
import {
	account,
	session,
	user,
	category,
	author,
	announcement,
	attachment,
	userBookmark
} from "./schema";

// Existing relations
export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	bookmarks: many(userBookmark)
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// New relations for university announcements app
export const categoryRelations = relations(category, ({ many }) => ({
	announcements: many(announcement)
}));

export const authorRelations = relations(author, ({ many }) => ({
	announcements: many(announcement)
}));

export const announcementRelations = relations(announcement, ({ one, many }) => ({
	category: one(category, { fields: [announcement.categoryId], references: [category.id] }),
	author: one(author, { fields: [announcement.authorId], references: [author.id] }),
	attachments: many(attachment),
	bookmarks: many(userBookmark)
}));

export const attachmentRelations = relations(attachment, ({ one }) => ({
	announcement: one(announcement, { fields: [attachment.announcementId], references: [announcement.id] })
}));

export const userBookmarkRelations = relations(userBookmark, ({ one }) => ({
	user: one(user, { fields: [userBookmark.userId], references: [user.id] }),
	announcement: one(announcement, { fields: [userBookmark.announcementId], references: [announcement.id] })
}));