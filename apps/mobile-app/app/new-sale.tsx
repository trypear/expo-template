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
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { formatCurrency } from "@/utils/formatCurrency";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

interface Customer {
  id: string;
  name: string;
}

/**
 * New Sale Screen
 *
 * Interface for recording a new sale
 */
export default function NewSaleScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "credit_card" | "debit_card" | "mobile_payment"
  >("cash");
  const [isLoading] = useState(false);

  // Mock products data
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
      isActive: true,
    },
    {
      id: "5",
      name: "Product 5",
      price: 1499,
      category: { id: "2", name: "Category 2" },
      isActive: true,
    },
  ];

  // Mock customers data
  const mockCustomers: Customer[] = [
    { id: "1", name: "Customer 1" },
    { id: "2", name: "Customer 2" },
    { id: "3", name: "Customer 3" },
  ];

  // Filter products based on search query
  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate cart totals
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const cartTotal = cartSubtotal - cartDiscount;

  // Add product to cart
  const addToCart = (product: (typeof mockProducts)[0]) => {
    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      // Update quantity if already in cart
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      // Add new item to cart
      setCart([
        ...cart,
        {
          id: Date.now().toString(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          discount: 0,
        },
      ]);
    }
  };

  // Update cart item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      setCart(cart.filter((item) => item.id !== id));
    } else {
      // Update quantity
      setCart(
        cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    }
  };

  // Select a customer
  const selectCustomer = () => {
    // In a real app, this would show a modal to select a customer
    // For now, just select the first customer in the mock data
    const customer = mockCustomers[0];
    if (customer) {
      setSelectedCustomer(customer);
    }
  };

  // Complete sale
  const completeSale = () => {
    // Would use TRPC mutation here
    console.log("Sale completed", {
      customerId: selectedCustomer?.id,
      paymentMethod,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtSale: item.price,
        discount: item.discount,
      })),
    });

    // Navigate back after successful sale
    router.back();
  };

  const renderProductItem = ({ item }: { item: (typeof mockProducts)[0] }) => (
    <Pressable style={styles.productItem} onPress={() => addToCart(item)}>
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={styles.categoryName}>
          {item.category.name}
        </ThemedText>
      </View>
      <ThemedText style={styles.productPrice}>
        {formatCurrency(item.price / 100)}
      </ThemedText>
    </Pressable>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <ThemedText style={styles.cartItemName}>{item.name}</ThemedText>
        <ThemedText style={styles.cartItemPrice}>
          {formatCurrency(item.price / 100)} each
        </ThemedText>
      </View>

      <View style={styles.cartItemControls}>
        <View style={styles.quantityControl}>
          <Pressable
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <ThemedText style={styles.quantityButtonText}>-</ThemedText>
          </Pressable>

          <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>

          <Pressable
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <ThemedText style={styles.quantityButtonText}>+</ThemedText>
          </Pressable>
        </View>

        <ThemedText style={styles.cartItemTotal}>
          {formatCurrency((item.price * item.quantity - item.discount) / 100)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "New Sale",
          headerShown: true,
        }}
      />

      <ThemedView style={styles.container}>
        <View style={styles.twoColumnLayout}>
          {/* Left column - Product selection */}
          <View style={styles.leftColumn}>
            <View style={styles.searchContainer}>
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
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].text + "80"
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
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
          </View>

          {/* Right column - Cart */}
          <View style={styles.rightColumn}>
            <View style={styles.cartHeader}>
              <ThemedText type="title">Cart</ThemedText>
              {cart.length > 0 && (
                <Pressable onPress={() => setCart([])}>
                  <ThemedText style={styles.clearCartText}>Clear</ThemedText>
                </Pressable>
              )}
            </View>

            {cart.length === 0 ? (
              <ThemedView style={styles.emptyCart}>
                <ThemedText style={styles.emptyCartText}>
                  Add products to the cart by tapping on them from the list
                </ThemedText>
              </ThemedView>
            ) : (
              <>
                <FlatList
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.cartList}
                />

                <View style={styles.customerSelection}>
                  <ThemedText style={styles.sectionTitle}>Customer</ThemedText>
                  <View style={styles.customerDropdown}>
                    <Pressable
                      style={styles.customerButton}
                      onPress={selectCustomer}
                    >
                      <ThemedText>
                        {selectedCustomer
                          ? selectedCustomer.name
                          : "Select Customer (Optional)"}
                      </ThemedText>
                      <Icon
                        name="house"
                        size={16}
                        color={Colors[colorScheme ?? "light"].text}
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.paymentMethodSelection}>
                  <ThemedText style={styles.sectionTitle}>
                    Payment Method
                  </ThemedText>
                  <View style={styles.paymentOptions}>
                    <Pressable
                      style={[
                        styles.paymentOption,
                        paymentMethod === "cash" &&
                          styles.paymentOptionSelected,
                      ]}
                      onPress={() => setPaymentMethod("cash")}
                    >
                      <ThemedText
                        style={
                          paymentMethod === "cash"
                            ? styles.paymentTextSelected
                            : styles.paymentText
                        }
                      >
                        Cash
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.paymentOption,
                        paymentMethod === "credit_card" &&
                          styles.paymentOptionSelected,
                      ]}
                      onPress={() => setPaymentMethod("credit_card")}
                    >
                      <ThemedText
                        style={
                          paymentMethod === "credit_card"
                            ? styles.paymentTextSelected
                            : styles.paymentText
                        }
                      >
                        Credit
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.paymentOption,
                        paymentMethod === "debit_card" &&
                          styles.paymentOptionSelected,
                      ]}
                      onPress={() => setPaymentMethod("debit_card")}
                    >
                      <ThemedText
                        style={
                          paymentMethod === "debit_card"
                            ? styles.paymentTextSelected
                            : styles.paymentText
                        }
                      >
                        Debit
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.paymentOption,
                        paymentMethod === "mobile_payment" &&
                          styles.paymentOptionSelected,
                      ]}
                      onPress={() => setPaymentMethod("mobile_payment")}
                    >
                      <ThemedText
                        style={
                          paymentMethod === "mobile_payment"
                            ? styles.paymentTextSelected
                            : styles.paymentText
                        }
                      >
                        Mobile
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.cartSummary}>
                  <View style={styles.summaryRow}>
                    <ThemedText>Subtotal</ThemedText>
                    <ThemedText>
                      {formatCurrency(cartSubtotal / 100)}
                    </ThemedText>
                  </View>
                  <View style={styles.summaryRow}>
                    <ThemedText>Discount</ThemedText>
                    <ThemedText>
                      -{formatCurrency(cartDiscount / 100)}
                    </ThemedText>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <ThemedText style={styles.totalText}>Total</ThemedText>
                    <ThemedText style={styles.totalAmount}>
                      {formatCurrency(cartTotal / 100)}
                    </ThemedText>
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.completeButton,
                    cart.length === 0 && styles.disabledButton,
                  ]}
                  onPress={completeSale}
                  disabled={cart.length === 0}
                >
                  <ThemedText style={styles.completeButtonText}>
                    Complete Sale
                  </ThemedText>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  twoColumnLayout: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    flex: 1,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.1)",
  },
  rightColumn: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  productList: {
    paddingBottom: 16,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 12,
    opacity: 0.7,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  clearCartText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
  },
  emptyCartText: {
    textAlign: "center",
    opacity: 0.7,
  },
  cartList: {
    flexGrow: 1,
  },
  cartItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 8,
  },
  cartItemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  cartItemPrice: {
    fontSize: 14,
    opacity: 0.7,
  },
  cartItemControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: "600",
  },
  customerSelection: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  customerDropdown: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  customerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  paymentMethodSelection: {
    marginBottom: 16,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    marginHorizontal: 4,
  },
  paymentOptionSelected: {
    backgroundColor: "#5B65E9",
  },
  paymentText: {
    fontSize: 14,
  },
  paymentTextSelected: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cartSummary: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
  totalText: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "#5B65E9",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
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
