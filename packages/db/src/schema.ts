import { uniqueIndex, index, varchar, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createTable, fk, lower } from "./utils";

export const userRoleEnum = pgEnum('user_role', ['admin', 'student', 'faculty']);
export const helpRequestStatusEnum = pgEnum('help_request_status', ['open', 'in_progress', 'resolved', 'closed']);

// *****_____*****_____*****_____*****_____*****_____*****_____
// DO NOT REMOVE OR RENAME, ONLY ADD TO THESE TABLES IF REQUIRED
// NEXT AUTH IS DEPENDENT ON THESE HAVING THESE GIVEN COLUMNS
// MAKE ALL EXTRA FIELDS OPTIONAL - OR HAVE DEFAULTS
// *****_____*****_____*****_____*****_____*****_____*****_____
export const user = createTable(
  "user",
  {
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp({ mode: "date", withTimezone: true }),
    image: varchar({ length: 255 }),
    userRole: userRoleEnum('student').notNull(),
  },
  (t) => [
    uniqueIndex("user_email_idx").on(lower(t.email))
  ]
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const account = createTable(
  "account",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }),
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
  userId: fk("user_id", () => user, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
},
  (t) => [
    index("session_token_idx").on(t.sessionToken)
  ]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
// *****_____*****_____*****_____*****_____*****_____*****_____

// University Announcement App Tables

export const announcement = createTable(
  "announcement",
  {
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    createdById: fk("created_by_id", () => user, { onDelete: "cascade" }).notNull(),
    isPinned: boolean().default(false).notNull(),
  },
  (t) => [
    index("announcement_created_by_idx").on(t.createdById),
  ]
);

export type Announcement = typeof announcement.$inferSelect;
export type NewAnnouncement = typeof announcement.$inferInsert;

export const comment = createTable(
  "comment",
  {
    content: text().notNull(),
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    announcementId: fk("announcement_id", () => announcement, { onDelete: "cascade" }).notNull(),
  },
  (t) => [
    index("comment_user_idx").on(t.userId),
    index("comment_announcement_idx").on(t.announcementId),
  ]
);

export type Comment = typeof comment.$inferSelect;
export type NewComment = typeof comment.$inferInsert;

export const helpRequest = createTable(
  "help_request",
  {
    title: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    requestStatus: helpRequestStatusEnum('open').notNull(),
    createdById: fk("created_by_id", () => user, { onDelete: "cascade" }).notNull(),
  },
  (t) => [
    index("help_request_created_by_idx").on(t.createdById),
    index("help_request_status_idx").on(t.requestStatus),
  ]
);

export type HelpRequest = typeof helpRequest.$inferSelect;
export type NewHelpRequest = typeof helpRequest.$inferInsert;