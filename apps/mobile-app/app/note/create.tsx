"use client";

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CreateNoteScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();

  // State for form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Create note mutation
  const createMutation = useMutation(
    trpc.notes.createNote.mutationOptions({
      onSuccess: () => {
        // Invalidate queries to refresh data
        void queryClient.invalidateQueries(trpc.notes.getNotes.queryOptions());
        router.back();
      },
      onError: (error) => {
        Alert.alert("Error", error.message);
      },
    }),
  );

  // Handle save
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title cannot be empty");
      return;
    }

    createMutation.mutate({
      title,
      content,
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Create Note",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={createMutation.isPending}
            >
              <ThemedText
                style={{
                  color: Colors[colorScheme ?? "light"].tint,
                  fontWeight: "600",
                }}
              >
                Save
              </ThemedText>
            </TouchableOpacity>
          ),
        }}
      />

      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ScrollView style={{ flex: 1 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Note Title"
            placeholderTextColor={
              Colors[colorScheme ?? "light"].placeholderText
            }
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 16,
              color: Colors[colorScheme ?? "light"].text,
              borderBottomWidth: 1,
              borderBottomColor: Colors[colorScheme ?? "light"].border,
              paddingBottom: 8,
            }}
          />
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Note Content"
            placeholderTextColor={
              Colors[colorScheme ?? "light"].placeholderText
            }
            multiline
            style={{
              fontSize: 16,
              color: Colors[colorScheme ?? "light"].text,
              textAlignVertical: "top",
              minHeight: 200,
            }}
          />
        </ScrollView>

        {createMutation.isPending && (
          <View style={{ position: "absolute", bottom: 20, right: 20 }}>
            <ActivityIndicator color={Colors[colorScheme ?? "light"].tint} />
          </View>
        )}
      </ThemedView>
    </>
  );
}
