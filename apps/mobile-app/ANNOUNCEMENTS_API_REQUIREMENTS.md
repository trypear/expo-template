# University Announcements App - API Requirements

This document outlines the database schema and TRPC endpoint requirements for the University Announcements application.

## Database Schema Requirements

### Announcement Table

```sql
CREATE TABLE announcement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  category_id UUID NOT NULL REFERENCES category(id),
  author_id UUID NOT NULL REFERENCES author(id),
  is_important BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Category Table

```sql
CREATE TABLE category (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Author Table

```sql
CREATE TABLE author (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Attachment Table

```sql
CREATE TABLE attachment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcement(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### UserBookmark Table

```sql
CREATE TABLE user_bookmark (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES announcement(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, announcement_id)
);
```

## Drizzle Schema

Here's how the schema would look using Drizzle ORM:

```typescript
// In packages/db/src/schema.ts (add to existing schema)

import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable, fk } from "./utils";

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
```

## TRPC Endpoint Requirements

### Router Structure

```typescript
// In packages/api/src/router/announcement.ts

import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const announcementRouter = createTRPCRouter({
  // Queries and mutations will go here
});
```

### Required Queries

1. **getAnnouncements** - Get all announcements with optional filtering

   ```typescript
   getAnnouncements: publicProcedure
     .input(z.object({
       categoryId: z.string().uuid().optional(),
       onlyBookmarked: z.boolean().optional(),
       searchQuery: z.string().optional(),
     }))
     .query(async ({ ctx, input }) => {
       // Return filtered announcements
     }),
   ```

2. **getAnnouncementById** - Get a single announcement by ID

   ```typescript
   getAnnouncementById: publicProcedure
     .input(z.object({
       id: z.string().uuid(),
     }))
     .query(async ({ ctx, input }) => {
       // Return announcement with attachments
     }),
   ```

3. **getCategories** - Get all categories

   ```typescript
   getCategories: publicProcedure
     .query(async ({ ctx }) => {
       // Return all categories
     }),
   ```

4. **getAuthors** - Get all authors

   ```typescript
   getAuthors: publicProcedure
     .query(async ({ ctx }) => {
       // Return all authors
     }),
   ```

5. **getUserBookmarks** - Get user's bookmarked announcements
   ```typescript
   getUserBookmarks: protectedProcedure
     .query(async ({ ctx }) => {
       // Return user's bookmarked announcement IDs
     }),
   ```

### Required Mutations

1. **createAnnouncement** - Create a new announcement

   ```typescript
   createAnnouncement: protectedProcedure
     .input(z.object({
       title: z.string().min(1).max(255),
       content: z.string().min(1),
       categoryId: z.string().uuid(),
       authorId: z.string().uuid(),
       isImportant: z.boolean().default(false),
       attachments: z.array(z.object({
         name: z.string().min(1).max(255),
         url: z.string().min(1).max(255),
         type: z.enum(["pdf", "doc", "image", "other"]),
       })).optional(),
     }))
     .mutation(async ({ ctx, input }) => {
       // Create announcement and attachments
     }),
   ```

2. **updateAnnouncement** - Update an existing announcement

   ```typescript
   updateAnnouncement: protectedProcedure
     .input(z.object({
       id: z.string().uuid(),
       title: z.string().min(1).max(255).optional(),
       content: z.string().min(1).optional(),
       categoryId: z.string().uuid().optional(),
       authorId: z.string().uuid().optional(),
       isImportant: z.boolean().optional(),
     }))
     .mutation(async ({ ctx, input }) => {
       // Update announcement
     }),
   ```

3. **deleteAnnouncement** - Delete an announcement

   ```typescript
   deleteAnnouncement: protectedProcedure
     .input(z.object({
       id: z.string().uuid(),
     }))
     .mutation(async ({ ctx, input }) => {
       // Delete announcement
     }),
   ```

4. **toggleBookmark** - Toggle bookmark status for an announcement

   ```typescript
   toggleBookmark: protectedProcedure
     .input(z.object({
       announcementId: z.string().uuid(),
     }))
     .mutation(async ({ ctx, input }) => {
       // Toggle bookmark status
     }),
   ```

5. **addAttachment** - Add an attachment to an announcement

   ```typescript
   addAttachment: protectedProcedure
     .input(z.object({
       announcementId: z.string().uuid(),
       name: z.string().min(1).max(255),
       url: z.string().min(1).max(255),
       type: z.enum(["pdf", "doc", "image", "other"]),
     }))
     .mutation(async ({ ctx, input }) => {
       // Add attachment
     }),
   ```

6. **removeAttachment** - Remove an attachment from an announcement
   ```typescript
   removeAttachment: protectedProcedure
     .input(z.object({
       id: z.string().uuid(),
     }))
     .mutation(async ({ ctx, input }) => {
       // Remove attachment
     }),
   ```

## Integration Notes

1. The UI components are currently using mock data that should be replaced with actual TRPC queries and mutations.
2. Bookmark functionality requires user authentication.
3. Admin functionality should be restricted to users with admin role.
4. File uploads for attachments will need to be implemented separately, possibly using a storage service.
5. The search functionality should be implemented on the server side for better performance.
