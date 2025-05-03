import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

/**
 * Nested Sample Screen
 *
 * This demonstrates how to create a nested screen that's accessed from another detail screen.
 * This shows how to create deeper navigation hierarchies without modifying the tab structure.
 *
 * Key points:
 * 1. Uses Stack.Screen for header with back button
 * 2. Can be navigated to from the parent detail screen
 * 3. Maintains the existing tab structure while allowing for deeper navigation
 * 4. Demonstrates multi-level navigation without tabs
 */
export default function SampleDetailScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nested Sample",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="title">Nested Sample Screen</ThemedText>

          <ThemedView style={styles.content}>
            <ThemedText>
              This is a nested sample screen that demonstrates how to create
              deeper navigation hierarchies. This screen is nested within the
              Sample Detail screen, showing how to navigate to multiple levels
              without adding new tabs.
            </ThemedText>

            <ThemedText>
              You can navigate back to the parent screen using the header back
              button. This pattern is useful for creating complex navigation
              flows while maintaining a simple tab structure.
            </ThemedText>
          </ThemedView>

          <Pressable style={styles.button} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Go Back</ThemedText>
          </Pressable>
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
  content: {
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  button: {
    backgroundColor: "#5B65E9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
