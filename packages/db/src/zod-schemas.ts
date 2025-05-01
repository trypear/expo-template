import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { note } from "./schema";

// Keeping this for future use when needed
const _commonOmitFields = {
	id: true,
	createdAt: true,
	updatedAt: true,
} as const;

// Note schemas
export const insertNoteSchema = createInsertSchema(note, {
	title: z.string().min(1).max(255),
	content: z.string().optional(),
});

export const updateNoteSchema = insertNoteSchema.partial();

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;