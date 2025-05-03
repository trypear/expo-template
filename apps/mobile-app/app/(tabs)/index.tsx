"use client";

import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { useColorScheme } from "@/hooks/useColorScheme";

/**
 * Dashboard Screen
 *
 * Main dashboard showing sales summary and quick actions
 */
export default function DashboardScreen() {
  const router = useRouter();
  // We'll use colorScheme later for theming
  const _colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Sales Dashboard</ThemedText>
      </View>

      <View style={styles.quickActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/new-sale")}
        >
          <Icon name="house" size={24} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>New Sale</ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/products")}
        >
          <Icon name="folder" size={24} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>Products</ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/inventory")}
        >
          <Icon name="house" size={24} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>Inventory</ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/sales-history")}
        >
          <Icon name="settings" size={24} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>History</ThemedText>
        </Pressable>
      </View>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Sales Overview</ThemedText>
        <ThemedText style={styles.noDataText}>
          Sales data will be displayed here
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Top Selling Products</ThemedText>
        <ThemedText style={styles.noDataText}>
          Top products will be displayed here
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title">Low Stock Alert</ThemedText>
          <Pressable onPress={() => router.push("/inventory")}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </Pressable>
        </View>
        <ThemedText style={styles.noDataText}>
          Low stock items will be displayed here
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#5B65E9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "22%",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  viewAllText: {
    color: "#5B65E9",
    fontWeight: "600",
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 20,
    opacity: 0.7,
  },
});
