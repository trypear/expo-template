/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react";
import { Button, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/ui/Icons";
import { trpc } from "@/hooks/api";
import { useQuery } from "@tanstack/react-query";

import { useSignIn, useSignOut, useUser } from "../../hooks/auth";

export default function SettingsScreen() {
  const router = useRouter();
  const user = useUser();
  const signIn = useSignIn();
  const signOut = useSignOut();

  // Get all facts for admin
  const factsQuery = trpc.facts.getFacts.queryOptions();
  const {
    data: facts,
    isLoading: isLoadingFacts,
    refetch: refetchFacts,
  } = useQuery({
    ...factsQuery,
    enabled: !!user,
  });

  // Get fact queue for admin
  const factQueueQuery = trpc.facts.getFactQueue.queryOptions();
  const {
    data: factQueue,
    isLoading: isLoadingFactQueue,
    refetch: refetchFactQueue,
  } = useQuery({
    ...factQueueQuery,
    enabled: !!user,
  });

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
        {/* Account Section */}
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

        {/* Admin Section - Only visible when logged in */}
        {user && (
          <>
            <ThemedView style={[styles.section, { marginTop: 20 }]}>
              <ThemedText type="title">Admin Dashboard</ThemedText>
              <ThemedText style={styles.description}>
                Manage your facts and fact queue
              </ThemedText>

              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => router.push("/admin/facts")}
              >
                <Icon name="folder" size={24} color="#FFFFFF" />
                <ThemedText style={styles.adminButtonText}>
                  Manage Facts ({isLoadingFacts ? "..." : (facts?.length ?? 0)})
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminButton, { backgroundColor: "#6C5CE7" }]}
                onPress={() => router.push("/admin/queue")}
              >
                <Icon name="calendar" size={24} color="#FFFFFF" />
                <ThemedText style={styles.adminButtonText}>
                  Manage Fact Queue (
                  {isLoadingFactQueue ? "..." : (factQueue?.length ?? 0)})
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminButton, { backgroundColor: "#00B894" }]}
                onPress={() => router.push("/admin/add-fact")}
              >
                <Icon name="settings" size={24} color="#FFFFFF" />
                <ThemedText style={styles.adminButtonText}>
                  Add New Fact
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        )}
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
  description: {
    opacity: 0.7,
    marginBottom: 10,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7675",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  adminButtonText: {
    color: "#FFFFFF",
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});
