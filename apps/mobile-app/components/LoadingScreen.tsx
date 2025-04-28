import { ActivityIndicator } from "react-native";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <ThemedView className="flex-1 items-center justify-center p-4">
      <ActivityIndicator size="large" className="mb-4" />
      <ThemedText className="text-center text-lg">{message}</ThemedText>
    </ThemedView>
  );
}
