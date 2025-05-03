import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

/**
 * Sample Detail Screen
 *
 * This demonstrates how to create a detail screen that's accessed from a tab
 * without modifying the tab structure. This screen is a stack screen, not a tab.
 *
 * Key points:
 * 1. Uses Stack.Screen for header with back button
 * 2. Can be navigated to from any tab using router.push()
 * 3. Maintains the existing tab structure
 */
export default function SampleDetailScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sample Detail",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="title">Detail Screen</ThemedText>

          <ThemedView style={styles.content}>
            <ThemedText>
              This is a detail screen that demonstrates how to navigate to a new
              screen without adding a new tab. You can navigate back using the
              header back button.
            </ThemedText>
          </ThemedView>

          <Pressable
            style={[styles.button, { marginBottom: 12 }]}
            onPress={() => router.push("/sample-detail/nested-sample")}
          >
            <ThemedText style={styles.buttonText}>
              Go to Nested Sample
            </ThemedText>
          </Pressable>

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
