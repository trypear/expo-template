import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/hooks/api";
import { useUser } from "@/hooks/auth";
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
    <ThemedView className="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <View className="mb-2 flex-row items-center justify-between">
        <ThemedText className="text-sm text-gray-500">
          By {item.author.name ?? "Unknown"}
        </ThemedText>
        {canDelete && (
          <ThemedText className="text-red-500" onPress={onDelete}>
            Delete
          </ThemedText>
        )}
      </View>
      <ThemedText className="text-gray-600 dark:text-gray-400">
        {item.comment.content}
      </ThemedText>
    </ThemedView>
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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!announcement) {
    return (
      <View className="flex-1 items-center justify-center">
        <ThemedText>Announcement not found</ThemedText>
      </View>
    );
  }

  const isAdmin = currentUser && currentUser.userRole === "admin";
  const canDeleteComment = (commentUserId: string) =>
    isAdmin || (currentUser && currentUser.id === commentUserId);

  return (
    <ThemedView className="flex-1">
      <Stack.Screen
        options={{
          title: "Announcement",
          headerShown: true,
        }}
      />
      <View className="flex-1 p-4">
        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <ThemedText className="text-xl font-bold">
              {announcement.announcement.title}
            </ThemedText>
            {announcement.announcement.isPinned && (
              <ThemedText className="text-blue-500">📌 Pinned</ThemedText>
            )}
          </View>
          <ThemedText className="mb-4 text-gray-600 dark:text-gray-400">
            {announcement.announcement.content}
          </ThemedText>
          <ThemedText className="text-sm text-gray-500">
            By {announcement.createdBy.name ?? "Unknown"}
          </ThemedText>
        </View>

        {isAdmin && (
          <View className="mb-4 flex-row space-x-2">
            <ThemedView
              className="flex-1 rounded-lg bg-blue-500 p-3"
              onTouchEnd={() => void togglePinMutation.mutate()}
            >
              <ThemedText className="text-center font-bold text-white">
                {announcement.announcement.isPinned ? "Unpin" : "Pin"}
              </ThemedText>
            </ThemedView>
            <ThemedView
              className="flex-1 rounded-lg bg-red-500 p-3"
              onTouchEnd={() => void deleteAnnouncementMutation.mutate()}
            >
              <ThemedText className="text-center font-bold text-white">
                Delete
              </ThemedText>
            </ThemedView>
          </View>
        )}

        {currentUser && (
          <View className="mb-4 flex-row space-x-2">
            <TextInput
              className="flex-1 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <ThemedView
              className="rounded-lg bg-blue-500 px-4 py-3"
              onTouchEnd={() => {
                if (newComment.trim()) {
                  void createCommentMutation.mutate(newComment.trim());
                }
              }}
            >
              <ThemedText className="font-bold text-white">Send</ThemedText>
            </ThemedView>
          </View>
        )}

        <FlatList
          data={comments}
          renderItem={({ item }) => (
            <CommentCard
              item={item}
              canDelete={canDeleteComment(item.author.id)}
              onDelete={() =>
                void deleteCommentMutation.mutate(item.comment.id)
              }
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
            <ThemedText className="py-4 text-center">
              No comments yet
            </ThemedText>
          }
        />
      </View>
    </ThemedView>
  );
}
