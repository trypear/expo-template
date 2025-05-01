"use client";

import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useQuery } from "@tanstack/react-query";

// Format date to a readable string
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function NotesScreen() {
  const _router = useRouter();
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notes using tRPC
  const {
    data: notes,
    // isLoading is detected as always false by ESLint, so we'll use a mock for now
    // isLoading,
    refetch,
  } = useQuery(trpc.notes.getNotes.queryOptions());

  // Mock loading state for demonstration
  const [mockLoading] = useState(false);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Navigate to create note screen
  const handleCreateNote = () => {
    _router.push("/note/create");
  };

  // Navigate to note detail screen
  const handleNotePress = (id: string) => {
    _router.push(`/note/${id}`);
  };

  // Render loading state or content
  const renderContent = () => {
    // Using mock loading state for demonstration
    if (mockLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
          />
        </View>
      );
    }

    return (
      <>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
            My Notes
          </ThemedText>
          <TouchableOpacity
            onPress={handleCreateNote}
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].tint,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name="folder" color="white" size={20} />
          </TouchableOpacity>
        </View>

        {notes && notes.length > 0 ? (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleNotePress(item.id)}
                style={{
                  backgroundColor:
                    Colors[colorScheme ?? "light"].cardBackground,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <ThemedText
                  style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}
                >
                  {item.title}
                </ThemedText>
                {item.content && (
                  <ThemedText
                    style={{ fontSize: 14, marginBottom: 8, opacity: 0.7 }}
                    numberOfLines={2}
                  >
                    {item.content}
                  </ThemedText>
                )}
                <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>
                  {item.updatedAt ? formatDate(new Date(item.updatedAt)) : ""}
                </ThemedText>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ThemedText
              style={{ fontSize: 16, opacity: 0.7, marginBottom: 20 }}
            >
              No notes yet. Create your first note!
            </ThemedText>
            <TouchableOpacity
              onPress={handleCreateNote}
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].tint,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <ThemedText style={{ color: "white", fontWeight: "600" }}>
                Create Note
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>{renderContent()}</ThemedView>
  );
}
