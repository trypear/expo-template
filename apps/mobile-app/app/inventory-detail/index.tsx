import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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

  // In a real app, we would fetch the inventory data using the id
  // For now, we'll use mock data
  const [mockInventory, setMockInventory] = useState({
    id: id || "1",
    product: {
      id: "1",
      name: "Product Name",
      price: 1999,
      category: { id: "1", name: "Category 1" },
    },
    quantity: 25,
    locationCode: "main",
    lastRestockDate: new Date(2025, 4, 1),
    restockHistory: [
      { date: new Date(2025, 4, 1), quantity: 10 },
      { date: new Date(2025, 3, 15), quantity: 15 },
      { date: new Date(2025, 3, 1), quantity: 20 },
    ],
    minimumStockLevel: 10,
    maximumStockLevel: 50,
  });

  // State for restock form
  const [isRestocking, setIsRestocking] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState("10");

  const handleRestock = () => {
    // In a real app, we would call a mutation to update the inventory
    const quantity = parseInt(restockQuantity, 10);

    if (isNaN(quantity) || quantity <= 0) {
      console.log("Invalid quantity");
      return;
    }

    console.log("Restocking inventory with quantity:", quantity);

    // Create a new restock entry
    const newRestockEntry = {
      date: new Date(),
      quantity: quantity,
    };

    // Update the mock inventory with the new data
    setMockInventory({
      ...mockInventory,
      quantity: mockInventory.quantity + quantity,
      lastRestockDate: new Date(),
      restockHistory: [newRestockEntry, ...mockInventory.restockHistory],
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
        <ThemedView style={styles.section}>
          <ThemedText type="title">{mockInventory.product.name}</ThemedText>

          <View style={styles.stockContainer}>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: getStockLevelColor(mockInventory.quantity) },
              ]}
            >
              <ThemedText style={styles.stockText}>
                {getStockLevelText(mockInventory.quantity)}
              </ThemedText>
            </View>
            <ThemedText style={styles.quantityText}>
              {mockInventory.quantity} units
            </ThemedText>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Category:</ThemedText>
              <ThemedText>{mockInventory.product.category.name}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Price:</ThemedText>
              <ThemedText>
                {formatCurrency(mockInventory.product.price / 100)}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Location:</ThemedText>
              <ThemedText>{mockInventory.locationCode}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Last Restock:</ThemedText>
              <ThemedText>
                {formatDate(mockInventory.lastRestockDate)}
              </ThemedText>
            </View>

            <View style={styles.stockLevelsContainer}>
              <ThemedText style={styles.sectionTitle}>Stock Levels</ThemedText>
              <View style={styles.stockLevelBar}>
                <View style={styles.stockLevelBarBackground}>
                  <View
                    style={[
                      styles.stockLevelBarFill,
                      {
                        width: `${(mockInventory.quantity / mockInventory.maximumStockLevel) * 100}%`,
                        backgroundColor: getStockLevelColor(
                          mockInventory.quantity,
                        ),
                      },
                    ]}
                  />
                </View>
                <View style={styles.stockLevelLabels}>
                  <ThemedText style={styles.stockLevelLabel}>
                    Min: {mockInventory.minimumStockLevel}
                  </ThemedText>
                  <ThemedText style={styles.stockLevelLabel}>
                    Max: {mockInventory.maximumStockLevel}
                  </ThemedText>
                </View>
              </View>
            </View>

            <ThemedText style={styles.sectionTitle}>Restock History</ThemedText>
            {mockInventory.restockHistory.map((restock, index) => (
              <View key={index} style={styles.restockItem}>
                <ThemedText>{formatDate(restock.date)}</ThemedText>
                <ThemedText style={styles.restockQuantity}>
                  +{restock.quantity} units
                </ThemedText>
              </View>
            ))}
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
                  Current quantity: {mockInventory.quantity} units
                </ThemedText>
                <ThemedText style={styles.formInfoText}>
                  Maximum capacity: {mockInventory.maximumStockLevel} units
                </ThemedText>
                <ThemedText style={styles.formInfoText}>
                  Available space:{" "}
                  {mockInventory.maximumStockLevel - mockInventory.quantity}{" "}
                  units
                </ThemedText>
              </View>

              <View style={styles.formButtonContainer}>
                <Pressable
                  style={[styles.button, styles.saveButton]}
                  onPress={handleRestock}
                >
                  <ThemedText style={styles.buttonText}>
                    Confirm Restock
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
