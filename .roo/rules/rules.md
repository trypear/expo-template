You are using a monorepo and dev is running.
You are developing a mobile app and will make changes under apps/mobile-app.
Import using the @acme/x convention and do not change the ts config.

If you ever get stuck with something potentially being undefined, do:
import { assert } from "@acme/utils";

assert(!!value, "value should be defined")

HERE IS AN EXAMPLE PROJECT DIFF FROM BEFORE FOR A UNIVERSITY ANNOUNCEMENTS APP:

diff --git a/apps/mobile-app/ANNOUNCEMENTS_API_REQUIREMENTS.md b/apps/mobile-app/ANNOUNCEMENTS_API_REQUIREMENTS.md
new file mode 100644
index 0000000..17884b2
--- /dev/null
+++ b/apps/mobile-app/ANNOUNCEMENTS_API_REQUIREMENTS.md
@@ -0,0 +1,320 @@
+# University Announcements App - API Requirements

- +This document outlines the database schema and TRPC endpoint requirements for the University Announcements application.
- +## Database Schema Requirements
- +### Announcement Table
- +```sql
  +CREATE TABLE announcement (
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
- title VARCHAR(255) NOT NULL,
- content TEXT NOT NULL,
- date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
- category_id UUID NOT NULL REFERENCES category(id),
- author_id UUID NOT NULL REFERENCES author(id),
- is_important BOOLEAN NOT NULL DEFAULT FALSE,
- created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
- updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  +);
  +```
- +### Category Table
- +```sql
  +CREATE TABLE category (
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
- name VARCHAR(100) NOT NULL,
- color VARCHAR(20) NOT NULL,
- created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
- updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  +);
  +```
- +### Author Table
- +```sql
  +CREATE TABLE author (
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
- name VARCHAR(100) NOT NULL,
- role VARCHAR(100) NOT NULL,
- department VARCHAR(100) NOT NULL,
- avatar VARCHAR(255),
- created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
- updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  +);
  +```
- +### Attachment Table
- +```sql
  +CREATE TABLE attachment (
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
- announcement_id UUID NOT NULL REFERENCES announcement(id) ON DELETE CASCADE,
- name VARCHAR(255) NOT NULL,
- url VARCHAR(255) NOT NULL,
- type VARCHAR(20) NOT NULL,
- created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
- updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  +);
  +```
- +### UserBookmark Table
- +```sql
  +CREATE TABLE user_bookmark (
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
- user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
- announcement_id UUID NOT NULL REFERENCES announcement(id) ON DELETE CASCADE,
- created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
- UNIQUE(user_id, announcement_id)
  +);
  +```
- +## Drizzle Schema
- +Here's how the schema would look using Drizzle ORM:
- +```typescript
  +// In packages/db/src/schema.ts (add to existing schema)
- +import {
- boolean,
- pgTable,
- text,
- timestamp,
- uuid,
- varchar,
  +} from "drizzle-orm/pg-core";
- +import { createTable, fk } from "./utils";
- +export const category = createTable("category", {
- name: varchar({ length: 100 }).notNull(),
- color: varchar({ length: 20 }).notNull(),
  +});
- +export type Category = typeof category.$inferSelect;
+export type NewCategory = typeof category.$inferInsert;
- +export const author = createTable("author", {
- name: varchar({ length: 100 }).notNull(),
- role: varchar({ length: 100 }).notNull(),
- department: varchar({ length: 100 }).notNull(),
- avatar: varchar({ length: 255 }),
  +});
- +export type Author = typeof author.$inferSelect;
+export type NewAuthor = typeof author.$inferInsert;
- +export const announcement = createTable("announcement", {
- title: varchar({ length: 255 }).notNull(),
- content: text().notNull(),
- date: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
- categoryId: fk("category_id", () => category, {
- onDelete: "cascade",
- }).notNull(),
- authorId: fk("author_id", () => author, { onDelete: "cascade" }).notNull(),
- isImportant: boolean().notNull().default(false),
  +});
- +export type Announcement = typeof announcement.$inferSelect;
+export type NewAnnouncement = typeof announcement.$inferInsert;
- +export const attachment = createTable("attachment", {
- announcementId: fk("announcement_id", () => announcement, {
- onDelete: "cascade",
- }).notNull(),
- name: varchar({ length: 255 }).notNull(),
- url: varchar({ length: 255 }).notNull(),
- type: varchar({ length: 20 }).notNull(),
  +});
- +export type Attachment = typeof attachment.$inferSelect;
+export type NewAttachment = typeof attachment.$inferInsert;
- +export const userBookmark = createTable(
- "user_bookmark",
- {
- userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
- announcementId: fk("announcement_id", () => announcement, {
-      onDelete: "cascade",
- }).notNull(),
- },
- (t) => [
- uniqueIndex("user_bookmark_unique_idx").on(t.userId, t.announcementId),
- ],
  +);
- +export type UserBookmark = typeof userBookmark.$inferSelect;
+export type NewUserBookmark = typeof userBookmark.$inferInsert;
  +```
- +## TRPC Endpoint Requirements
- +### Router Structure
- +```typescript
  +// In packages/api/src/router/announcement.ts
- +import { z } from "zod";
- +import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
- +export const announcementRouter = createTRPCRouter({
- // Queries and mutations will go here
  +});
  +```
- +### Required Queries
- +1. **getAnnouncements** - Get all announcements with optional filtering
-
- ```typescript

  ```

- getAnnouncements: publicProcedure
-     .input(z.object({
-       categoryId: z.string().uuid().optional(),
-       onlyBookmarked: z.boolean().optional(),
-       searchQuery: z.string().optional(),
-     }))
-     .query(async ({ ctx, input }) => {
-       // Return filtered announcements
-     }),
- ```

  ```

- +2. **getAnnouncementById** - Get a single announcement by ID
-
- ```typescript

  ```

- getAnnouncementById: publicProcedure
-     .input(z.object({
-       id: z.string().uuid(),
-     }))
-     .query(async ({ ctx, input }) => {
-       // Return announcement with attachments
-     }),
- ```

  ```

- +3. **getCategories** - Get all categories
-
- ```typescript

  ```

- getCategories: publicProcedure
-     .query(async ({ ctx }) => {
-       // Return all categories
-     }),
- ```

  ```

- +4. **getAuthors** - Get all authors
-
- ```typescript

  ```

- getAuthors: publicProcedure
-     .query(async ({ ctx }) => {
-       // Return all authors
-     }),
- ```

  ```

- +5. **getUserBookmarks** - Get user's bookmarked announcements
- ```typescript

  ```

- getUserBookmarks: protectedProcedure
-     .query(async ({ ctx }) => {
-       // Return user's bookmarked announcement IDs
-     }),
- ```

  ```

- +### Required Mutations
- +1. **createAnnouncement** - Create a new announcement
-
- ```typescript

  ```

