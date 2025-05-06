import { uniqueIndex, index, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createTable, fk, lower } from "./utils";

// Edit the type to add user roles for RBAC
export const USER_ROLES = ["user", "admin"] as const;

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
    userRole: varchar({ enum: USER_ROLES }).default("user"),
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
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
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
  userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
  expires: timestamp({ mode: "date", withTimezone: true }).notNull(),
},
  (t) => [
    index("session_token_idx").on(t.sessionToken)
  ]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
// *****_____*****_____*****_____*****_____*****_____*****_____

// University Announcements App Schema

export const category = createTable("category", {
  name: varchar({ length: 100 }).notNull(),
  color: varchar({ length: 20 }).notNull(),
});

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

export const author = createTable("author", {
  name: varchar({ length: 100 }).notNull(),
  role: varchar({ length: 100 }).notNull(),
  department: varchar({ length: 100 }).notNull(),
  avatar: varchar({ length: 255 }),
});

export type Author = typeof author.$inferSelect;
export type NewAuthor = typeof author.$inferInsert;

export const announcement = createTable("announcement", {
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  date: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
  categoryId: fk("category_id", () => category, {
    onDelete: "cascade",
  }).notNull(),
  authorId: fk("author_id", () => author, { onDelete: "cascade" }).notNull(),
  isImportant: boolean().notNull().default(false),
});

export type Announcement = typeof announcement.$inferSelect;
export type NewAnnouncement = typeof announcement.$inferInsert;

export const attachment = createTable("attachment", {
  announcementId: fk("announcement_id", () => announcement, {
    onDelete: "cascade",
  }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 20 }).notNull(),
});

export type Attachment = typeof attachment.$inferSelect;
export type NewAttachment = typeof attachment.$inferInsert;

export const userBookmark = createTable(
  "user_bookmark",
  {
    userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
    announcementId: fk("announcement_id", () => announcement, {
      onDelete: "cascade",
    }).notNull(),
  },
  (t) => [
    uniqueIndex("user_bookmark_unique_idx").on(t.userId, t.announcementId),
  ],
);

export type UserBookmark = typeof userBookmark.$inferSelect;
export type NewUserBookmark = typeof userBookmark.$inferInsert;