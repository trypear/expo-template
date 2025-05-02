import React from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { trpc } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

interface AnnouncementItem {
  announcement: {
    id: string;
    title: string;
    content: string;
    createdAt: Date | null;
    isPinned: boolean;
  };
  createdBy: {
    id: string;
    name: string | null;
  };
  commentCount?: number;
}

export default function AnnouncementsScreen() {
  const router = useRouter();
  const user = useUser();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch } = useQuery(
    trpc.announcement.getAll.queryOptions({
      page: 1,
      limit: 20,
    }),
  );

  const announcements = data?.items ?? [];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <ThemedView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList<AnnouncementItem>
        data={announcements}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push(`/announcements/${item.announcement.id}`)
            }
            className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800"
          >
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <ThemedText className="flex-1 text-xl font-bold">
                  {item.announcement.title}
                </ThemedText>
                {item.announcement.isPinned && (
                  <View className="ml-2 rounded-full bg-red-100 px-2 py-1 dark:bg-red-900">
                    <View className="flex-row items-center">
                      <Ionicons name="pin" size={12} color="#FF4444" />
                      <ThemedText className="ml-1 text-xs font-medium text-red-500">
                        Pinned
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>

              <ThemedText
                className="mt-2 text-base text-gray-600 dark:text-gray-400"
                numberOfLines={2}
              >
                {item.announcement.content}
              </ThemedText>

              <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <ThemedText className="ml-1 text-sm text-gray-500">
                    {item.announcement.createdAt
                      ? new Date(
                          item.announcement.createdAt,
                        ).toLocaleDateString()
                      : "No date"}
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <ThemedText className="mr-1 text-sm text-gray-500">
                    {item.commentCount ?? 0}
                  </ThemedText>
                  <Ionicons name="chatbubble-outline" size={16} color="#666" />
                </View>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center rounded-xl bg-white p-8 dark:bg-gray-800">
            <Ionicons name="newspaper-outline" size={48} color="#666" />
            <ThemedText className="mt-4 text-center text-gray-500">
              No announcements yet
            </ThemedText>
          </View>
        )}
      />
      {(user as { role?: string })?.role === "admin" && (
        <Link href="/announcements/new" asChild>
          <Pressable className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg">
            <Ionicons name="add" size={30} color="white" />
          </Pressable>
        </Link>
      )}
    </ThemedView>
  );
}
