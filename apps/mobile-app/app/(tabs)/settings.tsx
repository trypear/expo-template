/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button, Image, StyleSheet } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { useSignIn, useSignOut, useUser } from "../../hooks/auth";

export default function SettingsScreen() {
  const user = useUser();
  const signIn = useSignIn();
  const signOut = useSignOut();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
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
    </ParallaxScrollView>
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
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
