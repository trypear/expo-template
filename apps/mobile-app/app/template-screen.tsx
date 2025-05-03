import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

/**
 * Template Screen
 *
 * This is a template for creating new screens in the app.
 * Follow this pattern when creating new screens:
 * 1. Use Stack.Screen for header configuration
 * 2. Use ScrollView for content that might overflow
 * 3. Use ThemedView and ThemedText components for consistent styling
 * 4. Keep the UI clean and minimal
 * 5. Group related elements in sections with proper spacing
 */
export default function TemplateScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Template Screen",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="title">Section Title</ThemedText>

          <ThemedView style={styles.content}>
            <ThemedText>Content goes here</ThemedText>
          </ThemedView>
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
    gap: 12,
  },
});
