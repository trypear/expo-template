import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { Link, Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";
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
    <Link href={`/announcements/${item.announcement.id}`} asChild>
      <Pressable className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <View className="p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <ThemedText className="flex-1 text-xl font-bold">
              {item.announcement.title}
            </ThemedText>
            {item.announcement.isPinned && (
              <View className="ml-2 rounded-full bg-red-100 px-3 py-1 dark:bg-red-900">
                <View className="flex-row items-center">
                  <Ionicons name="pin" size={16} color="#FF4444" />
                  <ThemedText className="ml-1 text-xs font-medium text-red-500">
                    Pinned
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          <ThemedText
            className="mb-4 text-base text-gray-600 dark:text-gray-400"
            numberOfLines={2}
          >
            {item.announcement.content}
          </ThemedText>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={14} color="#666" />
              <ThemedText className="ml-1 text-sm text-gray-500">
                {item.createdBy.name ?? "Unknown"}
              </ThemedText>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#666" />
              <ThemedText className="ml-1 text-sm text-gray-500">
                {item.announcement.createdAt
                  ? new Date(item.announcement.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default function AnnouncementsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const user = useUser() as User | false;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["announcements"],
    queryFn: async ({ pageParam = 1 }) => {
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
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 1,
  });

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
      <ThemedView className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen
        options={{
          title: "Announcements",
          headerShown: true,
        }}
      />
      <View className="flex-1 p-4">
        <View className="mb-4 flex-row space-x-2">
          <View className="flex-1 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
            <View className="flex-row items-center px-4 py-3">
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                className="ml-2 flex-1 text-base text-gray-900 dark:text-white"
                placeholder="Search announcements..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          {(user as { userRole?: string })?.userRole === "admin" && (
            <Link href="/announcements/new" asChild>
              <Pressable className="items-center justify-center rounded-xl bg-blue-500 px-4 shadow-sm">
                <Ionicons name="add" size={24} color="white" />
              </Pressable>
            </Link>
          )}
        </View>

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
            <View className="items-center justify-center rounded-xl bg-white p-8 dark:bg-gray-800">
              <Ionicons name="newspaper-outline" size={48} color="#666" />
              <ThemedText className="mt-4 text-center text-gray-500">
                No announcements found
              </ThemedText>
            </View>
          }
        />
      </View>
    </ThemedView>
  );
}
