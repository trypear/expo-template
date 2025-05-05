import type { IconName } from "@/components/ui/Icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { trpc } from "@/hooks/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Fetch transaction with TRPC
  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.budget.getTransactions.queryOptions({
      // We need to use a filter to get a specific transaction by ID
      // The API doesn't have a getTransactionById endpoint, so we filter the results
    }),
  );

  // Find the transaction by ID
  const transaction = transactions?.find((tx) => tx.id === id);

  // Delete transaction mutation
  const deleteMutation = useMutation(
    trpc.budget.deleteTransaction.mutationOptions({
      onSuccess: () => {
        // Invalidate transactions queries to refresh the data
        void queryClient.invalidateQueries(
          trpc.budget.getTransactions.queryOptions(),
        );

        // Navigate back to transactions list
        router.back();
      },
      onError: (error) => {
        Alert.alert("Error", "Failed to delete transaction: " + error.message);
      },
    }),
  );

  // Handle delete transaction
  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (id) {
              deleteMutation.mutate({ id });
            }
          },
        },
      ],
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Transaction Details",
            headerShown: true,
          }}
        />
        <ThemedView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#5B65E9" />
          <ThemedText style={styles.loadingText}>
            Loading transaction...
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Error",
            headerShown: true,
          }}
        />
        <ThemedView style={[styles.container, styles.centerContent]}>
          <Icon name="tag" size={40} color="#FF6B6B" />
          <ThemedText style={styles.errorText}>
            Something went wrong. Please try again.
          </ThemedText>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </Pressable>
        </ThemedView>
      </>
    );
  }

  // Not found state
  if (!transaction) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Transaction Not Found",
            headerShown: true,
          }}
        />
        <ThemedView style={[styles.container, styles.centerContent]}>
          <Icon name="tag" size={40} color="#FF6B6B" />
          <ThemedText style={styles.errorText}>
            Transaction not found
          </ThemedText>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </Pressable>
        </ThemedView>
      </>
    );
  }

  // Define category interface
  interface CategoryType {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
  }

  // Safely access category properties with fallbacks
  const category = transaction.category as CategoryType | undefined;
  const description = transaction.description || "Unnamed Transaction";
  const categoryName = category?.name || "Uncategorized";
  const categoryIcon = category?.icon || "tag";
  const categoryColor = category?.color || "#5B65E9";
  const isExpense = Number(transaction.amount) < 0;

  // Map icon name to a valid icon
  const iconName = (
    [
      "wallet",
      "utensils",
      "shopping-bag",
      "car",
      "film",
      "home",
      "bolt",
      "heart",
      "user",
      "graduation-cap",
      "plus",
      "bar-chart",
      "list",
      "tag",
    ].includes(categoryIcon)
      ? categoryIcon
      : "tag"
  ) as IconName;

  const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Transaction Details",
          headerShown: true,
        }}
      />

      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View
            style={[styles.iconContainer, { backgroundColor: categoryColor }]}
          >
            <Icon name={iconName} size={24} color="#FFFFFF" />
          </View>

          <ThemedText style={styles.description}>{description}</ThemedText>

          <ThemedText
            style={[
              styles.amount,
              { color: isExpense ? "#FF6B6B" : "#4ECDC4" },
            ]}
          >
            {formatCurrency(Number(transaction.amount))}
          </ThemedText>
        </View>

        <ThemedView style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Category</ThemedText>
            <ThemedText style={styles.detailValue}>{categoryName}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Date</ThemedText>
            <ThemedText style={styles.detailValue}>{formattedDate}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Type</ThemedText>
            <ThemedText
              style={[
                styles.detailValue,
                {
                  color: isExpense ? "#FF6B6B" : "#4ECDC4",
                  fontWeight: "600",
                },
              ]}
            >
              {isExpense ? "Expense" : "Income"}
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/add-transaction",
                params: { id: transaction.id },
              })
            }
          >
            <Icon name="settings" size={20} color="#5B65E9" />
            <ThemedText style={styles.actionText}>Edit</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Icon name="tag" size={20} color="#FF6B6B" />
            <ThemedText style={[styles.actionText, styles.deleteText]}>
              Delete
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#5B65E9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
  },
  detailsContainer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(91, 101, 233, 0.1)",
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  actionText: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#5B65E9",
  },
  deleteText: {
    color: "#FF6B6B",
  },
});
