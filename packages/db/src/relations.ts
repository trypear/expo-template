import { relations } from "drizzle-orm";
import { account, Budget, project, session, transaction, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	projects: many(project),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
	user: one(user, { fields: [project.userId], references: [user.id] }),
	budgets: many(Budget),
	transactions: many(transaction),
}));

export const BudgetRelations = relations(Budget, ({ one }) => ({
	project: one(project, { fields: [Budget.projectId], references: [project.id] }),
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