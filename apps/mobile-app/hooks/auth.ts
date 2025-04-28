import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as Browser from "expo-web-browser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trpc } from "./api";
import { getBaseUrl } from "./base-url";
import { deleteToken, setToken } from "./session-store";

export const useTest = () => {
  const { data, isLoading } = useQuery(trpc.test.getHello.queryOptions());

  if (isLoading) return null;

  return data;
}

export const signIn = async () => {
  const signInUrl = `${getBaseUrl()}/api/auth/signin`;
  const redirectTo = Linking.createURL("/login");
  const result = await Browser.openAuthSessionAsync(
    `${signInUrl}?expo-redirect=${encodeURIComponent(redirectTo)}`,
    redirectTo,
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) return false;

  if (result.type !== "success") return false;
  const url = Linking.parse(result.url);
  const sessionToken = String(url.queryParams?.session_token);
  if (!sessionToken) throw new Error("No session token found");

  await setToken(sessionToken);
  return true;
};

export const useUser = () => {
  const { data: session, isLoading } = useQuery(trpc.auth.getSession.queryOptions());

  if (isLoading) return null;
  return session?.user ?? null;
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async () => {
    console.log("Starting sign in process");

    // Check if we're already on the login page with a session token
    if (process.env.EXPO_OS === "web") {
      console.log("Web platform detected, checking for session token");
      const params = new URLSearchParams(window.location.search);
      const sessionToken = params.get("session_token");
      if (sessionToken) {
        console.log("Session token found, processing login");
        await setToken(sessionToken);
        console.log("Token stored, refreshing queries");
        await Promise.all([
          queryClient.invalidateQueries(trpc.pathFilter()),
          queryClient.refetchQueries(trpc.auth.getSession.queryOptions())
        ]);
        console.log("Queries refreshed, cleaning up URL and redirecting");
        window.history.replaceState({}, '', '/');
        // Small delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        router.replace("/");
        return;
      }
    }

    // Regular Expo auth flow
    console.log("Starting regular auth flow");
    const success = await signIn();
    console.log("Auth flow result:", success);
    if (!success) return;

    console.log("Auth successful, refreshing queries");
    await Promise.all([
      queryClient.invalidateQueries(trpc.pathFilter()),
      queryClient.refetchQueries(trpc.auth.getSession.queryOptions())
    ]);

    console.log("Queries refreshed, waiting for state update");
    // Small delay to ensure auth state is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("Redirecting to home");
    router.replace("/");
  };
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const signOut = useMutation(trpc.auth.signOut.mutationOptions());
  const router = useRouter();

  return async () => {
    const res = await signOut.mutateAsync();
    if (!res.success) return;
    await deleteToken();
    await queryClient.invalidateQueries(trpc.pathFilter());
    router.replace("/");
  };
};
