"use client";

import type { IconName } from "@/components/ui/Icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TransactionItem } from "@/components/TransactionItem";
import { Icon } from "@/components/ui/Icons";
import { trpc } from "@/hooks/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { useQuery } from "@tanstack/react-query";

export default function HomeScreen() {
  const router = useRouter();
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

  // Fetch transaction stats for the current month
  const {
    data: transactionStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery(
    trpc.budget.getTransactionStats.queryOptions({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
      groupBy: "month",
    }),
  );

  // Fetch budget progress
  const {
    data: budgetProgress,
    isLoading: budgetsLoading,
    error: budgetsError,
  } = useQuery(
    trpc.budget.getBudgetProgress.queryOptions({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    }),
  );

  // Fetch recent transactions
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery(
    trpc.budget.getTransactions.queryOptions({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
    }),
  );

  // Calculate summary data from transaction stats
  const summary = React.useMemo(() => {
    if (!transactionStats || transactionStats.length === 0) {
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
      };
    }

    // Check if we have period-based stats (which have income/expense/savings properties)
    const stats = transactionStats[0];
    if (stats && "period" in stats) {
      const income = Number(stats.income) || 0;
      const expense = Number(stats.expense) || 0;
      const savings = Number(stats.savings) || 0;

      return {
        totalBalance: income - expense + savings,
        monthlyIncome: income,
        monthlyExpenses: expense,
      };
    }

    // If we have category-based stats, calculate differently
    return {
      totalBalance: 0, // Would need additional query for this
      monthlyIncome: 0,
      monthlyExpenses: 0,
    };
  }, [transactionStats]);

  // Get the 3 most recent transactions
  const recentTransactions = React.useMemo(() => {
    if (!transactions) return [];
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [transactions]);

  // Loading states
  if (statsLoading || budgetsLoading || transactionsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B65E9" />
        <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
      </View>
    );
  }

  // Error states
  if (statsError || budgetsError || transactionsError) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="tag" size={40} color="#FF6B6B" />
        <ThemedText style={styles.errorText}>
          Something went wrong. Please try again.
        </ThemedText>
        <Pressable
          style={styles.retryButton}
          onPress={() => router.replace("/")}
        >
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Summary Section */}
      <ThemedView style={styles.summaryContainer}>
        <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
        <ThemedText style={styles.balanceAmount}>
          {formatCurrency(summary.totalBalance)}
        </ThemedText>

        <View style={styles.summaryRow}>
          <ThemedView style={styles.summaryItem}>
            <View style={styles.iconContainer}>
              <Icon name="wallet" size={20} color="#4ECDC4" />
            </View>
            <ThemedText style={styles.summaryLabel}>Income</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {formatCurrency(summary.monthlyIncome)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.summaryItem}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: "rgba(255, 107, 107, 0.1)" },
              ]}
            >
              <Icon name="shopping-bag" size={20} color="#FF6B6B" />
            </View>
            <ThemedText style={styles.summaryLabel}>Expenses</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {formatCurrency(summary.monthlyExpenses)}
            </ThemedText>
          </ThemedView>
        </View>
      </ThemedView>

      {/* Budget Progress Section */}
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Budget Progress</ThemedText>
          <Pressable onPress={() => router.push("/budgets")}>
            <ThemedText style={styles.seeAll}>See All</ThemedText>
          </Pressable>
        </View>

        {budgetProgress &&
          budgetProgress.slice(0, 3).map((budget) => {
            // Define category interface
            interface CategoryType {
              id: string;
              name: string;
              icon: string;
              color: string;
              type: string;
            }

            // Safely access category properties with fallbacks
            const category = budget.budget.category as CategoryType | undefined;
            const categoryColor = category?.color || "#5B65E9";
            const categoryIcon = category?.icon || "tag";
            const categoryName = category?.name || "Uncategorized";

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
              <Pressable
                key={budget.budget.id}
                style={styles.budgetItem}
                onPress={() =>
                  router.push({
                    pathname: "/budget-detail",
                    params: { id: budget.budget.id },
                  })
                }
              >
                <View style={styles.budgetHeader}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: categoryColor },
                    ]}
                  >
                    <Icon name={iconName} size={16} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.budgetCategory}>
                    {categoryName}
                  </ThemedText>
                  <ThemedText style={styles.budgetAmount}>
                    {formatCurrency(budget.remaining)} left
                  </ThemedText>
                </View>
                <BudgetProgressBar
                  amount={Number(budget.budget.amount)}
                  spent={budget.spent}
                  color={categoryColor}
                  showLabels={false}
                />
              </Pressable>
            );
          })}
      </ThemedView>

      {/* Recent Transactions Section */}
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            Recent Transactions
          </ThemedText>
          <Pressable onPress={() => router.push("/transactions")}>
            <ThemedText style={styles.seeAll}>See All</ThemedText>
          </Pressable>
        </View>

        {recentTransactions.map((transaction) => {
          const isExpense = Number(transaction.amount) < 0;

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
          const description = transaction.description || "Unnamed Transaction";
          const categoryName = category?.name || "Uncategorized";
          const categoryIcon = category?.icon || "tag";
          const categoryColor = category?.color || "#5B65E9";

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
        })}
      </ThemedView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/add-transaction")}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Add Transaction</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
  summaryContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: "rgba(91, 101, 233, 0.1)",
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 14,
    color: "#5B65E9",
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  budgetCategory: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickActions: {
    marginBottom: 40,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#5B65E9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
});
