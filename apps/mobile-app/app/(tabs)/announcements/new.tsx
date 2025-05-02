import React, { useState } from "react";
import { ActivityIndicator, Alert, TextInput, View } from "react-native";
import { router, Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/hooks/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function NewAnnouncementScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const createAnnouncementMutation = useMutation({
    mutationFn: () =>
      api.announcement.create.mutate({
        title,
        content,
        isPinned: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["announcements"] });
      router.back();
    },
    onError: () => {
      Alert.alert("Error", "Failed to create announcement");
    },
  });

  const isValid = title.trim() && content.trim();

  return (
    <ThemedView className="flex-1">
      <Stack.Screen
        options={{
          title: "New Announcement",
          headerShown: true,
        }}
      />
      <View className="flex-1 p-4">
        <TextInput
          className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          className="mb-4 h-40 rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <ThemedView
          className={`rounded-lg p-3 ${
            isValid ? "bg-blue-500" : "bg-gray-400"
          }`}
          onTouchEnd={() => {
            if (isValid && !createAnnouncementMutation.isPending) {
              void createAnnouncementMutation.mutate();
            }
          }}
        >
          {createAnnouncementMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText className="text-center font-bold text-white">
              Create Announcement
            </ThemedText>
          )}
        </ThemedView>
      </View>
    </ThemedView>
  );
}
