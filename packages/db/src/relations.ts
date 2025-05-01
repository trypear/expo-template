import { relations } from "drizzle-orm";
import { account, fact, factQueue, session, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	facts: many(fact)
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const SessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const factRelations = relations(fact, ({ one, many }) => ({
	createdBy: one(user, { fields: [fact.createdBy], references: [user.id] }),
	factQueues: many(factQueue)
}));

export const factQueueRelations = relations(factQueue, ({ one }) => ({
	fact: one(fact, { fields: [factQueue.factId], references: [fact.id] })
}));