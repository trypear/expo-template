import React from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { trpc } from "@/hooks/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

export default function NewHelpRequestScreen() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const createMutation = useMutation(
    trpc.helpRequest.create.mutationOptions({
      onSuccess: () => {
        router.back();
      },
    }),
  );

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <ThemedView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <View className="overflow-hidden rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <View className="mb-6">
            <View className="mb-4">
              <ThemedText className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </ThemedText>
              <TextInput
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Enter a title for your request"
                placeholderTextColor="#666"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View>
              <ThemedText className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </ThemedText>
              <TextInput
                className="h-40 rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Describe your request in detail"
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={
              createMutation.isPending || !title.trim() || !description.trim()
            }
            className={`flex-row items-center justify-center rounded-lg p-4 ${
              createMutation.isPending || !title.trim() || !description.trim()
                ? "bg-blue-300 dark:bg-blue-800"
                : "bg-blue-500 dark:bg-blue-600"
            }`}
          >
            <Ionicons
              name={
                createMutation.isPending
                  ? "time-outline"
                  : "paper-plane-outline"
              }
              size={20}
              color="white"
            />
            <ThemedText className="ml-2 font-medium text-white">
              {createMutation.isPending ? "Submitting..." : "Submit Request"}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