- createAnnouncement: protectedProcedure
-     .input(z.object({
-       title: z.string().min(1).max(255),
-       content: z.string().min(1),
-       categoryId: z.string().uuid(),
-       authorId: z.string().uuid(),
-       isImportant: z.boolean().default(false),
-       attachments: z.array(z.object({
-         name: z.string().min(1).max(255),
-         url: z.string().min(1).max(255),
-         type: z.enum(["pdf", "doc", "image", "other"]),
-       })).optional(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-       // Create announcement and attachments
-     }),
- ```

  ```

- +2. **updateAnnouncement** - Update an existing announcement
-
- ```typescript

  ```

- updateAnnouncement: protectedProcedure
-     .input(z.object({
-       id: z.string().uuid(),
-       title: z.string().min(1).max(255).optional(),
-       content: z.string().min(1).optional(),
-       categoryId: z.string().uuid().optional(),
-       authorId: z.string().uuid().optional(),
-       isImportant: z.boolean().optional(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-       // Update announcement
-     }),
- ```

  ```

- +3. **deleteAnnouncement** - Delete an announcement
-
- ```typescript

  ```

- deleteAnnouncement: protectedProcedure
-     .input(z.object({
-       id: z.string().uuid(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-       // Delete announcement
-     }),
- ```

  ```

- +4. **toggleBookmark** - Toggle bookmark status for an announcement
-
- ```typescript

  ```

- toggleBookmark: protectedProcedure
-     .input(z.object({
-       announcementId: z.string().uuid(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-       // Toggle bookmark status
-     }),
- ```

  ```

- +5. **addAttachment** - Add an attachment to an announcement
-
- ```typescript

  ```

- addAttachment: protectedProcedure
-     .input(z.object({
-       announcementId: z.string().uuid(),
-       name: z.string().min(1).max(255),
-       url: z.string().min(1).max(255),
-       type: z.enum(["pdf", "doc", "image", "other"]),
-     }))
-     .mutation(async ({ ctx, input }) => {
-       // Add attachment
-     }),
- ```

  ```

- +6. **removeAttachment** - Remove an attachment from an announcement
- ```typescript

  ```

- removeAttachment: protectedProcedure
-     .input(z.object({
-       id: z.string().uuid(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-       // Remove attachment
-     }),
- ```

  ```

- +## Integration Notes
- +1. The UI components are currently using mock data that should be replaced with actual TRPC queries and mutations.
  +2. Bookmark functionality requires user authentication.
  +3. Admin functionality should be restricted to users with admin role.
  +4. File uploads for attachments will need to be implemented separately, possibly using a storage service.
  +5. The search functionality should be implemented on the server side for better performance.
  diff --git a/apps/mobile-app/ANNOUNCEMENTS_README.md b/apps/mobile-app/ANNOUNCEMENTS_README.md
  new file mode 100644
  index 0000000..8421b00
  --- /dev/null
  +++ b/apps/mobile-app/ANNOUNCEMENTS_README.md
  @@ -0,0 +1,127 @@
  +# University Announcements App
- +A mobile application for university announcements with category filtering, bookmarking, search functionality, and an admin interface.
- +## Features
- +### For Students/Users
- +- **Browse Announcements**: View a list of all university announcements
  +- **Filter by Category**: Filter announcements by categories like Academic, Events, Administrative, etc.
  +- **Save Announcements**: Bookmark important announcements for quick access
  +- **Search**: Search for specific announcements by keywords
  +- **View Details**: See full announcement details including attachments
  +- **Important Notifications**: Easily identify important announcements
- +### For Administrators
- +- **Create Announcements**: Add new announcements with rich content
  +- **Categorize**: Assign categories to announcements
  +- **Mark as Important**: Flag critical announcements
  +- **Attach Files**: Add PDF, DOC, or image attachments to announcements
  +- **Manage Authors**: Select announcement authors
- +## Screens
- +### Main Announcements Screen
- +- Displays a list of all announcements
  +- Features category filters at the top
  +- Includes a search bar for finding specific announcements
  +- Shows a "Saved" filter to view bookmarked announcements
  +- Each announcement card shows:
- - Title
- - Category
- - Brief content preview
- - Author
- - Date
- - Important badge (if applicable)
- - Attachment indicator (if applicable)
- - Bookmark button
- +### Announcement Detail Screen
- +- Shows the full announcement content
  +- Displays metadata (author, date, category)
  +- Lists all attachments with download options
  +- Includes a bookmark button
- +### Admin Screen
- +- Form for creating new announcements
  +- Fields for title, content, category, and author
  +- Toggle for marking announcements as important
  +- Interface for adding attachments
- +## Implementation Notes
- +### Current Status
- +- The UI is fully implemented with mock data
  +- All screens and components are created and styled
  +- Navigation between screens is working
- +### Next Steps for Integration
- +- Replace mock data with actual TRPC queries and mutations
  +- Implement authentication for admin functionality
  +- Set up file upload for attachments
  +- Add proper error handling and loading states
- +### Database and API Requirements
- +See the `ANNOUNCEMENTS_API_REQUIREMENTS.md` file for detailed information about:
- +- Database schema requirements
  +- TRPC endpoint specifications
  +- Integration notes
- +## Usage
- +### For Users
- +1. Browse the main announcements screen to see all announcements
  +2. Use the category filters to narrow down announcements
  +3. Tap the "Save" button on any announcement to bookmark it
  +4. Use the "Saved" filter to view your bookmarked announcements
  +5. Tap on any announcement to view its full details
  +6. Use the search bar to find specific announcements
- +### For Administrators
- +1. Navigate to the Settings tab
  +2. Tap on "Manage Announcements" in the Admin section
  +3. Fill out the form to create a new announcement
  +4. Add attachments if needed
  +5. Tap "Create Announcement" to publish
- +## UI Components
- +The app uses the following custom components:
- +- `AnnouncementCard`: Displays a summary of an announcement
  +- `BookmarkButton`: Toggle button for saving/unsaving announcements
  +- `ThemedText` and `ThemedView`: Theme-aware components for consistent styling
  +- Various form components in the admin interface
- +## Styling
- +The app follows a consistent design language with:
- +- Clean, minimal UI
  +- Clear typography hierarchy
  +- Visual indicators for important items
  +- Consistent spacing and padding
  +- Responsive layout that works on different screen sizes
  +- Support for both light and dark themes
- +## Future Enhancements
- +Potential future improvements include:
- +- Push notifications for important announcements
  +- Comment functionality for discussions
  +- Rich text formatting for announcement content
  +- Analytics for tracking announcement engagement
  +- Bulk announcement management for administrators
  +- Scheduled announcements with future publish dates
  diff --git a/apps/mobile-app/app/(tabs)/index.tsx b/apps/mobile-app/app/(tabs)/index.tsx
  index e6120ee..3fb6be0 100644
  --- a/apps/mobile-app/app/(tabs)/index.tsx
  +++ b/apps/mobile-app/app/(tabs)/index.tsx
  @@ -1,66 +1,244 @@
  -"use client";

* -import { Pressable, StyleSheet, View } from "react-native";
  -import { useRouter } from "expo-router";
  +import React, { useState } from "react";
  +import {

- ActivityIndicator,
- FlatList,
- Pressable,
- StyleSheet,
- TextInput,
- View,
  +} from "react-native";
  +import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
  import { ThemedText } from "@/components/ThemedText";
  +import { ThemedView } from "@/components/ThemedView";
  +import { Colors } from "@/constants/Colors";
  +import { trpc } from "@/hooks/api";
  +import { useColorScheme } from "@/hooks/useColorScheme";
  +import { useQuery } from "@tanstack/react-query";

-/\*\*

- - Home Screen
- -
- - This is the main tab screen. It demonstrates how to navigate to other screens
- - without adding new tabs to the bottom navigation.
- \*/
  -export default function HomeScreen() {
- const router = useRouter();
  +export default function AnnouncementsScreen() {

* const colorScheme = useColorScheme() ?? "light";
* const colors = Colors[colorScheme];

- return (
- <View style={styles.container}>
-      <ThemedText style={styles.title}>Home Screen</ThemedText>

* // State for filtering and searching
* const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
* const [showBookmarked, setShowBookmarked] = useState(false);
* const [searchQuery, setSearchQuery] = useState("");
*
* // Fetch categories
* const { data: categories = [], isLoading: isCategoriesLoading } = useQuery(
* trpc.announcement.getCategories.queryOptions(),
* );
*
* // Fetch user bookmarks (renamed to avoid unused variable warning)
* const { data: \_bookmarkedIds = [] } = useQuery(
* trpc.announcement.getUserBookmarks.queryOptions(),
* );
*
* // Fetch announcements with filters
* const { data: announcements = [], isLoading: isAnnouncementsLoading } =
* useQuery(
*      trpc.announcement.getAnnouncements.queryOptions({
*        categoryId: selectedCategory || undefined,
*        onlyBookmarked: showBookmarked,
*        searchQuery: searchQuery || undefined,
*      }),
* );
*
* // Sort announcements by date (newest first) and important ones at the top
* const sortedAnnouncements = [...announcements].sort((a, b) => {
* // Important announcements first
* if (a.isImportant && !b.isImportant) return -1;
* if (!a.isImportant && b.isImportant) return 1;
*
* // Then sort by date (newest first)
* return new Date(b.date).getTime() - new Date(a.date).getTime();
* });
*
* // Loading state
* const isLoading = isCategoriesLoading || isAnnouncementsLoading;

-      <Pressable
-        style={styles.button}
-        onPress={() => router.push("/sample-detail")}
-      >
-        <ThemedText style={styles.buttonText}>
-          Open Sample Detail Screen

* return (
* <ThemedView style={styles.container}>
*      <View style={styles.header}>
*        <ThemedText type="title" style={styles.title}>
*          Announcements
         </ThemedText>

-      </Pressable>

-      <ThemedText style={styles.hint}>
-        This demonstrates navigation without adding tabs
-      </ThemedText>
- </View>

*        {/* Search bar */}
*        <View
*          style={[styles.searchContainer, { borderColor: colors.cardBorder }]}
*        >
*          <TextInput
*            style={[styles.searchInput, { color: colors.text }]}
*            placeholder="Search announcements..."
*            placeholderTextColor={colors.secondaryText}
*            value={searchQuery}
*            onChangeText={setSearchQuery}
*          />
*        </View>
*
*        {/* Category filters */}
*        <FlatList
*          horizontal
*          data={[{ id: "all", name: "All", color: colors.tint }, ...categories]}
*          keyExtractor={(item) => item.id}
*          showsHorizontalScrollIndicator={false}
*          style={styles.categoryList}
*          renderItem={({ item }) => (
*            <Pressable
*              style={[
*                styles.categoryChip,
*                {
*                  backgroundColor:
*                    selectedCategory === item.id ||
*                    (item.id === "all" && !selectedCategory)
*                      ? item.color
*                      : "transparent",
*                  borderColor: item.color,
*                },
*              ]}
*              onPress={() =>
*                setSelectedCategory(item.id === "all" ? null : item.id)
*              }
*            >
*              <ThemedText
*                style={[
*                  styles.categoryChipText,
*                  {
*                    color:
*                      selectedCategory === item.id ||
*                      (item.id === "all" && !selectedCategory)
*                        ? "#FFFFFF"
*                        : item.color,
*                  },
*                ]}
*              >
*                {item.name}
*              </ThemedText>
*            </Pressable>
*          )}
*        />
*
*        {/* Bookmarked filter */}
*        <Pressable
*          style={[
*            styles.bookmarkedChip,
*            {
*              backgroundColor: showBookmarked ? colors.tint : "transparent",
*              borderColor: colors.tint,
*            },
*          ]}
*          onPress={() => setShowBookmarked(!showBookmarked)}
*        >
*          <ThemedText
*            style={[
*              styles.bookmarkedChipText,
*              { color: showBookmarked ? "#FFFFFF" : colors.tint },
*            ]}
*          >
*            Saved
*          </ThemedText>
*        </Pressable>
*      </View>
*
*      {/* Announcements list with loading state */}
*      {isLoading ? (
*        <View style={styles.emptyState}>
*          <ActivityIndicator size="large" color={colors.tint} />
*          <ThemedText style={styles.emptyStateTitle}>
*            Loading announcements...
*          </ThemedText>
*        </View>
*      ) : sortedAnnouncements.length > 0 ? (
*        <FlatList
*          data={sortedAnnouncements}
*          keyExtractor={(item) => item.id}
*          renderItem={({ item }) => <AnnouncementCard announcement={item} />}
*          contentContainerStyle={styles.announcementsList}
*          showsVerticalScrollIndicator={false}
*        />
*      ) : (
*        <ThemedView style={styles.emptyState}>
*          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
*            No announcements found
*          </ThemedText>
*          <ThemedText style={styles.emptyStateText}>
*            {showBookmarked
*              ? "You haven't saved any announcements yet."
*              : searchQuery
*                ? "No announcements match your search criteria."
*                : "There are no announcements in this category."}
*          </ThemedText>
*        </ThemedView>
*      )}
* </ThemedView>
    );
  }

const styles = StyleSheet.create({
container: {
flex: 1,

- justifyContent: "center",
- alignItems: "center",
  padding: 16,
  },

* header: {
* marginBottom: 16,
* },
  title: {

- fontSize: 24,
- fontWeight: "bold",
- marginBottom: 24,

* marginBottom: 16,
  },

- button: {
- backgroundColor: "#5B65E9",
- padding: 16,
- borderRadius: 8,
- alignItems: "center",

* searchContainer: {
* height: 40,
* borderRadius: 20,
* borderWidth: 1,
* paddingHorizontal: 16,
* marginBottom: 16,
* justifyContent: "center",
* },
* searchInput: {
* height: "100%",
* fontSize: 16,
* },
* categoryList: {
  marginBottom: 16,

- width: "100%",
- maxWidth: 300,
  },
- buttonText: {
- color: "#FFFFFF",

* categoryChip: {
* paddingHorizontal: 12,
* paddingVertical: 6,
* borderRadius: 16,
* marginRight: 8,
* borderWidth: 1,
* },
* categoryChipText: {
* fontSize: 14,
  fontWeight: "600",
  },

- hint: {
- opacity: 0.7,

* bookmarkedChip: {
* paddingHorizontal: 12,
* paddingVertical: 6,
* borderRadius: 16,
* marginBottom: 8,
* borderWidth: 1,
* alignSelf: "flex-start",
* },
* bookmarkedChipText: {
* fontSize: 14,
* fontWeight: "600",
* },
* announcementsList: {
* paddingBottom: 16,
* },
* emptyState: {
* flex: 1,
* justifyContent: "center",
* alignItems: "center",
* padding: 24,
* },
* emptyStateTitle: {
* marginBottom: 8,
* textAlign: "center",
* },
* emptyStateText: {
  textAlign: "center",

- marginTop: 8,

* opacity: 0.7,
  },
  });
  diff --git a/apps/mobile-app/app/(tabs)/settings.tsx b/apps/mobile-app/app/(tabs)/settings.tsx
  index dad2c9c..498fedf 100644
  --- a/apps/mobile-app/app/(tabs)/settings.tsx
  +++ b/apps/mobile-app/app/(tabs)/settings.tsx
  @@ -1,6 +1,5 @@
  -/_ eslint-disable @typescript-eslint/no-require-imports _/
  -/_ eslint-disable @typescript-eslint/no-unsafe-assignment _/
  -import { Button, Image, StyleSheet } from "react-native";
  +import { Button, Image, Pressable, StyleSheet } from "react-native";
  +import { useRouter } from "expo-router";
  import ParallaxScrollView from "@/components/ParallaxScrollView";
  import { ThemedText } from "@/components/ThemedText";
  import { ThemedView } from "@/components/ThemedView";
  @@ -8,6 +7,7 @@ import { ThemedView } from "@/components/ThemedView";
  import { useSignIn, useSignOut, useUser } from "../../hooks/auth";

export default function SettingsScreen() {

- const router = useRouter();
  const user = useUser();
  const signIn = useSignIn();
  const signOut = useSignOut();
  @@ -36,6 +36,23 @@ export default function SettingsScreen() {
  color="#5B65E9"
  />
  </ThemedView>
-
-        {/* Admin section */}
-        <ThemedView style={[styles.section, styles.adminSection]}>
-          <ThemedText type="title">Admin</ThemedText>
-          <ThemedText style={styles.sectionDescription}>
-            Create and manage university announcements
-          </ThemedText>
-
-          <Pressable
-            style={styles.adminButton}
-            onPress={() => router.push("/admin")}
-          >
-            <ThemedText style={styles.adminButtonText}>
-              Manage Announcements
-            </ThemedText>
-          </Pressable>
-        </ThemedView>
         </ThemedView>
       </ParallaxScrollView>
  );
  @@ -45,6 +62,7 @@ const styles = StyleSheet.create({
  container: {
  flex: 1,
  padding: 16,
- gap: 16,
  },
  section: {
  gap: 16,
  @@ -52,9 +70,26 @@ const styles = StyleSheet.create({
  borderRadius: 12,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
- adminSection: {
- marginTop: 8,
- },
  userInfo: {
  paddingVertical: 8,
  },
- sectionDescription: {
- opacity: 0.7,
- marginBottom: 8,
- },
- adminButton: {
- backgroundColor: "#5B65E9",
- padding: 12,
- borderRadius: 8,
- alignItems: "center",
- },
- adminButtonText: {
- color: "#FFFFFF",
- fontWeight: "600",
- },
  reactLogo: {
  height: 178,
  width: 290,
  diff --git a/apps/mobile-app/app/admin/index.tsx b/apps/mobile-app/app/admin/index.tsx
  new file mode 100644
  index 0000000..2caa2bb
  --- /dev/null
  +++ b/apps/mobile-app/app/admin/index.tsx
  @@ -0,0 +1,568 @@
  +import React, { useState } from "react";
  +import {
- ActivityIndicator,
- Alert,
- KeyboardAvoidingView,
- Platform,
- Pressable,
- ScrollView,
- StyleSheet,
- Switch,
- TextInput,
- View,
  +} from "react-native";
  +import { Stack, useRouter } from "expo-router";
  +import { ThemedText } from "@/components/ThemedText";
  +import { ThemedView } from "@/components/ThemedView";
  +import { Button } from "@/components/ui/button";
  +import { Colors } from "@/constants/Colors";
  +import { trpc } from "@/hooks/api";
  +import { useColorScheme } from "@/hooks/useColorScheme";
  +import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
- +export default function AdminScreen() {
- const router = useRouter();
- const colorScheme = useColorScheme() ?? "light";
- const colors = Colors[colorScheme];
-
- // Form state
- const [title, setTitle] = useState("");
- const [content, setContent] = useState("");
- const [categoryId, setCategoryId] = useState("");
- const [authorId, setAuthorId] = useState("");
- const [isImportant, setIsImportant] = useState(false);
- const [attachments, setAttachments] = useState<
- { name: string; type: string }[]
- > ([]);
-
- // UI state
- const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
- const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
- const [attachmentName, setAttachmentName] = useState("");
- const [attachmentType, setAttachmentType] = useState("pdf");
-
- const handleAddAttachment = () => {
- if (attachmentName.trim()) {
-      setAttachments([
-        ...attachments,
-        { name: attachmentName, type: attachmentType },
-      ]);
-      setAttachmentName("");
-      setAttachmentType("pdf");
- }
- };
-
- const handleRemoveAttachment = (index: number) => {
- const newAttachments = [...attachments];
- newAttachments.splice(index, 1);
- setAttachments(newAttachments);
- };
-
- // Fetch categories
- const { data: categories = [], isLoading: isCategoriesLoading } = useQuery(
- trpc.announcement.getCategories.queryOptions(),
- );
-
- // Fetch authors
- const { data: authors = [], isLoading: isAuthorsLoading } = useQuery(
- trpc.announcement.getAuthors.queryOptions(),
- );
-
- // Set up query client for invalidation
- const queryClient = useQueryClient();
-
- // Create announcement mutation
- const createAnnouncementMutation = useMutation(
- trpc.announcement.createAnnouncement.mutationOptions({
-      onSuccess: () => {
-        // Invalidate queries to refresh data
-        void queryClient.invalidateQueries({
-          predicate: (query) =>
-            query.queryKey[0] === "announcement.getAnnouncements",
-        });
-
-        // Show success message
-        Alert.alert("Success", "Announcement created successfully", [
-          { text: "OK", onPress: () => router.back() },
-        ]);
-      },
-      onError: (error) => {
-        Alert.alert("Error", `Failed to create announcement: ${error.message}`);
-      },
- }),
- );
-
- const handleSubmit = () => {
- // Validate form
- if (!title.trim()) {
-      Alert.alert("Error", "Please enter a title");
-      return;
- }
-
- if (!content.trim()) {
-      Alert.alert("Error", "Please enter content");
-      return;
- }
-
- if (!categoryId) {
-      Alert.alert("Error", "Please select a category");
-      return;
- }
-
- if (!authorId) {
-      Alert.alert("Error", "Please select an author");
-      return;
- }
-
- // Create announcement using TRPC mutation
- createAnnouncementMutation.mutate({
-      title: title.trim(),
-      content: content.trim(),
-      categoryId,
-      authorId,
-      isImportant,
-      attachments: attachments.map((att) => ({
-        name: att.name,
-        url: `/documents/${att.name.toLowerCase().replace(/\s+/g, "-")}`,
-        type: att.type as "pdf" | "doc" | "image" | "other",
-      })),
- });
- };
-
- // Loading state
- const isLoading =
- isCategoriesLoading ||
- isAuthorsLoading ||
- createAnnouncementMutation.isPending;
-
- // Show loading indicator during API operations
- if (isLoading && !showCategoryDropdown && !showAuthorDropdown) {
- return (
-      <>
-        <Stack.Screen
-          options={{
-            title: "Create Announcement",
-            headerShown: true,
-          }}
-        />
-        <View style={[styles.container, styles.centerContent]}>
-          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
-          <ThemedText style={{ marginTop: 16 }}>
-            {createAnnouncementMutation.isPending
-              ? "Creating announcement..."
-              : "Loading..."}
-          </ThemedText>
-        </View>
-      </>
- );
- }
-
- return (
- <>
-      <Stack.Screen
-        options={{
-          title: "Create Announcement",
-          headerShown: true,
-        }}
-      />
-
-      <KeyboardAvoidingView
-        behavior={Platform.OS === "ios" ? "padding" : "height"}
-        style={styles.container}
-      >
-        <ScrollView style={styles.scrollView}>
-          <ThemedView style={styles.formContainer}>
-            {/* Title input */}
-            <View style={styles.formGroup}>
-              <ThemedText style={styles.label}>Title</ThemedText>
-              <TextInput
-                style={[
-                  styles.input,
-                  { color: colors.text, borderColor: colors.cardBorder },
-                ]}
-                value={title}
-                onChangeText={setTitle}
-                placeholder="Enter announcement title"
-                placeholderTextColor={colors.secondaryText}
-              />
-            </View>
-
-            {/* Category selector */}
-            <View style={styles.formGroup}>
-              <ThemedText style={styles.label}>Category</ThemedText>
-              <Pressable
-                style={[styles.dropdown, { borderColor: colors.cardBorder }]}
-                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
-              >
-                <ThemedText>
-                  {categoryId
-                    ? categories.find((c) => c.id === categoryId)?.name
-                    : "Select category"}
-                </ThemedText>
-              </Pressable>
-
-              {showCategoryDropdown && (
-                <View
-                  style={[
-                    styles.dropdownMenu,
-                    {
-                      borderColor: colors.cardBorder,
-                      backgroundColor: colors.cardBackground,
-                    },
-                  ]}
-                >
-                  {categories.map((category) => (
-                    <Pressable
-                      key={category.id}
-                      style={[
-                        styles.dropdownItem,
-                        categoryId === category.id && {
-                          backgroundColor: "rgba(0, 0, 0, 0.1)",
-                        },
-                      ]}
-                      onPress={() => {
-                        setCategoryId(category.id);
-                        setShowCategoryDropdown(false);
-                      }}
-                    >
-                      <View
-                        style={[
-                          styles.categoryColor,
-                          { backgroundColor: category.color },
-                        ]}
-                      />
-                      <ThemedText>{category.name}</ThemedText>
-                    </Pressable>
-                  ))}
-                </View>
-              )}
-            </View>
-
-            {/* Author selector */}
-            <View style={styles.formGroup}>
-              <ThemedText style={styles.label}>Author</ThemedText>
-              <Pressable
-                style={[styles.dropdown, { borderColor: colors.cardBorder }]}
-                onPress={() => setShowAuthorDropdown(!showAuthorDropdown)}
-              >
-                <ThemedText>
-                  {authorId
-                    ? authors.find((a) => a.id === authorId)?.name
-                    : "Select author"}
-                </ThemedText>
-              </Pressable>
-
-              {showAuthorDropdown && (
-                <View
-                  style={[
-                    styles.dropdownMenu,
-                    {
-                      borderColor: colors.cardBorder,
-                      backgroundColor: colors.cardBackground,
-                    },
-                  ]}
-                >
-                  {authors.map((author) => (
-                    <Pressable
-                      key={author.id}
-                      style={[
-                        styles.dropdownItem,
-                        authorId === author.id && {
-                          backgroundColor: "rgba(0, 0, 0, 0.1)",
-                        },
-                      ]}
-                      onPress={() => {
-                        setAuthorId(author.id);
-                        setShowAuthorDropdown(false);
-                      }}
-                    >
-                      <ThemedText>{author.name}</ThemedText>
-                      <ThemedText style={styles.authorRole}>
-                        {author.role}
-                      </ThemedText>
-                    </Pressable>
-                  ))}
-                </View>
-              )}
-            </View>
-
-            {/* Content input */}
-            <View style={styles.formGroup}>
-              <ThemedText style={styles.label}>Content</ThemedText>
-              <TextInput
-                style={[
-                  styles.input,
-                  styles.textArea,
-                  { color: colors.text, borderColor: colors.cardBorder },
-                ]}
-                value={content}
-                onChangeText={setContent}
-                placeholder="Enter announcement content"
-                placeholderTextColor={colors.secondaryText}
-                multiline
-                textAlignVertical="top"
-              />
-            </View>
-
-            {/* Important toggle */}
-            <View style={[styles.formGroup, styles.switchContainer]}>
-              <ThemedText style={styles.label}>Mark as Important</ThemedText>
-              <Switch
-                value={isImportant}
-                onValueChange={setIsImportant}
-                trackColor={{ false: "#767577", true: colors.tint }}
-                thumbColor="#f4f3f4"
-              />
-            </View>
-
-            {/* Attachments */}
-            <View style={styles.formGroup}>
-              <ThemedText style={styles.label}>Attachments</ThemedText>
-
-              {/* Attachment list */}
-              {attachments.length > 0 && (
-                <View style={styles.attachmentsList}>
-                  {attachments.map((attachment, index) => (
-                    <View
-                      key={index}
-                      style={[
-                        styles.attachmentItem,
-                        { borderColor: colors.cardBorder },
-                      ]}
-                    >
-                      <View style={styles.attachmentInfo}>
-                        <ThemedText style={styles.attachmentName}>
-                          {attachment.name}
-                        </ThemedText>
-                        <ThemedText style={styles.attachmentType}>
-                          {attachment.type.toUpperCase()}
-                        </ThemedText>
-                      </View>
-                      <Pressable
-                        style={styles.removeButton}
-                        onPress={() => handleRemoveAttachment(index)}
-                      >
-                        <ThemedText style={styles.removeButtonText}>
-                          Remove
-                        </ThemedText>
-                      </Pressable>
-                    </View>
-                  ))}
-                </View>
-              )}
-
-              {/* Add attachment form */}
-              <View style={styles.addAttachmentForm}>
-                <TextInput
-                  style={[
-                    styles.input,
-                    styles.attachmentInput,
-                    { color: colors.text, borderColor: colors.cardBorder },
-                  ]}
-                  value={attachmentName}
-                  onChangeText={setAttachmentName}
-                  placeholder="Attachment name (e.g. Schedule.pdf)"
-                  placeholderTextColor={colors.secondaryText}
-                />
-
-                <View style={styles.attachmentTypeContainer}>
-                  <Pressable
-                    style={[
-                      styles.attachmentTypeButton,
-                      attachmentType === "pdf" && {
-                        backgroundColor: colors.tint,
-                      },
-                    ]}
-                    onPress={() => setAttachmentType("pdf")}
-                  >
-                    <ThemedText
-                      style={[
-                        styles.attachmentTypeText,
-                        attachmentType === "pdf" && { color: "#FFFFFF" },
-                      ]}
-                    >
-                      PDF
-                    </ThemedText>
-                  </Pressable>
-
-                  <Pressable
-                    style={[
-                      styles.attachmentTypeButton,
-                      attachmentType === "doc" && {
-                        backgroundColor: colors.tint,
-                      },
-                    ]}
-                    onPress={() => setAttachmentType("doc")}
-                  >
-                    <ThemedText
-                      style={[
-                        styles.attachmentTypeText,
-                        attachmentType === "doc" && { color: "#FFFFFF" },
-                      ]}
-                    >
-                      DOC
-                    </ThemedText>
-                  </Pressable>
-
-                  <Pressable
-                    style={[
-                      styles.attachmentTypeButton,
-                      attachmentType === "image" && {
-                        backgroundColor: colors.tint,
-                      },
-                    ]}
-                    onPress={() => setAttachmentType("image")}
-                  >
-                    <ThemedText
-                      style={[
-                        styles.attachmentTypeText,
-                        attachmentType === "image" && { color: "#FFFFFF" },
-                      ]}
-                    >
-                      IMAGE
-                    </ThemedText>
-                  </Pressable>
-                </View>
-
-                <Button onPress={handleAddAttachment}>Add Attachment</Button>
-              </View>
-            </View>
-
-            {/* Submit button */}
-            <Button onPress={handleSubmit}>Create Announcement</Button>
-          </ThemedView>
-        </ScrollView>
-      </KeyboardAvoidingView>
- </>
- );
  +}
- +const styles = StyleSheet.create({
- container: {
- flex: 1,
- },
- scrollView: {
- flex: 1,
- padding: 16,
- },
- formContainer: {
- padding: 16,
- borderRadius: 12,
- backgroundColor: "rgba(255, 255, 255, 0.05)",
- marginBottom: 24,
- },
- formGroup: {
- marginBottom: 16,
- },
- label: {
- fontSize: 16,
- fontWeight: "600",
- marginBottom: 8,
- },
- input: {
- height: 40,
- borderWidth: 1,
- borderRadius: 8,
- paddingHorizontal: 12,
- fontSize: 16,
- },
- textArea: {
- height: 120,
- paddingTop: 12,
- paddingBottom: 12,
- },
- dropdown: {
- height: 40,
- borderWidth: 1,
- borderRadius: 8,
- paddingHorizontal: 12,
- justifyContent: "center",
- },
- dropdownMenu: {
- borderWidth: 1,
- borderRadius: 8,
- marginTop: 4,
- maxHeight: 200,
- },
- dropdownItem: {
- padding: 12,
- flexDirection: "row",
- alignItems: "center",
- },
- categoryColor: {
- width: 16,
- height: 16,
- borderRadius: 8,
- marginRight: 8,
- },
- authorRole: {
- fontSize: 12,
- opacity: 0.7,
- marginLeft: 8,
- },
- switchContainer: {
- flexDirection: "row",
- justifyContent: "space-between",
- alignItems: "center",
- },
- attachmentsList: {
- marginBottom: 16,
- },
- attachmentItem: {
- flexDirection: "row",
- justifyContent: "space-between",
- alignItems: "center",
- padding: 12,
- borderWidth: 1,
- borderRadius: 8,
- marginBottom: 8,
- },
- attachmentInfo: {
- flex: 1,
- },
- attachmentName: {
- fontSize: 14,
- fontWeight: "500",
- },
- attachmentType: {
- fontSize: 12,
- opacity: 0.7,
- },
- removeButton: {
- paddingHorizontal: 12,
- paddingVertical: 6,
- backgroundColor: "rgba(255, 59, 48, 0.2)",
- borderRadius: 4,
- },
- removeButtonText: {
- color: "#FF3B30",
- fontSize: 12,
- fontWeight: "600",
- },
- addAttachmentForm: {
- gap: 8,
- },
- attachmentInput: {
- marginBottom: 8,
- },
- attachmentTypeContainer: {
- flexDirection: "row",
- marginBottom: 8,
- gap: 8,
- },
- attachmentTypeButton: {
- paddingHorizontal: 12,
- paddingVertical: 6,
- borderRadius: 4,
- backgroundColor: "rgba(0, 0, 0, 0.1)",
- },
- attachmentTypeText: {
- fontSize: 12,
- fontWeight: "600",
- },
- centerContent: {
- flex: 1,
- justifyContent: "center",
- alignItems: "center",
- },
  +});
  diff --git a/apps/mobile-app/app/announcement-detail/[id].tsx b/apps/mobile-app/app/announcement-detail/[id].tsx
  new file mode 100644
  index 0000000..c36239f
  --- /dev/null
  +++ b/apps/mobile-app/app/announcement-detail/[id].tsx
  @@ -0,0 +1,297 @@
  +import React from "react";
  +import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
  +import { Stack, useLocalSearchParams } from "expo-router";
  +import { BookmarkButton } from "@/components/announcements/BookmarkButton";
  +import { ThemedText } from "@/components/ThemedText";
  +import { ThemedView } from "@/components/ThemedView";
  +import { Button } from "@/components/ui/button";
  +import { Colors } from "@/constants/Colors";
  +import { trpc } from "@/hooks/api";
  +import { useColorScheme } from "@/hooks/useColorScheme";
  +import { useQuery } from "@tanstack/react-query";
- +export default function AnnouncementDetailScreen() {
- const { id } = useLocalSearchParams<{ id: string }>();
- const colorScheme = useColorScheme() ?? "light";
- const colors = Colors[colorScheme];
-
- // Fetch announcement details
- const {
- data: announcement,
- isLoading,
- isError,
- } = useQuery(
- trpc.announcement.getAnnouncementById.queryOptions({
-      id: id || "",
- }),
- );
-
- // Fetch user bookmarks
- const { data: bookmarkedIds = [] } = useQuery(
- trpc.announcement.getUserBookmarks.queryOptions(),
- );
-
- // Loading state
- if (isLoading) {
- return (
-      <>
-        <Stack.Screen
-          options={{
-            title: "Loading...",
-            headerShown: true,
-          }}
-        />
-        <View style={[styles.container, styles.centerContent]}>
-          <ActivityIndicator size="large" color={colors.tint} />
-          <ThemedText style={{ marginTop: 16 }}>
-            Loading announcement...
-          </ThemedText>
-        </View>
-      </>
- );
- }
-
- // Error state
- if (isError || !announcement) {
- return (
-      <>
-        <Stack.Screen
-          options={{
-            title: "Not Found",
-            headerShown: true,
-          }}
-        />
-        <ThemedView style={styles.container}>
-          <ThemedText type="title">Announcement Not Found</ThemedText>
-          <ThemedText style={styles.errorText}>
-            The announcement you're looking for doesn't exist or has been
-            removed.
-          </ThemedText>
-        </ThemedView>
-      </>
- );
- }
-
- // Extract category and author with null checks
- const category = announcement.category || {
- id: "",
- name: "Unknown",
- color: "#999999",
- };
- const author = announcement.author || {
- id: "",
- name: "Unknown",
- role: "",
- department: "",
- };
- const isBookmarked =
- Array.isArray(bookmarkedIds) && bookmarkedIds.includes(announcement.id);
-
- // Format the date
- const formattedDate = new Date(announcement.date).toLocaleDateString(
- "en-US",
- {
-      weekday: "long",
-      month: "long",
-      day: "numeric",
-      year: "numeric",
- },
- );
-
- return (
- <>
-      <Stack.Screen
-        options={{
-          title: "Announcement",
-          headerShown: true,
-        }}
-      />
-
-      <ScrollView style={styles.container}>
-        <ThemedView style={styles.header}>
-          {/* Category badge */}
-          <View
-            style={[styles.categoryBadge, { backgroundColor: category.color }]}
-          >
-            <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
-          </View>
-
-          {/* Important badge */}
-          {announcement.isImportant && (
-            <View style={styles.importantBadge}>
-              <ThemedText style={styles.importantText}>Important</ThemedText>
-            </View>
-          )}
-
-          <ThemedText type="title" style={styles.title}>
-            {announcement.title}
-          </ThemedText>
-
-          <View style={styles.metaInfo}>
-            <ThemedText style={styles.author}>By {author.name}</ThemedText>
-            <ThemedText style={styles.authorRole}>
-              {author.role}, {author.department}
-            </ThemedText>
-            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
-          </View>
-
-          <View style={styles.bookmarkContainer}>
-            <BookmarkButton id={announcement.id} isBookmarked={isBookmarked} />
-          </View>
-        </ThemedView>
-
-        <ThemedView style={styles.contentContainer}>
-          <ThemedText style={styles.content}>{announcement.content}</ThemedText>
-        </ThemedView>
-
-        {announcement.attachments && announcement.attachments.length > 0 && (
-          <ThemedView style={styles.attachmentsContainer}>
-            <ThemedText type="subtitle" style={styles.attachmentsTitle}>
-              Attachments
-            </ThemedText>
-
-            {announcement.attachments.map((attachment) => (
-              <View key={attachment.id} style={styles.attachmentItem}>
-                <View style={styles.attachmentIcon}>
-                  <ThemedText style={styles.attachmentIconText}>
-                    {attachment.type === "pdf"
-                      ? "PDF"
-                      : attachment.type === "doc"
-                        ? "DOC"
-                        : attachment.type === "image"
-                          ? "IMG"
-                          : "FILE"}
-                  </ThemedText>
-                </View>
-                <View style={styles.attachmentInfo}>
-                  <ThemedText style={styles.attachmentName}>
-                    {attachment.name}
-                  </ThemedText>
-                </View>
-                <Button variant="outline">View</Button>
-              </View>
-            ))}
-          </ThemedView>
-        )}
-      </ScrollView>
- </>
- );
  +}
- +const styles = StyleSheet.create({
- container: {
- flex: 1,
- padding: 16,
- },
- header: {
- marginBottom: 16,
- padding: 16,
- borderRadius: 12,
- backgroundColor: "rgba(255, 255, 255, 0.05)",
- },
- categoryBadge: {
- alignSelf: "flex-start",
- paddingHorizontal: 8,
- paddingVertical: 4,
- borderRadius: 4,
- marginBottom: 8,
- },
- categoryText: {
- color: "#FFFFFF",
- fontSize: 12,
- fontWeight: "600",
- },
- importantBadge: {
- alignSelf: "flex-start",
- backgroundColor: "#FF3B30",
- paddingHorizontal: 8,
- paddingVertical: 4,
- borderRadius: 4,
- marginBottom: 8,
- marginLeft: 8,
- },
- importantText: {
- color: "#FFFFFF",
- fontSize: 12,
- fontWeight: "600",
- },
- title: {
- marginBottom: 16,
- },
- metaInfo: {
- marginBottom: 16,
- },
- author: {
- fontSize: 16,
- fontWeight: "600",
- marginBottom: 2,
- },
- authorRole: {
- fontSize: 14,
- opacity: 0.8,
- marginBottom: 4,
- },
- date: {
- fontSize: 14,
- opacity: 0.7,
- },
- bookmarkContainer: {
- alignItems: "flex-start",
- },
- contentContainer: {
- marginBottom: 16,
- padding: 16,
- borderRadius: 12,
- backgroundColor: "rgba(255, 255, 255, 0.05)",
- },
- content: {
- fontSize: 16,
- lineHeight: 24,
- },
- attachmentsContainer: {
- marginBottom: 24,
- padding: 16,
- borderRadius: 12,
- backgroundColor: "rgba(255, 255, 255, 0.05)",
- },
- attachmentsTitle: {
- marginBottom: 16,
- },
- attachmentItem: {
- flexDirection: "row",
- alignItems: "center",
- marginBottom: 12,
- padding: 8,
- borderRadius: 8,
- backgroundColor: "rgba(0, 0, 0, 0.1)",
- },
- attachmentIcon: {
- width: 40,
- height: 40,
- borderRadius: 4,
- backgroundColor: "rgba(0, 0, 0, 0.2)",
- justifyContent: "center",
- alignItems: "center",
- marginRight: 12,
- },
- attachmentIconText: {
- fontSize: 12,
- fontWeight: "bold",
- },
- attachmentInfo: {
- flex: 1,
- marginRight: 12,
- },
- attachmentName: {
- fontSize: 14,
- fontWeight: "500",
- },
- errorText: {
- marginTop: 16,
- fontSize: 16,
- },
- centerContent: {
- justifyContent: "center",
- alignItems: "center",
- },
  +});
  diff --git a/apps/mobile-app/components/announcements/AnnouncementCard.tsx b/apps/mobile-app/components/announcements/AnnouncementCard.tsx
  new file mode 100644
  index 0000000..0c49c1c
  --- /dev/null
  +++ b/apps/mobile-app/components/announcements/AnnouncementCard.tsx
  @@ -0,0 +1,214 @@
  +import React from "react";
  +import { Pressable, StyleSheet, View } from "react-native";
  +import { useRouter } from "expo-router";
  +import { ThemedText } from "@/components/ThemedText";
  +import { ThemedView } from "@/components/ThemedView";
  +import { trpc } from "@/hooks/api";
  +import { useColorScheme } from "@/hooks/useColorScheme";
  +import { useQuery } from "@tanstack/react-query";
- +import { BookmarkButton } from "../announcements/BookmarkButton";
- +// Define types based on API schema
  +export interface Announcement {
- id: string;
- title: string;
- content: string;
- date: string | Date;
- categoryId: string;
- authorId: string;
- isImportant: boolean;
- category: {
- id: string;
- name: string;
- color: string;
- createdAt?: Date | null;
- updatedAt?: Date | null;
- } | null;
- author: {
- id: string;
- name: string;
- role: string;
- department: string;
- avatar?: string | null;
- createdAt?: Date | null;
- updatedAt?: Date | null;
- } | null;
- attachments?: {
- id: string;
- name: string;
- url: string;
- type: string;
- }[];
  +}
- +interface AnnouncementCardProps {
- announcement: Announcement;
  +}
- +export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
- const router = useRouter();
- const \_colorScheme = useColorScheme() ?? "light";
-
- // Get user bookmarks to determine if this announcement is bookmarked
- const { data: bookmarkedIds = [] } = useQuery(
- trpc.announcement.getUserBookmarks.queryOptions(),
- );
-
- // Type-safe way to check if announcement is bookmarked
- const isBookmarked =
- Array.isArray(bookmarkedIds) && bookmarkedIds.includes(announcement.id);
-
- // Extract category and author from the announcement object with null checks
- const category = announcement.category || {
- id: "",
- name: "Unknown",
- color: "#999999",
- };
- const author = announcement.author || {
- id: "",
- name: "Unknown",
- role: "",
- department: "",
- };
-
- // Format the date
- const formattedDate = new Date(announcement.date).toLocaleDateString(
- "en-US",
- {
-      month: "short",
-      day: "numeric",
-      year: "numeric",
- },
- );
-
- const handlePress = () => {
- // Navigate to the announcement detail screen
- router.push({
-      pathname: "/announcement-detail/[id]",
-      params: { id: announcement.id },
- });
- };
-
- return (
- <Pressable onPress={handlePress}>
-      <ThemedView style={styles.card}>
-        {/* Important badge */}
-        {announcement.isImportant && (
-          <View style={styles.importantBadge}>
-            <ThemedText style={styles.importantText}>Important</ThemedText>
-          </View>
-        )}
-
-        {/* Category badge */}
-        <View
-          style={[styles.categoryBadge, { backgroundColor: category.color }]}
-        >
-          <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
-        </View>
-
-        <ThemedText type="subtitle" style={styles.title}>
-          {announcement.title}
-        </ThemedText>
-
-        <ThemedText numberOfLines={2} style={styles.content}>
-          {announcement.content}
-        </ThemedText>
-
-        <View style={styles.footer}>
-          <View style={styles.metaInfo}>
-            <ThemedText style={styles.author}>{author.name}</ThemedText>
-            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
-          </View>
-
-          <BookmarkButton id={announcement.id} isBookmarked={isBookmarked} />
-        </View>
-
-        {/* Attachments indicator */}
-        {announcement.attachments && announcement.attachments.length > 0 && (
-          <View style={styles.attachmentIndicator}>
-            <ThemedText style={styles.attachmentText}>
-              {announcement.attachments.length} attachment
-              {announcement.attachments.length > 1 ? "s" : ""}
-            </ThemedText>
-          </View>
-        )}
-      </ThemedView>
- </Pressable>
- );
  +}
- +const styles = StyleSheet.create({
- card: {
- borderRadius: 12,
- padding: 16,
- marginBottom: 16,
- backgroundColor: "rgba(255, 255, 255, 0.05)",
- borderWidth: 1,
- borderColor: "rgba(255, 255, 255, 0.1)",
- },
- importantBadge: {
- position: "absolute",
- top: 12,
- right: 12,
- backgroundColor: "#FF3B30",
- paddingHorizontal: 8,
- paddingVertical: 4,
- borderRadius: 4,
- zIndex: 1,
- },
- importantText: {
- color: "#FFFFFF",
- fontSize: 12,
- fontWeight: "600",
- },
- categoryBadge: {
- alignSelf: "flex-start",
- paddingHorizontal: 8,
- paddingVertical: 4,
- borderRadius: 4,
- marginBottom: 8,
- },
- categoryText: {
- color: "#FFFFFF",
- fontSize: 12,
- fontWeight: "600",
- },
- title: {
- marginBottom: 8,
- },
- content: {
- marginBottom: 16,
- opacity: 0.8,
- },
- footer: {
- flexDirection: "row",
- justifyContent: "space-between",
- alignItems: "center",
- },
- metaInfo: {
- flex: 1,
- },
- author: {
- fontSize: 14,
- fontWeight: "600",
- marginBottom: 2,
- },
- date: {
- fontSize: 12,
- opacity: 0.7,
- },
- attachmentIndicator: {
- position: "absolute",
- bottom: 12,
- right: 12,
- backgroundColor: "rgba(0, 0, 0, 0.1)",
- paddingHorizontal: 8,
- paddingVertical: 4,
- borderRadius: 4,
- },
- attachmentText: {
- fontSize: 12,
- opacity: 0.7,
- },
  +});
  diff --git a/apps/mobile-app/components/announcements/BookmarkButton.tsx b/apps/mobile-app/components/announcements/BookmarkButton.tsx
  new file mode 100644
  index 0000000..8918596
  --- /dev/null
  +++ b/apps/mobile-app/components/announcements/BookmarkButton.tsx
  @@ -0,0 +1,83 @@
  +import React from "react";
  +import { Pressable, StyleSheet } from "react-native";
  +import { ThemedText } from "@/components/ThemedText";
  +import { Colors } from "@/constants/Colors";
  +import { trpc } from "@/hooks/api";
  +import { useColorScheme } from "@/hooks/useColorScheme";
  +import { useMutation, useQueryClient } from "@tanstack/react-query";
- +interface BookmarkButtonProps {
- id: string;
- isBookmarked: boolean;
  +}
- +export function BookmarkButton({
- id,
- isBookmarked: initialBookmarked,
  +}: BookmarkButtonProps) {
- const colorScheme = useColorScheme() ?? "light";
- const colors = Colors[colorScheme];
- const queryClient = useQueryClient();
-
- // Use TRPC mutation to toggle bookmark status
- const toggleBookmarkMutation = useMutation(
- trpc.announcement.toggleBookmark.mutationOptions({
-      onSuccess: () => {
-        // Invalidate relevant queries to refresh data
-        void queryClient.invalidateQueries({
-          predicate: (query) =>
-            query.queryKey[0] === "announcement.getAnnouncements" ||
-            query.queryKey[0] === "announcement.getUserBookmarks",
-        });
-      },
- }),
- );
-
- const handleToggleBookmark = () => {
- toggleBookmarkMutation.mutate({ announcementId: id });
- };
-
- // Determine current bookmark state (optimistic UI update)
- const isBookmarked = toggleBookmarkMutation.isPending
- ? !initialBookmarked // Optimistically toggle during pending state
- : initialBookmarked;
-
- return (
- <Pressable
-      style={[
-        styles.bookmarkButton,
-        isBookmarked ? { backgroundColor: colors.tint } : styles.notBookmarked,
-      ]}
-      onPress={handleToggleBookmark}
- >
-      <ThemedText
-        style={[
-          styles.bookmarkText,
-          isBookmarked ? styles.bookmarkedText : null,
-        ]}
-      >
-        {isBookmarked ? "Saved" : "Save"}
-      </ThemedText>
- </Pressable>
- );
  +}
- +const styles = StyleSheet.create({
- bookmarkButton: {
- paddingHorizontal: 12,
- paddingVertical: 6,
- borderRadius: 16,
- alignItems: "center",
- justifyContent: "center",
- },
- notBookmarked: {
- backgroundColor: "rgba(0, 0, 0, 0.1)",
- },
- bookmarkText: {
- fontSize: 12,
- fontWeight: "600",
- },
- bookmarkedText: {
- color: "#FFFFFF",
- },
  +});
  diff --git a/apps/mobile-app/constants/data/mockAnnouncements.ts b/apps/mobile-app/constants/data/mockAnnouncements.ts
  new file mode 100644
  index 0000000..b6dacd0
  --- /dev/null
  +++ b/apps/mobile-app/constants/data/mockAnnouncements.ts
  @@ -0,0 +1,232 @@
  +import { assert } from "@acme/utils";
- +// Define types for our data
  +export interface AnnouncementCategory {
- id: string;
- name: string;
- color: string;
  +}
- +export interface Announcement {
- id: string;
- title: string;
- content: string;
- date: string;
- categoryId: string;
- authorId: string;
- isImportant: boolean;
- attachments?: {
-     id: string;
-     name: string;
-     url: string;
-     type: "pdf" | "doc" | "image" | "other";
- }[];
  +}
- +export interface Author {
- id: string;
- name: string;
- role: string;
- department: string;
- avatar?: string;
  +}
- +// MOCK DATA - Replace with TRPC query
  +export const mockCategories: AnnouncementCategory[] = [
- { id: "cat_1", name: "Academic", color: "#3B82F6" },
- { id: "cat_2", name: "Events", color: "#10B981" },
- { id: "cat_3", name: "Administrative", color: "#F59E0B" },
- { id: "cat_4", name: "Scholarships", color: "#8B5CF6" },
- { id: "cat_5", name: "Campus Life", color: "#EC4899" },
- { id: "cat_6", name: "Research", color: "#6366F1" },
  +];
- +// MOCK DATA - Replace with TRPC query
  +export const mockAuthors: Author[] = [
- {
-     id: "auth_1",
-     name: "Dr. Sarah Johnson",
-     role: "Dean",
-     department: "Faculty of Science",
- },
- {
-     id: "auth_2",
-     name: "Prof. Michael Chen",
-     role: "Head of Department",
-     department: "Computer Science",
- },
- {
-     id: "auth_3",
-     name: "Dr. Emily Rodriguez",
-     role: "Student Affairs Director",
-     department: "Student Services",
- },
- {
-     id: "auth_4",
-     name: "Prof. David Williams",
-     role: "Research Coordinator",
-     department: "Research Office",
- },
  +];
- +// MOCK DATA - Replace with TRPC query
  +export const mockAnnouncements: Announcement[] = [
- {
-     id: "ann_1",
-     title: "Final Exam Schedule Released",
-     content: "The final examination schedule for the Spring semester has been released. Please check the university portal for your personalized exam timetable. All students are required to verify their exam dates and locations at least one week before the examination period begins.\n\nIf you have any scheduling conflicts, please contact the Examinations Office immediately. Requests for rescheduling due to conflicts must be submitted no later than two weeks before the examination period.\n\nStudents requiring special accommodations should have already registered with the Accessibility Services. If you haven't done so and need accommodations, please contact them as soon as possible.",
-     date: "2025-05-01T09:00:00Z",
-     categoryId: "cat_1",
-     authorId: "auth_1",
-     isImportant: true,
-     attachments: [
-     	{
-     		id: "att_1",
-     		name: "Exam_Schedule_Spring_2025.pdf",
-     		url: "/documents/exam_schedule.pdf",
-     		type: "pdf",
-     	},
-     ],
- },
- {
-     id: "ann_2",
-     title: "Annual University Gala - Tickets Now Available",
-     content: "The Annual University Gala will be held on June 15th at the Grand Hall. This year's theme is 'Innovation and Tradition'. Tickets are now available for purchase at the Student Union building or online through the university portal.\n\nThe event will feature performances from student groups, an awards ceremony recognizing outstanding achievements, and a dinner prepared by renowned chef Marcus Bell. Formal attire is required.\n\nAll proceeds from the event will go towards the University Scholarship Fund, which supports students with financial needs.",
-     date: "2025-05-02T14:30:00Z",
-     categoryId: "cat_2",
-     authorId: "auth_3",
-     isImportant: false,
-     attachments: [
-     	{
-     		id: "att_2",
-     		name: "Gala_Invitation.pdf",
-     		url: "/documents/gala_invitation.pdf",
-     		type: "pdf",
-     	},
-     	{
-     		id: "att_3",
-     		name: "Venue_Map.jpg",
-     		url: "/images/venue_map.jpg",
-     		type: "image",
-     	},
-     ],
- },
- {
-     id: "ann_3",
-     title: "Library Hours Extended During Finals Week",
-     content: "To support students during the final examination period, the University Library will extend its operating hours. From May 20th to June 5th, the library will be open 24 hours a day.\n\nAdditional study spaces will be available on the second and third floors. The quiet study areas on the fourth floor will have increased capacity with temporary workstations.\n\nThe library café will also extend its hours until midnight each day during this period, offering a variety of snacks and beverages to help you stay energized during your study sessions.",
-     date: "2025-05-03T11:15:00Z",
-     categoryId: "cat_5",
-     authorId: "auth_3",
-     isImportant: false,
- },
- {
-     id: "ann_4",
-     title: "New Research Grant Opportunities",
-     content: "The Office of Research is pleased to announce new grant opportunities for faculty and graduate students. The University has received funding from the National Science Foundation for research in sustainable technologies, artificial intelligence, and climate science.\n\nInterested researchers should submit a letter of intent by May 30th. Full proposals will be due by July 15th. Information sessions about the application process will be held on May 10th and May 17th in the Research Building, Room 302.\n\nFor more details about eligibility criteria and application guidelines, please visit the Research Office website or contact the Research Development team.",
-     date: "2025-05-04T10:00:00Z",
-     categoryId: "cat_6",
-     authorId: "auth_4",
-     isImportant: true,
-     attachments: [
-     	{
-     		id: "att_4",
-     		name: "Research_Grant_Guidelines.pdf",
-     		url: "/documents/research_guidelines.pdf",
-     		type: "pdf",
-     	},
-     ],
- },
- {
-     id: "ann_5",
-     title: "Tuition Payment Deadline for Fall Semester",
-     content: "This is a reminder that the deadline for Fall semester tuition payment is July 31st. Students who have not paid their tuition or arranged for a payment plan by this date may have their course registrations cancelled.\n\nPayment can be made online through the Student Financial Services portal, by mail, or in person at the Bursar's Office. Various payment plans are available for students who cannot pay the full amount by the deadline.\n\nIf you are expecting financial aid or scholarships, please ensure that all required documentation has been submitted to the Financial Aid Office.",
-     date: "2025-05-05T09:30:00Z",
-     categoryId: "cat_3",
-     authorId: "auth_3",
-     isImportant: true,
- },
- {
-     id: "ann_6",
-     title: "Summer Research Internship Applications Open",
-     content: "Applications are now open for the Summer Research Internship Program. This program offers undergraduate students the opportunity to work closely with faculty members on research projects across various disciplines.\n\nThe internship runs for 10 weeks during the summer break and includes a stipend of $3,000. Housing on campus is available for interns at a subsidized rate.\n\nTo apply, students must submit a resume, academic transcript, and a statement of research interests. Applications are due by May 15th. Selected candidates will be notified by June 1st.",
-     date: "2025-05-06T15:45:00Z",
-     categoryId: "cat_6",
-     authorId: "auth_4",
-     isImportant: false,
-     attachments: [
-     	{
-     		id: "att_5",
-     		name: "Internship_Application_Form.doc",
-     		url: "/documents/internship_application.doc",
-     		type: "doc",
-     	},
-     ],
- },
- {
-     id: "ann_7",
-     title: "New Scholarship Opportunity for International Students",
-     content: "The University is pleased to announce a new scholarship program for international students. The Global Excellence Scholarship will cover up to 50% of tuition fees for outstanding international students who demonstrate academic excellence and leadership potential.\n\nEligible students must have a GPA of at least 3.5 and be enrolled full-time in an undergraduate or graduate program. The scholarship is renewable annually, subject to maintaining academic performance.\n\nApplication deadline is June 30th for the upcoming academic year. For more information and to apply, please visit the International Student Services office or their website.",
-     date: "2025-05-07T13:20:00Z",
-     categoryId: "cat_4",
-     authorId: "auth_1",
-     isImportant: true,
- },
- {
-     id: "ann_8",
-     title: "Campus Sustainability Initiative Launch",
-     content: "The University is launching a new sustainability initiative aimed at reducing our carbon footprint and promoting environmental responsibility across campus. The initiative includes several new programs and policies:\n\n- Installation of solar panels on major campus buildings\n- Expansion of recycling and composting facilities\n- Reduction of single-use plastics in dining facilities\n- Creation of a student-led Sustainability Committee\n\nStudents interested in joining the Sustainability Committee should attend the informational meeting on May 12th at 4:00 PM in the Student Union Building, Room 203.",
-     date: "2025-05-08T16:00:00Z",
-     categoryId: "cat_5",
-     authorId: "auth_3",
-     isImportant: false,
- },
- {
-     id: "ann_9",
-     title: "Faculty Development Workshop Series",
-     content: "The Center for Teaching Excellence is hosting a series of faculty development workshops throughout May and June. Topics include innovative teaching methods, incorporating technology in the classroom, promoting inclusive learning environments, and research-based teaching strategies.\n\nAll workshops will be held in the Faculty Development Center and will also be available via live streaming for those who cannot attend in person. Certificates of participation will be provided.\n\nRegistration is required and can be completed through the Center for Teaching Excellence website. Space is limited for in-person attendance, so early registration is encouraged.",
-     date: "2025-05-09T11:00:00Z",
-     categoryId: "cat_3",
-     authorId: "auth_2",
-     isImportant: false,
-     attachments: [
-     	{
-     		id: "att_6",
-     		name: "Workshop_Schedule.pdf",
-     		url: "/documents/workshop_schedule.pdf",
-     		type: "pdf",
-     	},
-     ],
- },
- {
-     id: "ann_10",
-     title: "New Course Offerings for Fall Semester",
-     content: "The University is excited to announce several new courses that will be offered in the Fall semester. These courses reflect emerging fields of study and respond to student interests:\n\n- AI Ethics and Society (COMP 3050)\n- Climate Change Policy (ENVS 4020)\n- Digital Humanities Research Methods (HUMN 3100)\n- Entrepreneurship in Healthcare (BUSN 3750)\n- Advanced Data Visualization (STAT 4150)\n\nCourse descriptions and prerequisites can be found in the updated course catalog. Registration for these courses will open with general course registration on June 1st.",
-     date: "2025-05-10T09:45:00Z",
-     categoryId: "cat_1",
-     authorId: "auth_2",
-     isImportant: false,
- },
  +];
- +// Helper functions to work with the mock data
- +export function getCategoryById(id: string): AnnouncementCategory {
- const category = mockCategories.find(cat => cat.id === id);
- assert(!!category, `Category with id ${id} not found`);
- return category;
  +}
- +export function getAuthorById(id: string): Author {
- const author = mockAuthors.find(auth => auth.id === id);
- assert(!!author, `Author with id ${id} not found`);
- return author;
  +}
- +// MOCK DATA - Replace with TRPC query
  +// This would be stored in a user-specific table in the database
  +export const mockBookmarkedAnnouncements: string[] = ["ann_1", "ann_4", "ann_7"];
- +export function isAnnouncementBookmarked(id: string): boolean {
- return mockBookmarkedAnnouncements.includes(id);
  +}
  \ No newline at end of file
  diff --git a/packages/api/src/root.ts b/packages/api/src/root.ts
  index 0a3a775..98a1388 100644
  --- a/packages/api/src/root.ts
  +++ b/packages/api/src/root.ts
  @@ -1,10 +1,12 @@
  import { authRouter } from "./router/auth";
  import { exampleRouter } from "./router/example";
  +import { announcementRouter } from "./router/announcement";
  import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
auth: authRouter,
example: exampleRouter,

- announcement: announcementRouter,
  });

// export type definition of API
diff --git a/packages/api/src/router/announcement.ts b/packages/api/src/router/announcement.ts
new file mode 100644
index 0000000..bf3f048
--- /dev/null
+++ b/packages/api/src/router/announcement.ts
@@ -0,0 +1,286 @@
+import { z } from "zod";
+import { and, eq, like, or } from "drizzle-orm";

- +import { announcement, attachment, author, category, userBookmark } from "@acme/db/schema";
  +import { assert } from "@acme/utils";
- +import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
- +export const announcementRouter = createTRPCRouter({
- // Queries
- getAnnouncements: publicProcedure
-     .input(z.object({
-     	categoryId: z.string().uuid().optional(),
-     	onlyBookmarked: z.boolean().optional(),
-     	searchQuery: z.string().optional(),
-     }))
-     .query(async ({ ctx, input }) => {
-     	const { db } = ctx;
-
-     	const results = await db.select().from(announcement)
-     		.leftJoin(category, eq(announcement.categoryId, category.id))
-     		.leftJoin(author, eq(announcement.authorId, author.id))
-     		.leftJoin(
-     			userBookmark,
-     			and(
-     				eq(userBookmark.announcementId, announcement.id),
-     				// if the session does not exist, let's just not include this
-     				...(ctx.session ? [eq(userBookmark.userId, ctx.session.user.id)] : [])
-     			)
-     		)
-     		.where(
-     			and(
-     				...(input.categoryId ? [eq(announcement.categoryId, input.categoryId)] : []),
-     				...(input.searchQuery ? [or(
-     					like(announcement.title, `%${input.searchQuery}%`),
-     					like(announcement.content, `%${input.searchQuery}%`)
-     				)] : []),
-     				// if the session does not exist, let's just not include this
-     				...(ctx.session ? [eq(userBookmark.userId, ctx.session.user.id)] : [])
-     			)
-     		);
-
-     	// Get attachments for each announcement
-     	const announcementsWithAttachments = await Promise.all(
-     		results.map(async (result) => {
-     			const attachments = await db
-     				.select()
-     				.from(attachment)
-     				.where(eq(attachment.announcementId, result.announcement.id));
-
-     			return {
-     				...result.announcement,
-     				category: result.category,
-     				author: result.author,
-     				attachments: attachments,
-     			};
-     		})
-     	);
-
-     	return announcementsWithAttachments;
-     }),
-
- getAnnouncementById: publicProcedure
-     .input(z.object({
-     	id: z.string().uuid(),
-     }))
-     .query(async ({ ctx, input }) => {
-     	const { db } = ctx;
-
-     	const result = await db.select()
-     		.from(announcement)
-     		.where(eq(announcement.id, input.id))
-     		.leftJoin(category, eq(announcement.categoryId, category.id))
-     		.leftJoin(author, eq(announcement.authorId, author.id));
-
-     	if (!result[0]) {
-     		throw new Error("Announcement not found");
-     	}
-
-     	const attachments = await db
-     		.select()
-     		.from(attachment)
-     		.where(eq(attachment.announcementId, input.id));
-
-     	return {
-     		...result[0].announcement,
-     		category: result[0].category,
-     		author: result[0].author,
-     		attachments,
-     	};
-     }),
-
- getCategories: publicProcedure
-     .query(async ({ ctx }) => {
-     	const { db } = ctx;
-     	return db.select().from(category);
-     }),
-
- getAuthors: publicProcedure
-     .query(async ({ ctx }) => {
-     	const { db } = ctx;
-     	return db.select().from(author);
-     }),
-
- getUserBookmarks: protectedProcedure
-     .query(async ({ ctx }) => {
-     	const { db, session } = ctx;
-     	assert(!!session.user, "User must be logged in");
-
-     	const bookmarks = await db
-     		.select()
-     		.from(userBookmark)
-     		.where(eq(userBookmark.userId, session.user.id));
-
-     	return bookmarks.map(bookmark => bookmark.announcementId);
-     }),
-
- // Mutations
- createAnnouncement: protectedProcedure
-     .input(z.object({
-     	title: z.string().min(1).max(255),
-     	content: z.string().min(1),
-     	categoryId: z.string().uuid(),
-     	authorId: z.string().uuid(),
-     	isImportant: z.boolean().default(false),
-     	attachments: z.array(z.object({
-     		name: z.string().min(1).max(255),
-     		url: z.string().min(1).max(255),
-     		type: z.enum(["pdf", "doc", "image", "other"]),
-     	})).optional(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-     	const { db, session } = ctx;
-     	assert(!!session.user, "User must be logged in");
-     	assert(session.user.userRole === "admin", "Only admins can create announcements");
-
-     	// Create announcement
-     	const [newAnnouncement] = await db
-     		.insert(announcement)
-     		.values({
-     			title: input.title,
-     			content: input.content,
-     			categoryId: input.categoryId,
-     			authorId: input.authorId,
-     			isImportant: input.isImportant,
-     			date: new Date(),
-     		})
-     		.returning();
-
-     	// Create attachments if provided
-     	if (input.attachments && input.attachments.length > 0 && newAnnouncement) {
-     		await db.insert(attachment).values(
-     			input.attachments.map(att => ({
-     				announcementId: newAnnouncement.id,
-     				name: att.name,
-     				url: att.url,
-     				type: att.type,
-     			}))
-     		);
-     	}
-
-     	return newAnnouncement;
-     }),
-
- updateAnnouncement: protectedProcedure
-     .input(z.object({
-     	id: z.string().uuid(),
-     	title: z.string().min(1).max(255).optional(),
-     	content: z.string().min(1).optional(),
-     	categoryId: z.string().uuid().optional(),
-     	authorId: z.string().uuid().optional(),
-     	isImportant: z.boolean().optional(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-     	const { db, session } = ctx;
-     	assert(!!session.user, "User must be logged in");
-     	assert(session.user.userRole === "admin", "Only admins can update announcements");
-
-     	const [updatedAnnouncement] = await db
-     		.update(announcement)
-     		.set({
-     			...(input.title && { title: input.title }),
-     			...(input.content && { content: input.content }),
-     			...(input.categoryId && { categoryId: input.categoryId }),
-     			...(input.authorId && { authorId: input.authorId }),
-     			...(input.isImportant !== undefined && { isImportant: input.isImportant }),
-     		})
-     		.where(eq(announcement.id, input.id))
-     		.returning();
-
-     	return updatedAnnouncement;
-     }),
-
- deleteAnnouncement: protectedProcedure
-     .input(z.object({
-     	id: z.string().uuid(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-     	const { db, session } = ctx;
-     	assert(!!session.user, "User must be logged in");
-     	assert(session.user.userRole === "admin", "Only admins can delete announcements");
-
-     	await db.delete(announcement).where(eq(announcement.id, input.id));
-
-     	return { success: true };
-     }),
-
- toggleBookmark: protectedProcedure
-     .input(z.object({
-     	announcementId: z.string().uuid(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-     	const { db, session } = ctx;
-     	assert(!!session.user, "User must be logged in");
-
-     	// Check if bookmark already exists
-     	const existingBookmark = await db
-     		.select()
-     		.from(userBookmark)
-     		.where(
-     			and(
-     				eq(userBookmark.userId, session.user.id),
-     				eq(userBookmark.announcementId, input.announcementId)
-     			)
-     		);
-
-     	if (existingBookmark.length > 0) {
-     		// Remove bookmark
-     		await db
-     			.delete(userBookmark)
-     			.where(
-     				and(
-     					eq(userBookmark.userId, session.user.id),
-     					eq(userBookmark.announcementId, input.announcementId)
-     				)
-     			);
-     		return { bookmarked: false };
-     	} else {
-     		// Add bookmark
-     		await db.insert(userBookmark).values({
-     			userId: session.user.id,
-     			announcementId: input.announcementId,
-     		});
-     		return { bookmarked: true };
-     	}
-     }),
-
- addAttachment: protectedProcedure
-     .input(z.object({
-     	announcementId: z.string().uuid(),
-     	name: z.string().min(1).max(255),
-     	url: z.string().min(1).max(255),
-     	type: z.enum(["pdf", "doc", "image", "other"]),
-     }))
-     .mutation(async ({ ctx, input }) => {
-     	const { db, session } = ctx;
-     	assert(!!session.user, "User must be logged in");
-     	assert(session.user.userRole === "admin", "Only admins can add attachments");
-
-     	const [newAttachment] = await db
-     		.insert(attachment)
-     		.values({
-     			announcementId: input.announcementId,
-     			name: input.name,
-     			url: input.url,
-     			type: input.type,
-     		})
-     		.returning();
-
-     	return newAttachment;
-     }),
-
- removeAttachment: protectedProcedure
-     .input(z.object({
-     	id: z.string().uuid(),
-     }))
-     .mutation(async ({ ctx, input }) => {
-     	const { db, session } = ctx;
-     	assert(!!session.user, "User must be logged in");
-     	assert(session.user.userRole === "admin", "Only admins can remove attachments");
-
-     	await db.delete(attachment).where(eq(attachment.id, input.id));
-
-     	return { success: true };
-     }),
  +});
  \ No newline at end of file
  diff --git a/packages/db/drizzle/0000_open_venom.sql b/packages/db/drizzle/0000_open_venom.sql
  new file mode 100644
  index 0000000..312f2cf
  --- /dev/null
  +++ b/packages/db/drizzle/0000_open_venom.sql
  @@ -0,0 +1,96 @@
  +CREATE TABLE "account" (
- "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
- "created_at" timestamp DEFAULT now(),
- "updated_at" timestamp DEFAULT now(),
- "user_id" uuid NOT NULL,
- "type" varchar(255) NOT NULL,
- "provider" varchar(255) NOT NULL,
- "provider_account_id" varchar(255) NOT NULL,
- "refresh_token" varchar(255),
- "access_token" text,
- "expires_at" integer,
- "token_type" varchar(255),
- "scope" varchar(255),
- "id_token" text,
- "session_state" varchar(255)
  +);
  +--> statement-breakpoint
  +CREATE TABLE "announcement" (
- "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
- "created_at" timestamp DEFAULT now(),
- "updated_at" timestamp DEFAULT now(),
- "title" varchar(255) NOT NULL,
- "content" text NOT NULL,
- "date" timestamp with time zone DEFAULT now() NOT NULL,
- "category_id" uuid NOT NULL,
- "author_id" uuid NOT NULL,
- "is_important" boolean DEFAULT false NOT NULL
  +);
  +--> statement-breakpoint
  +CREATE TABLE "attachment" (
- "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
- "created_at" timestamp DEFAULT now(),
- "updated_at" timestamp DEFAULT now(),
- "announcement_id" uuid NOT NULL,
- "name" varchar(255) NOT NULL,
- "url" varchar(255) NOT NULL,
- "type" varchar(20) NOT NULL
  +);
  +--> statement-breakpoint
  +CREATE TABLE "author" (
- "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
- "created_at" timestamp DEFAULT now(),
- "updated_at" timestamp DEFAULT now(),
- "name" varchar(100) NOT NULL,
- "role" varchar(100) NOT NULL,
- "department" varchar(100) NOT NULL,
- "avatar" varchar(255)
  +);
  +--> statement-breakpoint
  +CREATE TABLE "category" (
- "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
- "created_at" timestamp DEFAULT now(),
- "updated_at" timestamp DEFAULT now(),
- "name" varchar(100) NOT NULL,
- "color" varchar(20) NOT NULL
  +);
  +--> statement-breakpoint
  +CREATE TABLE "session" (
- "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
- "created_at" timestamp DEFAULT now(),
- "updated_at" timestamp DEFAULT now(),
- "session_token" varchar(255) NOT NULL,
- "user_id" uuid NOT NULL,
- "expires" timestamp with time zone NOT NULL
  +);
  +--> statement-breakpoint
  +CREATE TABLE "user" (
- "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
- "created_at" timestamp DEFAULT now(),
- "updated_at" timestamp DEFAULT now(),
- "name" varchar(255),
- "email" varchar(255) NOT NULL,
- "email_verified" timestamp with time zone,
- "image" varchar(255),
- "user_role" varchar DEFAULT 'user'
  +);
  +--> statement-breakpoint
  +CREATE TABLE "user_bookmark" (
- "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
- "created_at" timestamp DEFAULT now(),
- "updated_at" timestamp DEFAULT now(),
- "user_id" uuid NOT NULL,
- "announcement_id" uuid NOT NULL
  +);
  +--> statement-breakpoint
  +ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
  +ALTER TABLE "announcement" ADD CONSTRAINT "announcement_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
  +ALTER TABLE "announcement" ADD CONSTRAINT "announcement_author_id_author_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
  +ALTER TABLE "attachment" ADD CONSTRAINT "attachment_announcement_id_announcement_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
  +ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
  +ALTER TABLE "user_bookmark" ADD CONSTRAINT "user_bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
  +ALTER TABLE "user_bookmark" ADD CONSTRAINT "user_bookmark_announcement_id_announcement_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
  +CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
  +CREATE INDEX "session_token_idx" ON "session" USING btree ("session_token");--> statement-breakpoint
  +CREATE UNIQUE INDEX "user_email_idx" ON "user" USING btree (lower("email"));--> statement-breakpoint
  +CREATE UNIQUE INDEX "user_bookmark_unique_idx" ON "user_bookmark" USING btree ("user_id","announcement_id");
  \ No newline at end of file
  diff --git a/packages/db/drizzle/0001_mock-data.sql b/packages/db/drizzle/0001_mock-data.sql
  new file mode 100644
  index 0000000..d94fce7
  --- /dev/null
  +++ b/packages/db/drizzle/0001_mock-data.sql
  @@ -0,0 +1,179 @@
  +-- Custom SQL migration file for mock data
- +-- Insert mock categories
  +INSERT INTO "category" ("id", "name", "color") VALUES
- (gen_random_uuid(), 'Academic', '#3B82F6'),
- (gen_random_uuid(), 'Events', '#10B981'),
- (gen_random_uuid(), 'Administrative', '#F59E0B'),
- (gen_random_uuid(), 'Scholarships', '#8B5CF6'),
- (gen_random_uuid(), 'Campus Life', '#EC4899'),
- (gen_random_uuid(), 'Research', '#6366F1');
- +-- Insert mock authors
  +INSERT INTO "author" ("id", "name", "role", "department", "avatar") VALUES
- (gen_random_uuid(), 'Dr. Sarah Johnson', 'Dean', 'Faculty of Science', NULL),
- (gen_random_uuid(), 'Prof. Michael Chen', 'Head of Department', 'Computer Science', NULL),
- (gen_random_uuid(), 'Dr. Emily Rodriguez', 'Student Affairs Director', 'Student Services', NULL),
- (gen_random_uuid(), 'Prof. David Williams', 'Research Coordinator', 'Research Office', NULL);
- +-- Create a test user if not exists
  +INSERT INTO "user" ("id", "name", "email", "user_role")
  +SELECT gen_random_uuid(), 'Test User', 'test@example.com', 'admin'
  +WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE "email" = 'test@example.com');
- +-- Get IDs for reference (using variables to store IDs)
  +DO $$
  +DECLARE
- academic_cat_id UUID;
- events_cat_id UUID;
- admin_cat_id UUID;
- scholarships_cat_id UUID;
- campus_cat_id UUID;
- research_cat_id UUID;
-
- sarah_id UUID;
- michael_id UUID;
- emily_id UUID;
- david_id UUID;
-
- test_user_id UUID;
-
- ann1_id UUID;
- ann2_id UUID;
- ann3_id UUID;
- ann4_id UUID;
- ann5_id UUID;
- ann6_id UUID;
- ann7_id UUID;
- ann8_id UUID;
- ann9_id UUID;
- ann10_id UUID;
  +BEGIN
- -- Get category IDs
- SELECT "id" INTO academic_cat_id FROM "category" WHERE "name" = 'Academic' LIMIT 1;
- SELECT "id" INTO events_cat_id FROM "category" WHERE "name" = 'Events' LIMIT 1;
- SELECT "id" INTO admin_cat_id FROM "category" WHERE "name" = 'Administrative' LIMIT 1;
- SELECT "id" INTO scholarships_cat_id FROM "category" WHERE "name" = 'Scholarships' LIMIT 1;
- SELECT "id" INTO campus_cat_id FROM "category" WHERE "name" = 'Campus Life' LIMIT 1;
- SELECT "id" INTO research_cat_id FROM "category" WHERE "name" = 'Research' LIMIT 1;
-
- -- Get author IDs
- SELECT "id" INTO sarah_id FROM "author" WHERE "name" = 'Dr. Sarah Johnson' LIMIT 1;
- SELECT "id" INTO michael_id FROM "author" WHERE "name" = 'Prof. Michael Chen' LIMIT 1;
- SELECT "id" INTO emily_id FROM "author" WHERE "name" = 'Dr. Emily Rodriguez' LIMIT 1;
- SELECT "id" INTO david_id FROM "author" WHERE "name" = 'Prof. David Williams' LIMIT 1;
-
- -- Get test user ID
- SELECT "id" INTO test_user_id FROM "user" WHERE "email" = 'test@example.com' LIMIT 1;
-
- -- Insert mock announcements
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'Final Exam Schedule Released', 'The final examination schedule for the Spring semester has been released. Please check the university portal for your personalized exam timetable. All students are required to verify their exam dates and locations at least one week before the examination period begins.
- +If you have any scheduling conflicts, please contact the Examinations Office immediately. Requests for rescheduling due to conflicts must be submitted no later than two weeks before the examination period.
- +Students requiring special accommodations should have already registered with the Accessibility Services. If you haven''t done so and need accommodations, please contact them as soon as possible.', '2025-05-01 09:00:00+00', academic_cat_id, sarah_id, TRUE)
- RETURNING "id" INTO ann1_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'Annual University Gala - Tickets Now Available', 'The Annual University Gala will be held on June 15th at the Grand Hall. This year''s theme is ''Innovation and Tradition''. Tickets are now available for purchase at the Student Union building or online through the university portal.
- +The event will feature performances from student groups, an awards ceremony recognizing outstanding achievements, and a dinner prepared by renowned chef Marcus Bell. Formal attire is required.
- +All proceeds from the event will go towards the University Scholarship Fund, which supports students with financial needs.', '2025-05-02 14:30:00+00', events_cat_id, emily_id, FALSE)
- RETURNING "id" INTO ann2_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'Library Hours Extended During Finals Week', 'To support students during the final examination period, the University Library will extend its operating hours. From May 20th to June 5th, the library will be open 24 hours a day.
- +Additional study spaces will be available on the second and third floors. The quiet study areas on the fourth floor will have increased capacity with temporary workstations.
- +The library café will also extend its hours until midnight each day during this period, offering a variety of snacks and beverages to help you stay energized during your study sessions.', '2025-05-03 11:15:00+00', campus_cat_id, emily_id, FALSE)
- RETURNING "id" INTO ann3_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'New Research Grant Opportunities', 'The Office of Research is pleased to announce new grant opportunities for faculty and graduate students. The University has received funding from the National Science Foundation for research in sustainable technologies, artificial intelligence, and climate science.
- +Interested researchers should submit a letter of intent by May 30th. Full proposals will be due by July 15th. Information sessions about the application process will be held on May 10th and May 17th in the Research Building, Room 302.
- +For more details about eligibility criteria and application guidelines, please visit the Research Office website or contact the Research Development team.', '2025-05-04 10:00:00+00', research_cat_id, david_id, TRUE)
- RETURNING "id" INTO ann4_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'Tuition Payment Deadline for Fall Semester', 'This is a reminder that the deadline for Fall semester tuition payment is July 31st. Students who have not paid their tuition or arranged for a payment plan by this date may have their course registrations cancelled.
- +Payment can be made online through the Student Financial Services portal, by mail, or in person at the Bursar''s Office. Various payment plans are available for students who cannot pay the full amount by the deadline.
- +If you are expecting financial aid or scholarships, please ensure that all required documentation has been submitted to the Financial Aid Office.', '2025-05-05 09:30:00+00', admin_cat_id, emily_id, TRUE)
- RETURNING "id" INTO ann5_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'Summer Research Internship Applications Open', 'Applications are now open for the Summer Research Internship Program. This program offers undergraduate students the opportunity to work closely with faculty members on research projects across various disciplines.
- +The internship runs for 10 weeks during the summer break and includes a stipend of $3,000. Housing on campus is available for interns at a subsidized rate.
- +To apply, students must submit a resume, academic transcript, and a statement of research interests. Applications are due by May 15th. Selected candidates will be notified by June 1st.', '2025-05-06 15:45:00+00', research_cat_id, david_id, FALSE)
- RETURNING "id" INTO ann6_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'New Scholarship Opportunity for International Students', 'The University is pleased to announce a new scholarship program for international students. The Global Excellence Scholarship will cover up to 50% of tuition fees for outstanding international students who demonstrate academic excellence and leadership potential.
- +Eligible students must have a GPA of at least 3.5 and be enrolled full-time in an undergraduate or graduate program. The scholarship is renewable annually, subject to maintaining academic performance.
- +Application deadline is June 30th for the upcoming academic year. For more information and to apply, please visit the International Student Services office or their website.', '2025-05-07 13:20:00+00', scholarships_cat_id, sarah_id, TRUE)
- RETURNING "id" INTO ann7_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'Campus Sustainability Initiative Launch', 'The University is launching a new sustainability initiative aimed at reducing our carbon footprint and promoting environmental responsibility across campus. The initiative includes several new programs and policies:
- +- Installation of solar panels on major campus buildings
  +- Expansion of recycling and composting facilities
  +- Reduction of single-use plastics in dining facilities
  +- Creation of a student-led Sustainability Committee
- +Students interested in joining the Sustainability Committee should attend the informational meeting on May 12th at 4:00 PM in the Student Union Building, Room 203.', '2025-05-08 16:00:00+00', campus_cat_id, emily_id, FALSE)
- RETURNING "id" INTO ann8_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'Faculty Development Workshop Series', 'The Center for Teaching Excellence is hosting a series of faculty development workshops throughout May and June. Topics include innovative teaching methods, incorporating technology in the classroom, promoting inclusive learning environments, and research-based teaching strategies.
- +All workshops will be held in the Faculty Development Center and will also be available via live streaming for those who cannot attend in person. Certificates of participation will be provided.
- +Registration is required and can be completed through the Center for Teaching Excellence website. Space is limited for in-person attendance, so early registration is encouraged.', '2025-05-09 11:00:00+00', admin_cat_id, michael_id, FALSE)
- RETURNING "id" INTO ann9_id;
-
- INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
-      (gen_random_uuid(), 'New Course Offerings for Fall Semester', 'The University is excited to announce several new courses that will be offered in the Fall semester. These courses reflect emerging fields of study and respond to student interests:
- +- AI Ethics and Society (COMP 3050)
  +- Climate Change Policy (ENVS 4020)
  +- Digital Humanities Research Methods (HUMN 3100)
  +- Entrepreneurship in Healthcare (BUSN 3750)
  +- Advanced Data Visualization (STAT 4150)
- +Course descriptions and prerequisites can be found in the updated course catalog. Registration for these courses will open with general course registration on June 1st.', '2025-05-10 09:45:00+00', academic_cat_id, michael_id, FALSE)
- RETURNING "id" INTO ann10_id;
-
- -- Insert mock attachments
- INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
-      (gen_random_uuid(), ann1_id, 'Exam_Schedule_Spring_2025.pdf', '/documents/exam_schedule.pdf', 'pdf');
-
- INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
-      (gen_random_uuid(), ann2_id, 'Gala_Invitation.pdf', '/documents/gala_invitation.pdf', 'pdf'),
-      (gen_random_uuid(), ann2_id, 'Venue_Map.jpg', '/images/venue_map.jpg', 'image');
-
- INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
-      (gen_random_uuid(), ann4_id, 'Research_Grant_Guidelines.pdf', '/documents/research_guidelines.pdf', 'pdf');
-
- INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
-      (gen_random_uuid(), ann6_id, 'Internship_Application_Form.doc', '/documents/internship_application.doc', 'doc');
-
- INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
-      (gen_random_uuid(), ann9_id, 'Workshop_Schedule.pdf', '/documents/workshop_schedule.pdf', 'pdf');
-
- -- Insert mock bookmarks for test user
- INSERT INTO "user_bookmark" ("id", "user_id", "announcement_id") VALUES
-      (gen_random_uuid(), test_user_id, ann1_id),
-      (gen_random_uuid(), test_user_id, ann4_id),
-      (gen_random_uuid(), test_user_id, ann7_id);
  +END $$;
  \ No newline at end of file
  diff --git a/packages/db/drizzle/meta/0000_snapshot.json b/packages/db/drizzle/meta/0000_snapshot.json
  new file mode 100644
  index 0000000..8c8b854
  --- /dev/null
  +++ b/packages/db/drizzle/meta/0000_snapshot.json
  @@ -0,0 +1,682 @@
  +{}
  diff --git a/packages/db/drizzle/meta/0001_snapshot.json b/packages/db/drizzle/meta/0001_snapshot.json
  new file mode 100644
  index 0000000..fd54bcb
  --- /dev/null
  +++ b/packages/db/drizzle/meta/0001_snapshot.json
  @@ -0,0 +1,682 @@
  +{}
  diff --git a/packages/db/drizzle/meta/\_journal.json b/packages/db/drizzle/meta/\_journal.json
  new file mode 100644
  index 0000000..a258091
  --- /dev/null
  +++ b/packages/db/drizzle/meta/\_journal.json
  @@ -0,0 +1,20 @@
  +{
- "version": "7",
- "dialect": "postgresql",
- "entries": [
- {
-      "idx": 0,
-      "version": "7",
-      "when": 1746527133620,
-      "tag": "0000_open_venom",
-      "breakpoints": true
- },
- {
-      "idx": 1,
-      "version": "7",
-      "when": 1746527139371,
-      "tag": "0001_mock-data",
-      "breakpoints": true
- }
- ]
  +}
  \ No newline at end of file
  diff --git a/packages/db/src/relations.ts b/packages/db/src/relations.ts
  index 885ba3e..ff1ce65 100644
  --- a/packages/db/src/relations.ts
  +++ b/packages/db/src/relations.ts
  @@ -1,15 +1,51 @@
  import { relations } from "drizzle-orm";
  -import { account, session, user } from "./schema";
  +import {
- account,
- session,
- user,
- category,
- author,
- announcement,
- attachment,
- userBookmark
  +} from "./schema";

+// Existing relations
export const userRelations = relations(user, ({ many }) => ({
accounts: many(account),

- sessions: many(session)

* sessions: many(session),
* bookmarks: many(userBookmark)
  }));

export const accountRelations = relations(account, ({ one }) => ({
user: one(user, { fields: [account.userId], references: [user.id] }),
}));

-export const SessionRelations = relations(session, ({ one }) => ({
+export const sessionRelations = relations(session, ({ one }) => ({
user: one(user, { fields: [session.userId], references: [user.id] }),
+}));

- +// New relations for university announcements app
  +export const categoryRelations = relations(category, ({ many }) => ({
- announcements: many(announcement)
  +}));
- +export const authorRelations = relations(author, ({ many }) => ({
- announcements: many(announcement)
  +}));
- +export const announcementRelations = relations(announcement, ({ one, many }) => ({
- category: one(category, { fields: [announcement.categoryId], references: [category.id] }),
- author: one(author, { fields: [announcement.authorId], references: [author.id] }),
- attachments: many(attachment),
- bookmarks: many(userBookmark)
  +}));
- +export const attachmentRelations = relations(attachment, ({ one }) => ({
- announcement: one(announcement, { fields: [attachment.announcementId], references: [announcement.id] })
  +}));
- +export const userBookmarkRelations = relations(userBookmark, ({ one }) => ({
- user: one(user, { fields: [userBookmark.userId], references: [user.id] }),
- announcement: one(announcement, { fields: [userBookmark.announcementId], references: [announcement.id] })
  }));
  \ No newline at end of file
  diff --git a/packages/db/src/schema.ts b/packages/db/src/schema.ts
  index 94c2869..b9b154b 100644
  --- a/packages/db/src/schema.ts
  +++ b/packages/db/src/schema.ts
  @@ -1,4 +1,4 @@
  -import { uniqueIndex, index, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";
  +import { uniqueIndex, index, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
  import { createTable, fk, lower } from "./utils";

// Edit the type to add user roles for RBAC
@@ -63,4 +63,66 @@ export const session = createTable("session", {

export type Session = typeof session.$inferSelect;
 export type NewSession = typeof session.$inferInsert;
-// **\*\*\***\_\***\*\*\*\***\_\***\*\*\*\***\_\***\*\*\*\***\_\***\*\*\*\***\_\***\*\*\*\***\_**
\ No newline at end of file
+// **\*\***\*\_\*\***\*\***\*\_\*\***\*\***\*\_\*\***\*\***\*\_\*\***\*\***\*\_\*\***\*\***\*\_**

- +// University Announcements App Schema
- +export const category = createTable("category", {
- name: varchar({ length: 100 }).notNull(),
- color: varchar({ length: 20 }).notNull(),
  +});
- +export type Category = typeof category.$inferSelect;
+export type NewCategory = typeof category.$inferInsert;
- +export const author = createTable("author", {
- name: varchar({ length: 100 }).notNull(),
- role: varchar({ length: 100 }).notNull(),
- department: varchar({ length: 100 }).notNull(),
- avatar: varchar({ length: 255 }),
  +});
- +export type Author = typeof author.$inferSelect;
+export type NewAuthor = typeof author.$inferInsert;
- +export const announcement = createTable("announcement", {
- title: varchar({ length: 255 }).notNull(),
- content: text().notNull(),
- date: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
- categoryId: fk("category_id", () => category, {
- onDelete: "cascade",
- }).notNull(),
- authorId: fk("author_id", () => author, { onDelete: "cascade" }).notNull(),
- isImportant: boolean().notNull().default(false),
  +});
- +export type Announcement = typeof announcement.$inferSelect;
+export type NewAnnouncement = typeof announcement.$inferInsert;
- +export const attachment = createTable("attachment", {
- announcementId: fk("announcement_id", () => announcement, {
- onDelete: "cascade",
- }).notNull(),
- name: varchar({ length: 255 }).notNull(),
- url: varchar({ length: 255 }).notNull(),
- type: varchar({ length: 20 }).notNull(),
  +});
- +export type Attachment = typeof attachment.$inferSelect;
+export type NewAttachment = typeof attachment.$inferInsert;
- +export const userBookmark = createTable(
- "user_bookmark",
- {
- userId: fk("user_id", () => user, { onDelete: "cascade" }).notNull(),
- announcementId: fk("announcement_id", () => announcement, {
-      onDelete: "cascade",
- }).notNull(),
- },
- (t) => [
- uniqueIndex("user_bookmark_unique_idx").on(t.userId, t.announcementId),
- ],
  +);
- +export type UserBookmark = typeof userBookmark.$inferSelect;
+export type NewUserBookmark = typeof userBookmark.$inferInsert;
  \ No newline at end of file
