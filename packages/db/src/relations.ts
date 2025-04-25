import { relations } from "drizzle-orm";
import { Account, Budget, Project, Session, Transaction, User } from "./schema";

export const UserRelations = relations(User, ({ many }) => ({
	accounts: many(Account),
	projects: many(Project),
}));

export const ProjectRelations = relations(Project, ({ one, many }) => ({
	user: one(User, { fields: [Project.userId], references: [User.id] }),
	budgets: many(Budget),
	transactions: many(Transaction),
}));

export const BudgetRelations = relations(Budget, ({ one }) => ({
	project: one(Project, { fields: [Budget.projectId], references: [Project.id] }),
}));

export const TransactionRelations = relations(Transaction, ({ one }) => ({
	project: one(Project, { fields: [Transaction.projectId], references: [Project.id] }),
}));

export const AccountRelations = relations(Account, ({ one }) => ({
	user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const SessionRelations = relations(Session, ({ one }) => ({
	user: one(User, { fields: [Session.userId], references: [User.id] }),
}));