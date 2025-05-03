import React from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatCurrency";

/**
 * Sale Detail Screen
 *
 * This screen displays detailed information about a specific sale.
 * It follows the pattern in sample-detail for navigation.
 */
export default function SaleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // In a real app, we would fetch the sale data using the id
  // For now, we'll use mock data
  const mockSale = {
    id: id || "1",
    saleDate: new Date(2025, 4, 1, 14, 30),
    totalAmount: 4598,
    subtotal: 4180,
    tax: 418,
    status: "completed",
    customer: { id: "1", name: "Customer Name" },
    paymentMethod: "credit_card",
    items: [
      {
        id: "1",
        product: { id: "1", name: "Product 1" },
        quantity: 2,
        unitPrice: 1999,
        total: 3998,
      },
      {
        id: "2",
        product: { id: "2", name: "Product 2" },
        quantity: 1,
        unitPrice: 600,
        total: 600,
      },
    ],
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      case "cancelled":
        return "#F44336";
      case "refunded":
        return "#FF9800";
      default:
        return "#757575";
    }
  };

  const renderSaleItem = ({ item }: { item: (typeof mockSale.items)[0] }) => (
    <View style={styles.saleItem}>
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemName}>{item.product.name}</ThemedText>
        <ThemedText style={styles.itemQuantity}>
          {item.quantity} x {formatCurrency(item.unitPrice / 100)}
        </ThemedText>
      </View>
      <ThemedText style={styles.itemTotal}>
        {formatCurrency(item.total / 100)}
      </ThemedText>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sale Details",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        <ThemedView style={styles.section}>
          <View style={styles.header}>
            <ThemedText type="title">Sale #{mockSale.id}</ThemedText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(mockSale.status) },
              ]}
            >
              <ThemedText style={styles.statusText}>
                {mockSale.status}
              </ThemedText>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Date:</ThemedText>
              <ThemedText>{formatDate(mockSale.saleDate)}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Customer:</ThemedText>
              <ThemedText>{mockSale.customer.name}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Payment:</ThemedText>
              <ThemedText>
                {mockSale.paymentMethod.replace("_", " ")}
              </ThemedText>
            </View>

            <ThemedText style={styles.sectionTitle}>Items</ThemedText>
            <FlatList
              data={mockSale.items}
              renderItem={renderSaleItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <ThemedText>Subtotal</ThemedText>
                <ThemedText>
                  {formatCurrency(mockSale.subtotal / 100)}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText>Tax</ThemedText>
                <ThemedText>{formatCurrency(mockSale.tax / 100)}</ThemedText>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText style={styles.totalLabel}>Total</ThemedText>
                <ThemedText style={styles.totalAmount}>
                  {formatCurrency(mockSale.totalAmount / 100)}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.printButton]}
              onPress={() => console.log("Print receipt")}
            >
              <ThemedText style={styles.buttonText}>Print Receipt</ThemedText>
            </Pressable>

            <Pressable style={styles.button} onPress={() => router.back()}>
              <ThemedText style={styles.buttonText}>Go Back</ThemedText>
            </Pressable>
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    marginRight: 8,
    width: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
  },
  saleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    opacity: 0.7,
  },
  itemTotal: {
    fontWeight: "600",
  },
  summaryContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  totalLabel: {
    fontWeight: "bold",
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 18,
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
  printButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
