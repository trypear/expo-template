import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface BookmarkButtonProps {
  id: string;
  isBookmarked: boolean;
}

export function BookmarkButton({
  id,
  isBookmarked: initialBookmarked,
}: BookmarkButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const queryClient = useQueryClient();

  // Use TRPC mutation to toggle bookmark status
  const toggleBookmarkMutation = useMutation(
    trpc.announcement.toggleBookmark.mutationOptions({
      onSuccess: () => {
        // Invalidate relevant queries to refresh data
        void queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "announcement.getAnnouncements" ||
            query.queryKey[0] === "announcement.getUserBookmarks",
        });
      },
    }),
  );

  const handleToggleBookmark = () => {
    toggleBookmarkMutation.mutate({ announcementId: id });
  };

  // Determine current bookmark state (optimistic UI update)
  const isBookmarked = toggleBookmarkMutation.isPending
    ? !initialBookmarked // Optimistically toggle during pending state
    : initialBookmarked;

  return (
    <Pressable
      style={[
        styles.bookmarkButton,
        isBookmarked ? { backgroundColor: colors.tint } : styles.notBookmarked,
      ]}
      onPress={handleToggleBookmark}
    >
      <ThemedText
        style={[
          styles.bookmarkText,
          isBookmarked ? styles.bookmarkedText : null,
        ]}
      >
        {isBookmarked ? "Saved" : "Save"}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bookmarkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notBookmarked: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  bookmarkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bookmarkedText: {
    color: "#FFFFFF",
  },
});
