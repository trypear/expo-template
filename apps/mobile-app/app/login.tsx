import { Text } from "react-native";
import { Redirect } from "expo-router";
import { AuthSplash } from "@/components/AuthSplash";
import { useUser } from "@/hooks/auth";

export default function Login() {
  const user = useUser();

  // loading screen
  if (user === null) {
    return <Text>Loading...</Text>;
  }

  if (user === false) {
    return <AuthSplash />;
  }

  return <Redirect href="/" />;
}
