import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSignIn } from "@/hooks/auth";
import { useColorScheme } from "@/hooks/useColorScheme";

export function AuthSplash() {
  // useSignIn with the true arg enables the auth bypass for dev
  const signIn = useSignIn(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text
          style={[styles.title, isDark ? styles.darkText : styles.lightText]}
        >
          Welcome
        </Text>
        <Text
          style={[
            styles.subtitle,
            isDark ? styles.darkSubtext : styles.lightSubtext,
          ]}
        >
          Sign in to access your account
        </Text>
        <Pressable onPress={() => void signIn()} style={styles.button}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  content: {
    width: "100%",
    maxWidth: 320,
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  lightText: {
    color: "#111827",
  },
  darkText: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  lightSubtext: {
    color: "#4B5563",
  },
  darkSubtext: {
    color: "#9CA3AF",
  },
  button: {
    width: "100%",
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
