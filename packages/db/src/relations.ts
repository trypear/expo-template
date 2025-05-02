import { relations } from "drizzle-orm";
import { account, session, user, announcement, comment, helpRequest } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	createdAnnouncements: many(announcement, { relationName: "createdAnnouncements" }),
	comments: many(comment),
	helpRequests: many(helpRequest)
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const SessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// University Announcement App Relations
export const announcementRelations = relations(announcement, ({ one, many }) => ({
	createdBy: one(user, { fields: [announcement.createdById], references: [user.id] }),
	comments: many(comment)
}));

export const commentRelations = relations(comment, ({ one }) => ({
	user: one(user, { fields: [comment.userId], references: [user.id] }),
	announcement: one(announcement, { fields: [comment.announcementId], references: [announcement.id] })
}));

export const helpRequestRelations = relations(helpRequest, ({ one }) => ({
	createdBy: one(user, { fields: [helpRequest.createdById], references: [user.id] })
}));