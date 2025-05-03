import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
 * Product Detail Screen
 *
 * This screen displays detailed information about a specific product.
 * It follows the pattern in sample-detail for navigation.
 */
export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();

  // Fetch product data using tRPC
  const {
    data: productData,
    isLoading,
    error,
  } = trpc.product.getProductById.useQuery(
    { id: id as string },
    { enabled: !!id },
  );

  // Fetch categories for dropdown
  const { data: categoriesData } = trpc.product.getCategories.useQuery();
  const categories = categoriesData || [];

  // State for edit form
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    isActive: true,
  });

  // Update mutation
  const updateProductMutation = trpc.product.updateProduct.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh data
      void trpc.product.getProductById.invalidate({ id: id as string });
      void trpc.product.getProducts.invalidate();
    },
  });

  // Initialize form data when product data is loaded
  React.useEffect(() => {
    if (productData?.product) {
      setFormData({
        name: productData.product.name,
        price: productData.product.price.toString(),
        categoryId: productData.product.categoryId || "",
        isActive: productData.product.isActive,
      });
    }
  }, [productData]);

  const handleSave = () => {
    // Call the mutation to update the product
    updateProductMutation.mutate({
      id: id as string,
      data: {
        name: formData.name,
        price: parseInt(formData.price, 10),
        categoryId: formData.categoryId,
        isActive: formData.isActive,
      },
    });

    // Close the edit form
    setIsEditing(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Product Details",
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
              Loading product details...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Error loading product: {error.message}
            </ThemedText>
            <Pressable style={styles.button} onPress={() => router.back()}>
              <ThemedText style={styles.buttonText}>Go Back</ThemedText>
            </Pressable>
          </View>
        ) : productData?.product ? (
          <ThemedView style={styles.section}>
            <ThemedText type="title">{productData.product.name}</ThemedText>

            <View style={styles.priceContainer}>
              <ThemedText style={styles.price}>
                {formatCurrency(productData.product.price / 100)}
              </ThemedText>
              {productData.product.isActive ? (
                <View style={[styles.badge, styles.activeBadge]}>
                  <ThemedText style={styles.badgeText}>Active</ThemedText>
                </View>
              ) : (
                <View style={[styles.badge, styles.inactiveBadge]}>
                  <ThemedText style={styles.badgeText}>Inactive</ThemedText>
                </View>
              )}
            </View>

            <View style={styles.content}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Category:</ThemedText>
                <ThemedText>
                  {productData.category?.name || "Uncategorized"}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Created:</ThemedText>
                <ThemedText>
                  {productData.product.createdAt
                    ? new Date(
                        productData.product.createdAt,
                      ).toLocaleDateString()
                    : "N/A"}
                </ThemedText>
              </View>

              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={styles.description}>
                {productData.product.description || "No description available."}
              </ThemedText>
            </View>

            {!isEditing ? (
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, styles.editButton]}
                  onPress={() => setIsEditing(true)}
                >
                  <ThemedText style={styles.buttonText}>
                    Edit Product
                  </ThemedText>
                </Pressable>

                <Pressable style={styles.button} onPress={() => router.back()}>
                  <ThemedText style={styles.buttonText}>Go Back</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Edit Product
                </ThemedText>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.formLabel}>Name</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                    placeholder="Product name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.formLabel}>
                    Price (in cents)
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={formData.price}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price: text })
                    }
                    keyboardType="numeric"
                    placeholder="Price in cents"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.formLabel}>Category</ThemedText>
                  <View style={styles.pickerContainer}>
                    {categories.map((category) => (
                      <Pressable
                        key={category.id}
                        style={[
                          styles.categoryOption,
                          formData.categoryId === category.id &&
                            styles.categoryOptionSelected,
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, categoryId: category.id })
                        }
                      >
                        <ThemedText style={styles.categoryOptionText}>
                          {category.name}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.formLabel}>
                    Active Status
                  </ThemedText>
                  <View style={styles.switchContainer}>
                    <Switch
                      value={formData.isActive}
                      onValueChange={(value) =>
                        setFormData({ ...formData, isActive: value })
                      }
                      trackColor={{ false: "#767577", true: "#4CAF50" }}
                      thumbColor={formData.isActive ? "#f4f3f4" : "#f4f3f4"}
                    />
                    <ThemedText style={styles.switchLabel}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.formButtonContainer}>
                  <Pressable
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <ThemedText style={styles.buttonText}>
                      {updateProductMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      // Reset form data and close edit form
                      if (productData?.product) {
                        setFormData({
                          name: productData.product.name,
                          price: productData.product.price.toString(),
                          categoryId: productData.product.categoryId || "",
                          isActive: productData.product.isActive,
                        });
                      }
                      setIsEditing(false);
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
            <ThemedText style={styles.errorText}>Product not found</ThemedText>
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 12,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: "#4CAF50",
  },
  inactiveBadge: {
    backgroundColor: "#F44336",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
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
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
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
  editButton: {
    backgroundColor: "#FF9800",
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
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryOptionSelected: {
    backgroundColor: "rgba(91, 101, 233, 0.3)",
    borderColor: "#5B65E9",
  },
  categoryOptionText: {
    color: "#FFFFFF",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginLeft: 8,
  },
  formButtonContainer: {
    gap: 12,
    marginTop: 24,
  },
});
