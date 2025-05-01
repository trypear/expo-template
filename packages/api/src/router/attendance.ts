import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import {
	attendance,
	course,
	student,
	studentCourse,
	teacher,
	timetable,
	user,
} from "@acme/db";

export const attendanceRouter = createTRPCRouter({
	// Get courses for a student
	getStudentCourses: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Check if user is a student
		const studentRecord = await ctx.db.query.student.findFirst({
			where: eq(student.userId, userId),
		});

		if (!studentRecord) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "User is not a student",
			});
		}

		// Get courses the student is enrolled in
		const enrolledCourses = await ctx.db
			.select({
				id: course.id,
				name: course.name,
				code: course.code,
				description: course.description,
			})
			.from(course)
			.innerJoin(
				studentCourse,
				eq(studentCourse.courseId, course.id)
			)
			.where(eq(studentCourse.studentId, studentRecord.id));

		return enrolledCourses;
	}),

	// Get courses for a teacher
	getTeacherCourses: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Check if user is a teacher
		const teacherRecord = await ctx.db.query.teacher.findFirst({
			where: eq(teacher.userId, userId),
		});

		if (!teacherRecord) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "User is not a teacher",
			});
		}

		// Get courses the teacher is teaching
		const teachingCourses = await ctx.db
			.select({
				id: course.id,
				name: course.name,
				code: course.code,
				description: course.description,
			})
			.from(course)
			.innerJoin(
				timetable,
				eq(timetable.courseId, course.id)
			)
			.where(eq(timetable.teacherId, teacherRecord.id))
			.groupBy(course.id, course.name, course.code, course.description);

		return teachingCourses;
	}),

	// Get timetable for a course
	getCourseTimetable: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const courseTimetable = await ctx.db
				.select({
					id: timetable.id,
					dayOfWeek: timetable.dayOfWeek,
					startTime: timetable.startTime,
					endTime: timetable.endTime,
					location: timetable.location,
					teacherName: user.name,
				})
				.from(timetable)
				.leftJoin(
					teacher,
					eq(timetable.teacherId, teacher.id)
				)
				.leftJoin(
					user,
					eq(teacher.userId, user.id)
				)
				.where(eq(timetable.courseId, input.courseId));

			return courseTimetable;
		}),

	// Get attendance for a student
	getStudentAttendance: protectedProcedure
		.input(
			z.object({
				courseId: z.string().optional(),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Check if user is a student
			const studentRecord = await ctx.db.query.student.findFirst({
				where: eq(student.userId, userId),
			});

			if (!studentRecord) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a student",
				});
			}

			// Build the where conditions
			const whereConditions = [eq(attendance.studentId, studentRecord.id)];

			if (input.courseId) {
				whereConditions.push(eq(timetable.courseId, input.courseId));
			}

			if (input.startDate) {
				whereConditions.push(
					sql`${attendance.date} >= ${input.startDate.toISOString().split('T')[0]}`
				);
			}

			if (input.endDate) {
				whereConditions.push(
					sql`${attendance.date} <= ${input.endDate.toISOString().split('T')[0]}`
				);
			}

			// Execute the query
			const attendanceRecords = await ctx.db
				.select({
					id: attendance.id,
					date: attendance.date,
					status: attendance.status,
					notes: attendance.notes,
					courseName: course.name,
					courseCode: course.code,
					startTime: timetable.startTime,
					endTime: timetable.endTime,
					location: timetable.location,
				})
				.from(attendance)
				.innerJoin(
					timetable,
					eq(attendance.timetableId, timetable.id)
				)
				.innerJoin(
					course,
					eq(timetable.courseId, course.id)
				)
				.where(and(...whereConditions))
				.orderBy(attendance.date);

			return attendanceRecords;
		}),

	// Record attendance (for teachers)
	recordAttendance: protectedProcedure
		.input(
			z.object({
				timetableId: z.string(),
				date: z.date(),
				studentId: z.string(),
				status: z.enum(["present", "absent", "late", "excused"]),
				notes: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Check if user is a teacher
			const teacherRecord = await ctx.db.query.teacher.findFirst({
				where: eq(teacher.userId, userId),
			});

			if (!teacherRecord) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only teachers can record attendance",
				});
			}

			// Check if the teacher is assigned to this timetable
			const timetableRecord = await ctx.db.query.timetable.findFirst({
				where: eq(timetable.id, input.timetableId),
			});

			if (!timetableRecord || timetableRecord.teacherId !== teacherRecord.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to record attendance for this class",
				});
			}

			// Check if the student is enrolled in this course
			const studentEnrolled = await ctx.db.query.studentCourse.findFirst({
				where: and(
					eq(studentCourse.studentId, input.studentId),
					eq(studentCourse.courseId, timetableRecord.courseId)
				),
			});

			if (!studentEnrolled) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Student is not enrolled in this course",
				});
			}

			// Check if attendance record already exists
			const dateStr = input.date.toISOString().split('T')[0];
			const existingRecord = await ctx.db.query.attendance.findFirst({
				where: and(
					eq(attendance.studentId, input.studentId),
					eq(attendance.timetableId, input.timetableId),
					sql`${attendance.date} = ${dateStr}`
				),
			});

			if (existingRecord) {
				// Update existing record
				await ctx.db
					.update(attendance)
					.set({
						status: input.status,
						notes: input.notes,
						recordedBy: userId,
						recordedAt: new Date(),
					})
					.where(eq(attendance.id, existingRecord.id));

				return { success: true, message: "Attendance updated successfully" };
			} else {
				// Create new record
				const dateStr = input.date.toISOString().split('T')[0];
				await ctx.db.execute(
					sql`INSERT INTO attendance (student_id, timetable_id, date, status, notes, recorded_by)
				      VALUES (${input.studentId}, ${input.timetableId}, ${dateStr}, ${input.status}, ${input.notes ?? null}, ${userId})`
				);

				return { success: true, message: "Attendance recorded successfully" };
			}
		}),

	// Create a new timetable entry (for teachers)
	createTimetable: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				dayOfWeek: z.number().min(0).max(6),
				startTime: z.string(),
				endTime: z.string(),
				location: z.string().optional(),
				recurrenceRule: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Check if user is a teacher
			const teacherRecord = await ctx.db.query.teacher.findFirst({
				where: eq(teacher.userId, userId),
			});

			if (!teacherRecord) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only teachers can create timetable entries",
				});
			}

			// Create new timetable entry
			await ctx.db.insert(timetable).values({
				courseId: input.courseId,
				teacherId: teacherRecord.id,
				dayOfWeek: input.dayOfWeek,
				startTime: input.startTime,
				endTime: input.endTime,
				location: input.location,
				recurrenceRule: input.recurrenceRule,
			});

			return { success: true, message: "Timetable entry created successfully" };
		}),

	// Update a timetable entry (for teachers)
	updateTimetable: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				dayOfWeek: z.number().min(0).max(6).optional(),
				startTime: z.string().optional(),
				endTime: z.string().optional(),
				location: z.string().optional(),
				recurrenceRule: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Check if user is a teacher
			const teacherRecord = await ctx.db.query.teacher.findFirst({
				where: eq(teacher.userId, userId),
			});

			if (!teacherRecord) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only teachers can update timetable entries",
				});
			}

			// Check if the teacher is assigned to this timetable
			const timetableRecord = await ctx.db.query.timetable.findFirst({
				where: eq(timetable.id, input.id),
			});

			if (!timetableRecord || timetableRecord.teacherId !== teacherRecord.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to update this timetable entry",
				});
			}

			// Update timetable entry
			await ctx.db
				.update(timetable)
				.set({
					dayOfWeek: input.dayOfWeek ?? timetableRecord.dayOfWeek,
					startTime: input.startTime ?? timetableRecord.startTime,
					endTime: input.endTime ?? timetableRecord.endTime,
					location: input.location ?? timetableRecord.location,
					recurrenceRule: input.recurrenceRule ?? timetableRecord.recurrenceRule,
				})
				.where(eq(timetable.id, input.id));

			return { success: true, message: "Timetable entry updated successfully" };
		}),
});