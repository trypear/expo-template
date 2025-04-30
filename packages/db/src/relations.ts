import { relations } from "drizzle-orm";
import { account, project, session, transaction, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	projects: many(project),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
	user: one(user, { fields: [project.userId], references: [user.id] }),
	transactions: many(transaction),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
	project: one(project, { fields: [transaction.projectId], references: [project.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const SessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));