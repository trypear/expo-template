import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { BookmarkButton } from "@/components/announcements/BookmarkButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useQuery } from "@tanstack/react-query";

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Fetch announcement details
  const {
    data: announcement,
    isLoading,
    isError,
  } = useQuery(
    trpc.announcement.getAnnouncementById.queryOptions({
      id: id || "",
    }),
  );

  // Fetch user bookmarks
  const { data: bookmarkedIds = [] } = useQuery(
    trpc.announcement.getUserBookmarks.queryOptions(),
  );

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Loading...",
            headerShown: true,
          }}
        />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={{ marginTop: 16 }}>
            Loading announcement...
          </ThemedText>
        </View>
      </>
    );
  }

  // Error state
  if (isError || !announcement) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Not Found",
            headerShown: true,
          }}
        />
        <ThemedView style={styles.container}>
          <ThemedText type="title">Announcement Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The announcement you're looking for doesn't exist or has been
            removed.
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  // Extract category and author with null checks
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
  const isBookmarked =
    Array.isArray(bookmarkedIds) && bookmarkedIds.includes(announcement.id);

  // Format the date
  const formattedDate = new Date(announcement.date).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Announcement",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          {/* Category badge */}
          <View
            style={[styles.categoryBadge, { backgroundColor: category.color }]}
          >
            <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
          </View>

          {/* Important badge */}
          {announcement.isImportant && (
            <View style={styles.importantBadge}>
              <ThemedText style={styles.importantText}>Important</ThemedText>
            </View>
          )}

          <ThemedText type="title" style={styles.title}>
            {announcement.title}
          </ThemedText>

          <View style={styles.metaInfo}>
            <ThemedText style={styles.author}>By {author.name}</ThemedText>
            <ThemedText style={styles.authorRole}>
              {author.role}, {author.department}
            </ThemedText>
            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          </View>

          <View style={styles.bookmarkContainer}>
            <BookmarkButton id={announcement.id} isBookmarked={isBookmarked} />
          </View>
        </ThemedView>

        <ThemedView style={styles.contentContainer}>
          <ThemedText style={styles.content}>{announcement.content}</ThemedText>
        </ThemedView>

        {announcement.attachments && announcement.attachments.length > 0 && (
          <ThemedView style={styles.attachmentsContainer}>
            <ThemedText type="subtitle" style={styles.attachmentsTitle}>
              Attachments
            </ThemedText>

            {announcement.attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachmentItem}>
                <View style={styles.attachmentIcon}>
                  <ThemedText style={styles.attachmentIconText}>
                    {attachment.type === "pdf"
                      ? "PDF"
                      : attachment.type === "doc"
                        ? "DOC"
                        : attachment.type === "image"
                          ? "IMG"
                          : "FILE"}
                  </ThemedText>
                </View>
                <View style={styles.attachmentInfo}>
                  <ThemedText style={styles.attachmentName}>
                    {attachment.name}
                  </ThemedText>
                </View>
                <Button variant="outline">View</Button>
              </View>
            ))}
          </ThemedView>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
  importantBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    marginLeft: 8,
  },
  importantText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    marginBottom: 16,
  },
  metaInfo: {
    marginBottom: 16,
  },
  author: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  authorRole: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  bookmarkContainer: {
    alignItems: "flex-start",
  },
  contentContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  attachmentsContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  attachmentsTitle: {
    marginBottom: 16,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  attachmentIconText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  attachmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
});
