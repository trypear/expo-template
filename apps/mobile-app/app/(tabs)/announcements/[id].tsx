import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { RouterOutputs } from "@acme/api";

type CommentItem =
  RouterOutputs["announcement"]["getComments"]["items"][number];

interface User {
  id: string;
  userRole: "admin" | "student" | "faculty";
}

const CommentCard = ({
  item,
  canDelete,
  onDelete,
}: {
  item: CommentItem;
  canDelete: boolean;
  onDelete: () => void;
}) => {
  return (
    <View className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <View className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="person-circle-outline" size={20} color="#666" />
            <ThemedText className="ml-2 text-sm text-gray-500">
              {item.author.name ?? "Unknown"}
            </ThemedText>
          </View>
          {canDelete && (
            <Pressable
              onPress={onDelete}
              className="flex-row items-center rounded-full bg-red-100 px-3 py-1 dark:bg-red-900"
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <ThemedText className="ml-1 text-xs font-medium text-red-500">
                Delete
              </ThemedText>
            </Pressable>
          )}
        </View>
        <ThemedText className="text-gray-600 dark:text-gray-400">
          {item.comment.content}
        </ThemedText>
      </View>
    </View>
  );
};

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newComment, setNewComment] = useState("");
  const currentUser = useUser() as User | false;
  const queryClient = useQueryClient();

  const { data: announcement, isLoading: isLoadingAnnouncement } = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => api.announcement.getById.query({ id }),
    enabled: !!id,
  });

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingComments,
    isFetchingNextPage,
    refetch: refetchComments,
    isRefetching: isRefetchingComments,
  } = useInfiniteQuery({
    queryKey: ["announcement-comments", id],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await api.announcement.getComments.query({
        announcementId: id,
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
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    initialPageParam: 1,
    enabled: !!id,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) =>
      api.announcement.createComment.mutate({
        announcementId: id,
        content,
      }),
    onSuccess: () => {
      setNewComment("");
      void refetchComments();
    },
    onError: () => {
      Alert.alert("Error", "Failed to create comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      api.announcement.deleteComment.mutate({ id: commentId }),
    onSuccess: () => {
      void refetchComments();
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete comment");
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: () => api.announcement.togglePin.mutate({ id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["announcement", id] });
      void queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to toggle pin status");
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: () => api.announcement.delete.mutate({ id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["announcements"] });
      router.back();
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete announcement");
    },
  });

  const comments = commentsData?.pages.flatMap((page) => page.items) ?? [];

  if (isLoadingAnnouncement || isLoadingComments) {
    return (
      <ThemedView className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!announcement) {
    return (
      <ThemedView className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Ionicons name="alert-circle-outline" size={48} color="#666" />
        <ThemedText className="mt-4 text-gray-500">
          Announcement not found
        </ThemedText>
      </ThemedView>
    );
  }

  const isAdmin = currentUser && currentUser.userRole === "admin";
  const canDeleteComment = (commentUserId: string) =>
    isAdmin || (currentUser && currentUser.id === commentUserId);

  return (
    <ThemedView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen
        options={{
          title: "Announcement",
          headerShown: true,
        }}
      />
      <View className="flex-1 p-4">
        <View className="mb-4 overflow-hidden rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <View className="mb-4 flex-row items-start justify-between">
            <ThemedText className="flex-1 text-2xl font-bold">
              {announcement.announcement.title}
            </ThemedText>
            {announcement.announcement.isPinned && (
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

          <ThemedText className="mb-4 text-base leading-relaxed text-gray-600 dark:text-gray-400">
            {announcement.announcement.content}
          </ThemedText>

          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={16} color="#666" />
              <ThemedText className="ml-2 text-sm text-gray-500">
                {announcement.createdBy.name ?? "Unknown"}
              </ThemedText>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#666" />
              <ThemedText className="ml-2 text-sm text-gray-500">
                {announcement.announcement.createdAt
                  ? new Date(
                      announcement.announcement.createdAt,
                    ).toLocaleDateString()
                  : "No date"}
              </ThemedText>
            </View>
          </View>
        </View>

        {isAdmin && (
          <View className="mb-4 flex-row space-x-2">
            <Pressable
              onPress={() => togglePinMutation.mutate()}
              className="flex-1 flex-row items-center justify-center rounded-lg bg-blue-500 p-3"
            >
              <Ionicons
                name={
                  announcement.announcement.isPinned ? "pin-outline" : "pin"
                }
                size={20}
                color="white"
              />
              <ThemedText className="ml-2 font-bold text-white">
                {announcement.announcement.isPinned ? "Unpin" : "Pin"}
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => deleteAnnouncementMutation.mutate()}
              className="flex-1 flex-row items-center justify-center rounded-lg bg-red-500 p-3"
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <ThemedText className="ml-2 font-bold text-white">
                Delete
              </ThemedText>
            </Pressable>
          </View>
        )}

        {currentUser && (
          <View className="mb-4 flex-row space-x-2">
            <TextInput
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Add a comment..."
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
            />
            <Pressable
              onPress={() => {
                if (newComment.trim()) {
                  createCommentMutation.mutate(newComment.trim());
                }
              }}
              disabled={createCommentMutation.isPending || !newComment.trim()}
              className={`flex-row items-center justify-center rounded-lg px-4 ${
                createCommentMutation.isPending || !newComment.trim()
                  ? "bg-blue-300 dark:bg-blue-800"
                  : "bg-blue-500 dark:bg-blue-600"
              }`}
            >
              <Ionicons
                name={createCommentMutation.isPending ? "time-outline" : "send"}
                size={20}
                color="white"
              />
            </Pressable>
          </View>
        )}

        <FlatList
          data={comments}
          renderItem={({ item }) => (
            <CommentCard
              item={item}
              canDelete={canDeleteComment(item.author.id)}
              onDelete={() => deleteCommentMutation.mutate(item.comment.id)}
            />
          )}
          keyExtractor={(item) => item.comment.id}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingComments}
              onRefresh={() => void refetchComments()}
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
              <Ionicons name="chatbubbles-outline" size={48} color="#666" />
              <ThemedText className="mt-4 text-center text-gray-500">
                No comments yet
              </ThemedText>
            </View>
          }
        />
      </View>
    </ThemedView>
  );
}
