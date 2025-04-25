import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Project, Budget, Transaction } from "./schema";

const commonOmitFields = {
	id: true,
	createdAt: true,
	updatedAt: true,
} as const;

export const CreateProjectSchema = createInsertSchema(Project, {
	name: z.string().min(1).max(255),
	description: z.string().optional(),
}).omit({
	...commonOmitFields,
	userId: true,
});

export const CreateBudgetSchema = createInsertSchema(Budget, {
	amount: z.number().positive(),
	startDate: z.date(),
	endDate: z.date().optional(),
	name: z.string().min(1).max(255),
	description: z.string().optional(),
}).omit({
	...commonOmitFields,
	projectId: true,
});

export const CreateTransactionSchema = createInsertSchema(Transaction, {
	type: z.enum(["INCOMING", "OUTGOING"]),
	amount: z.number().positive(),
	description: z.string().optional(),
	date: z.date(),
}).omit({
	...commonOmitFields,
	projectId: true,
});