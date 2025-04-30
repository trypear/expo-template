import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { project, transaction } from "./schema";

const commonOmitFields = {
	id: true,
	createdAt: true,
	updatedAt: true,
} as const;

export const createProjectSchema = createInsertSchema(project, {
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	budget: z.number().positive(),
})
	.omit({
		...commonOmitFields,
		userId: true,
	})
	// transforming as the database needs numeric to be a string
	.transform((x) => ({ ...x, budget: x.budget.toString() }));

export const createTransactionSchema = createInsertSchema(transaction, {
	amount: z.number(),
	description: z.string().optional(),
	date: z.date(),
}).omit({
	...commonOmitFields,
	projectId: true,
});
