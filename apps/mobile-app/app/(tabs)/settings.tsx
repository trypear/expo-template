import { Button, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { useSignIn, useSignOut, useUser } from "../../hooks/auth";

export default function SettingsScreen() {
  const user = useUser();
  const signIn = useSignIn();
  const signOut = useSignOut();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">Account</ThemedText>
        <ThemedView style={styles.userInfo}>
          <ThemedText type="subtitle">
            {user && "name" in user ? user.name : "Not logged in"}
          </ThemedText>
        </ThemedView>
        <Button
          onPress={() => (user ? signOut() : signIn())}
          title={user ? "Sign Out" : "Sign In With Discord"}
          color="#5B65E9"
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  userInfo: {
    paddingVertical: 8,
  },
});
