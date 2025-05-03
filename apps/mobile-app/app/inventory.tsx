import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatCurrency } from "@/utils/formatCurrency";

/**
 * Inventory Status Screen
 *
 * Displays current inventory levels with filtering and sorting options
 */
export default function InventoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "quantity" | "category">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Mock inventory data
  const mockInventory = [
    {
      id: "1",
      product: {
        id: "1",
        name: "Product 1",
        price: 1999,
        category: { id: "1", name: "Category 1" },
      },
      quantity: 25,
      locationCode: "main",
      lastRestockDate: new Date(2025, 4, 1),
    },
    {
      id: "2",
      product: {
        id: "2",
        name: "Product 2",
        price: 2599,
        category: { id: "2", name: "Category 2" },
      },
      quantity: 8,
      locationCode: "main",
      lastRestockDate: new Date(2025, 4, 2),
    },
    {
      id: "3",
      product: {
        id: "3",
        name: "Product 3",
        price: 999,
        category: { id: "1", name: "Category 1" },
      },
      quantity: 3,
      locationCode: "main",
      lastRestockDate: new Date(2025, 4, 1),
    },
    {
      id: "4",
      product: {
        id: "4",
        name: "Product 4",
        price: 4999,
        category: { id: "3", name: "Category 3" },
      },
      quantity: 12,
      locationCode: "main",
      lastRestockDate: new Date(2025, 4, 3),
    },
    {
      id: "5",
      product: {
        id: "5",
        name: "Product 5",
        price: 1499,
        category: { id: "2", name: "Category 2" },
      },
      quantity: 0,
      locationCode: "main",
      lastRestockDate: new Date(2025, 3, 15),
    },
  ];

  // Mock categories
  const mockCategories = [
    { id: "1", name: "Category 1" },
    { id: "2", name: "Category 2" },
    { id: "3", name: "Category 3" },
  ];

  // Filter and sort inventory
  const filteredInventory = mockInventory
    .filter((item) => {
      // Filter by search query
      const matchesSearch = item.product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Filter by category
      const matchesCategory = selectedCategory
        ? item.product.category.id === selectedCategory
        : true;

      // Filter by stock level
      const matchesStockLevel = showLowStockOnly ? item.quantity <= 10 : true;

      return matchesSearch && matchesCategory && matchesStockLevel;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.product.name.localeCompare(b.product.name)
          : b.product.name.localeCompare(a.product.name);
      } else if (sortBy === "quantity") {
        return sortOrder === "asc"
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      } else if (sortBy === "category") {
        return sortOrder === "asc"
          ? a.product.category.name.localeCompare(b.product.category.name)
          : b.product.category.name.localeCompare(a.product.category.name);
      }
      return 0;
    });

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

  // Toggle sort order
  const toggleSort = (field: "name" | "quantity" | "category") => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderInventoryItem = ({
    item,
  }: {
    item: (typeof mockInventory)[0];
  }) => (
    <Pressable
      style={styles.inventoryItem}
      onPress={() => router.push(`/inventory-detail?id=${item.id}`)}
    >
      <View style={styles.itemHeader}>
        <ThemedText style={styles.productName}>{item.product.name}</ThemedText>
        <View
          style={[
            styles.stockBadge,
            { backgroundColor: getStockLevelColor(item.quantity) },
          ]}
        >
          <ThemedText style={styles.stockText}>
            {getStockLevelText(item.quantity)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.itemDetails}>
        <View>
          <ThemedText style={styles.categoryName}>
            {item.product.category.name}
          </ThemedText>
          <ThemedText style={styles.priceText}>
            {formatCurrency(item.product.price / 100)}
          </ThemedText>
        </View>

        <View style={styles.quantityInfo}>
          <ThemedText style={styles.quantityText}>
            {item.quantity} units
          </ThemedText>
          <ThemedText style={styles.restockDate}>
            Last restock: {formatDate(item.lastRestockDate)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Inventory",
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
              placeholder="Search products..."
              placeholderTextColor={Colors[colorScheme ?? "light"].text + "80"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable
            style={[
              styles.filterButton,
              showLowStockOnly && styles.filterButtonActive,
            ]}
            onPress={() => setShowLowStockOnly(!showLowStockOnly)}
          >
            <Icon name="settings" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollView}
          >
            <Pressable
              style={[
                styles.categoryChip,
                selectedCategory === null && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <ThemedText
                style={
                  selectedCategory === null
                    ? styles.categoryTextSelected
                    : styles.categoryText
                }
              >
                All
              </ThemedText>
            </Pressable>
            {mockCategories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id &&
                    styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <ThemedText
                  style={
                    selectedCategory === category.id
                      ? styles.categoryTextSelected
                      : styles.categoryText
                  }
                >
                  {category.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sortContainer}>
          <ThemedText style={styles.sortLabel}>Sort by:</ThemedText>
          <View style={styles.sortButtons}>
            <Pressable
              style={[
                styles.sortButton,
                sortBy === "name" && styles.sortButtonActive,
              ]}
              onPress={() => toggleSort("name")}
            >
              <ThemedText
                style={
                  sortBy === "name" ? styles.sortTextActive : styles.sortText
                }
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.sortButton,
                sortBy === "quantity" && styles.sortButtonActive,
              ]}
              onPress={() => toggleSort("quantity")}
            >
              <ThemedText
                style={
                  sortBy === "quantity"
                    ? styles.sortTextActive
                    : styles.sortText
                }
              >
                Quantity{" "}
                {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.sortButton,
                sortBy === "category" && styles.sortButtonActive,
              ]}
              onPress={() => toggleSort("category")}
            >
              <ThemedText
                style={
                  sortBy === "category"
                    ? styles.sortTextActive
                    : styles.sortText
                }
              >
                Category{" "}
                {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={filteredInventory}
            renderItem={renderInventoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.inventoryList}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                No inventory items found
              </ThemedText>
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#5B65E9",
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScrollView: {
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryChipSelected: {
    backgroundColor: "#5B65E9",
  },
  categoryText: {
    fontSize: 14,
  },
  categoryTextSelected: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortLabel: {
    marginBottom: 8,
    fontWeight: "600",
  },
  sortButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  sortButtonActive: {
    backgroundColor: "#5B65E9",
  },
  sortText: {
    fontSize: 12,
  },
  sortTextActive: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  inventoryList: {
    paddingBottom: 16,
  },
  inventoryItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
  },
  stockBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryName: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
  },
  quantityInfo: {
    alignItems: "flex-end",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  restockDate: {
    fontSize: 12,
    opacity: 0.7,
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
