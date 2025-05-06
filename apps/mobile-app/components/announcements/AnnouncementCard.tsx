import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useQuery } from "@tanstack/react-query";

import { BookmarkButton } from "../announcements/BookmarkButton";

// Define types based on API schema
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string | Date;
  categoryId: string;
  authorId: string;
  isImportant: boolean;
  category: {
    id: string;
    name: string;
    color: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  } | null;
  author: {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar?: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  } | null;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const router = useRouter();
  const _colorScheme = useColorScheme() ?? "light";

  // Get user bookmarks to determine if this announcement is bookmarked
  const { data: bookmarkedIds = [] } = useQuery(
    trpc.announcement.getUserBookmarks.queryOptions(),
  );

  // Type-safe way to check if announcement is bookmarked
  const isBookmarked =
    Array.isArray(bookmarkedIds) && bookmarkedIds.includes(announcement.id);

  // Extract category and author from the announcement object with null checks
  const category = announcement.category || {
    id: "",
    name: "Unknown",
    color: "#999999",
  };
  const author = announcement.author || {
    id: "",
    name: "Unknown",
    role: "",
    department: "",
  };

  // Format the date
  const formattedDate = new Date(announcement.date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  const handlePress = () => {
    // Navigate to the announcement detail screen
    router.push({
      pathname: "/announcement-detail/[id]",
      params: { id: announcement.id },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView style={styles.card}>
        {/* Important badge */}
        {announcement.isImportant && (
          <View style={styles.importantBadge}>
            <ThemedText style={styles.importantText}>Important</ThemedText>
          </View>
        )}

        {/* Category badge */}
        <View
          style={[styles.categoryBadge, { backgroundColor: category.color }]}
        >
          <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
        </View>

        <ThemedText type="subtitle" style={styles.title}>
          {announcement.title}
        </ThemedText>

        <ThemedText numberOfLines={2} style={styles.content}>
          {announcement.content}
        </ThemedText>

        <View style={styles.footer}>
          <View style={styles.metaInfo}>
            <ThemedText style={styles.author}>{author.name}</ThemedText>
            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          </View>

          <BookmarkButton id={announcement.id} isBookmarked={isBookmarked} />
        </View>

        {/* Attachments indicator */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <View style={styles.attachmentIndicator}>
            <ThemedText style={styles.attachmentText}>
              {announcement.attachments.length} attachment
              {announcement.attachments.length > 1 ? "s" : ""}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  importantBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  importantText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    marginBottom: 8,
  },
  content: {
    marginBottom: 16,
    opacity: 0.8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaInfo: {
    flex: 1,
  },
  author: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
  attachmentIndicator: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  attachmentText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
