# Mobile App Navigation Guidelines

## Navigation Structure

This app uses Expo Router with a specific navigation structure:

```
app/
├── _layout.tsx             # Root layout with authentication handling
├── (tabs)/                 # Tab navigation group
│   ├── _layout.tsx         # Tab layout configuration (DO NOT MODIFY)
│   ├── index.tsx           # Home tab screen
│   └── settings.tsx        # Settings tab screen
├── template-screen.tsx     # Template for creating new screens
├── sample-detail.tsx       # Example of a stack screen
└── +not-found.tsx          # 404 screen
```

## Navigation Rules

1. **DO NOT modify the tab structure** in `(tabs)/_layout.tsx` unless explicitly requested
2. **DO NOT add additional tabs** to the bottom navigation
3. New screens should be added as **stack screens**, not tab screens
4. Use the `useRouter()` hook from Expo Router to navigate between screens

## How to Add New Screens

1. Create a new file in the `app/` directory (e.g., `app/my-new-screen.tsx`)
2. Use the `template-screen.tsx` as a starting point
3. Navigate to the screen using `router.push("/my-new-screen")`

Example:

```tsx
// From any screen
import { useRouter } from "expo-router";

const router = useRouter();
router.push("/my-new-screen");
```

## UI/UX Guidelines

1. Create clean, minimal UI with proper spacing and alignment
2. Follow the existing styling patterns in the app
3. Use the provided themed components:
   - `ThemedView` instead of `View`
   - `ThemedText` instead of `Text`
4. Focus on creating single-purpose screens that do one thing well
5. Use the existing components in the components directory when possible
6. Group related elements in sections with proper spacing
7. Use consistent styling for buttons and interactive elements

## Example Screen Structure

```tsx
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function MyScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "My Screen",
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
```
