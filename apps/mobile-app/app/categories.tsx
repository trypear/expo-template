import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { categories } from "@/utils/mockData";

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Categories",
          headerShown: true,
        }}
      />

      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <ThemedText style={styles.sectionTitle}>All Categories</ThemedText>

          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={styles.categoryItem}
                onPress={() =>
                  router.push({
                    pathname: "/category-detail",
                    params: { id: category.id },
                  })
                }
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Icon name={category.icon as any} size={24} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.categoryName}>
                  {category.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Add Category Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/add-category")}
          >
            <Icon name="plus" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  categoryItem: {
    width: "33.33%",
    padding: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    textAlign: "center",
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5B65E9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
