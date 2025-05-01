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
import DatePicker from "@/components/DatePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function FactQueueScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Get fact queue
  const factQueueQuery = trpc.facts.getFactQueue.queryOptions({
    startDate,
    endDate,
  });

  const {
    data: queuedFacts,
    isLoading,
    refetch: refetchQueue,
  } = useQuery({
    ...factQueueQuery,
  });

  // Remove from queue mutation
  const removeFromQueueMutation = useMutation(
    trpc.facts.removeFromQueue.mutationOptions({
      onSuccess: () => {
        void refetchQueue();
      },
    }),
  );

  const handleRemoveFromQueue = (id: string) => {
    Alert.alert(
      "Remove from Queue",
      "Are you sure you want to remove this fact from the queue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeFromQueueMutation.mutate({ id });
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  interface QueuedFactItem {
    factQueue: {
      id: string;
      scheduledDate: string;
      isShown: boolean;
    };
    fact: {
      id: string;
      content: string;
      category: string | null;
    };
  }

  const renderQueueItem = ({ item }: { item: QueuedFactItem }) => (
    <ThemedView style={styles.queueItem}>
      <View style={styles.queueItemHeader}>
        <ThemedText style={styles.dateText}>
          {formatDate(item.factQueue.scheduledDate)}
        </ThemedText>
        <ThemedView
          style={[
            styles.statusTag,
            { backgroundColor: item.factQueue.isShown ? "#4CAF50" : "#FF9800" },
          ]}
        >
          <ThemedText style={styles.statusText}>
            {item.factQueue.isShown ? "Shown" : "Pending"}
          </ThemedText>
        </ThemedView>
      </View>
      <ThemedText style={styles.factText}>{item.fact.content}</ThemedText>
      {item.fact.category && (
        <ThemedView style={styles.categoryTag}>
          <ThemedText style={styles.categoryText}>
            {item.fact.category}
          </ThemedText>
        </ThemedView>
      )}
      <View style={styles.queueActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#FF7675" }]}
          onPress={() => handleRemoveFromQueue(item.factQueue.id)}
        >
          <Icon name="folder" size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>Remove</ThemedText>
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
        <ThemedText type="title">Fact Queue</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin/facts")}
        >
          <Icon name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <View style={styles.dateFilter}>
          <ThemedText style={styles.filterLabel}>Start Date</ThemedText>
          <DatePicker value={startDate} onChange={setStartDate} />
        </View>
        <View style={styles.dateFilter}>
          <ThemedText style={styles.filterLabel}>End Date</ThemedText>
          <DatePicker value={endDate} onChange={setEndDate} />
        </View>
      </View>

      {isLoading && (
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
          style={styles.loader}
        />
      )}

      {!isLoading && (
        <FlatList
          data={queuedFacts}
          renderItem={renderQueueItem}
          keyExtractor={(item) => item.factQueue.id}
          contentContainerStyle={styles.queueList}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              No queued facts found
            </ThemedText>
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
  filters: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dateFilter: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    marginBottom: 4,
    fontSize: 12,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  queueList: {
    paddingBottom: 20,
  },
  queueItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 12,
  },
  queueItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  factText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
  },
  queueActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    opacity: 0.6,
  },
});
