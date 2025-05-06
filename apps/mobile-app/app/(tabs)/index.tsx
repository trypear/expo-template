import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useQuery } from "@tanstack/react-query";

export default function AnnouncementsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // State for filtering and searching
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery(
    trpc.announcement.getCategories.queryOptions(),
  );

  // Fetch user bookmarks (renamed to avoid unused variable warning)
  const { data: _bookmarkedIds = [] } = useQuery(
    trpc.announcement.getUserBookmarks.queryOptions(),
  );

  // Fetch announcements with filters
  const { data: announcements = [], isLoading: isAnnouncementsLoading } =
    useQuery(
      trpc.announcement.getAnnouncements.queryOptions({
        categoryId: selectedCategory || undefined,
        onlyBookmarked: showBookmarked,
        searchQuery: searchQuery || undefined,
      }),
    );

  // Sort announcements by date (newest first) and important ones at the top
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    // Important announcements first
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;

    // Then sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Loading state
  const isLoading = isCategoriesLoading || isAnnouncementsLoading;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Announcements
        </ThemedText>

        {/* Search bar */}
        <View
          style={[styles.searchContainer, { borderColor: colors.cardBorder }]}
        >
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search announcements..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category filters */}
        <FlatList
          horizontal
          data={[{ id: "all", name: "All", color: colors.tint }, ...categories]}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === item.id ||
                    (item.id === "all" && !selectedCategory)
                      ? item.color
                      : "transparent",
                  borderColor: item.color,
                },
              ]}
              onPress={() =>
                setSelectedCategory(item.id === "all" ? null : item.id)
              }
            >
              <ThemedText
                style={[
                  styles.categoryChipText,
                  {
                    color:
                      selectedCategory === item.id ||
                      (item.id === "all" && !selectedCategory)
                        ? "#FFFFFF"
                        : item.color,
                  },
                ]}
              >
                {item.name}
              </ThemedText>
            </Pressable>
          )}
        />

        {/* Bookmarked filter */}
        <Pressable
          style={[
            styles.bookmarkedChip,
            {
              backgroundColor: showBookmarked ? colors.tint : "transparent",
              borderColor: colors.tint,
            },
          ]}
          onPress={() => setShowBookmarked(!showBookmarked)}
        >
          <ThemedText
            style={[
              styles.bookmarkedChipText,
              { color: showBookmarked ? "#FFFFFF" : colors.tint },
            ]}
          >
            Saved
          </ThemedText>
        </Pressable>
      </View>

      {/* Announcements list with loading state */}
      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.emptyStateTitle}>
            Loading announcements...
          </ThemedText>
        </View>
      ) : sortedAnnouncements.length > 0 ? (
        <FlatList
          data={sortedAnnouncements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnnouncementCard announcement={item} />}
          contentContainerStyle={styles.announcementsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ThemedView style={styles.emptyState}>
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            No announcements found
          </ThemedText>
          <ThemedText style={styles.emptyStateText}>
            {showBookmarked
              ? "You haven't saved any announcements yet."
              : searchQuery
                ? "No announcements match your search criteria."
                : "There are no announcements in this category."}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  searchContainer: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  searchInput: {
    height: "100%",
    fontSize: 16,
  },
  categoryList: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bookmarkedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  bookmarkedChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  announcementsList: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
