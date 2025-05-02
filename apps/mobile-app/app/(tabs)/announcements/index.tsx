import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { Link, Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
import { useInfiniteQuery } from "@tanstack/react-query";

import type { RouterOutputs } from "@acme/api";

type AnnouncementItem =
  RouterOutputs["announcement"]["getAll"]["items"][number];

interface User {
  id: string;
  userRole: "admin" | "student" | "faculty";
}

const AnnouncementCard = ({ item }: { item: AnnouncementItem }) => {
  return (
    <Link href={`../${item.announcement.id}`}>
      <ThemedView className="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <View className="mb-2 flex-row items-center justify-between">
          <ThemedText className="flex-1 text-lg font-bold">
            {item.announcement.title}
          </ThemedText>
          {item.announcement.isPinned && (
            <ThemedText className="text-blue-500">📌 Pinned</ThemedText>
          )}
        </View>
        <ThemedText
          className="mb-2 text-gray-600 dark:text-gray-400"
          numberOfLines={2}
        >
          {item.announcement.content}
        </ThemedText>
        <View className="flex-row items-center justify-between">
          <ThemedText className="text-sm text-gray-500">
            By {item.createdBy.name ?? "Unknown"}
          </ThemedText>
          <ThemedText className="text-sm text-gray-500">
            {item.announcement.createdAt
              ? new Date(item.announcement.createdAt).toLocaleDateString()
              : "Unknown date"}
          </ThemedText>
        </View>
      </ThemedView>
    </Link>
  );
};

export default function AnnouncementsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const user = useUser() as User | false;

  const query = useInfiniteQuery({
    queryKey: ["announcements"],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // const result = await trpc.announcement.getAll.query({
        //   page: pageParam,
        //   limit: 10,
        // });

        const result = await api.announcement.getAll.query({
          page: pageParam,
          limit: 10,
        });

        return {
          items: result.items,
          nextCursor:
            result.metadata.currentPage < result.metadata.totalPages
              ? result.metadata.currentPage + 1
              : undefined,
          metadata: result.metadata,
        };
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 1,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = query;

  const announcements = data?.pages.flatMap((page) => page.items) ?? [];
  const pinnedAnnouncements = announcements.filter(
    (a) => a.announcement.isPinned,
  );
  const unpinnedAnnouncements = announcements.filter(
    (a) => !a.announcement.isPinned,
  );

  const filteredAnnouncements = [
    ...pinnedAnnouncements,
    ...unpinnedAnnouncements,
  ].filter(
    (item) =>
      item.announcement.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.announcement.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemedView className="flex-1">
      <Stack.Screen
        options={{
          title: "Announcements",
          headerShown: true,
        }}
      />
      <View className="p-4">
        <TextInput
          className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
          placeholder="Search announcements..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {user && user.userRole === "admin" && (
          <Link href="../new">
            <ThemedView className="mb-4 rounded-lg bg-blue-500 p-3">
              <ThemedText className="text-center font-bold text-white">
                Create New Announcement
              </ThemedText>
            </ThemedView>
          </Link>
        )}

        <FlatList
          data={filteredAnnouncements}
          renderItem={({ item }) => <AnnouncementCard item={item} />}
          keyExtractor={(item) => item.announcement.id}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <ThemedText className="py-4 text-center">
              No announcements found
            </ThemedText>
          }
        />
      </View>
    </ThemedView>
  );
}
