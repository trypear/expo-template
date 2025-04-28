import { Redirect } from "expo-router";
import { AuthSplash } from "@/components/AuthSplash";
import { useUser } from "@/hooks/auth";

export default function Login() {
  const user = useUser();

  if (user) {
    return <Redirect href="/" />;
  }

  return <AuthSplash />;
}
