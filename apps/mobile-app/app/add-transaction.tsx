import type { IconName } from "@/components/ui/Icons";
import type { RouterInputs } from "@/hooks/api";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { trpc } from "@/hooks/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Define client-side transaction input type (without userId which is added by the server)
type ClientTransactionInput = Omit<
  RouterInputs["budget"]["createTransaction"],
  "userId"
>;

export default function AddTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // State for form fields
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery(trpc.budget.getCategories.queryOptions());

  // If in edit mode, fetch the transaction
  const {
    data: transactions,
    isLoading: transactionLoading,
    error: transactionError,
  } = useQuery({
    ...trpc.budget.getTransactions.queryOptions(),
    enabled: isEditMode,
  });

  // Find the transaction by ID if in edit mode
  const transaction = isEditMode
    ? transactions?.find((tx) => tx.id === id)
    : null;

  // Create transaction mutation
  const createMutation = useMutation(
    trpc.budget.createTransaction.mutationOptions({
      onSuccess: () => {
        // Invalidate transactions queries to refresh the data
        void queryClient.invalidateQueries(
          trpc.budget.getTransactions.queryOptions(),
        );

        // Navigate back to transactions list
        router.push("/transactions");
      },
      onError: (error) => {
        Alert.alert("Error", "Failed to create transaction: " + error.message);
      },
    }),
  );

  // Update transaction mutation
  const updateMutation = useMutation(
    trpc.budget.updateTransaction.mutationOptions({
      onSuccess: () => {
        // Invalidate transactions queries to refresh the data
        void queryClient.invalidateQueries(
          trpc.budget.getTransactions.queryOptions(),
        );

        // Navigate back to transactions list
        router.push("/transactions");
      },
      onError: (error) => {
        Alert.alert("Error", "Failed to update transaction: " + error.message);
      },
    }),
  );

  // Pre-populate form fields if in edit mode
  useEffect(() => {
    if (transaction) {
      // Define category interface
      interface CategoryType {
        id: string;
        name: string;
        icon: string;
        color: string;
        type: string;
      }

      // Safely access category properties
      const category = transaction.category as CategoryType | undefined;
      const isExpense = Number(transaction.amount) < 0;

      setType(isExpense ? "expense" : "income");
      setAmount(String(Math.abs(Number(transaction.amount))));
      setDescription(transaction.description || "");
      setSelectedCategoryId(category?.id || null);
    }
  }, [transaction]);

  const handleSave = () => {
    if (!amount || !description || !selectedCategoryId) {
      return;
    }

    const parsedAmount = parseFloat(amount) * (type === "expense" ? -1 : 1);

    if (isEditMode && id) {
      // Update existing transaction
      updateMutation.mutate({
        id,
        data: {
          amount: String(parsedAmount),
          description,
          categoryId: selectedCategoryId,
          date: new Date(),
        },
      });
    } else {
      // Create new transaction
      // The server will add the userId from the session
      const newTransaction: ClientTransactionInput = {
        amount: String(parsedAmount),
        description,
        categoryId: selectedCategoryId,
        date: new Date(),
      };
      createMutation.mutate(
        newTransaction as RouterInputs["budget"]["createTransaction"],
      );
    }
  };

  // Loading state
  const isLoading = categoriesLoading || (isEditMode && transactionLoading);
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: isEditMode ? "Edit Transaction" : "Add Transaction",
            headerShown: true,
          }}
        />
        <ThemedView style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#5B65E9" />
          <ThemedText style={styles.loadingText}>
            {isEditMode ? "Loading transaction..." : "Loading categories..."}
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  // Error state
  const error = categoriesError || transactionError;
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
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </Pressable>
        </ThemedView>
      </>
    );
  }

  // Filter categories based on transaction type
  const filteredCategories =
    categories?.filter((category) => {
      if (type === "income") return category.type === "income";
      return category.type === "expense";
    }) || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditMode ? "Edit Transaction" : "Add Transaction",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        {/* Transaction Type Selector */}
        <ThemedView style={styles.typeSelector}>
          <Pressable
            style={[
              styles.typeButton,
              type === "expense" && styles.activeTypeButton,
            ]}
            onPress={() => setType("expense")}
          >
            <ThemedText
              style={[
                styles.typeText,
                type === "expense" && styles.activeTypeText,
              ]}
            >
              Expense
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              type === "income" && styles.activeTypeButton,
            ]}
            onPress={() => setType("income")}
          >
            <ThemedText
              style={[
                styles.typeText,
                type === "income" && styles.activeTypeText,
              ]}
            >
              Income
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Amount Input */}
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Amount</ThemedText>
          <View style={styles.amountContainer}>
            <ThemedText style={styles.currencySymbol}>$</ThemedText>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="decimal-pad"
            />
          </View>
        </ThemedView>

        {/* Description Input */}
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="What was this for?"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
          />
        </ThemedView>

        {/* Category Selector */}
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Category</ThemedText>
          <View style={styles.categoriesContainer}>
            {filteredCategories.map((category) => {
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
                ].includes(category.icon)
                  ? category.icon
                  : "tag"
              ) as IconName;

              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategoryId === category.id &&
                      styles.selectedCategoryItem,
                  ]}
                  onPress={() => setSelectedCategoryId(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color },
                    ]}
                  >
                    <Icon name={iconName} size={16} color="#FFFFFF" />
                  </View>
                  <ThemedText
                    style={[
                      styles.categoryText,
                      selectedCategoryId === category.id &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        {/* Save Button */}
        <Pressable
          style={[
            styles.saveButton,
            (!amount || !description || !selectedCategoryId) &&
              styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!amount || !description || !selectedCategoryId}
        >
          <ThemedText style={styles.saveButtonText}>
            {isEditMode ? "Update Transaction" : "Save Transaction"}
          </ThemedText>
        </Pressable>
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
  typeSelector: {
    flexDirection: "row",
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  activeTypeButton: {
    backgroundColor: "#5B65E9",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTypeText: {
    color: "#FFFFFF",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: "#FFFFFF",
  },
  textInput: {
    fontSize: 16,
    color: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  categoryItem: {
    width: "33.33%",
    padding: 8,
  },
  selectedCategoryItem: {
    opacity: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    textAlign: "center",
  },
  selectedCategoryText: {
    fontWeight: "600",
    color: "#5B65E9",
  },
  saveButton: {
    backgroundColor: "#5B65E9",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
