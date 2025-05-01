import { uniqueIndex, index, varchar, text, integer, timestamp, date, time } from "drizzle-orm/pg-core";
import { createTable, fk, lower } from "./utils";

export const user = createTable(
  "user",
  {
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp({ mode: "date", withTimezone: true }),
    image: varchar({ length: 255 }),
    role: varchar({ length: 20 }).$type<"student" | "teacher" | "admin">().default("student"),
  },
  (t) => [
    uniqueIndex("user_email_idx").on(lower(t.email))
  ]
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const course = createTable(
  "course",
  {
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    code: varchar({ length: 50 }).notNull(),
  }
);

export type Course = typeof course.$inferSelect;
export type NewCourse = typeof course.$inferInsert;

export const teacher = createTable(
  "teacher",
  {
    userId: fk("userId", () => user, { onDelete: "cascade" }),
    department: varchar({ length: 255 }),
  },
  (t) => [
    uniqueIndex("teacher_user_id_idx").on(t.userId)
  ]
);

export type Teacher = typeof teacher.$inferSelect;
export type NewTeacher = typeof teacher.$inferInsert;

export const student = createTable(
  "student",
  {
    userId: fk("userId", () => user, { onDelete: "cascade" }),
    studentId: varchar({ length: 50 }).notNull(),
    enrollmentYear: integer(),
  },
  (t) => [
    uniqueIndex("student_user_id_idx").on(t.userId),
    uniqueIndex("student_id_idx").on(t.studentId)
  ]
);

export type Student = typeof student.$inferSelect;
export type NewStudent = typeof student.$inferInsert;

export const account = createTable(
  "account",
  {
    userId: fk("userId", () => user, { onDelete: "cascade" }),
    type: varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: varchar({ length: 255 }),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  (t) => [
    index("account_user_id_idx").on(t.userId)
  ],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const session = createTable("session", {
  sessionToken: varchar({ length: 255 }).notNull(),
  userId: fk("userId", () => user, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
},
  (t) => [
    index("session_token_idx").on(t.sessionToken)
  ]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export const timetable = createTable(
  "timetable",
  {
    courseId: fk("courseId", () => course, { onDelete: "cascade" }),
    teacherId: fk("teacherId", () => teacher, { onDelete: "set null" }),
    dayOfWeek: integer().notNull(), // 0 = Sunday, 1 = Monday, etc.
    startTime: time().notNull(),
    endTime: time().notNull(),
    location: varchar({ length: 255 }),
    recurrenceRule: varchar({ length: 255 }), // For handling exceptions, holidays, etc.
  },
  (t) => [
    index("timetable_course_id_idx").on(t.courseId),
    index("timetable_teacher_id_idx").on(t.teacherId)
  ]
);

export type Timetable = typeof timetable.$inferSelect;
export type NewTimetable = typeof timetable.$inferInsert;

export const studentCourse = createTable(
  "student_course",
  {
    studentId: fk("studentId", () => student, { onDelete: "cascade" }),
    courseId: fk("courseId", () => course, { onDelete: "cascade" }),
    enrolledAt: timestamp({ mode: "date", withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("student_course_unique_idx").on(t.studentId, t.courseId),
    index("student_course_student_id_idx").on(t.studentId),
    index("student_course_course_id_idx").on(t.courseId)
  ]
);

export type StudentCourse = typeof studentCourse.$inferSelect;
export type NewStudentCourse = typeof studentCourse.$inferInsert;

export const attendance = createTable(
  "attendance",
  {
    studentId: fk("studentId", () => student, { onDelete: "cascade" }),
    timetableId: fk("timetableId", () => timetable, { onDelete: "cascade" }),
    date: date().notNull(),
    status: varchar({ length: 20 }).$type<"present" | "absent" | "late" | "excused">().default("absent"),
    notes: text(),
    recordedBy: fk("recordedBy", () => user, { onDelete: "set null" }),
    recordedAt: timestamp({ mode: "date", withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("attendance_unique_idx").on(t.studentId, t.timetableId, t.date),
    index("attendance_student_id_idx").on(t.studentId),
    index("attendance_timetable_id_idx").on(t.timetableId),
    index("attendance_date_idx").on(t.date)
  ]
);

export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;

// Mock data for user ID: 79db4c0b-7ae6-4173-af02-d0a63e357907
// This can be used for testing the attendance tracking app

/*
// Create test courses
INSERT INTO course (name, code, description) VALUES
('Introduction to Computer Science', 'CS101', 'Fundamentals of computer science and programming'),
('Data Structures and Algorithms', 'CS201', 'Advanced data structures and algorithm design'),
('Web Development', 'CS301', 'Modern web development techniques and frameworks'),
('Mobile App Development', 'CS401', 'Building native and cross-platform mobile applications');

// Create teacher record for the user
INSERT INTO teacher (user_id, department) VALUES
('79db4c0b-7ae6-4173-af02-d0a63e357907', 'Computer Science');

// Create student record for the user (for testing both views)
INSERT INTO student (user_id, student_id, enrollment_year) VALUES
('79db4c0b-7ae6-4173-af02-d0a63e357907', 'ST12345', 2023);

// Create timetable entries (assuming course IDs 1-4 and teacher ID 1)
INSERT INTO timetable (course_id, teacher_id, day_of_week, start_time, end_time, location) VALUES
(1, 1, 1, '09:00', '10:30', 'Room 101'),
(2, 1, 2, '11:00', '12:30', 'Room 202'),
(3, 1, 3, '14:00', '15:30', 'Lab 301'),
(4, 1, 4, '16:00', '17:30', 'Auditorium');

// Enroll the student in all courses (assuming student ID 1 and course IDs 1-4)
INSERT INTO student_course (student_id, course_id, enrolled_at) VALUES
(1, 1, CURRENT_TIMESTAMP),
(1, 2, CURRENT_TIMESTAMP),
(1, 3, CURRENT_TIMESTAMP),
(1, 4, CURRENT_TIMESTAMP);

// Create attendance records for the past 4 weeks (assuming student ID 1 and timetable IDs 1-4)
// For each timetable entry, create 4 attendance records with different statuses
INSERT INTO attendance (student_id, timetable_id, date, status, notes, recorded_by) VALUES
(1, 1, '2025-04-07', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 1, '2025-04-14', 'absent', 'Student was absent', '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 1, '2025-04-21', 'late', 'Student arrived 10 minutes late', '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 1, '2025-04-28', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),

(1, 2, '2025-04-08', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 2, '2025-04-15', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 2, '2025-04-22', 'absent', 'Student was absent', '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 2, '2025-04-29', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),

(1, 3, '2025-04-09', 'late', 'Student arrived 5 minutes late', '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 3, '2025-04-16', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 3, '2025-04-23', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 3, '2025-04-30', 'excused', 'Medical appointment', '79db4c0b-7ae6-4173-af02-d0a63e357907'),

(1, 4, '2025-04-10', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 4, '2025-04-17', 'excused', 'Family emergency', '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 4, '2025-04-24', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907'),
(1, 4, '2025-05-01', 'present', NULL, '79db4c0b-7ae6-4173-af02-d0a63e357907');
*/
