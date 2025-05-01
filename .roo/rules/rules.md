
You are using a monorepo and dev is running.
You are developing a mobile app and will make changes under apps/mobile-app.
Import using the @acme/x convention and do not change the ts config.
EXAMPLE MOBILE APP TRPC QUERY:
<code>
import { useQuery } from "@tanstack/react-query";

const { data: projects, isLoading } = useQuery(
	trpc.budget.getProjectSummary.queryOptions({
		projectId,
	}),
);
</code>

EXAMPLE MUTATION:
<code>
import { useMutation } from "@tanstack/react-query";

const updateMutation = useMutation(
	trpc.budget.updateProject.mutationOptions({
	onSuccess: () => {
		void queryClient.invalidateQueries(
			trpc.budget.getProjects.queryOptions(),
		);
		void queryClient.invalidateQueries(
			trpc.budget.getProjectSummary.queryOptions({
				projectId,
			}),
		);
		router.back();
		},
	}),
);

updateMutation.mutate({
	id: projectId,
	data: {
		...data,
		startDate: startDate,
		endDate: endDate,
	},
});
</code>

You MUST INVALIDATE related queries after running a mutation! This will make the dependent content refresh.

When making database queries, use:
<code>
db.select().from(user).innerJoin(account, eqi(account.userId, user.id)).where(eqi(user.id, userIdInput))
</code>
As this throws errors when you might be comparing IDs that will never match.


When you get a request from the user, follow these steps:
- Plan out what you need to do, with requirements
- Start by editing the database schema, adding in all of the tables (CALL new_task AND USE THE database-nerd MODE )
- Add TRPC endpoints
- Edit the mobile app, calling TRPC endpoints
- Make sure you follow my instructions on adding trpc endpoints
- Make sure you you invalidate the right queries
- Generate mock data in the SQL database

When using Drizzle ORM for database operations:
- For string searches, use the 'like' function: like(column, pattern)
- For array operations, use 'inArray': inArray(column, values)
- Import these functions explicitly from '@acme/db'

If you ever get stuck with something potentially being undefined, do:
import { assert } from "@acme/utils";

assert(!!value, "value should be defined")

WHENEVER YOU ARE DOING A DATABASE OPERATION, CALL THE database-nerd TO DO IT IN A new_task!
## File: packages/db/src/schema.ts
```
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

```

## File: packages/db/package.json
```
{
  "name": "@acme/db",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./src/index.ts"
    },
    "./client": {
      "types": "./dist/client.d.ts",
      "default": "./src/client.ts"
    },
    "./schema": {
      "types": "./dist/schema.d.ts",
      "default": "./src/schema.ts"
    }
  },
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "dev": "tsc",
    "format": "prettier --check . --ignore-path ../../.gitignore",
    "lint": "eslint",
    "push": "pnpm with-env drizzle-kit push",
    "generate": "pnpm with-env drizzle-kit generate",
    "migrate": "pnpm with-env drizzle-kit migrate",
    "studio": "pnpm with-env drizzle-kit studio",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false",
    "with-env": "dotenv -e ../../.env --"
  },
  "dependencies": {
    "@acme/utils": "workspace:^",
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.41.0",
    "drizzle-zod": "^0.7.0",
    "pg": "^8.14.1",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/tsconfig": "workspace:*",
    "@types/pg": "^8.11.13",
    "dotenv-cli": "^8.0.0",
    "drizzle-kit": "^0.30.5",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@acme/prettier-config"
}

```

## File: packages/db/src/relations.ts
```
import { relations } from "drizzle-orm";
import { account, session, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session)
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const SessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));
```

## File: packages/api/package.json
```
{
  "name": "@acme/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./src/index.ts"
    }
  },
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "dev": "tsc",
    "format": "prettier --check . --ignore-path ../../.gitignore",
    "lint": "eslint",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false"
  },
  "dependencies": {
    "@acme/auth": "workspace:*",
    "@acme/db": "workspace:*",
    "@acme/utils": "workspace:^",
    "@acme/validators": "workspace:*",
    "@trpc/server": "catalog:",
    "superjson": "2.2.2",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/tsconfig": "workspace:*",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@acme/prettier-config"
}

```

## File: packages/api/src/root.ts
```
import { authRouter } from "./router/auth";
import { testRouter } from "./router/test";
import { attendanceRouter } from "./router/attendance";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  test: testRouter,
  attendance: attendanceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

```

## File: packages/api/src/router/test.ts
```
import type { TRPCRouterRecord } from "@trpc/server";
import { publicProcedure } from "../trpc";


export const testRouter = {
	// Project endpoints
	getHello: publicProcedure.query(() => {
		return {
			hello: true,
		}
	}),
} satisfies TRPCRouterRecord;
```

