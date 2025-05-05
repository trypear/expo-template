import type { IconName } from "@/components/ui/Icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TransactionItem } from "@/components/TransactionItem";
import { Icon } from "@/components/ui/Icons";
import { trpc } from "@/hooks/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { useQuery } from "@tanstack/react-query";

export default function TransactionsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  // Get current month date range
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  // Fetch transactions with TRPC
  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.budget.getTransactions.queryOptions({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
      type: filter === "all" ? undefined : filter,
    }),
  );

  // Filter transactions based on selected filter
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((tx) => {
      if (filter === "all") return true;
      if (filter === "income") return Number(tx.amount) > 0;
      if (filter === "expense") return Number(tx.amount) < 0;
      return true;
    });
  }, [transactions, filter]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Transactions",
            headerShown: true,
          }}
        />
        <ThemedView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#5B65E9" />
          <ThemedText style={styles.loadingText}>
            Loading transactions...
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
            title: "Transactions",
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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Transactions",
          headerShown: true,
        }}
      />

      <ThemedView style={styles.container}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <Pressable
            style={[
              styles.filterTab,
              filter === "all" && styles.activeFilterTab,
            ]}
            onPress={() => setFilter("all")}
          >
            <ThemedText
              style={[
                styles.filterText,
                filter === "all" && styles.activeFilterText,
              ]}
            >
              All
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.filterTab,
              filter === "income" && styles.activeFilterTab,
            ]}
            onPress={() => setFilter("income")}
          >
            <ThemedText
              style={[
                styles.filterText,
                filter === "income" && styles.activeFilterText,
              ]}
            >
              Income
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.filterTab,
              filter === "expense" && styles.activeFilterTab,
            ]}
            onPress={() => setFilter("expense")}
          >
            <ThemedText
              style={[
                styles.filterText,
                filter === "expense" && styles.activeFilterText,
              ]}
            >
              Expenses
            </ThemedText>
          </Pressable>
        </View>

        {/* Transactions List */}
        <ScrollView style={styles.transactionsList}>
          {filteredTransactions.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                No transactions found
              </ThemedText>
            </ThemedView>
          ) : (
            filteredTransactions.map((transaction) => {
              // Define category interface
              interface CategoryType {
                id: string;
                name: string;
                icon: string;
                color: string;
                type: string;
              }

              // Safely access properties with fallbacks
              const category = transaction.category as CategoryType | undefined;
              const description =
                transaction.description || "Unnamed Transaction";
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

              return (
                <TransactionItem
                  key={transaction.id}
                  id={transaction.id}
                  description={description}
                  amount={formatCurrency(Number(transaction.amount))}
                  date={new Date(transaction.date)}
                  categoryName={categoryName}
                  categoryIcon={iconName}
                  categoryColor={categoryColor}
                  isExpense={isExpense}
                />
              );
            })
          )}
        </ScrollView>

        {/* Add Transaction Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/add-transaction")}
          >
            <Icon name="plus" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: "rgba(91, 101, 233, 0.1)",
  },
  filterText: {
    fontSize: 14,
  },
  activeFilterText: {
    color: "#5B65E9",
    fontWeight: "600",
  },
  transactionsList: {
    flex: 1,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    opacity: 0.7,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5B65E9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
