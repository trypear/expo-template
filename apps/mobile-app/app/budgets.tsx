import type { IconName } from "@/components/ui/Icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { trpc } from "@/hooks/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { useQuery } from "@tanstack/react-query";

export default function BudgetsScreen() {
  const router = useRouter();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch budgets with TRPC
  const {
    data: budgetProgress,
    isLoading: budgetsLoading,
    error: budgetsError,
    refetch,
  } = useQuery(
    trpc.budget.getBudgetProgress.queryOptions({
      month: currentMonth,
      year: currentYear,
    }),
  );

  // Calculate summary data
  const summary = useMemo(() => {
    if (!budgetProgress) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
      };
    }

    return budgetProgress.reduce(
      (acc, budget) => {
        const amount = Number(budget.budget.amount);
        const spent = budget.spent;
        const remaining = budget.remaining;

        return {
          totalBudget: acc.totalBudget + amount,
          totalSpent: acc.totalSpent + spent,
          totalRemaining: acc.totalRemaining + remaining,
        };
      },
      { totalBudget: 0, totalSpent: 0, totalRemaining: 0 },
    );
  }, [budgetProgress]);

  // Loading state
  if (budgetsLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Budgets",
            headerShown: true,
          }}
        />
        <ThemedView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#5B65E9" />
          <ThemedText style={styles.loadingText}>Loading budgets...</ThemedText>
        </ThemedView>
      </>
    );
  }

  // Error state
  if (budgetsError) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Budgets",
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
          title: "Budgets",
          headerShown: true,
        }}
      />

      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Budget Summary */}
          <ThemedView style={styles.summaryContainer}>
            <ThemedText style={styles.summaryTitle}>Monthly Budget</ThemedText>
            <View style={styles.summaryRow}>
              <ThemedView style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>
                  Total Budget
                </ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {formatCurrency(summary.totalBudget)}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Spent</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {formatCurrency(summary.totalSpent)}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Remaining</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {formatCurrency(summary.totalRemaining)}
                </ThemedText>
              </ThemedView>
            </View>
          </ThemedView>

          {/* Budget List */}
          <ThemedText style={styles.sectionTitle}>Budget Categories</ThemedText>

          {budgetProgress &&
            budgetProgress.map((budget) => {
              // Define category interface
              interface CategoryType {
                id: string;
                name: string;
                icon: string;
                color: string;
                type: string;
              }

              // Safely access category properties with fallbacks
              const category = budget.budget.category as
                | CategoryType
                | undefined;
              const categoryName = category?.name || "Uncategorized";
              const categoryIcon = category?.icon || "tag";
              const categoryColor = category?.color || "#5B65E9";
              const amount = Number(budget.budget.amount);
              const spent = budget.spent;
              const remaining = budget.remaining;

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

                    <View style={styles.budgetInfo}>
                      <ThemedText style={styles.categoryName}>
                        {categoryName}
                      </ThemedText>
                      <View style={styles.budgetAmounts}>
                        <ThemedText style={styles.spentAmount}>
                          {formatCurrency(spent)}
                          <ThemedText style={styles.totalAmount}>
                            {" "}
                            of {formatCurrency(amount)}
                          </ThemedText>
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText
                      style={[
                        styles.remainingAmount,
                        remaining < 0 && styles.overBudget,
                      ]}
                    >
                      {remaining < 0 ? "-" : ""}
                      {formatCurrency(Math.abs(remaining))}
                    </ThemedText>
                  </View>

                  <BudgetProgressBar
                    amount={amount}
                    spent={spent}
                    color={categoryColor}
                    showLabels={false}
                  />
                </Pressable>
              );
            })}
        </ScrollView>

        {/* Add Budget Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/add-transaction",
                params: { type: "budget" },
              })
            }
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(91, 101, 233, 0.1)",
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  budgetItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  budgetInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  budgetAmounts: {
    flexDirection: "row",
    alignItems: "center",
  },
  spentAmount: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 14,
    opacity: 0.7,
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  overBudget: {
    color: "#FF6B6B",
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
