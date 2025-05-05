import type { IconName } from "@/components/ui/Icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TransactionItem } from "@/components/TransactionItem";
import { Icon } from "@/components/ui/Icons";
import { trpc } from "@/hooks/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Define category interface
interface CategoryType {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}

export default function BudgetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch budget progress with TRPC
  const {
    data: budgetProgressList,
    isLoading: budgetLoading,
    error: budgetError,
    refetch: refetchBudget,
  } = useQuery(
    trpc.budget.getBudgetProgress.queryOptions({
      month: currentMonth,
      year: currentYear,
    }),
  );

  // Find the specific budget by ID
  const budgetProgress = useMemo(() => {
    if (!budgetProgressList || !id) return null;
    return budgetProgressList.find((b) => b.budget.id === id) || null;
  }, [budgetProgressList, id]);

  // Fetch transactions for this category
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    ...trpc.budget.getTransactions.queryOptions({
      categoryId: budgetProgress?.budget.categoryId,
      startDate: new Date(currentYear, currentMonth - 1, 1),
      endDate: new Date(currentYear, currentMonth, 0),
    }),
    enabled: !!budgetProgress?.budget.categoryId,
  });

  // Delete budget mutation
  const deleteMutation = useMutation(
    trpc.budget.deleteBudget.mutationOptions({
      onSuccess: () => {
        // Invalidate budget queries to refresh the data
        void queryClient.invalidateQueries();

        // Navigate back to budgets list
        router.push("/budgets");
      },
      onError: (error) => {
        Alert.alert("Error", "Failed to delete budget: " + error.message);
      },
    }),
  );

  // Handle delete budget
  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate({ id });
          },
        },
      ],
    );
  };

  // Loading state
  const isLoading =
    budgetLoading ||
    (!!budgetProgress?.budget.categoryId && transactionsLoading);
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Budget Details",
            headerShown: true,
          }}
        />
        <ThemedView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#5B65E9" />
          <ThemedText style={styles.loadingText}>
            Loading budget details...
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  // Error state
  const error = budgetError || transactionsError;
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
          <Pressable style={styles.retryButton} onPress={() => refetchBudget()}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </Pressable>
        </ThemedView>
      </>
    );
  }

  // Not found state
  if (!budgetProgress) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Budget Not Found",
            headerShown: true,
          }}
        />
        <ThemedView style={[styles.container, styles.centerContent]}>
          <Icon name="tag" size={40} color="#FF6B6B" />
          <ThemedText style={styles.errorText}>Budget not found</ThemedText>
          <Pressable
            style={styles.retryButton}
            onPress={() => router.push("/budgets")}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </Pressable>
        </ThemedView>
      </>
    );
  }

  // Safely access category properties with fallbacks
  const category = budgetProgress.budget.category as CategoryType | undefined;
  const categoryName = category?.name || "Uncategorized";
  const categoryIcon = category?.icon || "tag";
  const categoryColor = category?.color || "#5B65E9";
  const amount = Number(budgetProgress.budget.amount);
  const spent = budgetProgress.spent;
  const remaining = budgetProgress.remaining;

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
    <>
      <Stack.Screen
        options={{
          title: categoryName,
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        {/* Budget Overview */}
        <ThemedView style={styles.overviewContainer}>
          <View style={styles.headerRow}>
            <View
              style={[styles.categoryIcon, { backgroundColor: categoryColor }]}
            >
              <Icon name={iconName} size={24} color="#FFFFFF" />
            </View>

            <View style={styles.budgetInfo}>
              <ThemedText style={styles.categoryName}>
                {categoryName}
              </ThemedText>
              <ThemedText style={styles.periodText}>Monthly Budget</ThemedText>
            </View>
          </View>

          <View style={styles.amountsContainer}>
            <View style={styles.amountItem}>
              <ThemedText style={styles.amountLabel}>Budget</ThemedText>
              <ThemedText style={styles.amountValue}>
                {formatCurrency(amount)}
              </ThemedText>
            </View>

            <View style={styles.amountItem}>
              <ThemedText style={styles.amountLabel}>Spent</ThemedText>
              <ThemedText style={styles.amountValue}>
                {formatCurrency(spent)}
              </ThemedText>
            </View>

            <View style={styles.amountItem}>
              <ThemedText style={styles.amountLabel}>Remaining</ThemedText>
              <ThemedText
                style={[
                  styles.amountValue,
                  remaining < 0 ? styles.negativeAmount : styles.positiveAmount,
                ]}
              >
                {formatCurrency(remaining)}
              </ThemedText>
            </View>
          </View>

          <BudgetProgressBar
            amount={amount}
            spent={spent}
            color={categoryColor}
          />
        </ThemedView>

        {/* Recent Transactions */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Recent Transactions
            </ThemedText>
          </View>

          {/* Sort transactions by date (newest first) */}
          {!transactions || transactions.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              No transactions in this category
            </ThemedText>
          ) : (
            transactions
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .slice(0, 5)
              .map((transaction) => {
                // Safely access properties with fallbacks
                const txCategory = transaction.category as
                  | CategoryType
                  | undefined;
                const txDescription =
                  transaction.description || "Unnamed Transaction";
                const txCategoryName = txCategory?.name || "Uncategorized";
                const txCategoryIcon = txCategory?.icon || "tag";
                const txCategoryColor = txCategory?.color || "#5B65E9";
                const isExpense = Number(transaction.amount) < 0;

                // Map icon name to a valid icon
                const txIconName = (
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
                  ].includes(txCategoryIcon)
                    ? txCategoryIcon
                    : "tag"
                ) as IconName;

                return (
                  <TransactionItem
                    key={transaction.id}
                    id={transaction.id}
                    description={txDescription}
                    amount={formatCurrency(Number(transaction.amount))}
                    date={new Date(transaction.date)}
                    categoryName={txCategoryName}
                    categoryIcon={txIconName}
                    categoryColor={txCategoryColor}
                    isExpense={isExpense}
                  />
                );
              })
          )}
        </ThemedView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/add-transaction",
                params: { id: budgetProgress.budget.id, type: "budget" },
              })
            }
          >
            <Icon name="settings" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>Edit Budget</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: "#FF6B6B" }]}
            onPress={handleDelete}
          >
            <Icon name="tag" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>
              Delete Budget
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.addButton]}
            onPress={() =>
              router.push({
                pathname: "/add-transaction",
                params: { categoryId: budgetProgress.budget.categoryId },
              })
            }
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>
              Add Transaction
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
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
  overviewContainer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  periodText: {
    fontSize: 14,
    opacity: 0.7,
  },
  amountsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  positiveAmount: {
    color: "#4ECDC4",
  },
  negativeAmount: {
    color: "#FF6B6B",
  },
  section: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
    padding: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 40,
    marginHorizontal: -8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#5B65E9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  addButton: {
    backgroundColor: "#4ECDC4",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
});
