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
 * Product Management Screen
 *
 * Displays a list of products with options to add, edit, and filter
 */
export default function ProductsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading] = useState(false);

  // Mock data for now - would be replaced with TRPC query
  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      price: 1999,
      category: { id: "1", name: "Category 1" },
      isActive: true,
    },
    {
      id: "2",
      name: "Product 2",
      price: 2599,
      category: { id: "2", name: "Category 2" },
      isActive: true,
    },
    {
      id: "3",
      name: "Product 3",
      price: 999,
      category: { id: "1", name: "Category 1" },
      isActive: true,
    },
    {
      id: "4",
      name: "Product 4",
      price: 4999,
      category: { id: "3", name: "Category 3" },
      isActive: false,
    },
    {
      id: "5",
      name: "Product 5",
      price: 1499,
      category: { id: "2", name: "Category 2" },
      isActive: true,
    },
  ];

  // Mock categories
  const mockCategories = [
    { id: "1", name: "Category 1" },
    { id: "2", name: "Category 2" },
    { id: "3", name: "Category 3" },
  ];

  // Filter products based on search query and selected category
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category.id === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const renderProductItem = ({ item }: { item: (typeof mockProducts)[0] }) => (
    <Pressable
      style={styles.productItem}
      onPress={() => router.push(`/product-detail?id=${item.id}`)}
    >
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={styles.categoryName}>
          {item.category.name}
        </ThemedText>
      </View>
      <View style={styles.productMeta}>
        <ThemedText style={styles.productPrice}>
          {formatCurrency(item.price / 100)}
        </ThemedText>
        {!item.isActive && (
          <ThemedText style={styles.inactiveLabel}>Inactive</ThemedText>
        )}
      </View>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Products",
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
            style={styles.addButton}
            onPress={() => router.push("/product-detail")}
          >
            <Icon name="house" size={24} color="#FFFFFF" />
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

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productList}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                No products found
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
  addButton: {
    backgroundColor: "#5B65E9",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
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
  productList: {
    paddingBottom: 16,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    opacity: 0.7,
  },
  productMeta: {
    alignItems: "flex-end",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  inactiveLabel: {
    fontSize: 12,
    color: "#FF6B6B",
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
