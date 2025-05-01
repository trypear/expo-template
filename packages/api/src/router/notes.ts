import { TRPCError } from "@trpc/server";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { db } from "@acme/db/client";
import { note } from "@acme/db/schema";
import { insertNoteSchema, updateNoteSchema } from "@acme/db";
import { eq, and, desc, sql } from "drizzle-orm";

import { protectedProcedure } from "../trpc";

export const notesRouter = {
	// Get all notes for the current user
	getNotes: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const notes = await db.query.note.findMany({
			where: eq(note.userId, userId),
			orderBy: [desc(note.updatedAt)],
		});

		return notes;
	}),

	// Get a single note by ID
	getNote: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const noteItem = await db.query.note.findFirst({
				where: and(
					eq(note.id, input.id),
					eq(note.userId, userId)
				),
			});

			if (!noteItem) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found",
				});
			}

			return noteItem;
		}),

	// Create a new note
	createNote: protectedProcedure
		.input(insertNoteSchema.omit({ userId: true }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const result = await db.insert(note).values({
				...input,
				userId,
			}).returning();

			return result[0];
		}),

	// Update an existing note
	updateNote: protectedProcedure
		.input(z.object({
			id: z.string(),
			data: updateNoteSchema,
		}))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Check if note exists and belongs to user
			const existingNote = await db.query.note.findFirst({
				where: and(
					eq(note.id, input.id),
					eq(note.userId, userId)
				),
			});

			if (!existingNote) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found or you don't have permission to update it",
				});
			}

			// Convert partial data to a properly typed object
			const updateData: Record<string, unknown> = {};
			if (input.data.title !== undefined) updateData.title = input.data.title;
			if (input.data.content !== undefined) updateData.content = input.data.content;

			const result = await db.update(note)
				.set({
					...updateData,
					updatedAt: sql`now()`,
				})
				.where(and(
					eq(note.id, input.id),
					eq(note.userId, userId)
				))
				.returning();

			return result[0];
		}),

	// Delete a note
	deleteNote: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Check if note exists and belongs to user
			const existingNote = await db.query.note.findFirst({
				where: and(
					eq(note.id, input.id),
					eq(note.userId, userId)
				),
			});

			if (!existingNote) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Note not found or you don't have permission to delete it",
				});
			}

			await db.delete(note)
				.where(and(
					eq(note.id, input.id),
					eq(note.userId, userId)
				));

			return { success: true };
		}),
} satisfies TRPCRouterRecord;