import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { DatePicker } from "@/components/DatePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatCurrency } from "@/utils/formatCurrency";

/**
 * Sales History Screen
 *
 * Displays a list of past sales with search and filter options
 */
export default function SalesHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mock sales data
  const mockSales = [
    {
      id: "1",
      saleDate: new Date(2025, 4, 1, 14, 30),
      totalAmount: 4598,
      status: "completed",
      customer: { id: "1", name: "Customer 1" },
      paymentMethod: "cash",
    },
    {
      id: "2",
      saleDate: new Date(2025, 4, 2, 10, 15),
      totalAmount: 2599,
      status: "completed",
      customer: { id: "2", name: "Customer 2" },
      paymentMethod: "credit_card",
    },
    {
      id: "3",
      saleDate: new Date(2025, 4, 2, 16, 45),
      totalAmount: 999,
      status: "completed",
      customer: null,
      paymentMethod: "cash",
    },
    {
      id: "4",
      saleDate: new Date(2025, 4, 3, 9, 20),
      totalAmount: 7499,
      status: "pending",
      customer: { id: "3", name: "Customer 3" },
      paymentMethod: "debit_card",
    },
    {
      id: "5",
      saleDate: new Date(2025, 4, 3, 13, 10),
      totalAmount: 1499,
      status: "cancelled",
      customer: { id: "1", name: "Customer 1" },
      paymentMethod: "mobile_payment",
    },
  ];

  // Filter sales based on search query and filters
  const filteredSales = mockSales.filter((sale) => {
    // Filter by search query (customer name)
    const matchesSearch = sale.customer
      ? sale.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      : searchQuery === "";

    // Filter by date range
    const matchesStartDate = startDate ? sale.saleDate >= startDate : true;
    const matchesEndDate = endDate ? sale.saleDate <= endDate : true;

    // Filter by status
    const matchesStatus = selectedStatus
      ? sale.status === selectedStatus
      : true;

    return matchesSearch && matchesStartDate && matchesEndDate && matchesStatus;
  });

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

  // Get payment method icon - always returns a valid icon name
  const getPaymentIcon = () => {
    // In a real app, we would use different icons for different payment methods
    // For now, just return a valid icon name
    return "house" as const;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
    setSelectedStatus(null);
  };

  const renderSaleItem = ({ item }: { item: (typeof mockSales)[0] }) => (
    <Pressable
      style={styles.saleItem}
      onPress={() => router.push(`/sale-detail?id=${item.id}`)}
    >
      <View style={styles.saleHeader}>
        <ThemedText style={styles.saleDate}>
          {formatDate(item.saleDate)}
        </ThemedText>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <ThemedText style={styles.statusText}>{item.status}</ThemedText>
        </View>
      </View>

      <View style={styles.saleDetails}>
        <View>
          <ThemedText style={styles.saleId}>Sale #{item.id}</ThemedText>
          <ThemedText style={styles.customerName}>
            {item.customer ? item.customer.name : "Walk-in Customer"}
          </ThemedText>
        </View>

        <View style={styles.saleAmount}>
          <ThemedText style={styles.amountText}>
            {formatCurrency(item.totalAmount / 100)}
          </ThemedText>
          <View style={styles.paymentMethod}>
            <Icon
              name={getPaymentIcon()}
              size={14}
              color={Colors[colorScheme ?? "light"].text}
            />
            <ThemedText style={styles.paymentText}>
              {item.paymentMethod.replace("_", " ")}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sales History",
          headerShown: true,
        }}
      />

      <ThemedView style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon
              name="house"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: Colors[colorScheme ?? "light"].text },
              ]}
              placeholder="Search by customer..."
              placeholderTextColor={Colors[colorScheme ?? "light"].text + "80"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="folder" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {showFilters && (
          <ThemedView style={styles.filtersContainer}>
            <View style={styles.filterHeader}>
              <ThemedText type="subtitle">Filters</ThemedText>
              <Pressable onPress={clearFilters}>
                <ThemedText style={styles.clearFiltersText}>
                  Clear All
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.dateFilters}>
              <View style={styles.dateFilter}>
                <ThemedText style={styles.filterLabel}>Start Date</ThemedText>
                {startDate && (
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    mode="date"
                  />
                )}
                {!startDate && (
                  <Pressable
                    style={styles.datePlaceholder}
                    onPress={() => setStartDate(new Date())}
                  >
                    <ThemedText style={styles.datePlaceholderText}>
                      Select start date
                    </ThemedText>
                  </Pressable>
                )}
              </View>

              <View style={styles.dateFilter}>
                <ThemedText style={styles.filterLabel}>End Date</ThemedText>
                {endDate && (
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    mode="date"
                  />
                )}
                {!endDate && (
                  <Pressable
                    style={styles.datePlaceholder}
                    onPress={() => setEndDate(new Date())}
                  >
                    <ThemedText style={styles.datePlaceholderText}>
                      Select end date
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.statusFilters}>
              <ThemedText style={styles.filterLabel}>Status</ThemedText>
              <View style={styles.statusOptions}>
                <Pressable
                  style={[
                    styles.statusOption,
                    selectedStatus === null && styles.statusOptionSelected,
                  ]}
                  onPress={() => setSelectedStatus(null)}
                >
                  <ThemedText
                    style={
                      selectedStatus === null
                        ? styles.statusTextSelected
                        : styles.statusOptionText
                    }
                  >
                    All
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.statusOption,
                    selectedStatus === "completed" &&
                      styles.statusOptionSelected,
                  ]}
                  onPress={() => setSelectedStatus("completed")}
                >
                  <ThemedText
                    style={
                      selectedStatus === "completed"
                        ? styles.statusTextSelected
                        : styles.statusOptionText
                    }
                  >
                    Completed
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.statusOption,
                    selectedStatus === "pending" && styles.statusOptionSelected,
                  ]}
                  onPress={() => setSelectedStatus("pending")}
                >
                  <ThemedText
                    style={
                      selectedStatus === "pending"
                        ? styles.statusTextSelected
                        : styles.statusOptionText
                    }
                  >
                    Pending
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.statusOption,
                    selectedStatus === "cancelled" &&
                      styles.statusOptionSelected,
                  ]}
                  onPress={() => setSelectedStatus("cancelled")}
                >
                  <ThemedText
                    style={
                      selectedStatus === "cancelled"
                        ? styles.statusTextSelected
                        : styles.statusOptionText
                    }
                  >
                    Cancelled
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </ThemedView>
        )}

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={filteredSales}
            renderItem={renderSaleItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.saleList}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>No sales found</ThemedText>
            }
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: "#5B65E9",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  clearFiltersText: {
    color: "#5B65E9",
    fontWeight: "600",
  },
  dateFilters: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dateFilter: {
    flex: 1,
    marginRight: 8,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: "600",
  },
  datePlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  datePlaceholderText: {
    opacity: 0.7,
  },
  statusFilters: {
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 8,
    marginBottom: 8,
  },
  statusOptionSelected: {
    backgroundColor: "#5B65E9",
  },
  statusOptionText: {
    fontSize: 14,
  },
  statusTextSelected: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  saleList: {
    paddingBottom: 16,
  },
  saleItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 12,
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  saleDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  saleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saleId: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    opacity: 0.7,
  },
  saleAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
    textTransform: "capitalize",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    opacity: 0.7,
  },
});
