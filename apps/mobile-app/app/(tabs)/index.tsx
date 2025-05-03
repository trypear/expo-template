"use client";

import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

/**
 * Home Screen
 *
 * This is the main tab screen. It demonstrates how to navigate to other screens
 * without adding new tabs to the bottom navigation.
 */
export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Home Screen</ThemedText>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/sample-detail")}
      >
        <ThemedText style={styles.buttonText}>
          Open Sample Detail Screen
        </ThemedText>
      </Pressable>

      <ThemedText style={styles.hint}>
        This demonstrates navigation without adding tabs
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#5B65E9",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
    maxWidth: 300,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  hint: {
    opacity: 0.7,
    textAlign: "center",
    marginTop: 8,
  },
});
