"use client";

import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ThemedText>hello</ThemedText>
    </View>
  );
}