## File: packages/api/src/router/auth.ts
```
import type { TRPCRouterRecord } from "@trpc/server";

import { invalidateSessionToken } from "@acme/auth";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
  signOut: protectedProcedure.mutation(async (opts) => {
    if (!opts.ctx.token) {
      return { success: false };
    }
    await invalidateSessionToken(opts.ctx.token);
    return { success: true };
  }),
} satisfies TRPCRouterRecord;

```

## File: packages/utils/src/index.ts
```
export const name = "utils";

class AssertionError extends Error {
	constructor(message: string) {
		super(message);
		// Adding the stack info to error.
		// Inspired by: https://blog.dennisokeeffe.com/blog/2020-08-07-error-tracing-with-sentry-and-es6-classes
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AssertionError);
		} else {
			this.stack = new Error(message).stack;
		}
		this.name = "AssertionError";
	}
}

/**
 * Use this function to assert things as being true (and provide a nice error message)
 * @param condition to assert true
 * @param message the error message that appears when the condition is not true
 */
export function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new AssertionError(message);
	}
};

/**
 * Always returns a value, otherwise throws an error
 */
export const parseFirstEl = <T extends object>(x: T[]) => {
	const y = x[0];
	assert(!!y, "No first element found :(");

	return y;
}

/**
 * Returns first element or null
 */
export const getFirstEl = <T extends object>(x: T[] | null | undefined) => {
	return x?.[0] ?? null;
};
```

## File: apps/mobile-app/app/_layout.tsx
```
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import "./styles.css";
import "react-native-reanimated";

import { AuthSplash } from "@/components/AuthSplash";
import { useUser } from "@/hooks/auth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TRPCProvider } from "@/providers/TRPCProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {
        console.error("splash screen load failed");
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TRPCProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View
          style={[
            styles.container,
            colorScheme === "dark"
              ? styles.darkContainer
              : styles.lightContainer,
          ]}
        >
          <RootLayoutContent />
        </View>
      </ThemeProvider>
    </TRPCProvider>
  );
}

function RootLayoutContent() {
  const user = useUser();

  if (user) {
    return (
      <>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    );
  }

  return <AuthSplash />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
});

```

## File: apps/mobile-app/package.json
```
{
  "name": "@acme/mobile-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "dev": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "test": "jest --watchAll",
    "lint": "expo lint"
  },
  "jest": {
    "preset": "jest-expo"
  },
  "dependencies": {
    "@acme/utils": "workspace:^",
    "@expo/metro-config": "^0.19.12",
    "@expo/vector-icons": "^14.0.2",
    "@react-native-community/datetimepicker": "^8.3.0",
    "@react-navigation/bottom-tabs": "^7.2.0",
    "@react-navigation/native": "^7.0.14",
    "@tanstack/react-query": "catalog:",
    "@trpc/client": "catalog:",
    "@trpc/server": "catalog:",
    "@trpc/tanstack-react-query": "catalog:",
    "date-fns": "^4.1.0",
    "expo": "~52.0.46",
    "expo-blur": "~14.0.3",
    "expo-constants": "~17.0.8",
    "expo-font": "~13.0.4",
    "expo-haptics": "~14.0.1",
    "expo-linear-gradient": "^14.0.2",
    "expo-linking": "~7.0.5",
    "expo-router": "~4.0.20",
    "expo-secure-store": "14.0.1",
    "expo-splash-screen": "~0.29.24",
    "expo-status-bar": "~2.0.1",
    "expo-symbols": "~0.2.2",
    "expo-system-ui": "~4.0.9",
    "expo-web-browser": "~14.0.2",
    "js-cookie": "^3.0.5",
    "nativewind": "~4.1.23",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native": "0.76.9",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-gifted-charts": "^1.4.60",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-reanimated": "~3.16.1",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-web": "~0.19.13",
    "react-native-webview": "13.12.5",
    "superjson": "2.2.2"
  },
  "devDependencies": {
    "@acme/api": "workspace:*",
    "@acme/eslint-config": "workspace:*",
    "@acme/prettier-config": "workspace:*",
    "@acme/tailwind-config": "workspace:*",
    "@acme/tsconfig": "workspace:*",
    "@babel/core": "^7.25.2",
    "@types/jest": "^29.5.12",
    "@types/js-cookie": "^3.0.6",
    "@types/react": "~18.3.12",
    "@types/react-test-renderer": "^18.3.0",
    "eslint": "catalog:",
    "jest": "^29.2.1",
    "jest-expo": "~52.0.6",
    "prettier": "catalog:",
    "react-test-renderer": "18.3.1",
    "tailwindcss": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@acme/prettier-config",
  "private": true
}

```

