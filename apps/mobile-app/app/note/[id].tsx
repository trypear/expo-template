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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch note data
  const { data: note } = useQuery(
    trpc.notes.getNote.queryOptions({
      id,
    }),
  );

  // Mock loading state for demonstration
  const [mockLoading] = useState(false);

  // Initialize form with note data when it loads
  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content ?? "");
    }
  }, [note]);

  // Update note mutation
  const updateMutation = useMutation(
    trpc.notes.updateNote.mutationOptions({
      onSuccess: () => {
        // Invalidate queries to refresh data
        void queryClient.invalidateQueries(trpc.notes.getNotes.queryOptions());
        void queryClient.invalidateQueries(
          trpc.notes.getNote.queryOptions({
            id,
          }),
        );
        setIsEditing(false);
      },
      onError: (error) => {
        Alert.alert("Error", error.message);
      },
    }),
  );

  // Delete note mutation
  const deleteMutation = useMutation(
    trpc.notes.deleteNote.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.notes.getNotes.queryOptions());
        router.back();
      },
      onError: (error) => {
        Alert.alert("Error", error.message);
      },
    }),
  );

  // Handle save changes
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title cannot be empty");
      return;
    }

    updateMutation.mutate({
      id,
      data: {
        title,
        content,
      },
    });
  };

  // Handle delete note
  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => deleteMutation.mutate({ id }),
        style: "destructive",
      },
    ]);
  };

  // Show loading indicator
  if (mockLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: isEditing ? "Edit Note" : "Note Details",
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              {isEditing ? (
                <TouchableOpacity
                  onPress={handleSave}
                  style={{ marginRight: 15 }}
                  disabled={updateMutation.isPending}
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
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={{ marginRight: 15 }}
                >
                  <ThemedText
                    style={{
                      color: Colors[colorScheme ?? "light"].tint,
                      fontWeight: "600",
                    }}
                  >
                    Edit
                  </ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Icon
                  name="folder"
                  color={Colors[colorScheme ?? "light"].negative}
                  size={20}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ScrollView style={{ flex: 1 }}>
          {isEditing ? (
            <>
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
            </>
          ) : (
            <>
              <ThemedText
                style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}
              >
                {note?.title}
              </ThemedText>
              <ThemedText style={{ fontSize: 16 }}>
                {note?.content ?? "No content"}
              </ThemedText>
            </>
          )}
        </ScrollView>

        {updateMutation.isPending && (
          <View style={{ position: "absolute", bottom: 20, right: 20 }}>
            <ActivityIndicator color={Colors[colorScheme ?? "light"].tint} />
          </View>
        )}
      </ThemedView>
    </>
  );
}
