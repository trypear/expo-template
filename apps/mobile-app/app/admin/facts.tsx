import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
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
import { useMutation, useQuery } from "@tanstack/react-query";

export default function FactsManagementScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Get all facts
  const factsQuery = trpc.facts.getFacts.queryOptions();
  const {
    data: facts,
    isLoading,
    refetch: refetchFacts,
  } = useQuery({
    ...factsQuery,
  });

  // Delete fact mutation
  const deleteMutation = useMutation(
    trpc.facts.deleteFact.mutationOptions({
      onSuccess: () => {
        void refetchFacts();
      },
    }),
  );

  const handleDeleteFact = (id: string) => {
    Alert.alert("Delete Fact", "Are you sure you want to delete this fact?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate({ id });
        },
      },
    ]);
  };

  const renderFactItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.factItem}>
      <View style={styles.factContent}>
        <ThemedText style={styles.factText}>{item.content}</ThemedText>
        {item.category && (
          <ThemedView style={styles.categoryTag}>
            <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
          </ThemedView>
        )}
      </View>
      <View style={styles.factActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
          onPress={() => router.push(`/admin/edit-fact?id=${item.id}`)}
        >
          <Icon name="settings" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#6C5CE7" }]}
          onPress={() => router.push(`/admin/queue-fact?id=${item.id}`)}
        >
          <Icon name="calendar" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#FF7675" }]}
          onPress={() => handleDeleteFact(item.id)}
        >
          <Icon name="folder" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon
            name="house"
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
        <ThemedText type="title">Manage Facts</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin/add-fact")}
        >
          <Icon name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={facts}
          renderItem={renderFactItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.factsList}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>No facts found</ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  factsList: {
    paddingBottom: 20,
  },
  factItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 12,
  },
  factContent: {
    marginBottom: 12,
  },
  factText: {
    fontSize: 16,
    lineHeight: 24,
  },
  categoryTag: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryText: {
    fontSize: 12,
  },
  factActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    opacity: 0.6,
  },
});
