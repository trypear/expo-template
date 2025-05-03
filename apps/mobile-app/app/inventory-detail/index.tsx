import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { trpc } from "@/hooks/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatCurrency } from "@/utils/formatCurrency";

/**
 * Inventory Detail Screen
 *
 * This screen displays detailed information about a specific inventory item.
 * It follows the pattern in sample-detail for navigation.
 */
export default function InventoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();

  // Fetch inventory data using tRPC
  const {
    data: inventoryData,
    isLoading,
    error,
  } = useQuery(
    trpc.inventory.getInventoryById.queryOptions(
      { id: id as string },
      { enabled: !!id },
    ),
  );

  // State for restock form
  const [isRestocking, setIsRestocking] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState("10");

  // Restock mutation
  const restockMutation = trpc.inventory.restockInventory.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh data
      void trpc.inventory.getInventoryById.invalidate({ id: id as string });
      void trpc.inventory.getInventory.invalidate();
    },
  });

  const handleRestock = () => {
    const quantity = parseInt(restockQuantity, 10);

    if (isNaN(quantity) || quantity <= 0) {
      console.log("Invalid quantity");
      return;
    }

    // Call the mutation to restock inventory
    restockMutation.mutate({
      id: id as string,
      quantity: quantity,
    });

    // Close the restock form
    setIsRestocking(false);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get stock level color
  const getStockLevelColor = (quantity: number) => {
    if (quantity === 0) return "#F44336"; // Out of stock - red
    if (quantity <= 5) return "#FF9800"; // Critical - orange
    if (quantity <= 10) return "#FFC107"; // Low - yellow
    return "#4CAF50"; // Good - green
  };

  // Get stock level text
  const getStockLevelText = (quantity: number) => {
    if (quantity === 0) return "Out of stock";
    if (quantity <= 5) return "Critical";
    if (quantity <= 10) return "Low";
    return "In stock";
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Inventory Details",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme ?? "light"].tint}
            />
            <ThemedText style={styles.loadingText}>
              Loading inventory details...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Error loading inventory: {error.message}
            </ThemedText>
            <Pressable style={styles.button} onPress={() => router.back()}>
              <ThemedText style={styles.buttonText}>Go Back</ThemedText>
            </Pressable>
          </View>
        ) : inventoryData ? (
          <ThemedView style={styles.section}>
            <ThemedText type="title">{inventoryData.product.name}</ThemedText>

            <View style={styles.stockContainer}>
              <View
                style={[
                  styles.stockBadge,
                  {
                    backgroundColor: getStockLevelColor(inventoryData.quantity),
                  },
                ]}
              >
                <ThemedText style={styles.stockText}>
                  {getStockLevelText(inventoryData.quantity)}
                </ThemedText>
              </View>
              <ThemedText style={styles.quantityText}>
                {inventoryData.quantity} units
              </ThemedText>
            </View>

            <View style={styles.content}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Category:</ThemedText>
                <ThemedText>
                  {inventoryData.product.category?.name || "Uncategorized"}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Price:</ThemedText>
                <ThemedText>
                  {formatCurrency(inventoryData.product.price / 100)}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Location:</ThemedText>
                <ThemedText>{inventoryData.locationCode}</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Last Restock:</ThemedText>
                <ThemedText>
                  {inventoryData.lastRestockDate
                    ? formatDate(new Date(inventoryData.lastRestockDate))
                    : "Never"}
                </ThemedText>
              </View>

              <View style={styles.stockLevelsContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Stock Levels
                </ThemedText>
                <View style={styles.stockLevelBar}>
                  <View style={styles.stockLevelBarBackground}>
                    <View
                      style={[
                        styles.stockLevelBarFill,
                        {
                          width: `${(inventoryData.quantity / inventoryData.maximumStockLevel) * 100}%`,
                          backgroundColor: getStockLevelColor(
                            inventoryData.quantity,
                          ),
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.stockLevelLabels}>
                    <ThemedText style={styles.stockLevelLabel}>
                      Min: {inventoryData.minimumStockLevel}
                    </ThemedText>
                    <ThemedText style={styles.stockLevelLabel}>
                      Max: {inventoryData.maximumStockLevel}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <ThemedText style={styles.sectionTitle}>
                Restock History
              </ThemedText>
              {inventoryData.restockHistory &&
              inventoryData.restockHistory.length > 0 ? (
                inventoryData.restockHistory.map((restock, index) => (
                  <View key={index} style={styles.restockItem}>
                    <ThemedText>
                      {formatDate(new Date(restock.date))}
                    </ThemedText>
                    <ThemedText style={styles.restockQuantity}>
                      +{restock.quantity} units
                    </ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.emptyText}>
                  No restock history available
                </ThemedText>
              )}
            </View>

            {!isRestocking ? (
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, styles.restockButton]}
                  onPress={() => setIsRestocking(true)}
                >
                  <ThemedText style={styles.buttonText}>
                    Restock Inventory
                  </ThemedText>
                </Pressable>

                <Pressable style={styles.button} onPress={() => router.back()}>
                  <ThemedText style={styles.buttonText}>Go Back</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Restock Inventory
                </ThemedText>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.formLabel}>
                    Quantity to Add
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={restockQuantity}
                    onChangeText={setRestockQuantity}
                    keyboardType="numeric"
                    placeholder="Enter quantity"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                </View>

                <View style={styles.formInfo}>
                  <ThemedText style={styles.formInfoText}>
                    Current quantity: {inventoryData.quantity} units
                  </ThemedText>
                  <ThemedText style={styles.formInfoText}>
                    Maximum capacity: {inventoryData.maximumStockLevel} units
                  </ThemedText>
                  <ThemedText style={styles.formInfoText}>
                    Available space:{" "}
                    {inventoryData.maximumStockLevel - inventoryData.quantity}{" "}
                    units
                  </ThemedText>
                </View>

                <View style={styles.formButtonContainer}>
                  <Pressable
                    style={[styles.button, styles.saveButton]}
                    onPress={handleRestock}
                  >
                    <ThemedText style={styles.buttonText}>
                      {restockMutation.isPending
                        ? "Processing..."
                        : "Confirm Restock"}
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      // Reset form data and close restock form
                      setRestockQuantity("10");
                      setIsRestocking(false);
                    }}
                  >
                    <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                  </Pressable>
                </View>
              </View>
            )}
          </ThemedView>
        ) : (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Inventory item not found
            </ThemedText>
            <Pressable style={styles.button} onPress={() => router.back()}>
              <ThemedText style={styles.buttonText}>Go Back</ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  emptyText: {
    fontStyle: "italic",
    opacity: 0.7,
    textAlign: "center",
    padding: 10,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  stockBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  stockText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    marginTop: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    marginRight: 8,
    width: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  stockLevelsContainer: {
    marginBottom: 8,
  },
  stockLevelBar: {
    marginTop: 8,
  },
  stockLevelBarBackground: {
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    overflow: "hidden",
  },
  stockLevelBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  stockLevelLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  stockLevelLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  restockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  restockQuantity: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: "#5B65E9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  restockButton: {
    backgroundColor: "#4CAF50",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  formContainer: {
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  formInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  formInfoText: {
    marginBottom: 4,
  },
  formButtonContainer: {
    gap: 12,
    marginTop: 24,
  },
});
