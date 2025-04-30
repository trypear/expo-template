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
	startDate: z.date(),
	endDate: z.date(),
})
	.omit({
		...commonOmitFields,
		userId: true,
	})
	// transforming as the database needs numeric to be a string
	// and ensuring date fields are properly handled
	.transform((x) => ({
		...x,
		budget: x.budget.toString(),
		// Ensure date fields are Date objects
		// startDate: new Date(x.startDate),
		// ...(x.endDate ? { endDate: new Date(x.endDate) } : {})
	}));

export const createTransactionSchema = createInsertSchema(transaction, {
	amount: z.number(),
	description: z.string().optional(),
	date: z.date(),
}).omit({
	...commonOmitFields,
	projectId: true,
});
